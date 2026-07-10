# Cross-System Integration: Backend ↔ Admin Panel ↔ Client Site

> **Update (2026-06) — canonical admin decision.** The **in-app Next.js `/admin`
> console** inside `apps/sierra-estates-realty` is now the **canonical** admin
> surface (it calls `/api/admin/*` → `users/{uid}.role` auth + `admin-spa-mappers`).
> The standalone Vite SPA (`emeraldestatesegypt-ops/-19-6-AI`) is being **retired**:
> it talked directly to Firestore under the legacy `admins/{uid}` rules, which are
> now removed. Firestore deploys the staff-gated `users/{uid}.role` rules
> (`apps/sierra-estates-realty/firestore.rules`). Point the SPA's Vercel/Firebase
> Hosting project at a redirect to the Vercel `/admin` (via `ADMIN_HOST`). The
> sections below predate this decision and describe the old SPA-primary topology.

How the three deployed systems are wired together, what triggers a redeploy of each,
and the auth/CORS model that connects them. Written alongside PRs #9 (this repo) and
emeraldestatesegypt-ops/-19-6-AI#1.

## The three systems

| Role | Repo | Deploys to | Stack |
|---|---|---|---|
| **Backend + client site** | `ahmedfawzy8866/Sierra-Estates-Final`, `apps/sierra-estates-realty` | Vercel project `sierra-2027` (sierra-2027.vercel.app; intended domain `sierra-estates.net`) | Next.js 16, Firestore |
| **Admin panel** | `emeraldestatesegypt-ops/-19-6-AI` (deploying via fork `ahmedfawzy8866/-19-6-AI`) | Vercel project `sierra-estates-admin` (sierra-estates-admin.vercel.app) | Vite/React SPA |

A Base44 app was evaluated as an alternate public client site but dropped — too much
back-and-forth to verify changes actually applied, not worth the cost relative to
`apps/sierra-estates-realty`'s already-complete public pages. `apps/sierra-estates-realty`
is the one public client site; its `ALLOWED_ORIGINS` env var still lists the Base44 origins
from that experiment, which is harmless but can be cleaned up whenever.

`apps/admin-dashboard` in this monorepo and the old `sierra-estates-admin-portal` are both
retired — see `CLAUDE.md`. The in-app `/admin` console under `apps/sierra-estates-realty`
still exists and works, but the admin SPA above is now the intended primary admin surface;
setting `ADMIN_HOST` (see below) redirects `/admin/*` requests to it with no code changes.

## Auth model (canonical Firebase project: `sierra-estates-494404`)

All three systems share one Firebase project — `sierra-estates-494404`, Firestore database
`remixed-firestore-database-id`. This was originally the admin SPA's own project; the
backend was repointed onto it rather than the other way around, since it already had live
auth/data.

- **Role storage**: `users/{uid}.role` ∈ `{admin, superadmin, agent, broker}`. This is the
  single source of truth for "is this person an admin" — there is no separate `admins`
  collection anymore.
- **Server-side check**: `lib/server/auth-guard.ts` → `verifyAdminRequest()`. Accepts a
  Firebase ID token (`Authorization: Bearer <token>`, checked against `users/{uid}.role`)
  or a shared secret (`X-SBR-SECRET-KEY` header, or `Authorization: Bearer <SBR_SECRET_KEY>`)
  for service/cron callers.
- **Granting access**: `POST/PUT /api/admin/team` with `{ id: <firebase-uid>, name, email,
  role }`. Passing `id` writes to `users/{id}` directly (instead of an auto-generated doc),
  which is required for `verifyAdminRequest` to recognize that specific signed-in user.
  Granting `role: 'superadmin'` specifically requires the caller to already be a superadmin
  (or a trusted service/cron caller) — enforced in the route, not just client-side.
- **Bootstrapping the first superadmin**: chicken-and-egg — nobody can grant `superadmin`
  via the API until at least one `users/{uid}` doc with that role already exists. This one
  doc has to be created directly in the Firebase console for `sierra-estates-494404` (see the
  session notes / ask the person who set this up). After that, all further admin grants go
  through Settings → Admin Control in the admin SPA.

## New backend API surface (`apps/sierra-estates-realty/app/api/admin/`)

| Endpoint | Methods | Backs |
|---|---|---|
| `leads`, `leads/[id]`, `leads/bulk` | GET/POST/PATCH/DELETE | LeadsPage, OverviewPage, ReportsPage |
| `listings`, `listings/[id]` | GET/POST/PATCH/DELETE | ListingsHubPage |
| `agents`, `agents/[id]` | GET/POST/PATCH | AgentsPage, LeadsPage's agent picker |
| `workflows`, `workflows/[id]` | GET/POST/PATCH | WorkflowsPage |
| `auth/verify` | GET | App.tsx's admin-status check |
| `team` (pre-existing, extended) | GET/POST/PUT/DELETE | SettingsPage's admin management |

`lib/server/admin-spa-mappers.ts` is the schema-adapter seam: it translates between the
admin SPA's display shapes (stage labels like "Viewing Scheduled", status strings like
"Active"/"Review"/"Sold") and this app's canonical schema (`PipelineStage`, `PropertyStatus`
enums in `lib/models/schema.ts`). If you add a new mapped field, it goes here.

**Deferred (not migrated)**: notifications, chats, system_logs, system_health, search
analytics. The admin SPA still reads/writes these directly against Firestore. Migrate them
the same way (new `/api/admin/*` route + mapper) when they're actually needed.

## Real vs. placeholder worker status

`/api/admin/agents` and `/api/admin/workflows` back the admin SPA's Agents/Workflows pages,
but they're not equally "real":

- **Agents**: `apps/agents/whatsapp-scraper` already POSTs to `/api/whatsapp/heartbeat`
  every ~60s (see `WhatsAppStatusService`), writing live status to
  `system_status/whatsapp_node`. `/api/admin/agents` GET merges that real doc into its
  response alongside the manually-managed `agents` Firestore collection — so one entry
  ("WhatsApp Scraper") is genuinely live, the rest are whatever's been manually added via
  the admin UI. `apps/agents/stage-9-closer` has no heartbeat mechanism, so it isn't
  surfaced at all (no fabricated status).
- **Workflows**: entirely the manually-managed `workflows` Firestore collection.
  `lib/server/n8n-client.ts` can only fire-and-forget *trigger* n8n webhooks — it has no
  way to *list* n8n workflows or query their execution status, and building that requires
  n8n's own management API + credentials (`N8N_BASE_URL` is only used for webhook
  triggering today). Until that access exists, treat this page as a manual status board,
  not a live n8n dashboard.

## CORS

`middleware.ts` + `lib/server/cors.ts` answer preflight and set
`Access-Control-Allow-Origin` for any origin listed in the `ALLOWED_ORIGINS` env var
(comma-separated), with credentials enabled. Set on the `sierra-2027` Vercel project to
include the admin SPA's deployed origin(s) — without it, browser requests from those
origins fail CORS even though the API itself works fine via curl/Postman.

## Deploy triggers — "when X changes, what redeploys"

- **Push to `Sierra-Estates-Final` `main`** → `.github/workflows/deploy-vercel.yml` deploys
  `apps/sierra-estates-realty` (backend + public client site) to the `sierra-2027` Vercel
  project automatically. This is the *only* deploy path — Vercel's own git auto-deploy is
  disabled for this repo (`git.deploymentEnabled: false`). A second, likely-stale workflow
  `deploy2.yml` also exists and points at a different/older Vercel project — flagged as a
  follow-up cleanup, not touched here.
- **Push to `ahmedfawzy8866/-19-6-AI`** (fork) **`main`** → `sierra-estates-admin` Vercel
  project deploys via Vercel's native git auto-deploy (single-app repo, no custom Action
  needed). The fork exists because the connected GitHub account has only read access to the
  real upstream `emeraldestatesegypt-ops/-19-6-AI`; keep the fork's `main` synced with
  upstream before relying on a deploy.

## Outstanding follow-ups (tracked, not done in this pass)

1. Set `ALLOWED_ORIGINS` (and optionally `ADMIN_HOST`) on the `sierra-2027` Vercel project.
2. Repoint the `sierra-estates-admin` Vercel project's source from `apps/admin-dashboard` to
   `emeraldestatesegypt-ops/-19-6-AI`, and set `VITE_BACKEND_API_URL` + Firebase config there.
3. Bootstrap the first `users/{uid}` doc with `role: 'superadmin'` in `sierra-estates-494404`.
4. Migrate the deferred Firestore collections (notifications, chats, system logs/health,
   search analytics) onto the backend API the same way leads/listings were.
5. Remove `apps/admin-dashboard` and the admin SPA's dead `ClientHub.tsx`/`/client` route and
   `AdminMatrixApp.tsx` once everyone's confirmed nothing still points at them.
6. Disable the redundant `deploy2.yml` GitHub Action workflow.
