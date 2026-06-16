/**
 * AI 工具数据缓存模块
 *
 * 负责 localStorage 24h 过期缓存：
 * - getData / setData：单条工具数据
 * - getBatchData / setBatchData：6 模块全量数据（prefetchAllData 完成后写入）
 *
 * 缓存键设计：
 * - prefix + marketId + category + language + region
 * - 同 key 24h 内不再请求 API
 *
 * 拆分自原 aiToolsMarketContext.tsx，单独可测
 */

import type { AIToolType } from './types';

const CACHE_EXPIRY_HOURS = 24;
export const CACHE_PREFIX = 'zxq_ai_data_';
export const BATCH_CACHE_PREFIX = 'zxq_batch_';
export const MARKETING_CACHE_PREFIX = 'zxq_marketing_data_';
export function normalizeLanguage(language?: string): string {
  return (language || 'zh').split('-')[0].split('_')[0].toLowerCase();
}

export function getToolCacheKey(
  toolType: AIToolType,
  marketId: string,
  category: string,
  language: string,
  regionId?: string
): string {
  return `${CACHE_PREFIX}${toolType}_${marketId}_${category}_${normalizeLanguage(language)}_${regionId || 'global'}`;
}

export function getBatchCacheKey(
  marketId: string,
  category: string,
  language: string,
  regionId?: string
): string {
  return `${BATCH_CACHE_PREFIX}${marketId}_${category}_${normalizeLanguage(language)}_${regionId || 'global'}`;
}

export function buildMarketingCacheKey(params: {
  language: string;
  marketId?: string;
  category?: string;
  productName?: string;
  tone?: string;
}): string {
  return [
    MARKETING_CACHE_PREFIX,
    normalizeLanguage(params.language),
    params.marketId || 'no-market',
    params.category || 'no-category',
    (params.productName || '').trim().toLowerCase() || 'no-product',
    params.tone || 'professional',
  ].join('_');
}

interface CachedEntry<T> {
  data: T;
  timestamp: number;
}

function isStorageAvailable(): boolean {
  try {
    const g = globalThis as { localStorage?: unknown };
    return (
      typeof globalThis !== 'undefined' &&
      typeof g.localStorage !== 'undefined' &&
      !!g.localStorage
    );
  } catch {
    return false;
  }
}

function getStorage(): Storage | null {
  if (!isStorageAvailable()) return null;
  return (globalThis as { localStorage: Storage }).localStorage;
}

export function getCachedData<T>(key: string): CachedEntry<T> | null {
  const storage = getStorage();
  if (!storage) return null;
  try {
    const raw = storage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedEntry<T>;
    const now = Date.now();
    if (now - parsed.timestamp > CACHE_EXPIRY_HOURS * 60 * 60 * 1000) {
      storage.removeItem(key);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function saveToCache<T>(key: string, data: T): void {
  const storage = getStorage();
  if (!storage) return;
  try {
    const entry: CachedEntry<T> = { data, timestamp: Date.now() };
    storage.setItem(key, JSON.stringify(entry));
  } catch {
    // localStorage 可能因隐私模式/容量限制写入失败，吞掉异常
  }
}

export function clearToolCacheByMarket(marketId: string, category: string, language: string, regionId?: string): void {
  const storage = getStorage();
  if (!storage) return;
  const region = regionId || 'global';
  const lang = normalizeLanguage(language);
  const keys = ['feasibility', 'cost', 'compliance', 'insight', 'channel', 'risk'];
  for (const k of keys) {
    try {
      storage.removeItem(`${CACHE_PREFIX}${k}_${marketId}_${category}_${lang}_${region}`);
    } catch { /* ignore */ }
  }
}
