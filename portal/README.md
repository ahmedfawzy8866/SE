# Portal — Houyez-Style Static Site

This directory contains the self-contained static HTML portal for Sierra Estates,
served via GitHub Pages at **https://ahmedfawzy8866.github.io/SE/**.

It's the "design-first" version of the portal — no build step, no server, no
Firebase dependency. All data is in `data.js`. The Next.js app in `/apps/sierra-estates-realty/`
is the production version with Firestore backing; this is the lightweight preview.

## What's here

```
portal/
├── index.html              ← Main portal (8 sections + inline 3D tour + Noomo-style effects)
├── compounds.html          ← Compounds page (Leaflet intelligence map)
├── properties.html         ← Properties listing grid
├── property.html           ← Single property detail (gallery, mini-map, agent)
├── virtual-tour.html       ← Full-page 3D tour viewer
├── shared.css              ← Shared styles (incl. RTL icon flipping)
├── shared.js               ← Shared logic (i18n, theme, animations)
├── data.js                 ← Seed data (slides, listings, compounds, rooms)
├── image-slot.js           ← Image lazy-loading helper
├── logo-gold.png           ← Logo
├── assets/                 ← Logo images
├── backend/                ← Python backend (Sierra Blue bot + API integrations)
├── scripts/                ← Utility scripts (activate-agents.js)
├── data/                   ← Property data (properties-master.xlsx)
└── docs/                   ← Documentation
```

## Noomo-style immersive effects (index.html only)

1. **Preloader** — Full-screen loading overlay with 0→100% progress bar and "Enter Site" button. Auto-enters after 2.5s if user doesn't click.
2. **Custom cursor** — Blend-mode dot that inverts colors over dark/light areas. Expands on hover over interactive elements. Desktop only (hidden on touch devices).
3. **Magnetic buttons** — Primary buttons subtly pull toward the cursor on hover (15% displacement). Desktop only.
4. **Smooth scroll** — Lightweight lerp-based smooth scrolling (no external dependency). Desktop only.
5. **Text reveals** — Headlines slide up from behind a mask as they enter the viewport. Works on all devices.

All effects respect `prefers-reduced-motion`. Cursor + magnetic + smooth scroll are disabled on touch devices.

## Live URL

**https://ahmedfawzy8866.github.io/SE/**

(Served from the `gh-pages` branch of the SE repo, not from this directory. This directory is the source of truth that gets pushed to the SE repo's `gh-pages` branch.)

## Recent fixes

- **RTL button direction**: Directional icons (`arrow-right`, `chevron-right`) now flip via `transform: scaleX(-1)` when `dir="rtl"`. Non-directional icons are excluded.
- **Map refinement**: Map height increased to 580px. Added `map.invalidateSize()` calls at 200ms + 800ms after load. Added resize listener. Map center adjusted to `[30.03, 31.57]`.
- **Noomo-style effects**: Preloader, custom cursor, magnetic buttons, smooth scroll, text reveals added to `index.html`.
