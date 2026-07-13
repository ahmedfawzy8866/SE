# SIERRA BLUE — FULL PROJECT HANDOVER
**Date:** June 2026  
**Status:** Active Development  
**Language:** English (all future work)

---

## 1. COMPANY CONTEXT

**Company:** Sierra Blue (سييرا بلو)  
**Market:** Egypt (Real Estate)  
**Philosophy:** "Beyond Brokerage" — consultative advising, transparency about availability, anti-phantom-listings  
**Bot Language:** Egyptian professional Arabic dialect  

---

## 2. TWO ACTIVE PROJECTS

---

### PROJECT A: DATA PIPELINE
**Goal:** Single Source of Truth → `Master.xlsx`

#### Architecture
```
Gmail (Excel attachments)
         ↓
    MERGE & NORMALIZE
         ↓
Local Files (I:\Alpha)
         ↓
    DEDUPLICATE by Mobile
         ↓
    Master.xlsx ← Source of Truth
         ↓
   Airtable API (future)
```

#### What Was Built
- ✅ Excel merge + classify + deduplicate script
- ✅ Phone number normalization function:
  - Egypt `+20` → 11-digit local
  - Saudi `+966` → 11-digit local
  - UAE `+971` → 11-digit local
  - Strips all non-numeric characters before comparison
- ✅ `RUN.bat` launcher for Windows

#### Bugs Fixed / Still Needed
| # | Issue | Status |
|---|-------|--------|
| 1 | Source files in Alpha NOT being deleted | ❌ STILL BROKEN |
| 2 | Delete columns B, C, R from output | ❌ STILL NEEDED |
| 3 | Priority columns (Name, Mobile, Price, Rooms, Location) not first | ❌ STILL NEEDED |
| 4 | Data scattered across distant columns | ❌ STILL NEEDED |

#### Next Build (Agreed Items 1, 3, 4)
```
1. Gmail integration (OAuth → download Excel attachments)
3. Read local files from I:\Alpha
4. Normalize columns: Name, Mobile, Price, Rooms, Location, Type, Source, Timestamp
```
**NOT yet built** — was moving to fresh chat when handover was requested.

#### Standard Column Schema (Master.xlsx)
```
| Name | Mobile | Price | Rooms | Location | Type | Source | Timestamp |
```
- **Type values:** Owner-Rent, Owner-Resale, Broker-Rent, Broker-Resale
- **Source values:** Gmail, Local
- **Dedup key:** Mobile (normalized)

#### File Paths
```
Input:  I:\Alpha\*.xlsx  (raw files — DELETE after processing)
Output: Master.xlsx      (single source of truth)
```

---

### PROJECT B: WHATSAPP AI BOT
**Goal:** Automate full customer journey from WhatsApp inquiry → agent handoff

#### Architecture
```
Customer WhatsApp Message
         ↓
   Bot (6-Step Workflow)
         ↓
   Step 1: Greeting & Intent
   Step 2: Property Availability (Property Finder API)
   Step 3: Customer Preferences Discovery
   Step 4: Shortlist Properties
   Step 5: Schedule Viewing (Google Calendar)
   Step 6: Handoff to Human Agent (HubSpot)
```

#### What Was Built (1,950+ lines, 6 files)
- ✅ Core bot engine + workflow orchestrator
- ✅ Data models: `PropertyData`, `CustomerPreferences`, `LeadProfile`
- ✅ Enums: property types, statuses
- ✅ HubSpot CRM integration
- ✅ Property Finder API integration
- ✅ WhatsApp via Twilio + Meta API (both)
- ✅ Google Calendar integration
- ✅ Mixpanel analytics
- ✅ Arabic system prompt (Egyptian dialect)
- ✅ Docker config + deployment scripts
- ✅ Security guide + `.env` template

#### ⚠️ SECURITY INCIDENT
Live Property Finder API credentials were shared in chat.  
**ACTION REQUIRED:**
- [ ] Regenerate Property Finder API key immediately
- [ ] Move all credentials to `.env` file
- [ ] Add `.env` to `.gitignore`
- [ ] Never share credentials in chat again

#### Required API Keys (ALL must be in `.env`)
```env
PROPERTY_FINDER_API_KEY=
PROPERTY_FINDER_API_SECRET=
HUBSPOT_API_KEY=
META_PHONE_NUMBER_ID=
META_ACCESS_TOKEN=
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
GOOGLE_CALENDAR_CREDENTIALS=
MIXPANEL_TOKEN=
```

---

## 3. TOOLS & SKILLS CREATED THIS SESSION

| Tool | Location | Purpose |
|------|----------|---------|
| `excel-skill/SKILL.md` | `/mnt/user-data/outputs/` | Excel transformation documentation |
| `excel-skill/scripts/transform_excel.py` | `/mnt/user-data/outputs/` | Runs column delete, reorder, consolidate |
| `file-scanner-excel/SKILL.md` | `/mnt/user-data/outputs/` | Auto-scan before processing |
| `file-scanner-excel/scanner.py` | `/mnt/user-data/outputs/` | Detects duplicates, empty cols, errors |

#### New Workflow (Going Forward)
```
1. You upload file + say "transform: delete B,C,R | reorder Name,Mobile,Price,Rooms,Location"
2. I scan immediately (no questions)
3. I show findings table
4. You say YES once
5. I execute + download V2
```

---

## 4. AIRTABLE (FUTURE)

**Agreed structure (5 tables):**
1. Properties
2. Clients
3. Agents
4. Transactions
5. Viewings

**Recommended approach:** Import Master.xlsx → let Airtable auto-generate schema → then refine  
**Status:** Not started — comes after Master.xlsx pipeline is working

---

## 5. WHAT TO BUILD NEXT (PRIORITY ORDER)

```
PRIORITY 1 — Data Pipeline (SB_simple V2)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
□ Fix: Alpha file deletion actually working
□ Fix: Delete columns B, C, R
□ Fix: Reorder → Name, Mobile, Price, Rooms, Location first
□ Fix: Consolidate scattered data into correct columns
□ New: Gmail OAuth + download Excel attachments
□ New: Read I:\Alpha local files
□ New: Unified column normalization
□ New: Output Master.xlsx as single source of truth

PRIORITY 2 — Bot Deployment
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
□ Regenerate exposed API credentials
□ Set up .env file properly
□ Test bot with real WhatsApp number
□ Connect to live HubSpot CRM
□ Deploy via Docker

PRIORITY 3 — Airtable Integration
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
□ Import Master.xlsx to Airtable
□ Set up 5-table schema
□ Build API push from Python pipeline
□ Connect bot leads → Airtable
```

---

## 6. TECHNICAL STACK

| Layer | Technology |
|-------|-----------|
| Language | Python 3.8+ |
| Data | pandas, openpyxl |
| WhatsApp | Twilio + Meta Cloud API |
| CRM | HubSpot |
| Calendar | Google Calendar API |
| Analytics | Mixpanel |
| Database | Airtable (planned) |
| Email | Gmail OAuth |
| Deployment | Docker |
| Local Files | `I:\Alpha\*.xlsx` |

---

## 7. KEY PRINCIPLES (DON'T REPEAT THESE MISTAKES)

1. **Credentials NEVER in chat** — always `.env` file
2. **No back-and-forth** — scan first, confirm once, execute
3. **Dedup by Mobile** — normalize phone numbers before comparing
4. **English only** — all code and docs going forward
5. **Master.xlsx is sacred** — never overwrite, only append + dedup

---

## 8. CHAT REFERENCES

| Chat | Topic |
|------|-------|
| `abc68ed5` | WhatsApp Bot + API integrations + Security incident |
| `b219cd12` | Excel pipeline + Phone normalization + V2 fixes needed |
| `7eafc9ce` | Airtable database structure recommendation |
| This chat | Excel skill + Scanner + Handover document |

---

**END OF HANDOVER**  
*Ready to continue from Priority 1 — just upload your file or say "start pipeline build"*
