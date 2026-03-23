# Project Context - Dafa2019/zapier-crown-bridge

This repository is managed with Tembo.
Follow this file as the primary source of repo-level instructions.

## Mission
- Maintain production stability first.
- Prefer small, reviewable pull requests.
- Preserve existing business logic unless the task explicitly requires changing it.
- Prefer traceable changes with tests, docs, and rollback notes.

## Commands
- Install: `npm install`
- Dev: `npm run dev`
- Build: `npm run build`
- Lint: `npm run lint`
- Typecheck: `npm run typecheck`
- Test: `npm test`
- CI smoke: `npm run ci`

If a command is missing, inspect `package.json`, `Makefile`, or project docs before inventing a replacement.

## Workflow rules
- Base branch: `main`
- Keep changes scoped to the requested task.
- Do not change lockfiles, generated files, or build artifacts unless the task requires it.
- If a migration is required, include forward and rollback notes.
- If touching authentication, billing, permissions, or security-sensitive code, add explicit risk notes in the PR description.

## Code style
- Prefer explicit typing and avoid `any` unless justified.
- Prefer existing architectural patterns over stylistic rewrites.
- Preserve public API contracts unless the task explicitly allows breaking changes.
- Keep file naming, import ordering, and linting consistent with surrounding code.

## Testing expectations
- Run the narrowest relevant test set first.
- Expand to broader test coverage before opening a final PR.
- If tests cannot run locally, explain why and document the exact blocker.

## Documentation expectations
- Update docs when behavior, config, or operational workflows change.
- Include example commands when adding new setup steps.

## IMPORTANT
- Prefer review-only behavior for automations unless explicitly configured for code changes.
- For PR review automations, do not auto-approve if there is uncertainty.
- For CI auto-fix, stop after bounded retries and leave a clear summary.

## WARNING - protected areas
- Do not modify secrets, credentials, or token values in any file.
- Do not write real API keys into code, rule files, prompts, or docs.
- Do not change deployment or infra files unless the task explicitly targets them.
- Do not rename top-level folders without explicit task scope.

## Repository structure
- `/src` - application code
- `/tests` - automated tests
- `/docs` - docs and runbooks
- `/scripts` - local scripts and tooling
- `/.github` - CI, workflows, issue templates

Update this section to match the real repo structure before enabling auto-fix workflows.

## Pull request expectations
Every PR should include:
1. What changed
2. Why it changed
3. Risk / impact
4. Test evidence
5. Rollback plan

## Agent behavior
- Ask for human review whenever the task may change production behavior significantly.
- Prefer one focused PR instead of one broad PR.
- If the task is ambiguous, choose the safest interpretation and document assumptions.
