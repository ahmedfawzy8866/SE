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
├── career.html             ← Career application form
├── seed-supabase.html      ← One-time Supabase seeding tool
│
├── shared.css              ← Shared styles (incl. RTL icon flipping)
├── shared.js               ← Shared logic (i18n, theme, animations)
├── data.js                 ← Seed data (slides, listings, compounds, rooms)
│
├── supabase-config.js      ← Supabase project config (EDIT THIS with your values)
├── supabase.js             ← Supabase integration layer (window.SIERRA_DB)
├── schema.sql              ← PostgreSQL schema + RLS policies (run in Supabase SQL Editor)
│
├── assets/                 ← Logo images
├── logo-gold.png           ← Logo (light bg)
├── scripts/                ← Utility scripts
│
├── .archive/               ← Archived/dead files (kept for history, not used)
│
└── .gitignore              ← Excludes SSL certs, Twilio codes, service accounts, .env
```

---

## 🟢 Supabase Setup (NEW — Backend Integration)

The portal now has **Supabase (PostgreSQL)** integration. It's **disabled by default** — the site works perfectly with static `data.js` until you enable it.

### Why Supabase?
- ✅ PostgreSQL (relational, ACID, powerful queries)
- ✅ Row Level Security (RLS) — same concept as Firestore rules
- ✅ Real-time subscriptions (compound changes reflect instantly)
- ✅ Built-in Auth (email/password + OAuth)
- ✅ Generous free tier (500MB database, 50k monthly active users)
- ✅ Matches the addendum's tech stack

### Step 1: Create Supabase Project
1. Go to https://supabase.com → sign in
2. Click "New project" → fill in name, password, region
3. Wait ~2 minutes for provisioning

### Step 2: Run the Schema
1. In your Supabase dashboard, open **SQL Editor** (left sidebar)
2. Click "New query"
3. Paste the entire contents of `schema.sql` (from this repo)
4. Click **Run** (▶ button)
5. This creates 8 tables + RLS policies + indexes + realtime

### Step 3: Get Your API Keys
1. Go to **Project Settings → API**
2. Copy:
   - **Project URL** (e.g. `https://abcd1234.supabase.co`)
   - **anon public** key (long string starting with `eyJ...`)

### Step 4: Edit `supabase-config.js`
```javascript
window.SIERRA_SUPABASE_CONFIG = {
  url:        "https://abcd1234.supabase.co",     // ← your URL
  anonKey:    "eyJhbGciOiJIUzI1NiIsInR5cCI6..."   // ← your anon key
};
window.SIERRA_SUPABASE_ENABLED = true;             // ← flip to true
```

### Step 5: Seed the Database
1. Open https://ahmedfawzy8866.github.io/SE/seed-supabase.html
2. Verify connection status is green
3. Click "Seed Supabase Now"
4. Wait for completion (52 compounds + ~9 listings)

### Step 6: Make Yourself Admin
1. In Supabase dashboard → **Authentication → Users**
2. Click "Add user" → create your admin account
3. Copy the **UID** of your user
4. Go to **SQL Editor** → run:
```sql
INSERT INTO users (id, email, name, role)
VALUES ('YOUR-COPIED-UID', 'your@email.com', 'Ahmed', 'admin');
```

### How It Works
- **Supabase enabled**: Portal reads compounds/listings from PostgreSQL (real-time)
- **Supabase disabled OR connection fails**: Portal falls back to static `data.js` (always works)
- **Inquiry form**: Tries Supabase first, falls back to CSV download + localStorage
- **Career form**: Same pattern — Supabase primary, CSV fallback

### Tables Created

| Table | Purpose | Access |
|-------|---------|--------|
| `compounds` | All 52 New Cairo compounds | Public read, admin write |
| `listings` | Active property listings | Public read, admin write |
| `units` | Per-compound unit inventory | Public read, admin write |
| `agents` | Real estate agents | Public read, admin write |
| `inquiries` | Form submissions from site | Public create, admin read |
| `career_applications` | Job applications | Public create, admin read |
| `leads` | Property Finder webhook leads | Public insert, admin all |
| `users` | Admin profiles + roles | Self read, admin write |

---

## Recent fixes

### Map: Arabic + Dark theme (latest)
- Map markers show compound names in Arabic when site language = Arabic
- 52 compounds translated (Mivida → ميفيدا, Hyde Park → هايد بارك, etc.)
- Dark theme loads CARTO dark tiles + gold markers
- Default remains English + Light (no regression)
- Filter bar translated: "ابحث باسم الكمبوند…"

### Code Audit Fixes
1. **Inquiry form** — wired to Supabase with CSV fallback
2. **React dev builds** → production.min.js
3. **Dead files** moved to `.archive/`
4. **`'use strict'`** added to all IIFEs
5. **aria-labels** added for accessibility
6. **5 missing i18n keys** added (EN + AR)
7. **loading="lazy"** for performance

### RTL + Arabic
- Directional icons flip via `transform: scaleX(-1)` when `dir="rtl"`
- All map markers, filter labels, count text translate to Arabic

## Security

The following files are in `.gitignore` and will NEVER be committed:
- SSL certificates
- Twilio 2FA recovery codes
- Supabase service_role key (NEVER put this in frontend code!)
- `.env` files

**Note:** The Supabase anon key in `supabase-config.js` is **safe to commit** — it's designed to be public. Security is enforced by RLS policies in `schema.sql`. Never put the `service_role` key in frontend code.

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
| https://ahmedfawzy8866.github.io/SE/seed-supabase.html | Supabase seeding tool |

## Roadmap (deferred to backend plan)

- [ ] **Admin SPA** — Next.js admin dashboard (CRUD for all tables)
- [ ] **Gemini API** — Smart Match, AVM, ROI predictions
- [ ] **n8n webhooks** — Property Finder lead ingestion → `leads` table
- [ ] **Design system unification** — ai-engine + virtual-tour → shared.css
