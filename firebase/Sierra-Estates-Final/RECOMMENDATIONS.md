# Sierra Estates — Project Recommendations

> Produced by a full project scan (June 2026). Companion to `CLAUDE.md`.

## 1. Automation platform decision (cost-driven)

**Recommendation: keep scheduled data-sync on GitHub Actions ($0), reserve n8n for the WhatsApp scraper only, skip Vercel crons.**

| Platform | Fit | Cost |
|---|---|---|
| **GitHub Actions** (current) | ✅ Best for the 4 sheet-sync/outreach crons — free on public repos, already written, secrets-gated | $0 |
| **n8n self-hosted** (Docker) | ✅ Only for `01-whatsapp-scraper` — whatsapp-web.js needs a persistent browser session, which Actions runners cannot keep. Run on an always-on PC or a small VPS | $0 + ~$5/mo VPS (optional) |
| **n8n Cloud** | ❌ Starter is ~$24/mo for 2,500 executions — the 30-min unit-adder alone burns ~1,440/mo | ~$24/mo |
| **Vercel crons** | ❌ Hobby plan = once-daily only (unit-adder needs 30-min); Pro is $20/mo for no added benefit | $0–20/mo |
| **Claude Cowork scheduled tasks** | For ad-hoc business tasks (briefings, lead triage), not production data pipelines — requires the desktop app | plan usage |

**To activate the workflows:** add the repository secrets listed in `workflows/GITHUB_SECRETS_SETUP.md`
(Settings → Secrets and variables → Actions). Until then, jobs now **skip cleanly** instead of failing.

## 2. What was fixed in this pass

- All 4 External Workflow jobs guard on required secrets (no more red runs every 30 min).
- Bug: `owner-contact` had `needs: owner-search`, so its 10am run was **always skipped** — removed.
- Salvaged from stale branches before deletion: clearer middleware 401 message, `ALLOWED_ORIGINS` documentation in `.env.local.example`.
- Removed orphaned `public/assets/colors_and_type.css` (superseded by the token bridge in `app/globals.css`).
- Stale branches deleted after audit (4 fully merged, 2 superseded by newer main work).
- Resolved Architectural Gaps & Vercel deployment:
  - Fixed Next.js Vercel output resolution bugs and successfully deployed the unified monorepo to production.
  - Linked `admin.sierra-estates.net` domain and set `ADMIN_HOST` variable on Vercel to isolate admin compute.
  - Converted Type-check and Build CI pipelines into hard gates to prevent broken code merging to `main`.
  - Replaced remaining legacy `sierra-estates-realty` Firebase project IDs with the unified `sierra-estates` configuration.
  - Swept documentation to replace all old repository names (`i-sierra-2027`, `sf1`, `Sierra-2027`) with `Sierra-Estates-Final`.

## 3. Prioritized roadmap

### Security (do first)
1. **Rotate the Firebase web API key** that was committed historically (`AIzaSyBZ...` in old commits). Restrict it in Google Cloud Console (HTTP referrers + API restrictions).
2. Enable **Firebase App Check** — rules are staff-gated, but App Check blocks abusive direct client-SDK traffic.
3. Rate-limit the public lead endpoints (`/api/leads`, `/api/leads/request-viewing`) using the existing `lib/server/rate-limit.ts` (today only listings uses it).
4. Register the Telegram webhook with `secret_token` and set `TELEGRAM_WEBHOOK_SECRET` in Vercel env.

### Product / integration
5. Wire the n8n templates (`workflows/n8n-templates/`) to real triggers — `leila_lead_scoring.json` + the Leads pipeline is the highest-value pair.
6. `@sierra-estates/agents-core` and `@sierra-estates/obedian` are declared as app dependencies but never imported — either wire the orchestrator into the admin dashboard or remove them from `apps/sierra-estates-realty/package.json`.
7. Decide the fate of `apps/sierra-estates-admin-portal` (deprecated placeholder) — deleting the directory removes confusion and install weight.

### Code health
8. Split `CRMKanban.tsx` (1,474 lines) into column/card/modal components; same for `EasyListing.tsx` (897).
9. Replace 132 `console.log` calls with a leveled logger (pino is already in the dependency tree).
10. Clear the 47 lint warnings (unused vars — prefix with `_`); consider `--max-warnings 0` in CI afterward to lock it in.
11. Adopt the new `.bezel` / `.btn-orb` utilities on the listings grid and CTAs for the full editorial-luxury look.
12. Add Zod validation at remaining API boundaries (zod already in the tree).

### Operations
13. **Stop working in the OneDrive clone** — OneDrive sync makes git checkouts take 10+ minutes. Use `C:\Users\sierr\source\repos\Sierra-Estates-Final-work`.
14. Add branch protection on `main` requiring the CI check — deploys then only happen on green builds.
15. The committed `packages/*/dist/` build outputs churn on every build — consider gitignoring them and building in CI.
