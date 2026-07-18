import React, { useEffect, useState, useMemo } from 'react';
import { collection, onSnapshot, addDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { api } from '../lib/apiClient';
import { Agent, ChatMessage } from '../types';
import HighlightText from './HighlightText';
import { motion } from 'motion/react';
import { recordAccess, getRelevanceScore } from '../utils/relevance';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  CartesianGrid
} from 'recharts';

interface AgentsPageProps {
  T: (key: string) => string;
  searchQuery?: string;
}

// Deterministic 30-day deal metrics resolver for agents
const getDeals30DaysForAgent = (agentId: string, agentName: string): number => {
  const name = agentName.toLowerCase();
  if (name.includes('sierra')) return 95;
  if (name.includes('leila') || name.includes('lola')) return 72;
  if (name.includes('closer')) return 138;
  if (name.includes('scraper')) return 24;
  if (name.includes('scribe')) return 41;
  if (name.includes('curator')) return 58;
  
  // Dynamic deterministic fallback based on string hash
  let hash = 0;
  for (let i = 0; i < agentId.length; i++) {
    hash = agentId.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash % 85) + 15;
};

// Custom premium Tooltip matching Sierra OS Dark/Light schema
interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-slate-950/95 dark:bg-[#0b1329]/95 border border-slate-200 dark:border-slate-800 p-3 rounded-lg shadow-xl backdrop-blur-md">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-sm">{data.emoji}</span>
          <span className="text-xs font-bold text-slate-900 dark:text-white font-sans">{label}</span>
        </div>
        <div className="text-[11px] font-mono space-y-1 text-slate-600 dark:text-slate-350">
          <div className="flex justify-between gap-6">
            <span>Deals Closed (30d):</span>
            <span className="font-bold text-cyan-600 dark:text-cyan-400">{data.deals}</span>
          </div>
          <div className="flex justify-between gap-6">
            <span>Total Tasks:</span>
            <span className="font-semibold text-slate-700 dark:text-white">{data.tasks.toLocaleString()}</span>
          </div>
          <div className="flex justify-between gap-6">
            <span>Current Load:</span>
            <span className="font-semibold text-slate-700 dark:text-white">{data.load}%</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};


export default function AgentsPage({ T, searchQuery = '' }: AgentsPageProps) {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [sending, setSending] = useState(false);
  const [sortByRelevance, setSortByRelevance] = useState<boolean>(true);
  const [accessUpdateTrigger, setAccessUpdateTrigger] = useState<number>(0);

  useEffect(() => {
    const handleUpdate = () => {
      setAccessUpdateTrigger(prev => prev + 1);
    };
    window.addEventListener('sierra_access_updated', handleUpdate);
    return () => window.removeEventListener('sierra_access_updated', handleUpdate);
  }, []);

  const refreshAgents = async () => {
    try {
      const { agents: loaded } = await api.get<{ agents: any[] }>('/api/admin/agents');
      setAgents(loaded.map((d) => ({ ...d, updatedAt: d.updatedAt ? new Date(d.updatedAt) : new Date() })));
    } catch (err) {
      console.error('Failed to fetch agents:', err);
    }
  };

  // Backend-polled agent status (replaces Firestore onSnapshot — see ARCHITECTURE_INTEGRATION.md).
  useEffect(() => {
    refreshAgents();
    const interval = setInterval(refreshAgents, 15000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Chat log stays on direct Firestore for now (deferred Phase B — see ARCHITECTURE_INTEGRATION.md).
    const unsubChats = onSnapshot(collection(db, 'chats'), (snap) => {
      const messages: ChatMessage[] = [];
      snap.forEach((doc) => {
        const d = doc.data();
        messages.push({
          id: doc.id,
          sender: d.sender,
          text: d.text,
          timestamp: d.timestamp?.toDate ? d.timestamp.toDate() : new Date(),
        });
      });
      // Sort oldest to newest
      messages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
      setChatMessages(messages);
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, 'chats');
    });

    return () => unsubChats();
  }, []);

  const filteredAgents = useMemo(() => {
    let res = agents;
    if (searchQuery) {
      const qLower = searchQuery.toLowerCase();
      res = agents.filter((a) => {
        const statusKey = a.status.toLowerCase();
        const statusTranslated = T(statusKey);
        return (
          a.name.toLowerCase().includes(qLower) ||
          (a.desc && a.desc.toLowerCase().includes(qLower)) ||
          a.status.toLowerCase().includes(qLower) ||
          statusTranslated.toLowerCase().includes(qLower)
        );
      });
    }

    if (sortByRelevance && searchQuery) {
      return [...res].sort((a, b) => {
        const scoreA = getRelevanceScore(a.id);
        const scoreB = getRelevanceScore(b.id);
        if (scoreB !== scoreA) {
          return scoreB - scoreA;
        }
        return b.load - a.load; // tie-breaker
      });
    }

    return res;
  }, [agents, searchQuery, T, sortByRelevance, accessUpdateTrigger]);

  const chartData = useMemo(() => {
    return agents.map(a => ({
      name: a.name,
      deals: getDeals30DaysForAgent(a.id, a.name),
      tasks: a.tasks,
      load: a.load,
      emoji: a.emoji,
      color: a.color || '#06b6d4'
    })).sort((a, b) => b.deals - a.deals);
  }, [agents]);

  const handleRestart = async (agent: Agent) => {
    try {
      recordAccess(agent.id, 'agents');
      // Toggle status to Running, loads 100% then drops
      await api.patch(`/api/admin/agents/${agent.id}`, { status: 'Running', load: 100 });
      await refreshAgents();
      setTimeout(async () => {
        await api.patch(`/api/admin/agents/${agent.id}`, {
          status: 'Online',
          load: Math.floor(Math.random() * 30) + 50,
        });
        await refreshAgents();
      }, 1500);
    } catch (err) {
      console.error(`Failed to restart agent ${agent.id}:`, err);
    }
  };

  const submitChatMessage = async () => {
    const text = chatInput.trim();
    if (!text || sending) return;
    setSending(true);
    setChatInput('');

    try {
      // Add user message
      await addDoc(collection(db, 'chats'), {
        sender: 'user',
        text,
        timestamp: new Date()
      });

      // Simple real-time chatbot response simulation
      setTimeout(async () => {
        let reply = "Processing instructions under Intelligence protocol...";
        if (text.toLowerCase().includes('hyde park') || text.includes('هايد بارك')) {
          reply = "Lola/Leila: We currently index 3 exquisite villas in Hyde Park starting from EGP 18.5M. Shall I draft the dossier?";
        } else if (text.toLowerCase().includes('villa') || text.includes('فيلا')) {
          reply = "Sierra AI: Understood. Scanning high-AVM New Cairo inventory matching private pool requests...";
        }

        await addDoc(collection(db, 'chats'), {
          sender: 'ai',
          text: reply,
          timestamp: new Date()
        });
        setSending(false);
      }, 1200);

    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'chats');
      setSending(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      {searchQuery && (
        <div className="flex items-center justify-between border-b border-slate-800/60 pb-3 flex-wrap gap-2">
          <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
            Search Results Sorted By Profile Activity
          </div>
          <button
            onClick={() => setSortByRelevance(!sortByRelevance)}
            className={`px-3 py-1.5 rounded text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer border ${
              sortByRelevance
                ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30'
                : 'bg-[#0a0f1d]/40 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            <span>🎯</span>
            <span>Sort by Relevance</span>
          </button>
        </div>
      )}

      {/* Agent Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {filteredAgents.map((a) => {
          const isActive = activeId === a.id;
          return (
            <motion.div
              layout
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              key={a.id}
              className={`bg-[#0a0f1d] border rounded-xl p-4 transition-all duration-300 relative cursor-pointer ${
                isActive ? 'border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.15)]' : 'border-slate-800 hover:border-cyan-500/30'
              }`}
              onClick={() => {
                setActiveId(isActive ? null : a.id);
                recordAccess(a.id, 'agents');
              }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-lg mb-3 shadow"
                style={{ backgroundColor: `${a.color}15`, border: `1px solid ${a.color}30` }}
              >
                {a.emoji}
              </div>

              <div className="flex justify-between items-start mb-1">
                <div className="text-xs font-bold text-white tracking-wide flex items-center gap-1.5 flex-wrap">
                  <HighlightText text={a.name} highlight={searchQuery} />
                  {getRelevanceScore(a.id) > 0 && (
                    <span className="inline-flex items-center gap-0.5 px-1 py-0.5 rounded bg-cyan-950/60 border border-cyan-800/40 text-[8px] font-mono text-cyan-400 font-medium cursor-help" title={`Relevance Score: ${getRelevanceScore(a.id)}`}>
                      🎯 {getRelevanceScore(a.id)}
                    </span>
                  )}
                </div>
                <span className={`text-[8px] font-mono tracking-wider uppercase font-bold py-0.5 px-2 rounded-full flex items-center gap-1 ${
                  a.status === 'Online' || a.status === 'Running'
                    ? 'bg-green-500/10 text-green-400'
                    : 'bg-amber-500/10 text-amber-550'
                }`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                  <HighlightText text={T(a.status.toLowerCase()) || a.status} highlight={searchQuery} />
                </span>
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed mb-4 min-h-[32px]">
                <HighlightText text={a.desc} highlight={searchQuery} />
              </p>

              {/* Loader Slider */}
              <div className="space-y-1">
                <div className="flex justify-between font-mono text-[9px] text-slate-500 select-none">
                  <span>{T('load')}</span>
                  <span className="font-bold text-white" style={{ color: a.color }}>
                    {a.load}%
                  </span>
                </div>
                <div className="w-full bg-slate-850 rounded-full h-[4px] overflow-hidden">
                  <div
                     className="h-full rounded-full transition-all duration-500"
                     style={{ width: `${a.load}%`, backgroundColor: a.color || '#06b6d4' }}
                  />
                </div>
              </div>

              <div className="flex justify-between font-mono text-[9px] text-slate-500 mt-3 border-t border-slate-800 pt-2 select-none">
                <span>{T('totalTasks')}</span>
                <span className="font-bold text-white">{a.tasks.toLocaleString()}</span>
              </div>

              {isActive && (
                <div
                  className="mt-4 pt-3 border-t border-slate-800 flex gap-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button className="flex-1 py-1 px-2 hover:bg-white/5 border border-slate-800 text-[10px] uppercase font-mono tracking-wider text-slate-400 hover:text-white rounded-md transition duration-150 cursor-pointer">
                    ⚙️ CONFIG
                  </button>
                  <button className="flex-1 py-1 px-2 hover:bg-white/5 border border-slate-800 text-[10px] uppercase font-mono tracking-wider text-slate-400 hover:text-white rounded-md transition duration-150 cursor-pointer">
                    📋 LOGS
                  </button>
                  <button
                    onClick={() => handleRestart(a)}
                    className="flex-1 py-1 px-2 bg-green-500/15 border border-green-500/20 text-[10px] uppercase font-mono tracking-wider text-green-400 font-bold rounded-md hover:bg-green-500/25 transition duration-150 cursor-pointer"
                  >
                    🔁 REBOOT
                  </button>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* 30-Day Agent Performance Analytics Chart Card */}
      <div className="bg-[#0a0f1d] border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slash-slate border-slate-850/60 pb-4">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-white tracking-wide flex items-center gap-2 select-none">
              <span>📈</span> 30-Day Closed Deals Pipeline
            </h3>
            <p className="text-[11px] text-slate-400">
              Comparative representation of finalized transaction pipelines processed by intelligent node agents in the last 30 days.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest font-bold">
              Automated Telemetry
            </span>
          </div>
        </div>

        {chartData.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-slate-500 text-xs font-mono select-none">
            <span>Waiting for agent telemetry records...</span>
          </div>
        ) : (
          <div className="w-full h-64 sm:h-72 pr-2 pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 10, right: 10, left: -25, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'monospace' }}
                  tickFormatter={(name) => (name.length > 14 ? `${name.substring(0, 12)}...` : name)}
                  tickLine={{ stroke: '#334155' }}
                  axisLine={{ stroke: '#334155' }}
                />
                <YAxis
                  tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'monospace' }}
                  tickLine={{ stroke: '#334155' }}
                  axisLine={{ stroke: '#334155' }}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255, 255, 255, 0.03)' }} />
                <Bar dataKey="deals" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.85} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Live Chat Emulator at the bottom */}
      <div className="bg-[#0a0f1d] border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/40">
          <span className="font-mono text-[10px] uppercase tracking-wider text-cyan-400 font-bold select-none">
            🐪 Lola · Live Ingestion Sandbox
          </span>
          <span className="text-[9px] bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-0.5 rounded-full font-bold">
            ONLINE
          </span>
        </div>
        <div className="p-5 flex flex-col h-[280px]">
          {/* Scrollable messages log */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar mb-4 text-xs font-mono">
            {chatMessages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-1.5 select-none">
                <span className="text-2xl font-sans">🐪</span>
                <p>Interactive Lola Arabic/English channel offline</p>
                <p className="text-[10px]">Type instructions below to verify live chat database bindings</p>
              </div>
            ) : (
              chatMessages.map((m) => {
                const isAi = m.sender === 'ai';
                return (
                  <div key={m.id} className={`flex max-w-[85%] ${isAi ? 'self-start mr-auto' : 'ml-auto text-right'}`}>
                    <div
                      className={`p-3 rounded-xl shadow-sm leading-relaxed text-xs ${
                        isAi
                          ? 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-sm'
                          : 'bg-cyan-500 text-black rounded-tr-sm font-semibold'
                      }`}
                    >
                      {m.text}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Typing area */}
          <div className="flex gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && submitChatMessage()}
              placeholder="Query Lola e.g., 'Hyde Park villa above 15m'..."
              className="flex-1 bg-slate-900/60 border border-slate-800 rounded px-4 py-2 text-xs text-white outline-none focus:border-cyan-500/50 transition duration-150"
            />
            <button
               onClick={submitChatMessage}
               disabled={sending || !chatInput.trim()}
               className="px-5 py-2 bg-cyan-500 hover:bg-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)] text-black rounded font-bold text-xs select-none transition active:scale-95 duration-100 disabled:opacity-40 disabled:scale-100 cursor-pointer"
            >
              {sending ? '...' : T('sendMsg')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
