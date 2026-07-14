# Sierra Estates — Client Portal (Next.js 15)

> Public-facing real estate portal. Reads active listings from Firestore,
> supports filtering, detail pages, 3D virtual tours, and inquiry submission.

## 🔒 Zero-Trust Security

The client portal can **ONLY**:
- ✅ Read `listings` where `status = "active"`
- ✅ Create new documents in `inquiries` (write-only)

It **CANNOT** access:
- ❌ `owners` (PII — blocked by Firestore rules)
- ❌ `clients` (CRM — blocked)
- ❌ `requests` (workflow tickets — blocked)
- ❌ `agents` (RBAC directory — blocked)

Security is enforced at the database level by Firestore Security Rules,
not by this code. Even if a malicious user modifies the client-side code,
the database will reject all unauthorized reads.

## Quick Start

```bash
cd apps/client
cp .env.example .env.local
# Edit .env.local with your Firebase config
npm install
npm run dev
```

Open http://localhost:3000

## Structure

```
apps/client/
├── src/
│   ├── app/
│   │   ├── layout.tsx          ← Root layout (metadata + html shell)
│   │   ├── page.tsx            ← Homepage (featured listings)
│   │   ├── globals.css         ← Global styles
│   │   ├── listings/
│   │   │   ├── page.tsx        ← Listings grid with filters
│   │   │   └── [id]/
│   │   │       └── page.tsx    ← Listing detail (specs, tour, AI score)
│   │   └── inquire/
│   │       └── page.tsx        ← Inquiry form (writes to Firestore)
│   ├── lib/
│   │   ├── firebase.ts         ← Firebase init (singleton)
│   │   └── publicData.ts       ← Public read layer (active listings only)
│   └── components/             ← (future: shared UI components)
├── public/                     ← Static assets
├── package.json
├── tsconfig.json
├── next.config.ts
└── .env.example
```

## Pages

| Route | Description |
|-------|-------------|
| `/` | Homepage with hero + featured listings (AI-ranked top 6) |
| `/listings` | Filterable grid (mode, type, compound, beds, price) |
| `/listings/[id]` | Detail page (specs, gallery, virtual tour, AI score, inquire CTA) |
| `/inquire` | Inquiry form (pre-fills listing_id + compound from URL params) |

## Deploy to Vercel

```bash
# From the monorepo root:
vercel --cwd apps/client

# Or connect the GitHub repo to Vercel and set:
# - Root Directory: apps/client
# - Build Command: next build
# - Env vars: NEXT_PUBLIC_FIREBASE_* (from .env.local)
```

## Tech Stack

- **Next.js 15** (App Router, Server Components, Turbopack)
- **React 19**
- **TypeScript** (strict mode)
- **Firebase** (Firestore read-only for public data)
- **Lucide React** (icons)
- Shared types from `@sierra-estates/types` (workspace package)
