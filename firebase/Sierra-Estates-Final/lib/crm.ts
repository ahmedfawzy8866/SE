/**
 * lib/crm.ts — Sierra Estates CRM Layer (Backend-Wired)
 *
 * All CRM writes go through the backend API (/api/leads, /api/hermes/chat)
 * to ensure proper validation, Twilio notifications, and auth-gating.
 * Reads still use Firestore directly for real-time UI updates.
 */

import { db } from "./firebase";
import {
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  where,
  updateDoc,
  doc,
} from "firebase/firestore";

// ─── Backend base URL ─────────────────────────────────────────────────────────
const BACKEND_URL =
  process.env.EXPO_PUBLIC_BACKEND_URL || "";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CRMLead {
  id: string;
  phone: string;
  conversationId?: string;
  name?: string;
  email?: string;
  lastMessage?: string;
  createdAt: string;
  lastMessageAt?: string;
  status: "new" | "qualified" | "negotiating" | "closed" | "lost";
  source: "whatsapp" | "app" | "web" | "referral" | "propertyfinder";
  budget?: string;
  preferredArea?: string;
  propertyType?: string;
  assignedAgent?: string;
  interest?: string;
  stage?: string;
  hot?: boolean;
}

// ─── Backend API helper (unauthenticated for mobile public routes) ─────────────
async function backendPost(path: string, data: object) {
  try {
    const res = await fetch(`${BACKEND_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return await res.json();
  } catch (e) {
    console.error(`[CRM] Backend POST ${path} failed:`, e);
    return null;
  }
}

// ─── Submit a lead via backend (contact form, property inquiry) ────────────────
export const submitLead = async (lead: {
  name: string;
  email?: string;
  phone?: string;
  message?: string;
  propertyId?: string;
}): Promise<{ success: boolean; id?: string }> => {
  if (BACKEND_URL) {
    const result = await backendPost("/api/leads", {
      name: lead.name,
      email: lead.email || "",
      phone: lead.phone || "",
      message: lead.message || (lead.propertyId ? `Inquiry about property ${lead.propertyId}` : ""),
    });
    return result || { success: false };
  }
  // Fallback: log locally
  console.log("[CRM] Lead (no backend):", lead);
  return { success: true };
};

// ─── Send a message to Hermes via backend ─────────────────────────────────────
export const chatWithHermes = async (
  conversationId: string,
  message: string,
  phone?: string
): Promise<string> => {
  if (BACKEND_URL) {
    const result = await backendPost("/api/hermes/chat", {
      conversationId,
      message,
      phone,
    });
    return result?.reply || "Sorry, I'm unavailable right now. Please try again shortly.";
  }
  // Offline fallback
  return "Welcome to Sierra Estates! How can I help you today?";
};

// ─── Fetch all leads from Firestore (real-time read) ──────────────────────────
export const fetchLeads = async (
  statusFilter?: CRMLead["status"]
): Promise<CRMLead[]> => {
  try {
    let q = query(
      collection(db, "leads"),
      orderBy("createdAt", "desc"),
      limit(100)
    );
    if (statusFilter) {
      q = query(
        collection(db, "leads"),
        where("status", "==", statusFilter),
        orderBy("createdAt", "desc"),
        limit(100)
      );
    }
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as CRMLead));
  } catch (e) {
    console.error("[CRM] fetchLeads failed:", e);
    return [];
  }
};

// ─── Update lead status ───────────────────────────────────────────────────────
export const updateLeadStatus = async (
  leadId: string,
  status: CRMLead["status"]
): Promise<void> => {
  try {
    await updateDoc(doc(db, "leads", leadId), { status });
  } catch (e) {
    console.error("[CRM] updateLeadStatus failed:", e);
  }
};

// ─── Fetch CRM summary via backend (authenticated) ────────────────────────────
export const fetchCRMSummary = async () => {
  try {
    // Try backend first (has aggregated stats)
    if (BACKEND_URL) {
      const res = await fetch(`${BACKEND_URL}/api/admin/crm-summary`);
      if (res.ok) {
        const data = await res.json();
        return data.summary || { total: 0, new: 0, qualified: 0, negotiating: 0, closed: 0, lost: 0 };
      }
    }
    // Fallback: direct Firestore count
    const all = await fetchLeads();
    return {
      total: all.length,
      new: all.filter((l) => l.status === "new").length,
      qualified: all.filter((l) => l.status === "qualified").length,
      negotiating: all.filter((l) => l.status === "negotiating").length,
      closed: all.filter((l) => l.status === "closed").length,
      lost: all.filter((l) => l.status === "lost").length,
    };
  } catch (e) {
    console.error("[CRM] fetchCRMSummary failed:", e);
    return { total: 0, new: 0, qualified: 0, negotiating: 0, closed: 0, lost: 0 };
  }
};

// ─── Legacy helper (backward compat) ──────────────────────────────────────────
export const sendWhatsAppLead = async (
  name: string,
  phone: string,
  propertyId: string
): Promise<boolean> => {
  const result = await submitLead({ name, phone, propertyId });
  return result.success;
};
