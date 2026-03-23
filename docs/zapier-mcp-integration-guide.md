# Zapier MCP 2026 集成指南 (Crown AI OS)

> 版本: v1.0 | 更新: 2026-03-24
> 来源: Zapier 官方文档 + Perplexity 调研 + 实践手册

---

## 1. 背景：为什么用 MCP

Zapier AI Actions (NLA API) **已废弃**。所有 AI → Zapier 集成必须通过 MCP (Model Context Protocol)。

MCP 优势：
- 统一协议，Claude/ChatGPT/Cursor 等 AI 工具通用
- 8,000+ App，30,000+ Actions 可用
- 内置认证、加密、限流
- Team Bundle 可分享给团队

---

## 2. Crown 集成架构

```
Boss Slack /crown 命令
    ↓
zapier-crown-bridge (Vercel)
    ├─ PR 操作 → GitHub API (直接调用)
    │   approve / reject / merge / defer
    │
    └─ 非 PR 任务 → Zapier MCP Server
        ├─ delegate_task  → Create GitHub Issue / Run Agent
        ├─ trigger_digest → Run Agent (汇总) → Slack
        ├─ execute_writeback → Run Agent → Crown-Docs
        └─ quick_task     → 直接执行简单操作
```

---

## 3. MCP Server 配置步骤

### 3.1 创建 Server

1. 登录 https://mcp.zapier.com
2. 点击 **+ New MCP Server**
3. 选择 AI 客户端：**Claude**
4. 命名：`Crown Command Bridge`
5. 确认创建

### 3.2 添加工具 (Actions)

推荐为 Crown 配置以下工具：

| 工具名称 | App | Action | 用途 |
|----------|-----|--------|------|
| Create GitHub Issue for agent task | GitHub | Create Issue | delegate_task |
| Send Slack summary to crown-command | Slack | Send Channel Message | 所有通知回复 |
| Run Crown Digest Agent | Zapier Agents | Run Agent | trigger_digest |
| Log execution to Crown Sheet | Google Sheets | Create Spreadsheet Row | 执行日志 |

> **命名规范**：工具名要具体明确，不要用模糊的 "Send message"

### 3.3 连接到 Bridge

点击 **Connect** 标签 → 复制 MCP Server URL → 配置到 Vercel 环境变量：

```
ZAPIER_MCP_SERVER_URL=https://mcp.zapier.com/api/mcp/YOUR_SERVER_ID
```

### 3.4 安全注意

- Server URL 等同密码，**绝不可分享**
- 可随时 Rotate secret 重新生成 URL
- 高风险操作（删除、批量发送）必须启用 Human-in-the-Loop

---

## 4. Developer 模式：API 直接接入

### TypeScript (Anthropic SDK)

```typescript
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

const response = await client.messages.create({
  model: "claude-sonnet-4-5-20250514",
  max_tokens: 1024,
  tools: [{
    type: "mcp",
    name: "zapier",
    url: "https://mcp.zapier.com/api/mcp/YOUR_SERVER_ID",
  }],
  messages: [{ role: "user", content: "在 VIP-API-WEB 创建一个 Issue: 更新文档" }]
});
```

### Python (OpenAI SDK)

```python
import openai

client = openai.OpenAI()

response = client.responses.create(
    model="gpt-4o",
    tools=[{
        "type": "mcp",
        "server_url": "https://mcp.zapier.com/api/mcp/YOUR_SERVER_ID",
        "server_label": "zapier",
    }],
    input="发送 Slack 消息到 #crown-command-center: 任务完成"
)
```

---

## 5. Zapier Agents 最佳实践

### 5.1 架构原则

```
❌ 反模式：一个 Agent 做所有事
✅ 推荐模式：单一职责 + Pods 协作

Pod: Crown 自动化
  ├── Agent_TaskRouter   (解析任务类型并路由)
  ├── Agent_DocWriter    (文档生成与更新)
  ├── Agent_Reviewer     (代码/文档审查)
  └── Agent_Reporter     (生成执行报告)
```

### 5.2 指令模板

```
# 角色
你是一个专门负责[具体任务]的自动化助手。

# 触发条件
当[具体触发条件]时，开始执行。

# 执行步骤
1. [步骤1]
2. [步骤2]
3. [步骤3]

# 决策规则
- 如果[条件A]，则执行[动作X]
- 如果无法判断，则[记录 + 通知 Boss]

# 限制
- 不要[明确禁止的操作]
- 每个 Agent 最多 5 个 Actions
```

### 5.3 Knowledge Sources

- 包含：SOP、FAQ、客户分级标准、标准回复模板
- 排除：>500 页文档（降低准确性）、频繁变更的实时数据（改用 Tables）
- 同步频率：内部文档 daily / 产品目录 weekly / 政策 on_change
- 总量控制在 10MB 以内

### 5.4 版本管理

1. 在 Draft 版本修改指令
2. 至少 10 个测试用例（含边界情况）
3. 确认无误 → Publish
4. 如需回滚 → 历史版本 → Restore
5. Copilot 修改自动创建 Checkpoint

---

## 6. AI 模型选择

| 模型 | 成本 | 适用 |
|------|------|------|
| GPT-4o mini | **免费** | 简单文本/分类/摘要 |
| Gemini 2.0 Flash | **免费** | 多模态（图像/音频） |
| GPT-4o | 需自带 Key | 复杂推理 |
| Claude 3.5 Sonnet | 需自带 Key | 代码分析 |

> Crown 优先用免费模型降低成本

---

## 7. Tables 审批流程

```
Table (含 Button 字段) → Zap (Human-in-the-Loop)

1. Button A: "Approve" → Continue Zap → 执行后续
2. Button B: "Reject" → Continue Zap → 拒绝操作
3. 外部协作者可通过安全链接完成审批（无需 Zapier 账号）
```

---

## 8. 成本控制

### 计费公式
- 每次 MCP 工具调用 = 2 tasks
- Crown 日均命令量 ~20 次 = 40 tasks/天 ≈ 1,200 tasks/月

### 优化策略
1. 批量操作替代逐条处理
2. 缓存常用数据到 Zapier Tables
3. 设置 80% 用量预警
4. 优先用免费模型
5. Zap 开头加 Filter 步骤提前终止无效数据
6. 低频任务用 Schedule 触发而非实时

### 计划建议
| 计划 | Tasks/月 | 适合 |
|------|---------|------|
| Free | 100 | 测试 |
| Professional | 750+ | 轻度使用 |
| **Team** | **2000+** | **Crown 推荐** |
| Enterprise | 定制 | 大规模 |

---

## 9. Canvas 系统设计

```
自然语言描述需求
    ↓
Copilot 生成系统草图
    ↓
Review 各节点
    ↓
AI Chat 微调设计
    ↓
「Build it」一键创建所有资产
    ↓
各资产中完善配置
```

---

## 10. 关键链接速查

| 资源 | URL |
|------|-----|
| MCP 配置 | https://zapier.com/mcp |
| MCP 快速开始 | https://docs.zapier.com/mcp/quickstart |
| MCP GitHub | https://github.com/zapier/zapier-mcp |
| MCP 完整指南 | https://zapier.com/blog/zapier-mcp-guide/ |
| Agents 入口 | https://agents.zapier.com |
| Agents 最佳实践 | https://help.zapier.com/hc/en-us/articles/24593355420429 |
| Copilot 指南 | https://zapier.com/blog/zapier-copilot-guide/ |
| Tables 指南 | https://zapier.com/blog/zapier-tables-guide/ |
| Canvas 文档 | https://help.zapier.com/hc/en-us/articles/19880280846221 |
| AI 功能更新 | https://help.zapier.com/hc/en-us/articles/36180130221581 |
| 定价 | https://zapier.com/pricing |
| 产品更新中心 | https://help.zapier.com/hc/en-us/categories/13951101412877 |

---

## 11. Crown 下一步行动清单

```
[ ] 1. 登录 mcp.zapier.com 创建 "Crown Command Bridge" Server
[ ] 2. 添加 4 个工具 (GitHub Issue, Slack Message, Run Agent, Sheets Log)
[ ] 3. 复制 Server URL → 配置到 Vercel ZAPIER_MCP_SERVER_URL
[ ] 4. 在 Zapier Agents 创建 Crown Pod (TaskRouter + DocWriter + Reporter)
[ ] 5. 测试端到端: /crown 任务：测试Zapier → Bridge → MCP → Slack回复
[ ] 6. 配置 80% 用量预警
[ ] 7. 确认计划配额 (推荐 Team 计划)
```

---

> 本文档整合自：Zapier_2026_最佳配置与实践方案.pdf + zapier_agents_config.yml + Zapier最佳实践手册.md + 官方文档抓取
