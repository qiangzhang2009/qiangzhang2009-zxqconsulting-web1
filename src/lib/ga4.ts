import { SITE_CONFIG } from '@/config';

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

export function initGA4(measurementId: string) {
  if (!measurementId || typeof window === 'undefined') return;

  // 防止重复初始化
  if (
    window.dataLayer &&
    window.dataLayer.some(
      (item: unknown) =>
        typeof item === 'object' && item !== null && 'gtag_start' in item
    )
  ) {
    return;
  }

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ gtag_start: Date.now() });

  window.gtag = (...args: unknown[]) => {
    window.dataLayer?.push(args);
  };

  window.gtag('js', new Date());
  window.gtag('config', measurementId, {
    page_title: document.title,
    page_location: window.location.href,
  });

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
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

  const measurementId = SITE_CONFIG.ga4MeasurementId;
  if (!measurementId) return;

  window.gtag('config', measurementId, {
    page_path: pagePath || window.location.pathname,
    page_title: document.title,
  });
}

