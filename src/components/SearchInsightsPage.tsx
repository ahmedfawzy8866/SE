import React, { useState, useEffect, useMemo } from 'react';
import { collection, onSnapshot, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { SearchLog } from '../types';
import { motion } from 'motion/react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  CartesianGrid
} from 'recharts';

interface SearchInsightsPageProps {
  T: (key: string) => string;
  isAr?: boolean;
}

export default function SearchInsightsPage({ T, isAr = false }: SearchInsightsPageProps) {
  const [searches, setSearches] = useState<SearchLog[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Local UI filters
  const [scopeFilter, setScopeFilter] = useState<'all' | 'leads' | 'listings' | 'agents' | 'workflows'>('all');
  const [methodFilter, setMethodFilter] = useState<'all' | 'voice' | 'typed'>('all');

  // Real-time listener for the searches collection
  useEffect(() => {
    const searchesCol = collection(db, 'searches');
    const unsub = onSnapshot(searchesCol, (snapshot) => {
      const logs: SearchLog[] = [];
      snapshot.forEach((doc) => {
        const d = doc.data();
        logs.push({
          id: doc.id,
          query: d.query || '',
          scope: d.scope || 'all',
          timestamp: d.timestamp?.toDate ? d.timestamp.toDate() : new Date(d.timestamp || Date.now()),
          userId: d.userId || 'anonymous',
          isVoice: !!d.isVoice,
        });
      });
      
      // Sort logs by newest first
      logs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      setSearches(logs);
      setLoading(false);
    }, (err) => {
      console.error("Searches loading failed:", err);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  // Quick Seed helper to give users a rich interactive experience right out of the box
  const seedMockSearches = async () => {
    setLoading(true);
    const mockSearches = [
      { query: 'Cairo Festival City', scope: 'listings', isVoice: true, offsetMin: 5 },
      { query: 'Apartment with pool', scope: 'listings', isVoice: false, offsetMin: 12 },
      { query: 'New Giza Mansion', scope: 'listings', isVoice: true, offsetMin: 22 },
      { query: 'Mohamed Salah', scope: 'agents', isVoice: false, offsetMin: 35 },
      { query: 'Send WhatsApp contract', scope: 'workflows', isVoice: true, offsetMin: 48 },
      { query: 'Hot buyers', scope: 'leads', isVoice: false, offsetMin: 65 },
      { query: 'AI lead qualification', scope: 'workflows', isVoice: true, offsetMin: 80 },
      { query: 'Villas in Marassi', scope: 'listings', isVoice: false, offsetMin: 95 },
      { query: 'Viewing scheduled', scope: 'leads', isVoice: false, offsetMin: 120 },
      { query: 'Zayed Regency 3-bed', scope: 'listings', isVoice: true, offsetMin: 140 },
      { query: 'Nader Omar', scope: 'agents', isVoice: false, offsetMin: 180 },
      { query: 'Auto matching system', scope: 'workflows', isVoice: false, offsetMin: 220 },
      { query: 'Abdelrahman Fawzy', scope: 'agents', isVoice: true, offsetMin: 260 },
      { query: 'Contract draft approved', scope: 'leads', isVoice: false, offsetMin: 300 },
      { query: 'Villas in Marassi', scope: 'listings', isVoice: true, offsetMin: 350 },
      { query: 'Cairo Festival City', scope: 'listings', isVoice: false, offsetMin: 400 },
      { query: 'Zayed Regency 3-bed', scope: 'listings', isVoice: false, offsetMin: 450 },
      { query: 'Mohamed Salah', scope: 'agents', isVoice: true, offsetMin: 500 },
      { query: 'Cairo Festival City', scope: 'listings', isVoice: true, offsetMin: 550 },
      { query: 'Hot buyers', scope: 'leads', isVoice: true, offsetMin: 600 },
    ];

    try {
      for (const s of mockSearches) {
        await addDoc(collection(db, 'searches'), {
          query: s.query,
          scope: s.scope,
          isVoice: s.isVoice,
          timestamp: new Date(Date.now() - s.offsetMin * 60000),
          userId: 'seed-runner'
        });
      }
    } catch (e) {
      console.error('Failed to seed searches:', e);
    }
    setLoading(false);
  };

  // Filter logs
  const filteredSearches = useMemo(() => {
    return searches.filter((item) => {
      const matchScope = scopeFilter === 'all' || item.scope === scopeFilter;
      const matchMethod = methodFilter === 'all' || 
        (methodFilter === 'voice' && item.isVoice) || 
        (methodFilter === 'typed' && !item.isVoice);
      return matchScope && matchMethod;
    });
  }, [searches, scopeFilter, methodFilter]);

  // Aggregate word frequencies and trends (by comparing youngest half of dataset vs older half)
  const chartData = useMemo(() => {
    const frequencies: { 
      [key: string]: { 
        count: number; 
        voiceCount: number; 
        scope: string; 
        recentHalfCount: number; 
        olderHalfCount: number; 
      } 
    } = {};
    
    const midPoint = Math.ceil(filteredSearches.length / 2);
    
    filteredSearches.forEach((item, idx) => {
      const q = item.query.trim();
      if (!q) return;
      const key = q.toLowerCase();
      if (!frequencies[key]) {
        frequencies[key] = { 
          count: 0, 
          voiceCount: 0, 
          scope: item.scope,
          recentHalfCount: 0,
          olderHalfCount: 0
        };
      }
      frequencies[key].count += 1;
      if (item.isVoice) {
        frequencies[key].voiceCount += 1;
      }
      
      // Since filteredSearches are sorted newest first, the lower indices are more recent
      if (idx < midPoint) {
        frequencies[key].recentHalfCount += 1;
      } else {
        frequencies[key].olderHalfCount += 1;
      }
    });

    return Object.entries(frequencies)
      .map(([key, info]) => {
        // Find matching raw string format with maximum occurrence
        const rawMatch = filteredSearches.find(s => s.query.toLowerCase() === key)?.query || key;
        
        let trend: 'up' | 'down' | 'stable' = 'stable';
        if (info.recentHalfCount > info.olderHalfCount) {
          trend = 'up';
        } else if (info.recentHalfCount < info.olderHalfCount) {
          trend = 'down';
        }

        return {
          name: rawMatch,
          count: info.count,
          voiceCount: info.voiceCount,
          scope: info.scope,
          trend: trend
        };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Top 10 queries
  }, [filteredSearches]);

  // Insights statistics calculation
  const stats = useMemo(() => {
    const total = filteredSearches.length;
    const voice = filteredSearches.filter(s => s.isVoice).length;
    
    // Most popular category from logs
    const categoryCounts: { [key: string]: number } = {};
    filteredSearches.forEach(s => {
      categoryCounts[s.scope] = (categoryCounts[s.scope] || 0) + 1;
    });
    
    let popularCat = 'n/a';
    let maxCount = 0;
    Object.entries(categoryCounts).forEach(([cat, count]) => {
      if (count > maxCount) {
        maxCount = count;
        popularCat = cat;
      }
    });

    return {
      total,
      voice,
      voicePercent: total > 0 ? Math.round((voice / total) * 100) : 0,
      popularCat: popularCat === 'all' ? 'All categories' : popularCat
    };
  }, [filteredSearches]);

  return (
    <div className="space-y-6" id="search-insights-dashboard-root">
      
      {/* Header and Seeding Block */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-6 bg-[#0c1328]/70 border border-slate-800/80 rounded-xl gap-4">
        <div>
          <h1 className="text-xl font-bold font-sans text-white tracking-tight flex items-center gap-2">
            📊 {isAr ? "تحليلات البحث والعمليات" : "CRM Search Insights"}
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            {isAr 
              ? "حلل عمليات البحث الأكثر تكراراً للتعرف على اهتمامات الوكلاء واستعلاماتهم الشائعة في الوقت الفعلي."
              : "Discover what CRM properties and inquiries real-estate brokers search for the most. Log voice and typed queries dynamically."}
          </p>
        </div>

        {searches.length === 0 && !loading && (
          <button
            onClick={seedMockSearches}
            className="px-3.5 py-1.5 text-[11px] font-mono text-cyan-400 bg-cyan-500/10 hover:bg-cyan-500/20 rounded border border-cyan-500/30 transition-all font-semibold uppercase animate-pulse flex items-center gap-1.5 shrink-0"
            id="btn-seed-search-telemetry"
          >
            ⚡ {isAr ? 'توليد عينة بيانات بحث' : 'Seed Sample Insights Data'}
          </button>
        )}
      </div>

      {/* Grid of Key Performance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Metric 1 */}
        <div className="p-5 bg-gradient-to-br from-[#0c1328]/90 to-[#0e1730]/90 border border-slate-800/80 rounded-xl relative overflow-hidden">
          <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold">
            {isAr ? "إجمالي عمليات البحث" : "TOTAL CRM QUERIES LOGGED"}
          </div>
          <div className="text-3xl font-extrabold text-white mt-1.5 font-mono flex items-baseline gap-2">
            {stats.total}
            <span className="text-[10px] font-normal text-slate-400 font-sans">
              {isAr ? "استعلام تم رصده" : "queries tracked"}
            </span>
          </div>
          <div className="absolute right-4 bottom-4 text-3xl font-bold opacity-10 select-none">🔍</div>
        </div>

        {/* Metric 2 */}
        <div className="p-5 bg-gradient-to-br from-[#0c1328]/90 to-[#0e1730]/90 border border-slate-800/80 rounded-xl relative overflow-hidden">
          <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold">
            {isAr ? "البحث بالصوت" : "VOICE CONTROL ADOPTION"}
          </div>
          <div className="text-3xl font-extrabold text-red-400 mt-1.5 font-mono flex items-baseline gap-2">
            {stats.voicePercent}%
            <span className="text-[10px] font-normal text-slate-400 font-sans">
              ({stats.voice} {isAr ? "بحث صوتي" : "voice searches"})
            </span>
          </div>
          <div className="absolute right-4 bottom-4 text-3xl font-bold opacity-10 select-none">🎙️</div>
        </div>

        {/* Metric 3 */}
        <div className="p-5 bg-gradient-to-br from-[#0c1328]/90 to-[#0e1730]/90 border border-slate-800/80 rounded-xl relative overflow-hidden">
          <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold">
            {isAr ? "الفئة الأكثر رواجاً" : "HOTTEST CATEGORY RANGE"}
          </div>
          <div className="text-xl font-bold text-cyan-400 mt-2 font-mono uppercase truncate">
            {stats.popularCat === 'leads' ? T('leads') :
             stats.popularCat === 'listings' ? T('listings') :
             stats.popularCat === 'agents' ? T('agents') :
             stats.popularCat === 'workflows' ? T('workflows') :
             'n/a'}
          </div>
          <div className="absolute right-4 bottom-4 text-3xl font-bold opacity-10 select-none">🏢</div>
        </div>
      </div>

      {/* Main Bar Chart Panel */}
      <div className="p-5 bg-[#0a0f1d] border border-slate-800/80 rounded-xl" id="insights-charts-card">
        {/* Interactive Filters Toolbar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-800/60 pb-4 mb-5">
          <div>
            <h3 className="text-xs font-bold text-white font-mono uppercase tracking-wider">
              📈 {isAr ? "الكلمات الأكثر تكراراً" : "Most Searched Analytics Keywords"}
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {isAr ? "تحليل الكلمات المفتاحية الـ 10 الأولى التي تكرر استخدامها." : "Analyzing top 10 CRM queries categorized by frequency and search context."}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Scope dropdown */}
            <select
              value={scopeFilter}
              onChange={(e) => setScopeFilter(e.target.value as any)}
              className="px-2.5 py-1 bg-slate-900 border border-slate-800 rounded text-[11px] font-mono text-slate-300 focus:outline-none focus:border-cyan-500"
            >
              <option value="all">🌐 {isAr ? 'جميع الفئات' : 'All Fields'}</option>
              <option value="leads">👤 {T('leads')}</option>
              <option value="listings">🏢 {T('listings')}</option>
              <option value="agents">🤖 {T('agents')}</option>
              <option value="workflows">⚡ {T('workflows')}</option>
            </select>

            {/* Input method selection button */}
            <div className="flex items-center border border-slate-800 bg-slate-950/80 p-0.5 rounded text-[10px] font-mono">
              {[
                { id: 'all', label: isAr ? 'الكل' : 'All' },
                { id: 'voice', label: isAr ? 'صوت' : 'Voice' },
                { id: 'typed', label: isAr ? 'لوحة المفاتيح' : 'Typed' },
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => setMethodFilter(m.id as any)}
                  className={`px-2 py-0.5 rounded transition ${
                    methodFilter === m.id
                      ? 'bg-cyan-500/15 text-cyan-400 font-bold border border-cyan-500/20'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Recharts Bar Chart UI */}
        {loading ? (
          <div className="h-64 flex items-center justify-center text-xs font-mono text-slate-500">
            {isAr ? 'جاري تحميل البيانات الفورية...' : 'Loading analytics logs...'}
          </div>
        ) : chartData.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-center p-6 border border-dashed border-slate-800/60 rounded-lg">
            <span className="text-2xl mb-2">🔍</span>
            <div className="text-xs font-mono text-slate-400 font-semibold">
              {isAr ? "لا توجد عمليات بحث تطابق معايير التصفية" : "No matching query telemetry logged yet"}
            </div>
            <p className="text-[10px] text-slate-500 max-w-xs mt-1">
              {isAr
                ? "ابدأ بكتابة كلمات في شريط البحث بالأعلى أو جرب البحث الصوتي لتسجيل البيانات."
                : "Try typing multiple keyword terms in the top search bar or testing voice queries to populate analytics."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chart Block */}
            <div className="lg:col-span-2 h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.3} />
                  <XAxis 
                    dataKey="name" 
                    stroke="#64748b" 
                    fontSize={10} 
                    fontFamily="monospace"
                    tickLine={false} 
                  />
                  <YAxis 
                    stroke="#64748b" 
                    fontSize={10} 
                    fontFamily="monospace"
                    allowDecimals={false}
                    tickLine={false} 
                  />
                  <Tooltip
                    cursor={{ fill: 'rgba(255, 255, 255, 0.03)' }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-[#0b101f] border border-slate-800 p-2.5 rounded shadow-xl text-[11px] font-mono">
                            <p className="text-white font-bold mb-1">"{data.name}"</p>
                            <p className="text-cyan-400">{isAr ? 'إجمالي البحث:' : 'Total Queries:'} <span className="font-bold">{data.count}</span></p>
                            <p className="text-red-400">{isAr ? 'منها بالصوت:' : 'Voice-triggered:'} <span className="font-bold">{data.voiceCount}</span></p>
                            <p className={`${
                              data.trend === 'up' ? 'text-emerald-400' :
                              data.trend === 'down' ? 'text-rose-400' :
                              'text-slate-400'
                            }`}>
                              {isAr ? 'الاتجاه:' : 'Trend:'}{' '}
                              <span className="font-bold text-xs">
                                {data.trend === 'up' ? '▲ (صاعد)' :
                                 data.trend === 'down' ? '▼ (هابط)' :
                                 '■ (مستقر)'}
                              </span>
                            </p>
                            <p className="text-slate-500 text-[10px] mt-1 capitalize">Category: {data.scope}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, index) => {
                      // Custom colors per matching search category
                      let barColor = '#06b6d4'; // listings / default cyan
                      if (entry.scope === 'leads') barColor = '#ef4444';
                      if (entry.scope === 'agents') barColor = '#10b981';
                      if (entry.scope === 'workflows') barColor = '#3b82f6';
                      return <Cell key={`cell-${index}`} fill={barColor} opacity={0.85} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Keyword Trends Leaderboard */}
            <div className="bg-slate-950/40 border border-slate-800/60 rounded-lg p-4 flex flex-col justify-between" id="insights-keyword-leaderboard">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold block mb-3">
                  🔥 {isAr ? "صدارة الكلمات والاتجاهات" : "Leaderboard & Popularity Trends"}
                </span>

                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {chartData.map((entry, index) => (
                    <div key={`entry-${index}`} className="flex items-center justify-between p-2 bg-slate-900/30 border border-slate-800/40 rounded hover:bg-slate-900/60 transition">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-mono text-[10px] font-bold text-slate-500">#{index + 1}</span>
                        <div className="min-w-0">
                          <p className="text-[11px] text-white font-bold truncate">"{entry.name}"</p>
                          <span className="text-[9px] font-mono text-slate-500 block truncate uppercase">{entry.scope}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] font-mono text-slate-300 font-bold bg-slate-800 px-1.5 py-0.5 rounded">
                          {entry.count}
                        </span>

                        {entry.trend === 'up' && (
                          <span 
                            className="flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 font-mono" 
                            title={isAr ? "شعبية متزايدة" : "Popularity Increasing"}
                          >
                            ▲ {isAr ? 'صعود' : 'Up'}
                          </span>
                        )}
                        {entry.trend === 'down' && (
                          <span 
                            className="flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-400 font-mono" 
                            title={isAr ? "شعبية منخفضة" : "Popularity Decreasing"}
                          >
                            ▼ {isAr ? 'هبوط' : 'Down'}
                          </span>
                        )}
                        {entry.trend === 'stable' && (
                          <span 
                            className="flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-400 font-mono" 
                            title={isAr ? "شعبية مستقرة" : "Popularity Stable"}
                          >
                            ■ {isAr ? 'مستقر' : 'Stable'}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="text-[9px] font-mono text-slate-500 uppercase tracking-tight text-center mt-3 pt-2 border-t border-slate-800/30">
                {isAr ? "نشاط مقارنة فترات البحث" : "Based on timeline metrics analysis"}
              </div>
            </div>
          </div>
        )}

        {/* Color Legend */}
        {chartData.length > 0 && (
          <div className="flex flex-wrap items-center gap-4 mt-4 pt-4 border-t border-slate-800/40 text-[9px] font-mono text-slate-500 uppercase justify-center">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-cyan-500/80" /> {T('listings')}</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500/80" /> {T('leads')}</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" /> {T('agents')}</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500/80" /> {T('workflows')}</span>
          </div>
        )}
      </div>

      {/* Grid: Live Activity Stream and Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        {/* Real-time Activity Feed */}
        <div className="p-5 bg-[#0a0f1d] border border-slate-800/80 rounded-xl flex flex-col h-96">
          <div className="mb-4">
            <h3 className="text-xs font-bold text-white font-mono uppercase tracking-wider">
              📡 {isAr ? "سجل الاستعلامات المباشر" : "Live Query Activity Feed"}
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {isAr ? "قائمة فورية لعمليات البحث التي رصدتها المنصة." : "Continuous activity and inputs logged dynamically by active CRM brokers."}
            </p>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 text-xs">
            {filteredSearches.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-500 font-mono text-[11px]">
                {isAr ? 'لا توجد سجلات بعد...' : 'No telemetry data logged.'}
              </div>
            ) : (
              filteredSearches.map((item) => (
                <div 
                  key={item.id} 
                  className="flex items-center justify-between p-2.5 bg-slate-900/40 border border-slate-800/60 rounded-md hover:bg-slate-900/80 transition"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-bold font-mono">"{item.query}"</span>
                      {item.isVoice && (
                        <span className="text-[9px] bg-red-500/15 border border-red-500/25 text-red-400 px-1.5 py-0.2 rounded font-mono uppercase font-bold flex items-center gap-0.5">
                          🎙️ {isAr ? 'صوت' : 'Voice'}
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono flex items-center gap-1.5">
                      <span>User ID: {item.userId?.substring(0, 8)}...</span>
                      <span>•</span>
                      <span>
                        {item.timestamp.toLocaleTimeString(isAr ? 'ar-EG' : 'en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                    </div>
                  </div>

                  <span className={`text-[9px] px-2 py-0.5 rounded border uppercase font-mono tracking-wider font-semibold ${
                    item.scope === 'leads' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                    item.scope === 'listings' ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' :
                    item.scope === 'agents' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                    'bg-blue-500/10 text-blue-400 border-blue-500/20'
                  }`}>
                    {item.scope === 'leads' ? T('leads') :
                     item.scope === 'listings' ? T('listings') :
                     item.scope === 'agents' ? T('agents') :
                     T('workflows')}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Search Insights Tips & Distribution */}
        <div className="p-5 bg-[#0a0f1d] border border-slate-800/80 rounded-xl flex flex-col h-96 justify-between">
          <div>
            <div className="mb-4">
              <h3 className="text-xs font-bold text-white font-mono uppercase tracking-wider">
                💡 {isAr ? "المرئيات والتوصيات التلقائية" : "AI Search Behavior Insights"}
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {isAr ? "تحليل السلوكيات الذكية وتحسين أداء المنصة." : "Automated telemetry feedback to optimize real-estate operations."}
              </p>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-cyan-500/5 border border-cyan-500/10 rounded-lg flex gap-3">
                <span className="text-lg">🤖</span>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  <strong className="text-cyan-400 font-mono block mb-1">
                    {isAr ? 'تحديث تلقائي للفهرسة' : 'Automated Agent Indexing Match'}
                  </strong>
                  {isAr 
                    ? `استناداً إلى زيادة الاستعلامات عن "${chartData[0]?.name || 'العقارات'}"، فإن وكلاء الذكاء الاصطناعي يقومون تلقائياً بزيادة وتيرة مطابقة العقارات لعقود العملاء.` 
                    : `Based on elevated search queries for "${chartData[0]?.name || 'residential listings'}", Sierra matching agents have escalated match priority for incoming leads.`}
                </p>
              </div>

              <div className="p-3 bg-red-500/5 border border-red-500/10 rounded-lg flex gap-3">
                <span className="text-lg">🎙️</span>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  <strong className="text-red-400 font-mono block mb-1">
                    {isAr ? 'كفاءة التعرف الصوتي' : 'Voice Accessibility Metrics'}
                  </strong>
                  {isAr
                    ? `إن معدل التفاعل الصوتي الحالي يبلغ (${stats.voicePercent}%). إن استعمال أتمتة الإملاء الصوتي يساعد الوسطاء والوكلاء على تدوين وتحصيل المعلومات أثناء التنقل.`
                    : `Voice searches represent ${stats.voicePercent}% of overall user commands. Dictation support accelerates field operations in the CRM.`}
                </p>
              </div>

              <div className="p-3 bg-slate-900/50 border border-slate-800 rounded-lg flex gap-3">
                <span className="text-lg">⚡</span>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  <strong className="text-slate-400 font-mono block mb-1">
                    {isAr ? 'نشاط سير العمل التلقائي' : 'Synergetic Workflows'}
                  </strong>
                  {isAr
                    ? "ينصح بإنشاء روابط سير العمل مخصصة لتجميع وتوصيل تقارير أسبوعية مبنية على الكلمات الأكثر تكراراً."
                    : "Establish an automation node inside workflows to schedule automatic PDF exports based on top keywords."}
                </p>
              </div>
            </div>
          </div>

          <div className="text-[10px] text-slate-500 font-mono border-t border-slate-800/50 pt-2 text-center">
            {isAr ? "تحديث تلقائي حقيقي في الوقت الفعلي" : "Real-Time Telemetry Tracking Connected"}
          </div>
        </div>

      </div>

    </div>
  );
}
