"use client";
/**
 * ListingsManager — table + create/edit drawer.
 * Permissions: manager+ can edit; admin can archive.
 */
import { useEffect, useState } from "react";
import { Plus, Pencil, Archive, Loader2 } from "lucide-react";
import { api } from "@/lib/api-client";
import { useToast } from "@/components/client/Toast";
import { DataTable, type Column } from "./DataTable";
import { Drawer } from "./Drawer";
import { fmtUSD, fmtScore } from "@/lib/format";
import { PROPERTY_TYPES, COMPOUND_ZONES, SEED_COMPOUNDS } from "@/lib/seed";
import { useAuth } from "@/components/client/AuthModal";
import type { Listing, ListingMode, ListingStatus, PropertyType, CompoundZone } from "@/lib/types";

const COMPOUND_NAMES = SEED_COMPOUNDS.map((c) => c.name);

export function ListingsManager() {
  const { me } = useAuth();
  const { toast } = useToast();
  const [items, setItems] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<Listing | null>(null);
  const [form, setForm] = useState<Partial<Listing>>({});

  const canEdit = me?.role === "manager" || me?.role === "admin";
  const canDelete = me?.role === "admin";

  async function load() {
    setLoading(true);
    try { setItems(await api.listings()); }
    catch (err: any) { toast({ title: "Failed to load listings", description: err.message, kind: "error" }); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  function openCreate() {
    setEditing(null);
    setForm({
      code: "", compound: COMPOUND_NAMES[0], zone: "5th Settlement",
      type: "Apartment", beds: 3, bath: 2, area: 150,
      egpM: 8, usd: 1500, aiScore: 8.5, tag: null, mode: "sale",
      agent: "", img: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=85",
      status: "available", description: "",
    });
    setDrawerOpen(true);
  }

  function openEdit(l: Listing) {
    setEditing(l);
    setForm(l);
    setDrawerOpen(true);
  }

  async function save() {
    if (!form.code || !form.compound || !form.usd) {
      toast({ title: "Code, compound and USD price required", kind: "warning" });
      return;
    }
    try {
      if (editing) {
        await api.updateListing(editing.id, form);
        toast({ title: "Listing updated", kind: "success" });
      } else {
        await api.createListing(form);
        toast({ title: "Listing created", kind: "success" });
      }
      setDrawerOpen(false);
      await load();
    } catch (err: any) {
      toast({ title: "Save failed", description: err.message, kind: "error" });
    }
  }

  async function archive(l: Listing) {
    if (!canDelete) return;
    if (!confirm(`Archive listing ${l.code}?`)) return;
    try {
      await api.deleteListing(l.id);
      toast({ title: "Listing archived", kind: "success" });
      await load();
    } catch (err: any) {
      toast({ title: "Archive failed", description: err.message, kind: "error" });
    }
  }

  const columns: Column<Listing>[] = [
    {
      key: "code", header: "Code", sortable: true,
      render: (l) => (
        <div>
          <p className="font-semibold text-navy-900">{l.code}</p>
          <p className="text-xs text-muted">{l.compound}</p>
        </div>
      ),
    },
    { key: "type", header: "Type", sortable: true },
    {
      key: "beds", header: "Beds", sortable: true,
      render: (l) => <span>{l.beds}BR · {l.area}m²</span>,
    },
    {
      key: "usd", header: "USD", sortable: true,
      render: (l) => <span className="font-semibold">{fmtUSD(l.usd)}</span>,
    },
    {
      key: "aiScore", header: "AI", sortable: true,
      render: (l) => <span className="badge-gold">{fmtScore(l.aiScore)}</span>,
    },
    {
      key: "mode", header: "Mode", sortable: true,
      render: (l) => <span className="badge-navy">{l.mode}</span>,
    },
    {
      key: "status", header: "Status", sortable: true,
      render: (l) => {
        const cls = l.status === "available" ? "badge-green" : l.status === "reserved" ? "badge-amber" : "badge-gray";
        return <span className={cls}>{l.status}</span>;
      },
    },
    {
      key: "actions", header: "", sortable: false,
      render: (l) => (
        <div className="flex justify-end gap-1">
          {canEdit && (
            <button onClick={(e) => { e.stopPropagation(); openEdit(l); }} className="btn-ghost p-1.5">
              <Pencil className="h-4 w-4" />
            </button>
          )}
          {canDelete && (
            <button onClick={(e) => { e.stopPropagation(); archive(l); }} className="btn-ghost p-1.5 hover:text-red-600">
              <Archive className="h-4 w-4" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold">Listings</h1>
          <p className="text-sm text-muted mt-1">{items.length} total · CRUD with audit logging.</p>
        </div>
        {canEdit && (
          <button onClick={openCreate} className="btn-gold">
            <Plus className="h-4 w-4" /> New listing
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-gold-500" />
        </div>
      ) : (
        <DataTable
          rows={items}
          columns={columns}
          searchKeys={["code", "compound", "agent", "zone"]}
        />
      )}

      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={editing ? `Edit ${editing.code}` : "New listing"}
        footer={
          <>
            <button onClick={() => setDrawerOpen(false)} className="btn-ghost">Cancel</button>
            <button onClick={save} className="btn-gold">Save</button>
          </>
        }
      >
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Code">
              <input className="input" value={form.code ?? ""} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))} />
            </Field>
            <Field label="Mode">
              <select className="input" value={form.mode ?? "sale"} onChange={(e) => setForm((f) => ({ ...f, mode: e.target.value as ListingMode }))}>
                <option value="sale">Sale</option>
                <option value="rent">Rent</option>
              </select>
            </Field>
          </div>
          <Field label="Compound">
            <select className="input" value={form.compound ?? ""} onChange={(e) => setForm((f) => ({ ...f, compound: e.target.value }))}>
              {COMPOUND_NAMES.map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Zone">
              <select className="input" value={form.zone ?? ""} onChange={(e) => setForm((f) => ({ ...f, zone: e.target.value as CompoundZone }))}>
                {COMPOUND_ZONES.map((z) => <option key={z} value={z}>{z}</option>)}
              </select>
            </Field>
            <Field label="Type">
              <select className="input" value={form.type ?? ""} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as PropertyType }))}>
                {PROPERTY_TYPES.map((tp) => <option key={tp} value={tp}>{tp}</option>)}
              </select>
            </Field>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Beds"><input type="number" className="input" value={form.beds ?? 0} onChange={(e) => setForm((f) => ({ ...f, beds: Number(e.target.value) }))} /></Field>
            <Field label="Bath"><input type="number" className="input" value={form.bath ?? 0} onChange={(e) => setForm((f) => ({ ...f, bath: Number(e.target.value) }))} /></Field>
            <Field label="Area (m²)"><input type="number" className="input" value={form.area ?? 0} onChange={(e) => setForm((f) => ({ ...f, area: Number(e.target.value) }))} /></Field>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Field label="EGP/m² (K)"><input type="number" step="0.1" className="input" value={form.egpM ?? 0} onChange={(e) => setForm((f) => ({ ...f, egpM: Number(e.target.value) }))} /></Field>
            <Field label="USD total"><input type="number" className="input" value={form.usd ?? 0} onChange={(e) => setForm((f) => ({ ...f, usd: Number(e.target.value) }))} /></Field>
            <Field label="AI score (0-10)"><input type="number" step="0.1" min={0} max={10} className="input" value={form.aiScore ?? 0} onChange={(e) => setForm((f) => ({ ...f, aiScore: Number(e.target.value) }))} /></Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Agent"><input className="input" value={form.agent ?? ""} onChange={(e) => setForm((f) => ({ ...f, agent: e.target.value }))} /></Field>
            <Field label="Tag">
              <input className="input" placeholder="Premium, Featured, …" value={form.tag ?? ""} onChange={(e) => setForm((f) => ({ ...f, tag: e.target.value || null }))} />
            </Field>
          </div>
          <Field label="Image URL"><input className="input" value={form.img ?? ""} onChange={(e) => setForm((f) => ({ ...f, img: e.target.value }))} /></Field>
          <Field label="Status">
            <select className="input" value={form.status ?? "available"} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as ListingStatus }))}>
              <option value="available">Available</option>
              <option value="reserved">Reserved</option>
              <option value="sold">Sold</option>
              <option value="archived">Archived</option>
            </select>
          </Field>
          <Field label="Description"><textarea className="input min-h-24" value={form.description ?? ""} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} /></Field>
        </div>
      </Drawer>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="label">{label}</label>
      {children}
    </div>
  );
}
