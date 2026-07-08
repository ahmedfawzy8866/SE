/**
 * WhatsApp Bot Server - Sierra Estates
 * 
 * Connects the whatsapp-web.js client to the WhatsApp Bot Router.
 * Activates Liela as the primary interface, with Sierra/OpenClaw/Hermes behind the scenes.
 * 
 * Usage:
 *   node index.js
 * 
 * Environment Variables:
 *   SE_API_URL         - Backend base URL (default: http://localhost:3000)
 *   SBR_SECRET_KEY     - Service auth key  
 *   GOOGLE_AI_API_KEY  - Google AI / Gemini API key for agent intelligence
 *   HEARTBEAT_INTERVAL - Heartbeat period in ms (default: 60000)
 */

require('dotenv').config()

const { Client, LocalAuth } = require('whatsapp-web.js')
const qrcode = require('qrcode-terminal')
const axios = require('axios')
const path = require('path')

// Lazy-require the router (TypeScript compiled output)
let botRouter = null
function getRouter() {
  if (!botRouter) {
    try {
      // Load compiled router
      botRouter = require('./dist/router').router
    } catch {
      // Fallback: pass-through to backend API
      botRouter = null
    }
  }
  return botRouter
}

const API_BASE = (process.env.SE_API_URL || 'http://localhost:3000').replace(/\/+$/, '')
const INGEST_URL = `${API_BASE}/api/webhooks/whatsapp`
const HEARTBEAT_URL = `${API_BASE}/api/whatsapp/heartbeat`
const SECRET = process.env.SBR_SECRET_KEY || ''
const HEARTBEAT_INTERVAL = Number(process.env.HEARTBEAT_INTERVAL || 60_000)
const DIRECT_AI = !!process.env.GOOGLE_AI_API_KEY

const authHeaders = SECRET ? { 'x-sbr-secret-key': SECRET } : {}

// ── WhatsApp Client ──────────────────────────────────────────────────────────

const client = new Client({
  authStrategy: new LocalAuth({ clientId: 'sierra-estates-liela' }),
  puppeteer: {
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  },
})

client.on('qr', (qr) => {
  console.log('\n' + '─'.repeat(50))
  console.log('  Sierra Estates - LIELA is Starting Up')
  console.log('  Scan QR code with WhatsApp to authenticate:')
  console.log('─'.repeat(50))
  qrcode.generate(qr, { small: true })
})

client.on('ready', () => {
  console.log('─'.repeat(50))
  console.log('  LIELA is Online - Sierra Estates WhatsApp Bot')
  console.log('  Sierra, Hermes, and OpenClaw are standing by.')
  console.log(`  Mode: ${DIRECT_AI ? 'DIRECT AI (Gemini)' : 'API Relay Mode'}`)
  console.log('─'.repeat(50))
  startHeartbeat()
})

client.on('disconnected', (reason) => {
  console.warn('[Liela] Disconnected from WhatsApp:', reason)
  console.log('[Liela] Attempting to reconnect...')
  setTimeout(() => client.initialize(), 5000)
})

// ── Message Handler ──────────────────────────────────────────────────────────

client.on('message', async (msg) => {
  // Ignore status broadcasts
  if (msg.from === 'status@broadcast') return

  const chat = await msg.getChat()
  const groupName = chat.isGroup ? chat.name : 'Direct Message'
  const phone = msg.from

  console.log(`[Liela] Message from ${phone} (${groupName}): ${msg.body.substring(0, 80)}...`)

  // Handle !status command (internal health check)
  if (msg.body === '!status') {
    await msg.reply('Sierra Estates Agent Network: Online. Liela, Sierra, Hermes, and OpenClaw are active.')
    return
  }

  // ── Direct AI Mode (with GOOGLE_AI_API_KEY) ──────────────────────────────
  if (DIRECT_AI) {
    try {
      const router = getRouter()
      if (router) {
        const response = await router.handle({
          from: msg.from,
          body: msg.body,
          groupName,
          timestamp: msg.timestamp,
          messageId: msg.id._serialized,
        })
        if (response) {
          await msg.reply(response)
          console.log(`[Liela] AI response sent to ${phone}`)
        }
        return
      }
    } catch (err) {
      console.error('[Liela] AI routing failed, falling back to API relay:', err.message)
    }
  }

  // ── API Relay Mode (fallback) ─────────────────────────────────────────────
  try {
    const apiResponse = await axios.post(
      INGEST_URL,
      {
        from: phone,
        Body: msg.body,
        groupName,
        timestamp: msg.timestamp,
        messageId: msg.id?._serialized,
      },
      { headers: authHeaders, timeout: 15_000 }
    )

    // If the API returned a reply, send it
    if (apiResponse.data?.reply) {
      await msg.reply(apiResponse.data.reply)
    }
  } catch (err) {
    console.error('[Liela] Failed to forward message to API:', err.message)
  }
})

// ── Heartbeat ────────────────────────────────────────────────────────────────

function startHeartbeat() {
  setInterval(async () => {
    try {
      await axios.post(
        HEARTBEAT_URL,
        {
          status: 'alive',
          agent: 'liela',
          timestamp: new Date().toISOString(),
          mode: DIRECT_AI ? 'direct-ai' : 'api-relay',
        },
        { headers: authHeaders, timeout: 5000 }
      )
    } catch {
      // Heartbeat failures are non-critical
    }
  }, HEARTBEAT_INTERVAL)
}

// ── Boot ─────────────────────────────────────────────────────────────────────
console.log('[Liela] Booting Sierra Estates WhatsApp Bot...')
client.initialize()
