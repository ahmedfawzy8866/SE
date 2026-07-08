# Design System: Sierra Estates (Intelligence OS Platform)

## 1. Visual Theme & Atmosphere
A highly responsive, luxury real estate intelligence system designed specifically for New Cairo's high-end property market. The visual atmosphere is clinical yet deeply premium—combining a weightless "Art Gallery Airy" aesthetic with offset asymmetric grids, glassmorphism overlays, and cinematic transitions. 
- **Density:** Daily App Balanced (5/10) with generous spacing to avoid visual fatigue.
- **Variance:** Offset Asymmetric (7/10) featuring asymmetrical project layouts and offset content structures.
- **Motion:** Cinematic Choreography (7/10) utilizing spring physics for high-end micro-interactions and smooth tab transitions.

## 2. Color Palette & Roles
The color theme revolves around a dark luxury palette ("Pepsi Blue" depth and gold accents). There is no pure black (#000000) used anywhere in the application.

- **Dark Canvas Background** (#040C16) — Deep navy background, weightless space feel.
- **Light Canvas Background** (#FAF8F5) — Muted off-white/cream background.
- **Dark Surface Card** (#0D2035) — Elevated surface color for cards, panels, and dropdowns.
- **Light Surface Card** (#FFFFFF) — Primary white card surface for light mode.
- **Primary Text Dark** (#FAF8F5) — High-contrast white/cream text.
- **Primary Text Light** (#0F1B29) — High-contrast deep navy/black text.
- **Muted Steel/Slate** (#8A9BB0 / #6B7A8D) — Secondary text, metadata, labels.
- **Luxury Gold Accent** (#E9C176 / #C49A3C) — The single primary accent color for active states, CTA buttons, active chips, and border highlights.
- **Whisper Border** (#1C3A5E / #E5E0D8) — Subtle structural lines to demarcate boundaries without hard contrast.

*No neon/outer glow shadows are permitted. The "AI Purple" neon glow aesthetic is strictly banned.*

## 3. Typography Rules
- **Display & Headlines:** Outfit-Bold or Outfit-SemiBold. Track-tight (letterSpacing: -0.5px), controlled scale, weight-driven hierarchy. Never screaming.
- **Body & Labels:** Outfit-Medium or Outfit-Regular. Relaxed line spacing, maximum line length of 65 characters.
- **Mono / Values:** JetBrains Mono or System monospaced font. Used strictly for numeric values (prices, yields, ROI percentages, coordinates) and AI intelligence logs.
- **Banned Fonts:** Inter is strictly banned. Default system serif fonts (Times New Roman, Georgia) are banned.

## 4. Component Stylings
- **Buttons:** Modern pill-shaped buttons (borderRadius: 22) with a flat design, no outer glows. Minimum height of 44px for tap targets on mobile. Primary buttons use Gold background with Dark Navy text; secondary buttons use outline/border with gold/muted text.
- **Cards:** Generously rounded corners (borderRadius: 16). Diffused subtle shadow tinted to the background hue. Elevated cards are only used to establish hierarchy; otherwise, clean border dividers are preferred.
- **Inputs & Filters:** Inputs are 44px height, labels positioned above, placeholder text in muted steel. Active border color is highlighted in gold. Filter chips are pill-shaped (height: 44px, borderRadius: 22px) for premium mobile interaction.
- **Loaders:** Skeletal shimmer loaders matching exact layouts—no generic circular spinners.
- **Empty States:** Composed illustrated states containing helpful calls-to-action (e.g. "Browse Listings").

## 5. Layout Principles
- **No Overlapping Elements:** Clean spatial separation. No elements absolute-positioned over text or images.
- **Split Asymmetric Hero Layout:** Left-aligned or split layouts rather than centered layout structures.
- **Responsive Adaptability:** Clean horizontal scrolling lists for mobile (e.g. city categories, AI module cards) that expand into grid layouts on desktop.
- **Max Width Containment:** Contain layouts using maximum width constraints (e.g. 1320px) on wide screen viewports.

## 6. Motion & Interaction
- **Spring Physics:** Weighty spring animations for all interactive actions (Pressable scales down slightly to 0.98 on active state).
- **Tab Transitions:** Smooth fade-in or slide animations for screen switches to avoid instant jumping.
- **Scroll Refreshes:** Haptic feedback on pull-to-refresh gestures using expo-haptics.

## 7. Anti-Patterns (Banned)
- No emojis anywhere in the system.
- No Inter font.
- No pure black (#000000).
- No neon or outer glow shadows.
- No oversaturated accents.
- No AI copywriting clichés ("Seamless", "Elevate", "Next-Gen").
- No filler UI text like "Scroll to explore" or chevrons bouncing at the bottom of the screen.
- No generic placeholder names (e.g., John Doe, Acme).
- No broken image links—always fallback to high-quality unsplash/picsum identifiers.
