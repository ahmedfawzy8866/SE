```markdown
# SE Development Patterns

> Auto-generated skill from repository analysis

## Overview
This skill provides guidance on contributing to the SE TypeScript codebase. It covers established coding conventions, common workflows (such as maintaining the monorepo workspace configuration), and testing patterns. By following these patterns, contributors can ensure consistency, maintainability, and smooth CI/CD operations within the repository.

## Coding Conventions

### File Naming
- Use **camelCase** for file names.
  - Example: `userProfile.ts`, `orderService.test.ts`

### Import Style
- Mixed import styles are used. Both default and named imports may appear.
  - Example:
    ```typescript
    import fs from 'fs';
    import { parseUser } from './userUtils';
    ```

### Export Style
- Prefer **named exports**.
  - Example:
    ```typescript
    // userProfile.ts
    export function getUserProfile(id: string) { ... }
    export const DEFAULT_AVATAR = 'avatar.png';
    ```

### Commit Patterns
- Commits are generally freeform, but may use the `fix` prefix for bug fixes.
- Average commit message length: 64 characters.

## Workflows

### update-pnpm-workspace-yaml
**Trigger:** When adding, removing, or reorganizing packages/apps in the monorepo, or fixing CI issues related to workspace detection.  
**Command:** `/update-pnpm-workspace`

1. Edit the `pnpm-workspace.yaml` file to add, remove, or update entries in the `packages` field.
   - Example:
     ```yaml
     packages:
       - 'packages/*'
       - 'apps/*'
     ```
2. Commit the changes with a message referencing CI or workspace fixes.
   - Example commit message: `fix: update pnpm-workspace.yaml for new package`
3. Push the changes to the remote repository to unblock CI or reflect the new structure.

## Testing Patterns

- **Framework:** [Jest](https://jestjs.io/)
- **Test Files:** Use the `.test.ts` suffix.
  - Example: `userProfile.test.ts`
- **Test Example:**
  ```typescript
  import { getUserProfile } from './userProfile';

  describe('getUserProfile', () => {
    it('returns user data for a valid ID', () => {
      expect(getUserProfile('123')).toEqual({ id: '123', name: 'Alice' });
    });
  });
  ```

## Commands

| Command                  | Purpose                                                        |
|--------------------------|----------------------------------------------------------------|
| /update-pnpm-workspace   | Update `pnpm-workspace.yaml` after package changes or CI issues|
```
