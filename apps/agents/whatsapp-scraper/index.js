/**
 * Sierra Estates — WhatsApp Intelligence Bot (OpenClaw)
 *
 * Features:
 *  - Stealth Puppeteer (anti-ban)
 *  - QR code served at http://localhost:3001 for easy scanning
 *  - Random human-like delays between forwards
 *  - LocalAuth session persistence (no re-scan after first login)
 *  - Heartbeat to backend every 60s
 *
 * Usage:   node index.js
 * Env vars (optional, put in .env):
 *   SE_API_URL          Backend base URL (default: http://localhost:3000)
 *   SBR_SECRET_KEY      Service auth header value
 *   QR_PORT             Port for QR web page (default: 3001)
 *   HEARTBEAT_INTERVAL  Heartbeat period ms (default: 60000)
 *   CHROME_PATH         Override Chrome executable path
 */

require('dotenv').config();

const { Client, LocalAuth } = require('whatsapp-web.js');
const puppeteer             = require('puppeteer-extra');
const StealthPlugin         = require('puppeteer-extra-plugin-stealth');
const QRCode                = require('qrcode');
const express               = require('express');
const axios                 = require('axios');

// ── Stealth mode ─────────────────────────────────────────────────────────────
puppeteer.use(StealthPlugin());

// ── Config ───────────────────────────────────────────────────────────────────
const API_BASE          = (process.env.SE_API_URL || 'http://localhost:3000').replace(/\/+$/, '');
const INGEST_URL        = `${API_BASE}/api/webhooks/whatsapp`;
const HEARTBEAT_URL     = `${API_BASE}/api/whatsapp/heartbeat`;
const SECRET            = process.env.SBR_SECRET_KEY || '';
const QR_PORT           = Number(process.env.QR_PORT || 3001);
const HEARTBEAT_INTERVAL = Number(process.env.HEARTBEAT_INTERVAL || 60000);
const CHROME_PATH       = process.env.CHROME_PATH ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const authHeaders = SECRET ? { 'x-sbr-secret-key': SECRET } : {};

// ── QR web server ─────────────────────────────────────────────────────────────
let currentQrDataUrl = null;
const app = express();

app.get('/', (req, res) => {
  if (!currentQrDataUrl) {
    return res.send(`
      <html>
        <head>
          <title>Sierra Estates — WhatsApp QR</title>
          <meta http-equiv="refresh" content="3">
          <style>body{font-family:sans-serif;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;background:#0A1628;color:#F4F0E8;}</style>
        </head>
        <body>
          <h2>⏳ Waiting for QR Code…</h2>
          <p>Page refreshes automatically every 3 seconds.</p>
        </body>
      </html>`);
  }

  res.send(`
    <html>
      <head>
        <title>Sierra Estates — Scan QR</title>
        <meta http-equiv="refresh" content="20">
        <style>
          body{font-family:sans-serif;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;background:#0A1628;color:#F4F0E8;gap:16px;}
          img{border:6px solid #C9A24D;border-radius:12px;width:280px;height:280px;}
          p{color:#C9A24D;font-size:14px;}
        </style>
      </head>
      <body>
        <h2>📱 Scan with WhatsApp</h2>
        <img src="${currentQrDataUrl}" alt="QR Code"/>
        <p>Open WhatsApp → Linked Devices → Link a Device</p>
        <p style="color:#888;font-size:12px">QR refreshes automatically every 20 seconds</p>
      </body>
    </html>`);
});

const server = app.listen(QR_PORT, () => {
  console.log(`\n🌐 QR Code page: http://localhost:${QR_PORT}\n`);
});

// ── WhatsApp client ───────────────────────────────────────────────────────────
const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    executablePath: CHROME_PATH,
    // Stealth args — mimics a real user browser
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--disable-gpu',
      '--window-size=1280,800',
      '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    ],
  },
});

// ── Events ────────────────────────────────────────────────────────────────────
client.on('qr', async (qr) => {
  console.log('📲 New QR generated — open http://localhost:' + QR_PORT);
  try {
    currentQrDataUrl = await QRCode.toDataURL(qr, { width: 280, margin: 2 });
  } catch (e) {
    console.error('QR render error:', e.message);
  }
});

client.on('authenticated', () => {
  currentQrDataUrl = null; // clear QR page
  console.log('🔐 Authenticated — session saved locally.');
});

client.on('ready', () => {
  console.log('✅ Sierra Estates WhatsApp Intelligence Bot: Online & Syncing.');
  startHeartbeat();
});

client.on('auth_failure', (msg) => {
  console.error('❌ Auth failure:', msg);
});

client.on('disconnected', (reason) => {
  console.warn('⚠️  Disconnected:', reason);
});

// ── Human-like random delay ───────────────────────────────────────────────────
const randomDelay = (min = 800, max = 3000) =>
  new Promise(r => setTimeout(r, Math.floor(Math.random() * (max - min + 1)) + min));

// ── Message handler ───────────────────────────────────────────────────────────
client.on('message', async (msg) => {
  const chat      = await msg.getChat();
  const groupName = chat.isGroup ? chat.name : 'Direct Message';

  // Human-like delay before forwarding (avoid bot fingerprint)
  await randomDelay(500, 2500);

  try {
    await axios.post(
      INGEST_URL,
      {
        from:      msg.from,
        Body:      msg.body,
        groupName,
        timestamp: msg.timestamp,
      },
      { headers: authHeaders, timeout: 10000 }
    );
  } catch (error) {
    console.error('❌ Forward failed:', error.message);
  }

  if (msg.body === '!status') {
    await randomDelay(1000, 2000);
    msg.reply('🤖 Sierra Estates Intelligence Bot: Online & Syncing.');
  }
});

// ── Heartbeat ─────────────────────────────────────────────────────────────────
function startHeartbeat() {
  setInterval(async () => {
    try {
      await axios.post(
        HEARTBEAT_URL,
        { status: 'alive', timestamp: new Date().toISOString() },
        { headers: authHeaders, timeout: 5000 }
      );
    } catch {
      // Non-critical — swallow silently
    }
  }, HEARTBEAT_INTERVAL);
}

// ── Graceful shutdown ─────────────────────────────────────────────────────────
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down gracefully…');
  await client.destroy();
  server.close();
  process.exit(0);
});

client.initialize();
