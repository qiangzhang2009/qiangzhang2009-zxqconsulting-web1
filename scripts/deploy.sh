#!/bin/bash
# deploy.sh — 岐黄四海网站 Cloudflare 一键部署
# 用法: cd ~/zxqconsulting-web1 && ./scripts/deploy.sh
#
# 部署架构:
#   dist/            → Cloudflare Pages (wrangler pages deploy)
#   proxy-worker.js  → zxqconsulting-proxy Worker (静态文件代理)
#   api-worker.js    → zxqconsulting-api   Worker (API 逻辑)
#
# API Worker (DeepSeek) 设置（仅首次）:
#   wrangler secret put DEEPSEEK_API_KEY --name zxqconsulting-api

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
PROXY_DIR="$SCRIPT_DIR/proxy-worker"

set -e

echo "============================================"
echo " 岐黄四海网站 — Cloudflare 一键部署"
echo "============================================"

echo ""
echo "[1/4] 构建项目..."
cd "$PROJECT_DIR"
rm -rf dist
npm run build
FILE_COUNT=$(ls dist | wc -l | tr -d ' ')
echo "  ✓ 构建完成 ($FILE_COUNT 个文件)"

echo ""
echo "[2/4] 部署静态文件到 Cloudflare Pages..."
DEPLOY_OUTPUT=$(wrangler pages deploy dist --project-name=qiangzhang2009-zxqconsulting-web1 --commit-dirty=true 2>&1)
DEPLOY_URL=$(echo "$DEPLOY_OUTPUT" | grep -o 'https://[^ ]*pages\.dev' | tail -1)
echo "  ✓ Pages 部署: $DEPLOY_URL"

echo ""
echo "[3/4] 更新 Proxy Worker..."
if [ -n "$DEPLOY_URL" ]; then
  # 更新 proxy-worker.js 里的 BACKEND_URL secret
  echo "$DEPLOY_URL" | wrangler secret put BACKEND_URL --name zxqconsulting-proxy 2>&1 | grep -E 'Success|success|Error|error' || echo "  (secret 已更新)"
  # 重新部署 proxy Worker（用新 secret）
  cd "$PROXY_DIR" && wrangler deploy 2>&1 | tail -3
  echo "  ✓ Proxy Worker 更新完成"
fi

echo ""
echo "[4/4] 验证..."
sleep 2
STATUS=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "https://zxqconsulting.com/" 2>/dev/null || echo "000")
STATUS_WWW=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "https://www.zxqconsulting.com/" 2>/dev/null || echo "000")

if [ "$STATUS" = "200" ] && [ "$STATUS_WWW" = "200" ]; then
  echo "  ✓ zxqconsulting.com       → HTTP $STATUS"
  echo "  ✓ www.zxqconsulting.com   → HTTP $STATUS_WWW"
else
  echo "  ✗ zxqconsulting.com       → HTTP $STATUS (期望 200)"
  echo "  ✗ www.zxqconsulting.com   → HTTP $STATUS_WWW (期望 200)"
fi

echo ""
echo "============================================"
echo " 部署完成！"
echo "============================================"
