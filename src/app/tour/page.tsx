'use client';
import Link from 'next/link';
import { useState, useRef, useEffect, useCallback } from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';

const T = { navy:'#0A1628', charcoal:'#1A2535', gold:'#C9A24D', goldHi:'#E9C176', goldDeep:'#A87C2A', ease:'cubic-bezier(0.22,1,0.36,1)' } as const;
const F = { display:'"Playfair Display","Instrument Serif",serif', body:'"Plus Jakarta Sans","Cairo",sans-serif', mono:'"JetBrains Mono","Geist Mono",monospace' } as const;

const LASER_CSS = `
  @keyframes se-laser {
    0%   { transform:translateY(0);     opacity:0; }
    8%   { opacity:.95; }
    92%  { opacity:.95; }
    100% { transform:translateY(100vh); opacity:0; }
  }
  .hero-laser {
    position:fixed; left:0; right:0; top:0; height:2px; z-index:20;
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

const ROOMS = [
  { name:'Luxury Living Room',   sub:'Hyde Park · Grand Villa · 5th Settlement', img:'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=1400&q=85' },
  { name:'Master Bedroom Suite', sub:'Mountain View iCity · Penthouse Level',    img:'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=1400&q=85' },
  { name:'Garden Courtyard',     sub:'Villette · Villa G-Type',                  img:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1400&q=85' },
  { name:'Infinity Pool & Deck', sub:'Taj City · Signature Villa',               img:'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=1400&q=85' },
  { name:'Rooftop Sky Terrace',  sub:'Uptown Cairo · Penthouse Level',           img:'https://images.unsplash.com/photo-1622547748225-3fc4abd2cca0?w=1400&q=85' },
];

export default function TourPage() {
  const [idx, setIdx] = useState(0);
  const [panX, setPanX] = useState(50);
  const dragRef = useRef<{ active: boolean; startX: number; startPos: number }>({ active:false, startX:0, startPos:50 });
  const room = ROOMS[idx];

  const onDown = useCallback((cx: number) => {
    dragRef.current = { active:true, startX:cx, startPos:panX };
  }, [panX]);

  const onMove = useCallback((cx: number) => {
    if (!dragRef.current.active) return;
    const dx = cx - dragRef.current.startX;
    const np = Math.max(0, Math.min(100, dragRef.current.startPos - dx / 8));
    setPanX(np);
  }, []);

  const onUp = useCallback(() => { dragRef.current.active = false; }, []);

  useEffect(() => { setPanX(50); }, [idx]);

  const prev = () => setIdx(i => (i - 1 + ROOMS.length) % ROOMS.length);
  const next = () => setIdx(i => (i + 1) % ROOMS.length);

  return (
    <main style={{ width:'100%', height:'100dvh', background:'#07111e', overflow:'hidden', position:'relative', userSelect:'none', fontFamily:F.body }}>
      <style>{`
        ${LASER_CSS}
        @keyframes roomFade { from{opacity:0} to{opacity:1} }
        @keyframes slideUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:none} }
        .nav-btn:hover { background:rgba(255,255,255,.18) !important; }
        .nav-btn { transition:background .2s; }
        .thumb-pill:hover { border-color:rgba(201,162,77,.7) !important; }
        .thumb-pill.on { border-color:${T.gold} !important; }
        .thumb-pill { transition:border-color .2s; }
      `}</style>

      <div className="hero-laser" />

      {/* Draggable panorama */}
      <div
        style={{ position:'absolute', inset:0, cursor:'grab', overflow:'hidden' }}
        onMouseDown={e => onDown(e.clientX)}
        onMouseMove={e => onMove(e.clientX)}
        onMouseUp={onUp}
        onMouseLeave={onUp}
        onTouchStart={e => onDown(e.touches[0].clientX)}
        onTouchMove={e => { e.preventDefault(); onMove(e.touches[0].clientX); }}
        onTouchEnd={onUp}
      >
        <img
          key={room.img}
          src={room.img}
          alt={room.name}
          draggable={false}
          style={{
            position:'absolute', top:'50%', userSelect:'none',
            left:`${50 - panX * 0.16}%`,
            transform:`translate(-${40 + panX * 0.16}%, -50%) scale(1.18)`,
            width:'145%', height:'145%', objectFit:'cover',
            transition: dragRef.current.active ? 'none' : 'left .3s ease-out',
            pointerEvents:'none',
            animation:'roomFade .5s ease both',
          }}
        />
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top,rgba(4,10,18,.82) 0%,rgba(4,10,18,0) 30%,rgba(4,10,18,0) 75%,rgba(4,10,18,.6) 100%)', pointerEvents:'none' }} />
      </div>

      {/* Back nav */}
      <div style={{ position:'absolute', top:20, left:24, zIndex:10 }}>
        <Link href="/clients" style={{ display:'inline-flex', alignItems:'center', gap:7, color:T.gold, fontFamily:F.mono, fontSize:11, fontWeight:700, letterSpacing:'.1em', textTransform:'uppercase', textDecoration:'none', background:'rgba(4,10,18,.5)', backdropFilter:'blur(12px)', padding:'8px 14px', borderRadius:9, border:'1px solid rgba(255,255,255,.12)' }}>
          <ArrowLeft size={13} /> Portal
        </Link>
      </div>

      {/* Drag hint */}
      <div style={{ position:'absolute', top:22, right:24, zIndex:10, display:'flex', alignItems:'center', gap:8, background:'rgba(4,10,18,.5)', backdropFilter:'blur(12px)', border:'1px solid rgba(255,255,255,.12)', borderRadius:9, padding:'8px 13px', color:'rgba(255,255,255,.62)', fontFamily:F.mono, fontSize:10.5, fontWeight:700, letterSpacing:'.12em', textTransform:'uppercase' }}>
        <Maximize2 size={12} style={{ color:T.gold }} /> Drag to Pan
      </div>

      {/* Bottom overlay */}
      <div style={{ position:'absolute', bottom:0, left:0, right:0, zIndex:10, padding:'0 32px clamp(28px,5vh,48px)', animation:'slideUp .6s ease both' }}>
        <div style={{ marginBottom:22 }}>
          <div style={{ fontFamily:F.mono, fontSize:11, fontWeight:700, letterSpacing:'.2em', textTransform:'uppercase', color:T.gold, marginBottom:8, display:'flex', alignItems:'center', gap:10 }}>
            <span style={{ width:24, height:1.5, background:T.gold, display:'inline-block' }} />
            SIERRA VIRTUAL TOUR
          </div>
          <h1 style={{ color:'#fff', fontFamily:F.display, fontSize:'clamp(22px,4vw,38px)', fontWeight:700, letterSpacing:'-.015em', lineHeight:1.1, margin:'0 0 6px' }}>
            {room.name}
          </h1>
          <p style={{ color:'rgba(255,255,255,.62)', fontFamily:F.mono, fontSize:12.5, fontWeight:700, letterSpacing:'.1em', textTransform:'uppercase', margin:0 }}>{room.sub}</p>
        </div>

        {/* Controls */}
        <div style={{ display:'flex', alignItems:'center', gap:14, flexWrap:'wrap' }}>
          <button className="nav-btn" onClick={prev} aria-label="Previous room" style={{ width:44, height:44, borderRadius:12, border:'1px solid rgba(255,255,255,.22)', background:'rgba(255,255,255,.1)', backdropFilter:'blur(12px)', cursor:'pointer', display:'grid', placeItems:'center', color:'#fff' }}>
            <ChevronLeft size={20} />
          </button>
          <button className="nav-btn" onClick={next} aria-label="Next room" style={{ width:44, height:44, borderRadius:12, border:'1px solid rgba(255,255,255,.22)', background:'rgba(255,255,255,.1)', backdropFilter:'blur(12px)', cursor:'pointer', display:'grid', placeItems:'center', color:'#fff' }}>
            <ChevronRight size={20} />
          </button>
          <div style={{ width:1, height:28, background:'rgba(255,255,255,.18)' }} />
          {ROOMS.map((r,i) => (
            <button key={i} className={`thumb-pill${idx===i?' on':''}`} onClick={() => setIdx(i)}
              style={{ flexShrink:0, width:72, height:44, borderRadius:10, border:'1.5px solid rgba(255,255,255,.2)', overflow:'hidden', cursor:'pointer', padding:0, background:'transparent' }}>
              <img src={r.img} alt={r.name} style={{ width:'100%', height:'100%', objectFit:'cover', display:'block', opacity: idx===i ? 1 : 0.55 }} />
            </button>
          ))}
          <div style={{ marginLeft:'auto', fontFamily:F.mono, fontSize:13, fontWeight:800, color:T.goldHi, letterSpacing:'.08em', fontVariantNumeric:'tabular-nums' }}>
            {String(idx+1).padStart(2,'0')} / {String(ROOMS.length).padStart(2,'0')}
          </div>
        </div>
      </div>
    </main>
  );
}
