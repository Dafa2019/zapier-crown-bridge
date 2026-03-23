# Crown Zapier Bridge — 主脑审阅包

> 提交时间: 2026-03-24
> 提交者: Claude (编码执行层)
> 审阅对象: ChatGPT (首席顾问/最终决策者)

---

## 一、项目概述

**zapier-crown-bridge** 是 Crown AI OS 的命令路由层，连接 Boss 的 Slack 命令到 GitHub/Zapier 自动执行。

```
Boss (Slack /crown) → Bridge → Parser → Router → GitHub API / Zapier MCP → Slack 回复
```

## 二、已完成交付物

| 项 | 状态 | 链接 |
|---|---|---|
| GitHub 仓库 | ✅ | https://github.com/Dafa2019/zapier-crown-bridge |
| Vercel 生产部署 | ✅ | https://zapier-crown-bridge.vercel.app |
| 单元/集成测试 | ✅ 31/31 | parser + trace-id + idempotency + API |
| Neon DB 持久化 | ✅ | command_events 表 |
| Slack /crown 命令 | ✅ | Crown Bridge App |
| Zapier MCP 连接 | ✅ | 62 工具全部在线 |
| E2E 测试 (Runbook) | ✅ | VIP-API-WEB PR #13 merged |
| E2E 测试 (Zapier MCP) | ✅ | zapier-crown-bridge PR #1 merged |
| 服务器迁移指南 | ✅ | docs/SERVER_SETUP_GUIDE.md |
| 恢复脚本 | ✅ | scripts/restore-env.sh |

## 三、架构决策

### 3.1 Zapier MCP vs 自建 API

| 维度 | 自建 API (当前 Bridge) | Zapier MCP (已验证) |
|---|---|---|
| 开发成本 | 高（每个集成手写） | 低（62 工具开箱即用） |
| 维护成本 | 高（API 变动需跟进） | 低（Zapier 维护） |
| 灵活性 | 完全控制 | 受限于 Zapier 提供的工具 |
| 成本 | 免费（GitHub API） | 每次调用 = 2 Zapier tasks |
| 延迟 | ~200ms | ~2-5s |
| 适用场景 | 高频、低延迟操作 | 低频、跨平台编排 |

**建议:** PR 操作（approve/reject/merge）继续用直接 GitHub API（低延迟）；委派任务/摘要/写回等用 Zapier MCP（跨平台能力强）。

### 3.2 当前 Zapier MCP 可用工具分布

- GitHub: 18 个（分支/文件/Issue/PR/Review/Label）
- Slack: 30 个（消息/频道/用户/Canvas/提醒）
- Webhook: 4 个（GET/POST/PUT/自定义）
- Code: 2 个（JS/Python 执行）
- Formatter: 4 个（日期/数字/文本/工具）
- 合计: **62 个**

## 四、两次 E2E 测试结果

### 测试 A: Full Auto Runbook (2026-03-23)

| 步骤 | 结果 |
|---|---|
| Slack 命令解析 | ✅ intent=delegate_task |
| trace_id 生成 | ✅ CMD-20260323-C96770 |
| Neon 幂等检查 | ✅ 无重复 |
| GitHub 分支创建 | ✅ docs/quickstart-CMD-20260323-C96770 |
| 文件修改 (scripts/quickstart.md) | ✅ 补充 env/scripts/smoke-test/FAQ |
| PR 创建+审核+merge | ✅ PR #13, squash merged, e5f461bc |
| Neon 状态更新 | ✅ status=executed |
| Slack 完成摘要 | ✅ #crown-command-center |

### 测试 B: Zapier MCP E2E (2026-03-24)

| 步骤 | Zapier 工具 | 结果 |
|---|---|---|
| Slack 开始通知 | slack_send_channel_message | ✅ |
| GitHub 创建分支 | github_create_branch | ✅ |
| GitHub 创建文件 | github_create_or_update_file | ✅ |
| GitHub 创建 PR | github_create_pull_request | ✅ PR #1 |
| GitHub 添加 Label | github_add_labels_to_issue | ✅ |
| GitHub Merge | REST API 直接调用 | ✅ 7a9e754b |
| Slack 完成摘要 | slack_send_channel_message | ✅ |

## 五、待主脑决策事项

### 5.1 Zapier MCP 工具绑定策略

**问题:** 当 Bridge 收到 `delegate_task`/`trigger_digest`/`execute_writeback` 时，Zapier MCP 应该执行什么具体动作？

**选项 A: 直接通过 Zapier MCP 工具**
- delegate_task → `github_create_issue` 到目标 repo
- trigger_digest → `slack_send_channel_message` 发摘要
- execute_writeback → `github_create_or_update_file` 写回

**选项 B: 通过 Zapier Webhook 触发 Zap**
- Bridge POST 到 Zapier webhook
- Zap 内部编排多步骤（创建 Issue → 通知 Slack → 等待完成）

**选项 C: 混合模式（推荐）**
- 简单操作用 MCP 直接调用
- 复杂编排用 Webhook + Zap

### 5.2 Zapier Tasks 预算

- 每次成功 MCP 调用 = 2 tasks
- 一次完整的 PR 审批流程 ≈ 4-6 tasks (Slack通知 + GitHub操作 + Slack回复)
- 需要评估月度 task 预算

### 5.3 Crown-Docs 写回

当前 Crown-Docs 写回未实现。是否需要：
- 通过 Zapier MCP `github_create_or_update_file` 写回？
- 还是等 n8n Flow A 实现？

### 5.4 n8n 与 Zapier MCP 的关系

当前 Bridge 可以独立运行（Vercel + Zapier MCP），是否还需要 n8n？
- n8n 优势：自托管、无 task 限制、复杂工作流
- Zapier MCP 优势：零代码、62 工具即用、Claude 原生集成

## 六、仓库文档清单

```
docs/
├── DELIVERY_REPORT.md              # 最终交付报告
├── EXECUTION_REPORT_CMD-20260323-C96770.md  # Runbook 执行报告
├── FULL_AUTO_RUNBOOK.md            # Full Auto Runbook
├── ZAPIER_MCP_E2E_REPORT.md        # Zapier MCP E2E 测试报告
├── SERVER_SETUP_GUIDE.md           # 服务器迁移指南 (62 工具清单)
├── BRAIN_REVIEW_PACKAGE.md         # 本文档 (主脑审阅包)
└── zapier-mcp-integration-guide.md # Zapier MCP 集成指南
```

## 七、风险与限制

| 风险 | 影响 | 缓解措施 |
|---|---|---|
| Zapier task 耗尽 | MCP 调用失败 | Bridge 内置 fallback 到直接 API |
| Zapier MCP 延迟 (2-5s) | 用户体验 | PR 操作继续用直接 GitHub API |
| Neon 冷启动 | 首次查询慢 | 保持连接池 warm |
| Slack token 过期 | 消息发送失败 | 监控 + 自动刷新 |

## 八、下一步建议

1. **主脑决定** Zapier MCP 工具绑定策略 (5.1)
2. **主脑评估** Zapier tasks 月度预算 (5.2)
3. **主脑决定** Crown-Docs 写回路径 (5.3)
4. **主脑决定** n8n 与 Zapier MCP 共存策略 (5.4)

---

> 本文档由 Claude (编码执行层) 提交，待 ChatGPT (首席顾问) 审阅决策。
