/** GET /api/admin/audit  (manager+) → AuditLog[] (last 100, newest first) */
import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import { requireRole } from "@/lib/auth";
import type { AuditLog } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SEED_LOGS: AuditLog[] = [
  { id: "al1", actorUid: "demo-admin", actorEmail: "admin@sierra-estates.net", action: "inquiry.update", target: "inquiries/iq2", after: { status: "contacted" }, createdAt: new Date(Date.now() - 3600_000).toISOString() },
  { id: "al2", actorUid: "demo-admin", actorEmail: "admin@sierra-estates.net", action: "listing.update", target: "listings/l1", after: { price: 5400 }, createdAt: new Date(Date.now() - 4 * 3600_000).toISOString() },
  { id: "al3", actorUid: "demo-admin", actorEmail: "admin@sierra-estates.net", action: "user.update", target: "users/u4", after: { role: "manager" }, createdAt: new Date(Date.now() - 86400_000).toISOString() },
  { id: "al4", actorUid: "u2", actorEmail: "layla@sierra-estates.net", action: "inquiry.update", target: "inquiries/iq3", after: { status: "toured" }, createdAt: new Date(Date.now() - 2 * 86400_000).toISOString() },
  { id: "al5", actorUid: "demo-admin", actorEmail: "admin@sierra-estates.net", action: "listing.create", target: "listings/l8", after: { code: "EST-DX-08" }, createdAt: new Date(Date.now() - 3 * 86400_000).toISOString() },
];

export async function GET(req: Request) {
  await requireRole(req, "manager");
  const db = await getAdminDb();
  if (db) {
    try {
      const snap = await db.collection("audit_logs")
        .orderBy("createdAt", "desc")
        .limit(100)
        .get();
      if (!snap.empty)
        return NextResponse.json(
          snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }))
        );
    } catch (err) {
      console.warn("[audit] Firestore read failed:", err);
    }
  }
  return NextResponse.json(SEED_LOGS);
}
