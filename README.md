# SE — Sierra Estates Portal

> Live at **https://ahmedfawzy8866.github.io/SE/**

## Structure

```
se/
├── index.html              ← Main portal (Houzez-Style, 8 sections + inline 3D tour)
├── compounds.html          ← Compounds page (Leaflet intelligence map)
├── properties.html         ← Properties listing grid
├── property.html           ← Single property detail (gallery, mini-map, agent)
├── virtual-tour.html       ← Full-page 3D tour viewer
├── matches.html            ← Smart Match (AI pairing tool)
├── roi.html                ← ROI Analysis (yield leaderboard + calculator)
├── pricing.html            ← Precise Pricing (AVM estimator)
├── advice.html             ← Dream Home Finder (4-question quiz)
├── ai-engine.html          ← AI Engine 3.0 dashboard
├── career.html             ← Career application form (CSV export)
├── seed-firestore.html     ← One-time Firestore seeding tool
│
├── shared.css              ← Shared styles (incl. RTL icon flipping)
├── shared.js               ← Shared logic (i18n, theme, animations)
├── data.js                 ← Seed data (slides, listings, compounds, rooms)
│
├── firebase-config.js      ← Firebase project config (EDIT THIS with your values)
├── firebase.js             ← Firestore integration layer (window.SIERRA_DB)
├── firestore.rules         ← Firestore Security Rules (deploy via Firebase CLI)
│
├── assets/                 ← Logo images
├── logo-gold.png           ← Logo (light bg)
├── scripts/                ← Utility scripts
│
├── .archive/               ← Archived/dead files (kept for history, not used)
│   ├── image-slot.js       ← Old design tool (not used by any page)
│   ├── backend/            ← Old Python stubs (not wired)
│   ├── docs/               ← Old documentation
│   └── data/               ← Old Excel data
│
└── .gitignore              ← Excludes SSL certs, Twilio codes, service accounts, .env
```

---

## 🔥 Firebase Setup (NEW — Backend Integration)

The portal now has Firebase Firestore integration. It's **disabled by default** — the site works perfectly with static `data.js` until you enable it.

### Step 1: Create Firebase Project
1. Go to https://console.firebase.google.com
2. Create a new project (e.g. `sierra-estates-prod`)
3. Enable **Build → Firestore Database** (production mode)
4. Enable **Build → Authentication** → Email/Password + Google

### Step 2: Get Your Config
1. Project settings (gear icon) → **Your apps** → web `</>`
2. Register app (nickname: "Sierra Estates SE")
3. Copy the config values

### Step 3: Edit `firebase-config.js`
Replace the placeholder values with your real config:
```javascript
window.SIERRA_FIREBASE_CONFIG = {
  apiKey:            "AIzaSyXXXXXXXXXXXXXXXXXX",
  authDomain:        "sierra-estates-prod.firebaseapp.com",
  projectId:         "sierra-estates-prod",
  storageBucket:     "sierra-estates-prod.appspot.com",
  messagingSenderId: "000000000000",
  appId:             "1:000000000000:web:0000000000000000000000"
};
window.SIERRA_FIREBASE_ENABLED = true;  // ← flip to true
```

### Step 4: Deploy Security Rules
```bash
npm install -g firebase-tools
firebase login
firebase use --add   # select your project
firebase deploy --only firestore:rules
```

### Step 5: Seed Firestore
1. Open https://ahmedfawzy8866.github.io/SE/seed-firestore.html
2. Verify connection status is green
3. Click "Seed Firestore Now"
4. Wait for completion

### Step 6: Make Yourself Admin
Run in browser console (after signing in via Firebase Auth on your admin page):
```javascript
firebase.firestore().collection('users').doc('YOUR_AUTH_UID').set({
  email: 'your@email.com',
  role: 'admin',
  name: 'Ahmed'
});
```

### How It Works
- **Firebase enabled**: Portal reads compounds/listings from Firestore (real-time updates)
- **Firebase disabled OR connection fails**: Portal falls back to static `data.js` (always works)
- **Inquiry form**: Tries Firestore first, falls back to CSV download + localStorage

---

## Recent fixes

### Code Audit Fixes (latest)
1. **Inquiry form** — was dead (`onsubmit="return false"`), now wired to Firestore with CSV fallback
2. **React dev builds** → production.min.js (ai-engine.html + virtual-tour.html)
3. **Dead files moved** to `.archive/` (image-slot.js, backend/*.py, docs/, xlsx)
4. **`'use strict'`** added to all IIFEs (shared.js, data.js, 11 HTML files)
5. **aria-labels** added to icon-only buttons (accessibility)
6. **5 missing i18n keys** added (afType/afPrice/afBeds/afDelivery/afMode — EN+AR)
7. **loading="lazy"** added to images for performance

### RTL button direction (Arabic mode)
- Directional icons flip via `transform: scaleX(-1)` when `dir="rtl"`
- Non-directional icons excluded from flipping
- Scroll-cue laser line moves to the left side in RTL

### Map refinement (compounds.html + property.html)
- Map height increased: 540px → 580px (desktop), 400px → 420px (mobile)
- `map.invalidateSize()` calls at 200ms + 800ms after load
- Map center: `[30.03, 31.57]` (better centering on New Cairo)

## Security

The following files are in `.gitignore` and will NEVER be committed:
- SSL certificates (`*.crt`, `*.ca-bundle`, `*.p7b`)
- Twilio 2FA recovery codes
- Firebase service account JSONs
- `.env` files

**Note:** The Firebase web config in `firebase-config.js` (apiKey, authDomain, etc.) is **safe to commit** — it's designed to be public. Security is enforced by `firestore.rules`. Never put server-side secrets (Gemini API key, Twilio tokens) in frontend code.

## Live URLs

| URL | What |
|-----|------|
| https://ahmedfawzy8866.github.io/SE/ | Main portal |
| https://ahmedfawzy8866.github.io/SE/compounds.html | Map + compounds |
| https://ahmedfawzy8866.github.io/SE/properties.html | Listings grid |
| https://ahmedfawzy8866.github.io/SE/property.html | Property detail |
| https://ahmedfawzy8866.github.io/SE/matches.html | Smart Match (AI) |
| https://ahmedfawzy8866.github.io/SE/roi.html | ROI Analysis (AI) |
| https://ahmedfawzy8866.github.io/SE/pricing.html | AVM Pricing (AI) |
| https://ahmedfawzy8866.github.io/SE/advice.html | Dream Home Finder (AI quiz) |
| https://ahmedfawzy8866.github.io/SE/virtual-tour.html | 3D tour full page |
| https://ahmedfawzy8866.github.io/SE/ai-engine.html | AI Engine dashboard |
| https://ahmedfawzy8866.github.io/SE/career.html | Career form |
| https://ahmedfawzy8866.github.io/SE/seed-firestore.html | Firestore seeding tool |

## Roadmap (deferred to backend plan)

- [ ] **Admin SPA** — Next.js admin dashboard (CRUD for compounds/listings/inquiries)
- [ ] **Gemini API** — Smart Match, AVM, ROI predictions (needs serverless function)
- [ ] **n8n webhooks** — Property Finder lead ingestion
- [ ] **Design system unification** — ai-engine + virtual-tour → shared.css
- [ ] **Inline styles cleanup** — 198 inline `style=""` → utility classes
