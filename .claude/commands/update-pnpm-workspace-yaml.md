---
name: update-pnpm-workspace-yaml
description: Workflow command scaffold for update-pnpm-workspace-yaml in SE.
allowed_tools: ["Bash", "Read", "Write", "Grep", "Glob"]
---

# /update-pnpm-workspace-yaml

Use this workflow when working on **update-pnpm-workspace-yaml** in `SE`.

## Goal

Keeps the pnpm-workspace.yaml file up to date to ensure correct monorepo package detection and CI cache operation.

## Common Files

- `pnpm-workspace.yaml`

## Suggested Sequence

1. Understand the current state and failure mode before editing.
2. Make the smallest coherent change that satisfies the workflow goal.
3. Run the most relevant verification for touched files.
4. Summarize what changed and what still needs review.

## Typical Commit Signals

- Edit pnpm-workspace.yaml to add or update the 'packages' field.
- Commit the changes with a message referencing CI or workspace fixes.
- Push to remote to unblock CI or reflect new structure.

## Notes

- Treat this as a scaffold, not a hard-coded script.
- Update the command if the workflow evolves materially.