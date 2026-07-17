/**
 * lib/agents/hermes.ts
 * 
 * HERMES — AI Direct Assistant powered by OpenClaw + Hermes JS Engine
 * 
 * Skills equipped:
 *  - Communication  : Empathetic, clear, culturally-aware messaging
 *  - Sales          : SPIN Selling, anchoring, objection handling
 *  - Negotiation    : BATNA strategy, concession framework, deal framing
 * 
 * Hermes handles WhatsApp conversations, qualifies leads, presents properties
 * and closes deals with a human-like tone calibrated for New Cairo luxury market.
 */

import { OpenClawClient } from "openclaw";

// ─── Skill Definitions ────────────────────────────────────────────────────────

const HERMES_SYSTEM_PROMPT = `
You are HERMES — a premium real-estate AI assistant for Sierra Estates, 
operating exclusively in New Cairo, Egypt (Uptown Cairo, New Settlement, 
Madinaty, Sherouk, New Capital).

## YOUR SKILLS

### 🗣️ COMMUNICATION SKILL
- Greet warmly, use the client's first name.
- Mirror the client's language preference (Arabic / English).
- Keep messages concise: one key idea per message for WhatsApp.
- Never pressure. Build rapport first.
- Use soft calls-to-action: "Would you like to see pictures?"

### 💼 SALES SKILL
- SPIN Selling: ask Situation → Problem → Implication → Need-Payoff.
  - Situation: "Are you looking for your primary residence or an investment?"
  - Problem: "What's the biggest challenge in your current home?"
  - Implication: "How does that affect your family daily?"
  - Need-Payoff: "If we found a villa near top schools, would that solve it?"
- Present properties using the FAB method: Feature → Advantage → Benefit.
- Lead with value, price last.
- Create urgency authentically: "Only 3 units remaining in this phase."

### 🤝 NEGOTIATION SKILL
- Always know the BATNA (Best Alternative to Negotiated Agreement).
- Use anchoring: present the premium option first.
- Concession framework: give something small, get something meaningful.
  - "If I can arrange a site visit this weekend, can you bring your partner?"
- Reframe price objections: "This is EGP 850/month over 10 years, not 8.5M."
- Never split the difference without a trade — always a conditional close.
- Silence is power. After making an offer, stop talking.

## PROPERTY KNOWLEDGE
You have access to Sierra Estates inventory in New Cairo. When a client asks 
about properties, query the knowledge base with their criteria and present 
the top 3 matches with a brief FAB pitch.

## RESPONSE RULES
1. WhatsApp messages must be under 200 characters unless client asks for details.
2. Always end with a question to keep the conversation moving.
3. Log every lead to CRM with: name, phone, budget, timeline, preferred area.
4. Escalate to a human agent when the client is ready to sign a contract.
5. Never fabricate prices or availability — query real data.

## TONE
Warm, confident, knowledgeable. Think: personal wealth advisor, not a pushy salesman.
`;

// ─── Types ────────────────────────────────────────────────────────────────────

export interface HermesMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface LeadProfile {
  name: string;
  phone: string;
  budget?: string;
  preferredArea?: string;
  timeline?: string;
  propertyType?: string;
  conversationId: string;
  createdAt: string;
  status: "new" | "qualified" | "negotiating" | "closed" | "lost";
}

// ─── Hermes Agent Class ───────────────────────────────────────────────────────

class HermesAgent {
  private client: any = null;
  private sessions: Map<string, HermesMessage[]> = new Map();

  async initialize() {
    try {
      this.client = new OpenClawClient({
        apiKey: process.env.EXPO_PUBLIC_OPENCLAW_KEY || "hermes-dev-key",
        projectId: "sierra-estates-ai",
        model: "hermes-pro",
      });
      console.log("[HERMES] ✅ Initialized with OpenClaw");
    } catch (e) {
      console.warn("[HERMES] ⚠️ OpenClaw init failed, using fallback logic:", e);
    }
  }

  /**
   * Main conversational interface.
   * Returns the agent's reply to be sent back via WhatsApp.
   */
  async chat(conversationId: string, userMessage: string): Promise<string> {
    // Build or restore session
    if (!this.sessions.has(conversationId)) {
      this.sessions.set(conversationId, [
        { role: "system", content: HERMES_SYSTEM_PROMPT },
      ]);
    }

    const history = this.sessions.get(conversationId)!;
    history.push({ role: "user", content: userMessage });

    let reply = "";

    if (this.client) {
      try {
        const response = await this.client.chat({
          messages: history,
          maxTokens: 200,
          temperature: 0.7,
        });
        reply = response.choices[0].message.content;
      } catch (e) {
        console.warn("[HERMES] Chat API failed, using rule-based fallback:", e);
        reply = this._ruleBasedFallback(userMessage);
      }
    } else {
      reply = this._ruleBasedFallback(userMessage);
    }

    history.push({ role: "assistant", content: reply });
    return reply;
  }

  /**
   * Rule-based fallback when OpenClaw is not available.
   * Covers the most common sales conversation stages.
   */
  private _ruleBasedFallback(message: string): string {
    const lower = message.toLowerCase();

    if (lower.includes("price") || lower.includes("سعر") || lower.includes("cost")) {
      return "Our properties start from 3.5M EGP. Can I ask — are you looking for a primary home or an investment? That helps me find the best match for you 🏡";
    }
    if (lower.includes("villa") || lower.includes("فيلا")) {
      return "We have stunning villas in Uptown Cairo & Madinaty. Would you prefer a standalone villa or twin house? And what's your approximate budget? 💎";
    }
    if (lower.includes("apartment") || lower.includes("شقة")) {
      return "We have premium apartments in New Capital & New Settlement. Are you looking for 3 or 4 bedrooms? I can send you options right now 📐";
    }
    if (lower.includes("hello") || lower.includes("hi") || lower.includes("مرحبا") || lower.includes("السلام")) {
      return "Welcome to Sierra Estates! 🌟 I'm Hermes, your personal property advisor. Are you looking to buy or invest in New Cairo?";
    }
    if (lower.includes("visit") || lower.includes("زيارة") || lower.includes("tour")) {
      return "I'd love to arrange a private tour for you! What day works best — this Thursday or Saturday? 📅";
    }
    if (lower.includes("payment") || lower.includes("installment") || lower.includes("تقسيط")) {
      return "We offer flexible installment plans up to 10 years with 0% interest on select units. Shall I send you a payment breakdown? 💳";
    }

    return "Thank you for reaching out to Sierra Estates! To find your perfect property in New Cairo, could you tell me — are you looking for a villa, apartment, or townhouse? 🏙️";
  }

  /**
   * Extract lead profile from conversation history.
   * Called after each turn to update the CRM.
   */
  extractLeadData(conversationId: string, phone: string): Partial<LeadProfile> {
    const history = this.sessions.get(conversationId) || [];
    const fullText = history.map((m) => m.content).join(" ").toLowerCase();

    const lead: Partial<LeadProfile> = {
      phone,
      conversationId,
      createdAt: new Date().toISOString(),
      status: "new",
    };

    // Budget detection
    const budgetMatch = fullText.match(/(\d+(?:\.\d+)?)\s*m(?:illion)?|(\d+(?:,\d+)*)\s*egp/i);
    if (budgetMatch) lead.budget = budgetMatch[0];

    // Property type
    if (fullText.includes("villa") || fullText.includes("فيلا")) lead.propertyType = "villa";
    else if (fullText.includes("apartment") || fullText.includes("شقة")) lead.propertyType = "apartment";
    else if (fullText.includes("townhouse")) lead.propertyType = "townhouse";

    // Area
    const areas = ["uptown", "madinaty", "sherouk", "settlement", "new capital", "التجمع", "مدينتي"];
    for (const area of areas) {
      if (fullText.includes(area)) {
        lead.preferredArea = area;
        break;
      }
    }

    return lead;
  }

  /** Clear a session from memory (e.g., after deal closed) */
  clearSession(conversationId: string) {
    this.sessions.delete(conversationId);
  }
}

// ─── Singleton Export ─────────────────────────────────────────────────────────

export const hermesAgent = new HermesAgent();
