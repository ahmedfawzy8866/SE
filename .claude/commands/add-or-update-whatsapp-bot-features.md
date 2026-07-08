---
name: add-or-update-whatsapp-bot-features
description: Workflow command scaffold for add-or-update-whatsapp-bot-features in Sierra-Estates-Final.
allowed_tools: ["Bash", "Read", "Write", "Grep", "Glob"]
---

# /add-or-update-whatsapp-bot-features

Use this workflow when working on **add-or-update-whatsapp-bot-features** in `Sierra-Estates-Final`.

## Goal

Implements or extends WhatsApp bot features, including whitelist management and admin commands.

## Common Files

- `apps/agents/whatsapp-bot/**`
- `apps/agents/whatsapp-bot/whitelist.json`
- `apps/agents/whatsapp-bot/import-whitelist.ts`
- `ecosystem.config.cjs`
- `clients.csv`
- `.env.example`

## Suggested Sequence

1. Understand the current state and failure mode before editing.
2. Make the smallest coherent change that satisfies the workflow goal.
3. Run the most relevant verification for touched files.
4. Summarize what changed and what still needs review.

## Typical Commit Signals

- Modify or create files under apps/agents/whatsapp-bot/
- Add or update whitelist.json, import-whitelist.ts, or related admin scripts
- Update ecosystem.config.cjs if process management or deployment changes are needed
- Update clients.csv or .env.example if new clients or env vars are required

## Notes

- Treat this as a scaffold, not a hard-coded script.
- Update the command if the workflow evolves materially.