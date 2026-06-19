import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, query, limit } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Lead, Listing, Agent } from '../types';
import { ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';
import DashboardWidgets from './DashboardWidgets';
import AgentLeaderboard from './AgentLeaderboard';

const CHART_DATA = [
  { month: 'Jan', deals: 35, revenue: 1.1 },
  { month: 'Feb', deals: 42, revenue: 1.4 },
  { month: 'Mar', deals: 38, revenue: 1.2 },
  { month: 'Apr', deals: 65, revenue: 2.1 },
  { month: 'May', deals: 55, revenue: 1.8 },
  { month: 'Jun', deals: 82, revenue: 2.6 },
  { month: 'Jul', deals: 97, revenue: 3.2 },
];

interface OverviewPageProps {
  T: (key: string) => string;
}

export default function OverviewPage({ T }: OverviewPageProps) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [listingsCount, setListingsCount] = useState<number>(1547);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen to Leads in Firestore
    const unsubLeads = onSnapshot(
      collection(db, 'leads'),
      (snap) => {
        const loaded: Lead[] = [];
        snap.forEach((doc) => {
          const d = doc.data();
          loaded.push({
            id: doc.id,
            name: d.name,
            phone: d.phone,
            interest: d.interest,
            stage: d.stage,
            color: d.color,
            hot: d.hot,
            createdAt: d.createdAt?.toDate ? d.createdAt.toDate() : new Date(),
            updatedAt: d.updatedAt?.toDate ? d.updatedAt.toDate() : new Date(),
          });
        });
        setLeads(loaded);
        setLoading(false);
      },
      (err) => {
        handleFirestoreError(err, OperationType.LIST, 'leads');
      }
    );

    // Listen to Listings count
    const unsubListings = onSnapshot(
      collection(db, 'listings'),
      (snap) => {
        setListingsCount(snap.size || 1547);
      },
      (err) => {
        handleFirestoreError(err, OperationType.LIST, 'listings');
      }
    );

    // Listen to Agents
    const unsubAgents = onSnapshot(
      collection(db, 'agents'),
      (snap) => {
        const loaded: Agent[] = [];
        snap.forEach((doc) => {
          const d = doc.data();
          loaded.push({
            id: doc.id,
            name: d.name,
            desc: d.desc,
            emoji: d.emoji,
            color: d.color,
            status: d.status,
            load: d.load,
            tasks: d.tasks,
            updatedAt: d.updatedAt?.toDate ? d.updatedAt.toDate() : new Date(),
          });
        });
        setAgents(loaded);
      },
      (err) => {
        handleFirestoreError(err, OperationType.LIST, 'agents');
      }
    );

    return () => {
      unsubLeads();
      unsubListings();
      unsubAgents();
    };
  }, []);

  // Compute stats
  const activeLeadsCount = leads.length;
  const hotLeads = leads.filter(l => l.hot);

  // Sparkline generator
  const renderSparkline = (spark: number[], color: string) => {
    const max = Math.max(...spark, 1);
    return (
      <div className="flex items-end gap-[2px] h-6 mt-2">
        {spark.map((v, i) => (
          <div
            key={i}
            className="flex-1 rounded-sm min-h-[3px] transition-all duration-300"
            style={{
              height: `${(v / max) * 100}%`,
              backgroundColor: i === spark.length - 1 ? color : `${color}40`
            }}
          />
        ))}
      </div>
    );
  };

  const CARD_STATS = [
    { val: listingsCount.toString(), lbl: T('totalListings'), delta: '+12% this week', up: true, color: '#06b6d4', spark: [42, 55, 48, 70, 62, 85, 95] },
    { val: activeLeadsCount.toString(), lbl: T('activeLeads'), delta: `+${hotLeads.length} hot today`, up: true, color: '#3b82f6', spark: [30, 45, 38, 55, 48, 70, 80] },
    { val: 'EGP 6.2M', lbl: T('avgDeal'), delta: '+5% MoM', up: true, color: '#10b981', spark: [55, 60, 52, 68, 65, 78, 88] },
    { val: '97', lbl: T('dealsClosed'), delta: 'This month', up: true, color: '#8b5cf6', spark: [20, 35, 28, 48, 42, 65, 75] },
  ];

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Cards stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {CARD_STATS.map((k, i) => (
          <div
            key={i}
            className="bg-[#0a0f1d] border border-slate-800 rounded-xl p-4 relative overflow-hidden group hover:border-cyan-500/30 transition-all duration-300 shadow-inner"
          >
            <div
              className="absolute left-0 top-0 bottom-0 w-[3px]"
              style={{ backgroundColor: k.color }}
            />
            <div className="text-2xl font-bold text-white tracking-tight">
              {k.val}
            </div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-slate-500 mt-1 select-none">
              {k.lbl}
            </div>
            <div className={`text-[9px] font-mono font-semibold mt-1 ${k.up ? 'text-green-400' : 'text-red-400'}`}>
              {k.up ? '↑' : '↓'} {k.delta}
            </div>
            {renderSparkline(k.spark, k.color)}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Step Funnel Chart */}
        <div className="bg-[#0a0f1d] border border-slate-800 rounded-xl overflow-hidden shadow-xl">
          <div className="px-5 py-4 border-b border-slate-805 bg-slate-900/40">
            <span className="font-mono text-[10px] uppercase tracking-wider text-cyan-400 font-bold select-none">
              {T('pipelineTitle')}
            </span>
          </div>
          <div className="p-5 flex items-end gap-2.5 h-[130px]">
            {['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7', 'S8', 'S9', 'S10'].map((s, i) => {
              const h = [95, 88, 82, 79, 74, 68, 61, 55, 42, 28][i];
              const c = ['#06b6d4', '#22d3ee', '#3b82f6', '#10b981', '#8b5cf6', '#ef4444', '#06b6d4', '#3b82f6', '#10b981', '#22d3ee'][i];
              return (
                <div key={s} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                  <div
                    className="w-full rounded-t-sm min-h-[4px] hover:brightness-110 transition duration-150 tooltip"
                    style={{
                      height: `${h}%`,
                      background: `linear-gradient(to top, ${c}25, ${c})`
                    }}
                    title={`${s}: ${h}%`}
                  />
                  <span className="font-mono text-[8px] text-slate-500 select-none">{s}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Hot Leads Section */}
        <div className="bg-[#0a0f1d] border border-slate-800 rounded-xl overflow-hidden shadow-xl flex flex-col">
          <div className="px-5 py-4 border-b border-slate-800 bg-slate-900/40 flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase tracking-wider text-cyan-400 font-bold select-none">
              {T('hotLeads')}
            </span>
            <span className="text-[9px] bg-red-500/10 text-red-500 border border-red-500/20 px-2 py-0.5 rounded-full font-bold">
              {hotLeads.length} Urgent
            </span>
          </div>
          <div className="flex-1 max-h-[160px] overflow-y-auto divide-y divide-slate-800/30">
            {loading ? (
              <div className="p-4 text-center font-mono text-[10px] text-slate-500">LOADING LEADS FROM FIRESTORE...</div>
            ) : hotLeads.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">No hot leads active currently.</div>
            ) : (
              hotLeads.slice(0, 5).map((l) => (
                <div key={l.id} className="p-3 flex items-center gap-3 hover:bg-white/5 transition">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs select-none shadow text-[#05080f] shrink-0"
                    style={{ backgroundColor: l.color || '#06b6d4' }}
                  >
                    {l.name[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-slate-200 truncate">{l.name}</div>
                    <div className="text-[10px] text-slate-400 truncate font-mono">{l.interest}</div>
                  </div>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full uppercase shrink-0 bg-cyan-950/30 border border-cyan-800 text-cyan-400">
                    {l.stage}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Agent Activity Tracker */}
        <div className="bg-[#0a0f1d] border border-slate-800 rounded-xl overflow-hidden shadow-xl">
          <div className="px-5 py-4 border-b border-slate-800 bg-slate-900/40">
            <span className="font-mono text-[10px] uppercase tracking-wider text-cyan-400 font-bold select-none">
              {T('agentStatus')}
            </span>
          </div>
          <div className="p-4 space-y-3.5 max-h-[160px] overflow-y-auto">
            {agents.slice(0, 4).map((a) => (
              <div key={a.id} className="flex items-center gap-2.5">
                <span className="text-base shrink-0 select-none">{a.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-semibold text-slate-200 truncate">{a.name}</span>
                    <span className={`text-[8px] font-mono tracking-wider uppercase font-bold px-1.5 rounded ${
                      a.status === 'Online' || a.status === 'Running' ? 'text-green-400' : 'text-amber-500'
                    }`}>
                      {a.status}
                    </span>
                  </div>
                  <div className="w-full bg-slate-850 rounded-full h-[3px] overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${a.load}%`, backgroundColor: a.color || '#06b6d4' }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recharts Dual-Axis Visualization */}
      <div className="bg-[#0a0f1d] border border-slate-800 rounded-xl overflow-hidden shadow-xl mt-6">
        <div className="px-5 py-4 border-b border-slate-800 bg-slate-900/40">
          <span className="font-mono text-[10px] uppercase tracking-wider text-cyan-400 font-bold select-none">
            {T('pipelineAndRevenueTrends') || 'PIPELINE & REVENUE TRENDS'}
          </span>
        </div>
        <div className="p-5 h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={CHART_DATA}
              margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
            >
              <CartesianGrid stroke="#1e293b" vertical={false} />
              <XAxis dataKey="month" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis yAxisId="left" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis yAxisId="right" orientation="right" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
              <RechartsTooltip 
                contentStyle={{ backgroundColor: '#0a0f1d', borderColor: '#1e293b', fontSize: '12px', color: '#f8fafc', borderRadius: '8px' }}
                itemStyle={{ color: '#06b6d4' }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Bar yAxisId="left" dataKey="deals" name="Monthly Deals Closed" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={40} />
              <Line yAxisId="right" type="monotone" dataKey="revenue" name="Revenue Pipeline (M)" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#0a0f1d' }} activeDot={{ r: 6 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Leads by source & Property Scatter */}
      <DashboardWidgets />

      {/* Agent Leaderboard */}
      <AgentLeaderboard />
    </div>
  );
}
