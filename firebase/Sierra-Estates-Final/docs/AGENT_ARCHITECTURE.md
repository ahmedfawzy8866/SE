# Sierra Estates — Agent Network Architecture

## Overview

The Sierra Estates agent network is a multi-agent AI system built for real estate automation.
All agents share a single persistent memory layer (Obedian) and self-improve over time via the Learning Loop.

---

## Agent Roster

| Agent | Role | Interface |
|-------|------|-----------|
| **Liela** | Direct Assistant & Lead Triage | WhatsApp (primary face) |
| **Sierra** | Main Intelligence & Property Matching | Internal (behind Liela) |
| **OpenClaw** | Data Retrieval & Property Verification | Internal (called by Sierra) |
| **Hermes** | Message Delivery & Channel Routing | Internal (delivery layer) |
| **CloserAgent** | Deal Closing (Stage 7-9) | Internal (triggered by Sierra) |

---

## Folder Structure

```
Sierra-Estates-Final/
├── apps/
│   ├── admin-dashboard/          # React admin UI
│   └── agents/
│       ├── whatsapp-bot/         # Liela WhatsApp interface (NEW)
│       │   ├── index.js          # Entry point (whatsapp-web.js)
│       │   ├── router.ts         # Intent classifier + agent router
│       │   └── __tests__/        # Unit + integration tests
│       ├── whatsapp-scraper/     # Legacy broker group monitor
│       └── stage-9-closer/       # Closing agent
│
├── packages/
│   ├── agents-core/
│   │   └── src/
│   │       ├── personas/         # Agent identity files (NEW)
│   │       │   ├── liela.md      # Liela persona + system prompt
│   │       │   ├── sierra.md     # Sierra persona + system prompt
│   │       │   ├── hermes.md     # Hermes persona + system prompt
│   │       │   └── openclaw.md   # OpenClaw persona + system prompt
│   │       ├── orchestrator.ts   # Multi-agent pipeline runner
│   │       ├── registry.ts       # Loads personas from .md files
│   │       ├── learning-loop.ts  # Self-improvement system (NEW)
│   │       └── workflows.ts      # Pre-defined pipelines
│   │
│   ├── memory-engine/
│   │   └── src/
│   │       ├── memory-engine.ts  # In-memory pub/sub engine
│   │       ├── shared-memory-bus.ts # Persistent shared memory (NEW)
│   │       └── __tests__/        # Memory tests (NEW)
│   │
│   ├── obedian/
│   │   └── src/
│   │       └── index.ts          # JSON file-backed memory store
│   │
│   └── db/
│       └── lib/
│           └── sierra-estates-view-configs.ts  # Admin view DSL
│
├── jest.config.js                # Root test configuration (NEW)
└── docs/
    └── AGENT_ARCHITECTURE.md    # This file
```

---

## How Agents Communicate

```
WhatsApp Message
     │
     ▼
[WhatsApp Bot Router] (router.ts)
     │ classifies intent
     │ determines urgency
     ├─→ [Liela] ─────────── primary response generator
     │       │
     │       ├─→ [Sierra] ── property analysis + recommendations
     │       │       │
     │       │       └─→ [OpenClaw] ── real-time data lookup
     │       │
     │       └─→ [Hermes] ── message formatting + delivery
     │
     └─→ [CloserAgent] ─── stage 7-9 deal closing
     └─→ [Human Alert] ─── escalation to human agent
```

---

## Shared Memory

All agents read from and write to a single **obedian-store.json** file via `SharedMemoryBus`.

### Memory Tags
| Tag | Written By | Read By |
|-----|-----------|---------|
| `conversation-history` | system, liela | sierra, liela |
| `lead-profile` | liela | sierra, closer |
| `property-data-{code}` | openclaw | sierra, liela |
| `market-insight-{area}` | openclaw | sierra |
| `learning-insight` | system (learning-loop) | all agents |
| `human-escalation` | system | human agents |
| `execution-log` | all agents | learning-loop |

---

## Self-Learning Loop

The **LearningLoop** runs nightly (or on-demand) and:
1. Reads all `execution-log` entries from shared memory
2. Identifies success/failure patterns per agent
3. Detects client preference trends
4. Writes `learning-insight` entries back to shared memory
5. All agents read these insights on next startup to improve their responses

This implements the **"develop themselves day after day"** requirement.

---

## Running Tests

```powershell
# All tests
npx jest

# With coverage
npx jest --coverage

# Specific package
npx jest packages/memory-engine

# Watch mode
npx jest --watch
```

---

## Environment Variables

```env
# Required for direct AI mode
GOOGLE_AI_API_KEY=your_gemini_key

# WhatsApp bot
SE_API_URL=http://localhost:3000
SBR_SECRET_KEY=your_secret

# Memory
MEMORY_PERSISTENCE=file       # file | memory | database
MEMORY_LEARNING=true
MEMORY_AUDIT=true

# Learning
LEARNING_MIN_EXECUTIONS=10
LEARNING_CRON_INTERVAL=86400000  # 24h in ms
```

---

## Deploying Without Breaking Everything

Each component is isolated and independently deployable:

- **whatsapp-bot**: `apps/agents/whatsapp-bot/` → deploy as separate Node.js process
- **api backend**: `apps/api/` → deploy as FastAPI Docker container
- **admin-dashboard**: `apps/admin-dashboard/` → deploy as Vite SPA to Vercel/Firebase
- **packages**: Published as internal packages via pnpm workspaces

Changes to one app/package do NOT affect others as long as package interfaces are maintained.
