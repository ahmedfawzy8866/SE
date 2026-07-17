# Sierra Estates — Agent Guidelines & Memory Engine

Welcome to the Sierra Estates workspace. As an AI Agent working in this repository, you must adhere to the following business logic, design protocols, and AI workflows. This is the **Experience Core** of the project.

## 1. Project Identity & Stack

- **Brand**: Sierra Estates (formerly Sierra Blu)
- **Codename**: i:Sierra 2027
- **Stack**: Next.js 16 (App Router) + Firebase/Firestore + Tailwind CSS v4 + Python backend
- **Markets**: New Cairo, Madinaty, El Shorouk
- **Architecture Layers**:
  - `apps/sierra-estates-realty/`: The Next.js Client App
  - `F:\Sierra Estates\admin-panel\`: The Vite Admin Backend (Pure Management Interface)

## 2. Design Protocol — Quiet Luxury

- **Aesthetic**: Apple-style minimalism, editorial typography, cinematic feel
- **Primary base**: Deep Corporate Navy `#0A1628`
- **CTA / Highlights / Logo**: Signature Matte Gold `#C9A24D`
- **Typography on dark**: Soft Ivory `#F4F0E8`
- **Fonts**: Playfair Display (EN luxury), Cairo (AR modern), Inter (data/numbers)
- **UI Rules**: 
  - Glassmorphic UI — backdrop-blur, translucent panels, subtle borders
  - Framer Motion for interactive animations only
  - All images must use `next/image` with explicit dimensions (Next.js client)

## 3. Business Logic — HARDCODED RULES

1. **Currency Threshold** (NON-NEGOTIABLE): Price < 10,000 → USD ($). Price >= 10,000 → EGP.
   - Example: 1600 = $1,600 | 23000 = 23,000 EGP
2. **SBR Code Pattern**: `[CompoundCode]-[Rooms][FurnishingCode]-[PriceCode]`
   - Example: MIV-3F-1.6K = Mivida, 3BR, Furnished, $1,600
3. **Value Hunter**: Price <= 70% of compound mean → tag "High Value" gold badge
4. **Master Coordinates**: Mivida: 30.0104, 31.5165 | Eastown: 30.0152, 31.4984

## 4. The Intelligence Layer (Four-Agent System)

We organize backend logic and AI logic into four core personas:
- **The Scribe 📝**: Maintains API specs, system documentation, and integration guides.
- **The Curator 🎨**: Enforces design system, Tailwind colors, typography, and glassmorphic rhythms.
- **The Matchmaker 🤝**: Scores properties against investor profiles using 3 criteria: Intent, Capital, Timeline.
- **The Closer 💼**: Automates deals, proposals, PDF generation, contracts, and revenue analytics.

## 5. Automated Workflows (n8n & Node Scripts)

- **01-whatsapp-scraper**: Monitors WhatsApp groups for property listings, dumping to Google Sheets.
- **02-owner-search**: Scrapes direct-owner properties from Property Finder/OLX.
- **03-owner-contact**: Automates WhatsApp outreach to owners.
- **04-email-sender**: Sends bulk matches and investor briefings.
- **05-unit-adder**: Cleans and deduplicates new units into Firestore.

## 6. The "Velvet Scythe" Sales Strategy

- Our WhatsApp and Bot outreach relies on 3 phases:
  - **The Hook (Liela Bot)**: "مساء الخير، هل الوحدة متاحة؟ لدينا عملاء جاهزين." (Professional, automated filter).
  - **The Closer (Human)**: "نحن شركة تدير محافظ استثمارية. وحدتك تطابق عميل VIP." (Elevates the interaction).
  - **Loyalty (Post-Sale)**: Follow up after closing to manage the property, generating exclusive listings.
- We act as **Property Managers and Trusted Advisors**, not just traditional brokers.

## 7. Strict Integration Rules

1. No heavy map APIs in client components — lightweight vector overlays only.
2. TypeScript strict — no `any` types.
3. Every commit must pass `next build`.
4. API keys in `.env` only — NEVER in source files.

*(This file is automatically loaded by Antigravity as the project rules.)*
