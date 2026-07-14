# Design System: Sierra Estates (i:Sierra 2027)

## 1. Visual Theme & Atmosphere
A refined, cinematic luxury interface embodying Apple-style minimalism and editorial elegance. The atmosphere is prestigious and quiet — like a high-end private wealth management dashboard or a 5-star hotel lobby. Density is balanced (6) with confident asymmetric layouts (7) and cinematic choreography in motion (8). Every element breathes, utilizing glassmorphic backdrop-blurs, translucent panels, and subtle borders to create soft depth.

## 2. Color Palette & Roles
- **Deep Corporate Navy** (`#0A1628`) — Primary background surface and deep voids.
- **Signature Matte Gold** (`#C9A24D`) — Single accent for CTAs, highlights, badges, and the logo.
- **Soft Ivory** (`#F4F0E8`) — Primary typography on dark backgrounds, offering softer contrast than pure white.
- **Translucent Glass** (`rgba(244,240,232,0.05)`) — Surface fill for cards and elevated panels.
- **Whisper Border** (`rgba(201,162,77,0.2)`) — Subtle 1px structural lines and card borders.
- **Muted Steel** (`#71717A`) — Secondary text, descriptions, metadata (tailored for dark mode legibility).

## 3. Typography Rules
- **Display/Headlines:** `Playfair Display` — Track-tight, controlled scale, editorial luxury. Weight-driven hierarchy.
- **Arabic UI:** `Cairo` — Modern, clean, well-spaced Arabic typography.
- **Data/Numbers:** `Inter` — ONLY used strictly for numeric data, tables, and dense analytics where monospace-like readability is required.
- **Body (EN):** `Outfit` or `Geist` — Relaxed leading, 65ch max-width, Soft Ivory color.
- **Banned:** Generic system fonts, pure white text, overly large headers without typographic finesse. `Inter` is BANNED for creative headlines.

## 4. Component Stylings
- **Buttons:** Flat, cinematic. Signature Matte Gold fill for primary actions with dark navy text. Tactile -1px translate on active state. No neon outer glow. Glassmorphic outline for secondary buttons.
- **Cards:** Glassmorphic UI. Translucent panels (`backdrop-blur-md`, `bg-white/5`), subtle Matte Gold whisper borders. Generously rounded corners (1rem). Used only when elevation serves hierarchy. 
- **Inputs:** Label above, error below. Minimalist under-border or fully glassmorphic pill shape. Focus ring in Signature Matte Gold. No floating labels.
- **Loaders:** Skeletal shimmer matching exact layout dimensions or a subtle cinematic fade. No generic circular spinners.
- **Badges/Tags:** e.g., "High Value". Signature Matte Gold background with deep navy text.

## 5. Layout Principles
Grid-first responsive architecture. Asymmetric splits for Hero sections.
Strict single-column collapse below 768px. Max-width containment (1400px centered).
No flexbox percentage math. Generous internal padding (e.g., `clamp(3rem, 8vw, 6rem)`).
No overlapping elements — clean spatial separation always.

## 6. Motion & Interaction
Framer Motion for interactive animations. Spring physics for all interactive elements (stiffness: 100, damping: 20).
Staggered cascade reveals for lists.
Hardware-accelerated transforms and opacity only. No animating `top`, `left`, `width`, or `height`.

## 7. Anti-Patterns (Banned)
- No emojis anywhere.
- No `Inter` for creative text (only allowed for numbers/data).
- No generic serif fonts (`Times New Roman`, `Georgia`).
- No pure black (`#000000`).
- No neon glows or oversaturated accents.
- No 3-column equal grids (use asymmetric layouts).
- No AI copywriting clichés ("Elevate", "Seamless", "Unleash").
- No fake round numbers (`99.99%`).
- No overlapping elements.
- No generic names.
