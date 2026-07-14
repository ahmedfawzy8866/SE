# Handoff: Sierra Estates — Public Client Portal → Next.js `src/` shell

## Overview

This package is the developer handoff for wiring the **live, hand-refined Sierra
Estates client site** (currently at [ahmedfawzy8866.github.io/SE](https://ahmedfawzy8866.github.io/SE/)) into the
monorepo. The task: **port the static portal into React components** inside the
Next.js **client-portal shell that already lives on `SE@main` under `src/`** — the
scaffold the repo README flagged as "may be scaffolding meant to receive the
refined client design later."

The live site is the source of truth. Everything in `design-reference/` was pulled
verbatim from `ahmedfawzy8866/SE@main` (repo root) — the exact files GitHub Pages
serves today.

## About the design files

The files in `design-reference/` are **design references implemented in HTML/CSS/JS**
— a working prototype of the intended look and behavior, **not production code to
paste in**. The job is to **recreate them as React components** using the target
codebase's patterns (Next.js 16 / React 19, its existing styling approach, its data
layer), not to drop the HTML into a page. Where a behavior is non-trivial (the
Leaflet map, the 3D tour embed, the i18n/theme engine), the reference JS is the
authoritative spec for how it must behave.

## Fidelity: **High-fidelity**

This is a pixel-level reference — final colors, typography, spacing, motion, copy
(EN + AR), and interactions are all decided. Recreate the UI faithfully; do not
re-style or re-lay-out. The one liberty expected of the developer is **structural**:
break the monolithic page into components and swap the vanilla data/i18n/theme
plumbing for React-native equivalents.

---

## Target: where this wires (`SE@main`)

Per the SE repo README, `main` already carries a minimal Next.js + Firebase
client-portal shell at `src/` (`src/components/houyez-portal/HouyezPortal.tsx`, live
Firestore subscriptions under `src/lib/houyez/`, reading `houyez_*` collections),
rendering a placeholder at `/clients`. **That shell is the landing spot.**

Recommended approach:

1. Treat `src/app/(client)/` (or the existing `/clients` route) as the portal root.
2. Build the section components listed below under
   `src/components/portal/…` and compose them in the route's `page.tsx`.
3. Replace the vanilla `window.HZDATA` seed + `shared.js` i18n/theme with:
   - **Data** → the existing `src/lib/houyez/` Firestore subscriptions (fall back to
     the seed shapes in `design-reference/data.js` where a collection isn't wired yet).
   - **i18n** → the repo's `lib/I18nContext.tsx` (already present on `main`).
   - **Theme** → a small `next-themes`-style provider (light/dark; see Theme section).

### Suggested component tree

```text
src/components/portal/
├── PortalChrome.tsx          # sticky nav + announcement bell bar + mobile menu
├── Hero.tsx                  # slideshow + eyebrow/h1/sub + quick stats + laser sweep
│   └── HeroSearchCard.tsx    # compound autocomplete + type/beds/price + Search
├── MarketTicker.tsx          # horizontal auto-scroll stat ticker
├── FeaturedProperties.tsx    # #properties — listing card grid
│   └── PropertyCard.tsx      # reusable card (also used on properties.html grid)
├── WhySierra.tsx             # #agents — advantage grid + "whole market" network block
├── CompoundsPreview.tsx      # #compounds — compound card grid
├── VirtualTour.tsx           # #tour — click-to-activate 3D iframe banner + stats card
├── SmartMap.tsx              # #map-section — Leaflet + markercluster + SmartFilter
│   └── SmartFilter.tsx       # collapsible filter: compounds multiselect, beds, price, reset
├── AiInsights.tsx            # #insights — best-listings grid + live market stat row
├── IntelligenceEngine.tsx    # Smart Match / AVM Pricing / ROI Forecaster launch cards
├── QuickRequest.tsx          # contact / list-your-property CTA block
├── PortalFooter.tsx          # footer + newsletter + partner logos
└── SierraChatFab.tsx         # gold AI concierge FAB + slide-in panel
```

Maps onto the CLAUDE.md component plan (`SplitHeroViewport`, `LiveMap`,
`InventoryShowcase`, `LeilaConcierge`) — use those names if you prefer them.

---

## Screens / sections

Sections below are in live document order. IDs are the anchors in
`design-reference/index.html`; each `data-i18n` key resolves in
`design-reference/shared.js` (`I18N.en` / `I18N.ar`).

### 1. Chrome — `#site-chrome` (injected by `shared.js`)

- **Purpose:** persistent nav; language + theme toggles; primary CTAs.
- **Layout:** fixed top bar, navy translucent + backdrop blur. Left: logo
  (`logo-gold.png`) + "Future of Real Estate" subtag. Center/right nav:
  Home · Properties · Compounds & Map · Best Listings · Career · Agents · Contact ·
  AI Tools. Right cluster: **Light/Dark** toggle, **العربية / EN** language toggle,
  "Add Listing", "Sign In".
- **Behavior:** transparent-over-hero → solid on scroll; on scroll a compact search
  row can re-appear (same fields as hero). Mobile: hamburger drawer.

### 2. Hero — `header.hero` (`data-screen-label="Home hero"`)

- **Purpose:** cinematic entry + primary search.
- **Layout:** full-bleed, `min-height:640px`, `padding:70px 0 140px`. Background =
  crossfading image slideshow; dark gradient scrim on top.
- **Components:**
  - **Slideshow** — 5 slides from `HZDATA.slides` (`{pre, preAr, main, mainAr, img}`).
    Crossfade `opacity 1.5s var(--silk)` + subtle `scale(1.08)→1`. Auto-advance;
    **dots** control (`#hero-dots`, active dot widens to 44px, gold).
  - **Eyebrow** `#hero-pre` — mono, uppercase, `letter-spacing:.32em`, `11.5px`,
    color `#8fe1ff` (light) / `#e9c176` (dark), 26px gold rule before it.
  - **H1** `#hero-main` — `var(--display)` (Playfair Display), `54px`/`700`,
    `line-height:1.08`, white, text-shadow for legibility; `.hl` span is italic gold
    with a glowing dot after it. Text swaps per slide + per language.
  - **Sub** `p.sub` — `15.5px`/`500`, white 88%.
  - **Quick stats** `.quick` — 3 inline items (1,900+ verified listings · 50+
    compounds · RERA-licensed brokers), gold leading icons (Lucide).
  - **Map CTA** `.map-cta` — centered glass pill "Explore compounds on the map",
    pulsing gold dot icon, links to `#map-section` / compounds.
  - **Laser sweep** `.page-laser` — decorative gold beam, pauses top → descends →
    pauses bottom on a 5s loop. Hero-only, `z-index:6`. Respect
    `prefers-reduced-motion`. Purely cosmetic — safe to make a no-op.
  - **Bell bar** `#bell-bar` — slim announcement strip: "The first real estate
    ecosystem in Egypt · استكشف… · AI Driven · قدم طلبك الآن" with slow gentle flash.
  - **Search card** `.search-card` (see 2a).

#### 2a. Hero search card — `HeroSearchCard`

- Sits pulled up over the hero (`margin-top:-76px`, `z-index:5`), white/surface,
  `border-radius:14px`, `--shadow-m`.
- **Tabs:** Resale / Rent / New Projects.
- **Fields row:**
  - **Location** — `#hero-compound-search` text input with live autocomplete
    dropdown (`#hero-compound-results`) filtered against `HZDATA.compounds[].n`.
  - **Property Type** `#hero-type` — Any / Apartment / Villa / Townhouse / Twin
    House / Penthouse / Duplex.
  - **Bedrooms** `#hero-beds` — Any / 1+ / 2+ / 3+ / 4+ / 5+.
  - **Max Price** `#hero-price` — Any / Up to 5M / 10M / 20M / 30M / 50M EGP.
  - **Search** `#hero-search-btn` — primary gold button; navigates to
    `properties.html` (→ `/properties`) with the filter as query params, and shows a
    live match count.

### 3. Market ticker — `.ticker`

- Auto-scrolling single row (`#ticker-row`) of market/stat chips. Pauses on hover.
  Mono font, muted. Decorative-informational.

### 4. Featured properties — `#properties`

- **Head:** eyebrow "AI-curated inventory" + H2 "Featured Properties" + sub; right
  "View all listings →" (→ `/properties`).
- **Grid** `#prop-grid` — responsive cards from `HZDATA.listings`. Target columns:
  5 (xl) / 4 (lg) / 3 (sm) / 2 (mobile).
- **PropertyCard** (reused across the site):
  - Image (`listing.img`, `loading="lazy"`), zoom-on-hover.
  - **SBR code** pill top-left (`listing.code`, e.g. `HP-VL-01`).
  - **Save** heart top-right (toggles red).
  - Tag badge (`Premium` / `Featured` / `Smart Match` / `Best ROI` / `New` / null).
  - **AI score** bar (`listing.ai`, e.g. 9.8) that fills on hover.
  - Price: **EGP** for sale (`egpM`, "EGP 28.5M"), **USD/mo** for rent (`usd`,
    "$1,650/mo"). Currency rule: values ≥ 10,000 → EGP, < 10,000 → USD.
  - Specs row: beds · baths · area m².
  - Compound + zone + agent + "Xd ago".
  - Gold "View" overlay on hover → `/property?id=`.

### 5. Why Sierra — `#agents`

- Centered H2 "Why Sierra Estates™". Advantage cards (`w1t…w4t` copy): One market,
  one search · Precise AVM Pricing · Human + AI Closing · Verified Inventory.
- **Network block** (`netTit`/`netBody`): "We don't sell only our own units — we
  search the entire market for you", with three stats: **1,500+** partner brokers ·
  **240+** brokerage firms · **100%** New Cairo. (Copy verbatim in `shared.js`.)

### 6. Compounds preview — `#compounds` (`.well` background)

- Head + "All 50+ compounds →" (→ `/compounds`). Grid `#comp-grid` of compound cards
  from `HZDATA.compounds` (`{n, c:[lat,lng], g:growth%, ai, z:zone, priceM, rent}`).

### 7. Virtual tour — `#tour` (`.well`)

- **Purpose:** cinematic 3D-tour teaser, lazy-activated for performance.
- **Layout:** `21/9` banner, `min-height:420px`, `border-radius:18px`, gold gradient
  border glow + soft shadow, dark base `#0a1622`.
- **Behavior:** shows a **poster button** (`#vtv-poster`) until clicked; on click,
  loads the `#vtv-iframe` (embed `https://listing3d.com/embed/…`), shows a loader
  spinner, fades the iframe in. **Fullscreen** button `#vtv-fs`. "Open full page" →
  `/virtual-tour`. Floating stats card: "Sierra Signature Villa — Mivida · 5 Bed · 6
  Bath · 480 m² · Pool · Garden", 47 tours live / 12 ready to move / 4K HDR.
- Do **not** auto-load the iframe — click-to-activate is intentional.

### 8. Smart Map — `#map-section`

- **Purpose:** interactive New Cairo compound map.
- **Library:** Leaflet 1.9.4 + `leaflet.markercluster` 1.5.3 (both from unpkg;
  install `leaflet` + `react-leaflet` or wrap Leaflet directly)
  + `leaflet.markercluster`.
- **Map:** `#home-map`, height 480px. CARTO light tiles (light theme) / **CARTO dark
  tiles + gold markers** (dark theme). Markers cluster when zoomed out; compound
  markers labelled with `compounds[].n` — **Arabic names when lang = AR** (52
  compounds translated in `shared.js`). Price pins: `$X,XXX/mo` (rent) or
  `EGP X.XM` (resale).
- **SmartFilter** `#hmf-panel` (collapsible, trigger `#hmf-trigger` with active
  badge + live "… compounds" count `#home-map-count`):
  - Compound **multi-select** with search + chips (`#hmf-compound-chips`).
  - **Bedrooms** chip group `#home-map-beds` (Any / 1+ … 5+).
  - **Max Price** slider — **RENT mode: USD $200 → $15,000/mo**, **RESALE mode: EGP
    0.5M → 50M** (mode drives units).
  - **Reset** `#hmf-reset`.
- Fullscreen expand supported. Marker click → compound unit sheet (see
  `compounds.html` for the full modal: All Units table w/ thumbnails + Best Match
  tab).

### 9. AI Insights — `#insights`

- Head "Best Listings Right Now" — AI-ranked by match score / ROI / demand.
- **Grid** `#insights-grid` (auto-fit, min 300px) of best-listing cards.
- **Market stat row** `#insights-market`: +24% Top Growth (Mountain View) · 9.8
  Highest AI Score (Hyde Park) · EGP 35M Top Price (Taj City) · 798 Active Units.
  Structure is "ready for Firestore" — wire to live aggregates when available.

### 10. Intelligence Engine — "Intelligence Engine™"

- Three launch cards, each with a **LIVE** badge, linking to the AI tool pages:
  - **Smart Match v3** → `/matches` (`matches.html`)
  - **AVM Pricing Engine** → `/pricing` (`pricing.html`)
  - **ROI Forecaster** → `/roi` (`roi.html`)
- (Dream Home Finder quiz → `/advice`; AI Engine dashboard → `/ai-engine` also
  exist as pages.)

### 11. Quick request / CTA

- "Have a property in New Cairo to sell or rent?" + sub, buttons "List your
  property" / "Talk to an agent". WhatsApp CTA to `wa.me/201092048333`.

### 12. Footer + Chat FAB

- **Footer** `PortalFooter`: blurb, newsletter email capture, partner logos (EMAAR
  MISR · SODIC · Mountain View · Palm Hills · Ora · La Vista · Hyde Park · Marakez),
  contact `info@Sierra-Estates.net`, address "Banafseg 2, Villa 402, New Cairo".
- **Sierra Chat FAB** `SierraChatFab`: gold FAB bottom-right with "AI" badge → opens
  the Sierra concierge panel. Compound-aware canned replies (EN + AR), 4 suggestion
  chips; matches on Madinaty / Mivida / Hyde Park / Mountain View / ROI / rent /
  price. Wire to the concierge backend (`LeilaConcierge` / Gemini via Server Action)
  — see CLAUDE.md G2.

---

## Data model

Static seed lives in `design-reference/data.js` as `window.HZDATA`:

- **`slides[]`** — `{ pre, preAr, main, mainAr, img }`
- **`listings[]`** — `{ id, code, cmp, zone, type, beds, bath, area, egpM, usd, ai,
  tag, mode:'sale'|'rent', agent, ago, img }`
- **`rooms[]`** — `{ name, sub, img }` (virtual-tour room list)
- **`interiors[]`** — image URLs
- **`compounds[]`** — `{ n, c:[lat,lng], g:'+18%', ai, z:zone, priceM, rent }`
- `agentImg` — default agent avatar URL

**Currency rule (project-wide):** price < 10,000 → render as **USD** (`$1,650`);
≥ 10,000 → render as **EGP** (`EGP 1,500,000`). Rent uses `usd` (per month), sale
uses `egpM` (millions EGP).

**SBR code format:** `[Compound]-[Rooms][F/U]-[Price]` (e.g. `MIV-3F-1.6K`),
uppercase, shown as a pill on cards.

Firestore target: the existing `houyez_*` collections on `SE@main` (`src/lib/houyez/`).
The Supabase mirror (`design-reference/schema.sql`) documents the equivalent 8
tables — `compounds`, `listings`, `units`, `agents`, `inquiries`,
`career_applications`, `leads`, `users` — with the same fields; use it as a field
reference only.

## i18n + theme + RTL

- **i18n** — full EN + AR string tables in `design-reference/shared.js` (`I18N.en`,
  `I18N.ar`), applied via `data-i18n` / `data-i18n-ph` (placeholder) /
  `data-i18n-section` attributes. Port to the repo's `lib/I18nContext.tsx`; carry
  every key over (the map + filter + count strings are all translated).
- **RTL** — Arabic sets `dir="rtl"`; directional Lucide icons flip via
  `transform: scaleX(-1)`; hero/heading fonts switch to **Cairo**. Use logical CSS
  props (`inset-inline-start`, `margin-inline-*`) — the reference already does.
- **Theme** — light/dark toggle. Dark mode = near-black surfaces + **gold accent
  `#E9C176 / #C8961A`** replacing the light-mode cyan accent, and CARTO dark map
  tiles. Persist choice (localStorage in the reference → cookie/next-themes in Next).

## Interactions & behavior

- Hero slideshow auto-advance + dot control; crossfade 1.5s.
- Reveal-on-scroll (`.rv` elements) — fade/slide in as sections enter viewport.
- Card hover: lift + gold border glow + image zoom + AI-score bar fill + heart save.
- Map: cluster/spiderfy, filter → live count, marker → unit sheet modal, fullscreen.
- Virtual tour: click-to-activate iframe, loader, fullscreen.
- Sticky nav: transparent→solid + compact search on scroll.
- Chat FAB: open/close panel, suggestion chips, keyword-matched replies.
- All motion honors `prefers-reduced-motion`. Easing var `--silk` (see `shared.css`).

## Design tokens

Authoritative values are in `design-reference/shared.css` (`:root` + `[data-theme]`)
and the design system's `colors_and_type.css`. Key ones:

- **Gold (primary accent):** `#C8961A` / light `#E9C176`
- **Navy:** `#0D2035`; hero base `#0a1622`; deep surface `#142850`
- **Cyan (light-mode hero accent):** `#8fe1ff`
- **Fonts:** Playfair Display / Cormorant Garamond (display headings), Plus Jakarta
  Sans (UI/body EN), Cairo (AR), JetBrains Mono (data/codes/labels)
- **Hero H1:** 54px / 700 / line-height 1.08 / letter-spacing -.015em
- **Radii:** cards ~14px, tour banner 18px, pills 999px
- **Shadows:** `--shadow-s/m` (see stylesheet); soft, not harsh
- Use `var(--*)` from `colors_and_type.css` (99 tokens) rather than hardcoding.

## External dependencies

- **Leaflet** 1.9.4 + CSS, **leaflet.markercluster** 1.5.3 + CSS → npm `leaflet`
  (+ `react-leaflet` optional) + `leaflet.markercluster`.
- **Lucide** icons → npm `lucide-react`.
- **3D tour** — external `listing3d.com` embed iframe (no dep).
- **Google Fonts** — Plus Jakarta Sans, Cairo, JetBrains Mono, Playfair Display,
  Cormorant Garamond → `next/font/google`.
- **Supabase JS** (optional/skip) — `@supabase/supabase-js`. Prefer Firebase.
- Tile provider: **CARTO** light/dark basemaps.

## Assets

- `design-reference/logo-gold.png` — Sierra Estates gold logo. Move into
  `public/` (repo already has `sierra-estates-logo*.png` / emblem SVG — prefer those
  if they match).
- All property/room/interior/slide imagery = remote **Unsplash** URLs in `data.js`
  (placeholders). Swap for real Firestore/Storage media when available.

## Files in this bundle

```text
design-reference/
├── index.html          # the portal (all sections above) — primary reference
├── shared.css          # all shared styles, tokens, RTL, dark theme
├── shared.js           # chrome injection, i18n (EN/AR), theme, motion, map logic
├── data.js             # window.HZDATA seed data (shapes above)
├── compounds.html      # /compounds — full Leaflet map + unit-sheet modal
├── properties.html     # /properties — listings grid + sort/layout toggle
├── property.html       # /property — single-property detail (gallery, mini-map, agent)
├── virtual-tour.html   # /virtual-tour — full-page 3D tour viewer
├── matches.html        # /matches — Smart Match AI tool
├── roi.html            # /roi — ROI forecaster + calculator
├── pricing.html        # /pricing — AVM estimator
├── advice.html         # /advice — Dream Home Finder quiz
├── ai-engine.html      # /ai-engine — AI Engine dashboard
├── career.html         # /career — application form
├── logo-gold.png       # logo asset
├── supabase.js         # OPTIONAL backend layer (reference only — prefer Firestore)
├── supabase-config.js  # OPTIONAL Supabase config stub
└── schema.sql          # OPTIONAL Postgres schema (field reference for the data model)
```

---

## Wiring checklist (for Claude Code on `SE@main`)

1. Confirm you're clear to wire — the repo README marks the client page "do not wire
   until told otherwise"; this handoff **is** that go-ahead.
2. Open the existing `src/` client-portal shell (`src/components/houyez-portal/`,
   `src/lib/houyez/`) and the `/clients` route. Decide: extend `/clients` or add a
   dedicated portal route group.
3. Scaffold `src/components/portal/*` per the component tree above.
4. Port sections top-to-bottom. Start with `PortalChrome`, `Hero` + `HeroSearchCard`,
   `FeaturedProperties` + `PropertyCard` (these establish tokens, i18n, theme, the
   card, and the currency rule that everything else reuses).
5. Wire `lib/I18nContext.tsx` with every key from `shared.js` (EN + AR); add the
   theme provider (light/dark, gold-in-dark, persisted).
6. `SmartMap` + `SmartFilter` last among the heavy ones — client component, dynamic
   `import()` Leaflet (no SSR), markercluster, CARTO tiles, rent/resale price modes.
7. Data: read from `houyez_*` via `src/lib/houyez/`; fall back to `data.js` shapes
   for anything not yet in Firestore. Do **not** add Supabase.
8. Then the AI-tool routes (`/matches`, `/pricing`, `/roi`, `/advice`, `/ai-engine`)
   from their reference files, and wire the chat FAB to the concierge backend
   (CLAUDE.md G2).
9. Keep it a client-portal deploy target (Vercel) per the repo's deploy notes; don't
   touch the `admin` or backend surfaces.

**Do not ship the HTML directly.** These are references; the deliverable is faithful
React components in the existing Next.js environment.
