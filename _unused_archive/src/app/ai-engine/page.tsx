'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { ArrowLeft, Zap, Target, TrendingUp, Map, MessageSquare, Brain, Check } from 'lucide-react';

const T = { navy:'#0A1628', bone:'#F4F0E8', ivory:'#FDFCF9', charcoal:'#1A2535', slate:'#4B5A6A', mist:'#8C9BAB', line:'rgba(26,37,53,0.1)', lineStrong:'rgba(26,37,53,0.15)', gold:'#C9A24D', goldHi:'#E9C176', goldDeep:'#A87C2A', green:'#34d399', ease:'cubic-bezier(0.22,1,0.36,1)' } as const;
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

const PRICE_DATA = [
  { y:'2020', v:3.2 }, { y:'2021', v:4.1 }, { y:'2022', v:5.8 },
  { y:'2023', v:8.4 }, { y:'2024', v:11.9 }, { y:'2025', v:16.2 },
];

const ROI_DATA = [
  { n:'Uptown Cairo',        pct:31, ai:9.4 },
  { n:'Mountain View iCity', pct:24, ai:9.6 },
  { n:'Hyde Park',           pct:22, ai:9.8 },
  { n:'Palm Hills NC',       pct:21, ai:9.2 },
  { n:'Villette',            pct:20, ai:9.3 },
  { n:'SODIC East',          pct:18, ai:9.1 },
  { n:'Mivida',              pct:18, ai:9.1 },
  { n:'Eastown',             pct:19, ai:9.0 },
];

const AI_TOOLS = [
  { Icon:Target,        name:'AVM Pricing Engine', status:'LIVE',   desc:'Real-time valuation across 25 compounds. 88% confidence interval. Updates every 4h.', href:'/pricing' },
  { Icon:Zap,           name:'Smart Match v3',     status:'LIVE',   desc:'40-point property-to-buyer scoring. 97.3% match accuracy on verified criteria.', href:'/matches' },
  { Icon:TrendingUp,    name:'ROI Forecaster',     status:'LIVE',   desc:'5-year appreciation model. Compound-level yield analysis with Q2 2026 signals.', href:'/roi' },
  { Icon:Brain,         name:'Dream Home Wizard',  status:'ACTIVE', desc:'4-question wizard → compound + unit type recommendation via decision tree.', href:'/advice' },
  { Icon:Map,           name:'Map Intelligence',   status:'LIVE',   desc:'29-compound geo-intelligence layer. Unit density, yield heatmap, access index.', href:'/compounds' },
  { Icon:MessageSquare, name:'Sierra AI Chat',      status:'LIVE',   desc:'Bilingual concierge (EN+AR). Gemini 2.5 Flash. Compound-aware responses.', href:'/clients' },
];

const SLIDES = [
  { eye:'INTELLIGENCE OS PLATFORM', img:'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=1400&q=80', h1:'Powered by', em:'AI Engine 3.0' },
  { eye:'AVM PREDICTIVE PRICING',   img:'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1400&q=80', h1:'Real-Time', em:'Market Valuation' },
  { eye:'ROI COMPOUNDING YIELD',    img:'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1400&q=80', h1:'Smart Matches for', em:'Smart Investors' },
];

// SVG Price Chart
function PriceChart({ visible }: { visible: boolean }) {
  const maxV = Math.max(...PRICE_DATA.map(d => d.v));
  const W = 560, H = 160, PAD = 32;
  const pts = PRICE_DATA.map((d, i) => ({
    x: PAD + (i / (PRICE_DATA.length - 1)) * (W - PAD * 2),
    y: H - PAD - ((d.v / maxV) * (H - PAD * 2)),
  }));
  const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
  const areaPath = `${path} L${pts[pts.length-1].x},${H-PAD} L${pts[0].x},${H-PAD} Z`;

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ overflow:'visible', display:'block' }}>
      <defs>
        <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={T.gold} stopOpacity={0.28} />
          <stop offset="100%" stopColor={T.gold} stopOpacity={0} />
        </linearGradient>
        <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={T.goldDeep} />
          <stop offset="100%" stopColor={T.goldHi} />
        </linearGradient>
      </defs>
      <path d={areaPath} fill="url(#chartGrad)" />
      <path d={path} fill="none" stroke="url(#lineGrad)" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"
        style={{ strokeDasharray:800, strokeDashoffset: visible ? 0 : 800, transition:`stroke-dashoffset 2s ${T.ease}` }} />
      {pts.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r={5} fill={T.gold} stroke={T.navy} strokeWidth={2} style={{ opacity: visible ? 1 : 0, transition:`opacity .4s ${T.ease} ${i*120}ms` }} />
          <text x={p.x} y={H - 6} textAnchor="middle" fill={T.mist} fontSize={10} fontFamily={F.mono} fontWeight={700}>{PRICE_DATA[i].y}</text>
          <text x={p.x} y={p.y - 12} textAnchor="middle" fill={T.goldHi} fontSize={10} fontFamily={F.mono} fontWeight={800} style={{ opacity: visible ? 1 : 0, transition:`opacity .4s ${T.ease} ${i*120+200}ms` }}>{PRICE_DATA[i].v}M</text>
        </g>
      ))}
    </svg>
  );
}

export default function AIEnginePage() {
  const [slide, setSlide] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => { const id = requestAnimationFrame(() => setVisible(true)); return () => cancelAnimationFrame(id); }, []);
  useEffect(() => { const t = setInterval(() => setSlide(s => (s+1)%SLIDES.length), 4500); return () => clearInterval(t); }, []);

  const s = SLIDES[slide];

  return (
    <main style={{ minHeight:'100dvh', background:T.bone, fontFamily:F.body, color:T.charcoal }}>
      <style>{`
        ${LASER_CSS}
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:none} }
        @keyframes barFill { from{width:0} to{width:var(--w)} }
        @keyframes kenburns { from{transform:scale(1)} to{transform:scale(1.07)} }
        @keyframes slideFade { from{opacity:0} to{opacity:1} }
        .tool-card:hover { border-color:rgba(201,162,77,.4) !important; transform:translateY(-3px); box-shadow:0 12px 32px rgba(10,22,40,.12) !important; }
        .tool-card { transition:border-color .2s,transform .2s ${T.ease},box-shadow .2s; }
        .cta-gold:hover { transform:translateY(-2px); box-shadow:0 8px 24px rgba(167,124,42,.35) !important; }
        .cta-gold { transition:transform .2s ${T.ease},box-shadow .2s; }
        .live-dot { animation:livePulse 1.6s ease-in-out infinite; }
        @keyframes livePulse { 0%,100%{opacity:1} 50%{opacity:.35} }
      `}</style>

      <div style={{ maxWidth:1200, margin:'0 auto', padding:'22px 24px 0' }}>
        <Link href="/clients" style={{ display:'inline-flex', alignItems:'center', gap:8, color:T.gold, fontFamily:F.mono, fontSize:12, fontWeight:700, letterSpacing:'.1em', textTransform:'uppercase', textDecoration:'none' }}>
          <ArrowLeft size={14} /> Back to Portal
        </Link>
      </div>

      {/* Hero slideshow */}
      <section style={{ position:'relative', minHeight:480, overflow:'hidden', background:T.navy, marginTop:20 }}>
        <div className="hero-laser" />
        {/* BG image */}
        <div key={s.img} style={{ position:'absolute', inset:0, animation:'slideFade .8s ease both' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={s.img} alt="" style={{ width:'100%', height:'100%', objectFit:'cover', animation:'kenburns 9s linear forwards' }} />
          <div style={{ position:'absolute', inset:0, background:'linear-gradient(180deg,rgba(7,18,30,.55) 0%,rgba(7,18,30,.3) 40%,rgba(7,18,30,.78) 100%)' }} />
        </div>
        {/* Gold glow */}
        <div style={{ position:'absolute', inset:0, background:`radial-gradient(700px 360px at 80% 10%,rgba(201,162,77,.16),transparent 60%)`, pointerEvents:'none', zIndex:2 }} />

        {/* Content */}
        <div style={{ maxWidth:1200, margin:'0 auto', padding:'clamp(56px,8vw,80px) 24px', position:'relative', zIndex:3 }}>
          <div key={slide} style={{ animation:'slideUp .6s ease both' }}>
            <div style={{ display:'inline-flex', alignItems:'center', gap:10, fontFamily:F.mono, fontSize:11, fontWeight:700, letterSpacing:'.2em', textTransform:'uppercase', color:T.gold, marginBottom:18 }}>
              <span className="live-dot" style={{ width:7, height:7, borderRadius:'50%', background:T.green, display:'inline-block' }} />
              {s.eye}
            </div>
            <h1 style={{ color:'#fff', fontFamily:F.display, fontSize:'clamp(28px,5vw,52px)', fontWeight:700, letterSpacing:'-.02em', lineHeight:1.05, margin:'0 0 8px' }}>
              {s.h1}{' '}<em style={{ fontStyle:'italic', color:T.goldHi }}>{s.em}</em>
            </h1>
          </div>
          {/* Slide dots */}
          <div style={{ display:'flex', gap:8, marginTop:32 }}>
            {SLIDES.map((_,i) => (
              <button key={i} onClick={() => setSlide(i)} style={{ width: i===slide ? 24 : 8, height:8, borderRadius:4, border:'none', background: i===slide ? T.gold : 'rgba(255,255,255,.3)', cursor:'pointer', padding:0, transition:`width .3s ${T.ease},background .3s` }} />
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <div style={{ background:T.ivory, borderBottom:`1px solid ${T.line}` }}>
        <div style={{ maxWidth:1200, margin:'0 auto', padding:'0 24px', display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:0 }}>
          {[{v:'40+',l:'Data points / unit'},{v:'88%',l:'AVM confidence'},{v:'29',l:'Compounds mapped'},{v:'97.3%',l:'Match accuracy'}].map((s,i) => (
            <div key={i} style={{ padding:'22px 20px', borderRight:`1px solid ${T.line}`, textAlign:'center' }}>
              <div style={{ fontFamily:F.mono, fontSize:28, fontWeight:800, color:T.gold, fontVariantNumeric:'tabular-nums', lineHeight:1 }}>{s.v}</div>
              <div style={{ fontFamily:F.mono, fontSize:10.5, color:T.mist, textTransform:'uppercase', letterSpacing:'.1em', fontWeight:700, marginTop:7 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Tools grid */}
      <section style={{ padding:'clamp(36px,5vw,56px) 24px 48px' }}>
        <div style={{ maxWidth:1200, margin:'0 auto' }}>
          <div style={{ fontFamily:F.mono, fontSize:11, letterSpacing:'.15em', textTransform:'uppercase', color:T.gold, fontWeight:700, marginBottom:8 }}>THE INTELLIGENCE SUITE</div>
          <h2 style={{ fontFamily:F.display, fontSize:'clamp(22px,3vw,32px)', fontWeight:700, color:T.charcoal, margin:'0 0 28px', letterSpacing:'-.015em' }}>Six engines. One platform.</h2>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:18 }}>
            {AI_TOOLS.map((tool, i) => (
              <Link key={tool.name} href={tool.href} className="tool-card" style={{ background:T.ivory, border:`1px solid ${T.line}`, borderRadius:16, padding:'24px', display:'block', textDecoration:'none', color:'inherit', opacity:visible?1:0, animation:visible?`fadeUp .5s ${T.ease} ${i*60}ms both`:'none' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:16 }}>
                  <div style={{ width:44, height:44, borderRadius:12, background:T.bone, display:'grid', placeItems:'center' }}>
                    <tool.Icon size={20} style={{ color:T.gold }} />
                  </div>
                  <span style={{ fontFamily:F.mono, fontSize:10, fontWeight:800, padding:'4px 9px', borderRadius:7, background: tool.status==='LIVE' ? 'rgba(52,211,153,.12)' : 'rgba(201,162,77,.12)', color: tool.status==='LIVE' ? T.green : T.gold, letterSpacing:'.1em', textTransform:'uppercase', border: `1px solid ${tool.status==='LIVE' ? 'rgba(52,211,153,.3)' : 'rgba(201,162,77,.3)'}` }}>
                    {tool.status}
                  </span>
                </div>
                <h3 style={{ fontFamily:F.body, fontSize:17, fontWeight:800, color:T.charcoal, marginBottom:8 }}>{tool.name}</h3>
                <p style={{ fontSize:13.5, color:T.slate, lineHeight:1.6, margin:0 }}>{tool.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Price chart section */}
      <section style={{ background:`linear-gradient(160deg,#0c2138,#091828)`, padding:'clamp(40px,5vw,64px) 24px' }}>
        <div style={{ maxWidth:1200, margin:'0 auto', display:'grid', gridTemplateColumns:'1fr 1.2fr', gap:36, alignItems:'center' }}>
          <div>
            <div style={{ fontFamily:F.mono, fontSize:11, letterSpacing:'.18em', textTransform:'uppercase', color:T.gold, fontWeight:700, marginBottom:14 }}>AVM PRICE INDEX · NEW CAIRO</div>
            <h2 style={{ fontFamily:F.display, fontSize:'clamp(22px,3vw,34px)', fontWeight:700, color:'#fff', margin:'0 0 16px', letterSpacing:'-.015em', lineHeight:1.1 }}>
              5-year appreciation{' '}<em style={{ fontStyle:'italic', color:T.goldHi }}>validated</em>
            </h2>
            <p style={{ color:'rgba(244,240,232,.65)', fontSize:14.5, lineHeight:1.7, margin:'0 0 24px', maxWidth:420 }}>
              New Cairo premium compound prices have grown from EGP 3.2M (2020) to EGP 16.2M (2025) — a 406% appreciation over 5 years. Sierra's AVM tracks this in real-time.
            </p>
            <div style={{ display:'flex', gap:18, flexWrap:'wrap' }}>
              {[{l:'5yr CAGR',v:'+38.3%'},{l:'Peak compound',v:'Uptown +31%'}].map(({l,v}) => (
                <div key={l}>
                  <div style={{ fontFamily:F.mono, fontSize:22, fontWeight:800, color:T.goldHi, fontVariantNumeric:'tabular-nums' }}>{v}</div>
                  <div style={{ fontFamily:F.mono, fontSize:10.5, color:'rgba(244,240,232,.45)', textTransform:'uppercase', letterSpacing:'.1em', marginTop:4, fontWeight:700 }}>{l}</div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <PriceChart visible={visible} />
          </div>
        </div>
      </section>

      {/* ROI Leaderboard */}
      <section style={{ padding:'clamp(36px,5vw,56px) 24px clamp(60px,8vw,100px)' }}>
        <div style={{ maxWidth:900, margin:'0 auto' }}>
          <div style={{ fontFamily:F.mono, fontSize:11, letterSpacing:'.15em', textTransform:'uppercase', color:T.gold, fontWeight:700, marginBottom:8 }}>COMPOUND ROI LEADERBOARD · Q2 2026</div>
          <h2 style={{ fontFamily:F.display, fontSize:'clamp(20px,3vw,30px)', fontWeight:700, color:T.charcoal, margin:'0 0 24px', letterSpacing:'-.015em' }}>5-year appreciation by compound</h2>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {ROI_DATA.map((c, i) => (
              <div key={c.n} style={{ background:T.ivory, border:`1px solid ${T.line}`, borderRadius:13, padding:'16px 18px', display:'flex', alignItems:'center', gap:14, opacity:visible?1:0, animation:visible?`fadeUp .45s ${T.ease} ${i*50}ms both`:'none' }}>
                <span style={{ width:28, height:28, borderRadius:8, background: i<3 ? `linear-gradient(135deg,${T.gold},${T.goldDeep})` : T.bone, color: i<3 ? T.navy : T.mist, fontFamily:F.mono, fontWeight:800, fontSize:12, display:'grid', placeItems:'center', flexShrink:0 }}>
                  {i+1}
                </span>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontWeight:700, fontSize:14.5, color:T.charcoal, marginBottom:7, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{c.n}</div>
                  <div style={{ height:5, background:T.bone, borderRadius:3, overflow:'hidden' }}>
                    <div style={{ ['--w' as string]:`${c.pct*3}%`, height:'100%', animation:visible?`barFill 1.4s ${T.ease} ${i*55}ms both`:'none', background:`linear-gradient(90deg,${T.gold},${T.goldDeep})` } as React.CSSProperties} />
                  </div>
                </div>
                <div style={{ textAlign:'right', flexShrink:0 }}>
                  <div style={{ fontFamily:F.mono, fontSize:16, fontWeight:800, color:T.gold, fontVariantNumeric:'tabular-nums' }}>+{c.pct}%</div>
                  <div style={{ display:'flex', alignItems:'center', gap:4, justifyContent:'flex-end', marginTop:2 }}>
                    <Check size={11} style={{ color:T.green }} />
                    <span style={{ fontFamily:F.mono, fontSize:10.5, color:T.green, fontWeight:700 }}>AI {c.ai}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
