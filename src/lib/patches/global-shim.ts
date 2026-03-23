/**
 * 全局补丁文件
 * 在所有第三方库加载前执行，消除第三方库的警告
 */

// Zustand v5 deprecated default export 警告补丁
// @react-three/drei 的 KeyboardControls 使用了已弃用的 create 默认导出
// 我们通过在 console.warn 上添加过滤器来消除这个特定的警告
const originalWarn = console.warn;
console.warn = function (...args: Parameters<typeof console.warn>) {
  const msg = args[0];
  if (
    typeof msg === 'string' &&
    msg.includes('[DEPRECATED] Default export is deprecated')
  ) {
    return; // 抑制 Zustand deprecated warning
  }
  originalWarn.apply(console, args);
};

// 抑制 i18next 赞助商提示（仅在非开发环境）
if (typeof window !== 'undefined' && (import.meta as any).env?.PROD) {
  const originalInfo = console.info;
  console.info = function (...args: Parameters<typeof console.info>) {
    const msg = args[0];
    if (
      typeof msg === 'string' &&
      msg.includes('i18next is maintained with support from locize.com')
    ) {
      return; // 抑制 i18next 赞助商提示
    }
    originalInfo.apply(console, args);
  };
}
