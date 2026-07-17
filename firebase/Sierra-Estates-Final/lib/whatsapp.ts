/**
 * lib/whatsapp.ts — WhatsApp Integration (Backend-Routed)
 *
 * The mobile app no longer calls Meta's API directly.
 * All WhatsApp traffic goes through the backend:
 *   POST /api/webhook/whatsapp  — incoming messages (webhook)
 *   POST /api/hermes/chat       — chat responses
 *   POST /api/twilio/whatsapp   — outbound messages (Twilio fallback)
 *
 * This keeps WA_TOKEN and WA_PHONE_ID server-side only (secure).
 */

import { chatWithHermes, submitLead } from "./crm";

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || "";

// ─── Send a WhatsApp notification via backend (Twilio) ────────────────────────
export const sendWhatsAppMessage = async (
  to: string,
  body: string
): Promise<boolean> => {
  if (!BACKEND_URL) {
    console.log(`[WhatsApp STUB] → ${to}: ${body}`);
    return true;
  }
  try {
    const res = await fetch(`${BACKEND_URL}/api/twilio/whatsapp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to, body }),
    });
    return res.ok;
  } catch (e) {
    console.error("[WhatsApp] sendMessage via backend failed:", e);
    return false;
  }
};

// ─── Send a lead notification to an agent via WhatsApp ────────────────────────
export const sendLeadNotification = async (
  agentPhone: string,
  lead: {
    phone?: string;
    propertyType?: string;
    preferredArea?: string;
    budget?: string;
  }
): Promise<boolean> => {
  const message =
    `🔔 New Sierra Estates Lead!\n` +
    `📞 ${lead.phone || "Unknown"}\n` +
    `🏡 Looking for: ${lead.propertyType || "N/A"}\n` +
    `📍 Area: ${lead.preferredArea || "N/A"}\n` +
    `💰 Budget: ${lead.budget || "Not specified"}\n` +
    `⏰ ${new Date().toLocaleString("en-EG")}`;

  return await sendWhatsAppMessage(agentPhone, message);
};

// ─── In-app chat via Hermes (uses backend /api/hermes/chat) ──────────────────
export const sendChatMessage = async (
  conversationId: string,
  userMessage: string,
  phone?: string
): Promise<string> => {
  return await chatWithHermes(conversationId, userMessage, phone);
};

// ─── Submit a contact/inquiry lead via backend ────────────────────────────────
export const handleWhatsAppWebhook = async (
  phone: string,
  message: string
): Promise<string> => {
  // This is called client-side when building an in-app WhatsApp-like chat
  // The real webhook is server-side at POST /api/webhook/whatsapp
  return await chatWithHermes(`wa_${phone}`, message, phone);
};
