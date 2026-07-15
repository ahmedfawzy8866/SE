'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { ArrowLeft, TrendingUp, Trophy, Calculator } from 'lucide-react';

const T = { navy:'#0A1628', bone:'#F4F0E8', ivory:'#FDFCF9', charcoal:'#1A2535', slate:'#4B5A6A', mist:'#8C9BAB', line:'rgba(26,37,53,0.1)', lineStrong:'rgba(26,37,53,0.15)', gold:'#C9A24D', goldHi:'#E9C176', goldDeep:'#A87C2A', ease:'cubic-bezier(0.22,1,0.36,1)' } as const;
const F = { display:'"Playfair Display","Instrument Serif",serif', body:'"Plus Jakarta Sans","Cairo",sans-serif', mono:'"JetBrains Mono","Geist Mono",monospace' } as const;

const ROI_COMPOUNDS = [
  { n:'Hyde Park New Cairo',   grow:22, net:5.2, ai:9.8, rank:1 },
  { n:'Mountain View iCity',  grow:24, net:4.8, ai:9.6, rank:2 },
  { n:'Villette (SODIC)',      grow:20, net:4.5, ai:9.3, rank:3 },
  { n:'Uptown Cairo',         grow:31, net:6.1, ai:9.5, rank:4 },
  { n:'Taj City',             grow:19, net:5.8, ai:9.5, rank:5 },
  { n:'Palm Hills New Cairo', grow:21, net:4.4, ai:9.2, rank:6 },
  { n:'Mivida',               grow:18, net:4.2, ai:9.1, rank:7 },
  { n:'Eastown (SODIC)',      grow:19, net:4.0, ai:9.0, rank:8 },
  { n:'Katameya Heights',     grow:10, net:3.8, ai:9.0, rank:9 },
  { n:'Al Burouj (Capital)',  grow:18, net:4.6, ai:9.2, rank:10 },
];

export default function ROIPage() {
  const [capital, setCapital] = useState(10);
  const [years, setYears] = useState(5);
  const [rateIdx, setRateIdx] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const RATES = [ROI_COMPOUNDS[0], ROI_COMPOUNDS[3], ROI_COMPOUNDS[2]];
  const selected = RATES[rateIdx];
  const appreciation = capital * 1_000_000 * Math.pow(1 + selected.grow / 100, years);
  const rental = capital * 1_000_000 * selected.net / 100 * years;
  const total = appreciation + rental - capital * 1_000_000;

  return (
    <main style={{ minHeight:'100dvh', background:T.bone, fontFamily:F.body, color:T.charcoal }}>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:none} }
        @keyframes barIn { from{width:0} to{width:var(--w)} }
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
        .roi-row:hover { border-color:rgba(201,162,77,.45) !important; background:rgba(253,252,249,.9) !important; }
        .roi-row { transition: border-color .2s, background .2s; }
        .cta-gold:hover { transform:translateY(-2px); box-shadow:0 8px 24px rgba(167,124,42,.35) !important; }
        .cta-gold { transition: transform .2s ${T.ease}, box-shadow .2s; }
        .rate-btn { transition: background .18s, color .18s, border-color .18s; }
        .rate-btn.on { background: ${T.gold} !important; color: ${T.navy} !important; border-color: ${T.gold} !important; }
      `}</style>

      <div style={{ maxWidth:1200, margin:'0 auto', padding:'22px 24px 0' }}>
        <Link href="/clients#se-tools" style={{ display:'inline-flex', alignItems:'center', gap:8, color:T.gold, fontFamily:F.mono, fontSize:12, fontWeight:700, letterSpacing:'.1em', textTransform:'uppercase', textDecoration:'none' }}>
          <ArrowLeft size={14} /> Back to Portal
        </Link>
      </div>

      {/* Hero */}
      <section style={{ background:`linear-gradient(135deg,#07121e 0%,#0D1F30 60%,#07121e 100%)`, padding:'clamp(48px,7vw,72px) 24px clamp(40px,6vw,60px)', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', inset:0, background:`radial-gradient(700px 360px at 20% 10%,rgba(201,162,77,.16),transparent 60%)`, pointerEvents:'none' }} />
        <div className="hero-laser" />
        <div style={{ maxWidth:1200, margin:'0 auto', position:'relative', zIndex:2 }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:10, fontFamily:F.mono, fontSize:11, fontWeight:700, letterSpacing:'.2em', textTransform:'uppercase', color:T.gold, marginBottom:18 }}>
            <span style={{ width:28, height:1.5, background:T.gold, display:'inline-block', flexShrink:0 }} />
            ROI FORECASTER · 5-YEAR MODEL
          </div>
          <h1 style={{ color:'#fff', fontFamily:F.display, fontSize:'clamp(30px,5vw,46px)', fontWeight:700, letterSpacing:'-.02em', lineHeight:1.05, margin:'0 0 16px', maxWidth:720 }}>
            Compound Returns{' '}<em style={{ fontStyle:'italic', color:T.goldHi }}>— yield-aware, data-driven</em>
          </h1>
          <p style={{ color:'rgba(244,240,232,.78)', maxWidth:560, fontSize:'clamp(14px,1.8vw,15.5px)', lineHeight:1.6, margin:0 }}>
            Uptown Cairo +31% · Mountain View +24% · Hyde Park +22%. Sierra's 5-year model projects appreciation and rental yield per compound.
          </p>
          <div style={{ display:'flex', gap:10, flexWrap:'wrap', marginTop:24 }}>
            {[{Icon:TrendingUp,l:'5-yr appreciation'},{Icon:Trophy,l:'Top ROI compounds'},{Icon:Calculator,l:'Live yield calc'}].map(({Icon,l}) => (
              <span key={l} style={{ display:'inline-flex', alignItems:'center', gap:8, background:'rgba(255,255,255,.07)', border:'1px solid rgba(255,255,255,.13)', backdropFilter:'blur(8px)', padding:'9px 16px', borderRadius:999, color:'#fff', fontFamily:F.mono, fontSize:11, fontWeight:700, letterSpacing:'.12em', textTransform:'uppercase' }}>
                <Icon size={13} style={{ color:T.gold }} /> {l}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Body */}
      <section style={{ padding:'clamp(36px,5vw,56px) 24px clamp(60px,8vw,100px)' }}>
        <div style={{ maxWidth:1200, margin:'0 auto' }}>
          <div style={{ display:'grid', gridTemplateColumns:'1.3fr 1fr', gap:28, alignItems:'start' }}>

            {/* Leaderboard */}
            <div style={{ animation: mounted ? `fadeUp .5s ${T.ease} both` : 'none' }}>
              <div style={{ fontFamily:F.mono, fontSize:11, letterSpacing:'.15em', textTransform:'uppercase', color:T.gold, fontWeight:700, marginBottom:20 }}>
                Compound ROI Leaderboard · Q2 2026
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                {ROI_COMPOUNDS.map((c, i) => (
                  <div key={c.n} className="roi-row" style={{ background:T.ivory, border:`1px solid ${T.line}`, borderRadius:13, padding:'16px 18px', display:'flex', alignItems:'center', gap:14 }}>
                    <span style={{ width:28, height:28, borderRadius:8, background: i < 3 ? `linear-gradient(135deg,${T.gold},${T.goldDeep})` : T.bone, color: i < 3 ? T.navy : T.mist, fontFamily:F.mono, fontWeight:800, fontSize:12, display:'grid', placeItems:'center', flexShrink:0 }}>
                      {c.rank}
                    </span>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontFamily:F.body, fontWeight:700, fontSize:14.5, color:T.charcoal, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{c.n}</div>
                      <div style={{ marginTop:7, height:5, background:T.bone, borderRadius:3, overflow:'hidden' }}>
                        <div style={{ height:'100%', background:`linear-gradient(90deg,${T.gold},${T.goldDeep})`, animation: mounted ? `barIn 1.4s ${T.ease} ${i*60}ms both` : 'none', ['--w' as string]:`${c.grow * 3}%` } as React.CSSProperties} />
                      </div>
                    </div>
                    <div style={{ textAlign:'right', flexShrink:0 }}>
                      <div style={{ fontFamily:F.mono, fontSize:15, fontWeight:800, color:T.gold, fontVariantNumeric:'tabular-nums' }}>+{c.grow}%</div>
                      <div style={{ fontFamily:F.mono, fontSize:11, color:T.mist, marginTop:1 }}>{c.net}% net</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Calculator */}
            <div style={{ position:'sticky', top:90, animation: mounted ? `fadeUp .5s ${T.ease} .1s both` : 'none' }}>
              <div style={{ background:T.ivory, border:`1px solid ${T.line}`, borderRadius:18, padding:'28px 24px', boxShadow:`0 2px 12px rgba(10,22,40,.07)`, marginBottom:20 }}>
                <div style={{ fontFamily:F.mono, fontSize:11, letterSpacing:'.12em', textTransform:'uppercase', color:T.gold, fontWeight:700, marginBottom:18 }}>
                  Yield Calculator
                </div>

                <CField label="Compound scenario">
                  <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                    {RATES.map((r,i) => (
                      <button key={r.n} className={`rate-btn${rateIdx===i?' on':''}`} onClick={() => setRateIdx(i)}
                        style={{ flex:1, minWidth:80, padding:'10px 8px', border:`1.5px solid ${T.lineStrong}`, borderRadius:9, background:T.bone, cursor:'pointer', fontFamily:F.body, fontSize:12, fontWeight:700, color:T.slate, textAlign:'center' }}>
                        {r.n.split(' ')[0] + ' ' + r.n.split(' ')[1]}
                        <div style={{ fontFamily:F.mono, fontSize:10, color:T.mist, marginTop:2, fontWeight:400 }}>+{r.grow}% growth</div>
                      </button>
                    ))}
                  </div>
                </CField>

                <CField label={`Capital (EGP M) — ${capital}M`}>
                  <input type="range" min={1} max={100} value={capital} onChange={e => setCapital(+e.target.value)}
                    style={{ width:'100%', accentColor:T.gold }} />
                  <div style={{ display:'flex', justifyContent:'space-between', fontFamily:F.mono, fontSize:11, color:T.mist, marginTop:4 }}>
                    <span>EGP 1M</span><span>EGP 100M</span>
                  </div>
                </CField>

                <CField label={`Horizon — ${years} years`} last>
                  <input type="range" min={1} max={10} value={years} onChange={e => setYears(+e.target.value)}
                    style={{ width:'100%', accentColor:T.gold }} />
                  <div style={{ display:'flex', justifyContent:'space-between', fontFamily:F.mono, fontSize:11, color:T.mist, marginTop:4 }}>
                    <span>1 yr</span><span>10 yr</span>
                  </div>
                </CField>
              </div>

              {/* Result */}
              <div style={{ background:`linear-gradient(160deg,#0c2138 0%,#091828 100%)`, borderRadius:18, padding:'26px 24px', color:'#fff' }}>
                <div style={{ fontFamily:F.mono, fontSize:10.5, letterSpacing:'.2em', textTransform:'uppercase', color:T.gold, fontWeight:700 }}>Projected Total Return</div>
                <div style={{ fontFamily:F.display, fontSize:'clamp(28px,4vw,42px)', fontWeight:700, color:T.goldHi, margin:'10px 0 4px', letterSpacing:'-.015em', fontVariantNumeric:'tabular-nums' }}>
                  EGP {(total/1_000_000).toFixed(1)}M
                </div>
                <div style={{ fontSize:13, color:'rgba(244,240,232,.55)', fontFamily:F.mono }}>Net gain after {years}yr at +{selected.grow}% / yr</div>
                <div style={{ marginTop:20, paddingTop:16, borderTop:'1px solid rgba(255,255,255,.1)' }}>
                  {[
                    ['Capital invested', `EGP ${capital}M`],
                    ['End property value', `EGP ${(appreciation/1_000_000).toFixed(1)}M`],
                    ['Rental income', `EGP ${(rental/1_000_000).toFixed(1)}M`],
                  ].map(([k,v]) => (
                    <div key={k} style={{ display:'flex', justifyContent:'space-between', padding:'7px 0', fontSize:13 }}>
                      <span style={{ color:'rgba(244,240,232,.62)' }}>{k}</span>
                      <span style={{ fontFamily:F.mono, fontWeight:700, fontVariantNumeric:'tabular-nums' }}>{v}</span>
                    </div>
                  ))}
                </div>
                <Link href="/matches" className="cta-gold" style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, marginTop:20, padding:'12px 20px', border:'none', borderRadius:10, background:`linear-gradient(135deg,${T.gold},${T.goldDeep})`, color:T.navy, fontFamily:F.body, fontWeight:800, fontSize:13.5, textDecoration:'none' }}>
                  <TrendingUp size={14} /> Find High-Yield Units
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function CField({ label, children, last }: { label: string; children: React.ReactNode; last?: boolean }) {
  return (
    <div style={{ marginBottom: last ? 0 : 20 }}>
      <label style={{ display:'block', fontFamily:'"JetBrains Mono","Geist Mono",monospace', fontSize:11, letterSpacing:'.1em', textTransform:'uppercase', color:'#8C9BAB', marginBottom:10, fontWeight:700 }}>{label}</label>
      {children}
    </div>
  );
}
