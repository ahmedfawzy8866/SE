---
name: client-pages
description: Architecture, conventions, and guardrails for the Sierra Estates public client site (homepage, properties, compounds, property detail, virtual tour). Use when building, refining, or reviewing any page under apps/sierra-estates-realty/app that is not /admin or /api.
---

# Sierra Estates — Client (public) pages

Everything client-facing lives in `apps/sierra-estates-realty/app`. Consult the vault note
`docs/obsidian-vault/Repo Cleanup & Rebuild Ledger.md` (§5a) before structural changes.

## Route map (the ONLY valid public routes)

| Route | Page file | Renders |
|---|---|---|
| `/` | `app/page.tsx` | `app/ClientHome.tsx` (homepage) |
| `/properties` | `app/properties/page.tsx` | `app/client/PropertiesPortal.tsx` |
| `/compounds` | `app/compounds/page.tsx` | `app/client/CompoundsPortal.tsx` |
| `/property/[id]` | `app/property/[id]/page.tsx` | `app/client/PropertyDetail.tsx` |
| `/virtual-tour` | `app/virtual-tour/page.tsx` | `app/client/VirtualTourPortal.tsx` |

**There is no `/listings` route.** Listing links go to `/properties`; detail links go to
`/property/{firestoreDocId}` (string ids only — numeric ids are local fallback data with no
detail page).

## Two component trees — do not mix their styles

1. **Homepage tree** (`ClientHome.tsx` + `app/client-home.css`): uses the unified design
   tokens in `app/tokens/*.css` (`--gold`, `--bg-e`, `--font-display`, `sb-eyebrow`,
   `sb-display`, `btn-gold`, `se-pcard__*`). Styles live in `client-home.css` ONLY — no
   styled-jsx blocks (a duplicated block was removed once already).
2. **Houzez portal tree** (`app/client/*` + `app/client/houzez.css`, class prefix `hz`/plain):
   ported from the designer's houzez-portal kit. Shared atoms in `app/client/ui.tsx`
   (`Nav`, `Topbar`, `Footer`, `PropertyCard`, `Reveal`, `SierraConcierge`), i18n copy in
   `app/client/copy.ts`, data + Firestore mapping in `app/client/portalData.ts`.
   `app/client/HomePortal.tsx` is currently unrouted (kept as the kit's home variant).

## Data pattern

Pages render instantly from local fallback arrays, then hydrate from Firestore client SDK
(`collection(db, 'properties')`) if non-empty; Firestore errors are swallowed so local dev
works unconfigured. Follow `fetchListings`/`mapDoc` in `app/client/portalData.ts` — never
throw on missing Firestore config, never block first paint on the network.

## i18n / RTL

- Locale comes from `@/lib/I18nContext` (`useI18n`) — `next-intl` was removed; do not add it.
- Every page sets `dir={isAr ? 'rtl' : 'ltr'}` on its root and provides full AR copy.
- Use logical CSS (`inset-inline-start/end`, `text-align: start`) so RTL works for free.

## Motion

- framer-motion entrances only: translateY ease-in, `viewport={{ once: true }}`.
- Always gate on `useReducedMotion()`; CSS animations need a
  `@media (prefers-reduced-motion: reduce)` counterpart.

## Contact / branding

WhatsApp, phone, and branding come from `SiteConfig` in `lib/config.ts` — never hardcode
numbers in components. (The `app/client/*` tree still hardcodes `201092048333`; unify
toward `SiteConfig` when touching those files, after confirming the correct number.)

## SEO

- Per-page `export const metadata` is mandatory for every new public page.
- `app/sitemap.ts` and `app/robots.ts` exist — add new public routes to the sitemap.
- `metadataBase` (`https://sierra-estates.net`) is set in `app/layout.tsx`.
- Homepage emits `RealEstateAgent` JSON-LD from `app/page.tsx`.
- Public pages must be native Next.js pages — never iframes (invisible to Google).

## Verify before pushing

```bash
pnpm type-check && pnpm lint   # from repo root; both are real CI gates
```

Admin (`app/admin/*`) and API routes are out of scope for this skill — see `CLAUDE.md`
for their auth model.
