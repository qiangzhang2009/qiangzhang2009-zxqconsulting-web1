/**
 * mockData.ts 单元测试
 *
 * 覆盖：
 * - generateMockData: 每个工具都带 _mock: true 标记
 * - generateAllMockData: 返回 6 个工具的完整 fallback
 * - 中英双语字段完整性
 */

import { describe, expect, it } from 'vitest';
import { generateMockData, generateAllMockData } from './mockData';
import { ALL_TOOLS } from './types';
import type { AIToolType, TargetMarket } from './types';

const usa: TargetMarket = {
  id: 'usa',
  name: '美国',
  nameEn: 'USA',
  flag: '🇺🇸',
  region: 'NA',
  priority: 'tier1',
};

describe('generateMockData', () => {
  it('每个工具都带 _mock: true 标记', () => {
    for (const tool of ALL_TOOLS) {
      const data = generateMockData(tool, usa, 'supplement');
      expect(data._mock).toBe(true);
    }
  });

  it('feasibility 包含必要字段', () => {
    const data = generateMockData('feasibility', usa, 'supplement');
    expect(data.heat).toBeGreaterThan(0);
    expect(data.recommendation).toBeTruthy();
    expect(data.recommendationEn).toBeTruthy();
  });

  it('risk 包含必要字段', () => {
    const data = generateMockData('risk', usa, 'supplement');
    expect(data.level).toBeTruthy();
    expect(Array.isArray(data.factors)).toBe(true);
  });

  it('_mockReason 透传', () => {
    const data = generateMockData('cost', usa, 'supplement', 'Network error');
    expect(data._mockReason).toBe('Network error');
  });
});

describe('generateAllMockData', () => {
  it('返回全部 6 个工具的数据', () => {
    const data = generateAllMockData(usa, 'supplement');
    for (const tool of ALL_TOOLS) {
      expect(data[tool as AIToolType]).toBeDefined();
      expect(data[tool as AIToolType]?._mock).toBe(true);
    }
  });

  it('不抛错 - category 为未知值时仍返回 mock', () => {
    const data = generateAllMockData(usa, 'unknown-category');
    expect(data.feasibility).toBeDefined();
  });
});
