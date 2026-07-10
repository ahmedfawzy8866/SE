import { useState, useEffect, useRef, useCallback } from "react";
import { useLang } from "@/contexts/LanguageContext";

const ROOMS = [
  {
    name: "Living Area",      icon: "🛋️", of: "01 / 07",
    img: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=4000&q=100",
    specs: [["450m²","Total Area"],["6","Bedrooms"],["5","Baths"],["EGP 35M","Price"]],
  },
  {
    name: "Master Suite",     icon: "🛏️", of: "02 / 07",
    img: "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=4000&q=100",
    specs: [["85m²","Suite Area"],["En-Suite","Bathroom"],["Walk-In","Wardrobe"],["Garden","View"]],
  },
  {
    name: "Private Garden",   icon: "🌿", of: "03 / 07",
    img: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=4000&q=100",
    specs: [["280m²","Garden"],["Landscape","Design"],["Irrigation","System"],["Private","Access"]],
  },
  {
    name: "Pool Deck",        icon: "🏊", of: "04 / 07",
    img: "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=4000&q=100",
    specs: [["12×5m","Pool Size"],["Infinity","Edge"],["Heated","Pool"],["Outdoor","Lounge"]],
  },
  {
    name: "Sky Terrace",      icon: "🌅", of: "05 / 07",
    img: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=4000&q=100",
    specs: [["120m²","Terrace"],["360°","Panorama"],["BBQ","Station"],["Sunset","Views"]],
  },
  {
    name: "Villa Exterior",   icon: "🏡", of: "06 / 07",
    img: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=4000&q=100",
    specs: [["800m²","Plot"],["Corner","Position"],["3 Car","Garage"],["2026","Delivery"]],
  },
  {
    name: "Kitchen & Dining", icon: "🍽️", of: "07 / 07",
    img: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=2400&q=85",
    specs: [["Open","Plan"],["Italian","Kitchen"],["12 Seat","Dining"],["Marble","Counters"]],
  },
];

/** Cylindrical panorama renderer using Canvas 2D — no WebGL required */
function usePanorama(canvasRef: React.RefObject<HTMLCanvasElement | null>, imgSrc: string) {
  const stateRef = useRef({ lon: 0, lat: 0, vLon: 0, vLat: 0, dragging: false, lastX: 0, lastY: 0 });
  const imgRef   = useRef<HTMLImageElement | null>(null);
  const rafRef   = useRef(0);
  const fovRef   = useRef(75); // horizontal field of view in degrees
  const [loading, setLoading] = useState(true);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const img    = imgRef.current;
    if (!canvas || !img || !img.complete) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W  = canvas.width;
    const H  = canvas.height;
    const IW = img.naturalWidth;
    const IH = img.naturalHeight;
    const fov = fovRef.current; // horizontal FOV degrees
    const s   = stateRef.current;

    // Clamp lat
    s.lat = Math.max(-60, Math.min(60, s.lat));

    // For each output column, compute source x from equirectangular projection
    // For each row, compute source y
    // fov maps to W pixels → pixelsPerDegree = W / fov
    const degPerPx_H = fov / W;
    const degPerPx_V = (fov * (H / W)) / H;

    // Center of source image at current (lon, lat)
    const srcCenterX = ((s.lon % 360 + 360) % 360) / 360 * IW;
    const srcCenterY = ((s.lat + 90) / 180) * IH;

    // Scale: degrees per source pixel
    const srcDegPerPx_H = 360 / IW;
    const srcDegPerPx_V = 180 / IH;

    // pixels in source per output pixel
    const scaleX = degPerPx_H / srcDegPerPx_H;
    const scaleY = degPerPx_V / srcDegPerPx_V;

    const srcW = W * scaleX;
    const srcH = H * scaleY;

    const srcX = srcCenterX - srcW / 2;
    const srcY = srcCenterY - srcH / 2;

    // Handle wrap-around
    ctx.clearRect(0, 0, W, H);

    if (srcX >= 0 && srcX + srcW <= IW) {
      // No wrap — single draw
      ctx.drawImage(img, srcX, Math.max(0, srcY), srcW, Math.min(srcH, IH - Math.max(0, srcY)), 0, Math.max(0, (srcY < 0 ? (srcY / srcH) * H : 0)), W, Math.min(H, (Math.min(srcH, IH) / srcH) * H));
    } else {
      // Wrap-around: draw two segments
      if (srcX < 0) {
        const leftSrcX = srcX + IW;
        const leftSrcW = Math.min(IW - leftSrcX, -srcX * (IW / srcW) + 1);
        const rightSrcW = srcW + srcX;
        const splitDstX = W * (-srcX / srcW);
        if (leftSrcW > 0) ctx.drawImage(img, leftSrcX, Math.max(0, srcY), leftSrcW, srcH, 0, 0, splitDstX, H);
        if (rightSrcW > 0) ctx.drawImage(img, 0, Math.max(0, srcY), rightSrcW, srcH, splitDstX, 0, W - splitDstX, H);
      } else {
        const rightOverflow = (srcX + srcW) - IW;
        const leftSrcW = IW - srcX;
        const splitDstX = W * (leftSrcW / srcW);
        if (leftSrcW > 0) ctx.drawImage(img, srcX, Math.max(0, srcY), leftSrcW, srcH, 0, 0, splitDstX, H);
        if (rightOverflow > 0) ctx.drawImage(img, 0, Math.max(0, srcY), rightOverflow, srcH, splitDstX, 0, W - splitDstX, H);
      }
    }

    // Subtle vignette
    const vg = ctx.createRadialGradient(W/2, H/2, H * 0.2, W/2, H/2, H * 0.9);
    vg.addColorStop(0, "transparent");
    vg.addColorStop(1, "rgba(0,0,0,0.45)");
    ctx.fillStyle = vg;
    ctx.fillRect(0, 0, W, H);
  }, [canvasRef]);

  const loop = useCallback(() => {
    const s = stateRef.current;
    if (!s.dragging) {
      s.lon  += s.vLon;
      s.lat  += s.vLat;
      s.vLon *= 0.91;
      s.vLat *= 0.91;
      // gentle auto-drift
      if (Math.abs(s.vLon) < 0.02) s.lon += 0.04;
    }
    draw();
    rafRef.current = requestAnimationFrame(loop);
  }, [draw]);

  // Load image
  useEffect(() => {
    setLoading(true);
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      imgRef.current = img;
      stateRef.current.lon = 0;
      stateRef.current.lat = 0;
      stateRef.current.vLon = 0;
      stateRef.current.vLat = 0;
      setLoading(false);
    };
    img.onerror = () => { imgRef.current = img; setLoading(false); };
    img.src = imgSrc;
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [imgSrc, loop]);

  // Resize handler
  useEffect(() => {
    const onResize = () => {
      const c = canvasRef.current;
      if (!c) return;
      c.width  = c.clientWidth;
      c.height = c.clientHeight;
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [canvasRef]);

  const startDrag = (x: number, y: number) => {
    const s = stateRef.current;
    s.dragging = true;
    s.vLon = 0; s.vLat = 0;
    s.lastX = x; s.lastY = y;
  };
  const moveDrag = (x: number, y: number) => {
    const s = stateRef.current;
    if (!s.dragging) return;
    const dx = x - s.lastX;
    const dy = y - s.lastY;
    s.vLon = -dx * 0.15;
    s.vLat =  dy * 0.15;
    s.lon += s.vLon;
    s.lat += s.vLat;
    s.lastX = x; s.lastY = y;
  };
  const endDrag = () => { stateRef.current.dragging = false; };

  const nudge   = (dLon: number, dLat: number) => { stateRef.current.lon += dLon; stateRef.current.lat += dLat; };
  const resetView = () => { stateRef.current.lon = 0; stateRef.current.lat = 0; stateRef.current.vLon = 0; stateRef.current.vLat = 0; };
  const zoomIn  = () => { fovRef.current = Math.max(30, fovRef.current - 10); };
  const zoomOut = () => { fovRef.current = Math.min(100, fovRef.current + 10); };
  const getFov  = () => fovRef.current;

  return { loading, startDrag, moveDrag, endDrag, nudge, resetView, zoomIn, zoomOut, getFov };
}

export default function VirtualTour() {
  const { t } = useLang();
  const [room, setRoom] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const [autoPlay, setAutoPlay] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [fovDisplay, setFovDisplay] = useState(75);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef   = useRef<HTMLDivElement>(null);
  const { loading, startDrag, moveDrag, endDrag, nudge, resetView, zoomIn, zoomOut, getFov } =
    usePanorama(canvasRef, ROOMS[room].img);

  // Size canvas to container
  useEffect(() => {
    const resize = () => {
      const c = canvasRef.current;
      if (!c) return;
      c.width  = c.clientWidth;
      c.height = c.clientHeight;
    };
    resize();
    const ro = new ResizeObserver(resize);
    if (canvasRef.current) ro.observe(canvasRef.current);
    return () => ro.disconnect();
  }, []);

  // FOV display sync
  useEffect(() => {
    const id = setInterval(() => setFovDisplay(Math.round(getFov())), 200);
    return () => clearInterval(id);
  }, [getFov]);

  // Auto-play
  useEffect(() => {
    if (!autoPlay) return;
    const id = setInterval(() => setRoom(r => (r + 1) % ROOMS.length), 6000);
    return () => clearInterval(id);
  }, [autoPlay]);

  // Keyboard
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") nudge( 20, 0);
      if (e.key === "ArrowLeft")  nudge(-20, 0);
      if (e.key === "ArrowUp")    nudge(0, -10);
      if (e.key === "ArrowDown")  nudge(0,  10);
      if (e.key === "Escape")     setFullscreen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [nudge]);

  const toggleFS = () => {
    setFullscreen(f => !f);
    setTimeout(() => {
      const c = canvasRef.current;
      if (c) { c.width = c.clientWidth; c.height = c.clientHeight; }
    }, 60);
  };

  const curRoom = ROOMS[room];

  const wrapStyle: React.CSSProperties = fullscreen
    ? { position: "fixed", inset: 0, zIndex: 900, background: "#07111e" }
    : { position: "relative", borderRadius: 20, overflow: "hidden", background: "#07111e", boxShadow: "0 32px 80px rgba(0,0,0,.5)" };

  return (
    <section id="tour" style={{ background: "var(--navy2)", padding: "72px 0 0" }}>
      <div style={{ maxWidth: 1320, margin: "0 auto", padding: "0 24px 32px" }}>
        <div className="sec-eyebrow light">{t("tour.eyebrow")}</div>
        <h2 className="sec-title light">{t("tour.title")}</h2>
        <p className="sec-sub light">{t("tour.sub")}</p>
      </div>

      <div style={{ maxWidth: 1320, margin: "0 auto", padding: "0 24px" }}>
        <div ref={wrapRef} style={wrapStyle}>

          {/* Canvas panorama */}
          <canvas
            ref={canvasRef}
            style={{ display: "block", width: "100%", height: fullscreen ? "100vh" : "72vh", minHeight: 480, cursor: "grab" }}
            onMouseDown={e => { startDrag(e.clientX, e.clientY); (e.currentTarget as HTMLCanvasElement).style.cursor = "grabbing"; }}
            onMouseMove={e => moveDrag(e.clientX, e.clientY)}
            onMouseUp={e => { endDrag(); (e.currentTarget as HTMLCanvasElement).style.cursor = "grab"; }}
            onMouseLeave={() => endDrag()}
            onTouchStart={e => startDrag(e.touches[0].clientX, e.touches[0].clientY)}
            onTouchMove={e => { e.preventDefault(); moveDrag(e.touches[0].clientX, e.touches[0].clientY); }}
            onTouchEnd={endDrag}
            onWheel={e => { e.preventDefault(); e.deltaY > 0 ? zoomOut() : zoomIn(); }}
          />

          {/* Loading overlay */}
          {loading && (
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "rgba(7,17,30,.95)", zIndex: 30 }}>
              <div style={{ fontFamily: "var(--font-serif)", fontSize: 28, color: "var(--gold-lt)", marginBottom: 8 }}>Sierra Estates</div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 8, letterSpacing: ".22em", color: "rgba(233,193,118,.45)", textTransform: "uppercase", marginBottom: 28 }}>Loading panorama...</div>
              <div style={{ width: 180, height: 2, background: "rgba(200,150,26,.12)", borderRadius: 1, overflow: "hidden" }}>
                <div style={{ height: "100%", background: "linear-gradient(90deg,var(--gold),var(--gold-lt))", borderRadius: 1, animation: "shimmer 1.4s ease-in-out infinite" }} />
              </div>
            </div>
          )}

          {/* Drag hint */}
          {!loading && (
            <div style={{ position: "absolute", bottom: 86, left: "50%", transform: "translateX(-50%)", zIndex: 20, background: "rgba(7,17,30,.78)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,.1)", borderRadius: 20, padding: "7px 18px", fontSize: 11, color: "rgba(240,237,229,.65)", display: "flex", alignItems: "center", gap: 7, animation: "fadeUp .8s .6s both", whiteSpace: "nowrap" }}>
              ↔↕ Drag to pan · Scroll to zoom · Arrow keys to look around
            </div>
          )}

          {/* Crosshair */}
          <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", zIndex: 15, width: 28, height: 28, pointerEvents: "none", opacity: .25 }}>
            <div style={{ position: "absolute", width: 1, height: "100%", left: "50%", background: "rgba(200,150,26,.9)" }} />
            <div style={{ position: "absolute", height: 1, width: "100%", top: "50%", background: "rgba(200,150,26,.9)" }} />
          </div>

          {/* Top bar */}
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, zIndex: 20, height: 54, display: "flex", alignItems: "center", padding: "0 16px", gap: 14, background: "linear-gradient(to bottom,rgba(7,17,30,.9) 0%,transparent 100%)", pointerEvents: "none" }}>
            <span style={{ fontSize: 20 }}>{curRoom.icon}</span>
            <div style={{ fontFamily: "var(--font-serif)", fontSize: 20, color: "#fff", opacity: .92 }}>{curRoom.name}</div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 8, letterSpacing: ".18em", color: "var(--gold)", marginTop: 2, opacity: .7 }}>{curRoom.of}</div>
            <div style={{ marginLeft: "auto", display: "flex", gap: 6, pointerEvents: "all" }}>
              {[
                { label: "ℹ Details", act: () => setPanelOpen(p => !p), on: panelOpen },
                { label: autoPlay ? "⏹ Auto" : "▶ Auto", act: () => setAutoPlay(a => !a), on: autoPlay },
                { label: fullscreen ? "⛶ Exit" : "⛶ Full", act: toggleFS, on: fullscreen },
              ].map((b, i) => (
                <button key={i} onClick={b.act} style={{ background: b.on ? "linear-gradient(135deg,var(--gold),var(--gold-lt))" : "rgba(255,255,255,.09)", border: `1px solid ${b.on ? "var(--gold)" : "rgba(255,255,255,.13)"}`, color: b.on ? "var(--navy)" : "rgba(240,237,229,.8)", padding: "5px 14px", borderRadius: 20, cursor: "pointer", fontSize: 10.5, fontWeight: 600, transition: "all .2s", fontFamily: "inherit" }}>
                  {b.label}
                </button>
              ))}
            </div>
          </div>

          {/* Right nav cluster */}
          <div style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", zIndex: 20, display: "flex", flexDirection: "column", gap: 5, alignItems: "center" }}>
            {([["↑", 0, -20], ["↓", 0, 20], ["←", -30, 0], ["→", 30, 0]] as [string, number, number][]).map(([lbl, dl, dt], i) => (
              <button key={i} onClick={() => nudge(dl, dt)} style={{ width: 38, height: 38, borderRadius: 11, background: "rgba(7,17,30,.88)", backdropFilter: "blur(14px)", border: "1px solid rgba(255,255,255,.1)", color: "rgba(240,237,229,.7)", fontSize: 15, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all .2s", fontFamily: "inherit" }}
                onMouseEnter={e => { const b = e.currentTarget as HTMLButtonElement; b.style.background = "rgba(200,150,26,.18)"; b.style.color = "var(--gold-lt)"; }}
                onMouseLeave={e => { const b = e.currentTarget as HTMLButtonElement; b.style.background = "rgba(7,17,30,.88)"; b.style.color = "rgba(240,237,229,.7)"; }}>
                {lbl}
              </button>
            ))}
            <div style={{ height: 1, background: "rgba(255,255,255,.07)", margin: "2px 4px", width: "60%" }} />
            {/* Zoom */}
            <button onClick={zoomIn} style={{ width: 38, height: 38, borderRadius: 11, background: "rgba(7,17,30,.88)", backdropFilter: "blur(14px)", border: "1px solid rgba(255,255,255,.1)", color: "rgba(240,237,229,.7)", fontSize: 17, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
            <button onClick={zoomOut} style={{ width: 38, height: 38, borderRadius: 11, background: "rgba(7,17,30,.88)", backdropFilter: "blur(14px)", border: "1px solid rgba(255,255,255,.1)", color: "rgba(240,237,229,.7)", fontSize: 17, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>−</button>
            <button onClick={resetView} title="Reset view" style={{ width: 38, height: 38, borderRadius: 11, background: "rgba(7,17,30,.88)", backdropFilter: "blur(14px)", border: "1px solid rgba(255,255,255,.1)", color: "rgba(240,237,229,.7)", fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>⊙</button>
          </div>

          {/* FOV + Compass */}
          <div style={{ position: "absolute", left: 14, bottom: 100, zIndex: 20, display: "flex", flexDirection: "column", gap: 6, alignItems: "center" }}>
            <div style={{ background: "rgba(7,17,30,.88)", backdropFilter: "blur(14px)", border: "1px solid rgba(255,255,255,.1)", borderRadius: 9, padding: "5px 9px", fontFamily: "var(--font-mono)", fontSize: 8.5, color: "rgba(200,150,26,.7)" }}>FOV {fovDisplay}°</div>
            <div style={{ width: 50, height: 50, background: "rgba(7,17,30,.88)", backdropFilter: "blur(14px)", border: "1px solid rgba(200,150,26,.2)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 1 }}>
              <span style={{ fontSize: 22, lineHeight: 1 }}>🧭</span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 7.5, color: "rgba(200,150,26,.7)", letterSpacing: ".08em" }}>N</span>
            </div>
          </div>

          {/* Property panel */}
          {panelOpen && (
            <div style={{ position: "absolute", left: 14, top: 62, zIndex: 25, width: 234, background: "rgba(7,17,30,.93)", backdropFilter: "blur(20px)", border: "1px solid rgba(200,150,26,.25)", borderRadius: 18, padding: 16, animation: "slideDown .3s cubic-bezier(.16,1,.3,1) both" }}>
              <div style={{ fontFamily: "var(--font-serif)", fontSize: 20, fontWeight: 500, color: "#fff", marginBottom: 3 }}>Villa Emeraude</div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 7.5, color: "var(--gold)", letterSpacing: ".14em", textTransform: "uppercase", marginBottom: 14 }}>Hyde Park · New Cairo</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7, marginBottom: 14 }}>
                {curRoom.specs.map(([v, l], i) => (
                  <div key={i} style={{ background: "rgba(255,255,255,.05)", borderRadius: 9, padding: "9px", textAlign: "center" }}>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 700, color: "var(--gold-lt)", lineHeight: 1 }}>{v}</div>
                    <div style={{ fontSize: 7.5, color: "rgba(240,237,229,.4)", textTransform: "uppercase", letterSpacing: ".07em", marginTop: 3 }}>{l}</div>
                  </div>
                ))}
              </div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 15, fontWeight: 700, color: "var(--gold)", marginBottom: 8 }}>EGP 35,000,000</div>
              <div style={{ fontSize: 9.5, color: "rgba(240,237,229,.42)", marginBottom: 12, lineHeight: 1.6 }}>AI Match 97% · Recommended for Gulf investors seeking capital growth</div>
              <button style={{ width: "100%", padding: "10px", borderRadius: 10, background: "linear-gradient(135deg,var(--gold),var(--gold-lt))", color: "var(--navy)", border: "none", cursor: "pointer", fontWeight: 700, fontSize: 10.5, fontFamily: "inherit" }}>
                Request Viewing
              </button>
            </div>
          )}

          {/* Prev / Next */}
          <button onClick={() => setRoom(r => (r - 1 + ROOMS.length) % ROOMS.length)}
            style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", zIndex: 20, width: 44, height: 44, borderRadius: 13, background: "rgba(7,17,30,.88)", backdropFilter: "blur(14px)", border: "1px solid rgba(255,255,255,.1)", color: "rgba(240,237,229,.7)", fontSize: 22, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "inherit" }}>
            ‹
          </button>
          <button onClick={() => setRoom(r => (r + 1) % ROOMS.length)}
            style={{ position: "absolute", right: 66, top: "50%", transform: "translateY(-50%)", zIndex: 20, width: 44, height: 44, borderRadius: 13, background: "rgba(7,17,30,.88)", backdropFilter: "blur(14px)", border: "1px solid rgba(255,255,255,.1)", color: "rgba(240,237,229,.7)", fontSize: 22, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "inherit" }}>
            ›
          </button>

          {/* Room pills */}
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 20, display: "flex", gap: 6, padding: "14px 16px", background: "linear-gradient(to top,rgba(7,17,30,.9) 0%,transparent 100%)", overflowX: "auto", scrollbarWidth: "none", justifyContent: "center", flexWrap: "wrap" }}>
            {ROOMS.map((r, i) => (
              <button key={i} onClick={() => setRoom(i)}
                style={{ padding: "7px 16px", borderRadius: 30, border: `1px solid ${room === i ? "var(--gold)" : "rgba(255,255,255,.1)"}`, background: room === i ? "rgba(211,167,71,.14)" : "rgba(255,255,255,.04)", color: room === i ? "var(--gold-lt)" : "rgba(255,255,255,.52)", fontSize: 10.5, fontWeight: 600, cursor: "pointer", transition: "all .25s", whiteSpace: "nowrap", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 5 }}>
                <span>{r.icon}</span><span>{r.name}</span>
              </button>
            ))}
          </div>

          {/* Keyboard hint */}
          <div style={{ position: "absolute", left: 14, bottom: 24, zIndex: 20, fontFamily: "var(--font-mono)", fontSize: 7.5, color: "rgba(200,150,26,.35)", letterSpacing: ".05em", lineHeight: 2 }}>
            ← → ↑ ↓ arrow keys · scroll = zoom
          </div>
        </div>
      </div>
      <div style={{ height: 72 }} />
    </section>
  );
}
