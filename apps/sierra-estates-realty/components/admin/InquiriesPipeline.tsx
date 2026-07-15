"use client";
/**
 * InquiriesPipeline — kanban-style board.
 * 6 columns: new → contacted → toured → offer → closed → lost.
 * Click a card to open a detail drawer where status can be changed
 * (PATCH /api/admin/inquiries).
 */
import { useCallback, useEffect, useState } from "react";
import { Loader2, Phone, Mail, MapPin, Calendar, ArrowRight } from "lucide-react";
import { api } from "@/lib/api-client";
import { useToast } from "@/components/client/Toast";
import { Drawer } from "./Drawer";
import { fmtRelative, fmtDateTime } from "@/lib/format";
import type { Inquiry, InquiryStatus } from "@/lib/types";

const COLUMNS: Array<{ id: InquiryStatus; label: string; color: string }> = [
  { id: "new",       label: "New",        color: "border-t-gold-500" },
  { id: "contacted", label: "Contacted",  color: "border-t-blue-500" },
  { id: "toured",    label: "Toured",     color: "border-t-purple-500" },
  { id: "offer",     label: "Offer",      color: "border-t-amber-500" },
  { id: "closed",    label: "Closed",     color: "border-t-emerald-500" },
  { id: "lost",      label: "Lost",       color: "border-t-red-500" },
];

export function InquiriesPipeline() {
  const { toast } = useToast();
  const [items, setItems] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Inquiry | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try { setItems(await api.adminInquiries()); }
    catch (err: any) { toast({ title: "Failed to load inquiries", description: err.message, kind: "error" }); }
    finally { setLoading(false); }
  }, [toast]);
  useEffect(() => { load(); }, [load]);

  async function move(id: string, status: InquiryStatus) {
    try {
      await api.adminUpdateInquiry(id, { status });
      toast({ title: `Moved to ${status}`, kind: "success" });
      await load();
      if (selected?.id === id) setSelected((s) => s ? { ...s, status } : s);
    } catch (err: any) {
      toast({ title: "Update failed", description: err.message, kind: "error" });
    }
  }

  function open(i: Inquiry) {
    setSelected(i);
    setDrawerOpen(true);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-gold-500" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-serif text-2xl font-bold">Inquiries pipeline</h1>
        <p className="text-sm text-muted mt-1">{items.length} inquiries · drag-free kanban · click to update.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 overflow-x-auto pb-4">
        {COLUMNS.map((col) => {
          const colItems = items.filter((i) => i.status === col.id);
          return (
            <div key={col.id} className={`card p-3 border-t-4 ${col.color} flex flex-col`}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold">{col.label}</h3>
                <span className="badge-gray">{colItems.length}</span>
              </div>
              <div className="space-y-2 flex-1">
                {colItems.map((i) => (
                  <button
                    key={i.id}
                    onClick={() => open(i)}
                    className="w-full text-left p-3 rounded-md bg-surface border border-border hover:border-gold-400 hover:shadow-card transition-all"
                  >
                    <p className="text-sm font-semibold truncate">{i.name}</p>
                    <p className="text-xs text-muted flex items-center gap-1 mt-0.5">
                      <Phone className="h-3 w-3" /> {i.phone}
                    </p>
                    <div className="flex items-center gap-1 mt-1 flex-wrap">
                      <span className="badge-navy text-[10px]">{i.mode}</span>
                      {i.type && <span className="badge-gray text-[10px]">{i.type}</span>}
                    </div>
                    <p className="text-[10px] text-muted mt-1">{fmtRelative(i.createdAt)}</p>
                  </button>
                ))}
                {colItems.length === 0 && (
                  <p className="text-xs text-muted text-center py-4">Empty</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={selected ? `Inquiry · ${selected.name}` : ""}
        width="md"
        footer={
          selected && (
            <div className="flex flex-wrap gap-1">
              {COLUMNS.filter((c) => c.id !== selected.status).map((c) => (
                <button
                  key={c.id}
                  onClick={() => move(selected.id, c.id)}
                  className="btn-outline text-xs"
                >
                  → {c.label}
                </button>
              ))}
            </div>
          )
        }
      >
        {selected && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Info label="Status"><span className="badge-navy">{selected.status}</span></Info>
              <Info label="Source"><span className="badge-gray">{selected.source}</span></Info>
              <Info label="Mode"><span className="badge-navy">{selected.mode}</span></Info>
              <Info label="Created"><span>{fmtDateTime(selected.createdAt)}</span></Info>
            </div>
            <div className="space-y-2">
              <Line icon={Phone} label="Phone" value={selected.phone} />
              {selected.email && <Line icon={Mail} label="Email" value={selected.email} />}
              {selected.zone && <Line icon={MapPin} label="Zone" value={selected.zone} />}
              {selected.type && <Line icon={ArrowRight} label="Type" value={selected.type} />}
              {selected.budget && <Line icon={Calendar} label="Budget" value={selected.budget} />}
            </div>
            {selected.notes && (
              <div className="p-3 rounded-md bg-navy-900/5 border border-border">
                <p className="text-xs text-muted mb-1">Notes</p>
                <p className="text-sm">{selected.notes}</p>
              </div>
            )}
          </div>
        )}
      </Drawer>
    </div>
  );
}

function Info({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="label">{label}</p>
      {children}
    </div>
  );
}

function Line({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <Icon className="h-4 w-4 text-gold-500" />
      <span className="text-muted w-20">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
