# Full Auto Runbook for Agent

## Objective

Run one full end-to-end automation test with minimal human interruption.
Boss only sends one Slack command. Agent executes. Tembo reviews. Final result is returned in Slack and GitHub.

## Updated policy for this run

- Crown-Docs writeback is **not a blocking requirement** for this run.
- Primary goal: **intelligent, automated, low-error execution**.
- Formal execution evidence can be satisfied by GitHub artifacts plus Slack final summary.
- Keep the first run **low-risk, single-repo, single-file, non-governance**.

## Existing system baseline

Use the existing Flow D Slack Command Router already defined in `crown-ai-os`:

- Webhook: `/webhook/slack-command`
- Parses Slack Events API message, Slash Command `/crown`, or raw POST
- Supports intents: `approve_pr`, `reject_pr`, `merge_pr`, `defer_pr`, `check_status`, `execute_writeback`, `trigger_digest`, `delegate_task`, `quick_task`
- Generates `trace_id`
- Performs 24h idempotency / dedup check in Neon
- PR operations go directly to GitHub API
- Non-PR tasks are handed to Flow A Task Intake
- Returns Slack confirmation response

## Required setup before run

1. Flow D is active (zapier-crown-bridge deployed on Vercel).
2. Slack `/crown` command is connected to bridge webhook.
3. GitHub token credential works.
4. Neon credential works.
5. Tembo review path is enabled for low-risk PR auto-review.

## One-shot test task

**Target repo:** `Dafa2019/VIP-API-WEB`

**Target change:**
- Create or update one simple documentation file only.
- Recommended file: `scripts/quickstart.md`
- Do **not** change schema, API contract, governance files, workflows, env, or multi-repo logic.

## Slack command to run

```text
/crown 任务：在 VIP-API-WEB 执行一次全自动低风险闭环测试。目标：为 Hugo 站点补充最小运行说明到 scripts/quickstart.md。约束：仅修改 1 个文档文件；不改 schema、API、治理文档、配置；保持 low-risk / single_point。执行要求：1）创建分支并提交 PR；2）触发 GitHub auto-review；3）进入 Tembo 审核；4）若 Tembo 返回 BRAIN-APPROVED，则自动添加 boss-approved label 并自动 merge；5）最终只在 Slack 回复摘要、PR 链接、merge 结果、commit hash、trace_id；6）若 Tembo 返回 BRAIN-CONDITIONAL 或 BRAIN-REWORK，则按意见自动返工 1 次并重新提交；若仍失败，再向 Boss 汇报。
```

## Execution contract for the agent

When this command is received, the system must:

1. Parse the Slack command through Flow D.
2. Generate `trace_id`.
3. Check 24h dedup in Neon.
4. Route to the correct executor for `VIP-API-WEB`.
5. Create a branch.
6. Make the single-file documentation update.
7. Commit and open a PR.
8. Trigger auto-review / Tembo review.
9. If `BRAIN-APPROVED`, add `boss-approved` label and merge automatically.
10. Return only the final outcome to Slack.

## Final output required in Slack

The final Slack reply must include:

- status: success / failed
- trace_id
- repo
- PR link
- merge result
- commit hash
- Tembo review result
- if failed: concise reason and next action

## Success criteria

A run is successful if all below are true:

1. Slack command is accepted.
2. `trace_id` is generated.
3. GitHub PR is created.
4. Tembo review runs.
5. PR is auto-merged after approval.
6. Slack receives final summary.

## Safety boundaries

Do not use this run for:

- `crown-ai-os`
- `Crown-Docs`
- multi-repo tasks
- schema or API changes
- destructive file operations
- auto-merge of governance or project-level changes

## Fallback rule

If any blocker appears:

- stop automatic expansion of scope
- do not touch other repos
- return failure summary with `trace_id`, blocker, and exact failed step
