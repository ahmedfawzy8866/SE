import React, { useState, useEffect, useCallback } from 'react';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import {
  Users, Plus, Send, Loader2, X, Phone, Building2, UserCircle2,
  Banknote, MessageCircle, RefreshCw, ChevronRight, Flame
} from 'lucide-react';
import { api } from '../lib/apiClient';

type OwnerNegotiationStatus = 'contacted' | 'negotiating' | 'agreed' | 'completed' | 'rejected' | 'stale';

interface HistoryEntry {
  direction: 'outbound' | 'inbound';
  message: string;
  price?: number;
  timestamp?: any;
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
  lastContactAt?: any;
  updatedAt?: any;
}

const STATUS_LABELS: Record<OwnerNegotiationStatus, string> = {
  contacted: 'Pending',
  negotiating: 'Negotiating',
  agreed: 'Agreed',
  completed: 'Completed',
  rejected: 'Rejected',
  stale: 'Stale',
};

const STATUS_COLORS: Record<string, string> = {
  contacted: 'bg-amber-500/10 text-amber-500 border border-amber-500/20',
  negotiating: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
  agreed: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
  completed: 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
  rejected: 'bg-red-500/10 text-red-400 border border-red-500/20',
  stale: 'bg-slate-500/10 text-slate-400 border border-slate-500/20',
};

const STATUS_FORWARD_FLOW: OwnerNegotiationStatus[] = ['contacted', 'negotiating', 'agreed', 'completed'];
const ALL_STATUSES: OwnerNegotiationStatus[] = ['contacted', 'negotiating', 'agreed', 'completed', 'rejected', 'stale'];

function StatusBadge({ status, label }: { status: string; label: string }) {
  const colorClass = STATUS_COLORS[status] || 'bg-slate-500/10 text-slate-400';
  return (
    <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${colorClass}`}>
      {label}
    </span>
  );
}

function EmptyState({ icon: Icon, title, description }: { icon: any; title: string; description: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <Icon className="w-10 h-10 text-slate-600 mb-3 animate-pulse" />
      <h3 className="font-bold text-slate-300 text-sm mb-1">{title}</h3>
      <p className="text-xs text-slate-500 max-w-[280px]">{description}</p>
    </div>
  );
}

function formatTimestamp(v: any): string {
  if (!v) return '';
  if (v.seconds) return new Date(v.seconds * 1000).toLocaleString();
  if (typeof v === 'object' && typeof v.toDate === 'function') return v.toDate().toLocaleString();
  const d = new Date(v as string | number);
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleString();
}

function formatMoney(n?: number): string {
  return n === undefined ? '—' : `EGP ${n.toLocaleString()}`;
}

interface OwnerNegotiationsPageProps {
  T: (key: string) => string;
  isAr?: boolean;
  searchQuery?: string;
}

export default function OwnerNegotiationsPage({ T, isAr = false, searchQuery = '' }: OwnerNegotiationsPageProps) {
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
      const data = await api.get<{ negotiations: OwnerNegotiation[] }>(url);
      setNegotiations(data.negotiations || []);
    } catch (err) {
      console.error('Failed to load owner negotiations:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [statusFilter]);

  useEffect(() => { loadNegotiations(); }, [loadNegotiations]);

  useEffect(() => {
    if (!selected) return;
    (async () => {
      if (selected.unitId && !unitNames[selected.unitId]) {
        try {
          const snap = await getDoc(doc(db, 'listings', selected.unitId));
          if (snap.exists()) {
            setUnitNames((prev) => ({ ...prev, [selected.unitId!]: snap.data().title || selected.unitId! }));
          }
        } catch (e) {
          console.warn("Failed to get unit details:", e);
        }
      }
      if (selected.interestedLeadId && !leadNames[selected.interestedLeadId]) {
        try {
          const snap = await getDoc(doc(db, 'leads', selected.interestedLeadId));
          if (snap.exists()) {
            setLeadNames((prev) => ({ ...prev, [selected.interestedLeadId!]: snap.data().name || selected.interestedLeadId! }));
          }
        } catch (e) {
          console.warn("Failed to get lead details:", e);
        }
      }
    })();
  }, [selected, unitNames, leadNames]);

  async function refetchOne(id: string) {
    try {
      const data = await api.get<{ negotiation: OwnerNegotiation }>(`/api/admin/owner-negotiations/${id}`);
      setNegotiations((prev) => prev.map((n) => (n.id === id ? data.negotiation : n)));
    } catch (err) {
      console.error('Failed to refresh negotiation:', err);
    }
  }

  async function handleSendMessage() {
    if (!selected || !messageDraft.trim()) return;
    setSendingMessage(true);
    try {
      await api.post(`/api/admin/owner-negotiations/${selected.id}/messages`, {
        body: messageDraft.trim(),
        ...(messagePrice ? { price: Number(messagePrice) } : {}),
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
      await api.patch(`/api/admin/owner-negotiations/${selected.id}`, { status });
      await refetchOne(selected.id);
    } catch (err: any) {
      alert(`Failed to update status: ${err.message}`);
    }
  }

  async function handleComposeSubmit() {
    setComposeError(null);
    if (!composeForm.ownerPhone.trim() || !composeForm.body.trim()) {
      setComposeError(isAr ? 'حقل الهاتف والرسالة مطلوبين.' : 'Owner phone and message are required.');
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

      const result = await api.post<{ success: boolean; negotiationId: string }>(
        '/api/admin/owner-negotiations',
        payload
      );
      setComposing(false);
      setComposeForm({ ownerPhone: '', ownerName: '', unitId: '', interestedLeadId: '', askingPrice: '', body: '' });
      await loadNegotiations();
      if (result.negotiationId) {
        setSelectedId(result.negotiationId);
      }
    } catch (err: any) {
      setComposeError(err.message);
    } finally {
      setComposeSending(false);
    }
  }

  const handleRefresh = () => { setRefreshing(true); loadNegotiations(); };

  const activeCount = negotiations.filter((n) => n.status === 'contacted' || n.status === 'negotiating').length;

  const filtered = negotiations.filter((n) => {
    if (!searchQuery) return true;
    const qLower = searchQuery.toLowerCase();
    return (
      n.ownerPhone.includes(qLower) ||
      (n.ownerName && n.ownerName.toLowerCase().includes(qLower)) ||
      (n.unitId && n.unitId.toLowerCase().includes(qLower))
    );
  });

  return (
    <div className="space-y-6 animate-fade-in-up" dir={isAr ? 'rtl' : 'ltr'}>
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <span className="text-xs font-bold tracking-wider text-cyan-400 uppercase">
            {isAr ? 'مكتب مفاوضات الواتساب' : 'WhatsApp Negotiation Desk'}
          </span>
          <h1 className="text-2xl font-extrabold text-white mt-1">
            {isAr ? 'مفاوضات الملاك' : 'Owner Negotiations'}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {isAr 
              ? 'محادثات واتساب ثنائية الاتجاه مع ملاك العقارات لتتبع المفاوضات والأسعار.' 
              : 'Two-way WhatsApp threads with property owners — buy/list negotiations, tracked end to end.'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2.5 rounded-lg border border-slate-800 bg-[#0a0f1d] text-slate-400 hover:text-white disabled:opacity-50 transition cursor-pointer"
            title="Refresh"
          >
            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={() => setComposing((v) => !v)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg font-semibold text-xs hover:from-cyan-500 hover:to-blue-500 transition shadow-md cursor-pointer"
          >
            <Plus size={14} />
            <span>{isAr ? 'بدء تفاوض جديد' : 'New Negotiation'}</span>
          </button>
        </div>
      </div>

      {/* Compose Form */}
      {composing && (
        <div className="bg-[#0a0f1d] border border-slate-850 rounded-xl p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-sm">
              {isAr ? 'بدء جلسة تفاوض جديدة' : 'Start a New Negotiation'}
            </h3>
            <button onClick={() => setComposing(false)} className="text-slate-400 hover:text-white" aria-label="Close">
              <X size={16} />
            </button>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <input
              type="tel"
              placeholder={isAr ? "رقم واتساب المالك (مثال: +201032206443)" : "Owner WhatsApp number (e.g. +201032206443)"}
              value={composeForm.ownerPhone}
              onChange={(e) => setComposeForm({ ...composeForm, ownerPhone: e.target.value })}
              className="px-4 py-2.5 bg-slate-950 border border-slate-850 rounded-lg text-xs text-white outline-none focus:border-cyan-500/50"
            />
            <input
              type="text"
              placeholder={isAr ? "اسم المالك (اختياري)" : "Owner name (optional)"}
              value={composeForm.ownerName}
              onChange={(e) => setComposeForm({ ...composeForm, ownerName: e.target.value })}
              className="px-4 py-2.5 bg-slate-950 border border-slate-850 rounded-lg text-xs text-white outline-none focus:border-cyan-500/50"
            />
            <input
              type="text"
              placeholder={isAr ? "معرف العقار (اختياري)" : "Unit ID (optional, links to a listing)"}
              value={composeForm.unitId}
              onChange={(e) => setComposeForm({ ...composeForm, unitId: e.target.value })}
              className="px-4 py-2.5 bg-slate-950 border border-slate-850 rounded-lg text-xs text-white outline-none focus:border-cyan-500/50"
            />
            <input
              type="text"
              placeholder={isAr ? "معرف العميل المهتم (اختياري)" : "Interested client / lead ID (optional)"}
              value={composeForm.interestedLeadId}
              onChange={(e) => setComposeForm({ ...composeForm, interestedLeadId: e.target.value })}
              className="px-4 py-2.5 bg-slate-950 border border-slate-850 rounded-lg text-xs text-white outline-none focus:border-cyan-500/50"
            />
            <input
              type="number"
              placeholder={isAr ? "السعر المطلوب بالجنيه المصري (اختياري)" : "Asking price EGP (optional)"}
              value={composeForm.askingPrice}
              onChange={(e) => setComposeForm({ ...composeForm, askingPrice: e.target.value })}
              className="px-4 py-2.5 bg-slate-950 border border-slate-850 rounded-lg text-xs text-white outline-none focus:border-cyan-500/50"
            />
          </div>
          <textarea
            placeholder={isAr ? "رسالة البداية الموجهة للمالك..." : "Opening message to the owner..."}
            value={composeForm.body}
            onChange={(e) => setComposeForm({ ...composeForm, body: e.target.value })}
            rows={3}
            className="w-full px-4 py-3 bg-slate-950 border border-slate-850 rounded-lg text-xs text-white outline-none focus:border-cyan-500/50 resize-none"
          />
          {composeError && <p className="text-xs text-red-500 font-semibold">{composeError}</p>}
          <div className="flex justify-end">
            <button
              onClick={handleComposeSubmit}
              disabled={composeSending}
              className="flex items-center gap-2 px-5 py-2 bg-[#05080f] text-white border border-slate-800 rounded-lg font-semibold text-xs hover:bg-[#05080f]/75 transition cursor-pointer disabled:opacity-50"
            >
              {composeSending ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
              <span>{isAr ? 'إرسال الرسالة الأولى' : 'Send Opening Message'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid lg:grid-cols-[1fr_1.3fr] gap-6 items-start">
        {/* Thread list */}
        <div className="bg-[#0a0f1d] border border-slate-800 rounded-xl overflow-hidden flex flex-col shadow-lg">
          <div className="px-5 py-4 border-b border-slate-850 flex items-center justify-between gap-3 shrink-0">
            <h3 className="font-bold text-white text-xs">{isAr ? 'قنوات التفاوض' : 'Threads'}</h3>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs bg-slate-950 border border-slate-850 text-slate-300 rounded-md px-2 py-1.5 outline-none focus:border-cyan-500/50"
            >
              <option value="">{isAr ? 'كل الحالات' : 'All statuses'}</option>
              {ALL_STATUSES.map((s) => (
                <option key={s} value={s}>{STATUS_LABELS[s]}</option>
              ))}
            </select>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-400">
              <Loader2 className="h-6 w-6 animate-spin text-cyan-500" />
              <span className="text-xs">{isAr ? 'جاري تحميل المفاوضات...' : 'Loading negotiations…'}</span>
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={Users}
              title={isAr ? "لا توجد تفاوضات حالية" : "No owner negotiations yet"}
              description={isAr ? "ابدأ محادثة تفاوض جديدة مع مالك عقار عبر زر التفاوض الجديد." : "Start one with the New Negotiation button above."}
            />
          ) : (
            <div className="divide-y divide-slate-850 overflow-y-auto max-h-[640px] scrollbar-thin">
              {filtered.map((n) => {
                const lastEntry = n.history?.[n.history.length - 1];
                return (
                  <button
                    key={n.id}
                    onClick={() => setSelectedId(n.id)}
                    className={`w-full text-left px-5 py-4 flex items-start justify-between gap-3 transition-colors ${
                      selectedId === n.id ? 'bg-cyan-500/10' : 'hover:bg-slate-900/30'
                    }`}
                  >
                    <div className="flex-1 min-w-0" style={{ textAlign: isAr ? 'right' : 'left' }}>
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span className="font-bold text-[13px] text-white truncate">
                          {n.ownerName || n.ownerPhone}
                        </span>
                        <StatusBadge status={n.status} label={STATUS_LABELS[n.status]} />
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">{n.ownerPhone}</div>
                      {lastEntry && (
                        <p className="text-[11px] text-slate-400 mt-1.5 truncate">
                          {lastEntry.direction === 'outbound' ? (isAr ? 'أنت: ' : 'You: ') : ''}{lastEntry.message}
                        </p>
                      )}
                    </div>
                    <ChevronRight size={14} className="text-slate-600 shrink-0 mt-1" />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Detail Panel */}
        <div className="bg-[#0a0f1d] border border-slate-800 rounded-xl overflow-hidden flex flex-col min-h-[500px] shadow-lg">
          {!selected ? (
            <EmptyState
              icon={MessageCircle}
              title={isAr ? "اختر محادثة لعرضها" : "Select a negotiation"}
              description={isAr ? "اختر أي مالك من القائمة الجانبية لبدء التفاعل وإجراء المفاوضات." : "Choose a thread from the list to view the conversation."}
            />
          ) : (
            <div className="flex flex-col flex-1">
              {/* Header */}
              <div className="px-5 py-4 border-b border-slate-850 space-y-3 shrink-0">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <UserCircle2 size={18} className="text-cyan-500" />
                    <span className="font-bold text-[14px] text-white">{selected.ownerName || (isAr ? 'مالك عقار' : 'Unnamed Owner')}</span>
                  </div>
                  <select
                    value={selected.status}
                    onChange={(e) => handleStatusChange(e.target.value as OwnerNegotiationStatus)}
                    className="text-xs font-semibold bg-slate-950 border border-slate-850 text-slate-300 rounded-md px-2.5 py-1.5 outline-none focus:border-cyan-500/50"
                  >
                    {STATUS_FORWARD_FLOW.map((s) => (
                      <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                    ))}
                    <option disabled>──────────</option>
                    <option value="rejected">{STATUS_LABELS.rejected}</option>
                    <option value="stale">{STATUS_LABELS.stale}</option>
                  </select>
                </div>

                <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-[11px] text-slate-400">
                  <span className="flex items-center gap-1.5"><Phone size={12} className="text-cyan-500" /> {selected.ownerPhone}</span>
                  {selected.unitId && (
                    <span className="flex items-center gap-1.5">
                      <Building2 size={12} className="text-cyan-500" /> {unitNames[selected.unitId] || selected.unitId}
                    </span>
                  )}
                  {selected.interestedLeadId && (
                    <span className="flex items-center gap-1.5">
                      <Users size={12} className="text-cyan-500" /> {isAr ? 'العميل: ' : 'Client: '} {leadNames[selected.interestedLeadId] || selected.interestedLeadId}
                    </span>
                  )}
                  <span className="flex items-center gap-1.5">
                    <Banknote size={12} className="text-cyan-500" /> {isAr ? 'المطلوب' : 'Asking'} {formatMoney(selected.askingPrice)} · {isAr ? 'عرضنا' : 'Offer'} {formatMoney(selected.currentOfferPrice)}
                  </span>
                </div>
              </div>

              {/* Chat messages */}
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 bg-slate-950/20 max-h-[400px]">
                {(!selected.history || selected.history.length === 0) ? (
                  <p className="text-center text-xs text-slate-500 py-10">{isAr ? 'لا توجد رسائل بعد.' : 'No messages yet.'}</p>
                ) : (
                  selected.history.map((entry, i) => (
                    <div key={i} className={`flex ${entry.direction === 'outbound' ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-[80%] rounded-xl px-4 py-2 text-xs ${
                          entry.direction === 'outbound'
                            ? 'bg-gradient-to-br from-cyan-600 to-blue-600 text-white rounded-br-none'
                            : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-none'
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{entry.message}</p>
                        {entry.price !== undefined && (
                          <p className={`text-[10px] font-bold mt-1 ${entry.direction === 'outbound' ? 'text-amber-300' : 'text-emerald-400'}`}>
                            {formatMoney(entry.price)}
                          </p>
                        )}
                        <p className="text-[9px] mt-1 text-slate-500 text-right">
                          {formatTimestamp(entry.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Composer */}
              <div className="px-5 py-4 border-t border-slate-850 shrink-0 space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={messageDraft}
                    onChange={(e) => setMessageDraft(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
                    placeholder={isAr ? "اكتب رسالة إلى المالك..." : "Type a message to the owner…"}
                    className="flex-1 px-4 py-2 bg-slate-950 border border-slate-850 rounded-lg text-xs text-white outline-none focus:border-cyan-500/50"
                  />
                  <input
                    type="number"
                    value={messagePrice}
                    onChange={(e) => setMessagePrice(e.target.value)}
                    placeholder={isAr ? "السعر المعروض" : "Price (optional)"}
                    className="w-28 px-3 py-2 bg-slate-950 border border-slate-850 rounded-lg text-xs text-white outline-none focus:border-cyan-500/50"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={sendingMessage || !messageDraft.trim()}
                    className="flex items-center justify-center p-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg transition disabled:opacity-50 cursor-pointer"
                  >
                    {sendingMessage ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                  </button>
                </div>
                <p className="text-[9px] text-slate-500">
                  {isAr 
                    ? 'يتم الإرسال عبر قائمة الانتظار المحددة الحصص للواتساب - التسليم متاح من الساعة 12 ظهراً وحتى 8 مساءً بتوقيت القاهرة.' 
                    : 'Sent via the quota-gated WhatsApp queue — delivered within the 12pm-8pm operating window.'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
