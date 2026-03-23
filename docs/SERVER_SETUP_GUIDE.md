# Crown 系统 — 服务器迁移与环境恢复指南

> 最后更新: 2026-03-24
> 用途: 换服务器后一键恢复所有 MCP 连接和环境变量

---

## 一、快速恢复（换服务器后执行）

### 1. 安装 Claude Code
```bash
npm install -g @anthropic-ai/claude-code
```

### 2. 添加 Zapier MCP
```bash
claude mcp add --transport http zapier https://mcp.zapier.com/api/v1/connect
```

### 3. 认证 Zapier MCP
```bash
# 启动 Claude Code，然后：
# 输入 /mcp → 选 zapier → Authenticate → 浏览器弹出授权页 → 点 Allow
```

### 4. 验证连接
```bash
# 在 Claude Code 里输入 /mcp
# 应该看到：
# zapier · Status: ✓ connected · Auth: ✓ authenticated · Tools: 62 tools
```

---

## 二、环境变量清单

以下变量需要在 Vercel Dashboard 或 `.env` 中配置：

| 变量名 | 用途 | 获取方式 | 当前值提示 |
|---|---|---|---|
| `INTERNAL_API_KEY` | Bridge API 鉴权 | 自定义 | `crown-bridge-prod-key-2026` |
| `SLACK_BOT_TOKEN` | Slack Bot 发消息 | Slack App → OAuth | `xoxb-` 开头 |
| `SLACK_SIGNING_SECRET` | Slack 请求验证 | Slack App → Basic Info | 32位字符串 |
| `GITHUB_TOKEN` | GitHub API 操作 | GitHub → Settings → Tokens | `ghp_` 开头 |
| `GITHUB_OWNER` | GitHub 默认 org/user | 固定值 | `Dafa2019` |
| `ZAPIER_API_TOKEN` | Zapier MCP token | mcp.zapier.com | 已配置 |
| `ZAPIER_MCP_SERVER_URL` | Zapier MCP 地址 | 固定值 | `https://mcp.zapier.com/api/v1/connect` |
| `DATABASE_URL` | Neon Postgres | Neon Dashboard | `postgresql://neondb_owner:...` |

---

## 三、Zapier MCP 工具清单（62 个）

### GitHub 操作（18 个）
| 工具 | 用途 |
|---|---|
| `github_find_repository` | 查找仓库 |
| `github_find_branch` | 查找分支 |
| `github_create_branch` | 创建分支 |
| `github_delete_branch` | 删除分支 |
| `github_create_or_update_file` | 创建/更新文件 |
| `github_create_issue` | 创建 Issue |
| `github_find_issue` | 查找 Issue |
| `github_update_issue` | 更新 Issue |
| `github_add_labels_to_issue` | 添加 Label |
| `github_create_comment` | 创建评论 |
| `github_create_pull_request` | 创建 PR |
| `github_find_pull_request` | 查找 PR |
| `github_update_pull_request` | 更新 PR |
| `github_submit_review` | 提交 Review |
| `github_find_user` | 查找用户 |
| `github_find_organization` | 查找组织 |
| `github_check_organization_membership` | 检查组织成员 |
| `github_set_profile_status` | 设置 GitHub 状态 |
| `github_create_gist` | 创建 Gist |

### Slack 操作（30 个）
| 工具 | 用途 |
|---|---|
| `slack_send_channel_message` | 发送频道消息 |
| `slack_send_direct_message` | 发送私信 |
| `slack_send_private_channel_message` | 发送私有频道消息 |
| `slack_find_message` | 搜索消息 |
| `slack_get_message` | 获取消息 |
| `slack_get_message_by_timestamp` | 按时间戳获取消息 |
| `slack_get_message_permalink` | 获取消息永久链接 |
| `slack_get_message_reactions` | 获取消息反应 |
| `slack_edit_message` | 编辑消息 |
| `slack_delete_message` | 删除消息 |
| `slack_add_reaction` | 添加 emoji 反应 |
| `slack_add_reminder` | 添加提醒 |
| `slack_find_public_channel` | 查找公开频道 |
| `slack_create_channel` | 创建频道 |
| `slack_create_private_channel` | 创建私有频道 |
| `slack_archive_conversation` | 归档对话 |
| `slack_set_channel_topic` | 设置频道主题 |
| `slack_get_conversation` | 获取对话信息 |
| `slack_get_conversation_members` | 获取对话成员 |
| `slack_invite_user_to_channel` | 邀请用户到频道 |
| `slack_remove_user_from_channel` | 从频道移除用户 |
| `slack_retrieve_thread_messages` | 获取线程消息 |
| `slack_cancel_scheduled_message` | 取消定时消息 |
| `slack_find_user_by_email` | 按邮箱查找用户 |
| `slack_find_user_by_id` | 按 ID 查找用户 |
| `slack_find_user_by_name` | 按名字查找用户 |
| `slack_find_user_by_username` | 按用户名查找用户 |
| `slack_create_canvas` | 创建 Canvas |
| `slack_edit_canvas` | 编辑 Canvas |
| `slack_set_status` | 设置 Slack 状态 |
| `slack_update_profile` | 更新个人资料 |
| `slack_api_request_beta` | 自定义 Slack API 请求 |

### Webhook 操作（4 个）
| 工具 | 用途 |
|---|---|
| `webhooks_by_zapier_get` | 发送 GET 请求 |
| `webhooks_by_zapier_post` | 发送 POST 请求 |
| `webhooks_by_zapier_put` | 发送 PUT 请求 |
| `webhooks_by_zapier_custom_request` | 自定义 HTTP 请求 |

### 代码执行（2 个）
| 工具 | 用途 |
|---|---|
| `code_by_zapier_run_javascript` | 执行 JavaScript |
| `code_by_zapier_run_python` | 执行 Python |

### 格式化工具（4 个）
| 工具 | 用途 |
|---|---|
| `formatter_by_zapier_date_time` | 日期时间格式化 |
| `formatter_by_zapier_numbers` | 数字格式化 |
| `formatter_by_zapier_text` | 文本格式化 |
| `formatter_by_zapier_utilities` | 通用工具 |

### 配置（1 个）
| 工具 | 用途 |
|---|---|
| `get_configuration_url` | 获取 Zapier 配置管理 URL |

---

## 四、Slack App 配置

### App 信息
- App Name: **Crown Bridge**
- Workspace: Crown (hg0088.slack.com)
- Slash Command: `/crown`
- Request URL: `https://zapier-crown-bridge.vercel.app/api/webhooks/slack`

### Bot Token Scopes
- `chat:write` — 发消息
- `commands` — slash command

### 重建 Slack App 步骤
1. 打开 https://api.slack.com/apps
2. Create New App → From scratch
3. App Name: `Crown Bridge`, Workspace: Crown
4. OAuth & Permissions → 添加 `chat:write` + `commands`
5. Install to Workspace → 复制 Bot Token (`xoxb-`)
6. Basic Information → 复制 Signing Secret
7. Slash Commands → 创建 `/crown`，URL 填 Bridge 地址

---

## 五、Neon Postgres

- 连接串: `postgresql://neondb_owner:npg_inpUM3meOCw4@ep-flat-frost-a1ka0uh8-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require`
- 表: `command_events`
- Schema 文件: `src/db/schema.sql`

### 重建数据库
```bash
psql "连接串" -f src/db/schema.sql
```

---

## 六、Vercel 部署

- 项目: zapier-crown-bridge
- 生产 URL: https://zapier-crown-bridge.vercel.app
- 仓库: https://github.com/Dafa2019/zapier-crown-bridge
- 自动部署: push to main → Vercel 自动构建

### 重新绑定 Vercel
```bash
cd zapier-crown-bridge
npx vercel link
npx vercel env add INTERNAL_API_KEY
npx vercel env add SLACK_BOT_TOKEN
# ... 逐个添加环境变量
npx vercel --prod
```

---

## 七、Crown 系统其他 MCP 连接

当前 Claude Code 还连接了以下 MCP（换服务器也需恢复）：

| MCP | 用途 | 恢复方式 |
|---|---|---|
| Vercel | 部署管理 | Claude.ai 内置连接器，重新授权 |
| Slack (Native) | 读写 Slack | Claude.ai 内置连接器，重新授权 |
| Cloudflare | Workers/KV/R2/D1 | Claude.ai 内置连接器，重新授权 |
| Sentry | 错误监控 | Claude.ai 内置连接器，重新授权 |
| Wix | 网站管理 | Claude.ai 内置连接器，重新授权 |
| Context7 | 文档查询 | Claude.ai 内置连接器，重新授权 |
| Google Drive | 文件搜索 | Claude.ai 内置连接器，重新授权 |
| Crown Memory | 知识库 | 自建 MCP，需重新部署/配置 |
| Desktop Commander | 本地操作 | npm 安装，本地运行 |

---

## 八、一键恢复脚本

保存为 `scripts/restore-env.sh`，换服务器后执行：

```bash
#!/bin/bash
echo "=== Crown 环境恢复脚本 ==="

# 1. 安装 Claude Code
echo "[1/4] 安装 Claude Code..."
npm install -g @anthropic-ai/claude-code

# 2. 添加 Zapier MCP
echo "[2/4] 添加 Zapier MCP..."
claude mcp add --transport http zapier https://mcp.zapier.com/api/v1/connect

# 3. 克隆项目
echo "[3/4] 克隆 Bridge 项目..."
git clone https://github.com/Dafa2019/zapier-crown-bridge.git
cd zapier-crown-bridge
npm install

echo "[4/4] 完成！"
echo ""
echo "还需手动完成："
echo "  1. 运行 claude，输入 /mcp → 选 zapier → Authenticate"
echo "  2. 在 Vercel Dashboard 配置环境变量"
echo "  3. 在 Claude.ai 重新连接内置 MCP（Slack、Vercel 等）"
```

---

> 本文档存储在 GitHub 仓库，不会因换服务器而丢失。
> 仓库地址: https://github.com/Dafa2019/zapier-crown-bridge
