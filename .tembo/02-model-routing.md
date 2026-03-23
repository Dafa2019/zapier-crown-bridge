# Model Routing Policy

## Fastest path
- Changelogs, summaries, docs maintenance: Opencode + `gpt-5.4-mini`
- Simple lint / CI fixes: Codex + `gpt-5.3-codex`

## Safest path
- PR review: Codex + `gpt-5.4`
- Security scan: Claude Code + `claude-opus-4-6`
- Sentry production issues: Claude Code + `claude-opus-4-6`

## Best path for scale
- Org default: Claude Code for human-assigned tasks
- Automation-specific overrides for cheap / narrow workflows
- Keep expensive models for high-risk or high-ambiguity work only

## Notes
- Tembo currently documents Codex default as `gpt-5.2`. Supported models include `gpt-5.3-codex` and `gpt-5.4`, so use explicit automation-level overrides when you want those models. citeturn600293search3turn370203search5
- Claude Code defaults to `claude-opus-4-6` in current docs. citeturn600293search3turn370203search5
