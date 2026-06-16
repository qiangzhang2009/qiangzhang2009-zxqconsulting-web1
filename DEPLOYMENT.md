# 部署指南（zxqconsulting-web1）

## 平台

- **生产域名**：https://zxqconsulting.com
- **Vercel URL**：https://zxqconsulting-web1-k1b91rz0g-johnzhangs-projects-50e83ec4.vercel.app
- **项目 ID**：`prj_EO3Lfa2UDXn87iRP1FR0j5DCGgWo`
- **GitHub**：`qiangzhang2009/qiangzhang2009-zxqconsulting-web1`（main 分支）

## 快速部署

```bash
# 1. 确认本地构建 + 测试通过
npx tsc -b --noEmit          # TS 0 错误
npx vitest run                # 40 个测试
npm run build                 # Vite build

# 2. Commit（atomic，描述要包含 P0/P1/P2 标签）
git add -u  # 只 add 修改的 tracked 文件
# 显式 add 新增文件（避免 .env.production / .env.vercel 等被误 add）
git add src/ api/ public/ vitest.config.ts .env.example ...
git commit -m "..."

# 3. 部署到 Vercel 生产环境
vercel deploy --prod --yes
```

## ⚠️ 重要提醒

### 1. 不要 commit `.env.production` 或 `.env.vercel`

两者都包含 Vercel OIDC token，泄漏后任何人都能用你的 Vercel 配额。`.gitignore` 已经覆盖，但 `git add .` 仍然可能加进来。**永远用显式 add。**

```bash
# 安全做法：先 git status --short 看
git status --short | grep -E "^\?\? "  # 列出未跟踪
# 然后只 add 你确认安全的
```

### 2. DeepSeek API Key 轮换流程

```bash
# 1. 在 Vercel 后台删除旧 key
vercel env rm DEEPSEEK_API_KEY production --yes

# 2. 添加新 key（用文件传值，避免 shell 历史泄漏）
echo "sk-NEW_KEY_HERE" > /tmp/deepseek_key.txt
vercel env add DEEPSEEK_API_KEY production < /tmp/deepseek_key.txt --yes
rm /tmp/deepseek_key.txt

# 3. 重新部署让新 key 生效
vercel deploy --prod --yes

# 4. 冒烟测试
curl -X POST https://zxqconsulting.com/api/ai/batch \
  -H "Content-Type: application/json" \
  -d '{"market":"美国","marketEn":"USA","category":"supplement","categoryEn":"Health Supplements","language":"en","region":"global","phase":"priority"}'
# 期望: {"success":true,"data":{"feasibility":{...}}}
```

### 3. 环境变量

| 变量 | 环境 | 必需 | 说明 |
|---|---|---|---|
| `DEEPSEEK_API_KEY` | production | ✅ | 缺失时 `/api/ai/*` 返回 500 明确错误（不再 fallback 到硬编码） |
| `VITE_GA4_ID` | build time | ❌ | 留空则 GA4 静默（不注入脚本） |
| `VITE_ERROR_REPORTING_URL` | build time | ❌ | 留空则 errorReporter 静默；填 Sentry/自建端点 |
| `VITE_RELEASE_VERSION` | build time | ❌ | 用于按版本聚合错误，CI 注入 git SHA |

**注意：Preview 环境目前无 `DEEPSEEK_API_KEY`，所以 PR 预览页面 AI 调用会返回 500。这是预期行为——避免密钥泄漏到 fork 的 PR 预览。如需 PR 预览：**
```bash
vercel env add DEEPSEEK_API_KEY preview <branch> --value <key> --yes
```

### 4. i18n 资源文件

`/public/locales/*.json` 是 i18next-http-backend 运行时加载的语言包。
Vercel 部署时会自动从 `public/` 目录提供静态资源。
**修改语言文案时**，要同时更新 `src/locales/*.json`（默认 zh/en 打包进 bundle）和 `public/locales/*.json`（其他 14 个语言运行时加载）。

## 验证部署

```bash
# 1. 冒烟测试首页
curl -I https://zxqconsulting.com  # 期望 200

# 2. 端到端 Playwright 测试
node scripts/e2e-prod-smoke.mjs  # 13/13 通过

# 3. 检查真实部署日志
vercel logs --prod
```

## 回滚

```bash
# 查看最近 10 次部署
vercel ls --prod

# 回滚到上一个 production 部署
vercel rollback
```

## 故障排查

| 症状 | 原因 | 解决 |
|---|---|---|
| AI 返回 `Authentication Fails` | Vercel 端 DEEPSEEK_API_KEY 是旧的 | 见上方"轮换流程" |
| 首页白屏 | i18n backend 加载失败 | 检查 `public/locales/*.json` 是否完整 |
| `/_mock` 数据而非真实数据 | AI 后端失败但前端 fallback | 看 Vercel 日志，确认 key 有效 |
| 部署后没看到改动 | Vercel CDN 缓存 | 等 30s 或访问 `?v=2` 绕过缓存 |
| GA4 一直不加载 | `VITE_GA4_ID` 未设或设错 | 留空就是静默，预期行为 |

## 相关脚本

- `scripts/e2e-prod-smoke.mjs` - 生产端到端冒烟（13 项）
- `scripts/verify-error-reporter.mjs` - errorReporter 验证
- `scripts/test-*.mjs` - 旧的诊断/营销测试脚本（保留，可能已过期）

## Git Workflow

```bash
# 提交前检查清单
1. npx tsc -b --noEmit          # 0 错误
2. npx vitest run                # 全过
3. npm run build                 # 成功
4. git status --short            # 确认无敏感文件 staged
5. git add [显式路径]             # 不要 git add .
6. git commit -m "[标签]: [描述]"
7. git push origin main          # 触发 GH 更新（Vercel 项目未连 git，所以不影响部署）
8. vercel deploy --prod --yes    # 显式部署
```

## 为什么不用 git push 自动部署？

Vercel 项目当前**未连接 GitHub 仓库**（虽然 origin remote 存在）。所以 push 不会触发自动部署，必须用 `vercel deploy --prod --yes` 显式部署。
如需开启自动部署：Vercel Dashboard → Project Settings → Git → Connect Git Repository。
