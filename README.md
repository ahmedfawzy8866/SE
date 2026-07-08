# SE — Sierra Estates (consolidated repo)

This is now the **single source of truth** for Sierra Estates. Backend,
business logic, bots, AI agents, and automation workflows all live on
`main`. The two production frontends each get their own branch — no
frontend code lives on `main`.

| Branch   | What it is                                                                 | Deploys to |
|----------|-----------------------------------------------------------------------------|------------|
| `main`   | Backend: Next.js API (`apps/sierra-estates-realty`), Python services, bots, AI agents, Firebase Functions, automation workflows. Also still carries a small root-level Next.js "client-portal shell" (`src/`) — see note below. | Firebase Functions/Hosting; the root `src/` app can deploy to Vercel separately |
| `admin`  | The live admin dashboard (React/Vite SPA), history preserved from its original repo (`ahmedfawzy8866/-19-6-AI`). | [Vercel — `admin-dashboard` project](https://vercel.com) |
| `client` | The public client-facing site, exactly as published on GitHub Pages. **Currently being refined by hand — do not wire or modify until told otherwise.** | [GitHub Pages](https://ahmedfawzy8866.github.io/SE/) (from the `gh-pages` branch; `client` is an identical copy staged for a future Vercel import) |

## `main` — backend, bots, agents, workflows

Consolidated from `Sierra-Estates-Final`, keeping only what's actually
current (the repo had accumulated many stale duplicate/archive folders —
`.archive`, `22`, `33`, `SE222`, `Sierra-Estates-Egypt`, `.claude/worktrees/*`,
etc. — none of that came along; the `arc` repo, a graveyard of older Sierra
Estates rewrites, was checked too and turned out fully superseded by what's
here).

```
SE/
├── apps/
│   ├── sierra-estates-realty/   ← Next.js backend, ~80 API routes
│   │                              (leads, listings, matching, orchestration,
│   │                              CRM, cron, webhooks, telegram, whatsapp, …)
│   ├── api/                     ← Python PropertyFinder sync worker (Cloud Run)
│   └── agents/
│       ├── whatsapp-bot/        ← WhatsApp routing bot (whatsapp-web.js)
│       ├── whatsapp-scraper/    ← WhatsApp group listing scraper
│       ├── stage-9-closer/      ← Sales-closing automation agent
│       └── sierra-blue-bot/     ← Python customer-journey bot (pulled out of
│                                   the old `portal/` static site — its HTML
│                                   frontend was a duplicate of what's on the
│                                   `client` branch, so only the bot code came)
├── packages/                    ← shared libs: agents (closer/curator/
│                                   matchmaker/scribe/openclaw), agents-core,
│                                   memory-engine, obedian, db, api, auth,
│                                   config, property-finder-api, ui
├── functions/                   ← Firebase Cloud Functions (see "Known gaps")
├── workflows/                   ← n8n templates + WhatsApp/Sheets/Firestore
│                                   sync scripts (GitHub Actions-driven)
├── hooks/, lib/                 ← shared root-level Firebase/auth/i18n helpers
├── firebase/admin-redirect/     ← Firebase Hosting target (302 redirect to
│                                   sierra-estates.net/admin)
├── firebase.json, .firebaserc, firestore.indexes.json, storage.rules
├── apps/sierra-estates-realty/firestore.rules  ← canonical rules (see below)
├── design/                      ← Sierra Estates design system reference
└── src/                         ← root Next.js app: a minimal Firebase-wired
                                    client-portal shell (see note below)
```

### About `src/` on `main`

Before this consolidation, `main` already had a small standalone Next.js +
Firebase app rendering a placeholder client portal at `/clients`
(`src/components/houyez-portal/HouyezPortal.tsx`, live Firestore
subscriptions via `src/lib/houyez/`). It reads/writes the `houyez_*`
Firestore collections.

**This was left untouched** — it wasn't part of the backend migration and
wasn't the `client` page being asked about, but it looks like it may be
scaffolding meant to receive the refined client design later ("wire it").
Flagging this explicitly rather than guessing: let me know if it should move
under `apps/`, get merged into the `client` branch work, or be left as-is.

### Firestore rules

`firebase.json` points `firestore.rules` at
`apps/sierra-estates-realty/firestore.rules` — that's the one that actually
deploys. It uses a staff-role model (`users/{uid}.role ∈ {admin,manager,agent}`)
with a broad catch-all, plus an explicit public-read section for the
`houyez_*` collections (merged in from `main`'s previous standalone
`firestore.rules`, which was removed as redundant once merged).

### Known gaps / things flagged, not fixed

- **`functions/` has two implementations.** A legacy JS pipeline
  (`collectData.js`, `processData.js`, `index.js`) and a newer TS rewrite
  (`src/index.ts`, firebase-functions v2). `functions/__tests__/backend.test.js`'s
  own docstring says the JS version is what's currently live and the TS one
  is an unshipped next-gen version — genuine migration-in-progress ambiguity,
  not something to resolve by guessing. Both are kept; **your call** on which
  to finalize and when to cut over.
- **`packages/open-memory`** (a ~280-file vendored OSS-looking package) was
  **not** migrated — zero references from `apps/sierra-estates-realty`,
  looks unused. Worth a second look before pulling it in.
- No Firebase service-account key or other real credential was found
  anywhere in the source tree during migration (checked file content, not
  just filenames). `.env.example` documents every variable the code reads;
  all values are empty except the Firebase **Web** config (safe to expose by
  design — Firebase security is enforced by Firestore Rules + Auth, not by
  hiding the web API key).
- `.firebaserc` (project alias → `sierra-blu`) is gitignored per this repo's
  existing `.gitignore` — copy it locally or run `firebase use sierra-blu`.

## `admin` branch

The live admin dashboard — React 19 + Vite 6 + TypeScript SPA, deployed on
Vercel (project `admin-dashboard`). History preserved from its original repo
(`ahmedfawzy8866/-19-6-AI`, still live and deployed there too — nothing was
touched on Vercel or that repo).

**Firebase integration done in this consolidation:**
- `api/index.ts`'s `/api/admin/auth/verify` used to just base64-decode the
  JWT payload without verifying its signature. It now calls
  `firebase-admin`'s `verifyIdToken()` (see `api/firebaseAdmin.ts`) and
  requires `email_verified`, using the shared `sierra-blu` Firebase project.
- Added `FIREBASE_PROJECT_ID` / `FIREBASE_CLIENT_EMAIL` / `FIREBASE_PRIVATE_KEY`
  to `.env.example` — set these as real secrets in Vercel, not in git.
- Dropped the redundant `package-lock.json` (pnpm is canonical per
  `pnpm-workspace.yaml`) and regenerated `pnpm-lock.yaml` for the new
  `firebase-admin` dependency.

**Known gaps, not fixed (flagging for your call):**
- `src/firebase.ts` writes notifications straight to Firestore from the
  client, while the README describes leads/listings/agents going through the
  REST backend (`src/lib/apiClient.ts`) — a dual-path architecture worth
  picking one direction on.
- Missing `@types/react`/`@types/react-dom` devDependencies (pre-existing,
  not introduced by this migration) — `tsc --noEmit` on `src/` throws a wall
  of implicit-`any` errors as a result. The new `api/` files typecheck clean.
- `PF_API_KEY`/`PF_API_SECRET`/`GEMINI_API_KEY` aren't set anywhere in the
  checkout — needed from Vercel or you before those routes work locally.

## `client` branch

An exact, untouched copy of the `gh-pages` branch — the site currently live
at **https://ahmedfawzy8866.github.io/SE/**. Static HTML/CSS/JS (Houyez-style
portal: hero, compounds, listings, virtual tour, AI hub, ROI calculator,
pricing).

**Nothing here was modified.** Per instructions, this page is being refined
by hand before any wiring happens. One thing worth knowing: this branch
(same as `gh-pages`) also has `backend/*.py` bot files and `scripts/
activate-agents.js` mixed into it — the canonical copies of those Python bot
files now live on `main` at `apps/agents/sierra-blue-bot/`; the ones on
`client`/`gh-pages` are an untouched duplicate, left as-is since cleaning
them out would mean touching this branch.

Also sitting in the local working tree (uncommitted, not part of any
branch): `gh-pages-hero-update/index.html` — looks like in-progress hero
section work. Left alone; it'll be there when you resume refining the client
page.

## Setup

```bash
# Root Next.js client-portal shell (src/)
pnpm install
cp .env.example .env.local   # fill in Firebase + backend vars you need
pnpm dev                     # http://localhost:3000/clients

# Backend (apps/sierra-estates-realty)
cd apps/sierra-estates-realty
pnpm install
pnpm dev

# Admin dashboard (admin branch)
git checkout admin
pnpm install
cp .env.example .env.local
pnpm dev                     # http://localhost:3001
```

## Deploy

- **Admin** → already deployed on Vercel (`admin-dashboard` project, org
  `team_k2jaWfzeatcYG6Qpl0ooCxQh`). Push to the `admin` branch; Vercel
  handles the rest. Not touched or reconfigured here.
- **Client** → currently GitHub Pages, serving `gh-pages`. A Vercel project
  for the `client` branch can be set up once the refined design is ready to
  wire — explicitly a future step, not done here.
- **Backend / Functions** → `firebase deploy` from `main` (after `firebase
  use sierra-blu`) deploys Hosting (the admin-redirect shim),
  Firestore rules/indexes, Storage rules, and Cloud Functions. The Next.js
  backend (`apps/sierra-estates-realty`) and the root client-portal shell
  (`src/`) each deploy to Vercel independently, same as before.
- **DNS / domain** (`admin.sierra-estates.net`) — untouched, out of scope
  for this consolidation.

## Firebase project

Everything above shares one Firebase project: **`sierra-blu`**. Firestore,
Auth, Storage, and Functions are all provisioned there — see
`apps/sierra-estates-realty/firestore.rules` for the security model and
`firebase.json` for what deploys where.
