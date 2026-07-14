/**
 * GET /api/admin/inquiries          (manager+)
 *   → Inquiry[]
 * PUT /api/admin/inquiries?id=...   (manager+)
 *   body: Partial<Inquiry>
 *   → { ok: true }
 */
import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import { requireRole } from "@/lib/auth";
import type { Inquiry } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  await requireRole(req, "manager");
  const db = await getAdminDb();
  if (db) {
    try {
      const snap = await db.collection("inquiries").orderBy("createdAt", "desc").limit(200).get();
      if (!snap.empty)
        return NextResponse.json(
          snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }))
        );
    } catch (err) {
      console.warn("[admin/inquiries] Firestore read failed:", err);
    }
  }
  // Sandbox seed
  const seed: Inquiry[] = [
    { id: "iq1", mode: "sale", name: "Hossam Adel", phone: "+20 100 111 2222", email: "hossam@example.com", zone: "5th Settlement", type: "Villa", budget: "5000-7000 USD", status: "new", source: "website", createdAt: new Date(Date.now() - 7200_000).toISOString() },
    { id: "iq2", mode: "rent", name: "Mona Saad", phone: "+20 100 222 3333", zone: "New Cairo", type: "Apartment", budget: "1500 USD/mo", status: "contacted", source: "website", createdAt: new Date(Date.now() - 2 * 86400_000).toISOString() },
    { id: "iq3", mode: "sale", name: "Tarek Nabil", phone: "+20 100 333 4444", zone: "Mokattam", type: "Penthouse", budget: "3500-4500 USD", status: "toured", source: "website", createdAt: new Date(Date.now() - 5 * 86400_000).toISOString() },
    { id: "iq4", mode: "sale", name: "Yasmine Fouad", phone: "+20 100 444 4444", zone: "5th Settlement", type: "Twin House", budget: "2500 USD", status: "offer", source: "website", createdAt: new Date(Date.now() - 8 * 86400_000).toISOString() },
    { id: "iq5", mode: "sale", name: "Khaled Emad", phone: "+20 100 555 5555", zone: "5th Settlement", type: "Villa", budget: "6000 USD", status: "closed", source: "referral", createdAt: new Date(Date.now() - 15 * 86400_000).toISOString() },
    { id: "iq6", mode: "rent", name: "Salma Wael", phone: "+20 100 666 6666", zone: "New Cairo", type: "Apartment", budget: "1200 USD/mo", status: "lost", source: "website", createdAt: new Date(Date.now() - 20 * 86400_000).toISOString() },
    { id: "iq7", mode: "sale", name: "Reem Adel", phone: "+20 100 777 7777", zone: "5th Settlement", type: "Townhouse", budget: "3000 USD", status: "new", source: "website", createdAt: new Date(Date.now() - 3 * 3600_000).toISOString() },
  ];
  return NextResponse.json(seed);
}

export async function PUT(req: Request) {
  const sess = await requireRole(req, "manager");
  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  const patch = await req.json().catch(() => ({}));

  const db = await getAdminDb();
  if (db) {
    const update = {
      ...patch,
      updatedAt: new Date().toISOString(),
      updatedBy: sess.uid,
    };
    await db.collection("inquiries").doc(id).set(update, { merge: true });
    // Write audit log
    await db.collection("audit_logs").add({
      actorUid: sess.uid,
      actorEmail: sess.email,
      action: "inquiry.update",
      target: `inquiries/${id}`,
      after: patch,
      createdAt: new Date().toISOString(),
    });
  }
  return NextResponse.json({ ok: true });
}
