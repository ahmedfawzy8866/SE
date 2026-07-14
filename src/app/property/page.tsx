'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { ArrowLeft, BedDouble, Bath, Maximize, Building2, MapPin, PhoneCall, MessageSquare, Star, Zap } from 'lucide-react';

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

// Demo property (would be fetched by ?id in production)
const PROPERTY = {
  id: 1, code: 'HP-VL-01', compound: 'Hyde Park New Cairo', zone: '5th Settlement',
  type: 'Villa', beds: 5, bath: 5, area: 480, egpM: 28.5, ai: 9.8, tag: 'Premium',
  growth: '+22%', rentYield: '5.2%',
  description: `A masterfully crafted standalone villa within Hyde Park's Phase 2. Featuring a private garden, rooftop terrace, and a double-height living pavilion. Delivered fully finished with premium Italian marble and SIEMENS appliances.`,
  features: [
    'Private garden & rooftop terrace','Italian marble throughout','SIEMENS appliances package',
    'Smart home automation','Double-height living pavilion','Covered parking × 3',
    'Close to international schools','Community clubhouse access','24/7 security',
  ],
  imgs: [
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=900&q=80',
    'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=900&q=80',
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=900&q=80',
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=900&q=80',
    'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=900&q=80',
  ],
  agent: { name: 'Layla Mansour', role: 'Senior Property Advisor', img: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=300&q=80', phone: '+20 100 123 4567', wa: '+201001234567' },
};

export default function PropertyPage() {
  const [imgIdx, setImgIdx] = useState(0);
  const [visible, setVisible] = useState(false);
  useEffect(() => { const id = requestAnimationFrame(() => setVisible(true)); return () => cancelAnimationFrame(id); }, []);

  const p = PROPERTY;

  return (
    <main style={{ minHeight:'100dvh', background:T.bone, fontFamily:F.body, color:T.charcoal }}>
      <style>{`
        ${LASER_CSS}
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:none} }
        @keyframes barGrow { from{transform:scaleX(0)} to{transform:scaleX(1)} }
        .thumb-btn:hover { border-color:${T.gold} !important; }
        .thumb-btn { transition:border-color .2s; }
        .feat-row { display:inline-flex; align-items:center; gap:9px; font-size:13.5px; color:${T.slate}; }
        .cta-gold:hover { transform:translateY(-2px); box-shadow:0 8px 24px rgba(167,124,42,.35) !important; }
        .cta-ghost:hover { border-color:${T.charcoal} !important; color:${T.charcoal} !important; }
        .cta-gold,.cta-ghost { transition:transform .2s ${T.ease},box-shadow .2s,border-color .2s,color .2s; }
      `}</style>

      {/* Breadcrumb */}
      <div style={{ maxWidth:1200, margin:'0 auto', padding:'22px 24px 0', display:'flex', alignItems:'center', gap:10 }}>
        <Link href="/properties" style={{ display:'inline-flex', alignItems:'center', gap:8, color:T.gold, fontFamily:F.mono, fontSize:12, fontWeight:700, letterSpacing:'.1em', textTransform:'uppercase', textDecoration:'none' }}>
          <ArrowLeft size={14} /> Properties
        </Link>
        <span style={{ color:T.line, fontSize:14 }}>/</span>
        <span style={{ fontFamily:F.mono, fontSize:11, color:T.mist, letterSpacing:'.1em', textTransform:'uppercase', fontWeight:700 }}>{p.code}</span>
      </div>

      {/* Gallery hero */}
      <section style={{ position:'relative', maxWidth:1200, margin:'20px auto 0', padding:'0 24px', overflow:'hidden' }}>
        <div className="hero-laser" style={{ zIndex:3 }} />
        <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gridTemplateRows:'240px 240px', gap:10, borderRadius:20, overflow:'hidden' }}>
          {/* Main img */}
          <div style={{ gridRow:'1/3', position:'relative', overflow:'hidden', cursor:'pointer', background:'#e8edf2' }} onClick={() => setImgIdx(0)}>
            <img src={p.imgs[imgIdx]} alt={p.compound} style={{ width:'100%', height:'100%', objectFit:'cover', transition:`transform .6s ${T.ease}` }} />
            <div style={{ position:'absolute', inset:0, background:'linear-gradient(180deg,transparent 65%,rgba(7,18,30,.5) 100%)' }} />
            <span style={{ position:'absolute', bottom:16, left:16, fontFamily:F.mono, fontSize:11, fontWeight:800, color:T.goldHi, background:'rgba(9,24,40,.88)', backdropFilter:'blur(8px)', padding:'6px 12px', borderRadius:8, letterSpacing:'.08em', textTransform:'uppercase' }}>
              {p.tag}
            </span>
          </div>
          {/* Thumbnails */}
          {p.imgs.slice(1,4).map((src,i) => (
            <div key={i} className="thumb-btn" onClick={() => setImgIdx(i+1)} style={{ position:'relative', overflow:'hidden', cursor:'pointer', border:`2px solid ${imgIdx===i+1 ? T.gold : 'transparent'}`, background:'#e8edf2' }}>
              <img src={src} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
              {i===2 && p.imgs.length>4 && (
                <div style={{ position:'absolute', inset:0, background:'rgba(7,18,30,.55)', display:'grid', placeItems:'center', color:'#fff', fontFamily:F.mono, fontSize:14, fontWeight:800 }}>+{p.imgs.length-4} more</div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Body */}
      <section style={{ padding:'clamp(28px,4vw,44px) 24px clamp(60px,8vw,100px)' }}>
        <div style={{ maxWidth:1200, margin:'0 auto', display:'grid', gridTemplateColumns:'1fr 340px', gap:32, alignItems:'start' }}>

          {/* Left */}
          <div style={{ opacity:visible?1:0, animation:visible?`fadeUp .5s ${T.ease} both`:'none' }}>
            {/* Header */}
            <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', gap:20, flexWrap:'wrap', marginBottom:28 }}>
              <div>
                <div style={{ fontFamily:F.mono, fontSize:12, letterSpacing:'.16em', textTransform:'uppercase', color:T.gold, fontWeight:700, marginBottom:6 }}>{p.type} · {p.code}</div>
                <h1 style={{ fontFamily:F.display, fontSize:'clamp(24px,3.5vw,36px)', fontWeight:700, color:T.charcoal, letterSpacing:'-.02em', lineHeight:1.1, margin:0 }}>{p.compound}</h1>
                <div style={{ display:'flex', alignItems:'center', gap:6, marginTop:8, fontSize:14, color:T.slate }}>
                  <MapPin size={14} style={{ color:T.mist }} /> {p.zone}
                </div>
              </div>
              <div style={{ textAlign:'right' }}>
                <div style={{ fontFamily:F.mono, fontSize:28, fontWeight:800, color:T.charcoal, fontVariantNumeric:'tabular-nums' }}>EGP {p.egpM}M</div>
                <div style={{ fontFamily:F.mono, fontSize:11, color:T.mist, marginTop:4, letterSpacing:'.08em', textTransform:'uppercase' }}>Asking price</div>
              </div>
            </div>

            {/* Specs */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:28 }}>
              {[{Icon:Building2,v:p.type,l:'Type'},{Icon:BedDouble,v:`${p.beds} bed`,l:'Bedrooms'},{Icon:Bath,v:`${p.bath} bath`,l:'Bathrooms'},{Icon:Maximize,v:`${p.area} m²`,l:'Area'}].map(({Icon,v,l}) => (
                <div key={l} style={{ background:T.ivory, border:`1px solid ${T.line}`, borderRadius:12, padding:'16px 14px', textAlign:'center' }}>
                  <Icon size={18} style={{ color:T.gold, margin:'0 auto 8px' }} />
                  <div style={{ fontFamily:F.mono, fontWeight:800, fontSize:15, color:T.charcoal, fontVariantNumeric:'tabular-nums' }}>{v}</div>
                  <div style={{ fontFamily:F.mono, fontSize:10, color:T.mist, marginTop:3, textTransform:'uppercase', letterSpacing:'.08em' }}>{l}</div>
                </div>
              ))}
            </div>

            {/* AI score */}
            <div style={{ background:T.ivory, border:`1px solid ${T.line}`, borderRadius:14, padding:'22px 20px', marginBottom:24 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <Zap size={16} style={{ color:T.gold }} />
                  <span style={{ fontFamily:F.mono, fontSize:12, fontWeight:700, letterSpacing:'.1em', textTransform:'uppercase', color:T.charcoal }}>Sierra AI Score</span>
                </div>
                <span style={{ fontFamily:F.mono, fontSize:22, fontWeight:800, color:T.gold, fontVariantNumeric:'tabular-nums' }}>{p.ai} / 10</span>
              </div>
              <div style={{ height:7, background:T.bone, borderRadius:4, overflow:'hidden' }}>
                <div style={{ height:'100%', width:`${p.ai*10}%`, background:`linear-gradient(90deg,${T.gold},${T.goldDeep})`, borderRadius:4, transformOrigin:'left', animation:`barGrow 1.4s ${T.ease} both` }} />
              </div>
              <div style={{ display:'flex', gap:24, marginTop:14, fontSize:13 }}>
                {[{l:'5yr growth',v:p.growth},{l:'Rental yield',v:p.rentYield}].map(({l,v}) => (
                  <span key={l} style={{ color:T.slate }}>{l}: <b style={{ fontFamily:F.mono, color:T.gold, fontWeight:800 }}>{v}</b></span>
                ))}
              </div>
            </div>

            {/* Description */}
            <div style={{ background:T.ivory, border:`1px solid ${T.line}`, borderRadius:14, padding:'22px 20px', marginBottom:24 }}>
              <h3 style={{ fontFamily:F.display, fontSize:20, fontWeight:700, color:T.charcoal, marginBottom:14, display:'flex', alignItems:'center', gap:10, letterSpacing:'-.005em' }}>
                <Star size={17} style={{ color:T.gold }} /> About this Property
              </h3>
              <p style={{ fontSize:14.5, lineHeight:1.8, color:T.slate, margin:0 }}>{p.description}</p>
            </div>

            {/* Features */}
            <div style={{ background:T.ivory, border:`1px solid ${T.line}`, borderRadius:14, padding:'22px 20px' }}>
              <h3 style={{ fontFamily:F.display, fontSize:20, fontWeight:700, color:T.charcoal, marginBottom:18, letterSpacing:'-.005em' }}>Features & Amenities</h3>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12 }}>
                {p.features.map(feat => (
                  <span key={feat} className="feat-row">
                    <span style={{ width:8, height:8, borderRadius:'50%', background:T.gold, display:'inline-block', flexShrink:0 }} /> {feat}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Agent sidebar */}
          <div style={{ position:'sticky', top:90, opacity:visible?1:0, animation:visible?`fadeUp .5s ${T.ease} .12s both`:'none' }}>
            <div style={{ background:T.ivory, border:`1px solid ${T.line}`, borderRadius:18, padding:'26px', boxShadow:`0 2px 14px rgba(10,22,40,.08)` }}>
              <div style={{ display:'flex', gap:14, alignItems:'center', marginBottom:22 }}>
                <img src={p.agent.img} alt={p.agent.name} style={{ width:62, height:62, borderRadius:14, objectFit:'cover' }} />
                <div>
                  <div style={{ fontFamily:F.mono, fontSize:10, letterSpacing:'.16em', textTransform:'uppercase', color:T.gold, fontWeight:700, marginBottom:4 }}>{p.agent.role}</div>
                  <div style={{ fontFamily:F.display, fontSize:18, fontWeight:700, color:T.charcoal }}>{p.agent.name}</div>
                  <div style={{ fontSize:12.5, color:T.mist, marginTop:2 }}>New Cairo Specialist</div>
                </div>
              </div>

              <a href={`tel:${p.agent.phone}`} className="cta-gold" style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, width:'100%', padding:'12px', marginBottom:10, borderRadius:10, background:`linear-gradient(135deg,${T.gold},${T.goldDeep})`, color:T.navy, fontFamily:F.body, fontWeight:800, fontSize:14, textDecoration:'none', boxSizing:'border-box' }}>
                <PhoneCall size={15} /> Call Layla
              </a>
              <a href={`https://wa.me/${p.agent.wa}?text=Hi Layla, I'm interested in ${p.code}`} target="_blank" rel="noreferrer" className="cta-ghost" style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, width:'100%', padding:'12px', borderRadius:10, border:`1.5px solid ${T.lineStrong}`, background:'transparent', color:T.slate, fontFamily:F.body, fontWeight:800, fontSize:14, textDecoration:'none', boxSizing:'border-box' }}>
                <MessageSquare size={15} /> WhatsApp
              </a>

              {/* AI badge */}
              <div style={{ marginTop:20, border:`1px dashed ${T.lineStrong}`, borderRadius:12, padding:'14px', display:'flex', gap:12, alignItems:'center' }}>
                <Zap size={22} style={{ color:T.gold, flexShrink:0 }} />
                <div style={{ fontSize:12.5, color:T.slate, lineHeight:1.5 }}>
                  <b style={{ color:T.gold, fontFamily:F.mono, fontSize:18 }}>{p.ai}</b> Sierra AI Score — top 3% of all listed units in {p.zone}.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
