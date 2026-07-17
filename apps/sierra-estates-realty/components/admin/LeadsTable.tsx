"use client";
/**
 * LeadsTable — Property Finder webhook leads.
 * Read-only at viewer level; manager+ can change status.
 */
import { useCallback, useEffect, useState } from "react";
import { Loader2, PhoneCall } from "lucide-react";
import { api } from "@/lib/api-client";
import { useToast } from "@/components/client/Toast";
import { DataTable, type Column } from "./DataTable";
import { fmtRelative } from "@/lib/format";
import type { Lead, InquiryStatus } from "@/lib/types";

export function LeadsTable() {
  const { toast } = useToast();
  const [items, setItems] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try { setItems(await api.adminLeads()); }
    catch (err: any) { toast({ title: "Failed to load leads", description: err.message, kind: "error" }); }
    finally { setLoading(false); }
  }, [toast]);
  useEffect(() => { load(); }, [load]);

  async function updateStatus(id: string, status: InquiryStatus) {
    try {
      // Reuse the inquiries PUT endpoint since leads funnel into the same pipeline.
      await api.adminUpdateInquiry(id, { status });
      toast({ title: "Lead updated", kind: "success" });
      await load();
    } catch (err: any) {
      toast({ title: "Update failed", description: err.message, kind: "error" });
    }
  }

  const columns: Column<Lead>[] = [
    {
      key: "name", header: "Lead", sortable: true,
      render: (l) => (
        <div>
          <p className="font-semibold">{l.name}</p>
          <p className="text-xs text-muted">{l.phone}</p>
        </div>
      ),
    },
    {
      key: "source", header: "Source", sortable: true,
      render: (l) => <span className="badge-navy">{l.source}</span>,
    },
    {
      key: "compound", header: "Compound", sortable: true,
      render: (l) => l.compound ?? "—",
    },
    {
      key: "message", header: "Message",
      render: (l) => <span className="text-xs text-muted line-clamp-2">{l.message ?? "—"}</span>,
    },
    {
      key: "createdAt", header: "Received", sortable: true,
      sortValue: (l) => l.createdAt,
      render: (l) => fmtRelative(l.createdAt),
    },
    {
      key: "status", header: "Status", sortable: true,
      render: (l) => (
        <select
          value={l.status}
          onChange={(e) => updateStatus(l.id, e.target.value as InquiryStatus)}
          className="input !py-1 !text-xs !w-32"
        >
          {["new", "contacted", "toured", "offer", "closed", "lost"].map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold flex items-center gap-2">
            <PhoneCall className="h-5 w-5 text-gold-500" />
            Leads
          </h1>
          <p className="text-sm text-muted mt-1">Property Finder + WhatsApp + referral funnels.</p>
        </div>
      </div>
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-gold-500" />
        </div>
      ) : (
        <DataTable rows={items} columns={columns} searchKeys={["name", "phone", "compound"]} />
      )}
    </div>
  );
}
