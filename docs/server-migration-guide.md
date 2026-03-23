# 服务器迁移指南 (Server Migration Guide)

换服务器后只需执行以下步骤，所有配置即可恢复。

## 1. 安装 Claude Code
```bash
npm install -g @anthropic-ai/claude-code
```

## 2. 添加 Zapier MCP
```bash
claude mcp add --transport http zapier https://mcp.zapier.com/api/v1/connect
```

## 3. 认证 Zapier MCP
```bash
# 启动 Claude Code 后运行
/mcp
# 选择 zapier → Authenticate → 浏览器授权
```

## 4. 环境变量 (Vercel 已配置，无需重配)

| 变量 | 来源 | 说明 |
|------|------|------|
| INTERNAL_API_KEY | 自定义 | Bridge API 密钥 |
| SLACK_BOT_TOKEN | Slack App → OAuth | `xoxb-` 开头 |
| SLACK_SIGNING_SECRET | Slack App → Basic Info | Slack 签名密钥 |
| GITHUB_TOKEN | GitHub → Settings → PAT | `ghp_` 开头 |
| GITHUB_OWNER | 固定 | `Dafa2019` |
| ZAPIER_API_TOKEN | Zapier MCP | MCP 认证 token |
| ZAPIER_MCP_SERVER_URL | 固定 | `https://mcp.zapier.com/api/v1/connect` |
| DATABASE_URL | Neon | PostgreSQL 连接串 |

## 5. 仓库克隆 (仅需本地开发时)
```bash
git clone https://github.com/Dafa2019/zapier-crown-bridge.git
cd zapier-crown-bridge
npm install
```

## 6. 验证
```bash
# 健康检查
curl https://zapier-crown-bridge.vercel.app/api/health

# 命令测试
curl -X POST https://zapier-crown-bridge.vercel.app/api/commands/intake \
  -H 'Content-Type: application/json' \
  -H 'x-api-key: crown-bridge-prod-key-2026' \
  -d '{"text":"检查更新","source":"webhook"}'
```

## 注意事项
- Zapier 云端的 62 个工具配置**不会丢失**，只需重新认证
- Vercel 部署和环境变量**不受影响**
- Neon 数据库**不受影响**
- Slack App 配置**不受影响**
- 唯一需要重做的是本地 Claude Code 的 MCP 认证
