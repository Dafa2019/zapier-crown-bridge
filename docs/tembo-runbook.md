# Tembo Final Runbook for Claude

## Objective
Use `Dafa2019/zapier-crown-bridge` as the active command bridge for `crown-ai-os` and run one real end-to-end low-risk automation flow with Tembo review included.

## Fixed Architecture
- `crown-ai-os` = governance / rules layer
- `zapier-crown-bridge` = command bridge
- Slack = command entry + final summary
- GitHub = execution evidence
- Tembo = mandatory code review layer for PR flows
- Neon = event log
- Zapier MCP = tool layer for simple non-PR actions
- n8n = fallback / complex orchestration layer

## Do Not Change
- Do not create another repo
- Do not redesign the system
- Do not rebuild `crown-ai-os` logic from scratch
- Do not treat Slack as the source of truth
- Do not bypass Tembo for PR flows

## Required Command Flow
```
Slack /crown or controlled command-channel input
-> bridge parses command
-> generate trace_id
-> 24h idempotency check
-> route by intent
-> GitHub evidence action or MCP action
-> Tembo review if PR exists
-> Slack final summary
-> Neon event log
```

## Intent Routing

### PR-type intents: direct GitHub API
- `approve_pr`
- `reject_pr`
- `merge_pr`
- `defer_pr`

### Simple non-PR intents: Zapier MCP
- `delegate_task` -> default `github_create_issue`
- `trigger_digest` -> default `slack_send_channel_message`
- `execute_writeback` -> `github_create_or_update_file` if available; not a blocker for MVP

### Complex multi-step tasks
Use Webhook + Zap or fallback orchestration.

## Mandatory Tembo Review Layer

PR is **not complete** when created.

Required PR path:
1. Create branch and PR
2. Run existing GitHub auto-review workflow
3. Run rule checks
4. Send PR to Tembo review
5. Tembo returns one of:
   - `BRAIN-APPROVED`
   - `BRAIN-CONDITIONAL`
   - `BRAIN-REWORK`
6. If `BRAIN-APPROVED` and task is low-risk, single-repo, single-file, non-governance:
   - add `boss-approved` label
   - approve PR
   - auto merge
7. If `BRAIN-CONDITIONAL`:
   - apply requested fixes once
   - resubmit review
8. If `BRAIN-REWORK`:
   - stop auto-merge
   - return final failure summary
9. If Tembo is unavailable:
   - return status `TEMBO_UNAVAILABLE`
   - do not bypass review
   - do not merge automatically

## Auto-merge Safety Boundary

Only allow automatic merge when all are true:
- low-risk
- single repo
- single file or narrowly scoped change
- no governance file changes
- no schema/API contract changes
- no multi-repo coordination
- Tembo = `BRAIN-APPROVED`

Never auto-merge:
- governance/rules changes
- `crown-ai-os` review-critical files
- multi-repo changes
- schema / API contract changes
- destructive or ambiguous tasks

## Logging Requirements (Neon)
- `trace_id`
- `intent`
- `target_repo`
- `execution_path`
- `status`
- `started_at`
- `completed_at`
- `github_url` if exists
- `tembo_status` if PR review happened
- `error_message` if failed

## Slack Final Summary Must Include
- `trace_id`
- intent
- target repo
- pass/fail
- GitHub PR/comment/result link
- Tembo result
- next blocker if any

## MVP Success Criteria
- one real Slack command enters bridge
- `trace_id` generated
- idempotency check works
- one GitHub evidence artifact created
- Tembo review runs for PR flow
- Neon log written
- Slack final summary returned
- no manual intervention in the middle

## First Real E2E Test
Use a low-risk task in `VIP-API-WEB` or sandbox.
Do not start with governance files.

## Final Output Format
Return only:
1. command used
2. `trace_id`
3. target repo
4. GitHub result link
5. Tembo status
6. Slack summary result
7. pass/fail
8. next blocker
