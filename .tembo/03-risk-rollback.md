# Risk and Rollback Plan

## Main risks
1. Poor PR quality caused by weak rule files
2. Automation loops triggered by bot-authored PRs
3. Unbounded credit burn from expensive models on simple tasks
4. Slow or unstable stdio MCP servers
5. Sensitive values leaking into prompts or config

These risks are reflected in the uploaded Tembo best-practice materials. fileciteturn1file5L1-L34 fileciteturn1file6L1-L13 fileciteturn1file8L1-L13

## Mitigations
- Keep `tembo.md` current and explicit.
- Exclude `author:tembo-bot` and `github-actions[bot]` where loop risk exists.
- Use cheap models for low-risk workflows.
- Prefer HTTP/SSE MCP for slow services.
- Use environment variables only for credentials.

## Rollback ladder
- Level 1: Disable code-changing automations only
- Level 2: Keep review and changelog automations, disable CI / Sentry fixes
- Level 3: Disable all automations, keep rule file and MCP docs in repo
- Level 4: Remove nonessential MCP servers, then re-enable one workflow at a time
