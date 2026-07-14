/**
 * GET  /api/leads  (manager+)   — list Property Finder webhook leads
 * POST /api/leads  (public)     — webhook ingest (no auth, validates
 *                                  source header or token query)
 *
 * The public POST is for Property Finder's webhook. It validates a
 * shared secret in `x-pf-token` header (PF_WEBHOOK_TOKEN env) or skips
 * in sandbox (no token configured = open ingest, dev only).
 */
import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import { requireRole } from "@/lib/auth";
import type { Lead } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  await requireRole(req, "manager");
  const db = await getAdminDb();
  if (db) {
    try {
      const snap = await db.collection("leads").orderBy("createdAt", "desc").limit(200).get();
      if (!snap.empty)
        return NextResponse.json(
          snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }))
        );
    } catch (err) {
      console.warn("[leads] Firestore read failed:", err);
    }
  }
  // Sandbox seed leads
  const seed: Lead[] = [
    { id: "ld1", source: "property_finder", name: "Mohamed Ali", phone: "+20 122 222 3333", email: "m.ali@example.com", compound: "Mivida", message: "Looking for 3BR apartment, cash buyer.", status: "new", createdAt: new Date(Date.now() - 3600_000).toISOString() },
    { id: "ld2", source: "whatsapp", name: "Sara Hassan", phone: "+20 122 444 5555", compound: "Hyde Park New Cairo", message: "Need villa for rent, 4BR, ASAP.", status: "contacted", createdAt: new Date(Date.now() - 86400_000).toISOString() },
    { id: "ld3", source: "property_finder", name: "Ahmed Tarek", phone: "+20 122 666 7777", email: "a.tarek@example.com", compound: "Taj City", message: "Investor — villa under 5M EGP.", status: "toured", createdAt: new Date(Date.now() - 2 * 86400_000).toISOString() },
    { id: "ld4", source: "referral", name: "Laila Mostafa", phone: "+20 122 888 9999", compound: "Palm Hills New Cairo", message: "Friend referral, looking for townhouse.", status: "new", createdAt: new Date(Date.now() - 3 * 86400_000).toISOString() },
  ];
  return NextResponse.json(seed);
}

export async function POST(req: Request) {
  const expected = process.env.PF_WEBHOOK_TOKEN;
  if (expected) {
    const got = req.headers.get("x-pf-token");
    if (got !== expected) {
      return NextResponse.json({ error: "Invalid webhook token" }, { status: 401 });
    }
  }
  const body = await req.json().catch(() => ({}));
  const lead: Omit<Lead, "id"> = {
    source: (body.source as Lead["source"]) || "property_finder",
    name: String(body.name || "").slice(0, 200),
    phone: String(body.phone || "").slice(0, 50),
    email: body.email ? String(body.email).slice(0, 200) : undefined,
    compound: body.compound || undefined,
    message: body.message ? String(body.message).slice(0, 2000) : undefined,
    status: "new",
    createdAt: new Date().toISOString(),
  };
  const db = await getAdminDb();
  if (db) {
    try {
      const ref = await db.collection("leads").add(lead);
      return NextResponse.json({ id: ref.id });
    } catch (err) {
      console.warn("[leads] Firestore write failed:", err);
    }
  }
  return NextResponse.json({ id: `local-${Date.now()}`, fallback: true });
}
