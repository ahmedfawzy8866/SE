# DEPLOYMENT.MD - Unified Deployment Protocol

> **Mục tiêu / Goal**: Establish a single source of truth for all production deployments, branch management, and Vercel configurations to ensure zero downtime and prevent broken builds.

---

## 🚀 1. VERCEL DEPLOYMENT STANDARDS (Monorepo)

The repository uses **Turborepo** with a Next.js client (`apps/sierra-estates-realty`).

1. **Build Configuration**:
   - Vercel must build from the **root** using `vercel.json`.
   - `vercel.json` MUST contain `"outputDirectory": "apps/sierra-estates-realty/.next"` so Vercel can locate the build.
   - The build command is `pnpm turbo build --filter=sierra-estates-realty...`.
   
2. **File Limitations**:
   - Vercel strictly rejects deployments exceeding 10,000 files.
   - You MUST ensure heavy directories like `.agent/`, `_archived_repos/`, and `.claude/` are ignored in BOTH `.gitignore` and `.vercelignore`.

3. **Deployment Command**:
   - Run `pnpm exec vercel --prod --yes` from the project root.

---

## 🛡️ 2. FIREBASE & SECURITY RULES

1. Firebase Rules (`firestore.rules`) and indexes (`firestore.indexes.json`) are managed in source control.
2. Before modifying database logic, ALWAYS verify the rules using the Firebase Local Emulator or by running `firebase deploy --only firestore:rules`.

---

## 🌿 3. GIT BRANCHING WORKFLOW

Agents and Developers MUST adhere to the following workflow:

1. **`main` Branch**: Production-only. Always deployable. Connected to `sierra-estates.net`.
2. **`staging` Branch**: Pre-production. Used for Vercel preview deployments and final QA.
3. **`feat/*` and `fix/*` Branches**: Short-lived branches. Must be merged into `staging` for testing before moving to `main`.

---

## 🚫 4. FORBIDDEN DEPLOYMENT ACTIONS

- **DO NOT** deploy if `pnpm type-check` or `pnpm lint` fails locally.
- **DO NOT** commit `.env` or API keys. Push secrets to Vercel using the Vercel CLI (`vercel env add`) or via the Vercel Dashboard.
- **DO NOT** bypass the build step. All Next.js builds must be compiled via Turborepo.

---
*This file overrides all previous legacy deployment guides.*
