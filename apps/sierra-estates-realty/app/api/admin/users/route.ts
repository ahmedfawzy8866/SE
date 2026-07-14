/**
 * GET /api/admin/users            (manager+)   → User[]
 * PUT /api/admin/users?uid=...    (admin)      → { ok: true }
 *   body: { role?, status?, name? }
 */
import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import { requireRole } from "@/lib/auth";
import type { Role, User, UserStatus } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SEED_USERS: User[] = [
  { uid: "demo-admin", email: "admin@sierra-estates.net", name: "Demo Admin", role: "admin", status: "active", createdAt: new Date(Date.now() - 30 * 86400_000).toISOString(), lastLogin: new Date(Date.now() - 3600_000).toISOString() },
  { uid: "u2", email: "layla@sierra-estates.net", name: "Layla Mansour", role: "manager", status: "active", createdAt: new Date(Date.now() - 60 * 86400_000).toISOString(), lastLogin: new Date(Date.now() - 86400_000).toISOString() },
  { uid: "u3", email: "karim@sierra-estates.net", name: "Karim Fahmy", role: "manager", status: "active", createdAt: new Date(Date.now() - 90 * 86400_000).toISOString(), lastLogin: new Date(Date.now() - 2 * 86400_000).toISOString() },
  { uid: "u4", email: "nour@sierra-estates.net", name: "Nour Saleh", role: "viewer", status: "active", createdAt: new Date(Date.now() - 120 * 86400_000).toISOString(), lastLogin: new Date(Date.now() - 7 * 86400_000).toISOString() },
  { uid: "u5", email: "omar@sierra-estates.net", name: "Omar Magdy", role: "viewer", status: "suspended", createdAt: new Date(Date.now() - 200 * 86400_000).toISOString(), lastLogin: new Date(Date.now() - 30 * 86400_000).toISOString() },
];

export async function GET(req: Request) {
  await requireRole(req, "manager");
  const db = await getAdminDb();
  if (db) {
    try {
      const snap = await db.collection("users").get();
      if (!snap.empty)
        return NextResponse.json(
          snap.docs.map((d) => ({ uid: d.id, ...(d.data() as any) }))
        );
    } catch (err) {
      console.warn("[admin/users] Firestore read failed:", err);
    }
  }
  return NextResponse.json(SEED_USERS);
}

export async function PUT(req: Request) {
  const sess = await requireRole(req, "admin");
  const url = new URL(req.url);
  const uid = url.searchParams.get("uid");
  if (!uid) return NextResponse.json({ error: "Missing uid" }, { status: 400 });
  const body = await req.json().catch(() => ({}));

  const patch: Partial<User> = {};
  if (body.role && ["viewer", "manager", "admin"].includes(body.role))
    patch.role = body.role as Role;
  if (body.status && ["active", "suspended", "deleted"].includes(body.status))
    patch.status = body.status as UserStatus;
  if (body.name) patch.name = String(body.name).slice(0, 200);

  const db = await getAdminDb();
  if (db) {
    await db.collection("users").doc(uid).set(
      { ...patch, updatedAt: new Date().toISOString() },
      { merge: true }
    );
    await db.collection("audit_logs").add({
      actorUid: sess.uid,
      actorEmail: sess.email,
      action: "user.update",
      target: `users/${uid}`,
      after: patch,
      createdAt: new Date().toISOString(),
    });
  }
  return NextResponse.json({ ok: true });
}
