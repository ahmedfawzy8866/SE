# TODO — Sierra Estates Feature & Fix Backlog

Aligned with STATUS.md. Sorted by deployment-readiness (pre-deploy → post-deploy).

## ✅ Sierra Estates 2026 Completed
- [x] Split-Hero with Virtual Tour
- [x] AI Smart Filter
- [x] CRM Leads API
- [x] Property Finder Sync API
- [x] Careers Page (Framer Motion)
- [x] Design System (`design.css`)

## 🆕 Next Logical Steps
- [ ] Connect AI Smart Filter to real Firestore query
- [ ] Integrate real Virtual Tour SDK
- [ ] Add unit tests for CRM leads API
- [ ] Mobile responsive fixes for PremiumHero

## 🚨 Pre-Deployment (blocking)
- [ ] **Deploy Firestore rules** to production: `firebase deploy --only firestore:rules,storage` (requires local Firebase credentials; user action)
- [ ] **Set environment secrets** in Vercel + Google Secret Manager (never in chat/git)
  - [ ] NEXT_PUBLIC_FIREBASE_* (public; safe to commit)
  - [ ] SBR_SECRET_KEY (rotate from current value)
  - [ ] JWT_SECRET, ENCRYPTION_KEY (rotate if ever shared)
  - [ ] Firebase admin JSON key (keep in Secret Manager, never in code)
  - [ ] Third-party API keys: Google Sheets, Airtable, Telegram, WhatsApp, etc.
- [ ] **Verify staff users exist** in Firestore: every staff member needs `users/{uid}` doc with role ∈ {admin, manager, agent}
- [ ] **Smoke-test on staging** (or skip if confidence is high)
- [ ] **CI green**: type-check, lint (including config validation), tests all pass

## 📦 Post-Deployment (operational)
- [ ] **Monitor**: Set up alerts in OpenTelemetry/Arize for error rates, latency, custom metrics
- [ ] **Rate-limit tuning**: Monitor public endpoints for false-positives; adjust windowMs/maxRequests if needed
- [ ] **Log retention**: Set Firestore/Storage backup cadence; archive old logs
- [ ] **Rotate credentials**: Quarterly rotation of SBR_SECRET_KEY, JWT_SECRET, Firebase admin key

## 💡 Enhancement Candidates (safe, high-value, not blocking)
- [ ] **Edge rate-limiting**: Move from in-memory to Upstash Redis for multi-instance consistency
- [ ] **Request/response validation**: Add zod schemas to public endpoints (leads, listings, concierge) to prevent API contract drift
- [ ] **Refresh stale docs**: Audit issue/PR descriptions for outdated TODO/STATUS refs
- [ ] **Real AI service**: Replace MockAIService with actual implementation (or switch to LLM vendor)
- [ ] **Consolidate secrets**: Move web app from Vercel to Firebase Hosting + Functions for unified secrets/deployment (lower priority)

## 🐛 Known Issues (low-priority)
- i18n: next-intl wired but underutilized in some flows
- Test coverage: 47 tests passing, but overall coverage ~45%; expand for critical paths

## 📚 Documentation
- [ ] Update CLAUDE.md if stack/conventions change
- [ ] Keep STATUS.md + TODO.md in sync with actual state
- [ ] Archive closed issues/PRs if their TODO/STATUS refs become confusing

## 📱 WhatsApp Outreach — 4 real Twilio numbers provisioned (Egypt)
- [x] Service layer wired: `lib/server/whatsapp-queue.ts` (load-balanced
      per-number claim, 30/2hr window + 120/day/number + 480/day total,
      12pm-8pm Africa/Cairo gate), `lib/server/twilio-client.ts` (REST send +
      official `validateRequest` signature check), `app/api/cron/whatsapp-dispatch`
      (drain worker), `app/api/webhooks/twilio-status` (delivery/read receipts).
- [x] Owner negotiations wired end-to-end: `startOrContinueOwnerNegotiation` /
      `findActiveOwnerNegotiationByPhone` / `appendOwnerNegotiationMessage` in
      whatsapp-queue.ts; `OmnichannelChatService.handleIncomingMessage` routes
      an inbound reply to the negotiation thread BEFORE generic lead handling;
      minimal entry point at `app/api/admin/owner-negotiations` (GET list /
      POST initiate).
- [x] New `app/api/webhooks/twilio-inbound` route: the *only* inbound route
      that correctly parses Twilio's `application/x-www-form-urlencoded`
      payload (the older `webhooks/whatsapp` and `ingest/whatsapp` routes call
      `req.json()` unconditionally and would 500 on real Twilio traffic — left
      those alone since they're the scraper bot's/other gateways' targets, not
      Twilio's).
- [x] Tests: `__tests__/whatsapp-queue.test.ts` (load-balancing across the 4
      senders, daily-cap-skip, stale-window-reset, all 4 operating-hour
      boundaries), `__tests__/omnichannel-routing.test.ts` (negotiation-first
      routing priority).
- [ ] **Ops — set in Vercel** (the 4 real numbers + Twilio creds are in a
      local-only `.env.local`, never committed): `WABA_NUMBER_1..4`,
      `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, optionally
      `TWILIO_MESSAGING_SERVICE_SID` (only set this if NOT registering the 4
      numbers as individual senders — using a Messaging Service makes Twilio
      pick the sender, which breaks the per-number 30/2hr accounting above).
- [ ] **Ops — Twilio Console**: complete WhatsApp Business sender
      registration for the 4 numbers; set each sender's (or the Messaging
      Service's) inbound webhook to `${NEXT_PUBLIC_SITE_URL}/api/webhooks/twilio-inbound`
      and the status callback is set automatically per-send (no console config
      needed for that one).
- [ ] **Ops — cron tier**: `*/10` dispatch schedule in `vercel.json` needs
      Vercel Pro (Hobby = daily-only cron); alternative is calling
      `/api/cron/whatsapp-dispatch` from an external scheduler with
      `Authorization: Bearer $CRON_SECRET`.
- [ ] Deploy `firestore.indexes.json` (now includes 2 new `owner_negotiations`
      composite indexes) — `firebase deploy --only firestore:indexes`.
- [ ] Build an admin UI page for owner negotiations (the API exists; no page
      surfaces it in `/admin` yet — out of scope for this pass).

## 🧹 Repo Cleanup
- [x] Divergent `firestore.rules` resolved: `firebase.json` now deploys the
      staff-gated `apps/sierra-estates-realty/firestore.rules`
      (`users/{uid}.role`); the legacy root `admins/{uid}` rules file is deleted.
- [x] `apps/{admin-dashboard,sierra-blu-admin-portal,sierra-blu-realty}` excluded
      from `pnpm-workspace.yaml` (stopped participating in CI; kept on disk).
- [ ] `apps/frontend` is still a live (if trivial) workspace member and still
      undeployed dead weight — wasn't covered by the exclusion above.

## 🐍 Python
- [ ] Schedule analytics-report.py via GitHub Actions cron
- [ ] Add unit tests for LeadScorer class
- [ ] Connect lead-scorer.py to live Firestore in production
- [ ] WhatsApp template message approval workflow

## 🎨 Frontend
- [ ] Wire LeadScoreBadge into CRM dashboard
- [ ] Add StatsCard to admin analytics page
- [ ] Mobile responsive pass for PremiumHero
