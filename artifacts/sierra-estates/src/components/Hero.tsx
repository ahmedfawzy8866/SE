import { useState, useEffect, useRef, useCallback } from "react";
import { useLang } from "@/contexts/LanguageContext";

/* ── High-quality luxury villa images ── */
const SCENES = [
  {
    bg:    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920&q=90",
    thumb: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=160&q=70",
    lbl:   "Villa Exterior",
    loc:   "Hyde Park · New Cairo",
  },
  {
    bg:    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1920&q=90",
    thumb: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=160&q=70",
    lbl:   "Luxury Pool",
    loc:   "Mivida · 5th Settlement",
  },
  {
    bg:    "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=1920&q=90",
    thumb: "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=160&q=70",
    lbl:   "Garden Estate",
    loc:   "Mountain View · New Cairo",
  },
  {
    bg:    "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1920&q=90",
    thumb: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=160&q=70",
    lbl:   "Contemporary Villa",
    loc:   "Uptown Cairo · Mokattam",
  },
  {
    bg:    "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=1920&q=90",
    thumb: "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=160&q=70",
    lbl:   "Night View",
    loc:   "El Shorouk Springs · Shorouk",
  },
];

const TRANSITION_MS = 1600;

export default function Hero() {
  const { t } = useLang();
  const [scene, setScene]     = useState(0);
  const [imgA, setImgA]       = useState(SCENES[0].bg);
  const [imgB, setImgB]       = useState(SCENES[0].bg);
  const [aOnTop, setAOnTop]   = useState(true);
  const [kbKey, setKbKey]     = useState(0); // increments to restart KB animation
  const [locked, setLocked]   = useState(false);
  const [drag, setDrag]       = useState(false);

  const pRef     = useRef<HTMLCanvasElement>(null);
  const bgARef   = useRef<HTMLDivElement>(null);
  const bgBRef   = useRef<HTMLDivElement>(null);
  const rafRef   = useRef<number>(0);
  const lastRef  = useRef<{ x: number; y: number } | null>(null);
  const ms       = useRef({ panX: 50, panY: 50, driftTX: 52, driftTY: 48, driftT: 320, isDragging: false, scrollY: 0 });

  /* ── A/B crossfade transition ── */
  const goTo = useCallback((next: number) => {
    if (locked || next === scene) return;
    setLocked(true);
    if (aOnTop) {
      setImgB(SCENES[next].bg);
      setAOnTop(false);
    } else {
      setImgA(SCENES[next].bg);
      setAOnTop(true);
    }
    setKbKey(k => k + 1);
    setScene(next);
    setTimeout(() => setLocked(false), TRANSITION_MS);
  }, [locked, scene, aOnTop]);

  /* ── Auto-advance every 7s ── */
  useEffect(() => {
    const id = setInterval(() => setScene(s => {
      const next = (s + 1) % SCENES.length;
      goTo(next);
      return s; // goTo manages scene state
    }), 7000);
    return () => clearInterval(id);
  }, [goTo]);

  /* ── Parallax on scroll ── */
  const applyBg = useCallback(() => {
    const s = ms.current;
    const apply = (el: HTMLDivElement | null) => {
      if (!el) return;
      el.style.backgroundPosition = `${s.panX}% ${s.panY}%`;
      el.style.transform = `translateY(${s.scrollY * 0.28}px)`;
    };
    apply(bgARef.current);
    apply(bgBRef.current);
  }, []);

  useEffect(() => {
    const onScroll = () => { ms.current.scrollY = window.scrollY; applyBg(); };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [applyBg]);

  /* ── Particle canvas + Ken Burns drift ── */
  useEffect(() => {
    const cv = pRef.current; if (!cv) return;
    const ctx = cv.getContext("2d")!;
    const resize = () => { cv.width = cv.offsetWidth; cv.height = cv.offsetHeight; };
    resize();
    window.addEventListener("resize", resize);
    const pts = Array.from({ length: 80 }, () => ({
      x: Math.random() * cv.width, y: Math.random() * cv.height,
      r: Math.random() * 1.4 + .3,
      vx: (Math.random() - .5) * .18, vy: -Math.random() * .28 - .06,
      op: Math.random() * .26 + .05,
    }));
    const newTarget = () => {
      const s = ms.current;
      s.driftTX = 36 + Math.random() * 28;
      s.driftTY = 36 + Math.random() * 28;
      s.driftT  = 340 + Math.random() * 220;
    };
    newTarget();
    const tick = () => {
      rafRef.current = requestAnimationFrame(tick);
      ctx.clearRect(0, 0, cv.width, cv.height);
      pts.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.y < -4) { p.y = cv.height + 4; p.x = Math.random() * cv.width; }
        if (p.x < -4) p.x = cv.width + 4; else if (p.x > cv.width + 4) p.x = -4;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(211,167,71,${p.op})`; ctx.fill();
      });
      const s = ms.current;
      if (!s.isDragging) {
        if (--s.driftT <= 0) newTarget();
        s.panX += (s.driftTX - s.panX) * .004;
        s.panY += (s.driftTY - s.panY) * .004;
        applyBg();
      }
    };
    tick();
    return () => { window.removeEventListener("resize", resize); cancelAnimationFrame(rafRef.current); };
  }, [applyBg]);

  /* ── Mouse drag pan ── */
  const onD = (e: React.MouseEvent) => {
    ms.current.isDragging = true; setDrag(true);
    lastRef.current = { x: e.clientX, y: e.clientY };
  };
  const onM = (e: React.MouseEvent) => {
    const s = ms.current; if (!s.isDragging || !lastRef.current) return;
    s.panX = Math.max(20, Math.min(80, s.panX - (e.clientX - lastRef.current.x) * .036));
    s.panY = Math.max(20, Math.min(80, s.panY - (e.clientY - lastRef.current.y) * .036));
    lastRef.current = { x: e.clientX, y: e.clientY };
    applyBg();
  };
  const onU = () => { ms.current.isDragging = false; setDrag(false); };

  const cur = SCENES[scene];

  return (
    <section id="hero" className={`hero${drag ? " grabbing" : ""}`}
      onMouseDown={onD} onMouseMove={onM} onMouseUp={onU} onMouseLeave={onU}>

      {/* Layer B — bottom */}
      <div ref={bgBRef} className="hero-bg"
        style={{
          backgroundImage: `url(${imgB})`,
          backgroundPosition: "50% 50%",
          zIndex: 0,
          opacity: aOnTop ? 0 : 1,
          transition: `opacity ${TRANSITION_MS}ms cubic-bezier(.45,0,.55,1)`,
        }} />

      {/* Layer A — top */}
      <div ref={bgARef} className={`hero-bg${aOnTop ? " hero-kb" : ""}`}
        key={`a-${kbKey}`}
        style={{
          backgroundImage: `url(${imgA})`,
          backgroundPosition: "50% 50%",
          zIndex: 1,
          opacity: aOnTop ? 1 : 0,
          transition: `opacity ${TRANSITION_MS}ms cubic-bezier(.45,0,.55,1)`,
        }} />

      <div className="hero-vignette" style={{ zIndex: 2 }} />
      <canvas ref={pRef} className="hero-particles" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", zIndex: 3 }} />

      {/* Location badge */}
      <div className="hero-loc-badge" style={{ zIndex: 4 }}>
        <span className="hero-loc-dot" />
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 8.5, letterSpacing: ".18em", color: "rgba(240,237,229,.65)", textTransform: "uppercase" }}>{cur.loc}</span>
      </div>

      <div className="hero-content" style={{ zIndex: 4 }} key={`content-${scene}`}>
        <div className="hero-eyebrow" style={{ animation: "fadeUp .8s both" }}>{t(`hero.${scene + 1}.eyebrow`)}</div>
        <h1 className="hero-title" style={{ animation: "fadeUp .8s .1s both" }}>
          {t(`hero.${scene + 1}.title1`)} <em>{t(`hero.${scene + 1}.titleEm`)}</em><br />{t(`hero.${scene + 1}.title2`)}
        </h1>
        <p className="hero-sub" style={{ animation: "fadeUp .8s .2s both" }}>{t(`hero.${scene + 1}.sub`)}</p>
        <div className="hero-stats">
          {[["1,500+","hero.listings"],["19","hero.compounds"],["9.8","hero.aiScore"],["24h","hero.response"]].map(([v, lk], i) => (
            <div key={i} className="hero-stat" style={{ padding: "2px 8px" }}>
              <div className="hero-stat-v">{v}</div>
              <div className="hero-stat-l">{t(lk)}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Scene thumbnails */}
      <div className="scene-thumbs" style={{ zIndex: 4 }}>
        {SCENES.map((s, i) => (
          <div key={i} className={`scene-thumb${scene === i ? " active" : ""}`}
            onClick={e => { e.stopPropagation(); goTo(i); }}>
            <img src={s.thumb} alt={s.lbl} loading="lazy" />
            <div className="scene-thumb-lbl">{s.lbl}</div>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="hero-progress" style={{ zIndex: 4 }}>
        {SCENES.map((_, i) => (
          <div key={i} className={`hero-progress-dot${scene === i ? " active" : ""}`}
            onClick={() => goTo(i)} />
        ))}
      </div>
    </section>
  );
}
