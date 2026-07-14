/**
 * ════════════════════════════════════════════════════════════════════
 *  Sierra Estates — ADMIN PAGE (single page, route: /admin)
 * ════════════════════════════════════════════════════════════════════
 *  This is the ONE and only admin page in the repo. It composes every
 *  admin view into a single route, switched via internal tab state.
 *
 *  Tabs:
 *    1. Dashboard        — KPIs + recent activity + top agents
 *    2. Listings         — CRUD table + create/edit drawer
 *    3. Inquiries        — Kanban pipeline (new → closed/lost)
 *    4. Leads            — Property Finder webhook leads table
 *    5. Users            — Role + status management
 *    6. Reports          — 4 analytics panels
 *    7. Audit logs       — Immutable action history
 *    8. Settings         — Site config (admin-only)
 */
"use client";
import { useState } from "react";
import { Menu } from "lucide-react";
import { Sidebar } from "@/components/admin/Sidebar";
import { AdminDashboard } from "@/components/admin/Dashboard";
import { ListingsManager } from "@/components/admin/ListingsManager";
import { InquiriesPipeline } from "@/components/admin/InquiriesPipeline";
import { LeadsTable } from "@/components/admin/LeadsTable";
import { UsersManager } from "@/components/admin/UsersManager";
import { ReportsView } from "@/components/admin/Reports";
import { AuditLogs } from "@/components/admin/AuditLogs";
import { SettingsView } from "@/components/admin/Settings";
import type { AdminTab } from "@/components/admin/types";

export default function AdminPage() {
  const [tab, setTab] = useState<AdminTab>("dashboard");
  const [mobileSidebar, setMobileSidebar] = useState(false);

  return (
    <div className="min-h-screen bg-bg flex">
      <Sidebar
        active={tab}
        onChange={setTab}
        mobileOpen={mobileSidebar}
        onCloseMobile={() => setMobileSidebar(false)}
      />

      <div className="flex-1 min-w-0 flex flex-col">
        {/* Mobile top bar */}
        <header className="lg:hidden sticky top-0 z-30 bg-surface border-b border-border px-4 py-3 flex items-center gap-3">
          <button onClick={() => setMobileSidebar(true)} className="btn-ghost p-2">
            <Menu className="h-5 w-5" />
          </button>
          <p className="font-serif text-base font-bold">Sierra Admin</p>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {tab === "dashboard" && <AdminDashboard />}
          {tab === "listings" && <ListingsManager />}
          {tab === "inquiries" && <InquiriesPipeline />}
          {tab === "leads" && <LeadsTable />}
          {tab === "users" && <UsersManager />}
          {tab === "reports" && <ReportsView />}
          {tab === "audit" && <AuditLogs />}
          {tab === "settings" && <SettingsView />}
        </main>
      </div>
    </div>
  );
}
