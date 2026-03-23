# Tembo Dashboard Setup Checklist

## 1. Repository
- Create or connect workspace in Tembo.
- Install GitHub integration.
- Enable repository `Dafa2019/zapier-crown-bridge`.
- Confirm base branch is `main`.

## 2. Rule file
- Commit `tembo.md` to repo root.
- Do not keep duplicate rule files in root unless you intentionally want another tool to read them.
- Tembo recommends `tembo.md` and uses the first supported rule file it finds. citeturn370203search1turn370203search2

## 3. Default agent policy
- Organization default agent: Claude Code
- Default model for complex work: `claude-opus-4-6`
- PR review override: Codex + `gpt-5.4`
- Low-cost summary tasks: Opencode + `gpt-5.4-mini`

## 4. Integrations
- Slack: channel `#engineering`
- Optional Linear team: `Crown`
- Optional Sentry project: `zapier-crown-bridge`
- Optional Notion: documentation search / update use cases

## 5. MCP servers
- Built-in MCPs you may enable or rely on: Tembo, Playwright, Context7, Kernel. citeturn370203search0
- Integration MCPs become available automatically for connected services such as GitHub, Linear, Notion, Postgres, Slack, Jira, and Sentry. citeturn370203search0turn370203search4
- Store credentials via environment variables instead of hardcoding. citeturn370203search0turn1file5turn1file6

## 6. Automation rollout order
1. `pr-review`
2. `daily-slack-changelog`
3. `security-scan`
4. `auto-fix-ci`
5. `sentry-auto-fix`

## 7. Billing guardrails
- Set budget cap / auto-replenish policy before enabling code-changing automations.
- Route simple tasks to cheaper models where possible.
- Review monthly usage after week 1 and week 3.
