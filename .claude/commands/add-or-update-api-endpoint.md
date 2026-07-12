---
name: add-or-update-api-endpoint
description: Workflow command scaffold for add-or-update-api-endpoint in SE.
allowed_tools: ["Bash", "Read", "Write", "Grep", "Glob"]
---

# /add-or-update-api-endpoint

Use this workflow when working on **add-or-update-api-endpoint** in `SE`.

## Goal

Adds or updates an API endpoint, typically for a new feature or agent admin route.

## Common Files

- `apps/sierra-estates-realty/app/api/**/route.ts`
- `apps/agents/**/index.ts`
- `.env.example`

## Suggested Sequence

1. Understand the current state and failure mode before editing.
2. Make the smallest coherent change that satisfies the workflow goal.
3. Run the most relevant verification for touched files.
4. Summarize what changed and what still needs review.

## Typical Commit Signals

- Create or modify a file under apps/sierra-estates-realty/app/api/**/route.ts
- Optionally update related files in apps/agents/**/index.ts or similar agent logic files
- Update .env.example or documentation if new environment variables or API contracts are needed

## Notes

- Treat this as a scaffold, not a hard-coded script.
- Update the command if the workflow evolves materially.