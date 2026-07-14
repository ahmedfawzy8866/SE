---
name: Sierra-Estates-Final
description: Legacy development patterns from the Sierra-Estates-Final codebase: commit conventions, API endpoint and WhatsApp bot workflows, and MVP frontend release process. Use for historical context on those workflows.
---

# Sierra-Estates-Final Development Patterns

> Auto-generated skill from repository analysis

## Overview

This skill teaches you the core development patterns, coding conventions, and common workflows used in the `Sierra-Estates-Final` TypeScript codebase. The repository powers real estate and agent automation, including API endpoints, WhatsApp bot features, and a single-file MVP frontend. It emphasizes clear commit conventions, modular TypeScript, and robust developer tooling. This guide will help you quickly contribute, debug, and extend the project using established best practices.

## Coding Conventions

### File Naming

- Use **camelCase** for file names:
  - `agentLogic.ts`
  - `whatsappBotHandler.ts`
  - `importWhitelist.ts`

### Import Style

- Both default and named imports are used; prefer named imports for clarity.

```typescript
// Named import (preferred)
import { getAgentById, updateAgent } from './agentLogic';

// Mixed import
import mainHandler, { helperFunction } from './utils';
```

### Export Style

- Use **named exports** for modules.

```typescript
// agentLogic.ts
export function getAgentById(id: string) { /* ... */ }
export function updateAgent(agent: Agent) { /* ... */ }
```

### Commit Messages

- Follow **Conventional Commits**:
  - Prefixes: `feat`, `fix`, `chore`, `docs`
  - Example: `feat(api): add endpoint for agent admin actions`

### Other Conventions

- Environment variables are documented in `.env.example`.
- Configuration files use standard naming (`tsconfig.json`, `eslint.config.mjs`).
- VS Code settings are stored in `.vscode/`.

## Workflows

### Add or Update API Endpoint
**Trigger:** When you need to expose new backend functionality or admin actions via API.  
**Command:** `/new-api-endpoint`

1. Create or modify a file under `apps/sierra-estates-realty/app/api/**/route.ts`.
2. If needed, update related agent logic in `apps/agents/**/index.ts` or similar files.
3. Update `.env.example` or documentation if new environment variables or API contracts are required.

**Example:**
```typescript
// apps/sierra-estates-realty/app/api/agents/route.ts
import { getAgentById } from '../../../agents/agentLogic';

export async function GET(request) {
  // ...handle request
}
```

---

### Add or Update WhatsApp Bot Features
**Trigger:** When you want to add new capabilities or filters to the WhatsApp bot agent.  
**Command:** `/update-whatsapp-bot`

1. Modify or create files under `apps/agents/whatsapp-bot/`.
2. Add or update `whitelist.json`, `import-whitelist.ts`, or related admin scripts.
3. Update `ecosystem.config.cjs` if process management or deployment changes are needed.
4. Update `clients.csv` or `.env.example` if new clients or environment variables are required.

**Example:**
```typescript
// apps/agents/whatsapp-bot/import-whitelist.ts
import whitelist from './whitelist.json';
// ...logic to import or update whitelist
```

---

### VS Code Config and Debug Workflow
**Trigger:** When you want to improve or standardize developer tooling for the project.  
**Command:** `/update-vscode-config`

1. Add or update `.vscode/launch.json` for debugging or Docker tasks.
2. Add or update `.vscode/settings.json` for interpreter or linter settings.
3. Optionally add or update `.pylintrc` or `.markdownlintignore` for linting rules.

**Example:**
```json
// .vscode/launch.json
{
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/apps/agents/whatsapp-bot/index.ts"
    }
  ]
}
```

---

### Fix TypeScript, ESLint, and Config Errors
**Trigger:** When you need to resolve build, lint, or type errors after code changes.  
**Command:** `/fix-typescript-eslint`

1. Edit TypeScript source files to fix types or unused variables.
2. Update or add `tsconfig.json` or `eslint.config.mjs` to adjust lint/type rules.
3. Update `.gitignore` to exclude new build artifacts or config files.

**Example:**
```typescript
// Fix unused variable
const unused = 42; // Remove if not needed

// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noUnusedLocals": true
  }
}
```

---

### Single-File MVP Frontend Release
**Trigger:** When you want to release or revise a standalone MVP frontend for demo or production.  
**Command:** `/release-mvp-frontend`

1. Create or update `sierra-estates-mvp.html` with all frontend logic and assets inlined.
2. Optionally update related assets or documentation.

**Example:**
```html
<!-- sierra-estates-mvp.html -->
<!DOCTYPE html>
<html>
<head>
  <title>Sierra Estates MVP</title>
  <script>
    // All JS logic inlined here
  </script>
</head>
<body>
  <!-- UI goes here -->
</body>
</html>
```

---

### Add or Update Documentation and TODO
**Trigger:** When you want to document next steps, format docs, or log new events.  
**Command:** `/update-docs`

1. Edit `TODO.md`, `NEXT_STEPS.md`, or other markdown documentation files.
2. Optionally update `obedian-store.json` or similar log/config files.

**Example:**
```markdown
<!-- TODO.md -->
- [ ] Add agent filtering to WhatsApp bot
- [x] Implement MVP frontend
```

## Testing Patterns

- **Framework:** Jest
- **Test file pattern:** `*.test.ts`
- **Example:**
  ```typescript
  // agentLogic.test.ts
  import { getAgentById } from './agentLogic';

  test('should fetch agent by ID', () => {
    expect(getAgentById('123')).toBeDefined();
  });
  ```

## Commands

| Command                 | Purpose                                                    |
|-------------------------|------------------------------------------------------------|
| /new-api-endpoint       | Add or update an API endpoint for backend/admin features   |
| /update-whatsapp-bot    | Implement or extend WhatsApp bot features                  |
| /update-vscode-config   | Update VS Code debug/lint/interpreter settings             |
| /fix-typescript-eslint  | Fix TypeScript, ESLint, or config errors                   |
| /release-mvp-frontend   | Release or revise the single-file HTML MVP frontend        |
| /update-docs            | Update documentation, TODO lists, or markdown files        |
