'use client';
import Link from 'next/link';
import { useState } from 'react';
import { ArrowLeft, ChevronRight, ChevronLeft, CheckCircle2, MapPin, TrendingUp, Home, Users, Clock, DollarSign } from 'lucide-react';

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

const QUESTIONS = [
  {
    id: 1,
    q: 'What is your primary intention?',
    hint: 'This shapes everything — yield potential vs. lifestyle match.',
    opts: [
      { Icon: DollarSign, title: 'Investment & ROI', sub: 'Maximize yield, high-growth compounds', v: 'invest' },
      { Icon: Home,       title: 'Primary Residence', sub: 'Live in comfort, long-term value', v: 'live' },
      { Icon: TrendingUp, title: 'Mixed Strategy', sub: 'Rent now, move later or vice versa', v: 'mixed' },
      { Icon: Users,      title: 'Family Relocation', sub: 'Schools, community, green spaces first', v: 'family' },
    ],
  },
  {
    id: 2,
    q: 'What is your capital range?',
    hint: 'Defines the tier of compounds and unit types available to you.',
    opts: [
      { Icon: DollarSign, title: 'Under EGP 10M',   sub: 'Apartments & Studios — Mivida, Madinaty', v: 'u10' },
      { Icon: DollarSign, title: 'EGP 10M – 25M',   sub: 'Villas & Twin Houses — Palm Hills, Villette', v: '10-25' },
      { Icon: DollarSign, title: 'EGP 25M – 50M',   sub: 'Premium Villas — Hyde Park, Uptown Cairo', v: '25-50' },
      { Icon: DollarSign, title: 'Over EGP 50M',    sub: 'Ultra-Luxury — Taj City, Katameya Heights', v: 'ov50' },
    ],
  },
  {
    id: 3,
    q: 'What is your preferred zone?',
    hint: 'Each zone has distinct infrastructure, community density, and growth curves.',
    opts: [
      { Icon: MapPin, title: '5th Settlement',  sub: 'Hyde Park, Mountain View, Mivida, Villette', v: '5th' },
      { Icon: MapPin, title: 'New Cairo (Other)',sub: 'Taj City, District 5, Uptown Cairo', v: 'nc' },
      { Icon: MapPin, title: 'Madinaty',         sub: 'Self-contained, schools, lakes, quiet', v: 'mdn' },
      { Icon: MapPin, title: 'El Shorouk',       sub: 'Al Burouj, El Patio 5 — emerging ROI', v: 'shk' },
    ],
  },
  {
    id: 4,
    q: 'When are you ready to move?',
    hint: 'Timeline determines whether ready or off-plan units suit you best.',
    opts: [
      { Icon: Clock, title: 'Immediately',    sub: 'Fully finished, ready to handover', v: 'now' },
      { Icon: Clock, title: '6 – 12 months', sub: 'Near-ready, final delivery phase', v: '6m' },
      { Icon: Clock, title: '1 – 3 years',   sub: 'Off-plan for better pricing', v: '3y' },
      { Icon: Clock, title: 'Flexible',       sub: 'Open to any — price is priority', v: 'flex' },
    ],
  },
];

// Result map based on answers
type Answers = Record<number, string>;
function getResult(a: Answers) {
  if (a[1]==='invest' && a[2]==='10-25') return { compound:'Palm Hills New Cairo', ai:9.2, grow:'+21%', yield:'4.4% net', type:'Villa / Twin House' };
  if (a[1]==='invest' && a[2]==='25-50') return { compound:'Hyde Park New Cairo', ai:9.8, grow:'+22%', yield:'5.2% net', type:'Villa' };
  if (a[1]==='family' || a[3]==='mdn')   return { compound:'Madinaty Executive', ai:9.3, grow:'+17%', yield:'4.2% net', type:'Villa' };
  if (a[2]==='u10')                       return { compound:'Mivida Parks', ai:9.0, grow:'+17%', yield:'4.0% net', type:'Apartment' };
  if (a[2]==='ov50')                      return { compound:'Taj City', ai:9.5, grow:'+19%', yield:'5.8% net', type:'Signature Villa' };
  if (a[3]==='shk')                       return { compound:'Al Burouj (Capital Group)', ai:9.2, grow:'+18%', yield:'4.6% net', type:'Townhouse' };
  return { compound:'Mountain View iCity', ai:9.6, grow:'+24%', yield:'4.8% net', type:'Twin House' };
}

export default function AdvicePage() {
  const [step, setStep] = useState(0); // 0 = landing, 1-4 = questions, 5 = result
  const [answers, setAnswers] = useState<Answers>({});
  const [selected, setSelected] = useState<string | null>(null);
  const q = QUESTIONS[step - 1];

  function choose(v: string) { setSelected(v); }
  function next() {
    if (!selected) return;
    const newA = { ...answers, [step]: selected };
    setAnswers(newA);
    setSelected(null);
    if (step === 4) setStep(5);
    else setStep(s => s + 1);
  }
  function back() { setSelected(null); setStep(s => Math.max(0, s - 1)); }

  const result = step === 5 ? getResult(answers) : null;

  return (
    <main style={{ minHeight:'100dvh', background:T.bone, fontFamily:F.body, color:T.charcoal }}>
      <style>{`
        ${LASER_CSS}
        @keyframes fadeUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:none} }
        @keyframes resultIn { from{opacity:0;transform:scale(.94) translateY(20px)} to{opacity:1;transform:none} }
        .opt-btn:hover { border-color:${T.gold} !important; transform:translateY(-2px); box-shadow:0 6px 20px rgba(10,22,40,.1); }
        .opt-btn.on { border-color:${T.gold} !important; background:rgba(201,162,77,.06) !important; }
        .opt-btn { transition:border-color .2s,transform .2s ${T.ease},box-shadow .2s; }
        .cta-gold:hover { transform:translateY(-2px); box-shadow:0 8px 24px rgba(167,124,42,.35) !important; }
        .cta-gold { transition:transform .2s ${T.ease},box-shadow .2s; }
        .btn-back:hover { border-color:${T.charcoal} !important; color:${T.charcoal} !important; }
        .btn-back { transition:border-color .2s,color .2s; }
      `}</style>

      <div style={{ maxWidth:1200, margin:'0 auto', padding:'22px 24px 0' }}>
        <Link href="/clients" style={{ display:'inline-flex', alignItems:'center', gap:8, color:T.gold, fontFamily:F.mono, fontSize:12, fontWeight:700, letterSpacing:'.1em', textTransform:'uppercase', textDecoration:'none' }}>
          <ArrowLeft size={14} /> Back to Portal
        </Link>
      </div>

      {/* Hero */}
      <section style={{ background:`linear-gradient(135deg,#07121e 0%,#0D1F30 60%,#07121e 100%)`, padding:'clamp(48px,7vw,72px) 24px clamp(36px,5vw,52px)', position:'relative', overflow:'hidden' }}>
        <div className="hero-laser" />
        <div style={{ position:'absolute', inset:0, background:`radial-gradient(700px 360px at 70% 10%,rgba(201,162,77,.16),transparent 60%)`, pointerEvents:'none' }} />
        <div style={{ maxWidth:1200, margin:'0 auto', position:'relative', zIndex:2 }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:10, fontFamily:F.mono, fontSize:11, fontWeight:700, letterSpacing:'.2em', textTransform:'uppercase', color:T.gold, marginBottom:18 }}>
            <span style={{ width:28, height:1.5, background:T.gold, display:'inline-block' }} />
            DREAM HOME WIZARD · 4 QUESTIONS
          </div>
          <h1 style={{ color:'#fff', fontFamily:F.display, fontSize:'clamp(28px,4.5vw,44px)', fontWeight:700, letterSpacing:'-.02em', lineHeight:1.05, margin:'0 0 14px', maxWidth:700 }}>
            Your perfect compound,{' '}<em style={{ fontStyle:'italic', color:T.goldHi }}>in 4 answers</em>
          </h1>
          <p style={{ color:'rgba(244,240,232,.78)', maxWidth:540, fontSize:'clamp(14px,1.7vw,15px)', lineHeight:1.6, margin:0 }}>
            Sierra's decision engine maps your intention, capital, zone preference, and timeline to the compound that fits — no broker noise, no fluff.
          </p>
        </div>
      </section>

      {/* Quiz body */}
      <section style={{ padding:'clamp(36px,5vw,56px) 24px clamp(80px,10vw,120px)' }}>
        <div style={{ maxWidth:820, margin:'0 auto' }}>

          {/* Landing state */}
          {step === 0 && (
            <div style={{ textAlign:'center', animation:`fadeUp .5s ${T.ease} both` }}>
              <div style={{ fontFamily:F.mono, fontSize:11, letterSpacing:'.18em', textTransform:'uppercase', color:T.gold, fontWeight:700, marginBottom:18 }}>4 questions · 90 seconds</div>
              <h2 style={{ fontFamily:F.display, fontSize:'clamp(22px,3.5vw,34px)', fontWeight:700, color:T.charcoal, margin:'0 0 16px' }}>Let us match you to the right compound</h2>
              <p style={{ color:T.slate, fontSize:15, lineHeight:1.7, maxWidth:520, margin:'0 auto 36px' }}>No registration required. Sierra's AI decision tree runs purely on the 4 answers below — your result appears instantly.</p>
              <button className="cta-gold" onClick={() => setStep(1)} style={{ display:'inline-flex', alignItems:'center', gap:9, padding:'14px 32px', borderRadius:12, border:'none', background:`linear-gradient(135deg,${T.gold},${T.goldDeep})`, color:T.navy, fontFamily:F.body, fontWeight:800, fontSize:15, cursor:'pointer' }}>
                Start the Wizard <ChevronRight size={18} />
              </button>
            </div>
          )}

          {/* Question state */}
          {step >= 1 && step <= 4 && q && (
            <div key={step} style={{ background:T.ivory, border:`1px solid ${T.line}`, borderRadius:22, padding:'clamp(28px,4vw,44px)', boxShadow:`0 2px 14px rgba(10,22,40,.07)`, position:'relative', overflow:'hidden', animation:`fadeUp .5s ${T.ease} both` }}>
              {/* Progress top bar */}
              <div style={{ position:'absolute', top:0, left:0, right:0, height:3, background:T.bone, borderRadius:'22px 22px 0 0', overflow:'hidden' }}>
                <div style={{ height:'100%', width:`${(step/4)*100}%`, background:`linear-gradient(90deg,${T.gold},${T.goldDeep})`, transition:`width .4s ${T.ease}` }} />
              </div>
              {/* Progress dots */}
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:28 }}>
                <div style={{ display:'flex', gap:5, flex:1 }}>
                  {QUESTIONS.map((_,i) => (
                    <div key={i} style={{ flex:1, height:6, borderRadius:3, background: i < step ? T.gold : i === step-1 ? T.gold : T.bone, transition:'background .3s' }} />
                  ))}
                </div>
                <div style={{ fontFamily:F.mono, fontSize:12, fontWeight:700, letterSpacing:'.1em', textTransform:'uppercase', color:T.mist }}>
                  {step} / 4
                </div>
              </div>

              <h2 style={{ fontFamily:F.display, fontSize:'clamp(20px,3vw,28px)', fontWeight:700, color:T.charcoal, marginBottom:8, letterSpacing:'-.01em', lineHeight:1.2 }}>{q.q}</h2>
              <p style={{ fontSize:14, color:T.slate, marginBottom:26, lineHeight:1.5 }}>{q.hint}</p>

              <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:14, marginBottom:28 }}>
                {q.opts.map(o => (
                  <button key={o.v} className={`opt-btn${selected===o.v?' on':''}`} onClick={() => choose(o.v)}
                    style={{ display:'flex', alignItems:'center', gap:14, padding:'18px 20px', border:`1.5px solid ${T.lineStrong}`, borderRadius:14, background:T.bone, cursor:'pointer', textAlign:'start' }}>
                    <div style={{ width:42, height:42, borderRadius:10, background:T.ivory, display:'grid', placeItems:'center', flexShrink:0 }}>
                      <o.Icon size={20} style={{ color:T.gold }} />
                    </div>
                    <div>
                      <div style={{ fontFamily:F.body, fontWeight:700, fontSize:14.5, color:T.charcoal }}>{o.title}</div>
                      <div style={{ fontSize:12, color:T.mist, marginTop:3, lineHeight:1.4 }}>{o.sub}</div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Nav */}
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', paddingTop:22, borderTop:`1px solid ${T.line}` }}>
                <button className="btn-back" onClick={back} style={{ display:'inline-flex', alignItems:'center', gap:7, padding:'11px 18px', border:`1.5px solid ${T.lineStrong}`, borderRadius:10, background:T.bone, color:T.slate, fontFamily:F.body, fontWeight:700, fontSize:13.5, cursor:'pointer' }}>
                  <ChevronLeft size={16} /> Back
                </button>
                <button onClick={next} disabled={!selected} className="cta-gold" style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'12px 26px', border:'none', borderRadius:10, background:selected ? `linear-gradient(135deg,${T.gold},${T.goldDeep})` : T.line, color: selected ? T.navy : T.mist, fontFamily:F.body, fontWeight:800, fontSize:14, cursor: selected ? 'pointer' : 'not-allowed' }}>
                  {step === 4 ? 'See My Match' : 'Next'} <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Result state */}
          {step === 5 && result && (
            <div style={{ textAlign:'center', animation:`resultIn .8s ${T.ease} both` }}>
              <div style={{ display:'inline-flex', alignItems:'center', gap:8, fontFamily:F.mono, fontSize:11, fontWeight:700, letterSpacing:'.22em', textTransform:'uppercase', color:T.gold, marginBottom:18 }}>
                <span style={{ width:24, height:1.5, background:T.gold, display:'inline-block' }} />
                YOUR MATCH IS READY
                <span style={{ width:24, height:1.5, background:T.gold, display:'inline-block' }} />
              </div>
              <h2 style={{ fontFamily:F.display, fontSize:'clamp(26px,4vw,42px)', fontWeight:700, color:T.charcoal, letterSpacing:'-.015em', margin:'0 0 12px' }}>
                <em style={{ fontStyle:'italic', color:T.gold }}>{result.compound}</em>
              </h2>
              <p style={{ fontSize:15, color:T.slate, maxWidth:480, margin:'0 auto 32px', lineHeight:1.6 }}>
                Based on your priorities, Sierra's engine recommends this compound for maximum alignment with your intent, capital, and timeline.
              </p>

              <div style={{ display:'inline-grid', gridTemplateColumns:'repeat(3,1fr)', gap:14, marginBottom:36, maxWidth:540 }}>
                {[{l:'AI Score',v:`${result.ai}/10`},{l:'5yr Growth',v:result.grow},{l:'Net Yield',v:result.yield}].map(({l,v}) => (
                  <div key={l} style={{ background:T.ivory, border:`1px solid ${T.line}`, borderRadius:14, padding:'18px 12px' }}>
                    <div style={{ fontFamily:F.mono, fontWeight:800, fontSize:22, color:T.gold, fontVariantNumeric:'tabular-nums' }}>{v}</div>
                    <div style={{ fontFamily:F.mono, fontSize:10.5, color:T.mist, marginTop:6, textTransform:'uppercase', letterSpacing:'.1em', fontWeight:700 }}>{l}</div>
                  </div>
                ))}
              </div>

              <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap' }}>
                <Link href="/matches" className="cta-gold" style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'13px 28px', borderRadius:11, background:`linear-gradient(135deg,${T.gold},${T.goldDeep})`, color:T.navy, fontFamily:F.body, fontWeight:800, fontSize:14, textDecoration:'none' }}>
                  <CheckCircle2 size={16} /> Browse {result.compound.split(' ')[0]} Units
                </Link>
                <button className="btn-back" onClick={() => { setStep(0); setAnswers({}); setSelected(null); }} style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'13px 24px', border:`1.5px solid ${T.lineStrong}`, borderRadius:11, background:T.ivory, color:T.slate, fontFamily:F.body, fontWeight:700, fontSize:14, cursor:'pointer' }}>
                  Restart Wizard
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
