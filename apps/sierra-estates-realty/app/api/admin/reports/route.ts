/**
 * GET /api/admin/reports  (manager+)   → Reports
 * Aggregations: listingsByCompound, inquiriesTrend, roiLeaderboard, statusBreakdown.
 */
import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import { requireRole } from "@/lib/auth";
import { SEED_LISTINGS, SEED_COMPOUNDS } from "@/lib/seed";
import type { Inquiry, Listing, Reports } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  await requireRole(req, "manager");

  const db = await getAdminDb();
  let listings: Listing[] = SEED_LISTINGS;
  let inquiries: Inquiry[] = [];

  if (db) {
    try {
      const [lSnap, iSnap] = await Promise.all([
        db.collection("listings").get(),
        db.collection("inquiries").get(),
      ]);
      if (!lSnap.empty) listings = lSnap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
      if (!iSnap.empty) inquiries = iSnap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
    } catch (err) {
      console.warn("[reports] Firestore read failed:", err);
    }
  }
  if (inquiries.length === 0) {
    inquiries = seedInquiries();
  }

  // listingsByCompound
  const byCompound = new Map<string, { count: number; totalUsd: number }>();
  for (const l of listings) {
    const cur = byCompound.get(l.compound) ?? { count: 0, totalUsd: 0 };
    cur.count++;
    cur.totalUsd += l.usd;
    byCompound.set(l.compound, cur);
  }
  const listingsByCompound = [...byCompound.entries()]
    .map(([compound, v]) => ({
      compound, count: v.count,
      avgUsd: v.count ? Math.round(v.totalUsd / v.count) : 0,
    }))
    .sort((a, b) => b.count - a.count);

  // inquiriesTrend — last 14 days
  const dayBuckets = new Map<string, number>();
  for (let i = 13; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400_000);
    const key = d.toISOString().slice(5, 10); // MM-DD
    dayBuckets.set(key, 0);
  }
  for (const inq of inquiries) {
    const key = new Date(inq.createdAt).toISOString().slice(5, 10);
    if (dayBuckets.has(key)) dayBuckets.set(key, (dayBuckets.get(key) ?? 0) + 1);
  }
  const inquiriesTrend = [...dayBuckets.entries()].map(([day, count]) => ({ day, count }));

  // roiLeaderboard — annual rent × 12 / (priceM × area) approximation.
  // We use compound-level rent as proxy for annual rent × 12, and
  // compound priceM × avg listing area as price proxy.
  const roiLeaderboard = SEED_COMPOUNDS
    .map((c) => {
      const compoundListings = listings.filter((l) => l.compound === c.name);
      const avgArea = compoundListings.length
        ? compoundListings.reduce((s, l) => s + l.area, 0) / compoundListings.length
        : 200;
      const price = c.priceM * 1000 * avgArea;
      const annualRent = c.rent * 12;
      const yld = price ? (annualRent / price) * 100 : 0;
      return {
        compound: c.name,
        yield: Math.round(yld * 10) / 10,
        priceM: c.priceM,
        rent: c.rent,
      };
    })
    .sort((a, b) => b.yield - a.yield)
    .slice(0, 10);

  // statusBreakdown
  const statusCounts = new Map<string, number>();
  for (const i of inquiries) {
    statusCounts.set(i.status, (statusCounts.get(i.status) ?? 0) + 1);
  }
  const statusBreakdown = [...statusCounts.entries()].map(([status, count]) => ({
    status: status as Inquiry["status"], count,
  }));

  return NextResponse.json<Reports>({
    listingsByCompound,
    inquiriesTrend,
    roiLeaderboard,
    statusBreakdown,
  });
}

function seedInquiries(): Inquiry[] {
  return [
    { id: "iq1", mode: "sale", name: "Hossam Adel", phone: "+20 100 111 2222", status: "new", source: "website", createdAt: new Date(Date.now() - 7200_000).toISOString() },
    { id: "iq2", mode: "rent", name: "Mona Saad", phone: "+20 100 222 3333", status: "contacted", source: "website", createdAt: new Date(Date.now() - 2 * 86400_000).toISOString() },
    { id: "iq3", mode: "sale", name: "Tarek Nabil", phone: "+20 100 333 4444", status: "toured", source: "website", createdAt: new Date(Date.now() - 5 * 86400_000).toISOString() },
    { id: "iq4", mode: "sale", name: "Yasmine Fouad", phone: "+20 100 444 4444", status: "offer", source: "website", createdAt: new Date(Date.now() - 8 * 86400_000).toISOString() },
    { id: "iq5", mode: "sale", name: "Khaled Emad", phone: "+20 100 555 5555", status: "closed", source: "referral", createdAt: new Date(Date.now() - 15 * 86400_000).toISOString() },
    { id: "iq6", mode: "rent", name: "Salma Wael", phone: "+20 100 666 6666", status: "lost", source: "website", createdAt: new Date(Date.now() - 20 * 86400_000).toISOString() },
  ];
}
