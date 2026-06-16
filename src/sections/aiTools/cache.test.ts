/**
 * cache.ts 单元测试
 *
 * 覆盖：
 * - normalizeLanguage 处理 zh-CN / en_US / 缺失
 * - getToolCacheKey 命名规范
 * - getCachedData 在 localStorage 中无/有/过期三种情况
 * - saveToCache 写入后能读回
 */

import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import {
  normalizeLanguage,
  getToolCacheKey,
  getBatchCacheKey,
  buildMarketingCacheKey,
  getCachedData,
  saveToCache,
} from './cache';

describe('normalizeLanguage', () => {
  it('拆分 zh-CN -> zh', () => {
    expect(normalizeLanguage('zh-CN')).toBe('zh');
  });
  it('拆分 en_US -> en', () => {
    expect(normalizeLanguage('en_US')).toBe('en');
  });
  it('小写化 EN', () => {
    expect(normalizeLanguage('EN')).toBe('en');
  });
  it('缺失时返回 zh 兜底', () => {
    expect(normalizeLanguage()).toBe('zh');
  });
});

describe('getToolCacheKey', () => {
  it('生成符合约定的 key', () => {
    const key = getToolCacheKey('feasibility', 'usa', 'supplement', 'en', 'CA');
    expect(key).toBe('zxq_ai_data_feasibility_usa_supplement_en_CA');
  });
  it('region 缺失时使用 global', () => {
    const key = getToolCacheKey('feasibility', 'usa', 'supplement', 'en');
    expect(key).toBe('zxq_ai_data_feasibility_usa_supplement_en_global');
  });
});

describe('getBatchCacheKey', () => {
  it('格式以 zxq_batch_ 开头', () => {
    const key = getBatchCacheKey('usa', 'supplement', 'en', 'CA');
    expect(key).toMatch(/^zxq_batch_usa_supplement_en_CA$/);
  });
});

describe('buildMarketingCacheKey', () => {
  it('所有参数都填时包含完整指纹', () => {
    const key = buildMarketingCacheKey({
      language: 'en',
      marketId: 'usa',
      category: 'supplement',
      productName: 'Vit C',
      tone: 'professional',
    });
    expect(key).toContain('usa');
    expect(key).toContain('supplement');
    expect(key).toContain('vit c'); // 小写化
    expect(key).toContain('professional');
  });

  it('productName 缺失时使用 no-product 占位', () => {
    const key = buildMarketingCacheKey({ language: 'zh', marketId: 'japan' });
    expect(key).toContain('no-product');
  });
});

describe('getCachedData / saveToCache (with localStorage shim)', () => {
  const memoryStore = new Map<string, string>();

  beforeEach(() => {
    memoryStore.clear();
    // 模拟 globalThis.localStorage
    vi.stubGlobal('localStorage', {
      getItem: (k: string) => memoryStore.get(k) ?? null,
      setItem: (k: string, v: string) => memoryStore.set(k, v),
      removeItem: (k: string) => memoryStore.delete(k),
      clear: () => memoryStore.clear(),
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('localStorage 中无 key 时返回 null', () => {
    expect(getCachedData('nope')).toBeNull();
  });

  it('save 后 get 拿回相同数据', () => {
    saveToCache('k1', { a: 1, b: 'x' });
    const result = getCachedData<{ a: number; b: string }>('k1');
    expect(result).not.toBeNull();
    expect(result?.data).toEqual({ a: 1, b: 'x' });
    expect(result?.timestamp).toBeGreaterThan(0);
  });

  it('过期缓存（>24h）被自动清除', () => {
    const old = { data: { stale: true }, timestamp: Date.now() - 25 * 60 * 60 * 1000 };
    memoryStore.set('old_key', JSON.stringify(old));
    expect(getCachedData('old_key')).toBeNull();
  });

  it('无 localStorage 时优雅降级（不抛错）', () => {
    vi.stubGlobal('localStorage', undefined);
    expect(() => saveToCache('xx', { y: 1 })).not.toThrow();
    expect(getCachedData('xx')).toBeNull();
  });
});
