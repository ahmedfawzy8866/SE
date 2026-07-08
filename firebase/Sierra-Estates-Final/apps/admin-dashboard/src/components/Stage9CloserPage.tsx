import React, { useState, useEffect } from 'react';
import { api } from '../lib/apiClient';
import { AlertCircle, CheckCircle, RefreshCw, Plus, ArrowUpRight } from 'lucide-react';

interface Deal {
  id: string;
  client: string;
  phone: string;
  prop: string;
  value: string;
  stage: 'initial' | 'negotiation' | 'contract' | 'closed';
  prog: number;
  signed: boolean;
  deposit: boolean;
  c: string;
}

export default function Stage9CloserPage() {
  const [stageF, setStageF] = useState<string>('all');
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const STAGES = [
    { id: 'all', lbl: 'All Deals', c: '' },
    { id: 'initial', lbl: 'Initial Contact', c: '#E63946' },
    { id: 'negotiation', lbl: 'Negotiation', c: '#f59e0b' },
    { id: 'contract', lbl: 'Contract Draft', c: '#1E88D9' },
    { id: 'closed', lbl: 'Closed won', c: '#34D399' },
  ];

  const loadDeals = async () => {
    try {
      const res = await api.get<{ success: boolean; deals: Deal[] }>('/api/admin/closer/deals');
      if (res && res.deals) {
        setDeals(res.deals);
      }
    } catch (err) {
      console.error('Failed to load deals:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDeals();
  }, []);

  const handleFinalizeProposal = async (id: string) => {
    setActionLoading(id);
    try {
      await api.post('/api/closer/finalize', { dealId: id, proposalData: {} });
      await loadDeals();
    } catch (err) {
      console.error('Failed to finalize proposal:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleDocuSign = async (id: string, signed: boolean) => {
    if (signed) return;
    setActionLoading(id);
    try {
      await api.post('/api/closer/signing', { dealId: id });
      await loadDeals();
    } catch (err) {
      console.error('Failed to initiate signing:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleStripe = async (id: string, deposit: boolean) => {
    if (deposit) return;
    setActionLoading(id);
    try {
      await api.post('/api/closer/complete', { dealId: id });
      await loadDeals();
    } catch (err) {
      console.error('Failed to complete closing:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const filteredDeals = stageF === 'all' ? deals : deals.filter((d) => d.stage === stageF);
  const totalPipelineVal = deals.reduce((sum, d) => sum + parseFloat(d.value.replace(/[^\d.]/g, '') || '0'), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-6 h-6 text-cyan-400 animate-spin" />
        <span className="ml-3 text-sm text-slate-400 font-mono">Loading dynamic deals...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Counters Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 select-none">
        {STAGES.slice(1).map((s) => (
          <div
            key={s.id}
            className="bg-[#0a0f1d] border border-slate-800 rounded-xl p-4 flex flex-col justify-between"
            style={{ borderTop: `2px solid ${s.c}` }}
          >
            <div className="text-xl font-mono font-bold text-white pr-2 text-left">{deals.filter((d) => d.stage === s.id).length}</div>
            <div className="text-[9px] text-slate-500 font-mono uppercase tracking-wider mt-2.5">
              {s.lbl}
            </div>
          </div>
        ))}
      </div>

      {/* Pipeline Summary Bar */}
      <div className="bg-[#0a0f1d] border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row items-center gap-6 shadow-xl">
        <div className="shrink-0 select-none">
          <div className="text-[9px] font-mono uppercase tracking-widest text-slate-500 mb-1">
            Total Pipeline Capital
          </div>
          <div className="font-mono text-2xl font-bold text-white">
            EGP {totalPipelineVal.toFixed(1)}M
          </div>
        </div>

        {/* Proportional visual distribution */}
        <div className="flex-1 w-full flex h-2 rounded-full overflow-hidden bg-slate-850 relative">
          {deals.map((d) => {
            const val = parseFloat(d.value.replace(/[^\d.]/g, '') || '0') || 5;
            const pct = totalPipelineVal > 0 ? (val / totalPipelineVal) * 100 : 0;
            return (
              <div
                key={d.id}
                className="h-full transition-all duration-300"
                style={{ width: `${pct}%`, backgroundColor: d.c }}
                title={`${d.client}: ${d.value}`}
              />
            );
          })}
        </div>

        <button className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-black shadow-[0_0_15px_rgba(6,182,212,0.3)] rounded font-bold text-xs select-none transition duration-150 active:scale-95 cursor-pointer flex items-center gap-1">
          <Plus className="w-3.5 h-3.5" /> Register Deal
        </button>
      </div>

      {/* Stage Pills filter */}
      <div className="flex gap-2 flex-wrap items-center select-none">
        {STAGES.map((s) => {
          const isSelected = stageF === s.id;
          const count = s.id === 'all' ? deals.length : deals.filter((d) => d.stage === s.id).length;
          return (
            <button
              key={s.id}
              onClick={() => setStageF(s.id)}
              className={`px-3 py-1.5 text-xs font-mono rounded border transition duration-150 flex items-center gap-1.5 cursor-pointer hover:bg-white/10 ${
                isSelected
                  ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
                  : 'bg-[#0a0f1d] text-slate-400 border-slate-800'
              }`}
            >
              <span>{s.lbl}</span>
              <span className="text-[9px] bg-white/5 px-2 py-0.5 rounded-full text-white/50">{count}</span>
            </button>
          );
        })}
      </div>

      {/* Deals scroll log */}
      <div className="space-y-4">
        {filteredDeals.length === 0 ? (
          <div className="bg-[#0a0f1d] border border-slate-800 rounded-xl p-8 text-center text-slate-500 font-mono text-xs">
            No active pipeline deals registered.
          </div>
        ) : (
          filteredDeals.map((deal) => (
            <div
              key={deal.id}
              className="bg-[#0a0f1d] border border-slate-800 rounded-xl overflow-hidden shadow-xl"
              style={{ borderLeft: `3px solid ${deal.c}` }}
            >
              <div className="p-4 md:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5 shrink-0">
                  <div
                    className="w-11 h-11 rounded-full flex items-center justify-center font-bold text-base select-none shadow shrink-0"
                    style={{ backgroundColor: `${deal.c}20`, border: `1.5px solid ${deal.c}`, color: deal.c }}
                  >
                    {deal.client[0]?.toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-white transition duration-150 truncate">
                      {deal.client}
                    </div>
                    <div className="text-xs text-slate-400 truncate mt-0.5">{deal.prop}</div>
                  </div>
                </div>

                {/* Progress Slider */}
                <div className="flex-1 max-w-sm w-full md:mx-4">
                  <div className="flex justify-between font-mono text-[9px] text-slate-500 uppercase mb-1 select-none">
                    <span>Realtor Closer Progress</span>
                    <span>{deal.prog}% Complete</span>
                  </div>
                  <div className="w-full bg-slate-850 h-[4px] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${deal.prog}%`, backgroundColor: deal.c }}
                    />
                  </div>
                </div>

                <div className="flex flex-col md:items-end justify-center font-mono shrink-0 select-text">
                  <div className="text-base font-bold text-white">{deal.value}</div>
                  <div className="text-[9px] text-slate-500 uppercase tracking-wider mt-1">{deal.id}</div>
                </div>
              </div>

              {/* Bottom pills & interactions */}
              <div className="p-4 border-t border-slate-800 bg-slate-900/40 flex flex-wrap gap-2 items-center">
                <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full uppercase border shrink-0 ${
                  deal.stage === 'closed'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    : deal.stage === 'contract'
                    ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                    : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                }`}>
                  {deal.stage}
                </span>

                {deal.stage === 'initial' && (
                  <button
                    onClick={() => handleFinalizeProposal(deal.id)}
                    disabled={actionLoading !== null}
                    className="text-[9.5px] font-mono px-2 py-0.5 rounded border bg-amber-500/10 text-amber-500 border-amber-500/20 transition hover:brightness-105 shrink-0 cursor-pointer disabled:opacity-55 flex items-center gap-1"
                  >
                    Generate Proposal
                  </button>
                )}

                <button
                  onClick={() => handleToggleDocuSign(deal.id, deal.signed)}
                  disabled={actionLoading !== null || deal.stage === 'initial'}
                  className={`text-[9.5px] font-mono px-2 py-0.5 rounded border transition hover:brightness-105 shrink-0 cursor-pointer flex items-center gap-1 ${
                    deal.signed
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : 'bg-slate-900/40 text-slate-400 border-slate-800'
                  }`}
                >
                  {deal.signed ? (
                    <>
                      <CheckCircle className="w-3 h-3 text-emerald-400" /> DocuSign signed
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-3 h-3 text-slate-400" /> Pending DocuSign
                    </>
                  )}
                </button>

                <button
                  onClick={() => handleToggleStripe(deal.id, deal.deposit)}
                  disabled={actionLoading !== null || !deal.signed || deal.stage !== 'contract'}
                  className={`text-[9.5px] font-mono px-2 py-0.5 rounded border transition hover:brightness-105 shrink-0 cursor-pointer flex items-center gap-1 ${
                    deal.deposit
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      : 'bg-slate-900/40 text-slate-400 border-slate-800'
                  }`}
                >
                  {deal.deposit ? (
                    <>
                      <CheckCircle className="w-3 h-3 text-emerald-400" /> Stripe Escrow Paid
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-3 h-3 text-slate-400" /> Stripe Pending
                    </>
                  )}
                </button>

                <div className="md:ml-auto flex gap-1.5 shrink-0">
                  <a
                    href={`https://wa.me/${deal.phone.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-2.5 py-1 text-[9.5px] font-mono hover:bg-white/5 text-emerald-400 border border-slate-800 hover:border-emerald-500/30 rounded transition flex items-center gap-1"
                    id={`btn-talk-broker-${deal.id}`}
                  >
                    WhatsApp <ArrowUpRight className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
