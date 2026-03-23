# Zapier Crown Bridge — 最终交付报告

> 生成时间: 2026-03-23
> 执行者: Claude (编码执行层)
> 状态: MVP 闭环完成，待主脑审阅 Zapier MCP 工具绑定决策

---

## 1. 项目概述

基于 `crown-ai-os` Flow D 规则，构建的 **薄 API 层 + Zapier MCP 执行桥**。

**核心链路:**
```
Slack /crown 命令 → Fastify API → 命令解析 → trace_id 生成 → 24h 幂等校验
  → PR 类: GitHub API 直接操作
  → 非 PR 类: Zapier MCP 转发
  → Neon Postgres 事件日志
  → Slack 确认回执
```

## 2. 交付清单

| 项目 | 状态 | 地址 |
|---|---|---|
| GitHub 仓库 | ✅ | https://github.com/Dafa2019/zapier-crown-bridge |
| 生产部署 | ✅ READY | https://zapier-crown-bridge.vercel.app |
| 测试 | ✅ 31/31 通过 | parser / trace-id / idempotency / API |
| Slack `/crown` 命令 | ✅ 已配置+授权 | Crown Bridge App → Crown workspace |
| Neon Postgres | ✅ 已接入 | command_events 表 + 索引 |
| Zapier MCP 集成 | ✅ 代码就绪 | 待绑定具体 Zap 工具 |

## 3. 已配置环境变量 (Vercel)

| 变量 | 状态 |
|---|---|
| `INTERNAL_API_KEY` | ✅ |
| `SLACK_BOT_TOKEN` | ✅ |
| `SLACK_SIGNING_SECRET` | ✅ |
| `GITHUB_TOKEN` | ✅ |
| `GITHUB_OWNER` | ✅ (Dafa2019) |
| `ZAPIER_API_TOKEN` | ✅ |
| `ZAPIER_MCP_SERVER_URL` | ✅ |
| `DATABASE_URL` | ✅ (Neon Postgres) |

## 4. API 路由

| 方法 | 路径 | 鉴权 | 用途 |
|---|---|---|---|
| GET | `/api/health` | 无 | 健康检查 |
| POST | `/api/commands/intake` | x-api-key | 命令入口 (webhook) |
| GET | `/api/commands/:traceId` | x-api-key | 查询命令执行状态 |
| POST | `/api/webhooks/slack` | Slack签名 | Slack /crown 命令入口 |

## 5. 支持的 9 种 Intent

### PR 直通 (GitHub API)

| 命令示例 | Intent | GitHub 操作 |
|---|---|---|
| `批准 PR#3` / `approve PR #5` | approve_pr | reviews/approve |
| `拒绝 PR#10` / `reject PR#10` | reject_pr | reviews/request_changes |
| `合并 PR#7` / `merge PR#7` | merge_pr | pulls/merge (squash) |
| `延迟 PR#2` / `defer PR#2` | defer_pr | issues/labels (deferred) |

### 非 PR 任务 (Zapier MCP)

| 命令示例 | Intent | 当前状态 |
|---|---|---|
| `检查更新` / `check status` | check_status | ✅ 内部处理 |
| `写回` / `writeback` | execute_writeback | ⏳ 需绑定 Zap |
| `触发摘要` / `digest` | trigger_digest | ⏳ 需绑定 Zap |
| `任务：更新治理文档` | delegate_task | ⏳ 需绑定 Zap |
| `快速任务：xxx` | quick_task | ⏳ 需绑定 Zap |

## 6. DB Schema

```sql
command_events (Neon Postgres)
├── id              UUID PK
├── trace_id        VARCHAR(64) UNIQUE INDEX
├── raw_text        TEXT
├── intent          VARCHAR(64) INDEX
├── target_repo     VARCHAR(128)
├── target_pr       INTEGER
├── assigned_agent  VARCHAR(64)
├── channel         VARCHAR(64)
├── requested_by    VARCHAR(64)
├── payload_json    JSONB
├── status          VARCHAR(32) INDEX [received|dedup_blocked|executed|failed|pending]
├── github_evidence_url  TEXT
├── zapier_run_ref  TEXT
├── error_message   TEXT
├── created_at      TIMESTAMP INDEX
└── updated_at      TIMESTAMP
```

## 7. 文件结构

```
zapier-crown-bridge/
├── src/
│   ├── app.ts                          # Fastify 应用工厂
│   ├── server.ts                       # 启动入口
│   ├── types/index.ts                  # 共享类型
│   ├── config/
│   │   ├── env.ts                      # 环境变量 Zod 校验
│   │   ├── intent-patterns.ts          # 9 种 intent 正则 (中+英)
│   │   ├── routing-rules.ts            # intent → route_type
│   │   └── repo-rules.ts              # repo/agent 关键词路由
│   ├── api/
│   │   ├── middleware/auth.ts          # API key 校验
│   │   └── routes/
│   │       ├── health.ts
│   │       ├── intake.ts
│   │       ├── status.ts
│   │       └── slack.ts
│   ├── services/
│   │   ├── parser.service.ts          # 命令解析 (Flow D)
│   │   ├── idempotency.service.ts     # 24h 幂等 (Postgres + 内存 fallback)
│   │   ├── routing.service.ts         # 路由决策
│   │   ├── execution.service.ts       # 主编排
│   │   ├── github.service.ts          # GitHub PR API
│   │   ├── zapier.service.ts          # Zapier MCP + webhook fallback
│   │   ├── slack.service.ts           # Slack 确认
│   │   └── logging.service.ts         # Postgres 事件日志
│   ├── integrations/
│   │   └── db.client.ts               # Neon Postgres 连接池
│   └── db/
│       └── schema.sql                 # DDL
├── tests/                              # 31 tests
├── api/index.ts                        # Vercel serverless 入口
├── vercel.json
└── package.json
```

## 8. 验证命令

```bash
# 健康检查
curl https://zapier-crown-bridge.vercel.app/api/health

# PR 批准 (webhook 方式)
curl -X POST https://zapier-crown-bridge.vercel.app/api/commands/intake \
  -H 'Content-Type: application/json' \
  -H 'x-api-key: crown-bridge-prod-key-2026' \
  -d '{"text":"批准 PR#3","channel":"crown-command","user_id":"boss","source":"webhook"}'

# 委派任务
curl -X POST https://zapier-crown-bridge.vercel.app/api/commands/intake \
  -H 'Content-Type: application/json' \
  -H 'x-api-key: crown-bridge-prod-key-2026' \
  -d '{"text":"任务：更新治理文档","source":"webhook"}'

# Slack 方式
/crown 批准 PR#3
/crown 检查更新
/crown 任务：更新治理文档
```

## 9. 需主脑决策：Zapier MCP 工具绑定

### 当前状态

Bridge 代码已能将非 PR 类任务发送到 Zapier MCP，但 **Zapier 端尚未配置对应的 Zap 来接收和执行这些任务**。

### 需要决策的问题

**每种 intent 到达 Zapier 后应该执行什么动作？**

| Intent | 可选方案 A | 可选方案 B | 可选方案 C |
|---|---|---|---|
| `delegate_task` | 创建 GitHub Issue 并 assign | 发 Slack DM 给指定 agent | 调用对应 agent API |
| `trigger_digest` | 汇总 PR/Issue 发到 Slack | 生成报告写入 Crown-Docs | 发邮件摘要 |
| `execute_writeback` | 更新 Crown-Docs 仓库 | 更新 Notion 数据库 | 写入 Google Sheet |
| `quick_task` | 创建 GitHub Issue | 发 Slack 消息 | 触发指定 webhook |

### 实现路径选择

**路径 A: Zapier 网页端手动建 Zap**
- 登录 zapier.com → 创建 Zap
- Trigger: Webhook (接收 Bridge payload)
- Action: 配置具体操作 (GitHub/Slack/Email 等)
- 优点: 可视化配置，不写代码
- 缺点: 需手动维护

**路径 B: 通过 Zapier MCP 让 Claude 直接操作**
- Claude 通过 MCP 协议调用 Zapier 已有连接
- 任务执行由 Claude 的 MCP 会话驱动
- 优点: 灵活，自然语言驱动
- 缺点: 依赖 Claude MCP 会话可用性

**路径 C: Bridge 自身直接调各服务 API (不经 Zapier)**
- Bridge 直接调 GitHub/Slack/Notion 等 API
- 优点: 无中间商，延迟低
- 缺点: 每种操作都要写代码，维护成本高

### 建议

推荐 **路径 A + B 混合**: 高频稳定任务用 Zap 配置 (路径 A)，低频灵活任务用 MCP (路径 B)。

## 10. 回滚方法

1. Vercel Dashboard → 暂停项目 (零影响回滚)
2. Slack App → Slash Commands → 删除 `/crown`
3. GitHub 仓库和治理规则不受影响
4. 数据库数据保留，可查询历史记录

## 11. 技术栈

- Runtime: Node.js 20 + TypeScript 5.9
- Framework: Fastify 5
- Database: Neon Postgres (ap-southeast-1)
- Deployment: Vercel Serverless
- Testing: Vitest (31 tests)
- Slack: Crown Bridge App + /crown slash command
- Zapier: MCP protocol (mcp.zapier.com)

---

*此报告由 Claude (编码执行层) 生成，供主脑 (ChatGPT) 审阅决策。*
