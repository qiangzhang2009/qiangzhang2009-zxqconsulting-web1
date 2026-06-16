/**
 * Google Analytics 4 (GA4) 工具模块
 *
 * Measurement ID 读取优先级：
 * 1. 编译期环境变量 VITE_GA4_ID（推荐）
 * 2. 运行时通过 initGA4(id) 显式传入
 * 3. 兜底 SITE_CONFIG.ga4MeasurementId（已弃用，建议从 config 移除）
 *
 * 如果都未配置，则不加载 GA4 脚本。
 */

const ENV_GA4_ID = (import.meta.env?.VITE_GA4_ID as string | undefined) || '';

// 用 script 标签上的 data-ga4-id 标记避免重复注入
const GA4_SCRIPT_MARKER = 'data-ga4-injected';

function getEffectiveId(explicitId?: string): string {
  return explicitId || ENV_GA4_ID;
}

declare global {
  interface Window {
    gtag?: (
      command: 'config' | 'event' | 'js',
      targetId: string | Date,
      config?: Record<string, unknown>
    ) => void;
    dataLayer?: unknown[];
  }
}

export function initGA4(measurementId?: string) {
  if (typeof window === 'undefined') return;

  const id = getEffectiveId(measurementId);
  if (!id) {
    // 没有 ID 时静默跳过，不阻塞页面
    return;
  }

  // 防重复：检查已注入的 script 是否同 ID
  const existing = document.querySelector<HTMLScriptElement>(
    `script[${GA4_SCRIPT_MARKER}="${id}"]`
  );
  if (existing) {
    return;
  }

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ gtag_start: Date.now() });

  window.gtag = (...args: unknown[]) => {
    window.dataLayer?.push(args);
  };

  window.gtag('js', new Date());
  window.gtag('config', id, {
    page_title: document.title,
    page_location: window.location.href,
  });

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`;
  script.setAttribute(GA4_SCRIPT_MARKER, id);
  document.head.appendChild(script);
}

export function trackEvent(
  eventName: string,
  parameters?: Record<string, unknown>
) {
  if (typeof window === 'undefined' || !window.gtag) return;
  window.gtag('event', eventName, parameters);
}

export function trackPageView(pagePath?: string) {
  if (typeof window === 'undefined' || !window.gtag) return;

  const id = getEffectiveId();
  if (!id) return;

  window.gtag('config', id, {
    page_path: pagePath || window.location.pathname,
    page_title: document.title,
  });
}
