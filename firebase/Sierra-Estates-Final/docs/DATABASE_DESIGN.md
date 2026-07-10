# Sierra Estates — Database Design

## Decision: Firebase Firestore (NoSQL)

**Why Firestore for this project:**
- Real-time sync needed for admin dashboard (agent status, live leads)
- Already integrated with Firebase Auth (zero overhead for auth-gated reads)
- Mobile app (Expo/React Native) + Web admin share same SDK
- Serverless — no infrastructure to manage; scales automatically
- WhatsApp bot writes lead data from Node.js via Firebase Admin SDK

**What we do NOT use (and why):**
- ❌ PostgreSQL/Neon — overkill, requires a separate server/connection pool
- ❌ SQLite — no real-time capability needed here
- ❌ Redis — Obedian file store handles agent memory (no need for Redis at this scale)

---

## Collection Schema

### `/users/{uid}`
```
{
  email: string,          // Firebase Auth email
  role: 'admin' | 'manager' | 'agent' | 'superadmin',
  displayName: string,
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```
**Access**: Admin only (read/write). Used for role-based access control.

---

### `/leads/{leadId}`
```
{
  name: string,           // Client name
  phone: string,          // WhatsApp number (+20...)
  interest: string,       // Free text: what they're looking for
  stage: enum,            // 'Initial Contact' | 'AI Matched' | 'Viewing Scheduled' | 'Negotiating' | 'Contract Draft'
  hot: boolean,           // Priority flag
  color?: string,         // UI color tag (#hex, max 7 chars)
  ownerId?: string,       // Assigned agent UID
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```
**Indexes needed:**
- `stage ASC + updatedAt DESC` (kanban board queries)
- `hot DESC + createdAt DESC` (hot leads dashboard)
- `ownerId ASC + stage ASC` (per-agent pipeline)

**Access**: Staff read; Admin write. Validated by `isValidLead()`.

---

### `/listings/{listingId}`
```
{
  code: string,           // Property code e.g. "SE001"
  cmp: string,            // Developer/compound name
  type: string,           // 'apartment' | 'villa' | 'townhouse'
  beds: int,              // Bedroom count
  area: int,              // m²
  price: string,          // Formatted price string
  ai: float,              // AI match score (0.0–10.0)
  status: enum,           // 'Active' | 'Review' | 'Sold'
  img: int,               // Image index
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```
**Indexes (existing):**
- `status ASC + price ASC` ✅ already in `firestore.indexes.json`

**Access**: All staff read; Admin write. Validated by `isValidListing()`.

---

### `/properties/{propertyId}`
```
{
  title: string,
  titleAr?: string,       // Arabic title (bilingual support)
  price: string,
  location: string,
  type: string,
  beds: int,
  baths: int,
  area: int,
  imageUrl: string,
  ...optional fields
}
```
**Access**: Public read; Admin write.

---

### `/followups/{followupId}`
```
{
  leadId: string,
  agentId: string,
  dueAt: Timestamp,
  status: 'pending' | 'done' | 'missed',
  priority: 'high' | 'normal' | 'low',
  note?: string,
  createdAt: Timestamp
}
```
**Indexes (existing, all ✅):**
- `agentId ASC + dueAt ASC`
- `leadId ASC + dueAt ASC`
- `status ASC + dueAt ASC`
- `priority ASC + dueAt ASC`
- `agentId ASC + status ASC + dueAt ASC` (composite — most important)

---

### `/ai_agents/{agentName}`
```
{
  name: string,           // 'Liela' | 'Sierra' | 'Hermes' | 'OpenClaw'
  desc: string,
  emoji: string,          // UI only
  color: string,
  status: 'Online' | 'Running' | 'Idle',
  load: int,              // 0–100 CPU/task load
  tasks: int,             // Tasks completed today
  updatedAt: Timestamp
}
```
**Access**: Admin only. Validated by `isValidAgent()`.

---

### `/workflows/{workflowId}`
```
{
  name: string,
  nameAr?: string,
  desc?: string,
  descAr?: string,
  status: 'active' | 'warning' | 'paused',
  runs: int,
  last: string,           // Last run timestamp string
  color: string,
  updatedAt: Timestamp
}
```
**Access**: Admin read; Admin write. Validated by `isValidWorkflow()`.

---

### `/owner_negotiations/{negId}`
```
{
  ownerPhone: string,
  propertyRef: string,
  status: string,
  updatedAt: Timestamp
}
```
**Indexes (existing ✅):**
- `ownerPhone ASC + status ASC`
- `status ASC + updatedAt DESC`

---

### `/chat_messages/{msgId}` (sub-collection or standalone)
```
{
  role: 'user' | 'assistant',
  content: string,
  timestamp: Timestamp,
  sessionId: string
}
```

---

### `/admins/{adminId}`
```
{
  email: string,
  role: 'Admin' | 'Superadmin',
  createdAt: Timestamp
}
```
**Access**: Bootstrapped admins only. Size: exactly 3 fields.

---

## Indexing Strategy

All composite indexes are pre-declared in `firestore.indexes.json`. Key principles:

| Rule | Applied? |
|------|----------|
| Single-field auto-indexes for all fields | ✅ Firestore default |
| Composite indexes for multi-field `where` + `orderBy` | ✅ All declared |
| No `SELECT *` (Firestore fetches whole document) | ⚠️ Use `.select()` on Admin SDK for large docs |
| Pagination with `startAfter()` cursors | ✅ Used in admin dashboard |
| TTL for agent memory (obedian-store.json) | ✅ SharedMemoryBus TTL field |

---

## Missing Indexes (Recommended Additions)

Add these to `firestore.indexes.json` for future query patterns:

```json
{
  "collectionGroup": "leads",
  "queryScope": "COLLECTION",
  "fields": [
    { "fieldPath": "stage", "order": "ASCENDING" },
    { "fieldPath": "updatedAt", "order": "DESCENDING" }
  ]
},
{
  "collectionGroup": "leads",
  "queryScope": "COLLECTION",
  "fields": [
    { "fieldPath": "ownerId", "order": "ASCENDING" },
    { "fieldPath": "stage", "order": "ASCENDING" }
  ]
},
{
  "collectionGroup": "leads",
  "queryScope": "COLLECTION",
  "fields": [
    { "fieldPath": "hot", "order": "DESCENDING" },
    { "fieldPath": "createdAt", "order": "DESCENDING" }
  ]
}
```

---

## Agent Memory (Obedian / SharedMemoryBus)

The AI agent layer uses a **separate, file-backed key-value store** (`obedian-store.json`), NOT Firestore. This is intentional:

| Storage | Used For | Why |
|---------|----------|-----|
| Firestore | Lead CRM, listings, users, workflows | Real-time UI sync |
| Obedian (JSON file) | Agent memory, learning insights, conversation history | Low-latency, local, no cost |

The SharedMemoryBus bridges all 4 agents (Liela, Sierra, Hermes, OpenClaw) via this file store.

---

## Security Architecture

- **Default-deny**: `match /{document=**} { allow read, write: if false; }`
- **Role hierarchy**: `superadmin > admin > manager > agent > public`
- **Schema validation**: All writes validated by `isValidX()` functions in rules
- **Max field counts**: Enforced (`data.keys().size() <= N`) to prevent data injection
- **Email verification**: Required for all staff operations
- **Bootstrapped admin**: Hardcoded emails for break-glass access

---

## Anti-Patterns Avoided

- ✅ No `SELECT *` in Firestore (documents are atomic)
- ✅ No unbounded collections without pagination
- ✅ Composite indexes declared before deployment
- ✅ Timestamps stored as Firestore `Timestamp`, not strings
- ✅ Sensitive data (API keys) never in Firestore — only in `.env`
