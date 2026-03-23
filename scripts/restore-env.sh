#!/bin/bash
# Crown 环境恢复脚本
# 用途: 换服务器后一键恢复 Claude Code + Zapier MCP + 项目环境
# 使用: bash scripts/restore-env.sh

set -e

echo "=========================================="
echo "  Crown 环境恢复脚本"
echo "  换服务器后执行此脚本"
echo "=========================================="
echo ""

# 1. 检查 Node.js
echo "[1/5] 检查 Node.js..."
if command -v node &> /dev/null; then
    echo "  ✓ Node.js $(node -v)"
else
    echo "  ✗ Node.js 未安装，请先安装 Node.js 18+"
    exit 1
fi

# 2. 安装 Claude Code
echo "[2/5] 安装 Claude Code..."
if command -v claude &> /dev/null; then
    echo "  ✓ Claude Code 已安装"
else
    npm install -g @anthropic-ai/claude-code
    echo "  ✓ Claude Code 安装完成"
fi

# 3. 添加 Zapier MCP
echo "[3/5] 添加 Zapier MCP..."
claude mcp add --transport http zapier https://mcp.zapier.com/api/v1/connect
echo "  ✓ Zapier MCP 已添加"

# 4. 安装项目依赖
echo "[4/5] 安装项目依赖..."
if [ -f "package.json" ]; then
    npm install
    echo "  ✓ 依赖安装完成"
else
    echo "  ⚠ 未找到 package.json，请先 cd 到项目目录"
fi

# 5. 提示手动步骤
echo "[5/5] 自动步骤完成！"
echo ""
echo "=========================================="
echo "  还需手动完成以下步骤："
echo "=========================================="
echo ""
echo "  A. Zapier MCP 认证:"
echo "     1. 启动 claude"
echo "     2. 输入 /mcp"
echo "     3. 选 zapier → Authenticate"
echo "     4. 浏览器弹出授权页 → 点 Allow"
echo ""
echo "  B. Vercel 环境变量 (如新部署):"
echo "     INTERNAL_API_KEY=crown-bridge-prod-key-2026"
echo "     SLACK_BOT_TOKEN=xoxb-..."
echo "     SLACK_SIGNING_SECRET=..."
echo "     GITHUB_TOKEN=ghp_..."
echo "     GITHUB_OWNER=Dafa2019"
echo "     ZAPIER_API_TOKEN=..."
echo "     DATABASE_URL=postgresql://..."
echo ""
echo "  C. Claude.ai 内置 MCP 重新授权:"
echo "     Vercel / Slack / Cloudflare / Sentry / Wix / Google Drive"
echo ""
echo "  详细说明见: docs/SERVER_SETUP_GUIDE.md"
echo "=========================================="
