/**
 * GET  /api/listings?mode=sale&compound=&type=&beds=&maxUsd=&q=
 *   → Listing[] (public, filters applied)
 * POST /api/listings  (admin only)
 *   → { id }
 */
import { NextResponse } from "next/server";
import { SEED_LISTINGS } from "@/lib/seed";
import { getAdminDb } from "@/lib/firebase-admin";
import { requireRole } from "@/lib/auth";
import type { Listing } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function loadListings(): Promise<Listing[]> {
  const db = await getAdminDb();
  if (db) {
    try {
      const snap = await db.collection("listings").get();
      if (!snap.empty) {
        return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as Listing[];
      }
    } catch (err) {
      console.warn("[listings] Firestore read failed, using seed:", err);
    }
  }
  return SEED_LISTINGS;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const mode = url.searchParams.get("mode") || "";
  const compound = url.searchParams.get("compound") || "";
  const type = url.searchParams.get("type") || "";
  const beds = url.searchParams.get("beds");
  const maxUsd = url.searchParams.get("maxUsd");
  const q = (url.searchParams.get("q") || "").toLowerCase().trim();

  let items = await loadListings();
  items = items.filter((l) => l.status !== "archived");
  if (mode) items = items.filter((l) => l.mode === mode);
  if (compound) items = items.filter((l) => l.compound === compound);
  if (type) items = items.filter((l) => l.type === type);
  if (beds) items = items.filter((l) => l.beds >= Number(beds));
  if (maxUsd) items = items.filter((l) => l.usd <= Number(maxUsd));
  if (q) {
    items = items.filter(
      (l) =>
        l.code.toLowerCase().includes(q) ||
        l.compound.toLowerCase().includes(q) ||
        l.zone.toLowerCase().includes(q) ||
        (l.agent || "").toLowerCase().includes(q)
    );
  }
  // Sort: featured first, then by AI score
  items.sort((a, b) => {
    if (!!b.featured !== !!a.featured) return b.featured ? 1 : -1;
    return b.aiScore - a.aiScore;
  });
  return NextResponse.json(items);
}

export async function POST(req: Request) {
  await requireRole(req, "manager");
  const body = await req.json().catch(() => ({}));
  const db = await getAdminDb();
  if (db) {
    const ref = await db.collection("listings").add({
      ...body,
      status: body.status ?? "available",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    return NextResponse.json({ id: ref.id });
  }
  // Sandbox: pretend-create
  return NextResponse.json({ id: `local-${Date.now()}` });
}
