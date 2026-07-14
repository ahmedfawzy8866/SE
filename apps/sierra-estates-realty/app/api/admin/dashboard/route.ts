/**
 * GET /api/admin/dashboard  (manager+)
 *   → DashboardKPIs  (totalListings, newInquiries7d, conversionRate, ...)
 *
 * Computes KPIs from Firestore when available, otherwise from seed.
 */
import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import { requireRole } from "@/lib/auth";
import {
  SEED_LISTINGS, SEED_COMPOUNDS, SEED_AGENTS,
} from "@/lib/seed";
import type { DashboardKPIs, Inquiry, Lead, Listing, User } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  await requireRole(req, "manager");

  const db = await getAdminDb();
  let listings: Listing[] = SEED_LISTINGS;
  let inquiries: Inquiry[] = [];
  let leads: Lead[] = [];
  let users: User[] = [];

  if (db) {
    try {
      const [lSnap, iSnap, ldSnap, uSnap] = await Promise.all([
        db.collection("listings").get(),
        db.collection("inquiries").orderBy("createdAt", "desc").limit(100).get(),
        db.collection("leads").orderBy("createdAt", "desc").limit(100).get(),
        db.collection("users").get(),
      ]);
      if (!lSnap.empty) listings = lSnap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
      if (!iSnap.empty) inquiries = iSnap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
      if (!ldSnap.empty) leads = ldSnap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
      if (!uSnap.empty) users = uSnap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
    } catch (err) {
      console.warn("[dashboard] Firestore read failed, using seed:", err);
    }
  } else {
    // Sandbox seed inquiries/leads for a believable dashboard
    inquiries = seedInquiries();
    leads = seedLeads();
    users = seedUsers();
  }

  const activeListings = listings.filter((l) => l.status === "available");
  const now = Date.now();
  const weekAgo = now - 7 * 86400_000;
  const newInquiries7d = inquiries.filter(
    (i) => new Date(i.createdAt).getTime() > weekAgo
  ).length;
  const closed = inquiries.filter((i) => i.status === "closed").length;
  const conversionRate = inquiries.length
    ? (closed / inquiries.length) * 100
    : 0;
  const pendingApprovals = inquiries.filter((i) => i.status === "new").length;
  const avgAiScore = listings.length
    ? listings.reduce((s, l) => s + l.aiScore, 0) / listings.length
    : 0;

  // Recent activity feed (merge inquiries + leads, top 10)
  const recentActivity: DashboardKPIs["recentActivity"] = [
    ...inquiries.map((i) => ({
      id: i.id, type: "inquiry" as const,
      message: `New inquiry from ${i.name} (${i.mode})`,
      at: i.createdAt,
    })),
    ...leads.map((l) => ({
      id: l.id, type: "lead" as const,
      message: `Lead from ${l.source}: ${l.name}`,
      at: l.createdAt,
    })),
  ]
    .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
    .slice(0, 10);

  // Top agents (by listings count)
  const byAgent = new Map<string, { listings: number }>();
  for (const l of listings) {
    if (!l.agent) continue;
    const cur = byAgent.get(l.agent) ?? { listings: 0 };
    cur.listings++;
    byAgent.set(l.agent, cur);
  }
  const topAgents = [...byAgent.entries()]
    .map(([name, v]) => ({
      name,
      listings: v.listings,
      rating: SEED_AGENTS.find((a) => a.name === name)?.rating ?? 4.7,
    }))
    .sort((a, b) => b.listings - a.listings)
    .slice(0, 5);

  return NextResponse.json<DashboardKPIs>({
    totalListings: listings.length,
    activeListings: activeListings.length,
    newInquiries7d,
    conversionRate,
    activeCompounds: SEED_COMPOUNDS.length,
    totalUsers: users.length || 3,
    pendingApprovals,
    avgAiScore,
    recentActivity,
    topAgents,
  });
}

function seedInquiries(): Inquiry[] {
  return [
    { id: "iq1", mode: "sale", name: "Hossam Adel", phone: "+20 100 111 2222", email: "hossam@example.com", zone: "5th Settlement", type: "Villa", budget: "5000-7000 USD", status: "new", source: "website", createdAt: new Date(Date.now() - 7200_000).toISOString() },
    { id: "iq2", mode: "rent", name: "Mona Saad", phone: "+20 100 222 3333", zone: "New Cairo", type: "Apartment", budget: "1500 USD/mo", status: "contacted", source: "website", createdAt: new Date(Date.now() - 2 * 86400_000).toISOString() },
    { id: "iq3", mode: "sale", name: "Tarek Nabil", phone: "+20 100 333 4444", zone: "Mokattam", type: "Penthouse", budget: "3500-4500 USD", status: "toured", source: "website", createdAt: new Date(Date.now() - 5 * 86400_000).toISOString() },
    { id: "iq4", mode: "sale", name: "Yasmine Fouad", phone: "+20 100 444 5555", zone: "5th Settlement", type: "Twin House", budget: "2500 USD", status: "offer", source: "website", createdAt: new Date(Date.now() - 8 * 86400_000).toISOString() },
    { id: "iq5", mode: "sale", name: "Khaled Emad", phone: "+20 100 555 6666", zone: "5th Settlement", type: "Villa", budget: "6000 USD", status: "closed", source: "referral", createdAt: new Date(Date.now() - 15 * 86400_000).toISOString() },
    { id: "iq6", mode: "rent", name: "Salma Wael", phone: "+20 100 666 7777", zone: "New Cairo", type: "Apartment", budget: "1200 USD/mo", status: "lost", source: "website", createdAt: new Date(Date.now() - 20 * 86400_000).toISOString() },
  ];
}

function seedLeads(): Lead[] {
  return [
    { id: "ld1", source: "property_finder", name: "Mohamed Ali", phone: "+20 122 222 3333", compound: "Mivida", message: "3BR cash buyer.", status: "new", createdAt: new Date(Date.now() - 3600_000).toISOString() },
    { id: "ld2", source: "whatsapp", name: "Sara Hassan", phone: "+20 122 444 5555", compound: "Hyde Park New Cairo", message: "Villa for rent.", status: "contacted", createdAt: new Date(Date.now() - 86400_000).toISOString() },
  ];
}

function seedUsers(): User[] {
  return [
    { uid: "demo-admin", email: "admin@sierra-estates.net", name: "Demo Admin", role: "admin", status: "active", createdAt: new Date(Date.now() - 30 * 86400_000).toISOString() },
    { uid: "u2", email: "layla@sierra-estates.net", name: "Layla Mansour", role: "manager", status: "active", createdAt: new Date(Date.now() - 60 * 86400_000).toISOString() },
    { uid: "u3", email: "karim@sierra-estates.net", name: "Karim Fahmy", role: "manager", status: "active", createdAt: new Date(Date.now() - 90 * 86400_000).toISOString() },
  ];
}
