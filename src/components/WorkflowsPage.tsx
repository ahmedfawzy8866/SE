import React, { useEffect, useState, useMemo } from 'react';
import { collection, onSnapshot, doc, updateDoc, setDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Workflow } from '../types';
import HighlightText from './HighlightText';
import { motion } from 'motion/react';
import { recordAccess, getRelevanceScore } from '../utils/relevance';

interface WorkflowsPageProps {
  T: (key: string) => string;
  isAr?: boolean;
  searchQuery?: string;
}

const WORKFLOW_FALLBACKS: Record<string, { nameAr: string; descEn: string; descAr: string }> = {
  'Lead Ingestion → Firestore': {
    nameAr: 'معالجة وتوجيه العملاء الجدد',
    descEn: 'Processes raw WhatsApp text and routes parsed leads info into Firestore.',
    descAr: 'تحليل وتنسيق معلومات المعاينات من نصوص واتس اب الخام وتوجيهها إلى قاعدة البيانات.'
  },
  'WhatsApp Scraper Cron (30m)': {
    nameAr: 'مراقب مجموعات الواتساب والمواقع',
    descEn: 'Periodically audits WhatsApp broker communities for raw listing postings.',
    descAr: 'سحب البيانات التلقائي وعمل فحص دوري لمجموعات السماسرة والمواقع العقارية.'
  },
  'Listing Price AVM Sync': {
    nameAr: 'مزامنة الأسعار مع محرك التقييم',
    descEn: 'Synchronizes listing prices with actual Sierra valuation models.',
    descAr: 'مراجعة أسعار السوق المعروضة وتعديلها تلقائياً بالاعتماد على ذكاء نماذج سييرا.'
  },
  'Stage-9 Contract Generator': {
    nameAr: 'توليد العقود للمرحلة الختامية',
    descEn: 'Prepares contract PDFs and logs legal signatures dynamic events.',
    descAr: 'إعداد مسودات العقود القانونية النهائية وتسجيل تواقيع العملاء وإيداع الدفعات.'
  },
  'Broker KPI Report (Daily)': {
    nameAr: 'تقرير مؤشرات الأداء اليومي للوسطاء',
    descEn: 'Synthesizes daily metrics on agent activity and lead progression rates.',
    descAr: 'استخلاص وتقييم تقارير الأداء اليومية ونشاط الوكلاء ونسب الإغلاق الفعلي.'
  },
  'Stale Listing Monitor': {
    nameAr: 'مراقب العقود والوحدات الراكدة',
    descEn: 'Audits old database entries and changes status of stale units to Review.',
    descAr: 'فلترة العقارات القديمة والوحدات غير المحدثة وتغيير حالتها تلقائياً للمراجعة.'
  },
  'Email Follow-Up Sequence': {
    nameAr: 'سلسلة رسائل المتابعة البريدية',
    descEn: 'Dispatches periodic reminders to prospects showing interest.',
    descAr: 'إرسال رسائل بريد تذكيرية آلية دورية للعملاء المهتمين بوحدات محددة.'
  },
  'Telegram Alert Dispatcher': {
    nameAr: 'مرسل تنبيهات تيليجرام للعمليات الإدارية',
    descEn: 'Pushes high-priority bot matches instantly to team Telegram channels.',
    descAr: 'بث فوري لأحدث ترشيحات العقارات ومطابقة العملاء لقنوات العمل الإدارية.'
  }
};

type StatusType = 'active' | 'warning' | 'paused';

export default function WorkflowsPage({ T, isAr, searchQuery = '' }: WorkflowsPageProps) {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [runningAll, setRunningAll] = useState(false);
  const [sortByRelevance, setSortByRelevance] = useState<boolean>(true);
  const [accessUpdateTrigger, setAccessUpdateTrigger] = useState<number>(0);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  const [showLogs, setShowLogs] = useState<boolean>(false);
  const [scriptConfigs, setScriptConfigs] = useState({ easyListing: false, whatsappSender: false });

  useEffect(() => {
    const unsubConfig = onSnapshot(doc(db, 'config', 'automations'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setScriptConfigs({
          easyListing: !!data.easyListing,
          whatsappSender: !!data.whatsappSender
        });
      }
    });

    const handleUpdate = () => {
      setAccessUpdateTrigger(prev => prev + 1);
    };
    window.addEventListener('sierra_access_updated', handleUpdate);
    return () => {
      unsubConfig();
      window.removeEventListener('sierra_access_updated', handleUpdate);
    };
  }, []);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'workflows'), (snap) => {
      const loaded: Workflow[] = [];
      snap.forEach((doc) => {
        const d = doc.data();
        const key = d.name || '';
        const fallback = WORKFLOW_FALLBACKS[key];
        loaded.push({
          id: doc.id,
          name: d.name,
          nameAr: d.nameAr || fallback?.nameAr || d.name,
          desc: d.desc || fallback?.descEn || '',
          descAr: d.descAr || fallback?.descAr || '',
          status: d.status,
          runs: d.runs,
          last: d.last,
          color: d.color,
          updatedAt: d.updatedAt?.toDate ? d.updatedAt.toDate() : new Date(),
        });
      });
      setWorkflows(loaded.sort((a,b) => a.id.localeCompare(b.id)));
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, 'workflows');
    });

    return () => unsub();
  }, []);

  const filteredWorkflows = useMemo(() => {
    let res = workflows;
    if (searchQuery) {
      const qLower = searchQuery.toLowerCase();
      res = workflows.filter((w) => {
        const statusKey = w.status === 'active' ? 'online' : w.status === 'paused' ? 'idle' : 'config';
        const statusTranslated = T(statusKey);
        return (
          w.name.toLowerCase().includes(qLower) ||
          (w.nameAr && w.nameAr.toLowerCase().includes(qLower)) ||
          w.desc.toLowerCase().includes(qLower) ||
          (w.descAr && w.descAr.toLowerCase().includes(qLower)) ||
          statusTranslated.toLowerCase().includes(qLower) ||
          w.status.toLowerCase().includes(qLower)
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
        return a.id.localeCompare(b.id);
      });
    }

    return res;
  }, [workflows, searchQuery, T, sortByRelevance, accessUpdateTrigger]);

  const toggleScriptConfig = async (key: 'easyListing' | 'whatsappSender') => {
    const nextVal = !scriptConfigs[key];
    setScriptConfigs(prev => ({ ...prev, [key]: nextVal }));
    try {
      await setDoc(doc(db, 'config', 'automations'), { [key]: nextVal }, { merge: true });
    } catch (err) {
      console.error("Failed to update config", err);
    }
  };

  const updateWorkflowStatus = async (id: string, nextStatus: string) => {
    recordAccess(id, 'workflows');
    const ref = doc(db, 'workflows', id);
    try {
      await updateDoc(ref, {
        status: nextStatus,
        updatedAt: new Date()
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `workflows/${id}`);
    }
  };

  const toggleWorkflow = async (wf: Workflow) => {
    updateWorkflowStatus(wf.id, wf.status !== 'paused' ? 'paused' : 'active');
  };

  const triggerRunAll = async () => {
    setRunningAll(true);
    try {
      for (const wf of workflows) {
        if (wf.status === 'active') {
          recordAccess(wf.id, 'workflows');
          const ref = doc(db, 'workflows', wf.id);
          await updateDoc(ref, {
            runs: wf.runs + 1,
            last: 'Just now',
            updatedAt: new Date()
          });
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setTimeout(() => setRunningAll(false), 800);
    }
  };

  const translateTime = (timeStr: string) => {
    if (!isAr) return timeStr;
    const lower = timeStr.toLowerCase().trim();
    if (lower.includes('just now')) return 'الآن';
    if (lower.includes('2 min ago')) return 'منذ دقيقتين';
    if (lower.includes('28 min ago')) return 'منذ ٢٨ دقيقة';
    if (lower.includes('15 min ago')) return 'منذ ١٥ دقيقة';
    if (lower.includes('4 min ago')) return 'منذ ٤ دقائق';
    if (lower.includes('1 hr ago')) return 'منذ ساعة';
    if (lower.includes('2 hrs ago')) return 'منذ ساعتين';
    if (lower.includes('6 hrs ago')) return 'منذ ٦ ساعات';
    if (lower.includes('1 day ago')) return 'منذ يوم من العجز';
    return timeStr;
  };

  const onDragStart = (e: React.DragEvent, id: string) => {
    setDraggedId(id);
    e.dataTransfer.setData('workflowId', id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const onDrop = (e: React.DragEvent, status: StatusType) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('workflowId');
    if (id) {
      updateWorkflowStatus(id, status);
    }
    setDraggedId(null);
  };

  const columns: { id: StatusType; title: string; color: string }[] = [
    { id: 'active', title: isAr ? 'نشط' : 'Active Scripts', color: 'border-emerald-500/30' },
    { id: 'warning', title: isAr ? 'تنبيهات / اخطاء' : 'Warnings / Errors', color: 'border-amber-500/30' },
    { id: 'paused', title: isAr ? 'متوقف / قيد الإعداد' : 'Paused / Config', color: 'border-red-500/30' }
  ];

  const summaryCounts = useMemo(() => {
    let active = 0;
    let warning = 0;
    let paused = 0;
    workflows.forEach((w) => {
      if (w.status === 'active') active++;
      else if (w.status === 'warning') warning++;
      else paused++;
    });
    return { active, warning, paused };
  }, [workflows]);

  return (
    <div className="space-y-6 animate-fade-in-up h-full flex flex-col">
      {/* Upper Control Bar */}
      <div className="flex gap-2.5 flex-wrap justify-between items-center w-full">
        <div className="flex gap-2.5 flex-wrap">
          <button
            onClick={triggerRunAll}
            disabled={runningAll}
            className="px-4 py-2 text-xs font-bold bg-cyan-500 text-black hover:bg-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)] rounded flex items-center gap-2 select-none transition active:scale-95 disabled:opacity-50 disabled:scale-100 duration-100 cursor-pointer"
          >
            <span>⚡</span>
            <span>
              {runningAll 
                ? (isAr ? "يجري تنفيذ المهام..." : "Pipelining crons...") 
                : (isAr ? "تشغيل المهام النشطة" : "Activate All Routines")}
            </span>
          </button>
        </div>

        {searchQuery && (
          <button
            onClick={() => setSortByRelevance(!sortByRelevance)}
            className={`px-3 py-1.5 rounded text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer border ${
              sortByRelevance
                ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.15)]'
                : 'bg-[#0a0f1d]/40 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            <span>🎯</span>
            <span>Sort by Relevance</span>
          </button>
        )}
      </div>

      {/* Summary Status Indicator */}
      <div className="bg-[#0a0f1d] border border-slate-800 rounded-xl px-5 py-3 flex flex-wrap gap-6 md:gap-8 items-center shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse"></div>
          <div className="text-xs font-mono uppercase tracking-widest text-slate-400">
            Running <span className="text-emerald-400 font-bold ml-1">{summaryCounts.active}</span>
          </div>
        </div>
        <div className="hidden md:block w-px h-5 bg-slate-800"></div>
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/80"></div>
          <div className="text-xs font-mono uppercase tracking-widest text-slate-400">
            Idle <span className="text-red-400 font-bold ml-1">{summaryCounts.paused}</span>
          </div>
        </div>
        <div className="hidden md:block w-px h-5 bg-slate-800"></div>
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]"></div>
          <div className="text-xs font-mono uppercase tracking-widest text-slate-400">
            Errors <span className="text-amber-500 font-bold ml-1">{summaryCounts.warning}</span>
          </div>
        </div>
        
        <div className="ml-auto text-[10px] font-mono text-slate-500 uppercase tracking-wider hidden sm:block">
          System Overview Stats
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 w-full">
        <div className="bg-[#0a0f1d] border border-slate-800 rounded-xl p-4 flex-1 flex justify-between items-center shadow-xl">
          <div>
            <h4 className="text-white font-bold text-sm">Easy Listing Script</h4>
            <p className="text-slate-500 text-[10px] mt-1 font-mono">Automated property publishing across portals</p>
          </div>
          <button 
            onClick={() => toggleScriptConfig('easyListing')}
            className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors ${scriptConfigs.easyListing ? 'bg-cyan-500' : 'bg-slate-700'}`}
          >
            <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${scriptConfigs.easyListing ? 'translate-x-5' : 'translate-x-1'}`} />
          </button>
        </div>
        
        <div className="bg-[#0a0f1d] border border-slate-800 rounded-xl p-4 flex-1 flex justify-between items-center shadow-xl">
          <div>
            <h4 className="text-white font-bold text-sm">WhatsApp Sender</h4>
            <p className="text-slate-500 text-[10px] mt-1 font-mono">Meta API automated client outreach</p>
          </div>
          <button 
            onClick={() => toggleScriptConfig('whatsappSender')}
            className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors ${scriptConfigs.whatsappSender ? 'bg-emerald-500' : 'bg-slate-700'}`}
          >
            <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${scriptConfigs.whatsappSender ? 'translate-x-5' : 'translate-x-1'}`} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 pb-6">
        {columns.map((col) => {
          const colWorkflows = filteredWorkflows.filter((w) => w.status === col.id);
          return (
            <div
              key={col.id}
              className={`flex flex-col bg-[#0a0f1d] border border-slate-800 rounded-xl overflow-hidden shadow-xl ${col.color}`}
              onDragOver={onDragOver}
              onDrop={(e) => onDrop(e, col.id)}
            >
              <div className={`px-5 py-3 border-b border-slate-800 flex justify-between items-center bg-slate-900/60`}>
                <span className="font-mono text-xs uppercase tracking-wider text-white font-bold select-none">
                  {col.title}
                </span>
                <span className="text-[10px] bg-slate-800/50 text-slate-400 px-2 py-0.5 rounded font-mono">
                  {colWorkflows.length}
                </span>
              </div>

              <div className="flex-1 p-4 space-y-3 overflow-y-auto min-h-[300px]">
                {colWorkflows.map((w) => (
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    key={w.id}
                    draggable
                    onDragStart={(e: React.DragEvent) => onDragStart(e, w.id)}
                    onClick={() => {
                      recordAccess(w.id, 'workflows');
                      setSelectedWorkflow(w);
                    }}
                    className={`p-4 bg-slate-900/40 border rounded cursor-grab hover:bg-slate-800/50 transition group ${draggedId === w.id ? 'opacity-50' : ''} ${
                      w.status === 'active' ? 'border-emerald-500/20 hover:border-emerald-500/40' : 
                      w.status === 'warning' ? 'border-amber-500/20 hover:border-amber-500/40' : 
                      'border-red-500/20 hover:border-red-500/40'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-sm font-semibold text-white">
                        <HighlightText text={(isAr ? w.nameAr : w.name) || ''} highlight={searchQuery} />
                      </h4>
                      <div className="flex items-center gap-3">
                        {getRelevanceScore(w.id) > 0 && (
                          <span className="text-[10px] px-1.5 py-0.5 bg-cyan-900/30 text-cyan-400 rounded-full font-mono">
                            🎯 {getRelevanceScore(w.id)}
                          </span>
                        )}
                        <button 
                          onClick={(e) => { e.stopPropagation(); toggleWorkflow(w); }}
                          title={w.status === 'active' ? 'Pause script' : w.status === 'warning' ? 'Pause script (Warnings)' : 'Activate script'}
                          className={`relative inline-flex h-4 w-8 items-center rounded-full transition-colors ${w.status === 'active' ? 'bg-emerald-500' : w.status === 'warning' ? 'bg-amber-500' : 'bg-slate-700'}`}
                        >
                          <span className={`inline-block h-2.5 w-2.5 transform rounded-full bg-white transition-transform ${w.status === 'active' || w.status === 'warning' ? 'translate-x-4' : 'translate-x-1'}`} />
                        </button>
                      </div>
                    </div>
                    
                    <p className="text-xs text-slate-400 leading-relaxed mb-3">
                      <HighlightText text={(isAr ? w.descAr : w.desc) || ''} highlight={searchQuery} />
                    </p>
                    
                    <div className="flex justify-between items-center text-[10px] font-mono text-slate-500 uppercase">
                      <span>{w.runs.toLocaleString()} {isAr ? "تشغيل" : "RUNS"}</span>
                      <span>{translateTime(w.last)}</span>
                    </div>
                  </motion.div>
                ))}

                {colWorkflows.length === 0 && (
                  <div className="h-full flex items-center justify-center text-xs text-slate-600 font-mono italic p-4 text-center">
                    {isAr ? "اسحب وأفلت المهام إلى هذا العمود" : "Drag and drop tasks here"}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Visual Flow Builder Modal */}
      {selectedWorkflow && (
        <div className="fixed inset-0 z-50 flex justify-center items-center p-6 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-4xl bg-[#0a0f1d] border border-slate-800 rounded-xl shadow-2xl flex flex-col overflow-hidden"
          >
            <div className="flex justify-between items-center p-4 border-b border-slate-800 bg-slate-900/60">
              <h3 className="font-mono text-sm uppercase text-cyan-400 font-bold flex items-center gap-2">
                <span className="text-xl">⚙️</span>
                <span>{selectedWorkflow.name}</span>
                <span className={`ml-2 px-2 py-0.5 text-[10px] rounded animate-pulse ${
                  selectedWorkflow.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                }`}>
                  {selectedWorkflow.status.toUpperCase()}
                </span>
              </h3>
              {/* Toggle Logs Button */}
              <button 
                onClick={() => setShowLogs(!showLogs)}
                className="px-4 py-2 rounded text-xs font-mono tracking-wider font-bold transition flex items-center gap-2 bg-slate-800/50 text-slate-300 hover:text-white hover:bg-slate-700/50"
              >
                <span>{showLogs ? '👁 Graph View' : '📜 View Execution Logs'}</span>
              </button>
            </div>
            
            <div className="flex-1 p-8 bg-[#040710] flex items-center justify-center relative min-h-[400px]">
              {showLogs ? (
                <div className="w-full h-full max-h-[400px] overflow-y-auto bg-[#0a0f1d] border border-slate-800 rounded p-4 font-mono text-[10px] sm:text-xs">
                  <div className="text-slate-500 mb-4 uppercase tracking-wider text-[10px]">Recent Execution Trace History [{selectedWorkflow.runs} Total Runs]</div>
                  <div className="space-y-2">
                    <div className="flex gap-4">
                      <span className="text-slate-500 shrink-0">{new Date(Date.now() - 1000 * 60 * 5).toLocaleTimeString()}</span>
                      <span className="text-cyan-400 w-12 shrink-0">[INFO]</span>
                      <span className="text-slate-300">Triggered execution pipeline for task: {selectedWorkflow.id}</span>
                    </div>
                    <div className="flex gap-4">
                      <span className="text-slate-500 shrink-0">{new Date(Date.now() - 1000 * 60 * 4.9).toLocaleTimeString()}</span>
                      <span className="text-cyan-400 w-12 shrink-0">[INFO]</span>
                      <span className="text-slate-300">Initializing connection to configured endpoints... OK (42ms)</span>
                    </div>
                    <div className="flex gap-4">
                      <span className="text-slate-500 shrink-0">{new Date(Date.now() - 1000 * 60 * 4.5).toLocaleTimeString()}</span>
                      <span className="text-cyan-400 w-12 shrink-0">[INFO]</span>
                      <span className="text-slate-300">Payload transformation matrix applied successfully.</span>
                    </div>
                    <div className="flex gap-4">
                      <span className="text-slate-500 shrink-0">{new Date(Date.now() - 1000 * 60 * 4.2).toLocaleTimeString()}</span>
                      <span className={selectedWorkflow.status === 'warning' ? 'text-amber-500 w-12 shrink-0' : 'text-emerald-400 w-12 shrink-0'}>[{selectedWorkflow.status === 'warning' ? 'WARN' : 'SUCC'}]</span>
                      <span className={selectedWorkflow.status === 'warning' ? 'text-amber-500/80' : 'text-emerald-400/80'}>
                        {selectedWorkflow.status === 'warning' ? 'Execution completed with 2 non-fatal warnings (Missing specific fields).' : 'Data committed to primary records store successfully.'}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {/* Background grid */}
                  <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
                  
                  {/* Central Graph Container */}
                  <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 md:gap-12 w-full justify-center">
                    {/* Node 1 */}
                    <div className="bg-[#0a0f1d] border border-slate-700 w-48 p-4 rounded-lg shadow-lg relative group">
                      <div className="text-[10px] text-cyan-500 font-mono mb-1 uppercase text-center tracking-wider">Trigger</div>
                      <div className="text-white text-xs text-center font-semibold mb-2">
                        {selectedWorkflow.name.toLowerCase().includes('cron') ? 'Scheduled Timer' : 'Webhook Event'}
                      </div>
                      <div className="text-[10px] text-slate-400 text-center uppercase tracking-widest">{selectedWorkflow.status === 'active' ? 'LISTENING' : 'IDLE'}</div>
                    </div>

                    {/* Arrow */}
                    <div className="hidden md:flex flex-col items-center">
                      <div className={`h-[2px] w-12 ${selectedWorkflow.status === 'active' ? 'bg-cyan-500 animate-pulse' : 'bg-slate-700'}`}></div>
                    </div>
                    <div className="md:hidden flex items-center justify-center">
                      <div className={`w-[2px] h-8 ${selectedWorkflow.status === 'active' ? 'bg-cyan-500 animate-pulse' : 'bg-slate-700'}`}></div>
                    </div>

                    {/* Node 2 */}
                    <div className="bg-[#0a0f1d] border border-slate-700 w-48 p-4 rounded-lg shadow-lg relative">
                      <div className="text-[10px] text-purple-400 font-mono mb-1 uppercase text-center tracking-wider">Processing</div>
                      <div className="text-white text-xs text-center font-semibold mb-2">
                        {selectedWorkflow.name.toLowerCase().includes('whatsapp') ? 'Meta API Parse' : 'Data Transformation'}
                      </div>
                      <div className="text-[10px] text-slate-400 text-center uppercase tracking-widest">Execution Engine</div>
                    </div>

                    {/* Arrow */}
                    <div className="hidden md:flex flex-col items-center">
                      <div className={`h-[2px] w-12 ${selectedWorkflow.status === 'active' ? 'bg-cyan-500 animate-pulse' : 'bg-slate-700'}`}></div>
                    </div>
                    <div className="md:hidden flex items-center justify-center">
                      <div className={`w-[2px] h-8 ${selectedWorkflow.status === 'active' ? 'bg-cyan-500 animate-pulse' : 'bg-slate-700'}`}></div>
                    </div>

                    {/* Node 3 */}
                    <div className="bg-[#0a0f1d] border border-slate-700 w-48 p-4 rounded-lg shadow-lg relative">
                      <div className="text-[10px] text-emerald-400 font-mono mb-1 uppercase text-center tracking-wider">Action</div>
                      <div className="text-white text-xs text-center font-semibold mb-2">
                        {selectedWorkflow.name.toLowerCase().includes('firestore') ? 'Database Sync' : 'Dispatch Alert'}
                      </div>
                      <div className="text-[10px] text-slate-400 text-center uppercase tracking-widest line-clamp-1">Output Push</div>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-900/60 flex justify-between items-center">
              <div className="flex gap-4 items-center">
                 <button 
                  onClick={() => {
                    const newStatus = selectedWorkflow.status === 'active' ? 'paused' : 'active';
                    setSelectedWorkflow({...selectedWorkflow, status: newStatus as StatusType});
                    updateWorkflowStatus(selectedWorkflow.id, newStatus);
                  }}
                  className={`px-4 py-2 rounded text-xs font-mono uppercase tracking-wider font-bold transition flex items-center gap-2 ${
                    selectedWorkflow.status === 'active' 
                      ? 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30' 
                      : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30'
                  }`}
                 >
                   <span>{selectedWorkflow.status === 'active' ? '⏸ Suspend Script' : '▶ Activate Script'}</span>
                 </button>
              </div>
              <div className="text-[10px] text-slate-500 font-mono uppercase">
                Runtime UUID: {selectedWorkflow.id}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
