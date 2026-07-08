# ❌ Desktop-Only 3D & Responsive Database-Driven Delivery

**Why bad**: Most web traffic is mobile. 3D experiences that run beautifully on a desktop RTX card will lag, drain the battery, or outright crash on low-end mobile devices, leading to frustrated users and high bounce rates.

**Instead**: Wire your 3D assets to a robust database schema and asset-processing workflow that enables dynamic loading, mobile quality degradation (LOD), and graceful static fallbacks.

---

## 💾 Database Design Schema

To support responsive 3D assets, design your database schema (relational or document-based) to store multiple versions of each 3D asset/room:

```typescript
interface PanoramicTourAsset {
  roomId: string;
  roomName: string;
  // High-resolution texture for desktop (e.g. 4096x2048)
  desktopUrl: string;
  // Compressed low-resolution texture for mobile (e.g. 1024x512)
  mobileUrl: string;
  // Static 2D image fallback for unsupported / low-end devices
  staticFallbackUrl: string;
}
```

---

## ⚙️ Ingestion & Optimization Workflow

Integrate asset processing into your backend automation workflow:
1. **Trigger**: An admin uploads a raw panorama or 3D GLTF model.
2. **Workflow Actions**:
   - Run compression tools (e.g. `gltf-pipeline`, `sharp` for textures).
   - Generate three output assets: Desktop (High), Mobile (Low), and Static (2D Image).
   - Save references under the listing document in your Firestore / relational database.

---

## 💻 Responsive React + Three.js Implementation

Implement dynamic resource scaling inside your components based on screen-width or capability detection:

```jsx
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export function PanoramicTour({ asset, isMobile }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || !asset) return;

    // 1. Quality Scaling based on device capability (desktop vs mobile)
    const pixelRatioClamp = isMobile ? 1.0 : 1.5;
    // Lower segment counts for mobile to save CPU/GPU overhead
    const segments = isMobile ? 32 : 60; 

    // 2. Setup Three.js scene
    const renderer = new THREE.WebGLRenderer({ antialias: !isMobile });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, pixelRatioClamp));
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    containerRef.current.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, containerRef.current.clientWidth / containerRef.current.clientHeight, 1, 1000);
    
    // 3. Dynamic LOD Sphere Geometry
    const geometry = new THREE.SphereGeometry(500, segments, segments);
    geometry.scale(-1, 1, 1);

    const material = new THREE.MeshBasicMaterial({ color: 0x05080f });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // 4. Dynamic Asset Selection from DB Schema
    const textureLoader = new THREE.TextureLoader();
    const textureUrl = isMobile ? asset.mobileUrl : asset.desktopUrl;
    
    textureLoader.load(
      textureUrl, 
      (texture) => {
        material.map = texture;
        material.needsUpdate = true;
      },
      undefined,
      () => {
        // Fallback to static fallback image if WebGL texture load fails
        console.warn("Failed loading texture, loading static fallback...");
        material.map = textureLoader.load(asset.staticFallbackUrl);
        material.needsUpdate = true;
      }
    );

    // Render loop and cleanups
    let id;
    const animate = () => {
      id = requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(id);
      renderer.dispose();
      geometry.dispose();
      material.dispose();
    };
  }, [asset, isMobile]);

  return <div ref={containerRef} className="w-full h-full relative" />;
}
```