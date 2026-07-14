'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import * as THREE from 'three';

const ROOMS = [
  { name: 'Grand Living', icon: '🛋️', img: '/tour/grand-living.jpg',
    hotspots: [{ lon: 60, lat: 0, label: '→ Fireplace Lounge', room: 1 }, { lon: -90, lat: 0, label: '→ White Reception', room: 2 }] },
  { name: 'Fireplace Lounge', icon: '🔥', img: '/tour/fireplace-lounge.jpg',
    hotspots: [{ lon: 120, lat: 0, label: '→ Grand Living', room: 0 }, { lon: -60, lat: 0, label: '→ Boho Living', room: 3 }] },
  { name: 'White Reception', icon: '🪑', img: '/tour/white-reception.jpg',
    hotspots: [{ lon: 80, lat: 0, label: '→ Home Office', room: 5 }, { lon: -100, lat: 0, label: '→ Grand Living', room: 0 }] },
  { name: 'Boho Living', icon: '🌿', img: '/tour/boho-living.jpg',
    hotspots: [{ lon: 70, lat: 0, label: '→ Attic Retreat', room: 4 }, { lon: -80, lat: 0, label: '→ Fireplace Lounge', room: 1 }] },
  { name: 'Attic Retreat', icon: '🏔️', img: '/tour/attic-retreat.jpg',
    hotspots: [{ lon: 90, lat: 0, label: "→ Kids' Loft", room: 8 }, { lon: -70, lat: 0, label: '→ Boho Living', room: 3 }] },
  { name: 'Home Office', icon: '💻', img: '/tour/home-office.jpg',
    hotspots: [{ lon: 60, lat: 0, label: '→ Botanical Bedroom', room: 6 }, { lon: -90, lat: 0, label: '→ White Reception', room: 2 }] },
  { name: 'Botanical Bedroom', icon: '🛏️', img: '/tour/botanical-bedroom.jpg',
    hotspots: [{ lon: 80, lat: 0, label: '→ Turquoise Suite', room: 7 }, { lon: -80, lat: 0, label: '→ Home Office', room: 5 }] },
  { name: 'Turquoise Suite', icon: '🛌', img: '/tour/turquoise-suite.jpg',
    hotspots: [{ lon: 70, lat: 0, label: "→ Kids' Loft", room: 8 }, { lon: -90, lat: 0, label: '→ Botanical Bedroom', room: 6 }] },
  { name: "Kids' Loft", icon: '🧸', img: '/tour/kids-loft.jpg',
    hotspots: [{ lon: 60, lat: 0, label: '→ Attic Retreat', room: 4 }, { lon: -100, lat: 0, label: '→ Turquoise Suite', room: 7 }] },
];

const BEARINGS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];

export default function VirtualTourPortal() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hotspotsRef = useRef<Array<HTMLDivElement | null>>([]);
  const [currentRoom, setCurrentRoom] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);
  const [autoRotate, setAutoRotate] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [fov, setFov] = useState(75);
  const [compassDir, setCompassDir] = useState('N');
  const [compassRot, setCompassRot] = useState(0);

  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const sphereRef = useRef<THREE.Mesh | null>(null);
  const materialRef = useRef<THREE.MeshBasicMaterial | null>(null);
  const texCache = useRef<Record<number, THREE.Texture>>({});

  const stateRef = useRef({
    lon: 0, lat: 0,
    tLon: 0, tLat: 0,
    isDown: false,
    sx: 0, sy: 0,
    pLon: 0, pLat: 0,
    autoRotate: false,
    fov: 75,
    keys: {} as Record<string, boolean>,
  });

  // Sync state refs with react states to use inside animate loop
  useEffect(() => {
    stateRef.current.autoRotate = autoRotate;
  }, [autoRotate]);

  useEffect(() => {
    stateRef.current.fov = fov;
  }, [fov]);

  // Three.js Scene Setup & Loop
  useEffect(() => {
    if (!canvasRef.current) return;

    const width = window.innerWidth;
    const height = window.innerHeight;

    const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    rendererRef.current = renderer;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(75, width / height, 1, 2000);
    camera.position.set(0, 0, 0.001);
    cameraRef.current = camera;

    const geo = new THREE.SphereGeometry(500, 72, 48);
    geo.scale(-1, 1, 1);

    const mat = new THREE.MeshBasicMaterial({ map: null, side: THREE.FrontSide });
    materialRef.current = mat;

    const sphere = new THREE.Mesh(geo, mat);
    scene.add(sphere);
    sphereRef.current = sphere;

    // Load initial room
    loadRoom(currentRoom);

    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // Process keyboard navigation keys
      const spd = 1.8;
      const keys = stateRef.current.keys;
      if (keys['ArrowLeft'] || keys['a'] || keys['A']) stateRef.current.tLon -= spd;
      if (keys['ArrowRight'] || keys['d'] || keys['D']) stateRef.current.tLon += spd;
      if (keys['ArrowUp'] || keys['w'] || keys['W']) stateRef.current.tLat = Math.max(-85, stateRef.current.tLat - spd);
      if (keys['ArrowDown'] || keys['s'] || keys['S']) stateRef.current.tLat = Math.min(85, stateRef.current.tLat + spd);

      if (stateRef.current.autoRotate && !stateRef.current.isDown) {
        stateRef.current.tLon += 0.1;
      }

      stateRef.current.lon += (stateRef.current.tLon - stateRef.current.lon) * 0.085;
      stateRef.current.lat += (stateRef.current.tLat - stateRef.current.lat) * 0.085;
      stateRef.current.lat = Math.max(-85, Math.min(85, stateRef.current.lat));

      const phi = THREE.MathUtils.degToRad(90 - stateRef.current.lat);
      const theta = THREE.MathUtils.degToRad(stateRef.current.lon);

      camera.lookAt(
        500 * Math.sin(phi) * Math.cos(theta),
        500 * Math.cos(phi),
        500 * Math.sin(phi) * Math.sin(theta)
      );

      // Project Hotspots
      hotspotsRef.current.forEach((el, index) => {
        if (!el) return;
        const h = ROOMS[currentRoom]?.hotspots[index];
        if (!h) return;

        const hPhi = THREE.MathUtils.degToRad(90 - h.lat);
        const hTheta = THREE.MathUtils.degToRad(h.lon);
        const v = new THREE.Vector3(
          500 * Math.sin(hPhi) * Math.cos(hTheta),
          500 * Math.cos(hPhi),
          500 * Math.sin(hPhi) * Math.sin(hTheta)
        );
        const p = v.clone().project(camera);
        const inFront = p.z < 1.0;

        el.style.opacity = inFront ? '1' : '0';
        el.style.pointerEvents = inFront ? 'all' : 'none';
        if (inFront) {
          el.style.left = ((p.x + 1) / 2 * window.innerWidth) + 'px';
          el.style.top = (-(p.y - 1) / 2 * window.innerHeight) + 'px';
        }
      });

      // Update Compass Heading
      const norm = ((stateRef.current.lon % 360) + 360) % 360;
      setCompassRot(-norm);
      setCompassDir(BEARINGS[Math.round(norm / 45) % 8]);

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    const handleKeyDown = (e: KeyboardEvent) => {
      stateRef.current.keys[e.key] = true;
      if (e.code === 'Space') {
        e.preventDefault();
        setAutoRotate((a) => !a);
      }
      if (e.key === 'f' || e.key === 'F') {
        toggleFullscreen();
      }
      if (e.key === 'i' || e.key === 'I') {
        setInfoOpen((io) => !io);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      delete stateRef.current.keys[e.key];
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      renderer.dispose();
    };
  }, [currentRoom]);

  // Pointer Interaction Handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    stateRef.current.isDown = true;
    stateRef.current.sx = e.clientX;
    stateRef.current.sy = e.clientY;
    stateRef.current.pLon = stateRef.current.tLon;
    stateRef.current.pLat = stateRef.current.tLat;
    if (canvasRef.current) {
      canvasRef.current.setPointerCapture(e.pointerId);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!stateRef.current.isDown) return;
    stateRef.current.tLon = stateRef.current.pLon - (e.clientX - stateRef.current.sx) * 0.22;
    stateRef.current.tLat = Math.max(-85, Math.min(85, stateRef.current.pLat + (e.clientY - stateRef.current.sy) * 0.22));
  };

  const handlePointerUp = () => {
    stateRef.current.isDown = false;
  };

  const handleWheel = (e: React.WheelEvent) => {
    const nextFov = Math.max(35, Math.min(105, stateRef.current.fov + e.deltaY * 0.045));
    setFov(nextFov);
    if (cameraRef.current) {
      cameraRef.current.fov = nextFov;
      cameraRef.current.updateProjectionMatrix();
    }
  };

  // Pinch Zoom for mobile
  const lastPinch = useRef(0);
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      lastPinch.current = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const d = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const nextFov = Math.max(35, Math.min(105, stateRef.current.fov + (lastPinch.current - d) * 0.06));
      setFov(nextFov);
      if (cameraRef.current) {
        cameraRef.current.fov = nextFov;
        cameraRef.current.updateProjectionMatrix();
      }
      lastPinch.current = d;
    }
  };

  // Load Panorama Texture
  const loadRoom = (idx: number) => {
    setLoading(true);
    setLoadProgress(0);

    if (texCache.current[idx]) {
      if (materialRef.current) {
        materialRef.current.map = texCache.current[idx];
        materialRef.current.needsUpdate = true;
      }
      setLoading(false);
      return;
    }

    const loader = new THREE.TextureLoader();
    loader.crossOrigin = 'anonymous';

    let prog = 0;
    const interval = setInterval(() => {
      prog = Math.min(prog + Math.random() * 12 + 3, 90);
      setLoadProgress(prog);
    }, 100);

    loader.load(
      ROOMS[idx].img,
      (tex) => {
        clearInterval(interval);
        setLoadProgress(100);
        tex.minFilter = THREE.LinearFilter;
        tex.generateMipmaps = false;

        if (rendererRef.current) {
          try {
            tex.anisotropy = rendererRef.current.capabilities.getMaxAnisotropy();
          } catch {}
        }
        tex.colorSpace = THREE.SRGBColorSpace;
        texCache.current[idx] = tex;

        if (materialRef.current) {
          materialRef.current.map = tex;
          materialRef.current.needsUpdate = true;
        }

        setTimeout(() => {
          setLoading(false);
        }, 350);
      },
      undefined,
      () => {
        clearInterval(interval);
        setLoading(false);
      }
    );
  };

  // Switch Room Action
  const switchRoom = (idx: number) => {
    if (idx === currentRoom) return;
    setCurrentRoom(idx);
    stateRef.current.tLon = 0;
    stateRef.current.tLat = 0;
  };

  const nudge = (dLon: number, dLat: number) => {
    stateRef.current.tLon += dLon;
    stateRef.current.tLat = Math.max(-85, Math.min(85, stateRef.current.tLat + dLat));
  };

  const resetView = () => {
    stateRef.current.tLon = 0;
    stateRef.current.tLat = 0;
    setFov(75);
    if (cameraRef.current) {
      cameraRef.current.fov = 75;
      cameraRef.current.updateProjectionMatrix();
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setFullscreen(true);
    } else {
      document.exitFullscreen();
      setFullscreen(false);
    }
  };

  // Preload other rooms
  useEffect(() => {
    if (loading) return;

    const timeout = setTimeout(() => {
      const preload = new THREE.TextureLoader();
      preload.crossOrigin = 'anonymous';
      ROOMS.forEach((r, i) => {
        if (i !== currentRoom && !texCache.current[i]) {
          preload.load(r.img, (tex) => {
            tex.minFilter = THREE.LinearFilter;
            tex.generateMipmaps = false;
            texCache.current[i] = tex;
          });
        }
      });
    }, 2000);

    return () => clearTimeout(timeout);
  }, [loading, currentRoom]);

  return (
    <div className="relative w-full h-full bg-[#07111E] overflow-hidden select-none text-[#F4F0E8] font-sans">
      <style>{`
        @keyframes hsPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(200, 150, 26, 0.45); }
          50% { box-shadow: 0 0 0 12px rgba(200, 150, 26, 0); }
        }
        @keyframes fadeOutHint {
          to { opacity: 0; visibility: hidden; }
        }
      `}</style>

      {/* Loading overlay */}
      {loading && (
        <div className="fixed inset-0 z-50 bg-[#07111E] flex flex-col items-center justify-center transition-opacity duration-500">
          <div className="font-serif text-4xl text-[#C9A24D] mb-2 tracking-wide animate-pulse">Sierra Estates</div>
          <div className="font-mono text-[10px] tracking-[0.25em] text-[#C9A24D]/50 uppercase mb-8">Virtual Tour · New Cairo</div>
          <div className="w-[200px] h-[2px] bg-[#C9A24D]/15 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#C9A24D] to-[#E9C176] transition-all duration-200 rounded-full"
              style={{ width: `${loadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-grab active:cursor-grabbing block"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
      />

      {/* Hotspots container */}
      <div className="absolute inset-0 pointer-events-none z-10">
        {ROOMS[currentRoom]?.hotspots.map((h, i) => (
          <div
            key={i}
            ref={(el) => {
              if (hotspotsRef.current) hotspotsRef.current[i] = el;
            }}
            className="absolute cursor-pointer transition-opacity duration-300 pointer-events-auto"
            style={{ transform: 'translate(-50%, -50%)' }}
            onClick={() => switchRoom(h.room)}
          >
            <div className="relative group">
              <div className="w-[44px] h-[44px] rounded-full border-2 border-[#C9A24D] bg-[#0A1628]/85 flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:border-[#E9C176]">
                <span className="text-base select-none">🚪</span>
              </div>
              <div className="absolute bottom-[-32px] left-1/2 -translate-x-1/2 whitespace-nowrap bg-[#0A1628]/90 text-[10px] font-mono text-[#E9C176] border border-[#C9A24D]/25 px-2 py-0.5 rounded shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                {h.label}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Crosshair indicator */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none w-5 h-5 opacity-30 z-10">
        <div className="absolute top-0 bottom-0 left-[9px] right-[10px] bg-[#C9A24D]" />
        <div className="absolute left-0 right-0 top-[9px] bottom-[10px] bg-[#C9A24D]" />
      </div>

      {/* Floating Header */}
      <header className="absolute top-0 left-0 right-0 z-20 h-16 flex items-center px-6 bg-gradient-to-b from-[#07111E]/95 to-transparent pointer-events-none select-none">
        <Link href="/" className="pointer-events-auto flex items-center gap-3 decoration-none">
          <div className="w-8 h-8 bg-gradient-to-br from-[#C9A24D] to-[#E9C176] rounded-xl flex items-center justify-center text-[#0A1628] font-serif text-lg font-bold">
            S
          </div>
          <span className="font-mono text-xs font-bold tracking-[0.2em] text-[#E9C176] uppercase">Sierra Estates</span>
        </Link>
        <div className="ml-6 font-serif text-xl sm:text-2xl text-white font-light tracking-wide">
          {ROOMS[currentRoom].name}
        </div>
        <div className="ml-auto flex items-center gap-2 pointer-events-auto">
          <button
            onClick={() => setInfoOpen(!infoOpen)}
            className={`px-3 py-1.5 bg-white/5 border border-white/10 hover:bg-[#C9A24D]/20 hover:border-[#C9A24D]/40 hover:text-[#E9C176] rounded-full text-xs font-medium transition-all ${
              infoOpen ? 'bg-[#C9A24D]/25 border-[#C9A24D] text-[#E9C176]' : ''
            }`}
          >
            ℹ️ Property
          </button>
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            className={`px-3 py-1.5 bg-white/5 border border-white/10 hover:bg-[#C9A24D]/20 hover:border-[#C9A24D]/40 hover:text-[#E9C176] rounded-full text-xs font-medium transition-all ${
              autoRotate ? 'bg-[#C9A24D]/25 border-[#C9A24D] text-[#E9C176]' : ''
            }`}
          >
            {autoRotate ? '⏸ Auto' : '▶ Auto'}
          </button>
          <button
            onClick={toggleFullscreen}
            className="px-3 py-1.5 bg-white/5 border border-white/10 hover:bg-[#C9A24D]/20 hover:border-[#C9A24D]/40 hover:text-[#E9C176] rounded-full text-xs font-medium transition-all"
          >
            {fullscreen ? '⛶ Exit Full' : '⛶ Fullscreen'}
          </button>
          <Link
            href="/"
            className="px-3 py-1.5 bg-[#C9A24D]/20 hover:bg-[#C9A24D]/40 border border-[#C9A24D]/35 hover:border-[#C9A24D]/60 text-[#E9C176] rounded-full text-xs font-medium transition-all"
          >
            ✕ Exit
          </Link>
        </div>
      </header>

      {/* Property Information Panel */}
      {infoOpen && (
        <div className="absolute left-6 top-20 z-20 w-64 bg-[#0A1628]/95 backdrop-blur-md border border-[#C9A24D]/30 rounded-2xl p-5 shadow-2xl transition-all duration-300 animate-[fadeInHint_0.4s_ease]">
          <div className="font-serif text-xl font-bold text-white mb-1">Villa Émeraude</div>
          <div className="font-mono text-[8px] text-[#C9A24D] tracking-[0.15em] uppercase mb-4">
            Hyde Park · New Cairo
          </div>
          <div className="grid grid-cols-2 gap-2 mb-4">
            <div className="bg-white/5 border border-white/5 rounded-xl p-2 text-center">
              <div className="font-mono text-sm font-bold text-[#E9C176]">6</div>
              <div className="text-[8px] text-white/40 uppercase tracking-widest mt-0.5">Bedrooms</div>
            </div>
            <div className="bg-white/5 border border-white/5 rounded-xl p-2 text-center">
              <div className="font-mono text-sm font-bold text-[#E9C176]">450m²</div>
              <div className="text-[8px] text-white/40 uppercase tracking-widest mt-0.5">Area</div>
            </div>
            <div className="bg-white/5 border border-white/5 rounded-xl p-2 text-center">
              <div className="font-mono text-sm font-bold text-[#E9C176]">Private</div>
              <div className="text-[8px] text-white/40 uppercase tracking-widest mt-0.5">Pool</div>
            </div>
            <div className="bg-white/5 border border-white/5 rounded-xl p-2 text-center">
              <div className="font-mono text-sm font-bold text-[#E9C176]">9.7</div>
              <div className="text-[8px] text-white/40 uppercase tracking-widest mt-0.5">AI Score</div>
            </div>
          </div>
          <div className="font-mono text-base font-bold text-[#C9A24D] mb-2">EGP 35,000,000</div>
          <div className="text-xs text-white/60 leading-relaxed mb-4">
            🤖 AI Match: 97% · Recommended for Gulf investors seeking capital growth and prime location.
          </div>
          <Link
            href="/#concierge"
            className="block w-full py-2.5 bg-gradient-to-r from-[#C9A24D] to-[#E9C176] hover:opacity-90 text-[#0A1628] font-bold text-xs uppercase tracking-wider text-center rounded-xl transition-all"
          >
            Request Viewing
          </Link>
        </div>
      )}

      {/* Control overlay */}
      <div className="absolute right-6 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-1.5">
        <button
          onClick={() => {
            const nextFov = Math.max(35, stateRef.current.fov - 10);
            setFov(nextFov);
            if (cameraRef.current) {
              cameraRef.current.fov = nextFov;
              cameraRef.current.updateProjectionMatrix();
            }
          }}
          title="Zoom In"
          className="w-10 h-10 bg-[#07111E]/85 backdrop-blur border border-white/10 hover:bg-[#C9A24D]/20 hover:border-[#C9A24D]/40 hover:text-[#E9C176] rounded-xl flex items-center justify-center font-bold text-lg transition-all"
        >
          ＋
        </button>
        <button
          onClick={() => {
            const nextFov = Math.min(105, stateRef.current.fov + 10);
            setFov(nextFov);
            if (cameraRef.current) {
              cameraRef.current.fov = nextFov;
              cameraRef.current.updateProjectionMatrix();
            }
          }}
          title="Zoom Out"
          className="w-10 h-10 bg-[#07111E]/85 backdrop-blur border border-white/10 hover:bg-[#C9A24D]/20 hover:border-[#C9A24D]/40 hover:text-[#E9C176] rounded-xl flex items-center justify-center font-bold text-lg transition-all"
        >
          －
        </button>
        <div className="w-8 h-[1px] bg-white/10 my-1 self-center" />
        <button
          onClick={() => nudge(0, -15)}
          title="Look Up"
          className="w-10 h-10 bg-[#07111E]/85 backdrop-blur border border-white/10 hover:bg-[#C9A24D]/20 hover:border-[#C9A24D]/40 hover:text-[#E9C176] rounded-xl flex items-center justify-center transition-all"
        >
          ↑
        </button>
        <button
          onClick={() => nudge(0, 15)}
          title="Look Down"
          className="w-10 h-10 bg-[#07111E]/85 backdrop-blur border border-white/10 hover:bg-[#C9A24D]/20 hover:border-[#C9A24D]/40 hover:text-[#E9C176] rounded-xl flex items-center justify-center transition-all"
        >
          ↓
        </button>
        <button
          onClick={() => nudge(-20, 0)}
          title="Look Left"
          className="w-10 h-10 bg-[#07111E]/85 backdrop-blur border border-white/10 hover:bg-[#C9A24D]/20 hover:border-[#C9A24D]/40 hover:text-[#E9C176] rounded-xl flex items-center justify-center transition-all"
        >
          ←
        </button>
        <button
          onClick={() => nudge(20, 0)}
          title="Look Right"
          className="w-10 h-10 bg-[#07111E]/85 backdrop-blur border border-white/10 hover:bg-[#C9A24D]/20 hover:border-[#C9A24D]/40 hover:text-[#E9C176] rounded-xl flex items-center justify-center transition-all"
        >
          →
        </button>
        <div className="w-8 h-[1px] bg-white/10 my-1 self-center" />
        <button
          onClick={resetView}
          title="Reset View"
          className="w-10 h-10 bg-[#07111E]/85 backdrop-blur border border-white/10 hover:bg-[#C9A24D]/20 hover:border-[#C9A24D]/40 hover:text-[#E9C176] rounded-xl flex items-center justify-center transition-all"
        >
          ⊙
        </button>
      </div>

      {/* Compass overlay */}
      <div className="absolute left-6 bottom-24 z-20 w-14 h-14 bg-[#07111E]/85 backdrop-blur border border-[#C9A24D]/35 rounded-full flex flex-col items-center justify-center gap-0.5 shadow-lg">
        <div
          className="text-2xl transition-transform duration-100 ease-linear leading-none"
          style={{ transform: `rotate(${compassRot}deg)` }}
        >
          🧭
        </div>
        <div className="font-mono text-[8px] text-[#C9A24D]/70 tracking-wider uppercase font-semibold">
          {compassDir}
        </div>
      </div>

      {/* FOV Indicator */}
      <div className="absolute left-6 bottom-40 z-20 bg-[#07111E]/85 backdrop-blur border border-white/10 rounded-lg px-2.5 py-1.5 font-mono text-[9px] text-[#E9C176]/70 shadow-md">
        FOV <span>{Math.round(fov)}°</span>
      </div>

      {/* Room Bar */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-1.5 items-center bg-[#07111E]/90 backdrop-filter backdrop-blur-md border border-[#C9A24D]/20 rounded-full p-2 max-w-[90vw] overflow-x-auto scrollbar-none shadow-2xl">
        {ROOMS.map((r, i) => (
          <button
            key={i}
            onClick={() => switchRoom(i)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border border-transparent ${
              i === currentRoom
                ? 'bg-gradient-to-r from-[#C9A24D] to-[#E9C176] text-[#0A1628]'
                : 'text-white/60 hover:text-[#E9C176] hover:bg-white/5'
            }`}
          >
            <span>{r.icon}</span>
            <span className="hidden sm:inline">{r.name}</span>
          </button>
        ))}
      </div>

      {/* Drag hint overlay */}
      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-20 bg-[#07111E]/80 backdrop-blur border border-white/10 rounded-full px-4 py-1.5 text-xs text-white/70 flex items-center gap-2 animate-[fadeOutHint_1.2s_ease_3.5s_forwards] pointer-events-none shadow-md">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="8" r="4" />
          <path d="M8 14v7M16 14v7" />
        </svg>
        Drag to look around · Scroll to zoom
      </div>

      {/* Key shortcuts hint */}
      <div className="absolute left-6 bottom-6 z-20 font-mono text-[8px] text-[#C9A24D]/40 leading-relaxed hidden md:block">
        WASD / ↑↓←→ navigate<br />
        SCROLL zoom<br />
        SPACE auto-rotate<br />
        F fullscreen<br />
        [ ] prev / next room<br />
        I property info
      </div>
    </div>
  );
}
