/**
 * 错误监控客户端
 *
 * 设计原则：
 * 1. 零依赖 - 浏览器原生 fetch，体积 < 1KB
 * 2. 优雅降级 - 缺失环境变量时静默
 * 3. 不阻塞 - 异步发送，失败不影响主流程
 * 4. 限流 - 同一错误指纹 1 分钟内只发 1 次
 *
 * 接入方式：
 * - 兼容 Sentry：把 VITE_ERROR_REPORTING_URL 设为 Sentry 的 store endpoint
 * - 自建 endpoint：收 POST { message, stack, level, tags, context }
 * - 全部关闭：不设环境变量即可
 */

const REPORTING_URL = (import.meta.env?.VITE_ERROR_REPORTING_URL as string | undefined) || '';
const RELEASE = (import.meta.env?.VITE_RELEASE_VERSION as string | undefined) || 'dev';
const SAMPLE_RATE = 1.0; // 100% 采样；生产可降低到 0.2

type Level = 'fatal' | 'error' | 'warning' | 'info' | 'debug';

interface ErrorContext {
  [key: string]: unknown;
}

interface Payload {
  message: string;
  stack?: string;
  level: Level;
  fingerprint: string;
  release: string;
  url: string;
  userAgent: string;
  timestamp: number;
  tags?: Record<string, string>;
  context?: ErrorContext;
}

// 简单去重缓存：fingerprint -> 首次上报时间
const dedupeCache = new Map<string, number>();
const DEDUPE_WINDOW_MS = 60_000;
const MAX_CACHE_SIZE = 200;

function nowMs() {
  return Date.now();
}

function trimDedupeCache() {
  if (dedupeCache.size <= MAX_CACHE_SIZE) return;
  const cutoff = nowMs() - DEDUPE_WINDOW_MS * 5;
  for (const [k, t] of dedupeCache) {
    if (t < cutoff) dedupeCache.delete(k);
  }
}

function shouldReport(fingerprint: string): boolean {
  if (Math.random() > SAMPLE_RATE) return false;
  const last = dedupeCache.get(fingerprint);
  if (last && nowMs() - last < DEDUPE_WINDOW_MS) {
    return false;
  }
  dedupeCache.set(fingerprint, nowMs());
  trimDedupeCache();
  return true;
}

function buildFingerprint(message: string, stack?: string): string {
  // 简单指纹：message + 堆栈前 200 字符
  const head = (stack || '').split('\n').slice(0, 3).join('|').slice(0, 200);
  return `${message.slice(0, 100)}|${head}`;
}

function sendPayload(payload: Payload) {
  if (!REPORTING_URL) return; // 静默
  // 用 sendBeacon 优先，失败时回退 fetch
  try {
    const body = JSON.stringify(payload);
    if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
      const blob = new Blob([body], { type: 'application/json' });
      const sent = navigator.sendBeacon(REPORTING_URL, blob);
      if (sent) return;
    }
    fetch(REPORTING_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      keepalive: true,
    }).catch(() => {
      // 上报失败吞掉
    });
  } catch {
    // 序列化失败等异常吞掉
  }
}

interface ReportOptions {
  level?: Level;
  tags?: Record<string, string>;
  context?: ErrorContext;
}

export function reportError(err: Error | unknown, opts: ReportOptions = {}): void {
  if (typeof window === 'undefined') return;

  let message: string;
  let stack: string | undefined;
  if (err instanceof Error) {
    message = err.message || 'Unknown error';
    stack = err.stack;
  } else if (typeof err === 'string') {
    message = err;
  } else {
    try {
      message = JSON.stringify(err);
    } catch {
      message = String(err);
    }
  }

  const fingerprint = buildFingerprint(message, stack);
  if (!shouldReport(fingerprint)) return;

  sendPayload({
    message,
    stack,
    level: opts.level || 'error',
    fingerprint,
    release: RELEASE,
    url: window.location?.href || '',
    userAgent: navigator?.userAgent || '',
    timestamp: nowMs(),
    tags: opts.tags,
    context: opts.context,
  });
}

export function reportMessage(message: string, opts: ReportOptions = {}): void {
  if (typeof window === 'undefined') return;
  const fingerprint = buildFingerprint(message);
  if (!shouldReport(fingerprint)) return;
  sendPayload({
    message,
    level: opts.level || 'info',
    fingerprint,
    release: RELEASE,
    url: window.location?.href || '',
    userAgent: navigator?.userAgent || '',
    timestamp: nowMs(),
    tags: opts.tags,
    context: opts.context,
  });
}

/**
 * 全局错误捕获（window.onerror / unhandledrejection）
 * 在 main.tsx 中调用一次即可
 */
export function installGlobalErrorHandlers() {
  if (typeof window === 'undefined') return;

  window.addEventListener('error', (e) => {
    reportError(e.error || e.message, {
      level: 'error',
      tags: { source: 'window.error' },
    });
  });

  window.addEventListener('unhandledrejection', (e) => {
    reportError(e.reason, {
      level: 'error',
      tags: { source: 'unhandledrejection' },
    });
  });
}

/**
 * 测试用：清空去重缓存
 */
export function _resetErrorReporterForTests() {
  dedupeCache.clear();
}
