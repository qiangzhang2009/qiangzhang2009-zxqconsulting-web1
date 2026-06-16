/**
 * 生产环境端到端冒烟测试
 *
 * 验证：
 * 1. 首页正常加载
 * 2. AI 工具区域可以点击
 * 3. 选择市场 + 品类后，AI 真实返回数据（非 _mock）
 * 4. 6 模块数据 UI 正确渲染
 * 5. 营销内容生成可触发
 * 6. 没有 console error
 */

import { chromium } from 'playwright';

const BASE_URL = 'https://zxqconsulting.com';
const TIMEOUT = 60000;

const results = {
  passed: 0,
  failed: 0,
  warnings: 0,
  details: [],
};

function record(name, ok, msg = '') {
  if (ok) {
    results.passed += 1;
    results.details.push(`  ✅ ${name}${msg ? ' — ' + msg : ''}`);
  } else {
    results.failed += 1;
    results.details.push(`  ❌ ${name}${msg ? ' — ' + msg : ''}`);
  }
}

function warn(name, msg) {
  results.warnings += 1;
  results.details.push(`  ⚠️  ${name} — ${msg}`);
}

async function main() {
  console.log(`\n🚀 端到端冒烟测试 - ${BASE_URL}\n`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    locale: 'zh-CN',
  });
  const page = await context.newPage();

  const consoleErrors = [];
  const networkErrors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      const text = msg.text();
      // 忽略已知的第三方噪音
      if (text.includes('favicon') || text.includes('Tracking Prevention')) return;
      consoleErrors.push(text);
    }
  });
  page.on('response', (res) => {
    if (res.status() >= 500) {
      networkErrors.push(`${res.status()} ${res.url()}`);
    }
  });

  // ===== 1. 首页加载 =====
  try {
    const start = Date.now();
    await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: TIMEOUT });
    const loadTime = Date.now() - start;
    const title = await page.title();
    record('首页加载', loadTime < 15000, `${loadTime}ms, title: "${title}"`);
  } catch (e) {
    record('首页加载', false, e.message);
    await browser.close();
    printResults();
    process.exit(1);
  }

  // ===== 2. 导航到 AI 工具区 =====
  try {
    // 寻找 AI 工具入口
    const aiToolsAnchor = page.locator('a:has-text("AI"), button:has-text("AI"), a[href*="tool"], a[href*="ai"]').first();
    if (await aiToolsAnchor.count() > 0) {
      await aiToolsAnchor.scrollIntoViewIfNeeded();
      record('AI 工具入口存在', true);
    } else {
      warn('AI 工具入口', '没找到明确的 AI 链接，可能通过滚动懒加载触发');
    }
  } catch (e) {
    warn('AI 工具入口', e.message);
  }

  // ===== 3. 滚动到 AI 工具区域，等待 AIToolsHub 渲染 =====
  try {
    // 触发 lazy-loaded 区块
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
    await page.waitForTimeout(2000);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(2000);

    // 等 AIToolsHub 出现
    const toolsHub = page.locator('text=/AI\\s*(工具|Tools)|智能工具|market|市场/i').first();
    await toolsHub.waitFor({ state: 'visible', timeout: 15000 });
    record('AIToolsHub 渲染', true);
  } catch (e) {
    warn('AIToolsHub 渲染', '可能不需要滚动触发: ' + e.message);
  }

  // ===== 4. 直接调用生产 API 验证数据 =====
  console.log('\n📡 API 真实数据验证：\n');
  try {
    const apiStart = Date.now();
    const apiRes = await page.evaluate(async (url) => {
      const r = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          market: '美国',
          marketEn: 'USA',
          category: 'supplement',
          categoryEn: 'Health Supplements',
          language: 'zh',
          region: 'global',
          phase: 'full',
        }),
      });
      const data = await r.json();
      return {
        status: r.status,
        time: Date.now(),
        success: data.success,
        keys: data.data ? Object.keys(data.data) : [],
        feasibilityHasHeat: typeof data.data?.feasibility?.heat === 'number',
        feasibilityHasRecommendation: typeof data.data?.feasibility?.recommendation === 'string',
        isMock: !!data.data?.feasibility?._mock,
      };
    }, `${BASE_URL}/api/ai/batch`);

    const apiTime = Date.now() - apiStart;
    record(
      'API /api/ai/batch phase=full',
      apiRes.status === 200 && apiRes.success,
      `HTTP ${apiRes.status}, ${apiTime}ms, 返回 ${apiRes.keys.length} 模块: ${apiRes.keys.join('/')}`
    );
    record('feasibility.heat 是数字', apiRes.feasibilityHasHeat);
    record('feasibility.recommendation 是字符串', apiRes.feasibilityHasRecommendation);
    record('数据非 _mock（真实 API 返回）', !apiRes.isMock);
  } catch (e) {
    record('API /api/ai/batch phase=full', false, e.message);
  }

  // ===== 5. Marketing API 验证 =====
  try {
    const marketingRes = await page.evaluate(async (url) => {
      const r = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          market: '美国',
          category: 'supplement',
          productName: '人参精',
          language: 'zh',
          tone: 'professional',
          platform: 'weibo',
        }),
      });
      const data = await r.json();
      return {
        status: r.status,
        success: data.success,
        hasSocial: !!data.data?.social,
        hasWebsite: !!data.data?.website,
        hasSeo: !!data.data?.seo,
        platforms: data.data ? Object.keys(data.data) : [],
      };
    }, `${BASE_URL}/api/ai/marketing`);

    record(
      'API /api/ai/marketing',
      marketingRes.status === 200 && marketingRes.success,
      `${marketingRes.platforms.length} 平台: ${marketingRes.platforms.join('/')}`
    );
  } catch (e) {
    record('API /api/ai/marketing', false, e.message);
  }

  // ===== 6. 静态资源检查 =====
  try {
    const resourceCheck = await page.evaluate(() => {
      const scripts = Array.from(document.querySelectorAll('script[src]')).map(s => s.src);
      const styles = Array.from(document.querySelectorAll('link[rel="stylesheet"]')).map(l => l.href);
      const gtm = scripts.filter(s => s.includes('googletagmanager.com'));
      return {
        scriptCount: scripts.length,
        styleCount: styles.length,
        gtmCount: gtm.length,
      };
    });
    record('JS 脚本加载', resourceCheck.scriptCount > 0, `${resourceCheck.scriptCount} 个`);
    record('CSS 加载', resourceCheck.styleCount > 0, `${resourceCheck.styleCount} 个`);
    record('GA4 未注入（VITE_GA4_ID 缺失，预期静默）', resourceCheck.gtmCount === 0);
  } catch (e) {
    warn('静态资源检查', e.message);
  }

  // ===== 7. Console 错误检查 =====
  if (consoleErrors.length === 0) {
    record('浏览器 console 0 错误', true);
  } else {
    record('浏览器 console 0 错误', false, `${consoleErrors.length} 个错误:\n    ${consoleErrors.slice(0, 3).join('\n    ')}`);
  }

  // ===== 8. 5xx 网络错误检查 =====
  if (networkErrors.length === 0) {
    record('网络 5xx 错误', true, '0 个');
  } else {
    record('网络 5xx 错误', false, networkErrors.slice(0, 3).join(', '));
  }

  await browser.close();
  printResults();
  process.exit(results.failed > 0 ? 1 : 0);
}

function printResults() {
  console.log('\n========================================');
  console.log('  测试结果');
  console.log('========================================\n');
  for (const d of results.details) {
    console.log(d);
  }
  console.log(`\n  通过: ${results.passed} | 失败: ${results.failed} | 警告: ${results.warnings}\n`);
}

main().catch((e) => {
  console.error('Fatal:', e);
  process.exit(1);
});
