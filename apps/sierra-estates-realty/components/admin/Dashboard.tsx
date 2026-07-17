"use client";
/**
 * AdminDashboard — KPI grid + recent activity + top agents.
 * Loads from /api/admin/dashboard.
 */
import { useEffect, useState } from "react";
import {
  Building2, Inbox, Percent, Map, Users, Clock, Sparkles,
  Loader2, Star,
} from "lucide-react";
import { api } from "@/lib/api-client";
import { StatCard } from "./StatCard";
import { fmtPercent, fmtRelative, fmtScore } from "@/lib/format";
import type { DashboardKPIs } from "@/lib/types";

export function AdminDashboard() {
  const [data, setData] = useState<DashboardKPIs | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.adminDashboard()
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-gold-500" />
      </div>
    );
  }
  if (!data) return <div className="text-muted text-center py-12">Failed to load dashboard.</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted mt-1">Real-time KPIs across listings, inquiries, and compounds.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Active listings" value={data.activeListings} icon={Building2} hint={`${data.totalListings} total`} />
        <StatCard label="New inquiries (7d)" value={data.newInquiries7d} icon={Inbox} hint={`${data.pendingApprovals} pending review`} />
        <StatCard label="Conversion rate" value={fmtPercent(data.conversionRate)} icon={Percent} hint="closed / total inquiries" />
        <StatCard label="Active compounds" value={data.activeCompounds} icon={Map} hint="New Cairo coverage" />
        <StatCard label="Total users" value={data.totalUsers} icon={Users} />
        <StatCard label="Avg AI score" value={fmtScore(data.avgAiScore)} icon={Sparkles} hint="Across all listings" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Recent activity */}
        <div className="card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-serif text-lg font-bold">Recent activity</h3>
            <Clock className="h-4 w-4 text-muted" />
          </div>
          <div className="space-y-3">
            {data.recentActivity.length === 0 ? (
              <p className="text-sm text-muted">No recent activity.</p>
            ) : (
              data.recentActivity.map((a) => (
                <div key={a.id + a.type} className="flex items-start gap-3 pb-3 border-b border-border last:border-0 last:pb-0">
                  <div className={`h-8 w-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold ${
                    a.type === "inquiry" ? "bg-gold-300/20 text-gold-600"
                    : a.type === "lead" ? "bg-emerald-100 text-emerald-700"
                    : a.type === "listing" ? "bg-navy-900/10 text-navy-900"
                    : "bg-amber-100 text-amber-700"
                  }`}>
                    {a.type.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-text">{a.message}</p>
                    <p className="text-xs text-muted">{fmtRelative(a.at)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Top agents */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-serif text-lg font-bold">Top agents</h3>
            <Star className="h-4 w-4 text-gold-500" />
          </div>
          <div className="space-y-3">
            {data.topAgents.length === 0 ? (
              <p className="text-sm text-muted">No agent data.</p>
            ) : (
              data.topAgents.map((a, i) => (
                <div key={a.name} className="flex items-center gap-3">
                  <span className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    i === 0 ? "bg-gold-500 text-navy-950" : "bg-navy-900/10 text-navy-900"
                  }`}>{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{a.name}</p>
                    <p className="text-xs text-muted">{a.listings} listings · ★ {a.rating.toFixed(1)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
