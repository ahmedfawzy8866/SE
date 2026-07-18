'use client';

/**
 * VirtualTourViewer — embeds a 3D virtual tour via iframe.
 * ────────────────────────────────────────────────────────────────────────────
 * Migrated from Sierra-Estates-Final's components/virtual-tour/VirtualTourViewer.tsx.
 *
 * Supports any iframe-embeddable 3D tour provider:
 *   - listing3d.com  (the source of the seed tour)
 *   - matterport.com
 *   - kuula.co
 *   - 3dvista.com
 *   - p3d.in
 *   - any other provider that exposes a public embed URL
 *
 * Features:
 *   - Lazy-loads the iframe only when the user clicks play (saves bandwidth)
 *   - Optional fullscreen button (top-right)
 *   - Loading shimmer while the iframe is fetching
 *   - Respects prefers-reduced-motion
 *   - Mobile-responsive aspect ratio (default 16:9, configurable)
 *   - Scoped inline styles (no parent CSS dependency)
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { Play, Maximize2, X, Loader2, ExternalLink } from 'lucide-react';

export interface VirtualTourViewerProps {
  src: string;
  poster?: string;
  title: string;
  subtitle?: string;
  aspectRatio?: string;
  autoLoad?: boolean;
  showExternalLink?: boolean;
  className?: string;
}

export default function VirtualTourViewer({
  src,
  poster,
  title,
  subtitle,
  aspectRatio = '16 / 9',
  autoLoad = false,
  showExternalLink = true,
  className = '',
}: VirtualTourViewerProps) {
  const [loaded, setLoaded] = useState(false);
  const [activated, setActivated] = useState(autoLoad);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const enterFullscreen = useCallback(async () => {
    const el = containerRef.current;
    if (!el) return;
    try {
      if (el.requestFullscreen) await el.requestFullscreen();
      else if ((el as any).webkitRequestFullscreen) (el as any).webkitRequestFullscreen();
    } catch (err) {
       
      console.warn('[VirtualTourViewer] fullscreen failed:', err);
    }
  }, []);

  const exitFullscreen = useCallback(async () => {
    try {
      if (document.exitFullscreen) await document.exitFullscreen();
      else if ((document as any).webkitExitFullscreen) (document as any).webkitExitFullscreen();
    } catch (err) {
       
      console.warn('[VirtualTourViewer] exit fullscreen failed:', err);
    }
  }, []);

  useEffect(() => {
    const onFsChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', onFsChange);
    document.addEventListener('webkitfullscreenchange', onFsChange);
    return () => {
      document.removeEventListener('fullscreenchange', onFsChange);
      document.removeEventListener('webkitfullscreenchange', onFsChange);
    };
  }, []);

  const handleActivate = useCallback(() => setActivated(true), []);

  return (
    <div
      ref={containerRef}
      className={`vtv-wrapper${isFullscreen ? ' vtv-fullscreen' : ''}${className ? ` ${className}` : ''}`}
      style={{ ['--vtv-ratio' as string]: aspectRatio }}
    >
      <div className="vtv-frame">
        {activated ? (
          <>
            {!loaded && (
              <div className="vtv-loading" aria-live="polite">
                <Loader2 size={32} className="vtv-spinner" />
                <span>Loading 3D tour…</span>
              </div>
            )}
            <iframe
              src={src}
              title={title}
              className={`vtv-iframe${loaded ? ' vtv-iframe-loaded' : ''}`}
              onLoad={() => setLoaded(true)}
              allow="fullscreen; accelerometer; gyroscope; magnetometer; vr; xr-spatial-tracking"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
              loading="lazy"
            />
          </>
        ) : (
          <button
            type="button"
            className="vtv-poster"
            onClick={handleActivate}
            aria-label={`Play 3D virtual tour: ${title}`}
            style={poster ? { backgroundImage: `url(${poster})` } : undefined}
          >
            <div className="vtv-poster-scrim" />
            <div className="vtv-poster-body">
              <div className="vtv-poster-play">
                <Play size={28} fill="currentColor" />
              </div>
              <div className="vtv-poster-text">
                <div className="vtv-poster-eyebrow">3D VIRTUAL TOUR</div>
                <div className="vtv-poster-title">{title}</div>
              </div>
            </div>
            {subtitle && <div className="vtv-poster-sub">{subtitle}</div>}
          </button>
        )}

        {activated && loaded && (
          <button
            type="button"
            className="vtv-fs-btn"
            onClick={isFullscreen ? exitFullscreen : enterFullscreen}
            aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <X size={16} /> : <Maximize2 size={16} />}
          </button>
        )}
      </div>

      {showExternalLink && (
        <a href={src} target="_blank" rel="noopener noreferrer" className="vtv-external">
          <ExternalLink size={12} /> Open tour in new tab
        </a>
      )}

      <style>{`
        .vtv-wrapper {
          display: block;
          width: 100%;
          position: relative;
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
          color: #0d2136;
        }
        .vtv-frame {
          position: relative;
          width: 100%;
          aspect-ratio: var(--vtv-ratio, 16 / 9);
          background: #0a1622;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 12px 34px rgba(13, 33, 54, 0.10);
        }
        .vtv-fullscreen .vtv-frame {
          border-radius: 0;
          aspect-ratio: auto;
          position: fixed;
          inset: 0;
          z-index: 9999;
          box-shadow: none;
        }
        .vtv-iframe {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          border: 0;
          opacity: 0;
          transition: opacity 0.4s ease;
          background: #0a1622;
        }
        .vtv-iframe-loaded { opacity: 1; }
        .vtv-loading {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 14px;
          color: rgba(255, 255, 255, 0.85);
          font-size: 14px;
          font-weight: 600;
          background: linear-gradient(135deg, #0a1622 0%, #002b4b 100%);
          z-index: 1;
        }
        .vtv-spinner { animation: vtv-spin 1s linear infinite; }
        @keyframes vtv-spin { to { transform: rotate(360deg); } }
        .vtv-poster {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          border: 0;
          padding: 0;
          cursor: pointer;
          background-color: #0a1622;
          background-size: cover;
          background-position: center;
          display: flex;
          align-items: flex-end;
          justify-content: flex-start;
          transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .vtv-poster:hover { transform: scale(1.01); }
        .vtv-poster-scrim {
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(0,25,45,0) 30%, rgba(0,25,45,0.85) 100%);
          z-index: 1;
        }
        .vtv-poster-body {
          position: relative;
          z-index: 2;
          padding: 24px 28px;
          display: flex;
          align-items: center;
          gap: 16px;
          color: #fff;
        }
        .vtv-poster-play {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: #00aeff;
          color: #fff;
          display: grid;
          place-items: center;
          flex: none;
          box-shadow: 0 8px 24px rgba(0, 174, 255, 0.45);
          transition: transform 0.25s ease;
        }
        .vtv-poster:hover .vtv-poster-play { transform: scale(1.08); }
        .vtv-poster-eyebrow {
          font-family: 'JetBrains Mono', ui-monospace, monospace;
          font-size: 10.5px;
          font-weight: 700;
          letter-spacing: 0.16em;
          color: #8fe1ff;
          margin-bottom: 6px;
        }
        .vtv-poster-title {
          font-size: 18px;
          font-weight: 700;
          line-height: 1.3;
          max-width: 540px;
        }
        .vtv-poster-sub {
          position: absolute;
          top: 18px;
          right: 22px;
          z-index: 2;
          font-family: 'JetBrains Mono', ui-monospace, monospace;
          font-size: 11px;
          font-weight: 600;
          color: #bfeaff;
          background: rgba(0, 43, 75, 0.6);
          padding: 5px 10px;
          border-radius: 5px;
        }
        .vtv-fs-btn {
          position: absolute;
          top: 12px;
          right: 12px;
          z-index: 3;
          background: rgba(0, 43, 75, 0.78);
          color: #fff;
          border: 0;
          border-radius: 8px;
          width: 36px;
          height: 36px;
          cursor: pointer;
          display: grid;
          place-items: center;
          transition: background 0.2s ease;
        }
        .vtv-fs-btn:hover { background: rgba(0, 43, 75, 1); }
        .vtv-external {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          margin-top: 10px;
          font-size: 12.5px;
          font-weight: 600;
          color: #00aeff;
          text-decoration: none;
        }
        .vtv-external:hover { text-decoration: underline; }

        @media (max-width: 640px) {
          .vtv-poster-body { padding: 16px 18px; gap: 12px; }
          .vtv-poster-play { width: 44px; height: 44px; }
          .vtv-poster-title { font-size: 15px; }
          .vtv-poster-sub { top: 12px; right: 14px; font-size: 10px; }
        }

        @media (prefers-reduced-motion: reduce) {
          .vtv-spinner { animation: none; }
          .vtv-poster, .vtv-poster-play, .vtv-iframe { transition: none !important; }
        }
      `}</style>
    </div>
  );
}
