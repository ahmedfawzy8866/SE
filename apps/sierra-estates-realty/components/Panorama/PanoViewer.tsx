'use client';

/**
 * Sierra Estates — interactive panorama "panner".
 * A lightweight, dependency-free drag-to-explore viewer: the panoramic image is
 * zoomed past the frame and panned horizontally on pointer drag, with a gentle
 * idle auto-drift so it feels alive. Includes a "copy link" action so an advisor
 * can share the immersive tour (commercial use).
 *
 * Drop a true equirectangular 360° asset in as `src` for a full-panorama feel;
 * any wide, high-resolution interior/exterior shot also pans nicely.
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';

export interface PanoViewerProps {
  src: string;
  alt: string;
  /** Absolute URL to copy for sharing. Falls back to the current page URL. */
  shareUrl?: string;
  height?: number;
  labels: {
    badge: string; // e.g. "360° TOUR"
    hint: string; // e.g. "Drag to explore"
    copy: string; // e.g. "Copy tour link"
    copied: string; // e.g. "Link copied"
  };
}

export default function PanoViewer({ src, alt, shareUrl, height = 460, labels }: PanoViewerProps) {
  // Horizontal pan position, 0–100 (% of background-position-x).
  const [pos, setPos] = useState(50);
  const [dragging, setDragging] = useState(false);
  const [copied, setCopied] = useState(false);
  const frameRef = useRef<HTMLDivElement | null>(null);
  const drag = useRef<{ startX: number; startPos: number } | null>(null);
  const driftDir = useRef(1);
  const interacting = useRef(false);

  // Idle auto-drift — pauses while the user is interacting.
  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = now - last;
      last = now;
      if (!interacting.current) {
        setPos((prev) => {
          let next = prev + driftDir.current * dt * 0.004;
          if (next >= 100) { next = 100; driftDir.current = -1; }
          else if (next <= 0) { next = 0; driftDir.current = 1; }
          return next;
        });
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const onPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    interacting.current = true;
    setDragging(true);
    drag.current = { startX: e.clientX, startPos: pos };
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
  }, [pos]);

  const onPointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!drag.current || !frameRef.current) return;
    const w = frameRef.current.clientWidth || 1;
    // Drag right → reveal the left of the scene (natural panning).
    const delta = ((e.clientX - drag.current.startX) / w) * 100;
    let next = drag.current.startPos - delta;
    if (next < 0) next = 0;
    if (next > 100) next = 100;
    setPos(next);
  }, []);

  const endDrag = useCallback(() => {
    drag.current = null;
    setDragging(false);
    // Resume drift shortly after release.
    window.setTimeout(() => { interacting.current = false; }, 900);
  }, []);

  const onCopy = useCallback(async () => {
    const url = shareUrl || (typeof window !== 'undefined' ? window.location.href : '');
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        const ta = document.createElement('textarea');
        ta.value = url;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      /* clipboard blocked — no-op */
    }
  }, [shareUrl]);

  return (
    <div
      ref={frameRef}
      style={{
        position: 'relative',
        height,
        borderRadius: 'var(--radius-xl, 20px)',
        overflow: 'hidden',
        border: '1px solid var(--bd-gold, rgba(200,150,26,.35))',
        background: 'var(--bg-e2, #14100a)',
        cursor: dragging ? 'grabbing' : 'grab',
        touchAction: 'pan-y',
        userSelect: 'none',
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onPointerLeave={() => { if (drag.current) endDrag(); }}
    >
      {/* Panorama plate — zoomed past the frame so there is room to pan. */}
      <div
        aria-label={alt}
        role="img"
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url("${src}")`,
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'auto 150%',
          backgroundPositionY: '50%',
          backgroundPositionX: `${pos}%`,
          transition: dragging ? 'none' : 'background-position-x 120ms linear',
          willChange: 'background-position',
        }}
      />
      {/* Cinematic edge vignette. */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(90deg, rgba(0,0,0,.45), transparent 18%, transparent 82%, rgba(0,0,0,.45)), linear-gradient(0deg, rgba(0,0,0,.5), transparent 45%)',
          pointerEvents: 'none',
        }}
      />
      {/* 360° badge. */}
      <div
        aria-hidden
        style={{
          position: 'absolute', top: 16, insetInlineStart: 16,
          display: 'inline-flex', alignItems: 'center', gap: 7,
          padding: '7px 12px', borderRadius: 999,
          background: 'rgba(10,8,4,.62)', backdropFilter: 'blur(6px)',
          border: '1px solid var(--bd-gold, rgba(200,150,26,.5))',
          color: 'var(--gold-lt, #e8c877)', fontSize: 12, fontWeight: 700, letterSpacing: '.06em',
        }}
      >
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3a9 5 0 1 0 0 10 9 5 0 1 0 0-10" />
          <path d="M3 8a9 5 0 0 0 18 0" opacity=".5" />
          <path d="M8 5.5 12 2l4 3.5M8 18.5 12 22l4-3.5" />
        </svg>
        {labels.badge}
      </div>
      {/* Drag hint. */}
      <div
        aria-hidden
        style={{
          position: 'absolute', bottom: 16, insetInlineStart: 16,
          display: dragging ? 'none' : 'inline-flex', alignItems: 'center', gap: 8,
          padding: '7px 12px', borderRadius: 999,
          background: 'rgba(10,8,4,.55)', backdropFilter: 'blur(6px)',
          color: 'rgba(255,255,255,.9)', fontSize: 12.5, fontWeight: 600,
        }}
      >
        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M8 9 4 12l4 3M16 9l4 3-4 3M4 12h16" />
        </svg>
        {labels.hint}
      </div>
      {/* Copy-link action (share the tour — commercial use). */}
      <button
        type="button"
        onClick={onCopy}
        onPointerDown={(e) => e.stopPropagation()}
        style={{
          position: 'absolute', bottom: 16, insetInlineEnd: 16,
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '9px 14px', borderRadius: 999, cursor: 'pointer',
          background: copied ? 'var(--gold, #C8961A)' : 'rgba(10,8,4,.62)',
          backdropFilter: 'blur(6px)',
          border: '1px solid var(--bd-gold, rgba(200,150,26,.5))',
          color: copied ? '#1a1206' : '#fff', fontSize: 13, fontWeight: 700,
          transition: 'background 160ms ease, color 160ms ease',
        }}
        aria-live="polite"
      >
        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          {copied ? (
            <path d="M20 6 9 17l-5-5" />
          ) : (
            <>
              <path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1" />
              <path d="M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1" />
            </>
          )}
        </svg>
        {copied ? labels.copied : labels.copy}
      </button>
    </div>
  );
}
