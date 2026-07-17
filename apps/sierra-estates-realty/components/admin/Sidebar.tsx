"use client";
/**
 * Admin Sidebar — vertical nav for the single admin page.
 * Renders a list of tabs; the active tab is controlled by the parent.
 */
import Link from "next/link";
import {
  LayoutDashboard, Building2, Inbox, Users, BarChart3,
  ScrollText, Settings, LogOut, Shield, ExternalLink,
} from "lucide-react";
import { useAuth } from "@/components/client/AuthModal";
import type { AdminTab } from "./types";

const TABS: Array<{ id: AdminTab; label: string; icon: any; min: "viewer" | "manager" | "admin" }> = [
  { id: "dashboard",  label: "Dashboard",  icon: LayoutDashboard, min: "manager" },
  { id: "listings",   label: "Listings",   icon: Building2,       min: "manager" },
  { id: "inquiries",  label: "Inquiries",  icon: Inbox,           min: "manager" },
  { id: "users",      label: "Users",      icon: Users,           min: "manager" },
  { id: "reports",    label: "Reports",    icon: BarChart3,       min: "manager" },
  { id: "audit",      label: "Audit logs", icon: ScrollText,      min: "manager" },
  { id: "settings",   label: "Settings",   icon: Settings,        min: "admin" },
];

const ROLE_ORDER = ["viewer", "manager", "admin"] as const;

export function Sidebar({
  active, onChange, mobileOpen, onCloseMobile,
}: {
  active: AdminTab;
  onChange: (t: AdminTab) => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}) {
  const { me, signOut } = useAuth();
  const role = (me?.role as typeof ROLE_ORDER[number]) ?? "viewer";
  const roleIdx = ROLE_ORDER.indexOf(role);

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-navy-950/60" onClick={onCloseMobile} />
      )}

      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 lg:z-auto h-screen w-64 bg-navy-950 text-cream flex flex-col transition-transform ${
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="p-5 border-b border-cream/10 flex items-center gap-3">
          <div className="h-10 w-10 rounded-md bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center text-navy-950 font-bold text-lg">
            S
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-serif text-base font-bold leading-none">Sierra Estates</p>
            <p className="text-[10px] uppercase tracking-[0.18em] text-gold-300 mt-1">Admin Console</p>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {TABS.map((tab) => {
            const allowed = roleIdx >= ROLE_ORDER.indexOf(tab.min);
            return (
              <button
                key={tab.id}
                disabled={!allowed}
                onClick={() => { onChange(tab.id); onCloseMobile(); }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  active === tab.id
                    ? "bg-gold-500 text-navy-950"
                    : allowed
                    ? "text-cream/70 hover:bg-cream/5 hover:text-cream"
                    : "text-cream/30 cursor-not-allowed"
                }`}
              >
                <tab.icon className="h-4 w-4 flex-shrink-0" />
                <span className="flex-1 text-left">{tab.label}</span>
                {!allowed && <Shield className="h-3 w-3" />}
              </button>
            );
          })}
        </nav>

        <div className="p-3 border-t border-cream/10 space-y-1">
          <Link
            href={process.env.NEXT_PUBLIC_CLIENT_URL || "/"}
            target={process.env.NEXT_PUBLIC_CLIENT_URL ? "_blank" : undefined}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-cream/70 hover:bg-cream/5 hover:text-cream transition-colors"
          >
            <ExternalLink className="h-4 w-4" />
            View live site
          </Link>
          <button
            onClick={signOut}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-cream/70 hover:bg-red-500/20 hover:text-red-300 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
          {me?.email && (
            <p className="text-[10px] text-cream/40 px-3 pt-2 truncate">
              Signed in as {me.email}
            </p>
          )}
        </div>
      </aside>
    </>
  );
}
