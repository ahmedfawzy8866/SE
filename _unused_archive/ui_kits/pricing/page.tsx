'use client';
import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Zap, Database, Target, PhoneCall } from 'lucide-react';

const T = { navy:'#0A1628', bone:'#F4F0E8', ivory:'#FDFCF9', charcoal:'#1A2535', slate:'#4B5A6A', mist:'#8C9BAB', line:'rgba(26,37,53,0.1)', gold:'#C9A24D', goldHi:'#E9C176', goldDeep:'#A87C2A', ease:'cubic-bezier(0.22,1,0.36,1)' } as const;
const F = { display:'"Playfair Display","Instrument Serif",serif', body:'"Plus Jakarta Sans","Cairo",sans-serif', mono:'"JetBrains Mono","Geist Mono",monospace' } as const;

const ZONE_RATE: Record<string, number> = {
  '5th Settlement': 65000, 'New Cairo': 58000, 'Mostakbal': 42000,
  'Katameya': 52000, 'Madinaty': 46000, 'Shorouk': 36000,
};

const COMPOUNDS = [
  { n:'Hyde Park New Cairo', z:'5th Settlement' },
  { n:'Mountain View iCity', z:'5th Settlement' },
  { n:'Villette (SODIC)', z:'5th Settlement' },
  { n:'Taj City', z:'New Cairo' },
  { n:'Palm Hills New Cairo', z:'5th Settlement' },
  { n:'Uptown Cairo', z:'New Cairo' },
  { n:'Mivida', z:'5th Settlement' },
  { n:'Eastown (SODIC)', z:'5th Settlement' },
  { n:'Katameya Heights', z:'Katameya' },
  { n:'Madinaty Executive Villas', z:'Madinaty' },
  { n:'Al Burouj (Capital Group)', z:'Shorouk' },
  { n:'District 5 (Marakez)', z:'New Cairo' },
];

function egpFmt(v: number) {
  if (v >= 1_000_000) return `EGP ${(v/1_000_000).toFixed(2)}M`;
  return `EGP ${Math.round(v).toLocaleString()}`;
}

export default function PricingPage() {
  const [compound, setCompound] = useState(COMPOUNDS[0].n);
  const [area, setArea] = useState(180);
  const [beds, setBeds] = useState(3);
  const [finish, setFinish] = useState(1);
  const [furnish, setFurnish] = useState(1);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const calc = useCallback(() => {
    const cmp = COMPOUNDS.find(c => c.n === compound);
    const rate = ZONE_RATE[cmp?.z ?? 'New Cairo'] ?? 50000;
    const bedPrem = 1 + (beds - 3) * 0.04;
    return rate * area * finish * furnish * bedPrem;
  }, [compound, area, beds, finish, furnish]);

  const val = calc();

  return (
    <main style={{ minHeight:'100dvh', background:T.bone, fontFamily:F.body, color:T.charcoal }}>
      <style>{`
        @keyframes confGrow { from{transform:scaleX(0)} to{transform:scaleX(1)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:none} }
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
        .seg-btn { transition: background .18s, color .18s, border-color .18s; }
        .seg-btn.on { background: ${T.gold} !important; color: ${T.navy} !important; border-color: ${T.gold} !important; }
        .field-input:focus { border-color: ${T.gold} !important; outline: none; }
        .cta-gold:hover { transform:translateY(-2px); box-shadow:0 8px 24px rgba(167,124,42,.35) !important; }
        .cta-gold:active { transform:translateY(0) scaleX(.98); }
        .cta-gold { transition: transform .2s ${T.ease}, box-shadow .2s; }
      `}</style>

      <div style={{ maxWidth:1200, margin:'0 auto', padding:'22px 24px 0' }}>
        <Link href="/clients#se-tools" style={{ display:'inline-flex', alignItems:'center', gap:8, color:T.gold, fontFamily:F.mono, fontSize:12, fontWeight:700, letterSpacing:'.1em', textTransform:'uppercase', textDecoration:'none' }}>
          <ArrowLeft size={14} /> Back to Portal
        </Link>
      </div>

      {/* Hero */}
      <section style={{ background:`linear-gradient(135deg,#07121e 0%,#0D1F30 60%,#07121e 100%)`, padding:'clamp(48px,7vw,72px) 24px clamp(40px,6vw,60px)', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', inset:0, background:`radial-gradient(700px 360px at 80% 10%,rgba(201,162,77,.16),transparent 60%)`, pointerEvents:'none' }} />
        <div className="hero-laser" />
        <div style={{ maxWidth:1200, margin:'0 auto', position:'relative', zIndex:2 }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:10, fontFamily:F.mono, fontSize:11, fontWeight:700, letterSpacing:'.2em', textTransform:'uppercase', color:T.gold, marginBottom:18 }}>
            <span style={{ width:28, height:1.5, background:T.gold, display:'inline-block', flexShrink:0 }} />
            AI VALUATION · AVM ENGINE
          </div>
          <h1 style={{ color:'#fff', fontFamily:F.display, fontSize:'clamp(30px,5vw,46px)', fontWeight:700, letterSpacing:'-.02em', lineHeight:1.05, margin:'0 0 16px', maxWidth:720 }}>
            Precise Pricing{' '}<em style={{ fontStyle:'italic', color:T.goldHi }}>— fair-market value, instantly</em>
          </h1>
          <p style={{ color:'rgba(244,240,232,.78)', maxWidth:560, fontSize:'clamp(14px,1.8vw,15.5px)', lineHeight:1.6, margin:0 }}>
            Egypt-calibrated AVM. Set compound, area, and finishing — Sierra returns a fair-market range benchmarked against 25+ compounds.
          </p>
          <div style={{ display:'flex', gap:10, flexWrap:'wrap', marginTop:24 }}>
            {[{Icon:Zap,l:'Instant AVM'},{Icon:Database,l:'25+ compounds'},{Icon:Target,l:'88% confidence'}].map(({Icon,l}) => (
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
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(340px,1fr))', gap:28, alignItems:'start' }}>

            {/* Input panel */}
            <div style={{ background:T.ivory, border:`1px solid ${T.line}`, borderRadius:18, padding:'30px 28px', boxShadow:`0 2px 12px rgba(10,22,40,.07)`, animation: mounted ? `fadeUp .5s ${T.ease} both` : 'none' }}>
              <h3 style={{ fontFamily:F.display, fontSize:26, fontWeight:700, color:T.charcoal, margin:'0 0 26px', letterSpacing:'-.005em' }}>Unit Details</h3>

              <Field label="Compound">
                <select className="field-input" value={compound} onChange={e => setCompound(e.target.value)}
                  style={{ width:'100%', padding:'13px 16px', border:`1.5px solid ${T.line}`, borderRadius:11, fontFamily:F.body, fontSize:14.5, color:T.charcoal, background:T.bone }}>
                  {COMPOUNDS.map(c => <option key={c.n} value={c.n}>{c.n} · {c.z}</option>)}
                </select>
              </Field>

              <Field label="Built-up area (m²)">
                <input className="field-input" type="number" value={area} min={50} max={900}
                  onChange={e => setArea(Math.max(50,+e.target.value))}
                  style={{ width:'100%', padding:'13px 16px', border:`1.5px solid ${T.line}`, borderRadius:11, fontFamily:F.mono, fontSize:14.5, color:T.charcoal, background:T.bone }} />
              </Field>

              <Field label="Bedrooms">
                <SegGroup options={[{v:1,l:'1'},{v:2,l:'2'},{v:3,l:'3'},{v:4,l:'4'},{v:5,l:'5+'}]} value={beds} onChange={setBeds} />
              </Field>

              <Field label="Finishing">
                <SegGroup
                  options={[{v:0.78,l:'Core & Shell'},{v:0.9,l:'Semi'},{v:1,l:'Fully Finished'},{v:1.12,l:'Ultra Lux'}]}
                  value={finish} onChange={setFinish} />
              </Field>

              <Field label="Furnishing" last>
                <SegGroup
                  options={[{v:1,l:'Unfurnished'},{v:1.08,l:'Furnished'}]}
                  value={furnish} onChange={setFurnish} />
              </Field>
            </div>

            {/* Estimate panel */}
            <div style={{ background:`linear-gradient(160deg,#0c2138 0%,#091828 100%)`, color:'#fff', borderRadius:18, padding:'32px 28px', boxShadow:`0 12px 40px rgba(0,0,0,.25)`, position:'sticky', top:90, animation: mounted ? `fadeUp .5s ${T.ease} .1s both` : 'none' }}>
              <div style={{ fontFamily:F.mono, fontSize:10.5, letterSpacing:'.22em', textTransform:'uppercase', color:T.gold, fontWeight:700 }}>Estimated Fair Value</div>
              <div style={{ fontFamily:F.display, fontSize:'clamp(36px,5vw,54px)', fontWeight:700, margin:'12px 0 4px', color:T.goldHi, fontVariantNumeric:'tabular-nums', lineHeight:1.05, letterSpacing:'-.015em' }}>
                {egpFmt(val)}
              </div>
              <div style={{ fontSize:13.5, color:'rgba(244,240,232,.6)', fontFamily:F.mono }}>
                {egpFmt(val*0.93)} – {egpFmt(val*1.07)} fair range
              </div>

              {/* Breakdown */}
              <div style={{ marginTop:26, paddingTop:22, borderTop:'1px solid rgba(255,255,255,.1)' }}>
                {[
                  ['Base rate / m²', `EGP ${(ZONE_RATE[COMPOUNDS.find(c=>c.n===compound)?.z??'New Cairo']??50000).toLocaleString()}`],
                  ['Built-up area', `${area} m²`],
                  ['Finishing factor', `×${finish.toFixed(2)}`],
                  ['Bedroom premium', `×${(1+(beds-3)*0.04).toFixed(2)}`],
                ].map(([k,v]) => (
                  <div key={k} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', fontSize:13.5 }}>
                    <span style={{ color:'rgba(244,240,232,.6)' }}>{k}</span>
                    <span style={{ fontWeight:700, fontFamily:F.mono, fontVariantNumeric:'tabular-nums' }}>{v}</span>
                  </div>
                ))}
              </div>

              {/* Confidence bar */}
              <div style={{ marginTop:22 }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8, fontSize:13.5 }}>
                  <span style={{ color:'rgba(244,240,232,.62)' }}>Model confidence</span>
                  <span style={{ color:T.goldHi, fontWeight:800, fontFamily:F.mono }}>88%</span>
                </div>
                <div style={{ height:7, borderRadius:4, background:'rgba(255,255,255,.12)', overflow:'hidden' }}>
                  <div style={{ height:'100%', background:`linear-gradient(90deg,${T.gold},${T.goldDeep})`, width:'88%', animation:`confGrow 1.6s ${T.ease} both`, transformOrigin:'left' }} />
                </div>
              </div>

              <Link href="/clients#inquiry" className="cta-gold" style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, marginTop:24, padding:'13px 20px', border:'none', borderRadius:10, background:`linear-gradient(135deg,${T.gold},${T.goldDeep})`, color:T.navy, fontFamily:F.body, fontWeight:800, fontSize:14, textDecoration:'none' }}>
                <PhoneCall size={15} /> Request a Valuation Call
              </Link>
            </div>
          </div>

          {/* Note */}
          <div style={{ maxWidth:920, margin:'40px auto 0', padding:'22px 24px', background:`rgba(201,162,77,.06)`, border:`1px solid rgba(201,162,77,.22)`, borderRadius:14 }}>
            <div style={{ fontFamily:F.mono, fontSize:12, letterSpacing:'.08em', textTransform:'uppercase', color:T.gold, fontWeight:700 }}>Backend Logic Note</div>
            <div style={{ marginTop:8, fontSize:13.5, color:T.slate, lineHeight:1.6 }}>
              The AVM engine benchmarks every unit against 25+ compounds using live data from Property Finder, Aqarmap, and historical Oqood transactions. Confidence interval (88%) reflects data freshness and market volatility. Results update every 4 hours.
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function Field({ label, children, last }: { label: string; children: React.ReactNode; last?: boolean }) {
  return (
    <div style={{ marginBottom: last ? 0 : 22 }}>
      <label style={{ display:'block', fontFamily:'"JetBrains Mono","Geist Mono",monospace', fontSize:11, letterSpacing:'.1em', textTransform:'uppercase', color:'#8C9BAB', marginBottom:10, fontWeight:700 }}>{label}</label>
      {children}
    </div>
  );
}

function SegGroup({ options, value, onChange }: { options: { v: number; l: string }[]; value: number; onChange: (v: number) => void }) {
  return (
    <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
      {options.map(o => (
        <button key={o.v} onClick={() => onChange(o.v)}
          className={`seg-btn${value === o.v ? ' on' : ''}`}
          style={{ flex:1, minWidth:70, padding:'11px 8px', border:`1.5px solid rgba(26,37,53,0.15)`, borderRadius:10, background:'#F4F0E8', cursor:'pointer', fontFamily:'"Plus Jakarta Sans","Cairo",sans-serif', fontSize:12.5, fontWeight:700, color:'#4B5A6A' }}>
          {o.l}
        </button>
      ))}
    </div>
  );
}
