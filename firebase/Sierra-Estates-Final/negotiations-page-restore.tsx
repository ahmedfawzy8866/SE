'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import {
  Users, Plus, Send, Loader2, X, Phone, Building2, UserCircle2,
  Banknote, MessageCircle, RefreshCw, ChevronRight,
} from 'lucide-react';
import { SectionHeader, StatusBadge, EmptyState } from '@/components/Admin';
import { logger } from '@/lib/logger';

type OwnerNegotiationStatus = 'contacted' | 'negotiating' | 'agreed' | 'completed' | 'rejected' | 'stale';

interface HistoryEntry {
  direction: 'outbound' | 'inbound';
  message: string;
  price?: number;
  timestamp?: { toDate?: () => Date } | string | number | null;
}

interface OwnerNegotiation {
  id: string;
  ownerName?: string;
  ownerPhone: string;
  unitId?: string;
  brokerListingId?: string;
  interestedLeadId?: string;
  askingPrice?: number;
  currentOfferPrice?: number;
  status: OwnerNegotiationStatus;
  history: HistoryEntry[];
  assignedAgentId?: string;
  lastContactAt?: { toDate?: () => Date } | string | number | null;
  updatedAt?: { toDate?: () => Date } | string | number | null;
}

const STATUS_LABELS: Record<OwnerNegotiationStatus, string> = {
  contacted: 'Pending',
  negotiating: 'Negotiating',
  agreed: 'Agreed',
  completed: 'Completed',
  rejected: 'Rejected',
  stale: 'Stale',
};

// The forward path a staff member walks a negotiation through; rejected/stale
// are reachable from the status control too, but aren't "next steps".
const STATUS_FORWARD_FLOW: OwnerNegotiationStatus[] = ['contacted', 'negotiating', 'agreed', 'completed'];
const ALL_STATUSES: OwnerNegotiationStatus[] = ['contacted', 'negotiating', 'agreed', 'completed', 'rejected', 'stale'];

function formatTimestamp(v: HistoryEntry['timestamp']): string {
  if (!v) return '';
  if (typeof v === 'object' && typeof v.toDate === 'function') return v.toDate().toLocaleString();
  const d = new Date(v as string | number);
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleString();
}

function formatMoney(n?: number): string {
  return n === undefined ? '—' : `EGP ${n.toLocaleString()}`;
}

async function authedFetch(url: string, options: RequestInit = {}) {
  const token = await auth.currentUser?.getIdToken();
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

export default function OwnerNegotiationsPage() {
  const [negotiations, setNegotiations] = useState<OwnerNegotiation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('');

  const [composing, setComposing] = useState(false);
  const [composeForm, setComposeForm] = useState({
    ownerPhone: '', ownerName: '', unitId: '', interestedLeadId: '', askingPrice: '', body: '',
  });
  const [composeSending, setComposeSending] = useState(false);
  const [composeError, setComposeError] = useState<string | null>(null);

  const [messageDraft, setMessageDraft] = useState('');
  const [messagePrice, setMessagePrice] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);

  const [unitNames, setUnitNames] = useState<Record<string, string>>({});
  const [leadNames, setLeadNames] = useState<Record<string, string>>({});

  const selected = negotiations.find((n) => n.id === selectedId) || null;

  const loadNegotiations = useCallback(async () => {
    try {
      const url = statusFilter
        ? `/api/admin/owner-negotiations?status=${statusFilter}`
        : '/api/admin/owner-negotiations';
      const data = await authedFetch(url);
      setNegotiations(data.negotiations || []);
    } catch (err) {
      logger.error('Failed to load owner negotiations:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [statusFilter]);

  useEffect(() => { loadNegotiations(); }, [loadNegotiations]);

  // Resolve unit/lead display names lazily once a negotiation referencing
  // them is viewed — avoids N+1 lookups on the full list.
  useEffect(() => {
    if (!selected) return;
    (async () => {
      if (selected.unitId && !unitNames[selected.unitId]) {
        try {
          const snap = await getDoc(doc(db, 'listings', selected.unitId));
          if (snap.exists()) {
            setUnitNames((prev) => ({ ...prev, [selected.unitId!]: snap.data().title || selected.unitId! }));
          }
        } catch { /* public-read collection; ignore failures, fall back to raw id */ }
      }
      if (selected.interestedLeadId && !leadNames[selected.interestedLeadId]) {
        try {
          const snap = await getDoc(doc(db, 'leads', selected.interestedLeadId));
          if (snap.exists()) {
            setLeadNames((prev) => ({ ...prev, [selected.interestedLeadId!]: snap.data().name || selected.interestedLeadId! }));
          }
        } catch { /* staff-only collection; ignore failures, fall back to raw id */ }
      }
    })();
  }, [selected, unitNames, leadNames]);

  async function refetchOne(id: string) {
    try {
      const data = await authedFetch(`/api/admin/owner-negotiations/${id}`);
      setNegotiations((prev) => prev.map((n) => (n.id === id ? data.negotiation : n)));
    } catch (err) {
      logger.error('Failed to refresh negotiation:', err);
    }
  }

  async function handleSendMessage() {
    if (!selected || !messageDraft.trim()) return;
    setSendingMessage(true);
    try {
      await authedFetch(`/api/admin/owner-negotiations/${selected.id}/messages`, {
        method: 'POST',
        body: JSON.stringify({
          body: messageDraft.trim(),
          ...(messagePrice ? { price: Number(messagePrice) } : {}),
        }),
      });
      setMessageDraft('');
      setMessagePrice('');
      await refetchOne(selected.id);
    } catch (err: any) {
      alert(`Failed to send message: ${err.message}`);
    } finally {
      setSendingMessage(false);
    }
  }

  async function handleStatusChange(status: OwnerNegotiationStatus) {
    if (!selected) return;
    try {
      await authedFetch(`/api/admin/owner-negotiations/${selected.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      await refetchOne(selected.id);
    } catch (err: any) {
      alert(`Failed to update status: ${err.message}`);
    }
  }

  async function handleComposeSubmit() {
    setComposeError(null);
    if (!composeForm.ownerPhone.trim() || !composeForm.body.trim()) {
      setComposeError('Owner phone and message are required.');
      return;
    }
    setComposeSending(true);
    try {
      const payload: Record<string, unknown> = {
        ownerPhone: composeForm.ownerPhone.trim(),
        body: composeForm.body.trim(),
      };
      if (composeForm.ownerName.trim()) payload.ownerName = composeForm.ownerName.trim();
      if (composeForm.unitId.trim()) payload.unitId = composeForm.unitId.trim();
      if (composeForm.interestedLeadId.trim()) payload.interestedLeadId = composeForm.interestedLeadId.trim();
      if (composeForm.askingPrice.trim()) payload.askingPrice = Number(composeForm.askingPrice.trim());

      const result = await authedFetch('/api/admin/owner-negotiations', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      setComposing(false);
      setComposeForm({ ownerPhone: '', ownerName: '', unitId: '', interestedLeadId: '', askingPrice: '', body: '' });
      await loadNegotiations();
      setSelectedId(result.negotiationId);
    } catch (err: any) {
      setComposeError(err.message);
    } finally {
      setComposeSending(false);
    }
  }

  const handleRefresh = () => { setRefreshing(true); loadNegotiations(); };

  const activeCount = negotiations.filter((n) => n.status === 'contacted' || n.status === 'negotiating').length;

  return (
    <div className="space-y-8">
      <SectionHeader
        eyebrow="WhatsApp Negotiation Desk"
        title="Owner Negotiations"
        subtitle="Two-way WhatsApp threads with property owners — buy/list negotiations, tracked end to end."
        status={{ label: `${activeCount} active`, ok: true }}
        actions={
          <>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2.5 rounded-xl border border-slate-200 text-slate-400 hover:text-navy disabled:opacity-50"
              title="Refresh"
            >
              <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
            </button>
            <button
              onClick={() => setComposing((v) => !v)}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#031632] text-white rounded-xl font-semibold text-sm hover:bg-[#031632]/90 transition shadow-sm"
            >
              <Plus size={15} />
              New Negotiation
            </button>
          </>
        }
      />

      {composing && (
        <div className="bg-white rounded-3xl border border-black/[0.03] shadow-[0_2px_16px_-4px_rgba(3,22,50,0.06)] p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-navy text-base">Start a New Negotiation</h3>
            <button onClick={() => setComposing(false)} className="text-slate-400 hover:text-navy" aria-label="Close" title="Close">
              <X size={18} />
            </button>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <input
              type="tel"
              placeholder="Owner WhatsApp number (e.g. +201032206443)"
              value={composeForm.ownerPhone}
              onChange={(e) => setComposeForm({ ...composeForm, ownerPhone: e.target.value })}
              className="px-4 py-2.5 border border-[#e7e8e9] rounded-xl text-sm outline-none focus:border-[#C9A84C]"
            />
            <input
              type="text"
              placeholder="Owner name (optional)"
              value={composeForm.ownerName}
              onChange={(e) => setComposeForm({ ...composeForm, ownerName: e.target.value })}
              className="px-4 py-2.5 border border-[#e7e8e9] rounded-xl text-sm outline-none focus:border-[#C9A84C]"
            />
            <input
              type="text"
              placeholder="Unit ID (optional, links to a listing)"
              value={composeForm.unitId}
              onChange={(e) => setComposeForm({ ...composeForm, unitId: e.target.value })}
              className="px-4 py-2.5 border border-[#e7e8e9] rounded-xl text-sm outline-none focus:border-[#C9A84C]"
            />
            <input
              type="text"
              placeholder="Interested client / lead ID (optional)"
              value={composeForm.interestedLeadId}
              onChange={(e) => setComposeForm({ ...composeForm, interestedLeadId: e.target.value })}
              className="px-4 py-2.5 border border-[#e7e8e9] rounded-xl text-sm outline-none focus:border-[#C9A84C]"
            />
            <input
              type="number"
              placeholder="Asking price EGP (optional)"
              value={composeForm.askingPrice}
              onChange={(e) => setComposeForm({ ...composeForm, askingPrice: e.target.value })}
              className="px-4 py-2.5 border border-[#e7e8e9] rounded-xl text-sm outline-none focus:border-[#C9A84C]"
            />
          </div>
          <textarea
            placeholder="Opening message to the owner..."
            value={composeForm.body}
            onChange={(e) => setComposeForm({ ...composeForm, body: e.target.value })}
            rows={3}
            className="w-full px-4 py-3 border border-[#e7e8e9] rounded-xl text-sm outline-none focus:border-[#C9A84C] resize-none"
          />
          {composeError && <p className="text-xs text-red-600 font-semibold">{composeError}</p>}
          <div className="flex justify-end">
            <button
              onClick={handleComposeSubmit}
              disabled={composeSending}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#031632] text-white rounded-xl font-semibold text-sm hover:bg-[#031632]/90 transition shadow-sm disabled:opacity-50"
            >
              {composeSending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              Send Opening Message
            </button>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-[1.1fr_1.4fr] gap-8 items-start">
        {/* ══ LIST ══ */}
        <div className="bg-white rounded-3xl border border-black/[0.03] shadow-[0_2px_16px_-4px_rgba(3,22,50,0.06)] overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-[#f3f4f5] flex items-center justify-between gap-3 shrink-0">
            <h3 className="font-bold text-navy text-sm">Threads</h3>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 outline-none focus:border-[#C9A84C]"
              aria-label="Filter by status"
            >
              <option value="">All statuses</option>
              {ALL_STATUSES.map((s) => (
                <option key={s} value={s}>{STATUS_LABELS[s]}</option>
              ))}
            </select>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-[#3a5570]">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="text-xs">Loading negotiations…</span>
            </div>
          ) : negotiations.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No owner negotiations yet"
              description="Start one with the New Negotiation button above."
            />
          ) : (
            <div className="divide-y divide-[#f3f4f5] overflow-y-auto max-h-[640px]">
              {negotiations.map((n) => {
                const lastEntry = n.history?.[n.history.length - 1];
                return (
                  <button
                    key={n.id}
                    onClick={() => setSelectedId(n.id)}
                    className={`w-full text-left px-6 py-4 flex items-start justify-between gap-3 transition-colors ${
                      selectedId === n.id ? 'bg-[#C9A84C]/5' : 'hover:bg-slate-50/60'
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="font-bold text-[13px] text-[#071422] truncate">
                          {n.ownerName || n.ownerPhone}
                        </span>
                        <StatusBadge status={n.status} label={STATUS_LABELS[n.status]} />
                      </div>
                      <div className="text-[11px] text-[#3a5570]/60 font-mono">{n.ownerPhone}</div>
                      {lastEntry && (
                        <p className="text-[11px] text-[#3a5570]/70 mt-1.5 truncate">
                          {lastEntry.direction === 'outbound' ? 'You: ' : ''}{lastEntry.message}
                        </p>
                      )}
                    </div>
                    <ChevronRight size={14} className="text-slate-300 shrink-0 mt-1" />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* ══ DETAIL ══ */}
        <div className="bg-white rounded-3xl border border-black/[0.03] shadow-[0_2px_16px_-4px_rgba(3,22,50,0.06)] overflow-hidden flex flex-col min-h-[500px]">
          {!selected ? (
            <EmptyState
              icon={MessageCircle}
              title="Select a negotiation"
              description="Choose a thread from the list to view the conversation."
            />
          ) : (
            <>
              {/* Detail header */}
              <div className="px-6 py-5 border-b border-[#f3f4f5] space-y-3 shrink-0">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <UserCircle2 size={18} className="text-[#3a5570]/50" />
                    <span className="font-bold text-[15px] text-[#071422]">{selected.ownerName || 'Unnamed Owner'}</span>
                  </div>
                  <select
                    value={selected.status}
                    onChange={(e) => handleStatusChange(e.target.value as OwnerNegotiationStatus)}
                    className="text-xs font-semibold border border-slate-200 rounded-lg px-2.5 py-1.5 outline-none focus:border-[#C9A84C]"
                    aria-label="Update negotiation status"
                  >
                    {STATUS_FORWARD_FLOW.map((s) => (
                      <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                    ))}
                    <option disabled>──────────</option>
                    <option value="rejected">{STATUS_LABELS.rejected}</option>
                    <option value="stale">{STATUS_LABELS.stale}</option>
                  </select>
                </div>

                <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-[12px] text-[#3a5570]/70">
                  <span className="flex items-center gap-1.5"><Phone size={12} /> {selected.ownerPhone}</span>
                  {selected.unitId && (
                    <span className="flex items-center gap-1.5">
                      <Building2 size={12} /> {unitNames[selected.unitId] || selected.unitId}
                    </span>
                  )}
                  {selected.interestedLeadId && (
                    <span className="flex items-center gap-1.5">
                      <Users size={12} /> Client: {leadNames[selected.interestedLeadId] || selected.interestedLeadId}
                    </span>
                  )}
                  <span className="flex items-center gap-1.5">
                    <Banknote size={12} /> Asking {formatMoney(selected.askingPrice)} · Offer {formatMoney(selected.currentOfferPrice)}
                  </span>
                </div>
              </div>

              {/* Message thread */}
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-3 bg-[#f8f9fa]/40">
                {(!selected.history || selected.history.length === 0) ? (
                  <p className="text-center text-xs text-slate-400 py-10">No messages yet.</p>
                ) : (
                  selected.history.map((entry, i) => (
                    <div key={i} className={`flex ${entry.direction === 'outbound' ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${
                          entry.direction === 'outbound'
                            ? 'bg-[#031632] text-white rounded-br-sm'
                            : 'bg-white border border-slate-200 text-[#071422] rounded-bl-sm'
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{entry.message}</p>
                        {entry.price !== undefined && (
                          <p className={`text-[11px] font-bold mt-1 ${entry.direction === 'outbound' ? 'text-[#C9A84C]' : 'text-emerald-600'}`}>
                            {formatMoney(entry.price)}
                          </p>
                        )}
                        <p className={`text-[10px] mt-1 ${entry.direction === 'outbound' ? 'text-white/40' : 'text-slate-400'}`}>
                          {formatTimestamp(entry.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Composer */}
              <div className="px-6 py-4 border-t border-[#f3f4f5] shrink-0 space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={messageDraft}
                    onChange={(e) => setMessageDraft(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
                    placeholder="Type a message to the owner…"
                    className="flex-1 px-4 py-2.5 border border-[#e7e8e9] rounded-xl text-sm outline-none focus:border-[#C9A84C]"
                  />
                  <input
                    type="number"
                    value={messagePrice}
                    onChange={(e) => setMessagePrice(e.target.value)}
                    placeholder="Price (optional)"
                    className="w-36 px-3 py-2.5 border border-[#e7e8e9] rounded-xl text-sm outline-none focus:border-[#C9A84C]"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={sendingMessage || !messageDraft.trim()}
                    className="flex items-center gap-2 px-4 py-2.5 bg-[#031632] text-white rounded-xl font-semibold text-sm hover:bg-[#031632]/90 transition shadow-sm disabled:opacity-50"
                  >
                    {sendingMessage ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
                  </button>
                </div>
                <p className="text-[10px] text-slate-400">
                  Sent via the quota-gated WhatsApp queue — delivered within the 12pm-8pm operating window.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
