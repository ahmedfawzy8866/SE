'use client';
import Link from 'next/link';
import { useState, useMemo, useEffect } from 'react';
import { ArrowLeft, TrendingUp, Home, SlidersHorizontal } from 'lucide-react';

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

type Zone = 'All' | '5th Settlement' | 'Mokattam' | 'Madinaty' | 'Shorouk' | 'New Cairo (Other)';
const ZONES: Zone[] = ['All','5th Settlement','Mokattam','Madinaty','Shorouk','New Cairo (Other)'];

const COMPOUNDS = [
  { name:'Hyde Park New Cairo',  zone:'5th Settlement',    dev:'Hyde Park',        ai:9.8, grow:22, net:5.2, units:'2,400+', type:'Villas & TH', img:'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=700&q=80' },
  { name:'Mountain View iCity',  zone:'5th Settlement',    dev:'Mountain View',    ai:9.6, grow:24, net:4.8, units:'3,200+', type:'Mixed', img:'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=700&q=80' },
  { name:'Villette (SODIC)',     zone:'5th Settlement',    dev:'SODIC',            ai:9.3, grow:20, net:4.5, units:'1,800+', type:'Villas', img:'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=700&q=80' },
  { name:'Uptown Cairo',        zone:'Mokattam',           dev:'Emaar Misr',       ai:9.5, grow:31, net:6.1, units:'5,000+', type:'Villas & Apts', img:'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=700&q=80' },
  { name:'Taj City',            zone:'New Cairo (Other)',  dev:'Al Ahly Sabbour',  ai:9.5, grow:19, net:5.8, units:'3,000+', type:'Villas', img:'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=700&q=80' },
  { name:'Palm Hills New Cairo', zone:'5th Settlement',    dev:'Palm Hills',       ai:9.2, grow:21, net:4.4, units:'4,000+', type:'Villas & TH', img:'https://images.unsplash.com/photo-1607582278955-eb5804d31d60?w=700&q=80' },
  { name:'Mivida',              zone:'5th Settlement',    dev:'Emaar Misr',       ai:9.1, grow:18, net:4.2, units:'1,600+', type:'Villas & Apts', img:'https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=700&q=80' },
  { name:'Eastown (SODIC)',     zone:'5th Settlement',    dev:'SODIC',            ai:9.0, grow:19, net:4.0, units:'2,100+', type:'Apts & TH', img:'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=700&q=80' },
  { name:'Katameya Heights',    zone:'5th Settlement',    dev:'MNHD',             ai:9.0, grow:10, net:3.8, units:'800+',  type:'Villas', img:'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=700&q=80' },
  { name:'Al Burouj (Capital)', zone:'Shorouk',           dev:'Capital Group',    ai:9.2, grow:18, net:4.6, units:'2,200+', type:'Mixed', img:'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=700&q=80' },
  { name:'Madinaty',            zone:'Madinaty',           dev:'TMG',              ai:9.3, grow:17, net:4.3, units:'40,000+',type:'All types', img:'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=700&q=80' },
  { name:'District 5',         zone:'New Cairo (Other)',  dev:'Marakez',          ai:9.0, grow:15, net:4.1, units:'1,200+', type:'Mixed', img:'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=700&q=80' },
];

export default function CompoundsPage() {
  const [zone, setZone] = useState<Zone>('All');
  const [sortBy, setSortBy] = useState<'ai'|'grow'|'net'>('ai');
  const [visible, setVisible] = useState(false);

  useEffect(() => { const id = requestAnimationFrame(() => setVisible(true)); return () => cancelAnimationFrame(id); }, []);

  const list = useMemo(() => {
    const f = zone === 'All' ? COMPOUNDS : COMPOUNDS.filter(c => c.zone === zone);
    return [...f].sort((a,b) => b[sortBy] - a[sortBy]);
  }, [zone, sortBy]);

  return (
    <main style={{ minHeight:'100dvh', background:T.bone, fontFamily:F.body, color:T.charcoal }}>
      <style>{`
        ${LASER_CSS}
        @keyframes cardIn { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:none} }
        @keyframes barFill { from{width:0} to{width:var(--w)} }
        .ccard:hover { border-color:rgba(201,162,77,.4) !important; box-shadow:0 14px 36px rgba(10,22,40,.13) !important; transform:translateY(-3px); }
        .ccard { transition:border-color .2s,box-shadow .2s,transform .2s ${T.ease}; }
        .ccard:hover .ccard-img { transform:scale(1.06); }
        .ccard-img { transition:transform .6s ${T.ease}; }
        .chip:hover { border-color:${T.charcoal} !important; color:${T.charcoal} !important; }
        .chip.on { background:${T.navy} !important; color:#fff !important; border-color:${T.navy} !important; }
        .chip { transition:background .18s,color .18s,border-color .18s; }
        .sort-btn.on { color:${T.gold} !important; border-color:${T.gold} !important; }
        .sort-btn { transition:color .18s,border-color .18s; }
      `}</style>

      <div style={{ maxWidth:1200, margin:'0 auto', padding:'22px 24px 0' }}>
        <Link href="/clients" style={{ display:'inline-flex', alignItems:'center', gap:8, color:T.gold, fontFamily:F.mono, fontSize:12, fontWeight:700, letterSpacing:'.1em', textTransform:'uppercase', textDecoration:'none' }}>
          <ArrowLeft size={14} /> Back to Portal
        </Link>
      </div>

      {/* Hero */}
      <section style={{ background:`linear-gradient(135deg,#07121e 0%,#0D1F30 60%,#07121e 100%)`, padding:'clamp(48px,7vw,72px) 24px clamp(40px,6vw,56px)', position:'relative', overflow:'hidden' }}>
        <div className="hero-laser" />
        <div style={{ position:'absolute', inset:0, background:`radial-gradient(700px 360px at 75% 10%,rgba(201,162,77,.15),transparent 60%)`, pointerEvents:'none' }} />
        <div style={{ maxWidth:1200, margin:'0 auto', position:'relative', zIndex:2 }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:10, fontFamily:F.mono, fontSize:11, fontWeight:700, letterSpacing:'.2em', textTransform:'uppercase', color:T.gold, marginBottom:18 }}>
            <span style={{ width:28, height:1.5, background:T.gold, display:'inline-block' }} />
            29 COMPOUNDS · SIERRA INTEL
          </div>
          <h1 style={{ color:'#fff', fontFamily:F.display, fontSize:'clamp(28px,5vw,46px)', fontWeight:700, letterSpacing:'-.02em', lineHeight:1.05, margin:'0 0 16px', maxWidth:700 }}>
            Every compound,{' '}<em style={{ fontStyle:'italic', color:T.goldHi }}>scored by AI</em>
          </h1>
          <p style={{ color:'rgba(244,240,232,.78)', maxWidth:540, fontSize:'clamp(14px,1.7vw,15px)', lineHeight:1.6, margin:0 }}>
            Hyde Park +22% · Mountain View +24% · Uptown +31%. Filter by zone, sort by AI score, growth, or net yield.
          </p>
        </div>
      </section>

      {/* Filter bar */}
      <div style={{ background:T.ivory, borderBottom:`1px solid ${T.line}`, padding:'13px 24px', position:'sticky', top:0, zIndex:10, boxShadow:`0 2px 8px rgba(10,22,40,.06)` }}>
        <div style={{ maxWidth:1200, margin:'0 auto', display:'flex', gap:10, alignItems:'center', flexWrap:'wrap' }}>
          <SlidersHorizontal size={14} style={{ color:T.mist }} />
          {ZONES.map(z => (
            <button key={z} className={`chip${zone===z?' on':''}`} onClick={() => setZone(z)}
              style={{ border:`1.5px solid ${T.lineStrong}`, borderRadius:999, padding:'7px 15px', background:T.bone, cursor:'pointer', fontFamily:F.body, fontSize:12, fontWeight:700, color:T.mist }}>
              {z}
            </button>
          ))}
          <div style={{ marginLeft:'auto', display:'flex', gap:8, alignItems:'center' }}>
            <span style={{ fontFamily:F.mono, fontSize:11, color:T.mist, fontWeight:700, textTransform:'uppercase', letterSpacing:'.06em' }}>Sort:</span>
            {([['ai','AI Score'],['grow','Growth'],['net','Net Yield']] as [string,string][]).map(([k,l]) => (
              <button key={k} className={`sort-btn${sortBy===k?' on':''}`} onClick={() => setSortBy(k as 'ai'|'grow'|'net')}
                style={{ border:`1.5px solid ${T.lineStrong}`, borderRadius:8, padding:'6px 12px', background:'transparent', cursor:'pointer', fontFamily:F.mono, fontSize:11, fontWeight:800, color:T.mist, textTransform:'uppercase', letterSpacing:'.06em' }}>
                {l}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid */}
      <section style={{ padding:'clamp(28px,4vw,44px) 24px clamp(60px,8vw,100px)' }}>
        <div style={{ maxWidth:1200, margin:'0 auto', display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(320px,1fr))', gap:22 }}>
          {list.map((c, i) => (
            <Link key={c.name} href={`/properties?compound=${encodeURIComponent(c.name)}`} className="ccard" style={{ background:T.ivory, border:`1px solid ${T.line}`, borderRadius:18, overflow:'hidden', display:'flex', flexDirection:'column', textDecoration:'none', color:'inherit', opacity:visible?1:0, animation:visible?`cardIn .5s ${T.ease} ${i*55}ms both`:'none' }}>
              {/* Image */}
              <div style={{ position:'relative', height:192, overflow:'hidden', flexShrink:0 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={c.img} alt={c.name} className="ccard-img" style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }} />
                <div style={{ position:'absolute', inset:0, background:'linear-gradient(180deg,transparent 55%,rgba(7,18,30,.55) 100%)' }} />
                {/* AI badge */}
                <span style={{ position:'absolute', top:10, right:10, background:'rgba(9,24,40,.88)', backdropFilter:'blur(8px)', border:`1px solid rgba(201,162,77,.35)`, color:T.goldHi, fontFamily:F.mono, fontSize:11, fontWeight:800, padding:'5px 11px', borderRadius:8, letterSpacing:'.06em' }}>
                  AI {c.ai}
                </span>
                <span style={{ position:'absolute', bottom:10, left:10, fontFamily:F.mono, fontSize:10, fontWeight:700, color:'rgba(244,240,232,.8)', letterSpacing:'.06em', textTransform:'uppercase' }}>
                  {c.zone}
                </span>
              </div>

              {/* Info */}
              <div style={{ padding:'18px 18px 20px', flex:1, display:'flex', flexDirection:'column' }}>
                <div style={{ fontFamily:F.mono, fontSize:11, color:T.gold, fontWeight:700, letterSpacing:'.1em', textTransform:'uppercase', marginBottom:5 }}>{c.dev}</div>
                <h3 style={{ fontFamily:F.display, fontSize:20, fontWeight:700, color:T.charcoal, margin:'0 0 4px', letterSpacing:'-.005em' }}>{c.name}</h3>
                <div style={{ fontSize:12.5, color:T.slate, marginBottom:14, display:'flex', gap:12 }}>
                  <span style={{ display:'inline-flex', alignItems:'center', gap:4 }}><Home size={12} style={{ color:T.mist }} /> {c.type}</span>
                  <span style={{ display:'inline-flex', alignItems:'center', gap:4 }}><TrendingUp size={12} style={{ color:T.mist }} /> {c.units} units</span>
                </div>

                {/* Metrics bar trio */}
                <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10, paddingTop:14, borderTop:`1px solid ${T.line}` }}>
                  {[{l:'5yr Growth',v:`+${c.grow}%`},{l:'Net Yield',v:`${c.net}%`},{l:'AI Score',v:c.ai}].map(({l,v}) => (
                    <div key={l} style={{ textAlign:'center' }}>
                      <div style={{ fontFamily:F.mono, fontSize:17, fontWeight:800, color:T.gold, fontVariantNumeric:'tabular-nums' }}>{v}</div>
                      <div style={{ fontFamily:F.mono, fontSize:10, color:T.mist, marginTop:3, textTransform:'uppercase', letterSpacing:'.08em', fontWeight:700 }}>{l}</div>
                    </div>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
