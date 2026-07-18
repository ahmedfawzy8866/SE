'use client';
import Link from 'next/link';
import { useState, useMemo, useEffect } from 'react';
import { ArrowLeft, Building2, BedDouble, Bath, Maximize, PhoneCall, SearchX, SlidersHorizontal } from 'lucide-react';

const T = { navy:'#0A1628', bone:'#F4F0E8', ivory:'#FDFCF9', charcoal:'#1A2535', slate:'#4B5A6A', mist:'#8C9BAB', line:'rgba(26,37,53,0.1)', lineStrong:'rgba(26,37,53,0.15)', gold:'#C9A24D', goldHi:'#E9C176', goldDeep:'#A87C2A', ease:'cubic-bezier(0.22,1,0.36,1)' } as const;
const F = { display:'"Playfair Display","Instrument Serif",serif', body:'"Plus Jakarta Sans","Cairo",sans-serif', mono:'"JetBrains Mono","Geist Mono",monospace' } as const;

const LASER_CSS = `
  @keyframes se-laser {
    0%   { transform:translateY(0);     opacity:0; }
    8%   { opacity:.95; }
    92%  { opacity:.95; }
    100% { transform:translateY(640px); opacity:0; }
  }
  .hero-laser {
    position:absolute; left:0; right:0; top:0; height:2px; z-index:2;
    pointer-events:none;
    background:linear-gradient(90deg,transparent,#e9c176 18%,#fff 50%,#c8961a 82%,transparent);
    box-shadow:0 0 14px 2px rgba(233,193,118,.65);
    opacity:.9;
  }
  @media (prefers-reduced-motion: no-preference) {
    .hero-laser { animation: se-laser 5s cubic-bezier(.6,0,.4,1) infinite; }
  }
  @media (prefers-reduced-motion: reduce) { .hero-laser { display:none; } }
`;

const PROPERTY_TYPES = ['All','Villa','Apartment','Twin House','Penthouse','Studio','Townhouse'] as const;
type PropType = typeof PROPERTY_TYPES[number];
type Mode = 'all' | 'sale' | 'rent';

interface Listing {
  id: number; code: string; compound: string; zone: string;
  type: string; beds: number; bath: number; area: number;
  egpM: number; usd: number; ai: number; tag: string | null;
  mode: 'sale' | 'rent'; img: string;
}

const LISTINGS: Listing[] = [
  { id:1, code:'HP-VL-01',  compound:'Hyde Park',      zone:'5th Settlement', type:'Villa',      beds:5, bath:5, area:480, egpM:28.5, usd:5200, ai:9.8, tag:'Premium',    mode:'sale', img:'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80' },
  { id:2, code:'MVW-TH-02', compound:'Mountain View',  zone:'5th Settlement', type:'Twin House', beds:4, bath:3, area:280, egpM:15.5, usd:2400, ai:9.6, tag:'Featured',   mode:'sale', img:'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&q=80' },
  { id:3, code:'MV-AP-03',  compound:'Mivida',         zone:'5th Settlement', type:'Apartment',  beds:3, bath:2, area:145, egpM:6.8,  usd:1650, ai:9.1, tag:'Smart Match',mode:'rent', img:'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80' },
  { id:4, code:'UPC-PH-04', compound:'Uptown Cairo',   zone:'Mokattam',       type:'Penthouse',  beds:4, bath:3, area:300, egpM:18.5, usd:3800, ai:9.5, tag:'Exclusive',  mode:'sale', img:'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80' },
  { id:5, code:'TAJ-VL-05', compound:'Taj City',       zone:'New Cairo',      type:'Villa',      beds:5, bath:5, area:500, egpM:35.0, usd:6500, ai:9.5, tag:'Premium',    mode:'sale', img:'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800&q=80' },
  { id:6, code:'VLT-VL-06', compound:'Villette',       zone:'5th Settlement', type:'Villa',      beds:4, bath:4, area:390, egpM:24.5, usd:4400, ai:9.3, tag:'New',        mode:'sale', img:'https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=800&q=80' },
  { id:7, code:'PH-VL-07',  compound:'Palm Hills',     zone:'5th Settlement', type:'Villa',      beds:4, bath:3, area:380, egpM:23.5, usd:4200, ai:9.2, tag:'Best ROI',   mode:'sale', img:'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&q=80' },
  { id:8, code:'EST-DX-08', compound:'Eastown',        zone:'5th Settlement', type:'Apartment',  beds:3, bath:2, area:220, egpM:11.5, usd:2400, ai:9.1, tag:null,         mode:'rent', img:'https://images.unsplash.com/photo-1615873968403-89e068629265?w=800&q=80' },
  { id:9, code:'KH-VL-09',  compound:'Katameya Heights',zone:'Katameya',      type:'Villa',      beds:5, bath:4, area:460, egpM:26.0, usd:4900, ai:9.0, tag:'Rare',       mode:'sale', img:'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80' },
  { id:10,code:'MN-AP-10',  compound:'Madinaty',       zone:'Madinaty',       type:'Apartment',  beds:2, bath:2, area:120, egpM:5.8,  usd:1200, ai:8.8, tag:null,         mode:'rent', img:'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=800&q=80' },
  { id:11,code:'ALB-TH-11', compound:'Al Burouj',      zone:'Shorouk',        type:'Townhouse',  beds:3, bath:3, area:240, egpM:13.0, usd:2600, ai:9.2, tag:'Best ROI',   mode:'sale', img:'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&q=80' },
  { id:12,code:'D5-ST-12',  compound:'District 5',     zone:'New Cairo',      type:'Studio',     beds:1, bath:1, area:80,  egpM:3.2,  usd:900,  ai:8.7, tag:null,         mode:'rent', img:'https://images.unsplash.com/photo-1480074568708-e7b720bb3f09?w=800&q=80' },
];

const TAG_COLORS: Record<string, string> = {
  Premium: T.gold, Featured: '#60a5fa', 'Smart Match': '#34d399',
  Exclusive: T.goldDeep, New: '#a78bfa', 'Best ROI': T.gold, Rare: T.mist,
};

export default function PropertiesPage() {
  const [typeFilter, setTypeFilter] = useState<PropType>('All');
  const [mode, setMode] = useState<Mode>('all');
  const [visible, setVisible] = useState(false);

  useEffect(() => { const id = requestAnimationFrame(() => setVisible(true)); return () => cancelAnimationFrame(id); }, []);

  const filtered = useMemo(() => {
    return LISTINGS.filter(l => {
      const typeOk = typeFilter === 'All' ||
        (typeFilter === 'Twin House' && (l.type === 'Twin House' || l.type === 'Townhouse')) ||
        (typeFilter === 'Penthouse' && (l.type === 'Penthouse' || l.type === 'Duplex')) ||
        l.type === typeFilter;
      const modeOk = mode === 'all' || l.mode === mode;
      return typeOk && modeOk;
    }).sort((a, b) => b.ai - a.ai);
  }, [typeFilter, mode]);

  return (
    <main style={{ minHeight:'100dvh', background:T.bone, fontFamily:F.body, color:T.charcoal }}>
      <style>{`
        ${LASER_CSS}
        @keyframes cardIn { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:none} }
        .pcard:hover { transform:translateY(-4px); border-color:rgba(201,162,77,.4) !important; box-shadow:0 16px 40px rgba(10,22,40,.14) !important; }
        .pcard { transition:transform .25s ${T.ease},box-shadow .25s,border-color .25s; }
        .pcard:hover .pcard-img { transform:scale(1.07); }
        .pcard-img { transition:transform .6s ${T.ease}; }
        .chip-btn { transition:background .18s,color .18s,border-color .18s; }
        .chip-btn.on { background:${T.navy} !important; color:#fff !important; border-color:${T.navy} !important; }
        .cta-gold:hover { transform:translateY(-2px); box-shadow:0 8px 24px rgba(167,124,42,.35) !important; }
        .cta-gold { transition:transform .2s ${T.ease},box-shadow .2s; }
        @media(prefers-reduced-motion:reduce){ .pcard{animation:none!important;opacity:1!important} }
      `}</style>

      <div style={{ maxWidth:1200, margin:'0 auto', padding:'22px 24px 0' }}>
        <Link href="/clients" style={{ display:'inline-flex', alignItems:'center', gap:8, color:T.gold, fontFamily:F.mono, fontSize:12, fontWeight:700, letterSpacing:'.1em', textTransform:'uppercase', textDecoration:'none' }}>
          <ArrowLeft size={14} /> Back to Portal
        </Link>
      </div>

      {/* Hero */}
      <section style={{ background:`linear-gradient(135deg,#07121e 0%,#0D1F30 60%,#07121e 100%)`, padding:'clamp(48px,6vw,68px) 24px clamp(36px,5vw,52px)', position:'relative', overflow:'hidden' }}>
        <div className="hero-laser" />
        <div style={{ position:'absolute', inset:0, background:`radial-gradient(700px 360px at 75% 15%,rgba(201,162,77,.15),transparent 60%)`, pointerEvents:'none' }} />
        <div style={{ maxWidth:1200, margin:'0 auto', position:'relative', zIndex:2 }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:10, fontFamily:F.mono, fontSize:11, fontWeight:700, letterSpacing:'.2em', textTransform:'uppercase', color:T.gold, marginBottom:18 }}>
            <span style={{ width:28, height:1.5, background:T.gold, display:'inline-block' }} />
            ALL PROPERTIES · NEW CAIRO
          </div>
          <h1 style={{ color:'#fff', fontFamily:F.display, fontSize:'clamp(28px,4.5vw,44px)', fontWeight:700, letterSpacing:'-.02em', lineHeight:1.05, margin:'0 0 14px', maxWidth:700 }}>
            Every listing,{' '}<em style={{ fontStyle:'italic', color:T.goldHi }}>scored & ranked by AI</em>
          </h1>
          <p style={{ color:'rgba(244,240,232,.78)', maxWidth:540, fontSize:'clamp(14px,1.7vw,15px)', lineHeight:1.6, margin:0 }}>
            {filtered.length} of {LISTINGS.length} units match your filters. Sorted by Sierra AI score — highest confidence first.
          </p>
        </div>
      </section>

      {/* Filters */}
      <div style={{ background:T.ivory, borderBottom:`1px solid ${T.line}`, padding:'14px 24px', position:'sticky', top:0, zIndex:10, boxShadow:`0 2px 8px rgba(10,22,40,.06)` }}>
        <div style={{ maxWidth:1200, margin:'0 auto', display:'flex', gap:10, flexWrap:'wrap', alignItems:'center' }}>
          <SlidersHorizontal size={15} style={{ color:T.mist, flexShrink:0 }} />
          {/* Mode */}
          <div style={{ display:'flex', gap:4, padding:3, background:T.bone, borderRadius:999 }}>
            {(['all','sale','rent'] as Mode[]).map(v => (
              <button key={v} className={`chip-btn${mode===v?' on':''}`} onClick={() => setMode(v)}
                style={{ border:`1.5px solid ${T.lineStrong}`, borderRadius:999, padding:'7px 14px', background:T.bone, cursor:'pointer', fontFamily:F.body, fontSize:12, fontWeight:700, color:T.mist }}>
                {v==='all'?'All':v==='sale'?'Resale':'Rent'}
              </button>
            ))}
          </div>
          <div style={{ width:1, height:22, background:T.line }} />
          {/* Type chips */}
          {PROPERTY_TYPES.map(t => (
            <button key={t} className={`chip-btn${typeFilter===t?' on':''}`} onClick={() => setTypeFilter(t)}
              style={{ border:`1.5px solid ${T.lineStrong}`, borderRadius:999, padding:'7px 16px', background:T.bone, cursor:'pointer', fontFamily:F.body, fontSize:12, fontWeight:700, color:T.mist }}>
              {t}
            </button>
          ))}
          <span style={{ marginLeft:'auto', fontFamily:F.mono, fontSize:12, color:T.mist, fontWeight:700, letterSpacing:'.06em', textTransform:'uppercase' }}>
            {filtered.length} results
          </span>
        </div>
      </div>

      {/* Grid */}
      <section style={{ padding:'clamp(28px,4vw,44px) 24px clamp(60px,8vw,100px)' }}>
        <div style={{ maxWidth:1200, margin:'0 auto' }}>
          {filtered.length === 0 ? (
            <div style={{ textAlign:'center', padding:'80px 0', color:T.mist }}>
              <SearchX size={44} style={{ margin:'0 auto 16px', color:T.line }} />
              <div style={{ fontFamily:F.display, fontSize:22, fontWeight:700, color:T.charcoal, marginBottom:6 }}>No units matched</div>
              <div style={{ fontSize:14, color:T.slate }}>Try changing type or mode filters above.</div>
            </div>
          ) : (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(320px,1fr))', gap:22 }}>
              {filtered.map((l, i) => (
                <div key={l.id} className="pcard" style={{ background:T.ivory, border:`1px solid ${T.line}`, borderRadius:18, overflow:'hidden', display:'flex', flexDirection:'column', boxShadow:`0 2px 12px rgba(10,22,40,.07)`, opacity:visible?1:0, animation:visible?`cardIn .55s ${T.ease} ${i*55}ms both`:'none' }}>
                  <div style={{ position:'relative', height:194, overflow:'hidden', flexShrink:0 }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={l.img} alt={l.compound} loading="lazy" className="pcard-img" style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }} />
                    <div style={{ position:'absolute', inset:0, background:'linear-gradient(180deg,transparent 50%,rgba(7,18,30,.55) 100%)' }} />
                    {l.tag && (
                      <span style={{ position:'absolute', top:10, left:10, background:`rgba(9,24,40,.88)`, backdropFilter:'blur(8px)', border:`1px solid ${TAG_COLORS[l.tag] ?? T.gold}44`, color:TAG_COLORS[l.tag] ?? T.gold, fontFamily:F.mono, fontSize:10, fontWeight:800, padding:'5px 10px', borderRadius:7, letterSpacing:'.08em', textTransform:'uppercase' }}>
                        {l.tag}
                      </span>
                    )}
                    <span style={{ position:'absolute', top:10, right:10, background:'rgba(255,255,255,.93)', color:T.charcoal, fontFamily:F.mono, fontSize:11, fontWeight:800, padding:'5px 10px', borderRadius:7, fontVariantNumeric:'tabular-nums' }}>
                      {l.ai.toFixed(1)} AI
                    </span>
                  </div>
                  <div style={{ padding:'16px 18px', flex:1, display:'flex', flexDirection:'column' }}>
                    <div style={{ fontFamily:F.mono, fontSize:10.5, letterSpacing:'.12em', textTransform:'uppercase', color:T.gold, fontWeight:700, marginBottom:5 }}>{l.code} · {l.zone}</div>
                    <div style={{ fontFamily:F.display, fontSize:21, fontWeight:700, color:T.charcoal, letterSpacing:'-.005em', marginBottom:6, lineHeight:1.2 }}>{l.compound}</div>
                    <div style={{ fontFamily:F.mono, fontSize:16, fontWeight:800, color:T.charcoal, marginBottom:14, fontVariantNumeric:'tabular-nums' }}>
                      {l.mode==='rent' ? `$${l.usd.toLocaleString()}/mo` : `EGP ${l.egpM}M`}
                    </div>
                    <div style={{ display:'flex', gap:14, paddingTop:12, borderTop:`1px solid ${T.line}`, fontSize:12, color:T.slate, fontWeight:600, flexWrap:'wrap', flex:1, alignItems:'center' }}>
                      {[{Icon:Building2,l:l.type},{Icon:BedDouble,l:`${l.beds} bd`},{Icon:Bath,l:`${l.bath} ba`},{Icon:Maximize,l:`${l.area}m²`}].map(({Icon,l:label}) => (
                        <span key={label} style={{ display:'inline-flex', alignItems:'center', gap:4 }}><Icon size={12} style={{ color:T.mist }} /> {label}</span>
                      ))}
                    </div>
                    <Link href={`/property?id=${l.id}`} className="cta-gold" style={{ marginTop:14, display:'flex', alignItems:'center', justifyContent:'center', gap:7, padding:'11px 18px', borderRadius:9, background:`linear-gradient(135deg,${T.gold},${T.goldDeep})`, color:T.navy, fontFamily:F.body, fontWeight:800, fontSize:13, textDecoration:'none' }}>
                      <PhoneCall size={12} /> View Property
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
