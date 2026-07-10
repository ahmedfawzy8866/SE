# Sierra Estates Realty - Local Dev & Configuration Guide

> **For production deployment policy, CI gates, domains, and the release flow,
> see [`DEPLOYMENT.md`](./DEPLOYMENT.md) — that file is authoritative.** This
> guide only covers local environment setup.

## 📋 Table of Contents
1. [Environment Setup](#environment-setup)
2. [Firebase Configuration](#firebase-configuration)
3. [Python API (apps/api)](#python-api)
4. [Data Seeding](#data-seeding)
5. [Local Development](#local-development)
6. [Verification & Testing](#verification--testing)

---

## Environment Setup

### Step 1: Install Dependencies
```bash
cd /path/to/Sierra-Estates-Final
pnpm install
```

### Step 2: Create `.env.local`
```bash
# Copy the example env file
cp .env.example .env.local

# Edit with your Firebase credentials
nano .env.local
```

### Step 3: Verify Setup
```bash
pnpm run type-check  # Should pass with 0 errors
pnpm run lint        # Should run with strict rules
pnpm run test:ci     # Should pass all tests
```

---

## Firebase Configuration

### 1. Create Firebase Project
- Go to https://console.firebase.google.com
- Click "Create Project"
- Enable Firestore Database, Cloud Storage, and Authentication

### 2. Get Web SDK Config
1. Firebase Console → Project Settings → Your Apps → Web
2. Copy configuration and add to `.env.local`

### 3. Set Firestore Security Rules
```bash
firebase deploy --only firestore:rules
```

Or apply the rules in `firestore.rules` directly from the Firebase Console.

---

## Python API

The `apps/api/` directory contains a FastAPI backend for property search, WhatsApp webhooks, and AI integrations.

### Local Development
```bash
cd apps/api
python -m venv .venv
source .venv/bin/activate    # Windows: .venv\Scripts\activate
pip install -r requirements.txt

# Set environment variables
cp ../../.env.example .env
nano .env  # Fill in real values

# Start the API server
uvicorn main:app --reload --port 8000
# Visit http://localhost:8000/health
```

### Docker
```bash
cd apps/api
docker build -t sierra-api .
docker run -p 8000:8000 --env-file .env sierra-api
```

### Production (Railway / Fly.io / Cloud Run)
```bash
# Deploy to Railway
railway up

# Or Google Cloud Run
gcloud run deploy sierra-estates-api \
  --source apps/api \
  --region us-central1 \
  --allow-unauthenticated
```

---

## Data Seeding

### Using Script
```bash
# First, download service account from Firebase Console
# Save to: apps/sierra-estates-realty/firebase-service-account.json

cd apps/sierra-estates-realty
node scripts/seed-firestore.mjs
```

---

## Local Development

### Start all apps
```bash
# From repo root (Turborepo)
pnpm dev
```

### Start individual apps
```bash
# Web frontend + admin suite (Next.js — admin lives at /admin in this same app)
cd apps/sierra-estates-realty && pnpm dev    # http://localhost:3000
                                              # admin: http://localhost:3000/admin

# Python API (FastAPI)
cd apps/api && uvicorn main:app --reload --port 8000
```

### Verify Features
- [ ] Landing page loads at http://localhost:3000
- [ ] Theme switcher works
- [ ] Language switcher works (EN/AR)
- [ ] Admin console at http://localhost:3000/admin
- [ ] Python API health check at http://localhost:8000/health
- [ ] No console errors

---

## Verification & Testing

```bash
pnpm install          # Install all workspace deps
pnpm dev               # Start all apps in parallel
pnpm build             # Production build (Turbo, hard CI gate)
pnpm test:ci           # Run all tests
pnpm type-check        # TypeScript check, all apps (hard CI gate)
pnpm lint              # ESLint, all apps (hard CI gate)
```

**See [`DEPLOYMENT.md`](./DEPLOYMENT.md)** for the production release flow, CI
gates, domains/DNS, and the policy for adding any new app or service.

