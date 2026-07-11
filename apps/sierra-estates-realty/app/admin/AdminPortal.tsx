/* eslint-disable */
// @ts-nocheck
'use client';
/**
 * SIERRA ESTATES 3.0 — ADMIN PORTAL (Intelligence OS)
 * Ported 1:1 from the designer's static bundle (admin3.0portalBLUE.html).
 * The demo data arrays (LEADS, DEALS, COMPOUNDS, ...) are the designer's
 * placeholders — wire them to Firestore/API incrementally; see
 * lib/services/dashboard-metrics.ts for the ready-made KPI queries.
 * Styling lives in ./admin-portal.css (extracted from the same bundle).
 */
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  Bot, Zap, Settings, AlertCircle, CheckCircle2, Clock,
  Plus, Search, Trash2, Phone, Eye, X, Check,
  Building2, MapPin, BedDouble, Loader2,
  MessageCircle, Send, User, Headphones, Tag,
} from 'lucide-react';
import {
  subscribeAllExchange,
  subscribeAgentTasks,
  subscribeWorkflowRuns,
  sendAdminSignal,
} from '@sierra-estates/exchange';
import {
  fetchListings as adminFetchListings,
  createListingWithOwner as adminCreateListingWithOwner,
  updateListing as adminUpdateListing,
  deleteListingAndOwner as adminDeleteListingAndOwner,
  fetchOwnerByListingId as adminFetchOwnerByListingId,
  fetchRequests as adminFetchRequests,
  fetchRequestById as adminFetchRequestById,
  escalateToAgent as adminEscalateToAgent,
  closeRequest as adminCloseRequest,
  appendChatMessage as adminAppendChatMessage,
  type Listing as AdminListing,
  type ListingInput as AdminListingInput,
  type Owner as AdminOwner,
  type ListingStatus as AdminListingStatus,
  type PropertyType as AdminPropertyType,
  type FinishingLevel as AdminFinishingLevel,
  type DeliveryStatus as AdminDeliveryStatus,
  type ListingMode as AdminListingMode,
  type Request as AdminRequest,
  type RequestStatus as AdminRequestStatus,
  type ChatMessage as AdminChatMessage,
} from '@sierra-estates/admin-data';
import './admin-portal.css';


/* ── TRANSLATIONS ─────────────────────────────────────────────────────── */
const LANG = {
  en: {
    brand:'SIERRA ESTATES 3.0', brandSub:'INTELLIGENCE OS',
    overview:'Intelligence OS', agents:'Agents & Bots', workflows:'Workflows',
    openclaw:'OpenClaw Terminal', nexus:'Nexus-AI Telemetry', leads:'CRM · Leads',
    listings:'Listings Hub', curator:'The Curator', scribe:'The Scribe',
    closer:'Stage-9 Closer', reports:'Reports', settings:'System Config',
    main:'Main', operations:'Operations', analytics:'Analytics', system:'System',
    collapse:'Collapse', livesite:'Live Site', theme:'Theme', lang:'Language',
    addLead:'+ Add Lead', exportCSV:'Export CSV', importCSV:'Import CSV',
    search:'Search…', totalListings:'Total Listings', activeLeads:'Active Leads',
    avgDeal:'Avg Deal Value', dealsClosed:'Deals Closed', avgResponse:'Avg Response',
    aiMatch:'AI Match Rate', pending:'Pending Reviews', eliteBrokers:'Elite Brokers',
    pipelineTitle:'Pipeline · S1→S10', hotLeads:'🔥 Hot Leads', agentStatus:'Agent Status',
    viewingScheduled:'Viewing Scheduled', aiMatched:'AI Matched', contractDraft:'Contract Draft',
    initialContact:'Initial Contact', negotiating:'Negotiating', online:'Online',
    running:'Running', idle:'Idle', load:'Load', totalTasks:'Total tasks',
    config:'Config', logs:'Logs', restart:'Restart', sendMsg:'Send',
    curator_title:'The Curator · S3–S5 Inventory & Valuation',
    scribe_title:'The Scribe · S1–S2 Raw Ingestion Parser',
    avm:'AVM Engine', priceAdj:'Price Adjustment', qualityScore:'Quality Score',
    rawInput:'Raw Listing Input (WhatsApp / Property Finder text)',
    parsedOutput:'Parsed & Structured Output', parseBtn:'Parse with AI',
    compound:'Compound', type:'Type', area:'Area', price:'Price', beds:'Beds',
    status:'Status', phone:'Phone', interest:'Interest', stage:'Stage', actions:'Actions',
    client:'Client', view:'View', whatsapp:'WhatsApp',
    monthlyDeals:'📊 Monthly Deals Closed', revPipeline:'💰 Revenue Pipeline',
    perfByCompound:'🗺️ Performance by Compound',
    saveConfig:'Save Configuration', saved:'✓ Saved!', githubIntegration:'🔗 GitHub Integration',
    pullLatest:'Pull Latest', openRepo:'Open Repo', pushChanges:'Push Changes',
  },
  ar: {
    brand:'سيير ايستيتس 3.0', brandSub:'نظام الذكاء',
    overview:'لوحة التحكم', agents:'الوكلاء والبوتات', workflows:'سير العمل',
    openclaw:'طرفية أوبن كلو', nexus:'نيكسوس · البث المباشر', leads:'إدارة العملاء',
    listings:'قاعدة العقارات', curator:'المنظم', scribe:'الكاتب',
    closer:'المغلق · المرحلة 9', reports:'التقارير', settings:'الإعدادات',
    main:'رئيسي', operations:'العمليات', analytics:'التحليلات', system:'النظام',
    collapse:'طي', livesite:'الموقع المباشر', theme:'المظهر', lang:'اللغة',
    addLead:'+ إضافة عميل', exportCSV:'تصدير CSV', importCSV:'استيراد CSV',
    search:'بحث…', totalListings:'إجمالي العقارات', activeLeads:'العملاء النشطين',
    avgDeal:'متوسط قيمة الصفقة', dealsClosed:'الصفقات المغلقة', avgResponse:'متوسط الاستجابة',
    aiMatch:'دقة الذكاء الاصطناعي', pending:'قيد المراجعة', eliteBrokers:'الوسطاء المميزون',
    pipelineTitle:'خط الأنابيب · S1→S10', hotLeads:'🔥 العملاء الساخنون', agentStatus:'حالة الوكلاء',
    viewingScheduled:'معاينة مجدولة', aiMatched:'مطابقة AI', contractDraft:'مسودة عقد',
    initialContact:'تواصل أولي', negotiating:'تفاوض', online:'متصل',
    running:'يعمل', idle:'خامل', load:'الحمل', totalTasks:'المهام الكلية',
    config:'إعداد', logs:'السجلات', restart:'إعادة تشغيل', sendMsg:'إرسال',
    curator_title:'المنظم · المراحل S3–S5 · المخزون والتقييم',
    scribe_title:'الكاتب · المراحل S1–S2 · محلل الإدخال الخام',
    avm:'محرك التقييم', priceAdj:'تعديل السعر', qualityScore:'نقاط الجودة',
    rawInput:'إدخال قوائم خام (واتساب / بروبيرتي فايندر)',
    parsedOutput:'المخرجات المنظمة', parseBtn:'تحليل بالذكاء الاصطناعي',
    compound:'المجمع', type:'النوع', area:'المساحة', price:'السعر', beds:'غرف',
    status:'الحالة', phone:'الهاتف', interest:'الاهتمام', stage:'المرحلة', actions:'الإجراءات',
    client:'العميل', view:'عرض', whatsapp:'واتساب',
    monthlyDeals:'📊 الصفقات الشهرية', revPipeline:'💰 خط الإيرادات',
    perfByCompound:'🗺️ الأداء حسب المجمع',
    saveConfig:'حفظ الإعدادات', saved:'✓ تم الحفظ!', githubIntegration:'🔗 تكامل GitHub',
    pullLatest:'سحب آخر التحديثات', openRepo:'فتح المستودع', pushChanges:'رفع التغييرات',
  }
};

/* ── DATA ────────────────────────────────────────────────────────────── */
const KPI_DATA = (T) => [
  {val:'1,547',lbl:T('totalListings'),delta:'+12% this week',up:true,color:'#00AEFF',spark:[42,55,48,70,62,85,95]},
  {val:'284',lbl:T('activeLeads'),delta:'+8 today',up:true,color:'#1E88D9',spark:[30,45,38,55,48,70,80]},
  {val:'EGP 6.2M',lbl:T('avgDeal'),delta:'+5% MoM',up:true,color:'#34D399',spark:[55,60,52,68,65,78,88]},
  {val:'97',lbl:T('dealsClosed'),delta:'This month',up:true,color:'#7C3AED',spark:[20,35,28,48,42,65,75]},
  {val:'4.1s',lbl:T('avgResponse'),delta:'-0.3s improved',up:true,color:'#00AEFF',spark:[70,65,60,55,50,45,40]},
  {val:'98.2%',lbl:T('aiMatch'),delta:'+0.4%',up:true,color:'#34D399',spark:[90,92,91,95,93,97,98]},
  {val:'23',lbl:T('pending'),delta:'3 urgent',up:false,color:'#E63946',spark:[10,18,12,22,17,25,23]},
  {val:'1,503',lbl:T('eliteBrokers'),delta:'+45 this month',up:true,color:'#5FC9FF',spark:[60,70,68,80,75,90,95]},
];

const AGENTS = (T) => [
  {name:'Sierra Bot',desc:T('lang')==='ar'?'الوكيل الرئيسي للذكاء الاصطناعي — يتعامل مع استفسارات العملاء':'Primary AI concierge — handles client queries & property recommendations.',emoji:'🤖',color:'#00AEFF',status:'Online',load:94,tasks:1203},
  {name:'Leila / Lola',desc:T('lang')==='ar'?'متخصصة عربية ثنائية اللغة — ترجمة وتفاوض':'Bilingual Arabic specialist — translates listings & handles Gulf negotiations.',emoji:'🐪',color:'#1E88D9',status:'Online',load:87,tasks:889},
  {name:'Stage-9 Closer',desc:T('lang')==='ar'?'محرك الصفقات الآلي — عقود ومدفوعات':'Automated deal engine — drafts contracts, DocuSign, Stripe deposits.',emoji:'💼',color:'#34D399',status:'Online',load:71,tasks:421},
  {name:'WhatsApp Scraper',desc:T('lang')==='ar'?'يرصد مجموعات واتساب وبروبيرتي فايندر':'Monitors Property Finder, OLX & WhatsApp groups.',emoji:'🕵️',color:'#7C3AED',status:'Running',load:55,tasks:2847},
  {name:'The Scribe',desc:T('lang')==='ar'?'خط استيعاب S1-S2 — يحلل بيانات القوائم الخام':'S1-S2 ingestion — parses raw listing data & normalizes to Sierra schema.',emoji:'✍️',color:'#E63946',status:'Idle',load:12,tasks:4821},
  {name:'The Curator',desc:T('lang')==='ar'?'إدارة المخزون S3-S5 — تسعير وتقييم':'S3-S5 inventory management — deduplication, quality scoring & AVM pricing.',emoji:'🎨',color:'#5FC9FF',status:'Online',load:68,tasks:3102},
];

const WORKFLOWS = [
  {name:'Lead Ingestion → Firestore',status:'active',runs:12840,last:'2 min ago',color:'#34D399'},
  {name:'WhatsApp Scraper Cron (30m)',status:'active',runs:6420,last:'28 min ago',color:'#34D399'},
  {name:'Listing Price AVM Sync',status:'active',runs:3210,last:'1 hr ago',color:'#34D399'},
  {name:'Stage-9 Contract Generator',status:'active',runs:421,last:'15 min ago',color:'#34D399'},
  {name:'Broker KPI Report (Daily)',status:'active',runs:186,last:'6 hrs ago',color:'#1E88D9'},
  {name:'Stale Listing Monitor',status:'warning',runs:890,last:'2 hrs ago',color:'#f59e0b'},
  {name:'Email Follow-Up Sequence',status:'paused',runs:1240,last:'1 day ago',color:'#E63946'},
  {name:'Telegram Alert Dispatcher',status:'active',runs:5640,last:'4 min ago',color:'#34D399'},
];

const LEADS_DATA = [
  {name:'Ahmed Al-Rashid',phone:'+20 100 111 2233',interest:'Villa · Hyde Park · EGP 20M+',stage:'Viewing Scheduled',color:'#00AEFF',hot:true},
  {name:'Sara Mohamed',phone:'+20 101 222 3344',interest:'3-Bed · Mivida · Rent',stage:'AI Matched',color:'#1E88D9',hot:false},
  {name:'Khalid Mansour',phone:'+971 50 333 4455',interest:'Penthouse · Uptown · EGP 15M',stage:'Contract Draft',color:'#34D399',hot:true},
  {name:'Nadia Hassan',phone:'+20 112 444 5566',interest:'Apartment · Madinaty · EGP 5M',stage:'Initial Contact',color:'#7C3AED',hot:false},
  {name:'Omar Farouk',phone:'+20 100 555 6677',interest:'Twin House · Mountain View',stage:'Negotiating',color:'#E63946',hot:true},
  {name:'Layla Karim',phone:'+20 109 666 7788',interest:'Furnished 2-Bed · Eastown',stage:'AI Matched',color:'#5FC9FF',hot:false},
];

const COMPOUNDS_DATA = {
  'Mountain View iCity':{units:1820,avgM:'EGP 11.2M',growth:'+24%',zone:'5th Settlement',ai:9.6,color:'#00AEFF'},
  'Hyde Park':{units:2100,avgM:'EGP 18.5M',growth:'+22%',zone:'5th Settlement',ai:9.8,color:'#1E88D9'},
  'Mivida':{units:2400,avgM:'EGP 5.8M',growth:'+18%',zone:'5th Settlement',ai:9.1,color:'#34D399'},
  'Uptown Cairo':{units:3200,avgM:'EGP 9.4M',growth:'+31%',zone:'Uptown',ai:9.4,color:'#7C3AED'},
  'Madinaty':{units:8500,avgM:'EGP 4.5M',growth:'+15%',zone:'Madinaty',ai:8.8,color:'#E63946'},
  'Eastown':{units:1600,avgM:'EGP 8.2M',growth:'+19%',zone:'5th Settlement',ai:9.0,color:'#5FC9FF'},
  'Villette':{units:880,avgM:'EGP 9.8M',growth:'+20%',zone:'5th Settlement',ai:9.3,color:'#00AEFF'},
  'Palm Hills NC':{units:1200,avgM:'EGP 12.4M',growth:'+21%',zone:'5th Settlement',ai:9.2,color:'#1E88D9'},
};

const NAV_ITEMS = (T) => [
  {id:'overview',label:T('overview'),icon:'🏠',section:T('main')},
  {id:'agents',label:T('agents'),icon:'🤖',section:T('main'),badge:'6',badgeCls:'nb-green'},
  {id:'workflows',label:T('workflows'),icon:'⚡',section:T('main'),badge:'8',badgeCls:'nb-blue'},
  {id:'automations',label:T('lang')==='ar'?'الأتمتة':'Automations',icon:'🪄',section:T('main'),badge:'3',badgeCls:'nb-green'},
  {id:'openclaw',label:T('openclaw'),icon:'⚙️',section:T('main')},
  {id:'nexus',label:T('nexus'),icon:'📡',section:T('main'),badge:'LIVE',badgeCls:'nb-green'},
  {id:'nexus-exchange',label:T('lang')==='ar'?'مركز التبادل':'Exchange Hub',icon:'🔀',section:T('main'),badge:'LIVE',badgeCls:'nb-green'},
  {id:'leads',label:T('leads'),icon:'👥',section:T('operations'),badge:'23',badgeCls:'nb-red'},
  {id:'pipeline',label:T('lang')==='ar'?'الصفقات':'Pipeline',icon:'💼',section:T('operations')},
  {id:'tasks',label:T('lang')==='ar'?'المهام':'Tasks',icon:'✅',section:T('operations'),badge:'5',badgeCls:'nb-blue'},
  {id:'listings',label:T('listings'),icon:'🏘️',section:T('operations')},
  {id:'listings-manager',label:T('lang')==='ar'?'إدارة الوحدات':'Listings Manager',icon:'📝',section:T('operations')},
  {id:'requests',label:T('lang')==='ar'?'الطلبات':'Requests',icon:'🎫',section:T('operations')},
  {id:'curator',label:T('curator'),icon:'🎨',section:T('operations')},
  {id:'scribe',label:T('scribe'),icon:'✍️',section:T('operations')},
  {id:'closer',label:T('closer'),icon:'💼',section:T('operations')},
  {id:'reports',label:T('reports'),icon:'📊',section:T('analytics')},
  {id:'settings',label:T('settings'),icon:'🔧',section:T('system')},
];

const OPENCLAW_LOGS = [
  {t:'dim',l:'OpenClaw v3.2.1 · Sierra Estates Intelligence OS'},
  {t:'dim',l:'━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'},
  {t:'green',l:'[✓] Firebase Auth connection established'},
  {t:'green',l:'[✓] Firestore rules validated — 4 collections active'},
  {t:'green',l:'[✓] Sierra Bot online — 1,203 sessions this month'},
  {t:'green',l:'[✓] Leila/Lola agent — Arabic routing active'},
  {t:'green',l:'[✓] Stage-9 Closer — 97 deals processed this month'},
  {t:'blue',l:'[~] WhatsApp Scraper — scanning Property Finder (ETA 2 min)'},
  {t:'blue',l:'[~] AVM Engine — pricing 23 new listings...'},
  {t:'',l:''},
  {t:'prompt',l:'sierra status --all-agents'},
  {t:'green',l:'  Sierra Bot      Online    94%     1,203'},
  {t:'green',l:'  Leila/Lola      Online    87%     889'},
  {t:'green',l:'  Stage-9 Closer  Online    71%     421'},
  {t:'green',l:'  Scraper         Running   55%     2,847'},
  {t:'blue',l:'  The Scribe      Idle      12%     4,821'},
  {t:'green',l:'  The Curator     Online    68%     3,102'},
  {t:'dim',l:'Last sync: 2026-06-07 · All systems nominal'},
];

const NEXUS_INIT = [
  {id:'WA-0041',ts:'14:23:01',src:'Group: New Cairo Properties',raw:'شقة 3 غرف ميفيدا · دور 3 · 95م² · 14,500/شهر',compound:'Mivida',type:'Apartment',code:'SE-MVD-APT-0041-2026',status:'parsed'},
  {id:'WA-0040',ts:'14:19:44',src:'PropertyFinder Monitor',raw:'Villa Hyde Park · 5+1 BHK · 450m² · private pool · EGP 35M',compound:'Hyde Park',type:'Villa',code:'SE-HYP-VLA-0040-2026',status:'parsed'},
  {id:'WA-0039',ts:'14:17:12',src:'OLX Scraper',raw:'Penthouse Uptown Cairo · 320m · 4bed+maid · lake view · EGP 18.5M',compound:'Uptown Cairo',type:'Penthouse',code:'SE-UPC-PTH-0039-2026',status:'parsed'},
  {id:'WA-0038',ts:'14:14:55',src:'Group: Cairo Rentals',raw:'توين هاوس ماونتن فيو · 240م · 4 غرف · 28,000/شهر',compound:'Mountain View iCity',type:'Twin House',code:'SE-MVI-TWH-0038-2026',status:'processing'},
  {id:'WA-0037',ts:'14:11:03',src:'Telegram: MadinatyGroups',raw:'Apartment Madinaty B10 · 165m · 3bed · EGP 4.2M · owner direct',compound:'Madinaty',type:'Apartment',code:'SE-MDN-APT-0037-2026',status:'parsed'},
];

/* ── UTILS ───────────────────────────────────────────────────────────── */
function exportCSV(rows, filename) {
  if (!rows.length) return;
  const keys = Object.keys(rows[0]);
  const csv = [keys.join(','), ...rows.map(r => keys.map(k => `"${String(r[k]).replace(/"/g,'""')}"`).join(','))].join('\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([csv], {type:'text/csv'}));
  a.download = filename;
  a.click();
}

function Sparkline({ data, color }) {
  const max = Math.max(...data);
  return (
    <div className="sparkline">
      {data.map((v,i) => (
        <div key={i} className="spark-bar" style={{height:`${(v/max)*100}%`, background:color+'88', ...(i===data.length-1?{background:color}:{})}}/>
      ))}
    </div>
  );
}

/* ── ICONS ───────────────────────────────────────────────────────────── */
const Ic = {
  Sun:()=><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>,
  Moon:()=><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>,
  Collapse:()=><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6"/></svg>,
  Menu:()=><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>,
  Play:()=><svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>,
  Pause:()=><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>,
  Refresh:()=><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></svg>,
  X:()=><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12"/></svg>,
};

/* ── SHIELD LOGO ─────────────────────────────────────────────────────── */
function ShieldLogo({size=24}) {
  return <img src="/assets/logo-gold.png" alt="Sierra Estates" width={size} height={size} className="brand-logo" style={{objectFit:'contain',display:'block',flexShrink:0}}/>;
}

/* ── SIDEBAR NAV ──────────────────────────────────────────────────────── */
function SidebarContent({ T, tab, setTab, collapsed, setCollapsed, onClose }) {
  const navItems = NAV_ITEMS(T);
  const sections = [...new Set(navItems.map(n => n.section))];
  return (
    <>
      <div className="brand">
        <ShieldLogo size={28}/>
        {!collapsed && <div className="brand-text"><div className="brand-name">{T('brand')}</div><div className="brand-sub">{T('brandSub')}</div></div>}
        {onClose && <button onClick={onClose} style={{marginInlineStart:'auto',background:'none',border:'none',color:'var(--tx-f)',cursor:'pointer'}}><Ic.X/></button>}
      </div>
      <div style={{flex:1,overflowY:'auto',paddingBottom:8}}>
        {sections.map(sec => (
          <div key={sec}>
            {!collapsed && <div className="nav-section">{sec}</div>}
            {navItems.filter(n => n.section===sec).map(n => (
              <div key={n.id} className={`nav-item ${tab===n.id?'active':''}`} onClick={()=>{setTab(n.id);onClose&&onClose();}} title={n.label}>
                <span className="nav-icon">{n.icon}</span>
                <span>{n.label}</span>
                {n.badge && !collapsed && <span className={`nav-badge ${n.badgeCls}`}>{n.badge}</span>}
              </div>
            ))}
          </div>
        ))}
      </div>
      {!onClose && (
        <div style={{borderTop:'1px solid var(--bd)',padding:'10px 8px'}}>
          <div className="nav-item" onClick={()=>setCollapsed(c=>!c)} title={T('collapse')}>
            <span className="nav-icon" style={{transform:collapsed?'rotate(180deg)':'none',transition:'transform 300ms'}}><Ic.Collapse/></span>
            {!collapsed && <span>{T('collapse')}</span>}
          </div>
        </div>
      )}
    </>
  );
}

/* ── OVERVIEW PAGE ────────────────────────────────────────────────────── */
function OverviewPage({ T }) {
  const kpis = KPI_DATA(T);
  const ar = T('lang')==='ar';
  const chips = ar?['لخّص الصفقات الجارية','ما أولويات اليوم؟','اكتب رسالة متابعة','الصفقات المعرّضة للخطر']:['Summarize my pipeline','What should I focus on today?','Draft a follow-up (AR/EN)','Find deals at risk'];
  return (
    <div className="fade-up">
      <div className="ai-hero">
        <div style={{fontFamily:'JetBrains Mono',fontSize:9,letterSpacing:'.18em',textTransform:'uppercase',color:'var(--gold)',marginBottom:8}}>{(ar?'مساعد سييرا · ':'Sierra Copilot · ')+new Date().toLocaleDateString(ar?'ar-EG':'en-US',{weekday:'long',month:'long',day:'numeric'})}</div>
        <h2 style={{fontFamily:ar?"'Cairo',sans-serif":"'Cormorant Garamond',serif",fontSize:'1.9rem',fontWeight:ar?700:500,color:'var(--tx-s)',lineHeight:1.15,marginBottom:6}}>{ar?'كيف تساعدك سييرا في الإغلاق اليوم؟':'How can Sierra help you close today?'}</h2>
        <p style={{fontSize:12.5,color:'var(--tx-m)',maxWidth:520,marginBottom:14}}>{ar?'مساعد المبيعات الذكي يدير خط الصفقات، يصيغ الرسائل، ويبرز ما يحتاج انتباهك — اسأل فقط.':'Your AI sales copilot runs the pipeline, drafts bilingual outreach, and surfaces what needs attention — just ask.'}</p>
        <div style={{display:'flex',flexWrap:'wrap',gap:8,marginBottom:14}}>
          {chips.map((c,i)=><button key={i} className="ai-chip">{c}</button>)}
        </div>
        <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
          <button style={{padding:'10px 20px',border:'none',borderRadius:11,background:'linear-gradient(135deg,var(--gold),var(--gold-lt))',color:'#071422',fontSize:12,fontWeight:800,cursor:'pointer'}}>✦ {ar?'تحدث مع سييرا':'Chat with Sierra'} →</button>
          <button style={{padding:'10px 18px',borderRadius:11,border:'1px solid var(--bd-s)',background:'var(--bg-e)',color:'var(--tx)',fontSize:12,fontWeight:600,cursor:'pointer'}}>⚡ {ar?'تصرّف الآن':'Act Now'}</button>
          <span style={{alignSelf:'center',fontFamily:'JetBrains Mono',fontSize:10,color:'var(--tx-f)'}}>● 23 {ar?'عميل جديد اليوم':'new leads today'}</span>
        </div>
      </div>
      <div className="kpi-grid">
        {kpis.map((k,i) => (
          <div key={i} className="kpi-card" style={{'--accent':k.color}}>
            <div style={{position:'absolute',top:0,left:0,width:3,height:'100%',background:k.color,borderRadius:'16px 0 0 16px'}}/>
            <div className="kpi-val gold-text">{k.val}</div>
            <div className="kpi-lbl">{k.lbl}</div>
            <div className={`kpi-delta ${k.up?'up':'dn'}`}>{k.up?'↑':'↓'} {k.delta}</div>
            <Sparkline data={k.spark} color={k.color}/>
          </div>
        ))}
      </div>
      <div className="grid-3">
        <div className="card">
          <div className="card-hd"><span className="card-title">{T('pipelineTitle')}</span></div>
          <div className="card-body">
            <div className="bar-chart">
              {['S1','S2','S3','S4','S5','S6','S7','S8','S9','S10'].map((s,i) => {
                const h=[95,88,82,79,74,68,61,55,42,28][i];
                const c=['#00AEFF','#5FC9FF','#1E88D9','#34D399','#7C3AED','#E63946','#00AEFF','#1E88D9','#34D399','#00AEFF'][i];
                return (<div key={s} className="bar-col"><div className="bar-fill" style={{height:`${h}%`,background:`linear-gradient(180deg,${c},${c}44)`}}/><span className="bar-lbl">{s}</span></div>);
              })}
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-hd"><span className="card-title">{T('hotLeads')}</span><span className="chip chip-red">3 urgent</span></div>
          <div style={{maxHeight:160,overflowY:'auto'}}>
            {LEADS_DATA.filter(l=>l.hot).map((l,i)=>(
              <div key={i} className="lead-row">
                <div className="lead-avatar" style={{background:l.color}}>{l.name[0]}</div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:12,fontWeight:600,color:'var(--tx)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{l.name}</div>
                  <div style={{fontSize:9.5,color:'var(--tx-f)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{l.interest}</div>
                </div>
                <span className="chip chip-amber">{l.stage}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <div className="card-hd"><span className="card-title">{T('agentStatus')}</span></div>
          <div className="card-body" style={{display:'flex',flexDirection:'column',gap:8}}>
            {AGENTS(T).slice(0,4).map((a,i)=>(
              <div key={i} style={{display:'flex',alignItems:'center',gap:8}}>
                <span style={{fontSize:16}}>{a.emoji}</span>
                <div style={{flex:1}}>
                  <div style={{display:'flex',justifyContent:'space-between',marginBottom:3}}>
                    <span style={{fontSize:11,fontWeight:600,color:'var(--tx)'}}>{a.name}</span>
                    <span style={{fontFamily:'JetBrains Mono',fontSize:9,color:a.status==='Idle'?'var(--tx-f)':'var(--emerald)'}}>{a.status}</span>
                  </div>
                  <div className="progress-bar"><div className="progress-fill" style={{width:`${a.load}%`,background:a.color}}/></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── AGENTS PAGE ──────────────────────────────────────────────────────── */
function AgentsPage({ T }) {
  const [active,setActive]=useState(null);
  const agents = AGENTS(T);
  return (
    <div className="fade-up">
      <div className="agent-grid" style={{marginBottom:20}}>
        {agents.map((a,i)=>(
          <div key={i} className="agent-card" onClick={()=>setActive(active===i?null:i)} style={{borderColor:active===i?`${a.color}60`:'var(--bd)'}}>
            <div className="agent-icon" style={{background:`${a.color}18`,border:`1px solid ${a.color}30`}}>{a.emoji}</div>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:4}}>
              <div style={{fontWeight:700,fontSize:13,color:'var(--tx)'}}>{a.name}</div>
              <span className={`chip ${a.status==='Online'||a.status==='Running'?'chip-green':a.status==='Idle'?'chip-amber':'chip-blue'}`}><span className="pulse-dot">●</span> {a.status}</span>
            </div>
            <div style={{fontSize:10.5,color:'var(--tx-m)',lineHeight:1.5,marginBottom:10}}>{a.desc}</div>
            <div style={{display:'flex',justifyContent:'space-between',fontFamily:'JetBrains Mono',fontSize:9}}>
              <span style={{color:'var(--tx-f)'}}>{T('load')}</span><span style={{color:a.color,fontWeight:700}}>{a.load}%</span>
            </div>
            <div className="progress-bar"><div className="progress-fill" style={{width:`${a.load}%`,background:a.color}}/></div>
            <div style={{display:'flex',justifyContent:'space-between',fontFamily:'JetBrains Mono',fontSize:9,marginTop:8}}>
              <span style={{color:'var(--tx-f)'}}>{T('totalTasks')}</span><span style={{color:'var(--tx)',fontWeight:700}}>{a.tasks.toLocaleString()}</span>
            </div>
            {active===i&&(
              <div style={{marginTop:12,paddingTop:12,borderTop:'1px solid var(--bd)',display:'flex',gap:6}}>
                <button className="btn btn-ghost" style={{fontSize:10}}>⚙ {T('config')}</button>
                <button className="btn btn-ghost" style={{fontSize:10}}>📋 {T('logs')}</button>
                <button className="btn btn-green" style={{fontSize:10}}><Ic.Play/> {T('restart')}</button>
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="card">
        <div className="card-hd"><span className="card-title">🐪 Lola · Live Chat</span><span className="chip chip-green"><span className="pulse-dot">●</span> Online</span></div>
        <div className="card-body">
          <div style={{display:'flex',flexDirection:'column',gap:8,maxHeight:160,overflowY:'auto',marginBottom:10}}>
            <div className="chat-msg ai">مرحباً! أنا ليلى — مساعدتك العقارية. كيف أقدر أساعدك؟</div>
            <div className="chat-msg user">فيلا هايد بارك فوق 15 مليون</div>
            <div className="chat-msg ai">لدينا 3 فيلل في هايد بارك من 18.5 مليون. أبرزها 6 غرف + حمام سباحة. هل أرسل الملف؟</div>
          </div>
          <div style={{display:'flex',gap:8}}>
            <input style={{flex:1,background:'var(--surf)',border:'1px solid var(--bd)',borderRadius:10,padding:'8px 12px',fontSize:12,color:'var(--tx)',outline:'none'}} placeholder="Test Lola/Leila…"/>
            <button className="btn btn-gold">{T('sendMsg')}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── WORKFLOWS PAGE ───────────────────────────────────────────────────── */
function WorkflowsPage({ T }) {
  const [wfs,setWfs]=useState(WORKFLOWS.map(w=>({...w})));
  const toggle=i=>setWfs(p=>p.map((w,j)=>j===i?{...w,status:w.status==='paused'?'active':'paused'}:w));
  return (
    <div className="fade-up">
      <div style={{display:'flex',gap:8,marginBottom:16,flexWrap:'wrap'}}>
        <button className="btn btn-gold"><Ic.Play/> Run All Active</button>
        <button className="btn btn-ghost"><Ic.Refresh/> Refresh</button>
      </div>
      <div className="grid-2">
        <div className="card">
          <div className="card-hd"><span className="card-title">Automation Workflows · n8n</span></div>
          <div style={{padding:'8px 0'}}>
            {wfs.map((w,i)=>(
              <div key={i} className="wf-node">
                <div className="wf-dot pulse-dot" style={{background:w.color}}/>
                <div style={{flex:1,minWidth:0}}>
                  <p style={{fontSize:12,fontWeight:600,color:'var(--tx)',marginBottom:2}}>{w.name}</p>
                  <p style={{fontSize:9.5,color:'var(--tx-f)',fontFamily:'JetBrains Mono'}}>{w.runs.toLocaleString()} runs · {w.last}</p>
                </div>
                <span className={`chip ${w.status==='active'?'chip-green':w.status==='warning'?'chip-amber':'chip-red'}`}>{w.status}</span>
                <button onClick={()=>toggle(i)} className="btn btn-ghost" style={{padding:'4px 8px',fontSize:10,marginInlineStart:4}}>
                  {w.status==='paused'?<Ic.Play/>:<Ic.Pause/>}
                </button>
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <div className="card-hd"><span className="card-title">Lead Pipeline · Stage Funnel</span></div>
          <div className="card-body">
            {[{s:'S1-2',label:'Ingestion & Parsing',count:4821,pct:100,color:'#1E88D9'},{s:'S3-5',label:'Inventory & Pricing',count:3102,pct:64,color:'#00AEFF'},{s:'S6-8',label:'Matching & Outreach',count:1240,pct:26,color:'#34D399'},{s:'S9',label:'Negotiation',count:421,pct:8.7,color:'#7C3AED'},{s:'S10',label:'Closed Deals',count:97,pct:2,color:'#E63946'}].map((row,i)=>(
              <div key={i} style={{marginBottom:12}}>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
                  <span style={{fontSize:11,color:'var(--tx)'}}><strong style={{color:row.color,fontFamily:'JetBrains Mono'}}>{row.s}</strong> · {row.label}</span>
                  <span style={{fontFamily:'JetBrains Mono',fontSize:11,color:'var(--tx-m)'}}>{row.count.toLocaleString()}</span>
                </div>
                <div className="progress-bar" style={{height:6}}><div className="progress-fill" style={{width:`${row.pct}%`,background:`linear-gradient(90deg,${row.color},${row.color}80)`}}/></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── OPENCLAW PAGE ────────────────────────────────────────────────────── */
function OpenClawPage({ T }) {
  const [cmd,setCmd]=useState('');
  const [logs,setLogs]=useState(OPENCLAW_LOGS);
  const termRef=useRef(null);
  useEffect(()=>{if(termRef.current)termRef.current.scrollTop=termRef.current.scrollHeight;},[logs]);
  const runCmd=e=>{
    if(e.key!=='Enter')return;
    const c=cmd.trim();if(!c)return;
    const nl=[...logs,{t:'prompt',l:c}];
    if(c==='clear'){setLogs([]);setCmd('');return;}
    if(c.includes('status'))nl.push({t:'green',l:'[✓] All 6 agents operational · Last check: now'});
    else if(c.includes('sync'))nl.push({t:'blue',l:'[~] Triggering full sync...'},{t:'green',l:'[✓] Sync complete · 1,547 listings updated'});
    else if(c.includes('leads'))nl.push({t:'',l:'  Active: 284 · Hot: 3 · Today: +8'});
    else if(c.includes('help'))nl.push({t:'dim',l:'Commands: status · sync · leads · agents · deploy · clear'});
    else nl.push({t:'red',l:`[!] Unknown: ${c}. Try 'help'`});
    setLogs(nl);setCmd('');
  };
  return (
    <div className="fade-up">
      <div style={{display:'flex',gap:8,marginBottom:16,flexWrap:'wrap'}}>
        <button className="btn btn-ghost" onClick={()=>setLogs(OPENCLAW_LOGS)}><Ic.Refresh/> Reset</button>
        <button className="btn btn-gold" onClick={()=>setLogs(l=>[...l,{t:'blue',l:'[~] Connecting to API...'},{t:'green',l:'[✓] Connection established · v2.4 ready'}])}>⚡ Test API</button>
      </div>
      <div className="card" style={{marginBottom:14}}>
        <div className="card-hd"><span className="card-title">⚙️ OpenClaw · Sierra Intelligence Terminal</span><span className="chip chip-green"><span className="pulse-dot">●</span> Connected</span></div>
        <div ref={termRef} className="terminal" style={{height:340,margin:'0 14px 14px'}}>
          {logs.map((l,i)=><div key={i} className={`term-line${l.t?' '+l.t:''} ${l.t==='prompt'?'term-prompt':''}`}>{l.l}</div>)}
          <div style={{display:'flex',alignItems:'center',gap:6,marginTop:8}}>
            <span style={{color:'var(--gold)'}}>sierra@intel:~$</span>
            <input value={cmd} onChange={e=>setCmd(e.target.value)} onKeyDown={runCmd} style={{flex:1,background:'transparent',border:'none',outline:'none',fontFamily:'JetBrains Mono',fontSize:11,color:'var(--gold-lt)'}} placeholder="Type a command…"/>
          </div>
        </div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(150px,1fr))',gap:10}}>
        {[{l:'Deploy Frontend',c:'🚀'},{l:'Sync Firestore',c:'🔄'},{l:'Run All Agents',c:'🤖'},{l:'Backup Database',c:'💾'},{l:'Clear Cache',c:'🧹'},{l:'Test Webhooks',c:'⚡'}].map((a,i)=>(
          <button key={i} className="btn btn-ghost" style={{flexDirection:'column',height:56,justifyContent:'center',gap:4}}
            onClick={()=>setLogs(l=>[...l,{t:'blue',l:`[~] Running: ${a.l}...`},{t:'green',l:`[✓] ${a.l} completed`}])}>
            <span style={{fontSize:18}}>{a.c}</span><span style={{fontSize:9,fontFamily:'JetBrains Mono'}}>{a.l}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ── LEADS PAGE ───────────────────────────────────────────────────────── */
function LeadsPage({ T }) {
  const [q,setQ]=useState('');
  const [importModal,setImportModal]=useState(false);
  const filtered=useMemo(()=>LEADS_DATA.filter(l=>!q||l.name.toLowerCase().includes(q.toLowerCase())||l.interest.toLowerCase().includes(q.toLowerCase())),[q]);
  const stageChip=s=>({
    'Viewing Scheduled':'chip-blue','AI Matched':'chip-green','Contract Draft':'chip-green',
    'Initial Contact':'chip-amber','Negotiating':'chip-red',
  })[s]||'chip-amber';
  const doExport=()=>exportCSV(filtered.map(l=>({Name:l.name,Phone:l.phone,Interest:l.interest,Stage:l.stage,Hot:l.hot?'Yes':'No'})),'sierra_leads.csv');
  return (
    <div className="fade-up">
      <div style={{display:'flex',gap:8,marginBottom:16,flexWrap:'wrap'}}>
        <input value={q} onChange={e=>setQ(e.target.value)} className="f-in" style={{flex:1,minWidth:160}} placeholder={T('search')}/>
        <button className="btn btn-gold">+ {T('leads').includes('CRM')?'Add Lead':'إضافة عميل'}</button>
        <button className="btn btn-ghost" onClick={doExport}>⬇ {T('exportCSV')}</button>
        <button className="btn btn-ghost" onClick={()=>setImportModal(true)}>⬆ {T('importCSV')}</button>
      </div>
      <div className="card">
        <div className="card-hd"><span className="card-title">CRM · {T('leads')}</span><span className="chip chip-red">{filtered.length}</span></div>
        <div style={{overflowX:'auto'}}>
          <table className="data-table">
            <thead><tr><th>{T('client')}</th><th>{T('phone')}</th><th>{T('interest')}</th><th>{T('stage')}</th><th>{T('actions')}</th></tr></thead>
            <tbody>
              {filtered.map((l,i)=>(
                <tr key={i}>
                  <td><div style={{display:'flex',alignItems:'center',gap:8}}><div className="lead-avatar" style={{background:l.color,width:28,height:28,fontSize:11}}>{l.name[0]}</div><span style={{color:'var(--tx)',fontWeight:600}}>{l.name}</span>{l.hot&&<span>🔥</span>}</div></td>
                  <td style={{fontFamily:'JetBrains Mono',fontSize:10}}>{l.phone}</td>
                  <td>{l.interest}</td>
                  <td><span className={`chip ${stageChip(l.stage)}`}>{l.stage}</span></td>
                  <td><div style={{display:'flex',gap:4}}>
                    <button className="btn btn-ghost" style={{padding:'3px 8px',fontSize:9}}>📋 {T('view')}</button>
                    <button className="btn btn-green" style={{padding:'3px 8px',fontSize:9}}>💬 {T('whatsapp')}</button>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {importModal&&(
        <div className="modal-ov" onClick={e=>e.target===e.currentTarget&&setImportModal(false)}>
          <div className="modal-box">
            <div className="modal-hd">
              <span style={{fontFamily:'JetBrains Mono',fontSize:11,fontWeight:700,color:'var(--gold)'}}>IMPORT CSV · LEADS</span>
              <button onClick={()=>setImportModal(false)} style={{background:'none',border:'none',cursor:'pointer',color:'var(--tx-f)'}}><Ic.X/></button>
            </div>
            <div style={{padding:22,display:'flex',flexDirection:'column',gap:14}}>
              <p style={{fontSize:12,color:'var(--tx-m)',lineHeight:1.6}}>Upload a CSV with columns: Name, Phone, Interest, Stage, Hot</p>
              <input type="file" accept=".csv" style={{background:'var(--surf)',border:'1px dashed var(--bd-s)',borderRadius:10,padding:'14px',color:'var(--tx-m)',fontSize:12,cursor:'pointer'}}/>
              <div style={{display:'flex',gap:8}}>
                <button className="btn btn-gold" style={{flex:1}}>⬆ Import Leads</button>
                <button className="btn btn-ghost" onClick={()=>setImportModal(false)}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── CURATOR PAGE (S3-S5) ─────────────────────────────────────────────── */
function CuratorPage({ T }) {
  const [selectedCpd, setSelectedCpd] = useState('Mivida');
  const [priceAdj, setPriceAdj] = useState(0);
  const cpds = Object.entries(COMPOUNDS_DATA);
  const selected = COMPOUNDS_DATA[selectedCpd];

  const listings = [
    {code:'SE-MVD-APT-0041',type:'Apartment',area:95,beds:3,basePrice:5800000,quality:88,status:'parsed'},
    {code:'SE-MVD-VLA-0039',type:'Villa',area:320,beds:5,basePrice:22000000,quality:96,status:'indexed'},
    {code:'SE-MVD-TWH-0038',type:'Twin House',area:240,beds:4,basePrice:14500000,quality:79,status:'processing'},
    {code:'SE-MVD-DPX-0037',type:'Duplex',area:210,beds:3,basePrice:11200000,quality:85,status:'parsed'},
  ];

  const adjPrice = (p) => Math.round(p * (1 + priceAdj / 100)).toLocaleString();

  return (
    <div className="fade-up">
      <div style={{marginBottom:16,display:'flex',gap:10,alignItems:'center',flexWrap:'wrap'}}>
        <h2 style={{fontFamily:'Cormorant Garamond',fontSize:'1.3rem',fontWeight:500,color:'var(--tx)',flex:1}}>{T('curator_title')}</h2>
        <select className="f-in" style={{width:'auto'}} value={selectedCpd} onChange={e=>setSelectedCpd(e.target.value)}>
          {cpds.map(([n])=><option key={n}>{n}</option>)}
        </select>
        <button className="btn btn-gold">⬇ {T('exportCSV')}</button>
      </div>

      {/* Compound Summary */}
      {selected && (
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(130px,1fr))',gap:10,marginBottom:20}}>
          {[['AI Score',`${selected.ai}/10`,selected.color],['Avg Price',selected.avgM,'#00AEFF'],['Units',selected.units.toLocaleString(),'#1E88D9'],['Growth',selected.growth,'#34D399'],['Zone',selected.zone,'#7C3AED']].map(([l,v,c],i)=>(
            <div key={i} style={{background:'var(--bg-e)',border:'1px solid var(--bd)',borderRadius:12,padding:'12px 14px',borderTop:`3px solid ${c}`}}>
              <div style={{fontFamily:'JetBrains Mono',fontSize:13,fontWeight:700,color:c,marginBottom:3}}>{v}</div>
              <div style={{fontSize:9,color:'var(--tx-f)',textTransform:'uppercase',letterSpacing:'.12em'}}>{l}</div>
            </div>
          ))}
        </div>
      )}

      {/* AVM Price Adjustment */}
      <div className="grid-2" style={{marginBottom:20}}>
        <div className="card">
          <div className="card-hd"><span className="card-title">🏷️ {T('avm')} · {T('priceAdj')}</span></div>
          <div className="card-body">
            <div style={{marginBottom:12}}>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:8,fontSize:12}}>
                <span style={{color:'var(--tx-m)'}}>{T('priceAdj')}</span>
                <span style={{fontFamily:'JetBrains Mono',fontWeight:700,color:priceAdj>0?'var(--emerald)':priceAdj<0?'var(--red)':'var(--tx-m)'}}>{priceAdj>0?'+':''}{priceAdj}%</span>
              </div>
              <div className="slider-wrap">
                <input type="range" min="-20" max="20" value={priceAdj} onChange={e=>{setPriceAdj(+e.target.value);e.target.style.setProperty('--pct',`${(+e.target.value+20)/40*100}%`);}} style={{'--pct':`${(priceAdj+20)/40*100}%`}}/>
              </div>
              <div style={{display:'flex',justifyContent:'space-between',fontSize:9,color:'var(--tx-f)',marginTop:4}}>
                <span>-20%</span><span>0%</span><span>+20%</span>
              </div>
            </div>
            <div style={{padding:'10px',background:'rgba(0,174,255,.06)',borderRadius:8,border:'1px solid rgba(0,174,255,.15)',fontSize:11}}>
              <div style={{color:'var(--tx-m)',marginBottom:3}}>Sample unit adjustment:</div>
              <div style={{fontFamily:'JetBrains Mono',fontWeight:700,color:'var(--gold)'}}>EGP 5,800,000 → EGP {adjPrice(5800000)}</div>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-hd"><span className="card-title">📊 {T('qualityScore')} Distribution</span></div>
          <div className="card-body">
            <div className="bar-chart">
              {[['90-100',4,'#34D399'],['80-90',8,'#00AEFF'],['70-80',6,'#1E88D9'],['60-70',3,'#7C3AED'],['<60',1,'#E63946']].map(([l,v,c],i)=>(
                <div key={i} className="bar-col">
                  <div className="bar-fill" style={{height:`${v*9}%`,background:`linear-gradient(180deg,${c},${c}55)`}}/>
                  <span className="bar-lbl">{l}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Listings Table */}
      <div className="card">
        <div className="card-hd"><span className="card-title">📋 {selectedCpd} · Inventory ({listings.length} units)</span></div>
        <div style={{overflowX:'auto'}}>
          <table className="data-table">
            <thead><tr><th>Unit Code</th><th>{T('type')}</th><th>{T('area')}</th><th>{T('beds')}</th><th>Base Price</th><th>Adj. Price</th><th>{T('qualityScore')}</th><th>{T('status')}</th></tr></thead>
            <tbody>
              {listings.map((l,i)=>(
                <tr key={i}>
                  <td style={{fontFamily:'JetBrains Mono',fontSize:9,color:'var(--gold)'}}>{l.code}</td>
                  <td>{l.type}</td>
                  <td style={{fontFamily:'JetBrains Mono'}}>{l.area}m²</td>
                  <td style={{fontFamily:'JetBrains Mono'}}>{l.beds}</td>
                  <td style={{fontFamily:'JetBrains Mono',color:'var(--tx-m)'}}>EGP {l.basePrice.toLocaleString()}</td>
                  <td style={{fontFamily:'JetBrains Mono',color:'var(--gold)',fontWeight:700}}>EGP {adjPrice(l.basePrice)}</td>
                  <td>
                    <div style={{display:'flex',alignItems:'center',gap:6}}>
                      <div className="progress-bar" style={{width:50,height:4}}><div className="progress-fill" style={{width:`${l.quality}%`,background:l.quality>90?'var(--emerald)':l.quality>75?'var(--gold)':'var(--amber)'}}/></div>
                      <span style={{fontFamily:'JetBrains Mono',fontSize:9,color:'var(--tx-m)'}}>{l.quality}</span>
                    </div>
                  </td>
                  <td><span className={`chip ${l.status==='indexed'?'chip-green':l.status==='parsed'?'chip-blue':'chip-amber'}`}>{l.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ── SCRIBE PAGE (S1-S2) ──────────────────────────────────────────────── */
function ScribePage({ T }) {
  const [raw, setRaw] = useState('');
  const [parsed, setParsed] = useState(null);
  const [parsing, setParsing] = useState(false);

  const EXAMPLES = [
    "شقة 3 غرف ميفيدا · دور 3 · مفروشة · 95م² · 14,500/شهر",
    "Villa Hyde Park · 5+1 BHK · 450m² · private pool · EGP 35M negotiable",
    "Penthouse Uptown Cairo · last floor · 320m · 4bed+maid · lake view · EGP 18.5M",
  ];

  const parseRaw = () => {
    if (!raw.trim()) return;
    setParsing(true);
    setTimeout(() => {
      const isArabic = /[\u0600-\u06FF]/.test(raw);
      const areaMatch = raw.match(/(\d+)\s*م²?|(\d+)\s*m²?/i);
      const priceMatch = raw.match(/EGP\s*([\d,.]+M?)|(\d+[\d,]*)\s*\/شهر|(\d+[\d,]*)\s*\/mo/i);
      const bedsMatch = raw.match(/(\d+)\s*(?:bed|غرف|BHK)/i);
      const typeKws = {Villa:['villa','فيلا'],Apartment:['apartment','شقة','apt'],Penthouse:['penthouse'],Duplex:['duplex','دوبلكس'],'Twin House':['twin','توين']};
      let type = 'Apartment';
      for(const [t,kws] of Object.entries(typeKws)){if(kws.some(k=>raw.toLowerCase().includes(k))){type=t;break;}}
      const cpds=['Mivida','Hyde Park','Mountain View iCity','Uptown Cairo','Madinaty','Eastown','Villette'];
      const cpd = cpds.find(c=>raw.toLowerCase().includes(c.toLowerCase()))||'Unknown';
      const rent = /شهر|\/mo|\/month|rent/i.test(raw);
      setParsed([
        {k:'Compound',v:cpd},
        {k:'Type',v:type},
        {k:'Area',v:areaMatch?`${areaMatch[1]||areaMatch[2]}m²`:'—'},
        {k:'Bedrooms',v:bedsMatch?bedsMatch[1]:'—'},
        {k:'Price',v:priceMatch?priceMatch[0]:'—'},
        {k:'Purpose',v:rent?'Rent':'Resale'},
        {k:'Language',v:isArabic?'Arabic':'English'},
        {k:'SBR Code',v:`SE-${cpd.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,3)}-${type.slice(0,3).toUpperCase()}-${String(Math.floor(Math.random()*9000)+1000)}-2026`},
      ]);
      setParsing(false);
    }, 900);
  };

  return (
    <div className="fade-up">
      <div style={{marginBottom:16}}>
        <h2 style={{fontFamily:'Cormorant Garamond',fontSize:'1.3rem',fontWeight:500,color:'var(--tx)',marginBottom:4}}>{T('scribe_title')}</h2>
        <p style={{fontSize:12,color:'var(--tx-m)'}}>Paste raw WhatsApp / Property Finder text and the AI parser will extract structured data.</p>
      </div>
      <div className="grid-2">
        <div className="card">
          <div className="card-hd"><span className="card-title">📥 {T('rawInput')}</span></div>
          <div style={{padding:'14px 16px',display:'flex',flexDirection:'column',gap:12}}>
            <textarea className="parse-box" value={raw} onChange={e=>setRaw(e.target.value)} placeholder="Paste raw listing text here…&#10;&#10;E.g.: Villa Hyde Park · 5+1 BHK · 450m² · pool · EGP 35M"/>
            <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
              <button className="btn btn-gold" onClick={parseRaw} disabled={parsing||!raw.trim()} style={{opacity:!raw.trim()?0.5:1}}>
                {parsing?'Parsing…':'🧠 '+T('parseBtn')}
              </button>
              <button className="btn btn-ghost" onClick={()=>{setRaw('');setParsed(null);}}>Clear</button>
            </div>
            <div>
              <div style={{fontSize:9,color:'var(--tx-f)',textTransform:'uppercase',letterSpacing:'.12em',marginBottom:6}}>Quick Examples</div>
              {EXAMPLES.map((ex,i)=>(
                <button key={i} onClick={()=>setRaw(ex)} style={{display:'block',width:'100%',textAlign:'start',background:'var(--surf)',border:'1px solid var(--bd)',borderRadius:8,padding:'8px 10px',fontSize:10.5,color:'var(--tx-m)',cursor:'pointer',marginBottom:5,lineHeight:1.5}}>
                  {ex}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-hd"><span className="card-title">✅ {T('parsedOutput')}</span>{parsed&&<span className="chip chip-green">Parsed</span>}</div>
          <div style={{padding:'14px 16px'}}>
            {!parsed&&!parsing&&<div style={{textAlign:'center',padding:'40px 0',color:'var(--tx-f)',fontSize:12}}>Paste raw text → click Parse</div>}
            {parsing&&<div style={{textAlign:'center',padding:'40px 0'}}>
              <div style={{fontFamily:'JetBrains Mono',fontSize:11,color:'var(--gold)'}}>Parsing with AI…</div>
              <div style={{marginTop:12,display:'flex',gap:4,justifyContent:'center'}}>
                {[0,1,2].map(i=><span key={i} style={{width:6,height:6,borderRadius:'50%',background:'var(--gold)',display:'block',animation:`pulse ${.4+i*.15}s ease-in-out infinite`}}/>)}
              </div>
            </div>}
            {parsed&&parsed.map((f,i)=>(
              <div key={i} className="parsed-field">
                <span className="parsed-key">{f.k}</span>
                <span className="parsed-val">{f.v}</span>
                <span style={{marginInlineStart:'auto',color:'var(--emerald)',fontSize:10}}>✓</span>
              </div>
            ))}
            {parsed&&(
              <div style={{marginTop:14,display:'flex',gap:8}}>
                <button className="btn btn-gold" style={{flex:1}}>💾 Save to Firestore</button>
                <button className="btn btn-ghost" onClick={()=>exportCSV([Object.fromEntries(parsed.map(f=>[f.k,f.v]))],'parsed_listing.csv')}>⬇ CSV</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Ingestion Stats */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(130px,1fr))',gap:10,marginTop:20}}>
        {[['Ingested Today','41','#00AEFF'],['Parsed','38','#34D399'],['Processing','2','#f59e0b'],['Failed','1','#E63946'],['Queue','0','#1E88D9']].map(([l,v,c],i)=>(
          <div key={i} style={{background:'var(--bg-e)',border:'1px solid var(--bd)',borderRadius:12,padding:'12px 14px',textAlign:'center'}}>
            <div style={{fontFamily:'JetBrains Mono',fontSize:18,fontWeight:700,color:c}}>{v}</div>
            <div style={{fontSize:9,color:'var(--tx-f)',marginTop:4,textTransform:'uppercase',letterSpacing:'.1em'}}>{l}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── NEXUS-AI PAGE ────────────────────────────────────────────────────── */
function NexusAIPage({ T }) {
  const [feed,setFeed]=useState(NEXUS_INIT);
  const [ctr,setCtr]=useState(41);
  const [filter,setFilter]=useState('All');
  const cpds=['All','Mivida','Hyde Park','Mountain View iCity','Uptown Cairo','Madinaty','Eastown'];

  useEffect(()=>{
    const iv=setInterval(()=>{
      const c=cpds.filter(x=>x!=='All')[Math.floor(Math.random()*(cpds.length-1))];
      const types=['Apartment','Villa','Twin House','Duplex','Penthouse'];
      const t=types[Math.floor(Math.random()*types.length)];
      const d=new Date();const ts=`${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}:${String(d.getSeconds()).padStart(2,'0')}`;
      const area=Math.floor(Math.random()*280)+100;
      const price=(Math.random()*22+3).toFixed(1);
      setCtr(n=>{
        const nn=n+1;
        const pfx=c.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,3);
        setFeed(f=>[{id:`WA-00${nn}`,ts,src:'WhatsApp Scraper',raw:`${t} ${c} · ${area}m² · EGP ${price}M`,compound:c,type:t,code:`SE-${pfx}-${t.slice(0,3).toUpperCase()}-${String(nn).padStart(4,'0')}-2026`,status:Math.random()>.15?'parsed':'processing'},...f].slice(0,12));
        return nn;
      });
    },3500);
    return ()=>clearInterval(iv);
  },[]);

  const displayed=filter==='All'?feed:feed.filter(m=>m.compound===filter);

  return (
    <div className="fade-up">
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10,marginBottom:18}}>
        {[[ctr,'Ingested Today','#00AEFF'],[Math.round(ctr*.93),'Parsed','#34D399'],[Math.max(0,Math.round(ctr*.06)),'Processing','#f59e0b'],[Math.max(0,Math.round(ctr*.01)),'Failed','#E63946']].map(([v,l,c],i)=>(
          <div key={i} style={{background:'var(--bg-e)',border:'1px solid var(--bd)',borderRadius:12,padding:'12px 14px',borderTop:`3px solid ${c}`}}>
            <div style={{fontFamily:'JetBrains Mono',fontSize:22,fontWeight:700,color:c,marginBottom:4}}>{typeof v==='number'?v.toLocaleString():v}</div>
            <div style={{fontSize:9,color:'var(--tx-f)',textTransform:'uppercase',letterSpacing:'.1em'}}>{l}</div>
          </div>
        ))}
      </div>
      <div style={{display:'flex',gap:8,marginBottom:14,flexWrap:'wrap',alignItems:'center'}}>
        <span style={{fontSize:10,color:'var(--tx-f)',fontFamily:'JetBrains Mono',textTransform:'uppercase',letterSpacing:'.1em'}}>Filter by Compound:</span>
        {cpds.map(c=>(
          <button key={c} onClick={()=>setFilter(c)} className="btn btn-ghost" style={{padding:'4px 10px',fontSize:10,borderColor:filter===c?'var(--gold)':'var(--bd)',color:filter===c?'var(--gold)':'var(--tx-m)',background:filter===c?'rgba(0,174,255,.1)':'var(--surf)'}}>
            {c}
          </button>
        ))}
      </div>
      <div className="grid-3">
        <div className="card">
          <div className="card-hd"><span className="card-title">📥 WhatsApp Feed</span><span className="chip chip-green"><span className="pulse-dot">●</span> Live</span></div>
          <div style={{maxHeight:400,overflowY:'auto'}}>
            {displayed.map((m,i)=>(
              <div key={m.id} style={{padding:'10px 14px',borderBottom:'1px solid var(--bd)',background:i===0?'rgba(0,174,255,.04)':'transparent',transition:'background .6s'}}>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:3}}>
                  <span style={{fontFamily:'JetBrains Mono',fontSize:9,color:'var(--gold)',fontWeight:700}}>{m.id}</span>
                  <span style={{fontFamily:'JetBrains Mono',fontSize:9,color:'var(--tx-f)'}}>{m.ts}</span>
                </div>
                <div style={{fontSize:11,color:'var(--tx)',lineHeight:1.5,marginBottom:5}}>{m.raw}</div>
                <div style={{display:'flex',gap:6,alignItems:'center'}}>
                  <span className={`chip ${m.status==='parsed'?'chip-green':'chip-amber'}`}>{m.status}</span>
                  <span style={{fontFamily:'JetBrains Mono',fontSize:8,color:'rgba(0,174,255,.55)'}}>{m.code}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <div className="card-hd"><span className="card-title">📊 Parse Stats · Live</span></div>
          <div className="card-body" style={{display:'flex',flexDirection:'column',gap:10}}>
            {[['Parsed OK',93,'#34D399'],['Processing',6,'#f59e0b'],['Failed',1,'#E63946'],['Arabic entries',38,'#00AEFF'],['English entries',62,'#1E88D9']].map(([l,v,c],i)=>(
              <div key={i}>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:4,fontSize:11}}>
                  <span style={{color:'var(--tx-m)'}}>{l}</span>
                  <span style={{fontFamily:'JetBrains Mono',fontWeight:700,color:c}}>{v}%</span>
                </div>
                <div className="progress-bar" style={{height:5}}><div className="progress-fill" style={{width:`${v}%`,background:c}}/></div>
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <div className="card-hd"><span className="card-title">🔢 Unit Code Registry</span><span className="chip chip-green">{ctr}</span></div>
          <div style={{maxHeight:400,overflowY:'auto'}}>
            <div style={{padding:'10px 14px'}}>
              <div style={{fontFamily:'JetBrains Mono',fontSize:7,color:'var(--tx-f)',letterSpacing:'.14em',marginBottom:10,paddingBottom:8,borderBottom:'1px solid var(--bd)'}}>SCHEMA: SE-[CMPD]-[TYPE]-[ID]-[YEAR]</div>
              {displayed.map((m,i)=>(
                <div key={m.id} style={{display:'flex',alignItems:'center',gap:8,padding:'7px 0',borderBottom:'1px solid var(--bd)'}}>
                  <div style={{width:7,height:7,borderRadius:'50%',background:m.status==='parsed'?'var(--emerald)':'var(--gold)',flexShrink:0,animation:i===0?'pulse 1.5s ease-in-out infinite':'none'}}/>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontFamily:'JetBrains Mono',fontSize:9.5,color:'var(--gold)',fontWeight:700}}>{m.code}</div>
                    <div style={{fontSize:9.5,color:'var(--tx-m)',marginTop:1}}>{m.compound} · {m.type}</div>
                  </div>
                  <span className={`chip ${m.status==='parsed'?'chip-green':'chip-amber'}`} style={{fontSize:8,padding:'2px 5px'}}>{m.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── NEXUS EXCHANGE HUB ───────────────────────────────────────────────── */
/* Ported from SE's apps/admin Vite SPA (NexusExchangePage.tsx); data layer
   is the shared @sierra-estates/exchange package (Firestore /exchange
   collection — the message bus between Admin UI, agents, and workflows). */
function NexusExchangeStatusBadge({ status }) {
  const colors = {
    pending: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    running: 'bg-blue-500/10 text-blue-500 border-blue-500/20 animate-pulse',
    done: 'bg-green-500/10 text-green-500 border-green-500/20',
    error: 'bg-red-500/10 text-red-500 border-red-500/20',
    cancelled: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono border uppercase tracking-widest ${colors[status] ?? colors.pending}`}>
      {status}
    </span>
  );
}

function NexusExchangeTypeBadge({ type }) {
  const icons = {
    agent_task: <Bot className="w-3 h-3 text-blue-400" />,
    workflow_run: <Zap className="w-3 h-3 text-[#C9A24D]" />,
    admin_signal: <Settings className="w-3 h-3 text-slate-400" />,
    crm_event: <CheckCircle2 className="w-3 h-3 text-green-400" />,
    error: <AlertCircle className="w-3 h-3 text-red-400" />,
  };
  return (
    <span className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-mono">
      {icons[type] ?? <Clock className="w-3 h-3 text-slate-500" />}
      {type.replace('_', ' ')}
    </span>
  );
}

function NexusExchangeProgressBar({ progress, stepName }) {
  if (progress === undefined) return null;
  return (
    <div className="mt-2">
      <div className="flex justify-between text-[10px] text-slate-500 dark:text-slate-400 mb-1 font-mono uppercase tracking-widest">
        <span>{stepName ?? 'Processing…'}</span>
        <span>{progress}%</span>
      </div>
      <div className="h-1 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-[#C9A24D] to-[#E5C66A] rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

function NexusExchangeRow({ record }) {
  const [expanded, setExpanded] = useState(false);
  const ts = record.createdAt?.toDate?.()?.toLocaleTimeString() ?? '—';

  return (
    <div
      className="border border-slate-200 dark:border-slate-800/60 rounded-xl p-4 bg-white dark:bg-slate-900/40 hover:border-[#C9A24D]/40 transition-colors cursor-pointer group"
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <NexusExchangeTypeBadge type={record.type} />
          <div className="w-px h-3 bg-slate-300 dark:bg-slate-700" />
          <span className="text-slate-400 dark:text-slate-500 text-xs font-mono truncate">#{record.id.slice(0, 8)}</span>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <span className="text-slate-400 dark:text-slate-500 text-[10px] font-mono">{ts}</span>
          <NexusExchangeStatusBadge status={record.status} />
        </div>
      </div>

      <NexusExchangeProgressBar progress={record.progress} stepName={record.stepName} />

      {expanded && (
        <div className="mt-4 p-3 bg-slate-50 dark:bg-black/40 rounded-lg text-xs font-mono text-slate-600 dark:text-slate-400 overflow-auto max-h-40 border border-slate-200 dark:border-white/5">
          <pre>{JSON.stringify({ payload: record.payload, result: record.result, error: record.error }, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

function NexusExchangePage({ T }) {
  const isAr = T('lang') === 'ar';
  const [tab, setTab] = useState('all');
  const [allRecords, setAllRecords] = useState([]);
  const [agentRecords, setAgentRecords] = useState([]);
  const [workflowRecords, setWorkflowRecords] = useState([]);

  const [signalPayload, setSignalPayload] = useState('');
  const [agentId, setAgentId] = useState('');
  const [sending, setSending] = useState(false);
  const [lastSignalId, setLastSignalId] = useState(null);

  useEffect(() => {
    const unsub1 = subscribeAllExchange(setAllRecords);
    const unsub2 = subscribeAgentTasks(setAgentRecords);
    const unsub3 = subscribeWorkflowRuns(setWorkflowRecords);
    return () => { unsub1(); unsub2(); unsub3(); };
  }, []);

  const visibleRecords =
    tab === 'agents' ? agentRecords :
    tab === 'workflows' ? workflowRecords :
    tab === 'signals' ? allRecords.filter(r => r.type === 'admin_signal') :
    allRecords;

  const stats = {
    total: allRecords.length,
    running: allRecords.filter(r => r.status === 'running').length,
    done: allRecords.filter(r => r.status === 'done').length,
    error: allRecords.filter(r => r.status === 'error').length,
  };

  const handleSendSignal = useCallback(async () => {
    if (!signalPayload.trim()) return;
    setSending(true);
    try {
      const id = await sendAdminSignal({
        action: signalPayload.trim(),
        targetAgentId: agentId.trim() || undefined,
      });
      setLastSignalId(id);
      setSignalPayload('');
      setAgentId('');
      setTimeout(() => setLastSignalId(null), 5000);
    } catch (err) {
      console.error('[Nexus] Failed to send signal:', err);
    } finally {
      setSending(false);
    }
  }, [signalPayload, agentId]);

  return (
    <div className="space-y-6" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: isAr ? 'الإجمالي' : 'Total', value: stats.total, color: 'text-slate-800 dark:text-white' },
          { label: isAr ? 'قيد التشغيل' : 'Running', value: stats.running, color: 'text-blue-500' },
          { label: isAr ? 'مكتمل' : 'Done', value: stats.done, color: 'text-green-500' },
          { label: isAr ? 'أخطاء' : 'Errors', value: stats.error, color: 'text-red-500' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white dark:bg-[#0A1628] border border-slate-200 dark:border-slate-800/80 rounded-xl p-5 shadow-sm">
            <div className={`text-3xl font-playfair tracking-tight ${color}`}>{value}</div>
            <div className="text-slate-500 dark:text-slate-400 text-[10px] font-mono uppercase tracking-widest mt-2">{label}</div>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-[#0A1628] border border-slate-200 dark:border-[#C9A24D]/30 rounded-xl p-6 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-[#C9A24D] to-[#E5C66A]" />
        <h2 className="text-[11px] font-mono font-bold text-[#C9A24D] uppercase tracking-widest mb-4">
          {isAr ? 'إرسال إشارة للوكلاء' : 'Dispatch Admin Signal'}
        </h2>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={agentId}
            onChange={e => setAgentId(e.target.value)}
            placeholder={isAr ? 'معرف الوكيل (اختياري)' : 'Target Agent ID (optional)'}
            className="bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/10 rounded-lg px-4 py-2.5 text-sm text-slate-800 dark:text-white w-full sm:w-56 focus:outline-none focus:border-[#C9A24D]/50 focus:ring-1 focus:ring-[#C9A24D]/50 transition-all font-mono"
          />
          <input
            type="text"
            value={signalPayload}
            onChange={e => setSignalPayload(e.target.value)}
            placeholder={isAr ? 'الإجراء (مثال: start_closer)' : 'Action payload (e.g. start_closer)'}
            className="flex-1 bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/10 rounded-lg px-4 py-2.5 text-sm text-slate-800 dark:text-white focus:outline-none focus:border-[#C9A24D]/50 focus:ring-1 focus:ring-[#C9A24D]/50 transition-all font-mono"
            onKeyDown={e => e.key === 'Enter' && handleSendSignal()}
          />
          <button
            onClick={handleSendSignal}
            disabled={sending || !signalPayload.trim()}
            className="px-6 py-2.5 bg-[#C9A24D] text-[#05080f] font-bold text-sm rounded-lg hover:bg-[#B8973B] disabled:opacity-40 transition-colors shadow-md"
          >
            {sending ? '…' : (isAr ? 'إرسال' : 'Dispatch')}
          </button>
        </div>
        {lastSignalId && (
          <p className="text-green-500 text-[10px] mt-3 font-mono tracking-wide">
            ✅ {isAr ? 'تم الإرسال بنجاح' : 'Signal dispatched'} — ID: {lastSignalId}
          </p>
        )}
      </div>

      <div className="flex gap-2 mb-4">
        {[
          { id: 'all', label: 'All Records', labelAr: 'الكل' },
          { id: 'agents', label: 'Agents', labelAr: 'الوكلاء' },
          { id: 'workflows', label: 'Workflows', labelAr: 'سير العمل' },
          { id: 'signals', label: 'Signals', labelAr: 'الإشارات' },
        ].map(({ id, label, labelAr }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`px-4 py-2 rounded-full text-xs font-mono uppercase tracking-widest transition-colors ${
              tab === id
                ? 'bg-slate-800 dark:bg-white text-white dark:text-[#05080f] shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-white bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800'
            }`}
          >
            {isAr ? labelAr : label}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {visibleRecords.length === 0 ? (
          <div className="text-center py-20 bg-white/50 dark:bg-slate-900/20 border border-dashed border-slate-300 dark:border-slate-800 rounded-2xl">
            <div className="text-slate-400 mb-3"><Bot className="w-8 h-8 mx-auto opacity-50" /></div>
            <div className="text-sm font-medium text-slate-600 dark:text-slate-400">
              {isAr ? 'لا توجد سجلات بعد' : 'No exchange records found'}
            </div>
            <div className="text-[10px] font-mono mt-2 text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              {isAr ? 'في انتظار الإشارات' : 'Awaiting telemetry...'}
            </div>
          </div>
        ) : (
          visibleRecords.map(record => (
            <NexusExchangeRow key={record.id} record={record} />
          ))
        )}
      </div>
    </div>
  );
}

/* ── LISTINGS MANAGER (ported from SE's Vite admin) ──────────────────────
   Full CRUD over the listings/owners collections (@sierra-estates/admin-data)
   — atomic create/delete with owner PII, separate from the read-only
   Listings Hub tab above which reads the client-facing units/properties
   collections. Two different data models on purpose (see report). */
const LISTING_STATUS_COLORS: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-700 border-gray-300',
  active: 'bg-green-100 text-green-700 border-green-300',
  sold: 'bg-blue-100 text-blue-700 border-blue-300',
};
const LISTING_PROPERTY_TYPES: AdminPropertyType[] = [
  'apartment', 'villa', 'townhouse', 'twin_house', 'penthouse', 'duplex', 'studio',
];
const LISTING_FINISHING_LEVELS: AdminFinishingLevel[] = [
  'core_shell', 'semi', 'fully_finished', 'ultra_lux',
];
const LISTING_DELIVERY_STATUSES: AdminDeliveryStatus[] = [
  'ready', 'under_construction', 'off_plan',
];

function ListingsManagerPage() {
  const [listings, setListings] = useState<AdminListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<AdminListingStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [ownerCache, setOwnerCache] = useState<Record<string, AdminOwner | null>>({});
  const [revealedOwners, setRevealedOwners] = useState<Set<string>>(new Set());

  const loadListings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminFetchListings({
        status: filterStatus === 'all' ? undefined : filterStatus,
        limitCount: 200,
      });
      setListings(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load listings');
    } finally {
      setLoading(false);
    }
  }, [filterStatus]);

  useEffect(() => { loadListings(); }, [loadListings]);

  const handleRevealOwner = async (listingId: string) => {
    if (revealedOwners.has(listingId)) {
      setRevealedOwners(prev => {
        const next = new Set(prev);
        next.delete(listingId);
        return next;
      });
      return;
    }
    if (!ownerCache[listingId]) {
      try {
        const owner = await adminFetchOwnerByListingId(listingId);
        setOwnerCache(prev => ({ ...prev, [listingId]: owner }));
      } catch (err) {
        console.error('Failed to fetch owner:', err);
      }
    }
    setRevealedOwners(prev => new Set(prev).add(listingId));
  };

  const handleStatusChange = async (id: string, status: AdminListingStatus) => {
    try {
      await adminUpdateListing(id, { status });
      setListings(prev => prev.map(l => l.id === id ? { ...l, status } : l));
    } catch (err: any) {
      setError(`Failed to update status: ${err.message}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this listing AND its owner record? This cannot be undone.')) return;
    try {
      await adminDeleteListingAndOwner(id);
      setListings(prev => prev.filter(l => l.id !== id));
    } catch (err: any) {
      setError(`Failed to delete: ${err.message}`);
    }
  };

  const filtered = listings.filter(l => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return l.compound_name.toLowerCase().includes(q) ||
           l.location_sector.toLowerCase().includes(q) ||
           l.property_type.toLowerCase().includes(q);
  });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Listings Manager</h1>
          <p className="text-sm text-gray-500 mt-1">
            {filtered.length} listing{filtered.length !== 1 ? 's' : ''} ·
            Atomic create/delete with owner PII
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-sm"
        >
          <Plus size={18} /> New Listing
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-sm text-red-700">
          <AlertCircle size={16} /> {error}
          <button onClick={() => setError(null)} className="ml-auto"><X size={14} /></button>
        </div>
      )}

      <div className="flex gap-3 mb-4">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by compound, sector, or type..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value as any)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
        >
          <option value="all">All Status</option>
          <option value="draft">Draft</option>
          <option value="active">Active</option>
          <option value="sold">Sold</option>
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12 text-gray-400">
          <Loader2 className="animate-spin mr-2" size={20} /> Loading listings...
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <Building2 size={40} className="mx-auto mb-3 opacity-50" />
          <p>No listings found. Create one to get started.</p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-xl border border-gray-200">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 text-xs uppercase">
              <tr>
                <th className="text-left px-4 py-3 font-semibold">Compound</th>
                <th className="text-left px-4 py-3 font-semibold">Type</th>
                <th className="text-left px-4 py-3 font-semibold">Beds</th>
                <th className="text-left px-4 py-3 font-semibold">Area</th>
                <th className="text-left px-4 py-3 font-semibold">Price (EGP)</th>
                <th className="text-left px-4 py-3 font-semibold">Mode</th>
                <th className="text-left px-4 py-3 font-semibold">Status</th>
                <th className="text-left px-4 py-3 font-semibold">Owner</th>
                <th className="text-right px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(listing => (
                <tr key={listing.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{listing.compound_name}</div>
                    <div className="text-xs text-gray-500 flex items-center gap-1">
                      <MapPin size={10} /> {listing.location_sector}
                    </div>
                  </td>
                  <td className="px-4 py-3 capitalize">{listing.property_type.replace('_', ' ')}</td>
                  <td className="px-4 py-3">{listing.bedrooms}</td>
                  <td className="px-4 py-3">{listing.area_sqm} m²</td>
                  <td className="px-4 py-3 font-mono font-medium">
                    {listing.price_egp.toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      listing.mode === 'sale' ? 'bg-blue-50 text-blue-700' : 'bg-purple-50 text-purple-700'
                    }`}>
                      {listing.mode}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={listing.status}
                      onChange={e => handleStatusChange(listing.id, e.target.value as AdminListingStatus)}
                      className={`px-2 py-1 rounded border text-xs font-medium cursor-pointer ${LISTING_STATUS_COLORS[listing.status]}`}
                    >
                      <option value="draft">Draft</option>
                      <option value="active">Active</option>
                      <option value="sold">Sold</option>
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    {revealedOwners.has(listing.id) ? (
                      ownerCache[listing.id] ? (
                        <div className="text-xs">
                          <div className="font-medium text-gray-900">{ownerCache[listing.id]!.owner_name}</div>
                          <div className="flex items-center gap-1 text-gray-600">
                            <Phone size={10} /> {ownerCache[listing.id]!.phone_number}
                          </div>
                          <div className="text-gray-400">{ownerCache[listing.id]!.source_type}</div>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">No owner</span>
                      )
                    ) : (
                      <button
                        onClick={() => handleRevealOwner(listing.id)}
                        className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                      >
                        <Eye size={12} /> Reveal
                      </button>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleDelete(listing.id)}
                      className="text-red-500 hover:text-red-700 p-1"
                      title="Delete listing + owner"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showCreateModal && (
        <CreateListingModal
          onClose={() => setShowCreateModal(false)}
          onCreated={() => {
            setShowCreateModal(false);
            loadListings();
          }}
        />
      )}
    </div>
  );
}

function CreateListingModal({ onClose, onCreated }: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [compoundName, setCompoundName] = useState('');
  const [locationSector, setLocationSector] = useState('');
  const [propertyType, setPropertyType] = useState<AdminPropertyType>('apartment');
  const [bedrooms, setBedrooms] = useState(3);
  const [bathrooms, setBathrooms] = useState(2);
  const [areaSqm, setAreaSqm] = useState(180);
  const [priceEgp, setPriceEgp] = useState(10000000);
  const [mode, setMode] = useState<AdminListingMode>('sale');
  const [finishing, setFinishing] = useState<AdminFinishingLevel>('fully_finished');
  const [deliveryStatus, setDeliveryStatus] = useState<AdminDeliveryStatus>('ready');
  const [paymentPlan, setPaymentPlan] = useState('');
  const [virtualTourUrl, setVirtualTourUrl] = useState('');
  const [status, setStatus] = useState<AdminListingStatus>('draft');

  const [ownerName, setOwnerName] = useState('');
  const [ownerPhone, setOwnerPhone] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [sourceType, setSourceType] = useState<'direct' | 'broker'>('direct');
  const [brokerName, setBrokerName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!compoundName.trim() || !ownerName.trim() || !ownerPhone.trim()) {
      setError('Compound name, owner name, and owner phone are required.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const listingInput: AdminListingInput = {
        status,
        property_type: propertyType,
        compound_name: compoundName.trim(),
        location_sector: locationSector.trim(),
        price_egp: Number(priceEgp),
        area_sqm: Number(areaSqm),
        bedrooms: Number(bedrooms),
        bathrooms: Number(bathrooms),
        finishing,
        mode,
        delivery_status: deliveryStatus,
        payment_plan: paymentPlan.trim() || undefined,
        virtual_tour_url: virtualTourUrl.trim() || undefined,
      };
      const ownerInput = {
        owner_name: ownerName.trim(),
        phone_number: ownerPhone.trim(),
        email: ownerEmail.trim() || undefined,
        source_type: sourceType,
        broker_name: sourceType === 'broker' ? brokerName.trim() : undefined,
      };

      await adminCreateListingWithOwner({ listing: listingInput, owner: ownerInput });
      onCreated();
    } catch (err: any) {
      setError(err.message || 'Failed to create listing');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">Create Listing + Owner</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-sm text-red-700">
              <AlertCircle size={16} /> {error}
            </div>
          )}

          <div>
            <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
              <Building2 size={16} /> Listing Details (Public)
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <ListingField label="Compound Name" required>
                <input type="text" value={compoundName} onChange={e => setCompoundName(e.target.value)}
                  className="input" placeholder="e.g. Mivida" required />
              </ListingField>
              <ListingField label="Location Sector">
                <input type="text" value={locationSector} onChange={e => setLocationSector(e.target.value)}
                  className="input" placeholder="e.g. 5th Settlement" />
              </ListingField>
              <ListingField label="Property Type">
                <select value={propertyType} onChange={e => setPropertyType(e.target.value as AdminPropertyType)} className="input">
                  {LISTING_PROPERTY_TYPES.map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
                </select>
              </ListingField>
              <ListingField label="Mode">
                <select value={mode} onChange={e => setMode(e.target.value as AdminListingMode)} className="input">
                  <option value="sale">Sale</option>
                  <option value="rent">Rent</option>
                </select>
              </ListingField>
              <ListingField label="Bedrooms">
                <input type="number" min="0" max="10" value={bedrooms} onChange={e => setBedrooms(+e.target.value)} className="input" />
              </ListingField>
              <ListingField label="Bathrooms">
                <input type="number" min="0" max="10" value={bathrooms} onChange={e => setBathrooms(+e.target.value)} className="input" />
              </ListingField>
              <ListingField label="Area (m²)">
                <input type="number" min="0" value={areaSqm} onChange={e => setAreaSqm(+e.target.value)} className="input" />
              </ListingField>
              <ListingField label="Price (EGP)">
                <input type="number" min="0" value={priceEgp} onChange={e => setPriceEgp(+e.target.value)} className="input" />
              </ListingField>
              <ListingField label="Finishing">
                <select value={finishing} onChange={e => setFinishing(e.target.value as AdminFinishingLevel)} className="input">
                  {LISTING_FINISHING_LEVELS.map(f => <option key={f} value={f}>{f.replace('_', ' ')}</option>)}
                </select>
              </ListingField>
              <ListingField label="Delivery">
                <select value={deliveryStatus} onChange={e => setDeliveryStatus(e.target.value as AdminDeliveryStatus)} className="input">
                  {LISTING_DELIVERY_STATUSES.map(d => <option key={d} value={d}>{d.replace('_', ' ')}</option>)}
                </select>
              </ListingField>
              <ListingField label="Status">
                <select value={status} onChange={e => setStatus(e.target.value as AdminListingStatus)} className="input">
                  <option value="draft">Draft</option>
                  <option value="active">Active (public)</option>
                  <option value="sold">Sold</option>
                </select>
              </ListingField>
              <ListingField label="Payment Plan (optional)">
                <input type="text" value={paymentPlan} onChange={e => setPaymentPlan(e.target.value)}
                  className="input" placeholder="e.g. 10% down, 5 years" />
              </ListingField>
              <div className="col-span-2">
                <ListingField label="Virtual Tour URL (optional)">
                  <input type="url" value={virtualTourUrl} onChange={e => setVirtualTourUrl(e.target.value)}
                    className="input" placeholder="https://listing3d.com/..." />
                </ListingField>
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
              <Phone size={16} /> Owner Details (Private PII — admin only)
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <ListingField label="Owner Name" required>
                <input type="text" value={ownerName} onChange={e => setOwnerName(e.target.value)}
                  className="input" placeholder="Full name" required />
              </ListingField>
              <ListingField label="Phone Number" required>
                <input type="tel" value={ownerPhone} onChange={e => setOwnerPhone(e.target.value)}
                  className="input" placeholder="+20XXXXXXXXXX" required dir="ltr" />
              </ListingField>
              <ListingField label="Email (optional)">
                <input type="email" value={ownerEmail} onChange={e => setOwnerEmail(e.target.value)}
                  className="input" placeholder="owner@example.com" dir="ltr" />
              </ListingField>
              <ListingField label="Source">
                <select value={sourceType} onChange={e => setSourceType(e.target.value as 'direct' | 'broker')} className="input">
                  <option value="direct">Direct Owner</option>
                  <option value="broker">Broker</option>
                </select>
              </ListingField>
              {sourceType === 'broker' && (
                <div className="col-span-2">
                  <ListingField label="Broker Name">
                    <input type="text" value={brokerName} onChange={e => setBrokerName(e.target.value)}
                      className="input" placeholder="Broker / agency name" />
                  </ListingField>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t">
            <button type="button" onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-medium">
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
              {saving ? 'Creating...' : 'Create Listing + Owner'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ListingField({ label, required, children }: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-gray-600 mb-1 block">
        {label} {required && <span className="text-red-500">*</span>}
      </span>
      {children}
    </label>
  );
}

/* ── REQUESTS / TICKETS (ported from SE's Vite admin) ────────────────────
   Workflow ticket view over the requests/clients collections
   (@sierra-estates/admin-data): bot→agent handoff, chat history, close. */
const REQUEST_STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  bot_handling: { label: 'Bot Handling', color: 'bg-yellow-100 text-yellow-700 border-yellow-300', icon: Bot },
  ready_for_agent: { label: 'Ready for Agent', color: 'bg-blue-100 text-blue-700 border-blue-300', icon: Headphones },
  closed: { label: 'Closed', color: 'bg-gray-100 text-gray-600 border-gray-300', icon: CheckCircle2 },
};

function RequestsTicketPage() {
  const [requests, setRequests] = useState<AdminRequest[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<AdminRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<AdminRequestStatus | 'open'>('open');

  const loadRequests = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminFetchRequests({
        status: filterStatus === 'open' ? undefined : filterStatus,
        limitCount: 50,
      });
      const filteredData = filterStatus === 'open'
        ? data.filter(r => r.status === 'bot_handling' || r.status === 'ready_for_agent')
        : data;
      setRequests(filteredData);
      if (filteredData.length > 0 && !selectedId) {
        setSelectedId(filteredData[0].id);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load requests');
    } finally {
      setLoading(false);
    }
  }, [filterStatus, selectedId]);

  useEffect(() => { loadRequests(); }, [loadRequests]);

  useEffect(() => {
    if (!selectedId) {
      setSelectedRequest(null);
      return;
    }
    adminFetchRequestById(selectedId).then(req => {
      setSelectedRequest(req);
    }).catch(err => setError(err.message));
  }, [selectedId]);

  return (
    <div className="flex h-[calc(100vh-2rem)] bg-gray-50 rounded-xl overflow-hidden border border-gray-200">
      <div className="w-96 border-r border-gray-200 bg-white flex flex-col">
        <div className="p-4 border-b">
          <h1 className="text-lg font-bold text-gray-900 mb-3">Requests</h1>
          <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
            {(['open', 'bot_handling', 'ready_for_agent', 'closed'] as const).map(s => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`flex-1 px-2 py-1 rounded text-xs font-medium transition ${
                  filterStatus === s ? 'bg-white shadow text-gray-900' : 'text-gray-500'
                }`}
              >
                {s === 'open' ? 'Open' : REQUEST_STATUS_CONFIG[s].label.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-8 text-gray-400">
              <Loader2 className="animate-spin mr-2" size={18} /> Loading...
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">
              <MessageCircle size={32} className="mx-auto mb-2 opacity-50" />
              No requests
            </div>
          ) : (
            requests.map(req => {
              const cfg = REQUEST_STATUS_CONFIG[req.status];
              const Icon = cfg.icon;
              const lastMsg = req.bot_chat_history[req.bot_chat_history.length - 1];
              return (
                <button
                  key={req.id}
                  onClick={() => setSelectedId(req.id)}
                  className={`w-full text-left p-3 border-b hover:bg-gray-50 transition ${
                    selectedId === req.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Icon size={14} className={cfg.color.split(' ')[1]} />
                    <span className="text-xs font-medium text-gray-500">{cfg.label}</span>
                    <span className="text-xs text-gray-400 ml-auto">{req.matched_listings.length} matches</span>
                  </div>
                  <div className="text-sm font-medium text-gray-900 truncate">
                    {req.client_id.substring(0, 8)}...
                  </div>
                  {lastMsg && (
                    <div className="text-xs text-gray-500 truncate mt-0.5">{lastMsg.text}</div>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        {error && (
          <div className="p-3 bg-red-50 border-b border-red-200 flex items-center gap-2 text-sm text-red-700">
            <AlertCircle size={16} /> {error}
            <button onClick={() => setError(null)} className="ml-auto"><X size={14} /></button>
          </div>
        )}
        {!selectedRequest ? (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <MessageCircle size={48} className="mx-auto mb-3 opacity-40" />
              <p>Select a request to view conversation</p>
            </div>
          </div>
        ) : (
          <RequestTicketDetail
            request={selectedRequest}
            onUpdate={() => {
              adminFetchRequestById(selectedRequest.id).then(setSelectedRequest);
              loadRequests();
            }}
          />
        )}
      </div>
    </div>
  );
}

function RequestTicketDetail({ request, onUpdate }: {
  request: AdminRequest;
  onUpdate: () => void;
}) {
  const [agentReply, setAgentReply] = useState('');
  const [sending, setSending] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [request.bot_chat_history.length]);

  const cfg = REQUEST_STATUS_CONFIG[request.status];
  const StatusIcon = cfg.icon;

  const handleSendReply = async () => {
    if (!agentReply.trim()) return;
    setSending(true);
    try {
      const message: AdminChatMessage = {
        sender: 'agent',
        text: agentReply.trim(),
        timestamp: new Date().toISOString(),
      };
      await adminAppendChatMessage(request.id, message);
      setAgentReply('');
      onUpdate();
    } catch (err: any) {
      console.error('Failed to send reply:', err);
    } finally {
      setSending(false);
    }
  };

  const handleEscalate = async () => {
    setActionLoading(true);
    try {
      // TODO: replace with the real agent uid from the admin auth context.
      await adminEscalateToAgent(request.id, 'current-agent-uid');
      onUpdate();
    } catch (err: any) {
      console.error('Escalate failed:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleClose = async () => {
    if (!confirm('Close this request?')) return;
    setActionLoading(true);
    try {
      await adminCloseRequest(request.id);
      onUpdate();
    } catch (err: any) {
      console.error('Close failed:', err);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <div className="px-6 py-4 bg-white border-b flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <StatusIcon size={16} className={cfg.color.split(' ')[1]} />
            <span className={`px-2 py-0.5 rounded text-xs font-medium border ${cfg.color}`}>{cfg.label}</span>
            <span className="text-xs text-gray-400">
              Created {request.created_at ? new Date(request.created_at.seconds * 1000).toLocaleString() : '—'}
            </span>
          </div>
          <h2 className="text-lg font-bold text-gray-900">Request {request.id.substring(0, 8)}</h2>
        </div>
        <div className="flex gap-2">
          {request.status === 'bot_handling' && (
            <button
              onClick={handleEscalate}
              disabled={actionLoading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              <Headphones size={14} /> Take Over
            </button>
          )}
          {request.status !== 'closed' && (
            <button
              onClick={handleClose}
              disabled={actionLoading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-200 disabled:opacity-50"
            >
              <CheckCircle2 size={14} /> Close
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 flex flex-col">
          <div className="flex-1 overflow-y-auto p-6 space-y-3 bg-gray-50">
            {request.bot_chat_history.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-sm">No messages yet</div>
            ) : (
              request.bot_chat_history.map((msg, i) => (
                <RequestChatBubble key={i} message={msg} />
              ))
            )}
            <div ref={chatEndRef} />
          </div>

          {request.status !== 'closed' && (
            <div className="p-4 bg-white border-t">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={agentReply}
                  onChange={e => setAgentReply(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSendReply()}
                  placeholder="Type your reply..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleSendReply}
                  disabled={sending || !agentReply.trim()}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                >
                  {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                  Send
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="w-80 border-l bg-white overflow-y-auto p-4 space-y-4">
          <div>
            <h3 className="text-xs font-bold text-gray-500 uppercase mb-2">Client Needs</h3>
            <div className="space-y-1.5 text-sm">
              <RequestNeedRow icon={Tag} label="Intent" value={request.client_needs.intent} />
              <RequestNeedRow icon={MapPin} label="Zones" value={request.client_needs.preferred_zones?.join(', ')} />
              <RequestNeedRow icon={MapPin} label="Compounds" value={request.client_needs.preferred_compounds?.join(', ')} />
              <RequestNeedRow icon={BedDouble} label="Min Beds" value={request.client_needs.min_bedrooms?.toString()} />
              <RequestNeedRow icon={Tag} label="Max Budget" value={request.client_needs.max_budget_egp ? `${request.client_needs.max_budget_egp.toLocaleString()} EGP` : null} />
              <RequestNeedRow icon={BedDouble} label="Min Area" value={request.client_needs.min_area_sqm ? `${request.client_needs.min_area_sqm} m²` : null} />
              <RequestNeedRow icon={Tag} label="Finishing" value={request.client_needs.finishing} />
              <RequestNeedRow icon={Tag} label="Delivery" value={request.client_needs.delivery_status} />
            </div>
            {request.client_needs.notes && (
              <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
                {request.client_needs.notes}
              </div>
            )}
          </div>

          <div className="border-t pt-3">
            <h3 className="text-xs font-bold text-gray-500 uppercase mb-2">
              Matched Listings ({request.matched_listings.length})
            </h3>
            {request.matched_listings.length === 0 ? (
              <p className="text-xs text-gray-400">No matches yet</p>
            ) : (
              <div className="space-y-1">
                {request.matched_listings.map(id => (
                  <div key={id} className="text-xs p-2 bg-gray-50 rounded font-mono text-gray-600">
                    {id.substring(0, 12)}...
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="border-t pt-3">
            <h3 className="text-xs font-bold text-gray-500 uppercase mb-2">Assignment</h3>
            <div className="text-sm">
              {request.assigned_agent_id ? (
                <div className="flex items-center gap-2">
                  <User size={14} className="text-blue-600" />
                  <span className="font-medium">{request.assigned_agent_id.substring(0, 12)}...</span>
                </div>
              ) : (
                <span className="text-gray-400 text-xs">Unassigned (bot handling)</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function RequestChatBubble({ message }: { message: AdminChatMessage }) {
  const isClient = message.sender === 'client';
  const isBot = message.sender === 'bot';
  const Icon = isClient ? User : isBot ? Bot : Headphones;

  return (
    <div className={`flex gap-2 ${isClient ? 'justify-start' : 'justify-end'}`}>
      {isClient && (
        <div className="flex-none w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
          <Icon size={16} className="text-white" />
        </div>
      )}
      <div className={`max-w-[70%] ${isClient ? '' : 'items-end'}`}>
        <div className={`px-3 py-2 rounded-2xl text-sm ${
          isClient
            ? 'bg-white border border-gray-200 text-gray-900'
            : isBot
            ? 'bg-yellow-50 border border-yellow-200 text-yellow-900'
            : 'bg-blue-600 text-white'
        }`}>
          {message.text}
        </div>
        <div className={`text-xs text-gray-400 mt-1 ${isClient ? 'text-left' : 'text-right'}`}>
          {message.sender} · {new Date(message.timestamp).toLocaleTimeString()}
        </div>
      </div>
      {!isClient && (
        <div className={`flex-none w-8 h-8 rounded-full flex items-center justify-center ${
          isBot ? 'bg-yellow-400' : 'bg-blue-600'
        }`}>
          <Icon size={16} className="text-white" />
        </div>
      )}
    </div>
  );
}

function RequestNeedRow({ icon: Icon, label, value }: {
  icon: any;
  label: string;
  value?: string | null;
}) {
  if (!value) return null;
  return (
    <div className="flex items-center gap-2 text-gray-700">
      <Icon size={12} className="text-gray-400 flex-none" />
      <span className="text-gray-500 text-xs">{label}:</span>
      <span className="font-medium capitalize">{value}</span>
    </div>
  );
}

/* ── REPORTS PAGE ─────────────────────────────────────────────────────── */
function ReportsPage({ T }) {
  const MONTHS=['Jan','Feb','Mar','Apr','May','Jun'];
  const VALS=[42,58,71,65,84,97];
  return (
    <div className="fade-up">
      <div style={{display:'flex',gap:8,marginBottom:16,flexWrap:'wrap'}}>
        <button className="btn btn-ghost" onClick={()=>exportCSV([{Month:'Jan',Deals:42},{Month:'Feb',Deals:58},{Month:'Mar',Deals:71},{Month:'Apr',Deals:65},{Month:'May',Deals:84},{Month:'Jun',Deals:97}],'sierra_monthly_deals.csv')}>⬇ {T('exportCSV')}</button>
      </div>
      <div className="grid-2" style={{marginBottom:14}}>
        <div className="card">
          <div className="card-hd"><span className="card-title">{T('monthlyDeals')}</span></div>
          <div className="card-body">
            <div className="bar-chart">
              {MONTHS.map((m,i)=>(
                <div key={m} className="bar-col"><div className="bar-fill" style={{height:`${VALS[i]}%`,background:'linear-gradient(180deg,#00AEFF,#00AEFF55)'}}/><span className="bar-lbl">{m}</span></div>
              ))}
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-hd"><span className="card-title">{T('revPipeline')}</span></div>
          <div className="card-body" style={{display:'flex',flexDirection:'column',gap:10}}>
            {[['Closed This Month','EGP 601M',100,'#34D399'],['Pipeline Value','EGP 2.1B',78,'#00AEFF'],['Avg Deal','EGP 6.2M',55,'#1E88D9'],['Commissions Due','EGP 18.4M',30,'#7C3AED']].map(([l,v,p,c],i)=>(
              <div key={i}>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:4,fontSize:11}}>
                  <span style={{color:'var(--tx-m)'}}>{l}</span>
                  <span style={{color:c,fontWeight:700,fontFamily:'JetBrains Mono'}}>{v}</span>
                </div>
                <div className="progress-bar"><div className="progress-fill" style={{width:`${p}%`,background:c}}/></div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="card">
        <div className="card-hd"><span className="card-title">{T('perfByCompound')}</span></div>
        <div style={{overflowX:'auto'}}>
          <table className="data-table">
            <thead><tr><th>Compound</th><th>Listings</th><th>Views</th><th>Leads</th><th>Deals</th><th>Avg Price</th><th>AI Score</th></tr></thead>
            <tbody>
              {[['Mountain View iCity',145,2840,67,12,'EGP 11.2M',9.4],['Hyde Park',98,1920,54,9,'EGP 18.5M',9.7],['Mivida',112,1650,48,11,'EGP 5.8M',9.0],['Uptown Cairo',187,3120,89,18,'EGP 9.4M',9.3],['Madinaty',324,4200,112,24,'EGP 4.5M',8.8],['Eastown',76,980,31,6,'EGP 8.2M',9.1]].map(([c,l,v,ld,d,p,ai],i)=>(
                <tr key={i}>
                  <td style={{fontWeight:600,color:'var(--tx)'}}>{c}</td>
                  <td style={{fontFamily:'JetBrains Mono'}}>{l}</td>
                  <td style={{fontFamily:'JetBrains Mono'}}>{v.toLocaleString()}</td>
                  <td style={{fontFamily:'JetBrains Mono',color:'var(--blue)'}}>{ld}</td>
                  <td style={{fontFamily:'JetBrains Mono',color:'var(--emerald)',fontWeight:700}}>{d}</td>
                  <td style={{fontFamily:'JetBrains Mono',color:'var(--gold)',fontWeight:700}}>{p}</td>
                  <td style={{fontFamily:'JetBrains Mono',fontWeight:700,color:ai>=9.5?'var(--emerald)':ai>=9?'var(--gold)':'var(--tx-m)'}}>{ai}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ── SETTINGS PAGE ────────────────────────────────────────────────────── */
function SettingsPage({ T }) {
  const [saved,setSaved]=useState(false);
  return (
    <div className="fade-up" style={{maxWidth:700}}>
      <div className="card" style={{marginBottom:14}}>
        <div className="card-hd"><span className="card-title">🔧 {T('settings')}</span></div>
        <div className="card-body" style={{display:'flex',flexDirection:'column',gap:16}}>
          {[['Firebase Project ID','sierra-blu-2026','text'],['Gemini API Key','AIza••••••••••••••','password'],['WhatsApp Cloud API Token','EAAx••••••••••','password'],['n8n Webhook URL','https://n8n.sierra-blu.com/webhook','text'],['Telegram Bot Token','6847••••••:AAH•••••','password']].map(([l,v,t],i)=>(
            <div key={i}>
              <label style={{fontFamily:'JetBrains Mono',fontSize:9,textTransform:'uppercase',letterSpacing:'.16em',color:'var(--gold)',display:'block',marginBottom:5}}>{l}</label>
              <input type={t} defaultValue={v} className="f-in"/>
            </div>
          ))}
          <button className="btn btn-gold" style={{alignSelf:'flex-start'}} onClick={()=>{setSaved(true);setTimeout(()=>setSaved(false),2000);}}>
            {saved?T('saved'):T('saveConfig')}
          </button>
        </div>
      </div>
      <div className="card">
        <div className="card-hd"><span className="card-title">{T('githubIntegration')}</span></div>
        <div className="card-body" style={{display:'flex',flexDirection:'column',gap:10}}>
          <div style={{display:'flex',alignItems:'center',gap:10,padding:'10px 14px',background:'var(--surf)',borderRadius:12,border:'1px solid var(--bd)'}}>
            <span style={{fontSize:20}}>⭐</span>
            <div style={{flex:1}}>
              <div style={{fontSize:12,fontWeight:700,color:'var(--tx)'}}>sierra-2026</div>
              <div style={{fontSize:10,color:'var(--tx-f)',fontFamily:'JetBrains Mono'}}>github.com/ahmedfawzy8866/sierra-2026</div>
            </div>
            <span className="chip chip-green"><span className="pulse-dot">●</span> Connected</span>
          </div>
          <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
            <button className="btn btn-ghost"><Ic.Refresh/> {T('pullLatest')}</button>
            <button className="btn btn-ghost">{T('openRepo')}</button>
            <button className="btn btn-gold">⬆ {T('pushChanges')}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── LISTINGS HUB ────────────────────────────────────────────────────── */
const HUB_IMGS=['https://images.unsplash.com/photo-1613977257363-707ba9348227?w=80&q=70','https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=80&q=70','https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=80&q=70','https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=80&q=70','https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=80&q=70'];
const HUB_LISTINGS=[
  {code:'SE-HYP-VLA-0001',cmp:'Hyde Park',type:'Villa',beds:5,area:420,price:'EGP 35M',ai:9.8,status:'Active',img:0},
  {code:'SE-HYP-TWH-0002',cmp:'Hyde Park',type:'Twin House',beds:4,area:280,price:'EGP 22M',ai:9.5,status:'Active',img:1},
  {code:'SE-HYP-APT-0003',cmp:'Hyde Park',type:'Apartment',beds:3,area:165,price:'EGP 12.5M',ai:9.2,status:'Review',img:2},
  {code:'SE-MVI-VLA-0004',cmp:'Mountain View iCity',type:'Villa',beds:6,area:550,price:'EGP 42M',ai:9.6,status:'Active',img:3},
  {code:'SE-MVI-PTH-0005',cmp:'Mountain View iCity',type:'Penthouse',beds:4,area:320,price:'EGP 18M',ai:9.4,status:'Active',img:4},
  {code:'SE-MVD-VLA-0006',cmp:'Mivida',type:'Villa',beds:3,area:195,price:'EGP 8.5M',ai:9.1,status:'Active',img:0},
  {code:'SE-MVD-APT-0007',cmp:'Mivida',type:'Apartment',beds:2,area:110,price:'EGP 5.2M',ai:8.9,status:'Active',img:1},
  {code:'SE-UPC-VLA-0008',cmp:'Uptown Cairo',type:'Villa',beds:4,area:360,price:'EGP 28M',ai:9.4,status:'Active',img:2},
  {code:'SE-UPC-DPX-0009',cmp:'Uptown Cairo',type:'Duplex',beds:3,area:220,price:'EGP 16.5M',ai:9.2,status:'Review',img:3},
  {code:'SE-MDN-APT-0010',cmp:'Madinaty',type:'Apartment',beds:3,area:165,price:'EGP 4.8M',ai:8.8,status:'Active',img:4},
  {code:'SE-MDN-VLA-0011',cmp:'Madinaty',type:'Villa',beds:4,area:280,price:'EGP 9.5M',ai:9.0,status:'Active',img:0},
  {code:'SE-MDN-APT-0012',cmp:'Madinaty',type:'Apartment',beds:2,area:120,price:'EGP 3.8M',ai:8.6,status:'Active',img:1},
  {code:'SE-EST-APT-0013',cmp:'Eastown',type:'Apartment',beds:3,area:155,price:'EGP 7.2M',ai:9.0,status:'Active',img:2},
  {code:'SE-EST-TWH-0014',cmp:'Eastown',type:'Townhouse',beds:4,area:265,price:'EGP 14M',ai:9.1,status:'Active',img:3},
  {code:'SE-VLT-VLA-0015',cmp:'Villette',type:'Villa',beds:5,area:380,price:'EGP 31M',ai:9.3,status:'Active',img:4},
  {code:'SE-PHN-VLA-0016',cmp:'Palm Hills NC',type:'Villa',beds:4,area:320,price:'EGP 24M',ai:9.2,status:'Active',img:0},
  {code:'SE-PHN-TWH-0017',cmp:'Palm Hills NC',type:'Twin House',beds:3,area:200,price:'EGP 15M',ai:9.0,status:'Review',img:1},
  {code:'SE-ALR-APT-0018',cmp:'Al Rehab',type:'Apartment',beds:3,area:145,price:'EGP 4.2M',ai:8.7,status:'Active',img:2},
  {code:'SE-ALR-APT-0019',cmp:'Al Rehab',type:'Apartment',beds:2,area:110,price:'EGP 3.5M',ai:8.5,status:'Active',img:3},
  {code:'SE-SDC-VLA-0020',cmp:'SODIC East',type:'Villa',beds:4,area:310,price:'EGP 26M',ai:9.3,status:'Active',img:4},
  {code:'SE-TAJ-APT-0021',cmp:'Taj City',type:'Apartment',beds:3,area:155,price:'EGP 6.8M',ai:8.9,status:'Active',img:0},
  {code:'SE-SAR-VLA-0022',cmp:'Sarai',type:'Villa',beds:4,area:300,price:'EGP 19.5M',ai:9.1,status:'Active',img:1},
  {code:'SE-SHR-VLA-0023',cmp:'El Shorouk',type:'Villa',beds:3,area:220,price:'EGP 8M',ai:8.8,status:'Active',img:2},
  {code:'SE-FSQ-APT-0024',cmp:'Fifth Square',type:'Apartment',beds:3,area:145,price:'EGP 7.5M',ai:9.0,status:'Active',img:3},
  {code:'SE-BLM-VLA-0025',cmp:'Bloomfields',type:'Villa',beds:4,area:280,price:'EGP 22M',ai:9.2,status:'Review',img:4},
  {code:'SE-KTH-VLA-0026',cmp:'Katameya Heights',type:'Villa',beds:5,area:450,price:'EGP 38M',ai:9.5,status:'Active',img:0},
];
function ListingsHubPage({T}){
  const [q,setQ]=useState('');
  const [cmpF,setCmpF]=useState('All');
  const [sortCol,setSortCol]=useState('ai');
  const [sortDir,setSortDir]=useState('desc');
  const [statusF,setStatusF]=useState('All');
  const cmps=['All',...new Set(HUB_LISTINGS.map(l=>l.cmp))];
  const filtered=useMemo(()=>{
    let r=HUB_LISTINGS;
    if(q) r=r.filter(l=>l.code.includes(q.toUpperCase())||l.cmp.toLowerCase().includes(q.toLowerCase())||l.type.toLowerCase().includes(q.toLowerCase()));
    if(cmpF!=='All') r=r.filter(l=>l.cmp===cmpF);
    if(statusF!=='All') r=r.filter(l=>l.status===statusF);
    return [...r].sort((a,b)=>{
      const av=sortCol==='price'?parseFloat(a.price.replace(/[^\d.]/g,'')):a[sortCol];
      const bv=sortCol==='price'?parseFloat(b.price.replace(/[^\d.]/g,'')):b[sortCol];
      return sortDir==='asc'?av-bv:bv-av;
    });
  },[q,cmpF,statusF,sortCol,sortDir]);
  const doSort=(col)=>{if(sortCol===col)setSortDir(d=>d==='asc'?'desc':'asc');else{setSortCol(col);setSortDir('desc');}};
  const SH=({col})=><span style={{cursor:'pointer',marginLeft:4,opacity:sortCol===col?1:.3}} onClick={()=>doSort(col)}>{sortDir==='asc'&&sortCol===col?'▲':'▼'}</span>;
  return(
    <div className="fade-up">
      <div style={{display:'flex',gap:10,marginBottom:16,flexWrap:'wrap',alignItems:'center'}}>
        <input className="f-in" placeholder={T('search')} value={q} onChange={e=>setQ(e.target.value)} style={{maxWidth:220}}/>
        <select className="f-in" value={cmpF} onChange={e=>setCmpF(e.target.value)} style={{maxWidth:180}}>
          {cmps.map(c=><option key={c}>{c}</option>)}
        </select>
        <select className="f-in" value={statusF} onChange={e=>setStatusF(e.target.value)} style={{maxWidth:130}}>
          {['All','Active','Review','Sold'].map(s=><option key={s}>{s}</option>)}
        </select>
        <span style={{fontFamily:'JetBrains Mono',fontSize:10,color:'var(--tx-f)'}}>{filtered.length} / {HUB_LISTINGS.length}</span>
        <div style={{marginLeft:'auto',display:'flex',gap:8}}>
          <button className="btn btn-ghost" onClick={()=>exportCSV(filtered.map(l=>({Code:l.code,Compound:l.cmp,Type:l.type,Beds:l.beds,Area:l.area,Price:l.price,AI:l.ai,Status:l.status})),'listings.csv')}>⬇ {T('exportCSV')}</button>
          <button className="btn btn-gold">+ Add Listing</button>
        </div>
      </div>
      <div className="card"><div style={{overflowX:'auto'}}>
        <table className="data-table">
          <thead><tr>
            <th style={{width:64}}>Photo</th>
            <th>Code <SH col="code"/></th><th>Compound</th><th>Type</th>
            <th>Beds <SH col="beds"/></th><th>Area <SH col="area"/></th>
            <th>Price <SH col="price"/></th><th>AI ▸ <SH col="ai"/></th>
            <th>Status</th><th>Actions</th>
          </tr></thead>
          <tbody>{filtered.map(l=>(
            <tr key={l.code}>
              <td><img src={HUB_IMGS[l.img]} alt="" style={{width:56,height:38,borderRadius:8,objectFit:'cover'}}/></td>
              <td style={{fontFamily:'JetBrains Mono',fontSize:9.5,color:'var(--gold)',fontWeight:700}}>{l.code}</td>
              <td style={{fontWeight:600,color:'var(--tx)'}}>{l.cmp}</td>
              <td><span className="chip chip-blue">{l.type}</span></td>
              <td style={{fontFamily:'JetBrains Mono'}}>{l.beds}</td>
              <td style={{fontFamily:'JetBrains Mono'}}>{l.area}m²</td>
              <td style={{fontFamily:'JetBrains Mono',color:'var(--gold)',fontWeight:700}}>{l.price}</td>
              <td style={{fontFamily:'JetBrains Mono',fontWeight:700,color:l.ai>=9.5?'var(--emerald)':l.ai>=9?'var(--gold)':'var(--tx-m)'}}>{l.ai}</td>
              <td><span className={`chip ${l.status==='Active'?'chip-green':l.status==='Review'?'chip-amber':'chip-red'}`}>{l.status}</span></td>
              <td><div style={{display:'flex',gap:5}}>
                <button className="btn btn-ghost" style={{padding:'4px 9px',fontSize:10}}>Edit</button>
                <button className="btn btn-green" style={{padding:'4px 9px',fontSize:10}}>WA</button>
              </div></td>
            </tr>
          ))}</tbody>
        </table>
      </div></div>
    </div>
  );
}

/* ── STAGE-9 CLOSER ──────────────────────────────────────────────────── */
const DEALS_DATA=[
  {id:'DL-0097',client:'Ahmed Al-Rashid',phone:'+20 100 111 2233',prop:'Villa Hyde Park · 5 Beds · 420m²',value:'EGP 35M',stage:'contract',prog:85,signed:false,deposit:true,c:'#00AEFF'},
  {id:'DL-0096',client:'Khalid Mansour',phone:'+971 50 333 4455',prop:'Penthouse Uptown · 4 Beds · 320m²',value:'EGP 28M',stage:'negotiation',prog:60,signed:false,deposit:false,c:'#1E88D9'},
  {id:'DL-0095',client:'Omar Farouk',phone:'+20 100 555 6677',prop:'Twin House Mountain View · 4 Beds',value:'EGP 22M',stage:'contract',prog:72,signed:true,deposit:true,c:'#34D399'},
  {id:'DL-0094',client:'Rania Nasser',phone:'+20 102 777 8899',prop:'Villa Villette · 5 Beds · 380m²',value:'EGP 31M',stage:'closed',prog:100,signed:true,deposit:true,c:'#7C3AED'},
  {id:'DL-0093',client:'Hisham Bakr',phone:'+20 109 888 9900',prop:'Garden Villa Mivida · 3 Beds · 195m²',value:'EGP 8.5M',stage:'initial',prog:25,signed:false,deposit:false,c:'#E63946'},
  {id:'DL-0092',client:'Layla Karim',phone:'+20 109 666 7788',prop:'Apartment Eastown · 3 Beds · 155m²',value:'EGP 7.2M',stage:'negotiation',prog:50,signed:false,deposit:false,c:'#f59e0b'},
];
function Stage9CloserPage({T}){
  const [stageF,setStageF]=useState('all');
  const STAGES=[
    {id:'all',lbl:'All Deals'},
    {id:'initial',lbl:'Initial Contact',c:'#E63946'},
    {id:'negotiation',lbl:'Negotiation',c:'#f59e0b'},
    {id:'contract',lbl:'Contract Draft',c:'#1E88D9'},
    {id:'closed',lbl:'Closed ✓',c:'#34D399'},
  ];
  const filtered=stageF==='all'?DEALS_DATA:DEALS_DATA.filter(d=>d.stage===stageF);
  const pipelineVal=DEALS_DATA.reduce((s,d)=>s+parseFloat(d.value.replace(/[^\d.]/g,'')),0);
  return(
    <div className="fade-up">
      {/* Pipeline KPIs */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10,marginBottom:18}}>
        {STAGES.slice(1).map(s=>(
          <div key={s.id} style={{background:'var(--bg-e)',border:'1px solid var(--bd)',borderRadius:12,padding:'12px 14px',borderTop:`3px solid ${s.c}`}}>
            <div style={{fontFamily:'JetBrains Mono',fontSize:22,fontWeight:700,color:s.c,marginBottom:4}}>{DEALS_DATA.filter(d=>d.stage===s.id).length}</div>
            <div style={{fontSize:9,color:'var(--tx-f)',textTransform:'uppercase',letterSpacing:'.1em'}}>{s.lbl}</div>
          </div>
        ))}
      </div>
      {/* Pipeline value */}
      <div className="card" style={{marginBottom:14,padding:'14px 18px',display:'flex',alignItems:'center',gap:16}}>
        <div style={{fontFamily:'JetBrains Mono',fontSize:9,color:'var(--tx-f)',textTransform:'uppercase',letterSpacing:'.14em'}}>Total Pipeline Value</div>
        <div style={{fontFamily:'JetBrains Mono',fontSize:22,fontWeight:700,color:'var(--gold)'}}>EGP {pipelineVal.toFixed(1)}M</div>
        <div style={{flex:1,marginLeft:16}}>
          <div style={{display:'flex',gap:4}}>
            {DEALS_DATA.map((d,i)=>(
              <div key={i} style={{flex:parseFloat(d.value.replace(/[^\d.]/g,'')),height:8,background:d.c,borderRadius:4,opacity:.8}} title={`${d.client}: ${d.value}`}/>
            ))}
          </div>
        </div>
        <button className="btn btn-gold" style={{marginLeft:'auto'}}>+ New Deal</button>
      </div>
      {/* Stage filter */}
      <div style={{display:'flex',gap:8,marginBottom:14,flexWrap:'wrap'}}>
        {STAGES.map(s=>(
          <button key={s.id} onClick={()=>setStageF(s.id)} className="btn btn-ghost"
            style={{borderColor:stageF===s.id?'var(--gold)':'var(--bd)',color:stageF===s.id?'var(--gold)':'var(--tx-m)',background:stageF===s.id?'rgba(0,174,255,.08)':'var(--surf)'}}>
            {s.lbl} <span style={{background:'var(--surf)',padding:'1px 6px',borderRadius:20,marginLeft:4,fontSize:9}}>{s.id==='all'?DEALS_DATA.length:DEALS_DATA.filter(d=>d.stage===s.id).length}</span>
          </button>
        ))}
      </div>
      {/* Deal cards */}
      <div style={{display:'flex',flexDirection:'column',gap:10}}>
        {filtered.map(deal=>(
          <div key={deal.id} className="card" style={{borderLeft:`3px solid ${deal.c}`}}>
            <div style={{padding:'14px 16px'}}>
              <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:10}}>
                <div style={{width:42,height:42,borderRadius:'50%',background:`${deal.c}22`,border:`1.5px solid ${deal.c}`,display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:15,color:deal.c,flexShrink:0}}>{deal.client[0]}</div>
                <div style={{flex:1}}>
                  <div style={{fontWeight:700,fontSize:13,color:'var(--tx)',marginBottom:2}}>{deal.client}</div>
                  <div style={{fontSize:11,color:'var(--tx-m)'}}>{deal.prop}</div>
                </div>
                <div style={{textAlign:'right'}}>
                  <div style={{fontFamily:'JetBrains Mono',fontSize:15,fontWeight:700,color:'var(--gold)'}}>{deal.value}</div>
                  <div style={{fontFamily:'JetBrains Mono',fontSize:9,color:'var(--tx-f)',marginTop:2}}>{deal.id}</div>
                </div>
              </div>
              <div className="progress-bar" style={{marginBottom:10}}><div className="progress-fill" style={{width:`${deal.prog}%`,background:deal.c}}/></div>
              <div style={{display:'flex',gap:8,alignItems:'center',flexWrap:'wrap'}}>
                <span className={`chip ${deal.stage==='closed'?'chip-green':deal.stage==='contract'?'chip-blue':deal.stage==='negotiation'?'chip-amber':'chip-red'}`}>{deal.stage.charAt(0).toUpperCase()+deal.stage.slice(1)}</span>
                {deal.signed&&<span className="chip chip-green">✓ DocuSign</span>}
                {deal.deposit&&<span className="chip chip-blue">✓ Stripe Deposit</span>}
                <span style={{fontFamily:'JetBrains Mono',fontSize:9,color:'var(--tx-f)',marginLeft:'auto'}}>{deal.prog}% complete</span>
                <div style={{display:'flex',gap:6}}>
                  <button className="btn btn-ghost" style={{padding:'4px 10px',fontSize:10}}>📄 Contract</button>
                  <button className="btn btn-ghost" style={{padding:'4px 10px',fontSize:10}}>💳 Stripe</button>
                  <button className="btn btn-green" style={{padding:'4px 10px',fontSize:10}}>WA {deal.phone}</button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── PLACEHOLDER ──────────────────────────────────────────────────────── */
function PlaceholderPage({title,emoji}){return <div className="fade-up" style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',height:'60vh',opacity:.5}}><div style={{fontSize:48,marginBottom:12}}>{emoji}</div><h2 style={{fontFamily:'Cormorant Garamond',fontWeight:300,fontSize:'1.8rem',color:'var(--tx)',marginBottom:6}}>{title}</h2><p style={{color:'var(--tx-f)',fontSize:12}}>Module active · Data loading from Firestore…</p></div>;}

/* ── MAIN APP ─────────────────────────────────────────────────────────── */
const PIPE_STAGES = [
  {k:'New',ar:'جديد',c:'#1E88D9'},
  {k:'Qualifying',ar:'تأهيل',c:'#7C3AED'},
  {k:'Viewing',ar:'معاينة',c:'#f59e0b'},
  {k:'Negotiation',ar:'تفاوض',c:'#00AEFF'},
  {k:'Closed Won',ar:'مغلقة ـ فوز',c:'#34D399'},
  {k:'Closed Lost',ar:'مغلقة ـ خسارة',c:'#E63946'},
];
const PIPE_DEALS = [
  {n:'Ahmed Al-Rashid',d:'Villa · Hyde Park',v:'EGP 20M',s:'Negotiation',ai:9.4},
  {n:'Khalid Mansour',d:'Penthouse · Uptown Cairo',v:'EGP 15M',s:'Negotiation',ai:9.1},
  {n:'Sara Mohamed',d:'3-Bed · Mivida · Rent',v:'$2.4K/mo',s:'Viewing',ai:8.7},
  {n:'Omar Farouk',d:'Twin House · Mountain View',v:'EGP 12.5M',s:'Viewing',ai:8.9},
  {n:'Nadia Hassan',d:'Apartment · Madinaty',v:'EGP 5M',s:'Qualifying',ai:8.2},
  {n:'Layla Karim',d:'Furnished 2-Bed · Eastown',v:'$1.8K/mo',s:'New',ai:7.8},
  {n:'Tarek Aziz',d:'Duplex · Villette',v:'EGP 9.8M',s:'New',ai:8.4},
  {n:'Mona Selim',d:'Villa · Katameya Heights',v:'EGP 38M',s:'Closed Won',ai:9.7},
  {n:'Hassan Badr',d:'Studio · Taj City',v:'EGP 2.1M',s:'Closed Lost',ai:6.1},
];
function PipelinePage({ T }) {
  const ar = T('lang')==='ar';
  const [filter,setFilter]=useState('all');
  const totals={all:PIPE_DEALS.length,active:PIPE_DEALS.filter(d=>!d.s.startsWith('Closed')).length,won:PIPE_DEALS.filter(d=>d.s==='Closed Won').length};
  const stages = filter==='active'?PIPE_STAGES.filter(s=>!s.k.startsWith('Closed')):filter==='won'?PIPE_STAGES.filter(s=>s.k==='Closed Won'):PIPE_STAGES;
  return (
    <div className="fade-up">
      <div style={{display:'flex',gap:8,marginBottom:16,flexWrap:'wrap'}}>
        {[['all',ar?'كل الصفقات':'All Deals'],['active',ar?'النشطة':'Active Pipeline'],['won',ar?'المكسوبة':'Closed Won']].map(([k,l])=>(
          <button key={k} onClick={()=>setFilter(k)} className="topbar-pill" style={filter===k?{background:'var(--tx-s)',color:'var(--bg-e)',borderColor:'var(--tx-s)'}:{}}>{l}</button>
        ))}
        <span style={{marginInlineStart:'auto',fontFamily:'JetBrains Mono',fontSize:10,color:'var(--tx-f)',alignSelf:'center'}}>{ar?'قيمة الخط':'Pipeline value'}: <b style={{color:'var(--gold)'}}>EGP 102.4M</b> · {totals.active} {ar?'نشطة':'active'} · {totals.won} {ar?'مكسوبة':'won'}</span>
      </div>
      <div className="kanban">
        {stages.map(st=>{
          const deals=PIPE_DEALS.filter(d=>d.s===st.k);
          return (
            <div key={st.k} className="kb-col" style={{'--kbc':st.c}}>
              <div className="kb-hd">
                <span className="kb-name" style={{background:st.c+'1c',color:st.c}}>{ar?st.ar:st.k}</span>
                <span className="kb-count">{deals.length}</span>
              </div>
              {deals.map((d,i)=>(
                <div key={i} className="kb-card">
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:4}}>
                    <span style={{fontSize:12,fontWeight:700,color:'var(--tx)'}}>{d.n}</span>
                    <span style={{fontFamily:'JetBrains Mono',fontSize:8.5,color:'var(--gold)'}}>★ {d.ai}</span>
                  </div>
                  <div style={{fontSize:10.5,color:'var(--tx-f)',marginBottom:7}}>{d.d}</div>
                  <div style={{fontFamily:'JetBrains Mono',fontSize:11,fontWeight:700,color:'var(--tx-s)'}}>{d.v}</div>
                </div>
              ))}
              {deals.length===0&&<div style={{padding:'22px 12px',textAlign:'center',fontSize:10.5,color:'var(--tx-f)'}}>{ar?'لا صفقات':'No deals'}</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const TASKS_INIT = [
  {t:'Call Ahmed Al-Rashid — confirm Hyde Park viewing',due:'Today 15:00',pr:'high',done:false,ag:'Sierra Bot'},
  {t:'Send Uptown Cairo contract draft to Khalid (Stage-9)',due:'Today 17:30',pr:'high',done:false,ag:'Stage-9'},
  {t:'Follow up بالعربي with Gulf lead — Leila',due:'Tomorrow 10:00',pr:'med',done:false,ag:'Leila'},
  {t:'Review 23 scraped listings pending AVM pricing',due:'Tomorrow',pr:'med',done:false,ag:'Curator'},
  {t:'Publish weekly compound performance report',due:'Friday',pr:'low',done:false,ag:'—'},
  {t:'Verify Madinaty B10 owner-direct listing photos',due:'Done · Yesterday',pr:'low',done:true,ag:'Scribe'},
];
function TasksPage({ T }) {
  const ar = T('lang')==='ar';
  const [tasks,setTasks]=useState(TASKS_INIT);
  const [view,setView]=useState('active');
  const [q,setQ]=useState('');
  const toggle=i=>setTasks(p=>p.map((t,j)=>j===i?{...t,done:!t.done}:t));
  const shown=tasks.map((t,i)=>({...t,i})).filter(t=>(view==='active'?!t.done:t.done)&&t.t.toLowerCase().includes(q.toLowerCase()));
  const stats=[[tasks.length,ar?'إجمالي المهام':'Total Tasks','#1E88D9'],[tasks.filter(t=>t.done).length,ar?'مكتملة':'Completed','#34D399'],[1,ar?'متأخرة':'Overdue','#E63946'],[tasks.filter(t=>!t.done).length,ar?'قيد التنفيذ':'To Do','#00AEFF']];
  const prC={high:'#E63946',med:'#f59e0b',low:'#1E88D9'};
  return (
    <div className="fade-up">
      <div className="kpi-grid" style={{gridTemplateColumns:'repeat(auto-fill,minmax(150px,1fr))'}}>
        {stats.map(([v,l,c],i)=>(
          <div key={i} className="kpi-card">
            <div style={{position:'absolute',top:0,left:0,width:3,height:'100%',background:c}}/>
            <div className="kpi-val" style={{color:c}}>{v}</div>
            <div className="kpi-lbl">{l}</div>
          </div>
        ))}
      </div>
      <div style={{display:'flex',gap:10,marginBottom:14,flexWrap:'wrap'}}>
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder={ar?'ابحث في المهام…':'Search tasks…'} style={{flex:1,minWidth:200,padding:'10px 14px',borderRadius:11,border:'1px solid var(--bd)',background:'var(--bg-e)',color:'var(--tx)',fontSize:12,outline:'none'}}/>
        {[['active',(ar?'النشطة ':'Active')+' ('+tasks.filter(t=>!t.done).length+')'],['done',(ar?'الأرشيف ':'Archive')+' ('+tasks.filter(t=>t.done).length+')']].map(([k,l])=>(
          <button key={k} onClick={()=>setView(k)} className="topbar-pill" style={view===k?{background:'var(--tx-s)',color:'var(--bg-e)',borderColor:'var(--tx-s)'}:{}}>{l}</button>
        ))}
        <button className="topbar-pill on">+ {ar?'مهمة جديدة':'New Task'}</button>
      </div>
      <div className="card">
        {shown.map(t=>(
          <div key={t.i} className="task-row">
            <button className={'task-check '+(t.done?'done':'')} onClick={()=>toggle(t.i)}>{t.done?'✓':''}</button>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:12.5,fontWeight:600,color:'var(--tx)',textDecoration:t.done?'line-through':'none',opacity:t.done?.55:1}}>{t.t}</div>
              <div style={{fontSize:10,color:'var(--tx-f)',marginTop:3}}>{t.due} · {t.ag}</div>
            </div>
            <span style={{background:prC[t.pr]+'1a',color:prC[t.pr],fontSize:8.5,fontWeight:700,padding:'3px 9px',borderRadius:12,textTransform:'uppercase',letterSpacing:'.08em'}}>{t.pr}</span>
          </div>
        ))}
        {shown.length===0&&<div style={{padding:40,textAlign:'center',color:'var(--tx-f)',fontSize:12}}>{ar?'لا مهام — ابدأ بإنشاء مهمة':'No tasks — start by creating one'}</div>}
      </div>
    </div>
  );
}

const AUTOS_INIT = [
  {n:'Welcome WhatsApp → new lead',d:'Send bilingual intro message when a lead lands in Firestore',on:true,runs:1840},
  {n:'Big Deal Alert',d:'Notify manager on Telegram for deals > EGP 15M',on:true,runs:34},
  {n:'Deal Won → celebration + review ask',d:'Send congrats email & request Google review on close',on:true,runs:97},
  {n:'Stale lead re-engage (7 days)',d:'AI drafts a re-engagement message after 7 days silence',on:false,runs:412},
];
function AutomationsPage({ T }) {
  const ar = T('lang')==='ar';
  const [autos,setAutos]=useState(AUTOS_INIT);
  const toggle=i=>setAutos(p=>p.map((a,j)=>j===i?{...a,on:!a.on}:a));
  const tmpls=[
    {ic:'✉️',bg:'#1E88D9',n:ar?'رسالة ترحيب':'Welcome Message',d:ar?'واتساب تلقائي للعملاء الجدد':'Auto WhatsApp to new leads'},
    {ic:'🔔',bg:'#E63946',n:ar?'تنبيه صفقة كبيرة':'Big Deal Alert',d:ar?'مهمة للمدير للصفقات > 15م':'Task for manager on deals > 15M'},
    {ic:'✦',bg:'#34D399',n:ar?'فوز بالصفقة':'Deal Won',d:ar?'تهنئة عند إغلاق الصفقة':'Celebration email when deal closes'},
  ];
  const stats=[[autos.length,ar?'إجمالي القواعد':'Total Rules','#00AEFF'],[autos.filter(a=>a.on).length,ar?'نشطة':'Active','#34D399'],[autos.filter(a=>!a.on).length,ar?'موقوفة':'Disabled','#E63946'],['98.4%',ar?'نسبة النجاح':'Success Rate','#1E88D9']];
  return (
    <div className="fade-up">
      <div className="kpi-grid" style={{gridTemplateColumns:'repeat(auto-fill,minmax(150px,1fr))'}}>
        {stats.map(([v,l,c],i)=>(
          <div key={i} className="kpi-card">
            <div style={{position:'absolute',top:0,left:0,width:3,height:'100%',background:c}}/>
            <div className="kpi-val" style={{color:c}}>{v}</div>
            <div className="kpi-lbl">{l}</div>
          </div>
        ))}
      </div>
      <div style={{fontFamily:'JetBrains Mono',fontSize:9,letterSpacing:'.16em',textTransform:'uppercase',color:'var(--gold)',margin:'4px 0 10px'}}>✧ {ar?'قوالب سريعة':'Quick Templates'}</div>
      <div className="grid-3" style={{marginBottom:20}}>
        {tmpls.map((t,i)=>(
          <div key={i} className="tmpl-card">
            <div className="tmpl-ic" style={{background:t.bg+'1c',color:t.bg}}>{t.ic}</div>
            <div style={{fontSize:13.5,fontWeight:700,color:'var(--tx)',marginBottom:4}}>{t.n}</div>
            <div style={{fontSize:11,color:'var(--tx-m)'}}>{t.d}</div>
          </div>
        ))}
      </div>
      <div className="card">
        <div className="card-hd"><span className="card-title">⚡ {ar?'القواعد النشطة':'Active Rules'} ({autos.filter(a=>a.on).length})</span><button className="topbar-pill on">+ {ar?'قاعدة جديدة':'New Rule'}</button></div>
        {autos.map((a,i)=>(
          <div key={i} className="task-row">
            <div onClick={()=>toggle(i)} style={{width:34,height:19,borderRadius:12,cursor:'pointer',background:a.on?'var(--emerald)':'var(--bd-s)',position:'relative',transition:'background .2s',flexShrink:0}}>
              <div style={{position:'absolute',top:2,insetInlineStart:a.on?17:2,width:15,height:15,borderRadius:'50%',background:'#fff',transition:'all .2s',boxShadow:'0 1px 3px rgba(0,0,0,.25)'}}/>
            </div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:12.5,fontWeight:600,color:'var(--tx)'}}>{a.n}</div>
              <div style={{fontSize:10,color:'var(--tx-f)',marginTop:3}}>{a.d}</div>
            </div>
            <span style={{fontFamily:'JetBrains Mono',fontSize:9.5,color:'var(--tx-f)'}}>{a.runs.toLocaleString()} runs</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function AdminApp() {
  const [tab,setTab]=useState('overview');
  const [theme,setTheme]=useState(()=>(typeof window!=='undefined'&&localStorage.getItem('admin_theme'))||'light');
  const [langKey,setLangKey]=useState(()=>(typeof window!=='undefined'&&localStorage.getItem('admin_lang'))||'en');
  const [collapsed,setCollapsed]=useState(false);
  const [mobileOpen,setMobileOpen]=useState(false);

  const T = useCallback((key) => LANG[langKey][key] || key, [langKey]);
  const isAr = langKey === 'ar';

  useEffect(()=>{
    document.documentElement.setAttribute('data-theme',theme);
    document.documentElement.setAttribute('dir',isAr?'rtl':'ltr');
    document.body.style.fontFamily=isAr?"'Cairo','Inter',sans-serif":"'Inter',sans-serif";
    localStorage.setItem('admin_theme',theme);
    localStorage.setItem('admin_lang',langKey);
  },[theme,langKey,isAr]);

  const navItems=NAV_ITEMS(T);
  const pageTitles=Object.fromEntries(navItems.map(n=>[n.id,n.label]));

  const renderPage=()=>{
    switch(tab){
      case 'overview':return <OverviewPage T={T}/>;
      case 'agents':return <AgentsPage T={T}/>;
      case 'workflows':return <WorkflowsPage T={T}/>;
      case 'openclaw':return <OpenClawPage T={T}/>;
      case 'nexus':return <NexusAIPage T={T}/>;
      case 'nexus-exchange':return <NexusExchangePage T={T}/>;
      case 'leads':return <LeadsPage T={T}/>;
      case 'pipeline':return <PipelinePage T={T}/>;
      case 'tasks':return <TasksPage T={T}/>;
      case 'automations':return <AutomationsPage T={T}/>;
      case 'listings':return <ListingsHubPage T={T}/>;
      case 'listings-manager':return <ListingsManagerPage/>;
      case 'requests':return <RequestsTicketPage/>;
      case 'curator':return <CuratorPage T={T}/>;
      case 'scribe':return <ScribePage T={T}/>;
      case 'closer':return <Stage9CloserPage T={T}/>;
      case 'reports':return <ReportsPage T={T}/>;
      case 'settings':return <SettingsPage T={T}/>;
      default:return <OverviewPage T={T}/>;
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      <div className={`mobile-overlay ${mobileOpen?'open':''}`} onClick={()=>setMobileOpen(false)}>
        <div className="mobile-sidebar" onClick={e=>e.stopPropagation()}>
          <SidebarContent T={T} tab={tab} setTab={setTab} collapsed={false} setCollapsed={()=>{}} onClose={()=>setMobileOpen(false)}/>
        </div>
      </div>

      {/* Desktop sidebar */}
      <aside id="sidebar" className={collapsed?'collapsed':''}>
        <SidebarContent T={T} tab={tab} setTab={setTab} collapsed={collapsed} setCollapsed={setCollapsed} onClose={null}/>
      </aside>

      {/* Main */}
      <main id="main">
        <div id="topbar">
          <button className="hamburger-btn" onClick={()=>setMobileOpen(true)}><Ic.Menu/></button>
          <h1 className="topbar-title" style={isAr?{fontFamily:"'Cairo',sans-serif"}:{}}>{pageTitles[tab]||'Sierra Estates'}</h1>
          <div style={{marginInlineStart:'auto',display:'flex',gap:8,alignItems:'center'}}>
            <button className="topbar-pill" onClick={()=>setLangKey(l=>l==='en'?'ar':'en')}>
              {isAr?'EN':'ع'}
            </button>
            <button className="topbar-pill" onClick={()=>setTheme(t=>t==='dark'?'light':'dark')}>
              {theme==='dark'?<Ic.Sun/>:<Ic.Moon/>}
            </button>
            <a href="/" className="topbar-pill" style={{textDecoration:'none'}}>↗ {T('livesite')}</a>
            <div className="topbar-pill on"><span className="pulse-dot" style={{color:'var(--emerald)'}}>●</span> 3.0 AI</div>
          </div>
        </div>
        <div id="content">{renderPage()}</div>
      </main>
    </>
  );
}


export default function AdminPortalRoot() {
  return <div id="root"><AdminApp/></div>;
}
