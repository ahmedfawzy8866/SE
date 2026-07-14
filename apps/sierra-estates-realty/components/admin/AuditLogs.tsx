"use client";
/**
 * AuditLogs — immutable log viewer (read-only).
 */
import { useEffect, useState } from "react";
import { Loader2, ScrollText } from "lucide-react";
import { api } from "@/lib/api-client";
import { useToast } from "@/components/client/Toast";
import { DataTable, type Column } from "./DataTable";
import { fmtDateTime } from "@/lib/format";
import type { AuditLog } from "@/lib/types";

export function AuditLogs() {
  const { toast } = useToast();
  const [items, setItems] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.adminAuditLogs()
      .then(setItems)
      .catch((err: any) => toast({ title: "Failed to load audit logs", description: err.message, kind: "error" }))
      .finally(() => setLoading(false));
  }, [toast]);

  const columns: Column<AuditLog>[] = [
    {
      key: "createdAt", header: "When", sortable: true,
      sortValue: (l) => l.createdAt,
      render: (l) => <span className="text-xs">{fmtDateTime(l.createdAt)}</span>,
    },
    {
      key: "actorEmail", header: "Actor", sortable: true,
      render: (l) => (
        <div>
          <p className="text-sm font-medium">{l.actorEmail}</p>
          <p className="text-[10px] text-muted font-mono">{l.actorUid}</p>
        </div>
      ),
    },
    {
      key: "action", header: "Action", sortable: true,
      render: (l) => <span className="badge-navy font-mono text-[10px]">{l.action}</span>,
    },
    {
      key: "target", header: "Target", sortable: true,
      render: (l) => <span className="font-mono text-xs text-muted">{l.target}</span>,
    },
    {
      key: "after", header: "Change",
      render: (l) => (
        <pre className="text-[10px] bg-navy-900/5 p-2 rounded max-w-xs overflow-x-auto">
          {l.after ? JSON.stringify(l.after, null, 2) : "—"}
        </pre>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-serif text-2xl font-bold flex items-center gap-2">
          <ScrollText className="h-5 w-5 text-gold-500" />
          Audit logs
        </h1>
        <p className="text-sm text-muted mt-1">Immutable record of all admin actions. Newest first.</p>
      </div>
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-gold-500" />
        </div>
      ) : (
        <DataTable rows={items} columns={columns} searchKeys={["actorEmail", "action", "target"]} pageSize={20} />
      )}
    </div>
  );
}
