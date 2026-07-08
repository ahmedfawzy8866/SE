import React, { useState, useRef, useEffect } from 'react';
import {
  RefreshCw,
  Database,
  Terminal,
  UploadCloud,
  Bot,
  Save,
  Trash2,
  Zap
} from 'lucide-react';

interface TermLine {
  t: 'dim' | 'green' | 'red' | 'blue' | 'prompt' | '';
  l: string;
}

const DEFAULT_TERMINAL_LOGS: TermLine[] = [
  { t: 'dim', l: 'OpenClaw v3.2.1 · Sierra Estates Intelligence OS' },
  { t: 'dim', l: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━' },
  { t: 'green', l: '[✓] Firebase Auth connection established' },
  { t: 'green', l: '[✓] Firestore rules validated — 6 active collections' },
  { t: 'green', l: '[✓] Sierra Bot online — 1,203 sessions this month' },
  { t: 'green', l: '[✓] Leila/Lola agent — Arabic routing active' },
  { t: 'green', l: '[✓] Stage-9 Closer — 97 deals processed this month' },
  { t: 'blue', l: '[~] WhatsApp Scraper — scanning Property Finder (ETA 2 min)' },
  { t: 'blue', l: '[~] AVM Engine — pricing 23 new listings...' },
  { t: '', l: '' },
  { t: 'prompt', l: 'sierra status --all-agents' },
  { t: 'green', l: '  Sierra Bot      Online    94%     1,203' },
  { t: 'green', l: '  Leila/Lola      Online    87%     889' },
  { t: 'green', l: '  Stage-9 Closer  Online    71%     421' },
  { t: 'green', l: '  Scraper         Running   55%     2,847' },
  { t: 'blue', l: '  The Scribe      Idle      12%     4,821' },
  { t: 'green', l: '  The Curator     Online    68%     3,102' },
  { t: 'dim', l: 'Last sync: 2026-06-16 · All systems nominal' },
];

export default function OpenClawPage({ T, isAr = false }: { T?: (key: string) => string; isAr?: boolean }) {
  const [cmd, setCmd] = useState('');
  const [logs, setLogs] = useState<TermLine[]>(DEFAULT_TERMINAL_LOGS);
  const termEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    termEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const runCommand = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter') return;
    const trimmed = cmd.trim();
    if (!trimmed) return;

    const nextLogs = [...logs, { t: 'prompt' as const, l: trimmed }];

    if (trimmed.toLowerCase() === 'clear') {
      setLogs([]);
      setCmd('');
      return;
    }

    if (trimmed.toLowerCase().includes('status')) {
      nextLogs.push({ t: 'green', l: isAr ? '[✓] كافة الوكلاء الـ 6 متصلون · اتصال قاعدة البيانات نشط' : '[✓] All 6 agents operational · Database link active' });
    } else if (trimmed.toLowerCase().includes('sync')) {
      nextLogs.push(
        { t: 'blue', l: isAr ? '[~] جاري بدء المزامنة الكاملة للبيانات العقارية مع Firestore...' : '[~] Triggering full telemetry sync with Firestore...' },
        { t: 'green', l: isAr ? '[✓] اكتمال المزامنة · تم معالجة 1,547 نقطة فهرس مركبة بنجاح' : '[✓] Sync complete · 1,547 compound index points processed' }
      );
    } else if (trimmed.toLowerCase().includes('leads')) {
      nextLogs.push({ t: '', l: isAr ? '  العملاء النشطون: 284 · المعلقون: 3 · التحسن اليومي: +8 اليوم' : '  Active leads: 284 · Flagged: 3 · Delta improvement: +8 today' });
    } else if (trimmed.toLowerCase().includes('help')) {
      nextLogs.push({
        t: 'dim',
        l: isAr ? 'أوامر التشغيل المتاحة: status · sync · leads · agents · deploy · clear' : 'Operational Commands: status · sync · leads · agents · deploy · clear',
      });
    } else {
      nextLogs.push({ t: 'red', l: isAr ? `[!] خطأ في الصيغة: ${trimmed} · اكتب 'help' للدعم` : `[!] Syntax error: ${trimmed} · Type 'help' for support` });
    }

    setLogs(nextLogs);
    setCmd('');
  };

  const executeAction = (actionName: string, iconName: string) => {
    setLogs((prev) => [
      ...prev,
      { t: 'blue', l: isAr ? `[~] جاري إرسال تعليمات البنية التحتية: ${actionName}...` : `[~] Dispatching pipeline instruction: ${actionName}...` },
      { t: 'green', l: isAr ? `[✓] تم إرجاع رمز التشغيل بنجاح لـ ${actionName} [${iconName}]` : `[✓] Execution code returned success for ${actionName} [${iconName}]` },
    ]);
  };

  const renderColorClass = (t: string) => {
    switch (t) {
      case 'dim':
        return 'text-cyan-400/50';
      case 'green':
        return 'text-emerald-400';
      case 'red':
        return 'text-red-400';
      case 'blue':
        return 'text-blue-400';
      case 'prompt':
        return 'text-white before:content-["→_"] before:text-cyan-400';
      default:
        return 'text-slate-200';
    }
  };

  const bottomActions = [
    { l: isAr ? 'نشر الواجهة' : 'Deploy Frontend', icon: UploadCloud, iconName: 'deploy' },
    { l: isAr ? 'مزامنة البيانات' : 'Sync Firestore', icon: RefreshCw, iconName: 'sync' },
    { l: isAr ? 'تشغيل الوكلاء' : 'Run All Agents', icon: Bot, iconName: 'run' },
    { l: isAr ? 'نسخ احتياطي' : 'Backup Database', icon: Save, iconName: 'backup' },
    { l: isAr ? 'مسح التخزين' : 'Clear Cache', icon: Trash2, iconName: 'clear' },
    { l: isAr ? 'فحص الربط' : 'Test Webhooks', icon: Zap, iconName: 'test' },
  ];

  return (
    <div className="space-y-6 animate-fade-in-up" dir={isAr ? 'rtl' : 'ltr'}>
      {/* Mini Controls */}
      <div className={`flex gap-2 flex-wrap select-none ${isAr ? 'justify-start' : ''}`}>
        <button
          onClick={() => setLogs(DEFAULT_TERMINAL_LOGS)}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-mono bg-white/5 hover:bg-white/10 border border-slate-800 text-slate-300 rounded-lg transition active:scale-95 duration-100 cursor-pointer"
          id="btn-reset-terminal"
        >
          <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
          <span>{isAr ? 'إعادة ضبط الطرفية' : 'Reset Terminal'}</span>
        </button>
        <button
          onClick={() => {
            setLogs((p) => [
              ...p,
              { t: 'blue', l: isAr ? '[~] جاري إنشاء قناة اتصال SSL آمنة...' : '[~] Establishing secure SSL channel...' },
              { t: 'green', l: isAr ? '[✓] تم حل المصافحة الفنية · اتصالات Firebase CRM نشطة بنجاح.' : '[✓] Handshake resolved · CRM Firebase modules connected successfully.' },
            ]);
          }}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-lg shadow hover:bg-[#C8961A]/20 transition active:scale-95 duration-100 cursor-pointer"
          id="btn-test-db-connection"
        >
          <Database className="w-3.5 h-3.5 text-cyan-400" />
          <span>{isAr ? 'فحص الاتصال بقاعدة البيانات' : 'Verify DB connection'}</span>
        </button>
      </div>

      {/* Terminal emulator */}
      <div className="bg-[#05080f] border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
        <div className="px-5 py-3.5 bg-[#0a0f1d]/60 border-b border-slate-800 flex items-center justify-between select-none">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-cyan-400" />
            <span className="font-mono text-[9px] uppercase tracking-wider text-cyan-400 font-bold">
              {isAr ? 'أوبن كلو · طرفية مراقبة النظام والقياس' : 'OpenClaw · Shell Telemetry Console'}
            </span>
          </div>
          <span className="text-[8px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-bold">
            {isAr ? 'اتصال SSL آمن' : 'Connected SSL'}
          </span>
        </div>

        <div className="p-5 h-[340px] overflow-y-auto font-mono text-xs space-y-1 scrollbar scroll-smooth">
          {logs.map((l, i) => (
            <div key={i} className={`leading-relaxed whitespace-pre-wrap ${renderColorClass(l.t)} ${isAr ? 'text-right' : 'text-left'}`}>
              {l.l}
            </div>
          ))}
          {/* Working directory line */}
          <div className="flex items-center gap-1.5 pt-1">
            <span className="text-cyan-400 select-none">sierra@intel:~$</span>
            <input
              type="text"
              value={cmd}
              onChange={(e) => setCmd(e.target.value)}
              onKeyDown={runCommand}
              className="flex-1 bg-transparent border-none outline-none text-white font-semibold text-xs py-0"
              placeholder={isAr ? 'اكتب أمراً مثل "help" أو "status"...' : "Type command e.g., 'help', 'status'..."}
              id="terminal-repl-input"
              autoFocus
            />
          </div>
          <div ref={termEndRef} />
        </div>
      </div>

      {/* Grid actions trigger */}
      <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
        {bottomActions.map((a, i) => {
          const Icon = a.icon;
          return (
            <button
              key={i}
              onClick={() => executeAction(a.l, a.iconName)}
              className="flex flex-col items-center justify-center p-3.5 bg-[#0a0f1d] border border-slate-800 hover:border-cyan-500/30 rounded transition duration-200 select-none cursor-pointer duration-100 active:scale-95"
            >
              <Icon className="w-5 h-5 text-cyan-400 mb-1" />
              <span className="font-mono text-[8.5px] tracking-wide uppercase text-slate-500 shrink-0">
                {a.l}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
