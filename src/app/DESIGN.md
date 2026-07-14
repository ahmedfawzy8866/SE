# Design System: Sierra Estates Intelligence Suite

> **Scope:** `/matches`, `/pricing`, `/roi` — the AI tool pages inside the client portal.
> **Atmosphere:** Corporate Navy × Signature Gold. Quiet Luxury editorial real estate.

---

## 1. Visual Theme & Atmosphere

**Density:** 5 — Daily App Balanced. Data-rich but never claustrophobic. Breathing room between stat groups.
**Variance:** 7 — Intentionally asymmetric. Left-aligned hero layouts. No centered headings on full-width sections.
**Motion:** 6 — Fluid CSS. Spring-physics entrances. Perpetual micro-loops on live indicators. No theatrics.

The atmosphere is a high-floor New Cairo penthouse showroom — cool, confident, editorial.
Dark hero sections bleed into light-surface body content. Gold accents appear like scalpel strokes —
never decorative noise, always structural emphasis. Numbers are always monospace tabular. Copy is spare.

---

## 2. Color Palette & Roles

### Foundations
- **Ink Navy** (`#0A1628`) — Primary surface for hero sections, page chrome, and cards on dark
- **Deep Ocean** (`#0D1F30`) — Secondary dark surface, gradient destination, card gloss layer
- **Obsidian Bone** (`#F4F0E8`) — Warm off-white for body background — never pure `#FFFFFF`
- **Card Ivory** (`#FDFCF9`) — Elevated card surface in light mode

### Neutrals
- **Charcoal Ink** (`#1A2535`) — Primary body text on light surfaces
- **Slate Mid** (`#4B5A6A`) — Secondary descriptions, metadata, helper text
- **Mist Steel** (`#8C9BAB`) — Muted labels, icons, placeholders
- **Whisper Line** (`rgba(26,37,53,0.1)`) — Borders, dividers, structural lines

### Accent — ONE ONLY
- **Signature Gold** (`#C9A24D`) — The single accent: CTAs, active states, match scores, stat values, focus rings
  - `#E9C176` — Gold highlight: hover states, number emphasis, confidence indicators
  - `#A87C2A` — Gold deep: pressed/active button fill, bar fills
  - Never use on body copy. Never use as a background for large sections.

### Banned Color Patterns
- `#00aeff`, `#34d399`, `#8fe1ff` — ALL neon blues/greens are BANNED in the final UI (reference only)
- `#000000` — pure black is BANNED
- Any purple/violet tints — BANNED
- Oversaturated cyan gradients — BANNED

---

## 3. Typography Rules

### Font Stack
```
Display:  "Playfair Display", "Instrument Serif", serif   (ONLY for hero H1 and section titles)
Body:     "Plus Jakarta Sans", "Cairo", sans-serif         (all body copy, labels, UI text)
Mono:     "JetBrains Mono", "Geist Mono", monospace        (all numbers, badges, stats, code, metadata)
```

### Hierarchy
- **H1 Hero:** `clamp(32px, 5vw, 46px)` · Playfair Display · weight 700 · tracking -0.02em · Gold `<em>` for emphasis phrase
- **H2 Section:** `clamp(24px, 3vw, 32px)` · Plus Jakarta Sans · weight 700 · Charcoal Ink
- **H3 Card/Panel:** `22–26px` · Plus Jakarta Sans · weight 700 · tracking -0.005em
- **Body:** `15–16px` · Plus Jakarta Sans · weight 400 · leading 1.6 · max 65ch per line
- **Labels/Caps:** `10.5–12px` · JetBrains Mono · weight 700 · tracking 0.12–0.2em · uppercase
- **Numbers/Stats:** JetBrains Mono · `tabular-nums` always · weight 700–800

### Banned Typography
- `Inter` — BANNED everywhere
- `system-ui` as the display font — BANNED  
- `Georgia`, `Times New Roman`, `Garamond` — BANNED (Playfair Display is the approved editorial serif, only for hero H1)
- Gradient text on large headers — BANNED
- Text size below 13px on interactive elements — BANNED

---

## 4. Component Stylings

### Hero Sections
- **Structure:** Left-aligned, max-width 620px for paragraph. NOT centered.
- **Background:** `linear-gradient(135deg, #07121e 0%, #0d1f30 60%, #07121e 100%)`
- **Radial glow:** `radial-gradient(700px 360px at 78% 0%, rgba(201,162,77,.18), transparent 60%)` — GOLD tint, not cyan
- **Eyebrow:** JetBrains Mono, 11px, 0.2em tracking, uppercase, `#C9A24D`, with a `24×1.5px` gold line separator
- **H1:** Playfair Display. Italic `<em>` in Signature Gold. No full-sentence bold.
- **Chips:** Glassmorphic pill — `rgba(255,255,255,.07)` bg, `rgba(255,255,255,.14)` border, backdrop-blur 6px. Icon in Gold `#C9A24D`.

### Stat Strip
- 4-column auto grid with min 180px columns
- Top border: 3px `linear-gradient(90deg, #C9A24D, #A87C2A)` — gold gradient, NOT blue-green
- Value: JetBrains Mono 32px weight 800 in Gold `#C9A24D`
- Label: 11px caps, `#8C9BAB`
- Background: `#FDFCF9` in light mode

### Cards (Match Cards)
- Border radius: `18px` — generously rounded
- Border: `1px solid rgba(26,37,53,0.1)`
- Hover: `translateY(-4px)` + border-color shifts to `rgba(201,162,77,0.4)` — gold glow, not cyan
- Shadow: `0 2px 12px rgba(10,22,40,0.07)` — navy-tinted shadow, NOT `rgba(0,0,0,.06)`
- Score badge: Gold `#E9C176` text on `rgba(9,24,40,.86)` — always monospace
- Rank badge: `rgba(255,255,255,.92)` bg, `#0A1628` text, Trophy icon in `#C9A24D`
- Score bar: `linear-gradient(90deg, #C9A24D, #A87C2A)` — never cyan/green
- AI Reason box: `#F4F0E8` background (warm bone, not cold `#f8f9fb`)

### Filter/Search Bar
- Segment toggle: active state = `#0A1628` bg + `#fff` text. NOT cyan.
- Input focus ring: `1.5px solid #C9A24D` — gold
- Container bg: `#FDFCF9` with `1.5px solid rgba(26,37,53,0.12)` border

### Buttons (Primary CTA)
- Fill: `linear-gradient(135deg, #C9A24D, #A87C2A)`
- Text: `#0A1628` — dark navy on gold
- Font: Plus Jakarta Sans, weight 800, 13-14px
- Hover: `translateY(-2px)` + `box-shadow: 0 8px 24px rgba(167,124,42,.35)`
- Active: `translateY(0) scaleX(.98)` — tactile push
- NO neon outer glows. NO `cursor: pointer` override (let button default handle it).

### Form Inputs (Pricing/ROI)
- Label: JetBrains Mono, 11px, caps, `#8C9BAB`, above input, 10px gap
- Input: `1.5px solid rgba(26,37,53,0.15)` border, `11px 16px` padding, `#FDFCF9` bg
- Focus: border-color `#C9A24D`, no outline, no box-shadow glow ring
- Select: same styling as input

### Range Sliders (ROI Calculator)
- Track: `6px` height, `#E8EDF2` bg, radius `3px`
- Thumb: `20px` diameter, `#C9A24D` fill, `box-shadow: 0 2px 10px rgba(167,124,42,.4)`
- Thumb hover: `scale(1.15)`

### Panels (Pricing Estimate / ROI Calc)
- Dark panel (estimate result): `linear-gradient(160deg, #0c2138 0%, #091828 100%)`
- Big number: Playfair Display 54px, Gold `#E9C176`, tabular-nums
- Breakdown rows: body `rgba(244,240,232,.62)` text, value `#fff` JetBrains Mono
- Confidence bar: `linear-gradient(90deg, #C9A24D, #A87C2A)` — gold

### Live Indicator
- Blinking dot: `7px` radius, `#34d399` green (only green allowed — live status signal)
- Text: JetBrains Mono 10.5px, weight 700, `#34d399`, tracking 0.16em

### Note/Disclaimer Block
- Border: `1px solid rgba(201,162,77,0.22)` — gold
- Background: `rgba(201,162,77,0.06)` — gold tint, not blue
- Label: JetBrains Mono 12px caps, `#C9A24D`

---

## 5. Layout Principles

- **Container:** `max-width: 1200px`, `margin: 0 auto`, `padding: 0 24px`
- **Hero:** Left-aligned content, never centered. Paragraph `max-width: 620px`.
- **Two-column tool grids:** `1fr 1fr` (pricing) and `1.3fr 1fr` (roi) — NOT equal 3-column
- **Match grid:** `repeat(auto-fill, minmax(340px, 1fr))` — NOT a rigid 3-column
- **Spacing rhythm:** Sections separated by `clamp(40px, 6vw, 80px)` vertical padding
- **No overlapping:** Every element in its own spatial zone. No absolute-stacked text.
- **Grid over flex math:** Use CSS Grid for multi-column. Never `calc()` percentage hacks.
- **Min-height:** `min-height: 100dvh` — never `height: 100vh` (iOS Safari jump bug)
- **Sticky panels:** `position: sticky; top: 90px` for estimate/calc panel on desktop
- **Mobile collapse:** All 2-column grids → single column at `<= 880px`. Sticky → static.

---

## 6. Motion & Interaction

### Spring Physics
- Default: `cubic-bezier(0.22, 1, 0.36, 1)` — matches `spring(stiffness:100, damping:20)` feel
- Hover transforms: `transition: transform .25s cubic-bezier(0.22,1,0.36,1), box-shadow .25s, border-color .25s`
- Card entrance: `opacity: 0 → 1`, `translateY(24px) → none`, cascaded `animation-delay: i × 70ms`

### Perpetual Micro-loops
- **Live dot:** `opacity` pulse 1.6s ease-in-out infinite (`1 → 0.35 → 1`)
- **Confidence/score bar:** `scaleX(0 → 1)` on mount, `1.6s cubic-bezier(.22,1,.36,1)`, `transform-origin: left`
- **Score bars in cards:** same animation, stagger by card index

### Entrance Animations
- Stats strip: stagger `50ms` per card, `translateY(16px) → 0`
- Match cards: stagger `70ms`, `translateY(24px) perspective(800px) rotateX(-3deg) → none`
- ROI board rows: stagger `50ms`

### Performance Rules
- Animate ONLY: `transform`, `opacity`
- NEVER animate: `top`, `left`, `width`, `height`, `background-color`
- All animations in `@media (prefers-reduced-motion: no-preference)` guard

---

## 7. Anti-Patterns (Banned)

| Category | Banned Pattern |
|---|---|
| Fonts | `Inter`, `system-ui` as display, `Georgia`, `Times New Roman` |
| Color | `#000000`, neon cyan `#00aeff`, neon green `#34d399` (except live-dot only), purple/violet |
| Color | Oversaturated accent gradients, blue-green score bars |
| Shadows | Neon outer glows (`box-shadow: 0 0 20px #00f`) |
| Layout | Centered hero on this high-variance product |
| Layout | 3 equal-width cards in a rigid row |
| Layout | `calc()` percentage positioning hacks |
| Layout | `height: 100vh` (use `100dvh`) |
| Motion | Linear easing on interactive elements |
| Motion | Animating `width`, `height`, `top`, `left` |
| Copy | "Seamless", "Elevate", "Unleash", "Next-Gen", "AI-powered" (avoid in UI labels) |
| Copy | "Scroll to explore", scroll arrows, bouncing chevrons |
| UI | Circular loading spinners |
| UI | Floating labels on inputs |
| UI | Custom mouse cursors |
| UI | Emojis in UI chrome |
| Images | Generic `picsum.photos` placeholder images in production cards |
| Naming | "John Doe", "Acme Corp", "Sample Unit" as placeholder names |
| Numbers | `99.99%`, `100%` as suspiciously round stats |
