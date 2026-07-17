"use client";
/** StatCard — KPI tile for the dashboard. */
import { type LucideIcon, TrendingUp, TrendingDown } from "lucide-react";

export function StatCard({
  label, value, icon: Icon, hint, delta,
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  hint?: string;
  delta?: { value: number; positive?: boolean };
}) {
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between mb-3">
        <div className="h-10 w-10 rounded-md bg-navy-900/5 flex items-center justify-center">
          <Icon className="h-5 w-5 text-gold-500" />
        </div>
        {delta && (
          <span className={`inline-flex items-center gap-1 text-xs font-semibold ${delta.positive ? "text-emerald-600" : "text-red-600"}`}>
            {delta.positive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {Math.abs(delta.value).toFixed(1)}%
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-navy-900">{value}</p>
      <p className="text-sm text-muted mt-1">{label}</p>
      {hint && <p className="text-xs text-muted/80 mt-1">{hint}</p>}
    </div>
  );
}
