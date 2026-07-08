# 🏠 Sierra Estates — Master Project Reference

> **This file is the soul of the project.**
> Any developer, AI agent, or contributor should read this first to understand the system.

---

## 📁 Project Structure

```
Sierra-Estates-Final/
├── apps/
│   └── admin-dashboard/          🛠️  ADMIN DASHBOARD (React + Express API)
│       ├── api/index.ts           ← Express serverless API (Firebase Admin + Twilio + PF)
│       ├── src/                   ← React admin dashboard UI
│       └── vercel.json            ← Vercel deployment config
│
├── artifacts/
│   └── sierra-estates/           🏠  CLIENT PORTAL (React Vite SPA)
│       ├── src/
│       │   ├── pages/             ← All client-facing pages
│       │   ├── hooks/useListings.ts ← Fetches from Firebase + Admin API
│       │   └── lib/firebase.ts    ← Firebase client config
│       └── vercel.json            ← Vercel deployment config
│
├── packages/                      📦  Shared packages (api-client, db, auth, etc.)
├── lib/api-client-react/          📡  Shared fetch utility (setBaseUrl, customFetch)
├── workflows/                     🤖  Automation scripts + n8n templates
│   ├── 01-whatsapp-scraper/
│   ├── 02-owner-search/
│   ├── 03-owner-contact/
│   ├── 04-email-sender/
│   ├── 05-unit-adder/
│   └── n8n-templates/
└── .github/workflows/             ⚙️  GitHub Actions CI/CD
    ├── deploy-vercel.yml
    └── external-workflows.yml
```

---

## 🖥️ Pages & Their Names

### 🏠 Client Portal — `artifacts/sierra-estates`
| Page | Route | Description |
|------|-------|-------------|
| **Home / Listings** | `/` | Main property listings grid with filters |
| **Property Detail** | `/property/:id` | Single property view with gallery + virtual tour |
| **Virtual Tour** | (embedded) | 360° equirectangular view, zoom via +/− only |
| **Client Request** | `/request` | Lead capture form (writes to Firestore `client_requests`) |
| **Contact** | `/contact` | Contact form + WhatsApp button |
| **About** | `/about` | About Sierra Estates |

### 🛠️ Admin Dashboard — `apps/admin-dashboard`
| Page | Route | Description |
|------|-------|-------------|
| **Dashboard Home** | `/` | Overview stats, recent activity |
| **Listings Manager** | `/listings` | View/add/edit all properties |
| **Leads / CRM** | `/leads` | Client leads list with Twilio SMS |
| **PropertyFinder Sync** | `/pf-sync` | Sync listings from PF Atlas API |
| **Agents Monitor** | `/agents` | Status of all automation agents |
| **Workflows** | `/workflows` | n8n-style workflow management |
| **Settings** | `/settings` | API keys, integrations, env config |

---

## 🔥 Firebase (sierra-blu)

| Resource | Value |
|----------|-------|
| Project ID | `sierra-blu` |
| Auth Domain | `sierra-blu.firebaseapp.com` |
| Firestore | `listings`, `leads`, `client_requests` collections |
| App ID | `1:941030513456:web:56209a1495d69f217086f5` |
| API Key | `AIzaSyBZLN2jTTKV34SneGPoWRz1zoRpX5uODjs` |

### Firestore Collections
| Collection | Purpose |
|-----------|---------|
| `listings` | All property listings (seeded + PF synced) |
| `leads` | Client leads submitted from portal or PF |
| `client_requests` | Direct form submissions from Client Portal |

---

## 🌐 Deployments

| App | Vercel URL | Vercel Project |
|-----|-----------|---------------|
| **Client Portal** | https://sierra-estates.vercel.app | `sierra-estates` |
| **Admin Dashboard** | https://admin-dashboard-sooty-eight-31.vercel.app | `admin-dashboard` |

### Custom Domain (Namecheap)
- Domain: `sierra-estates.net`
- **To activate:** In Vercel → sierra-estates project → Settings → Domains → Add `sierra-estates.net`
- Then in Namecheap DNS:
  - `A` record: `@` → `76.76.21.21`
  - `CNAME` record: `www` → `cname.vercel-dns.com`

---

## 🤖 Automation Agents & Workflows

| Agent | Script | Trigger | Description |
|-------|--------|---------|-------------|
| **WhatsApp Scraper** | `01-whatsapp-scraper/` | Continuous | Monitors WA group for new listings |
| **Owner Search** | `02-owner-search/` | Daily cron | Finds property owners from Google Sheets |
| **Owner Contact** | `03-owner-contact/` | Daily cron | Sends SMS/WA to owners via Twilio |
| **Email Sender** | `04-email-sender/` | Daily cron | Sends follow-up emails via SendGrid |
| **Unit Adder** | `05-unit-adder/` | Daily cron | Adds new units from broker inbox to Firestore |

### GitHub Actions Workflows
- **`deploy-vercel.yml`** — Auto-deploys both apps on push to `main`
- **`external-workflows.yml`** — Runs the 4 daily automation scripts as cron jobs

### Required GitHub Secrets
```
VERCEL_TOKEN               ← For auto-deployment
GOOGLE_SERVICE_ACCOUNT_KEY ← Firebase admin access
BROKER_INBOX_SHEET_ID      ← Google Sheets ID
PROPERTY_FINDER_JWT_TOKEN  ← PF Atlas API token
WHATSAPP_API_TOKEN         ← For WA messaging
SENDGRID_API_KEY           ← For email sending
TWILIO_ACCOUNT_SID         ← Twilio primary
TWILIO_AUTH_TOKEN          ← Twilio primary
```

---

## 📡 API Endpoints (Admin Dashboard)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Health check |
| `GET` | `/api/listings` | Get all listings from Firestore |
| `GET` | `/api/listings?id=:id` | Get single listing |
| `POST` | `/api/leads` | Submit a new lead |
| `GET` | `/api/pf/leads` | Proxy PropertyFinder leads |
| `POST` | `/api/pf/sync` | Sync PF listings → Firestore |
| `POST` | `/api/crm/sms` | Send SMS via Twilio |
| `POST` | `/api/crm/whatsapp` | Send WhatsApp via Twilio |

---

## 🔑 API Keys & Credentials

| Service | Where Set |
|---------|-----------|
| PropertyFinder Atlas | `apps/admin-dashboard/.env` → `PF_API_KEY`, `PF_API_SECRET` |
| Twilio | `apps/admin-dashboard/.env` → `TWILIO_*` |
| Firebase Service Account | `apps/admin-dashboard/.env` → `FIREBASE_SERVICE_ACCOUNT` |
| Firebase Client Config | `artifacts/sierra-estates/.env` → `VITE_FIREBASE_*` |
| Admin API URL | `artifacts/sierra-estates/.env` → `VITE_API_BASE_URL` |

---

## 🚀 How to Deploy Changes

### Local Development
```bash
# Admin Dashboard (port 3000)
pnpm --filter admin-dashboard dev

# Client Portal (port 3001)
$env:PORT="3001"; pnpm --filter @workspace/sierra-estates dev
```

### Deploy to Vercel (Production)
```bash
# Admin Dashboard
cd apps/admin-dashboard
npx vercel build --prod --token <VERCEL_TOKEN>
npx vercel deploy --prebuilt --prod --token <VERCEL_TOKEN>

# Client Portal
cd artifacts/sierra-estates
npx vercel build --prod --token <VERCEL_TOKEN>
npx vercel deploy --prebuilt --prod --token <VERCEL_TOKEN>
```

### Push to GitHub
```bash
git add -A
git commit -m "feat: <description>"
git push origin main
```

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Client UI | React 19, Vite, TailwindCSS, Framer Motion |
| Admin UI | React 19, Vite, TailwindCSS, Recharts |
| Backend API | Node.js, Express (serverless on Vercel) |
| Database | Firebase Firestore |
| Auth | Firebase Auth |
| Storage | Firebase Storage |
| Messaging | Twilio SMS + WhatsApp |
| Property Data | PropertyFinder Atlas API |
| Automation | GitHub Actions + n8n (local Docker) |
| Monorepo | pnpm workspaces + Turborepo |
| Deployment | Vercel (both apps) |

---

*Last updated: 2026-06-23 by Antigravity IDE*
