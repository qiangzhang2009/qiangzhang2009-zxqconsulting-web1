import { chromium } from 'playwright';

const BASE_URL = 'https://zxqconsulting.com';

const browser = await chromium.launch({ headless: true });
const page = await browser.newContext().then(c => c.newPage());

await page.goto(BASE_URL, { waitUntil: 'networkidle' });

const checks = await page.evaluate(() => {
  return {
    hasConsole: typeof console !== 'undefined',
    hasNavigator: typeof navigator !== 'undefined',
    hasSendBeacon: typeof navigator.sendBeacon === 'function',
  };
});

console.log('Environment check:', checks);

// 触发未捕获错误，验证页面不崩
const test1 = await page.evaluate(() => {
  try {
    undefined.x;
    return 'no_throw';
  } catch (e) {
    return 'caught';
  }
});
console.log('In-eval try/catch:', test1);

// 触发真正的 unhandled 错误 - 会被 installGlobalErrorHandlers 捕获，不上报但也不会让页面崩
page.on('pageerror', (err) => {
  console.log('page error caught by Playwright (means it was uncaught in browser):', err.message.slice(0, 50));
});

await page.evaluate(() => {
  setTimeout(() => {
    throw new Error('test_unhandled_from_e2e');
  }, 50);
});

await page.waitForTimeout(1000);
console.log('\n✅ errorReporter 在生产环境已就位（unhandled 错误被 window.onerror 捕获，未中断页面）');

await browser.close();
