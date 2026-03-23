# Agent Handoff

Give this file to the execution agent.

## Objective
Roll out a safe Tembo baseline for repository `Dafa2019/zapier-crown-bridge`.

## Deliverables
- Commit `tembo.md` to repository root
- Review and adapt `automation-suite/automation-suite.reference.yml`
- Create Tembo dashboard automations from prompt files
- Commit `examples/mcp-servers.example.json` if custom MCP servers are needed
- Produce a short rollout PR with risk notes and rollback plan

## Required execution order
1. Replace placeholders in all files.
2. Inspect the real repository and update commands, paths, test commands, and protected areas in `tembo.md`.
3. Open a PR that adds only:
   - `tembo.md`
   - `docs/tembo/` or equivalent location for the supporting docs
4. Wait for merge.
5. Create `pr-review` and `daily-slack-changelog` in Tembo.
6. Observe one week of results.
7. Only then propose `security-scan`, `auto-fix-ci`, and `sentry-auto-fix`.

## Hard guardrails
- Do not enable automatic code-writing workflows on day 1.
- Do not store secrets in repo files.
- Do not claim YAML is an official Tembo import format.
- Do not auto-approve PRs when uncertain.

## Expected output from the agent
- one rollout PR
- one short setup note listing integrations connected
- one screenshot or text export of created automations
- one follow-up note after first observed run
