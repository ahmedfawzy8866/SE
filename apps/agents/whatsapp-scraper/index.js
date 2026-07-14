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
const https                 = require('https');
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

// ── Gemini chat helper ───────────────────────────────────────────────────────
const GEMINI_API_KEY = process.env.GOOGLE_AI_API_KEY || process.env.GEMINI_API_KEY || '';
const SYSTEM_PROMPT  = `You are OpenClaw, the AI intelligence agent for Sierra Estates — a premium real estate firm in Cairo (New Cairo, Madinaty, El Shorouk). 
You help the team with: property analysis, investor matching, price intelligence, WhatsApp listing extraction, and deal strategy.
You are sharp, elegant, and direct. You speak like a senior real estate advisor.
When asked about listings or prices, apply Sierra Estates business rules:
- Price < 10,000 → USD ($). Price ≥ 10,000 → EGP.
- Tag properties ≤ 70% of compound mean as "High Value 🏅".
- SBR code pattern: [CompoundCode]-[Rooms][FurnishingCode]-[PriceCode]`;

async function callGemini(history) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
      contents: history,
      generationConfig: { temperature: 0.7, maxOutputTokens: 1024 },
    });

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${GEMINI_API_KEY}`;
    console.log(`[Gemini Request] Sending history length: ${history.length}`);
    const req = https.request(url, { method: 'POST', headers: { 'Content-Type': 'application/json' } }, (res) => {
      let data = '';
      res.on('data', d => data += d);
      res.on('end', () => {
        try {
          console.log(`[Gemini Response] status: ${res.statusCode}`);
          console.log(`[Gemini Response] data:`, data);
          const json = JSON.parse(data);
          if (json.error) {
            return reject(new Error(`Gemini API Error: ${json.error.message} (${json.error.status})`));
          }
          const text = json?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (!text) {
            return resolve('No response candidate found.');
          }
          resolve(text);
        } catch(e) { reject(e); }
      });
    });
    req.on('error', (err) => {
      console.error('[Gemini Request Error]:', err);
      reject(err);
    });
    req.write(body);
    req.end();
  });
}

// ── Chat API endpoint ─────────────────────────────────────────────────────────
app.use(express.json());

app.post('/chat/api', async (req, res) => {
  try {
    const { history } = req.body; // [{role, parts:[{text}]}]
    if (!GEMINI_API_KEY) return res.status(500).json({ error: 'No Gemini API key set.' });
    const reply = await callGemini(history);
    res.json({ reply });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── Chat UI ───────────────────────────────────────────────────────────────────
app.get('/chat', (req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>OpenClaw — Sierra Estates AI</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Playfair+Display:wght@600&display=swap" rel="stylesheet"/>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:'Inter',sans-serif;background:#0A1628;color:#F4F0E8;height:100vh;display:flex;flex-direction:column}
    header{padding:16px 24px;border-bottom:1px solid rgba(201,162,77,.2);display:flex;align-items:center;gap:12px;backdrop-filter:blur(12px);background:rgba(10,22,40,.8)}
    header h1{font-family:'Playfair Display',serif;font-size:1.2rem;color:#C9A24D}
    header span{font-size:.75rem;color:#888;margin-left:auto}
    #status-dot{width:8px;height:8px;border-radius:50%;background:#22c55e;flex-shrink:0;box-shadow:0 0 6px #22c55e}
    #chat{flex:1;overflow-y:auto;padding:24px;display:flex;flex-direction:column;gap:16px}
    .msg{max-width:72%;padding:12px 16px;border-radius:16px;line-height:1.6;font-size:.9rem;white-space:pre-wrap;word-break:break-word}
    .user{align-self:flex-end;background:linear-gradient(135deg,#1e3a5f,#2a4a7f);border:1px solid rgba(201,162,77,.3)}
    .bot{align-self:flex-start;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);backdrop-filter:blur(8px)}
    .bot-name{font-size:.7rem;color:#C9A24D;margin-bottom:4px;font-weight:600;letter-spacing:.5px}
    .typing{align-self:flex-start;color:#666;font-size:.85rem;font-style:italic;padding:8px 0}
    footer{padding:16px 24px;border-top:1px solid rgba(255,255,255,.08);display:flex;gap:12px;background:rgba(10,22,40,.9)}
    #input{flex:1;background:rgba(255,255,255,.06);border:1px solid rgba(201,162,77,.25);border-radius:12px;padding:12px 16px;color:#F4F0E8;font-family:'Inter',sans-serif;font-size:.9rem;outline:none;resize:none;height:48px;transition:border-color .2s}
    #input:focus{border-color:#C9A24D}
    #send{background:linear-gradient(135deg,#C9A24D,#a07c35);border:none;border-radius:12px;width:48px;height:48px;cursor:pointer;font-size:1.2rem;color:#0A1628;font-weight:700;flex-shrink:0;transition:opacity .2s}
    #send:disabled{opacity:.4;cursor:default}
    ::-webkit-scrollbar{width:4px} ::-webkit-scrollbar-track{background:transparent} ::-webkit-scrollbar-thumb{background:#C9A24D44;border-radius:4px}
  </style>
</head>
<body>
<header>
  <div id="status-dot"></div>
  <h1>OpenClaw</h1>
  <span>Sierra Estates AI · Real Estate Intelligence</span>
</header>
<div id="chat">
  <div class="msg bot"><div class="bot-name">OPENCLAW</div>مرحباً! I'm OpenClaw, your Sierra Estates intelligence agent. Ask me about listings, pricing, investor matches, or any property in Cairo's prime compounds.</div>
</div>
<footer>
  <textarea id="input" placeholder="Ask about a property, compound, price analysis…" rows="1"></textarea>
  <button id="send">➤</button>
</footer>
<script>
  const chat = document.getElementById('chat');
  const input = document.getElementById('input');
  const send = document.getElementById('send');
  const history = [];

  function addMsg(role, text) {
    const div = document.createElement('div');
    div.className = 'msg ' + (role === 'user' ? 'user' : 'bot');
    if (role === 'model') div.innerHTML = '<div class="bot-name">OPENCLAW</div>' + escHtml(text);
    else div.textContent = text;
    chat.appendChild(div);
    chat.scrollTop = chat.scrollHeight;
    return div;
  }

  function escHtml(t){ return t.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;') }

  async function submit() {
    const text = input.value.trim();
    if (!text) return;
    input.value = '';
    send.disabled = true;
    addMsg('user', text);
    history.push({ role:'user', parts:[{ text }] });

    const typing = document.createElement('div');
    typing.className = 'typing';
    typing.textContent = 'OpenClaw is thinking…';
    chat.appendChild(typing);
    chat.scrollTop = chat.scrollHeight;

    try {
      const res = await fetch('/chat/api', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ history }) });
      const data = await res.json();
      typing.remove();
      const reply = data.reply || data.error || 'Error.';
      history.push({ role:'model', parts:[{ text: reply }] });
      addMsg('model', reply);
    } catch(e) {
      typing.remove();
      addMsg('model', '❌ Connection error: ' + e.message);
    }
    send.disabled = false;
    input.focus();
  }

  send.addEventListener('click', submit);
  input.addEventListener('keydown', e => { if (e.key==='Enter' && !e.shiftKey){ e.preventDefault(); submit(); } });
</script>
</body>
</html>`);
});

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
