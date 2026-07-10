# SE — Sierra Estates Portal

> Live at **https://ahmedfawzy8866.github.io/SE/**

## Structure

```
se/
├── index.html              ← Main portal (Houyez-Style, 8 sections + inline 3D tour)
├── compounds.html          ← Compounds page (Leaflet intelligence map)
├── properties.html         ← Properties listing grid
├── property.html           ← Single property detail (gallery, mini-map, agent)
├── virtual-tour.html       ← Full-page 3D tour viewer
├── shared.css              ← Shared styles (incl. RTL icon flipping)
├── shared.js               ← Shared logic (i18n, theme, animations)
├── data.js                 ← Seed data (slides, listings, compounds, rooms)
├── assets/                 ← Logo images
├── logo-gold.png           ← Logo (light bg)
│
├── backend/                ← Python backend (Sierra Blue bot + API integrations)
│   ├── sierra_blue_api_integration.py
│   ├── sierra_blue_bot_implementation.py
│   └── system_prompt_and_deployment.py
│
├── scripts/                ← Utility scripts
│   └── activate-agents.js  ← Firebase bulk agent activator
│
├── data/                   ← Property data
│   └── properties-master.xlsx  ← Master Excel (Owners-Rent, Owners-Resale, Brokers, Team Units)
│
├── docs/                   ← Documentation
│   ├── SIERRA_BLUE_FULL_HANDOVER.md
│   ├── INSTRUCTIONS_FOR_AHMED.md
│   ├── SKILL_excel.md
│   └── ترميز وصف الوحدة السكنية بالتفاصيل - DeepSeek.html
│
└── .gitignore              ← Excludes SSL certs, Twilio codes, service accounts, .env
```

## Recent fixes

### 1. RTL button direction (Arabic mode)
- Directional icons (`arrow-right`, `chevron-right`, etc.) now flip via `transform: scaleX(-1)` when `dir="rtl"`
- Non-directional icons (`map-pin`, `search`, `play`, etc.) are explicitly excluded from flipping
- Scroll-cue laser line moves to the left side in RTL

### 2. Map refinement (compounds.html + property.html)
- Map height increased: 540px → 580px (desktop), 400px → 420px (mobile)
- Added `map.invalidateSize()` calls at 200ms + 800ms after load (fixes tile loading issues)
- Added `window resize` listener to re-invalidate the map
- Map center adjusted to `[30.03, 31.57]` (better centering on New Cairo compounds)
- Zoom control explicitly enabled

## Security

The following files are in `.gitignore` and will NEVER be committed:
- SSL certificates (`*.crt`, `*.ca-bundle`, `*.p7b`)
- Twilio 2FA recovery codes
- Firebase service account JSONs
- `.env` files

## Live URLs

| URL | What |
|-----|------|
| https://ahmedfawzy8866.github.io/SE/ | Main portal |
| https://ahmedfawzy8866.github.io/SE/compounds.html | Map + compounds |
| https://ahmedfawzy8866.github.io/SE/properties.html | Listings grid |
| https://ahmedfawzy8866.github.io/SE/property.html | Property detail |
| https://ahmedfawzy8866.github.io/SE/virtual-tour.html | 3D tour full page |
