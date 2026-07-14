# Sierra Estates — consolidated client + admin (single-page each)

This deliverable is the missing Next.js source tree for the `ahmedfawzy8866/SE` repo. It creates exactly **two routes** — `/` (client) and `/admin` (admin) — each a single page that pulls in every component, hook, API route, type, and seed datum it needs. It also fixes the GitHub Actions deploy failure (the workflow expected `apps/sierra-estates-realty/` to exist as the Vercel rootDirectory; now it does).

## What was wrong before

The repo had Next.js + pnpm + Turbo + Tailwind 4 config files at the root, but **zero Next.js source code** in any branch. The deploy-vercel.yml workflow was targeting `apps/sierra-estates-realty` as the Vercel rootDirectory, but that directory did not exist. So `vercel pull` failed with HTTP 401/403 → exit code 1 → red run.

## What this delivers

```
apps/sierra-estates-realty/        ← Vercel rootDirectory (now exists)
├── package.json                   App-specific deps
├── next.config.ts                 Server-external firebase-admin, image hosts
├── tsconfig.json                  Strict TS, @/* path alias
├── postcss.config.mjs             Tailwind 4
├── tailwind.config.ts             (not needed — Tailwind 4 CSS-first config in globals.css)
├── next-env.d.ts
├── middleware.ts                  Guards /admin and /api/admin/*
├── vercel.json                    Vercel project config (Next.js zero-config)
├── .env.example                   All required env vars documented
│
├── app/
│   ├── layout.tsx                 Root layout, fonts, providers (I18n + Toast)
│   ├── globals.css                Tailwind 4 + brand tokens (gold + navy)
│   │
│   ├── page.tsx                   ★ THE ONE CLIENT PAGE (route: /)
│   │                              Composes: Hero + SearchBar, ListingsGrid,
│   │                              CompoundsMap, SmartMatch, ROICalculator,
│   │                              InquiryForm, Navbar, Footer.
│   │
│   ├── admin/
│   │   └── page.tsx               ★ THE ONE ADMIN PAGE (route: /admin)
│   │                              8 tabs: Dashboard, Listings, Inquiries,
│   │                              Leads, Users, Reports, Audit logs, Settings.
│   │                              Auth gate → <AdminSignIn/> if no session.
│   │
│   └── api/                       10 route handlers
│       ├── auth/route.ts             GET me, POST sign-in/sign-out
│       ├── listings/route.ts         GET (filtered), POST (manager+)
│       ├── listings/[id]/route.ts    GET, PUT (manager+), DELETE (admin)
│       ├── compounds/route.ts        GET (52 compounds)
│       ├── inquiries/route.ts        POST (public concierge form)
│       ├── matches/route.ts          POST quiz → top 3 listings
│       ├── leads/route.ts            GET (manager+), POST (webhook)
│       └── admin/
│           ├── dashboard/route.ts    GET KPIs (manager+)
│           ├── inquiries/route.ts    GET list, PUT update (manager+)
│           ├── users/route.ts        GET list, PUT update (admin)
│           ├── reports/route.ts      GET aggregated analytics
│           └── audit/route.ts        GET audit log (manager+)
│
├── lib/
│   ├── types.ts                  All domain types (Listing, Inquiry, User, …)
│   ├── firebase.ts               Client SDK singleton (NEXT_PUBLIC_*)
│   ├── firebase-admin.ts         Admin SDK lazy singleton (server-only)
│   ├── seed.ts                   52 compounds + 8 listings + 6 agents
│   ├── auth.ts                   HS256 session cookies + requireRole()
│   ├── i18n.tsx                  en/ar provider, useI18n() hook
│   ├── format.ts                 USD/EGP/area/score/relative formatters
│   └── api-client.ts             Typed fetch wrappers used by components
│
└── components/
    ├── client/
    │   ├── AuthModal.tsx         Provider + modal (Firebase or demo admin)
    │   ├── Toast.tsx             ToastProvider + useToast()
    │   ├── Navbar.tsx            Sticky, glass-on-scroll, en/ar toggle
    │   ├── Footer.tsx            Brand + columns + contact
    │   ├── Hero.tsx              5-slide carousel + search overlay
    │   ├── SearchBar.tsx         Buy/rent toggle + filters
    │   ├── ListingsGrid.tsx      Grid + inline filter + detail modal
    │   ├── PropertyCard.tsx      Card with AI score badge + save
    │   ├── PropertyDetail.tsx    Full modal with ROI preview + agent CTA
    │   ├── CompoundsMap.tsx      Leaflet map (CDN-loaded) of 52 compounds
    │   ├── SmartMatch.tsx        5-step quiz → top 3 results
    │   ├── ROICalculator.tsx     Price + rent → yield/payback
    │   └── InquiryForm.tsx       Concierge form (POST /api/inquiries)
    │
    └── admin/
        ├── types.ts              AdminTab union type
        ├── Sidebar.tsx           Vertical nav with role-based tab visibility
        ├── AdminSignIn.tsx       Auth gate for /admin
        ├── Drawer.tsx            Right-side sliding panel for forms
        ├── DataTable.tsx         Sortable + searchable + paginated table
        ├── StatCard.tsx          KPI tile
        ├── Dashboard.tsx         6 KPIs + activity feed + top agents
        ├── ListingsManager.tsx   CRUD table + create/edit drawer
        ├── InquiriesPipeline.tsx 6-column kanban with status moves
        ├── LeadsTable.tsx        PF webhook leads with status dropdown
        ├── UsersManager.tsx      Role + status editor
        ├── Reports.tsx           4 analytics panels (bar/line/leaderboard/donut)
        ├── AuditLogs.tsx         Immutable log viewer
        └── Settings.tsx          Site config (admin-only)

pnpm-workspace.yaml               ← Updated to include apps/*
turbo.json                        ← Updated task graph
package.json (root)               ← Updated: pnpm + turbo orchestrator
```

## How the single pages are wired

### Client page (`/`)

`app/page.tsx` is a server component (default export) that wraps everything in `<AuthProvider>` and renders, in order:

```
<Navbar/>                          ← sticky, opens AuthModal on click
<main>
  <Hero onSearch={setFilters}/>    ← passes filters down
  <ListingsGrid initialFilters={filters}/>  ← re-fetches when filters change
  <CompoundsMap/>                  ← loads Leaflet + 52 markers
  <SmartMatch/>                    ← 5-step quiz → /api/matches
  <ROICalculator/>                 ← pure client-side math
  <InquiryForm/>                   ← POST /api/inquiries
</main>
<Footer/>
```

All sections live on the SAME page — no client-side routing. Section anchors (`#listings`, `#compounds`, `#match`, `#roi`, `#concierge`) handle smooth-scroll nav.

### Admin page (`/admin`)

`app/admin/page.tsx` is a client component (uses `useState` for the active tab). When the user lands:

1. `<AuthProvider>` calls `GET /api/auth` → reads session cookie.
2. If no session → renders `<AdminSignIn/>` (auth gate).
3. If signed in → renders `<Sidebar/>` + the active tab's component.
4. Tabs are switched with internal state, not URL routing — true single-page.
5. Server-side role enforcement: every `/api/admin/*` route calls `requireRole(req, "manager")` (or `"admin"` for users + settings).

## Auth flow

Two paths:

| Path | When | How |
|---|---|---|
| Demo admin | `FIREBASE_SERVICE_ACCOUNT` env unset | `tryDemoLogin()` accepts hardcoded `admin@sierra-estates.net` / `sierra-admin`. Mints a HS256-signed session cookie. |
| Real Firebase | `FIREBASE_SERVICE_ACCOUNT` set | Client signs in with Firebase Auth → gets ID token → `POST /api/auth` with `token` field → server verifies with Admin SDK → reads role from `/users/{uid}` in Firestore → mints session cookie. |

The session cookie (`sierra_sess`) is `httpOnly`, `secure` in prod, `sameSite=lax`, 12-hour TTL. Signed with `SESSION_SECRET` env var (falls back to a dev secret). Verified in `middleware.ts` for `/api/admin/*` and in `requireRole()` for fine-grained role checks.

## Data flow

Every API route follows the same pattern:

```
1. Try Firebase Admin SDK (Firestore).
2. If it returns data → use it.
3. If Firestore fails OR Admin SDK not initialized → fall back to SEED_*.
```

So the app renders correctly on first deploy with zero Firebase configuration, then seamlessly upgrades to live Firestore once credentials are added. No code changes required.

## Install + run locally

```bash
# 1. From repo root
pnpm install

# 2. Copy env (optional — sandbox mode works without it)
cp apps/sierra-estates-realty/.env.example apps/sierra-estates-realty/.env.local
# Fill in NEXT_PUBLIC_FIREBASE_* + FIREBASE_SERVICE_ACCOUNT for production.
# For local dev, leave blank — demo admin + seed data work.

# 3. Run dev server
pnpm dev
# → http://localhost:3000        (client page)
# → http://localhost:3000/admin  (admin page; sign in with admin@sierra-estates.net / sierra-admin)
```

## Deploy — two-domain architecture

The app deploys to **two Vercel projects** from the same codebase:

| Domain | Vercel project | What it serves |
|---|---|---|
| `sierra-estates.net` | Client project (`CLIENT_VERCEL_PROJECT_ID`) | Client page at `/`; `/admin/*` redirects to admin subdomain |
| `admin.sierra-estates.net` | Admin project (`ADMIN_VERCEL_PROJECT_ID`) | Admin page at `/` (rewritten from `/admin`); all `/api/admin/*` endpoints |

The host-split is enforced at runtime by `middleware.ts` reading the `ADMIN_HOST` env var. Both projects run the same code — the middleware decides what to serve based on the request's `Host` header.

### Setup steps (one-time)

1. **Create two Vercel projects** (Vercel dashboard → Add New → Project):
   - **Client project**: connect to the `ahmedfawzy8866/SE` GitHub repo. Root Directory = `apps/sierra-estates-realty`. Add domain `sierra-estates.net`.
   - **Admin project**: connect to the same repo. Root Directory = `apps/sierra-estates-realty`. Add domain `admin.sierra-estates.net`.
   - Copy both projects' `prj_...` IDs.

2. **Set GitHub repo variables** (Settings → Secrets and variables → Actions → Variables):
   - `CLIENT_VERCEL_PROJECT_ID` = client project's `prj_...`
   - `ADMIN_VERCEL_PROJECT_ID` = admin project's `prj_...`

3. **Set GitHub repo secret** (Settings → Secrets and variables → Actions → Secrets):
   - `VERCEL_TOKEN` = a Vercel team token with Projects Read+Write + Env Vars Read scope (regenerate if the old one returns 403)

4. **Set env vars on BOTH Vercel projects** (dashboard → project → Settings → Environment Variables). Identical on both:

   | Var | Value |
   |---|---|
   | `ADMIN_HOST` | `admin.sierra-estates.net` |
   | `CLIENT_HOST` | `sierra-estates.net` |
   | `COOKIE_DOMAIN` | `.sierra-estates.net` |
   | `NEXT_PUBLIC_CLIENT_URL` | `https://sierra-estates.net` |
   | `NEXT_PUBLIC_ADMIN_URL` | `https://admin.sierra-estates.net` |
   | `NEXT_PUBLIC_FIREBASE_API_KEY` | (from Firebase console) |
   | `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | (from Firebase console) |
   | `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | (from Firebase console) |
   | `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | (from Firebase console) |
   | `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | (from Firebase console) |
   | `NEXT_PUBLIC_FIREBASE_APP_ID` | (from Firebase console) |
   | `FIREBASE_SERVICE_ACCOUNT` | (full JSON, single line) |
   | `SESSION_SECRET` | (32+ random chars: `openssl rand -hex 32`) |
   | `PF_WEBHOOK_TOKEN` | (optional — only if using PF webhook ingest) |

5. **Push to `main`** — the workflow deploys both projects in parallel.

### How the host-split works

```
User visits sierra-estates.net
  → middleware: host != ADMIN_HOST → serve client page
  → user clicks /admin → middleware: redirect to https://admin.sierra-estates.net

User visits admin.sierra-estates.net
  → middleware: host == ADMIN_HOST → rewrite / to /admin
  → admin page renders, calls /api/admin/* on admin.sierra-estates.net
  → session cookie (domain=.sierra-estates.net) is sent → authenticated

User signs in on either domain
  → POST /api/auth → session cookie set with domain=.sierra-estates.net
  → cookie works on BOTH subdomains → no second sign-in needed
```

### Local dev (single-domain mode)

Leave `ADMIN_HOST`, `CLIENT_HOST`, `COOKIE_DOMAIN`, `NEXT_PUBLIC_CLIENT_URL`, and `NEXT_PUBLIC_ADMIN_URL` unset. The middleware falls back to single-domain mode: `/admin` renders on the same host as `/`.

## Tech notes

- **Tailwind 4 CSS-first config** — no `tailwind.config.js`. All tokens live in `@theme` in `app/globals.css`.
- **No `next-intl`** — per CLAUDE.md, i18n is custom. `lib/i18n.tsx` provides `useI18n()` returning `{ t, locale, setLocale, dir }`.
- **Leaflet via CDN** — `CompoundsMap.tsx` dynamically loads Leaflet 1.9.4 CSS+JS from unpkg at runtime, so no npm dependency is added. SSR-safe.
- **Server-only `firebase-admin`** — listed in `serverExternalPackages` in `next.config.ts` so Next.js doesn't try to bundle it for the client.
- **TypeScript strict** — `tsconfig.json` has `"strict": true`. All API routes return typed JSON.
- **Audit logging** — `PUT /api/admin/inquiries` and `PUT /api/admin/users` write to `/audit_logs` collection on every change.
- **Demo admin credentials** — `admin@sierra-estates.net` / `sierra-admin`. Disabled automatically once `FIREBASE_SERVICE_ACCOUNT` is set.

## Files to copy into the existing repo

Everything under `apps/sierra-estates-realty/` is new. The three root files (`package.json`, `pnpm-workspace.yaml`, `turbo.json`) are updates — replace the existing ones. No other existing files need to be touched.
