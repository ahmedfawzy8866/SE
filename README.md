# SE — Sierra Estates (clean Next.js + Firebase)

> A fresh, clean rebuild of the Sierra Estates client portal — Next.js App
> Router + TypeScript + Firebase. Migrated from `Sierra-Estates-Final` minus
> the tech debt. The Houyez-Style Portal design bundle lives in `/design` for
> reference.

## What's here

```
se/
├── src/
│   ├── app/
│   │   ├── layout.tsx              ← Root layout (fonts + metadata)
│   │   ├── page.tsx                ← Landing page → links to /clients
│   │   ├── globals.css             ← Base resets
│   │   ├── clients/
│   │   │   ├── page.tsx            ← /clients — Houyez-Style Portal
│   │   │   └── tour/page.tsx       ← /clients/tour — full-page 3D tour viewer
│   │   └── api/
│   │       └── houyez/
│   │           └── seed/route.ts   ← POST /api/houyez/seed (admin-only)
│   ├── components/
│   │   ├── houyez-portal/
│   │   │   ├── HouyezPortal.tsx    ← 8-section portal component
│   │   │   └── houyez-portal.css   ← Scoped styles (cyan + navy palette)
│   │   └── virtual-tour/
│   │       └── VirtualTourViewer.tsx ← Reusable iframe 3D tour wrapper
│   ├── lib/
│   │   ├── firebase.ts             ← Firebase client singleton
│   │   └── houyez/
│   │       ├── firestore.ts        ← 5 collection subscriptions + seed + upsert
│   │       └── useHouyezPortal.ts  ← React hook (live data + seed fallback)
│   └── data/
│       └── houyez-properties.ts    ← Types + static seed data
├── design/                         ← Original 6-7 design bundle (reference)
├── firestore.rules                 ← Public-read / auth-write for houyez_*
├── .github/workflows/ci.yml        ← Type-check + lint + build on every push
├── .env.example                    ← Copy to .env.local and fill in
├── package.json
├── tsconfig.json
├── next.config.mjs
└── eslint.config.mjs
```

## Quick start

```bash
# 1. Install deps
pnpm install

# 2. Configure Firebase
cp .env.example .env.local
# Edit .env.local — fill in NEXT_PUBLIC_FIREBASE_* from Firebase Console

# 3. Run dev server
pnpm dev
# Open http://localhost:3000/clients

# 4. Seed Firestore (one-time, idempotent)
curl -X POST http://localhost:3000/api/houyez/seed \
  -H "Content-Type: application/json" \
  -H "x-admin-key: $ADMIN_API_KEY" \
  -d '{}'

# (or with overwrite to wipe + re-insert)
curl -X POST http://localhost:3000/api/houyez/seed \
  -H "Content-Type: application/json" \
  -H "x-admin-key: $ADMIN_API_KEY" \
  -d '{"overwrite": true}'
```

## Architecture

### Data flow

```
src/data/houyez-properties.ts        ← static seed (fallback + initial paint)
        │
        ▼
src/lib/houyez/firestore.ts          ← Firestore subscriptions + seed + upsert
        │
        ▼
src/lib/houyez/useHouyezPortal.ts    ← React hook: subscribes to 5 collections
        │
        ▼
src/components/houyez-portal/HouyezPortal.tsx   ← renders live data
        │
        ▼
src/app/clients/page.tsx             ← embeds <HouyezPortal />
```

### Firestore collections

| Collection          | UI section                 | Doc shape                                                                  |
| ------------------- | -------------------------- | -------------------------------------------------------------------------- |
| `houyez_slides`     | Hero slider                | `{ pre, preAr, main, mainAr, img, order }`                                |
| `houyez_compounds`  | Compounds grid             | `{ name, nameAr, zone, zoneAr, count, img, order }`                       |
| `houyez_rooms`      | 360° rooms strip           | `{ name, nameAr, sub, subAr, img, order }`                                |
| `houyez_listings`   | AI-curated listings grid   | `{ code, cmp, cmpAr, zone, zoneAr, type, typeAr, beds, bath, area, egpM, usd, ai, tag, tagAr, mode, modeAr, agent, agentAr, ago, agoAr, img, order, active }` |
| `houyez_tours`      | 3D Virtual Tour player     | `{ title, titleAr, subtitle, subtitleAr, src, poster, provider, propertyCode, address, addressAr, order, active }` |

The `active` boolean is the soft-delete flag — set `false` to hide a listing
or tour without deleting the doc.

### Real-time updates

The portal uses Firestore `onSnapshot` listeners. When an admin edits a doc
via Firebase Console, the admin portal, or any other client:

1. Firestore pushes the change to all connected clients.
2. The corresponding `useHouyezPortal()` state setter fires.
3. The portal re-renders with the new data.

No redeploy, no refresh, no polling.

### Fallbacks

The portal never renders blank. The static seed data is used when:

- Firebase client isn't configured (dev without `NEXT_PUBLIC_FIREBASE_*` env vars)
- A collection is empty (first run before seeding)
- The subscription fails (network error, permission denied)

In all three cases, `usingSeed` becomes `true` and the orange "Demo data"
badge appears at the top of the portal.

## Stack

- **Next.js 15** (App Router, RSC)
- **TypeScript 5.7** (strict)
- **Firebase 11** (Auth + Firestore + Storage)
- **Tailwind 4** (base reset only — Houyez portal uses scoped CSS)
- **lucide-react** + **framer-motion** (icons + animations)
- **ESLint 9** + **Jest 29** (flat config, max-warnings 0)

## Deploy to Vercel

1. Push to GitHub
2. Import the repo in Vercel
3. Set environment variables:
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `NEXT_PUBLIC_FIREBASE_APP_ID`
   - `ADMIN_API_KEY` (any random 32-char string)
4. Deploy

## See also

- `design/HOUZEZ_IMPROVEMENTS.md` — original Houyez design revision plan
- `design/IMPLEMENTATION_STATUS.md` — original implementation tracker
- `design/ui_kits/houyez-portal/` — original HTML+JS design source (with inline 3D tour embed)
- `firestore.rules` — public-read / auth-write rules for `houyez_*` collections
