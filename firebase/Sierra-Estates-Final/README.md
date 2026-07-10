# Sierra Estates Platform - Unified Monorepo

Unified monorepo for the Sierra Estates luxury PropTech platform (New Cairo market). This repository contains the API routes, core services, multi-agent frameworks, Firebase cloud functions, external automation workflows, and the **Admin Console & Client Hub frontend interface**.

## Stack
- **Frontend / Admin OS:** Vite + React + TailwindCSS (v4) + Lucide Icons + Recharts
- **Python Backend Sidecar:** FastAPI + Uvicorn + Docker (PropertyFinder Atlas sync & Bot implementer)
- **Functions:** Node.js 20 Cloud Functions
- **Database & Storage:** Firebase Firestore + Auth + Cloud Storage
- **Monorepo Manager:** PNPM Workspaces

## 📦 Repository Structure

```
Sierra-Estates-Final/
├── apps/
│   ├── admin-dashboard/       # Consolidated Admin Console + Client Hub frontend application
│   │   ├── api/               # Express/Fastify API server routes (Auth, Twilio, PropertyFinder proxy)
│   │   ├── src/               # React + Tailwind frontend application
│   │   │   ├── components/    # Page components (ClientHub, Overview, AgentsPage, WorkflowsPage, ScribePage)
│   │   │   └── lib/           # Clients (firebase, apiClient)
│   │   └── package.json       # Dev & build scripts for the dashboard
│   ├── api/                   # Python FastAPI service — PropertyFinder sync + AI bot implementation
│   │   ├── main.py            # FastAPI entry point
│   │   ├── property_finder_sync.py # PropertyFinder API logic
│   │   └── Dockerfile         # Container definition
├── packages/
│   ├── agents-core/           # Multi-agent framework, workflow engine, and AI registry
│   ├── obedian/               # Local JSON-backed long-term memory module
│   └── exchange/              # Firestore message bus between Admin, Agents, and Workflows
├── functions/                 # Firebase Cloud Functions (Node.js 20)
│   └── lib/                   # Compiled functions
├── firestore.rules            # Production Firestore security rules
├── storage.rules              # Production Storage security rules
├── pnpm-workspace.yaml        # Monorepo workspace configuration
├── package.json               # Root dependencies
└── firebase.json              # Firebase configuration
```

## 🚀 Quick Start

### Prerequisites
- **Node.js** 20+
pnpm install
cp .env.example .env   # fill in your credentials
pnpm dev               # Next.js API on :3000
docker-compose -f docker-compose.n8n.yml up -d  # n8n on :5678
```

## Project Structure

```
.
├── backend/                    # Next.js 15 API-only app
│   └── src/
│       ├── app/api/            # 20 REST API routes
│       └── lib/
│           ├── agents/         # AI agent definitions
│           ├── firebase/       # Firebase client init
│           ├── models/         # Firestore schemas
│           ├── server/         # Admin SDK, auth, AI
│           ├── services/       # 15 business-logic services
│           └── types/          # Shared TypeScript types
├── apps/
│   ├── api/                    # Python FastAPI
│   └── agents/
│       ├── stage-9-closer/     # Deal orchestration (S9–S10)
│       └── whatsapp-scraper/   # WhatsApp group scraper bot
├── functions/                  # Firebase Cloud Functions
├── packages/
│   ├── db/                     # Shared Firestore DSL
│   └── agents-core/            # 15-agent orchestration framework
└── workflows/                  # n8n + external scripts
```

## API Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/admin/deploy` | POST | Admin deploy trigger |
| `/api/agent/hub` | POST | Multi-agent hub (Scribe/Curator/Matchmaker/Closer) |
| `/api/closer/initiate` | POST | Stage 9 closer agent |
| `/api/ingest/whatsapp` | POST | WhatsApp message ingestion |
| `/api/leads` | POST | Create investment stakeholder |
| `/api/leads/request-viewing` | POST | Request property viewing |
| `/api/listings` | GET | Fetch portfolio assets |
| `/api/matching` | POST | Run AI matching engine |
| `/api/orchestrate` | POST | Full S1–S10 pipeline |
| `/api/properties/sync` | POST | Property Finder sync |
| `/api/property-finder` | GET/POST/PUT/DELETE | PF gateway |
| `/api/proposals` | POST | Generate proposal |
| `/api/sync` | GET/POST | Sync management |
| `/api/sync/publish` | POST | Publish to Property Finder |
| `/api/telegram/setup` | GET | Telegram webhook setup |
| `/api/telegram/webhook` | POST | Telegram bot handler |
| `/api/viewing-requests` | GET/POST | Viewing requests |
| `/api/webhooks/property-finder` | POST | PF webhook (HMAC verified) |
| `/api/webhooks/whatsapp` | GET/POST | WhatsApp webhook |
| `/api/whatsapp/heartbeat` | POST | Scraper heartbeat |
| `/api/whatsapp/webhook` | POST | WhatsApp message handler |

## Intelligence Pipeline

```
WhatsApp Groups
    └─→ /api/webhooks/whatsapp (Scribe agent — S1/S2)
            └─→ Firestore rawScrapeData
                    └─→ processDataForApp (Cloud Function)
                            └─→ Matching Engine (S6/S7/S8)
                                    └─→ Stage 9 Closer Agent
                                            └─→ Telegram alerts + Proposals
```

## Agents

### Staging
```bash
pnpm build
firebase deploy --project sierra-estates-staging
```

## Deployment

# Deploy to production
firebase deploy --project sierra-estates-prod

## Security

### Rollback
```bash
# Instant rollback to previous version
firebase hosting:rollback

# Function-specific rollback
firebase deploy --only functions:api --region us-central1 [previous-version]
```

## 💰 Cost Analysis (Monthly)

| Service | Est. Cost | Notes |
|---------|-----------|-------|
| Firebase Hosting | $15 | CDN included, 100GB bandwidth |
| Cloud Functions | $40 | 100M invocations/mo |
| Firestore | $50 | 1B reads, 100GB storage |
| Cloud Storage | $5 | 10GB stored, 50GB outbound |
| Logging | $20 | 50GB/month, 7-day retention |
| Pub/Sub | $10 | 1B messages/mo |
| **Subtotal** | **$140** | Infrastructure only |
| **AI APIs** | $500-2K | Anthropic, Google, OpenAI (variable) |
| **Total** | **$640-2,140** | Estimated monthly |

**Cost Optimization Tips**:
- ✅ Batch Firestore writes (-30%)
- ✅ Cache API responses at CDN (-25%)
- ✅ Use regional Firestore (-20%)
- ✅ Optimize function cold-starts (-15%)

## 📋 Environment Variables

See `.env.example` for complete list. Key variables:

```env
# Firebase
NEXT_PUBLIC_FIREBASE_PROJECT_ID=sierra-estates-prod
FIREBASE_ADMIN_SDK_KEY=...

# APIs
ANTHROPIC_API_KEY=...
GOOGLE_AI_API_KEY=...

# Observability
ARIZE_API_KEY=...
OTEL_EXPORTER_OTLP_ENDPOINT=...

# Integrations
PROPERTY_FINDER_API_KEY=...
TELEGRAM_BOT_TOKEN=...
```

## 🔐 Security

- ✅ Type-safe with TypeScript strict mode
- ✅ Authentication via Firebase Auth + JWT
- ✅ Secrets via Google Secret Manager
- ✅ CORS & CSP headers configured
- ✅ SQL injection prevention (Zod validation)
- ✅ XSS protection (React automatic escaping)
- ✅ Rate limiting on Cloud Functions
- ✅ Firestore Security Rules enforced
- ✅ Cloud Storage CORS restricted

## 📚 Documentation

- `ARCHITECTURE.md` - System design & data flows
- `DEPLOYMENT_GUIDE.md` - Deployment procedures & runbooks
- `API.md` - REST API specifications
- `CONTRIBUTING.md` - Developer setup & workflow
- `RESOURCES.md` - Consolidated archive resources


## 🤝 Contributing

1. Create feature branch: `git checkout -b feature/name`
2. Follow TypeScript strict mode
3. Add tests for new functionality
4. Run linter & tests: `pnpm validate-build`
5. Submit pull request with description

## 📞 Support

- **Issues**: GitHub Issues (this repo)
- **Docs**: See `ARCHITECTURE.md`, `API.md`, `DEPLOYMENT_GUIDE.md`
- **Team**: Slack #sierra-estates

## 📄 License

Proprietary - Sierra Estates Inc.

---

**Last Updated**: May 31, 2026  
**Build**: Turbopack + Turborepo  
**Status**: Production Ready ✅

---

## 🤖 Antigravity AI OS — Enhancement Plan

> Powered by **Antigravity IDE** · Engineered by the Sierra Estates engineering team.

This section documents the AI-native enhancements layered on top of the core platform. These features are tracked live in the Admin Dashboard (`/admin`), synced to Firebase Firestore, and reflected in `enhancements_obsidian.md` for the Obsidian vault.

### 🚀 Phase Overview

| Phase | Name | Status |
|-------|------|--------|
| Phase 1 | Dynamic Data (Firebase) | 🔄 In Progress |
| Phase 2 | AI Search & Matchmaking (OpenClaw) | 🔄 In Progress |
| Phase 3 | WhatsApp Automation & CRM | 🔄 In Progress |
| Phase 4 | Hermes AI Direct Assistant | ✅ Scaffolded |
| Phase 5 | Market Expansion & Analytics | ⏳ Planned |

---

### 🧠 HERMES — AI Direct Assistant

**Hermes** is Sierra Estates' AI-powered sales and negotiation assistant, running on the Hermes JS Engine with the OpenClaw AI gateway.

**Skills equipped:**

| Skill | Methodology |
|-------|-------------|
| 🗣️ **Communication** | Bilingual (AR/EN), WhatsApp-optimized, rapport-first |
| 💼 **Sales** | SPIN Selling — Situation · Problem · Implication · Need-Payoff |
| 🤝 **Negotiation** | BATNA strategy, anchoring, conditional close, concession framework |
| 🔍 **AI Property Search** | OpenClaw vector search, natural language queries |
| 📊 **Lead Extraction** | Auto-captures budget, area, property type, timeline from chat |

**Hermes handles:**
- Incoming WhatsApp messages → AI-powered conversational responses
- Lead qualification → Auto-logs to Firestore `crm_leads` collection
- Agent notifications → WhatsApp alerts when a lead is ready to close
- Fallback logic → Rule-based responses when AI API is unavailable

---

### 📱 WhatsApp CRM Integration

The WhatsApp Business API is wired to Hermes via `lib/whatsapp.ts`:

```
Incoming WhatsApp → Webhook → hermesAgent.chat() → Reply → Firestore CRM log
```

**Environment variables needed:**
```env
EXPO_PUBLIC_WA_PHONE_ID=your_phone_number_id
EXPO_PUBLIC_WA_TOKEN=your_access_token
EXPO_PUBLIC_WA_VERIFY_TOKEN=sierra_hermes_2026
EXPO_PUBLIC_OPENCLAW_KEY=your_openclaw_api_key
```

---

### 🛠️ Technical Stack (AI Layer)

| Component | Technology |
|-----------|-----------|
| JS Engine | Hermes (configured in `app.json`) |
| AI Gateway | OpenClaw v2026 (`openclaw` npm package) |
| Crypto | `react-native-ecc` for ECC-encrypted voice messages |
| AI Search | OpenClaw vector index (`lib/aiSearch.ts`) |
| Agent | `lib/agents/hermes.ts` — Hermes singleton agent |
| WhatsApp | `lib/whatsapp.ts` — Business API v19 integration |
| CRM | `lib/crm.ts` — Firestore-backed lead management |
| Admin UI | `app/admin.tsx` — Live dashboard with CRM + task tracker |

---

### 📊 Market Valuation (New Cairo, 2026)

| Metric | Value |
|--------|-------|
| Target Market | New Cairo (Uptown, Settlement, Madinaty, Sherouk, New Capital) |
| Estimated TAM | EGP 4.2 Billion |
| Active Listings | 500+ units |
| Avg Price/m² | EGP 18,000 – 35,000 |
| Projected Year-1 Revenue | EGP 150 Million |
| WhatsApp Lead Conversion Target | 8% |

---

**Last Updated**: June 26, 2026  
**Build**: Turbopack + Turborepo + Hermes JS Engine  
**AI**: OpenClaw + Hermes Agent  
**Status**: Production Ready ✅ | AI Layer Active 🤖
