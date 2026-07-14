"use client";
/**
 * Reports — 4 panels:
 *  1. Listings by compound (bar chart, CSS-only)
 *  2. Inquiries trend (line chart, CSS-only)
 *  3. ROI leaderboard (top 10 compounds by yield)
 *  4. Inquiry status breakdown (donut-like radial bars)
 */
import { useEffect, useState } from "react";
import { BarChart3, TrendingUp, Trophy, PieChart, Loader2 } from "lucide-react";
import { api } from "@/lib/api-client";
import type { Reports } from "@/lib/types";

export function ReportsView() {
  const [data, setData] = useState<Reports | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.adminReports()
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <Loader2 className="h-8 w-8 animate-spin text-gold-500" />
    </div>
  );
  if (!data) return <div className="text-muted text-center py-12">Failed to load reports.</div>;

  const maxCompound = Math.max(...data.listingsByCompound.map((d) => d.count), 1);
  const maxTrend = Math.max(...data.inquiriesTrend.map((d) => d.count), 1);
  const maxStatus = Math.max(...data.statusBreakdown.map((d) => d.count), 1);
  const totalStatus = data.statusBreakdown.reduce((s, d) => s + d.count, 0) || 1;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-serif text-2xl font-bold flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-gold-500" />
          Reports
        </h1>
        <p className="text-sm text-muted mt-1">Aggregated analytics across all listings, inquiries, and compounds.</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Listings by compound */}
        <div className="card p-5">
          <h3 className="font-serif text-lg font-bold mb-4 flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-gold-500" />
            Listings by compound
          </h3>
          <div className="space-y-2">
            {data.listingsByCompound.slice(0, 10).map((d) => (
              <div key={d.compound}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-medium truncate">{d.compound}</span>
                  <span className="text-muted">{d.count} · ${d.avgUsd.toLocaleString()} avg</span>
                </div>
                <div className="h-2 rounded-full bg-navy-900/5 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-gold-500 to-gold-300"
                    style={{ width: `${(d.count / maxCompound) * 100}%` }}
                  />
                </div>
              </div>
            ))}
            {data.listingsByCompound.length === 0 && (
              <p className="text-sm text-muted text-center py-4">No data.</p>
            )}
          </div>
        </div>

        {/* Inquiries trend */}
        <div className="card p-5">
          <h3 className="font-serif text-lg font-bold mb-4 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-gold-500" />
            Inquiries — last 14 days
          </h3>
          <div className="flex items-end gap-1 h-40">
            {data.inquiriesTrend.map((d) => (
              <div key={d.day} className="flex-1 group relative">
                <div
                  className="bg-navy-900 rounded-t hover:bg-gold-500 transition-colors"
                  style={{ height: `${(d.count / maxTrend) * 100}%`, minHeight: "2px" }}
                  title={`${d.day}: ${d.count}`}
                />
                <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] text-muted opacity-0 group-hover:opacity-100">
                  {d.count}
                </span>
              </div>
            ))}
          </div>
          <div className="flex justify-between text-[10px] text-muted mt-2">
            <span>{data.inquiriesTrend[0]?.day}</span>
            <span>{data.inquiriesTrend[data.inquiriesTrend.length - 1]?.day}</span>
          </div>
        </div>

        {/* ROI leaderboard */}
        <div className="card p-5">
          <h3 className="font-serif text-lg font-bold mb-4 flex items-center gap-2">
            <Trophy className="h-4 w-4 text-gold-500" />
            ROI leaderboard — top 10 compounds
          </h3>
          <div className="space-y-2">
            {data.roiLeaderboard.map((c, i) => (
              <div key={c.compound} className="flex items-center gap-3">
                <span className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  i === 0 ? "bg-gold-500 text-navy-950" : "bg-navy-900/10 text-navy-900"
                }`}>{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{c.compound}</p>
                  <p className="text-xs text-muted">{c.priceM}K EGP/m² · {c.rent} EGP/mo</p>
                </div>
                <span className="badge-gold">{c.yield.toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Status breakdown */}
        <div className="card p-5">
          <h3 className="font-serif text-lg font-bold mb-4 flex items-center gap-2">
            <PieChart className="h-4 w-4 text-gold-500" />
            Inquiry status breakdown
          </h3>
          <div className="space-y-3">
            {data.statusBreakdown.map((s) => (
              <div key={s.status}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-medium capitalize">{s.status}</span>
                  <span className="text-muted">{s.count} · {((s.count / totalStatus) * 100).toFixed(0)}%</span>
                </div>
                <div className="h-2.5 rounded-full bg-navy-900/5 overflow-hidden">
                  <div
                    className={`h-full ${
                      s.status === "closed" ? "bg-emerald-500"
                      : s.status === "lost" ? "bg-red-500"
                      : s.status === "new" ? "bg-gold-500"
                      : "bg-navy-900"
                    }`}
                    style={{ width: `${(s.count / maxStatus) * 100}%` }}
                  />
                </div>
              </div>
            ))}
            {data.statusBreakdown.length === 0 && (
              <p className="text-sm text-muted text-center py-4">No data.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
