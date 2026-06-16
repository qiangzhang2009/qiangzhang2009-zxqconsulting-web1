/**
 * diagnosis.ts 单元测试
 *
 * 覆盖：
 * - computeDiagnosisReport: 4 维评分 + 决策路径 + 中英本地化
 * - computeEvidenceBlocks: 3 类证据块（中英）
 * - computeQualificationDecision: L1/L2/L3 + escalationReason
 */

import { describe, expect, it } from 'vitest';
import {
  computeDiagnosisReport,
  computeEvidenceBlocks,
  computeQualificationDecision,
} from './diagnosis';
import type { AIDataMap, AIToolData, DiagnosisInput, TargetMarket } from './types';

const baseMarket: TargetMarket = {
  id: 'usa',
  name: '美国',
  nameEn: 'USA',
  flag: '🇺🇸',
  region: 'NA',
  priority: 'tier1',
};

const baseInput: DiagnosisInput = {
  projectStage: '',
  budget: '',
  validationStatus: '',
  targetMarketsCount: '',
  keyQuestion: '',
};

function toolData(extra: Record<string, unknown>): AIToolData {
  return extra as AIToolData;
}

describe('computeDiagnosisReport', () => {
  it('selectedMarket 为 null 时返回 null', () => {
    expect(
      computeDiagnosisReport({
        selectedMarket: null,
        selectedCategory: 'supplement',
        cachedData: {},
        diagnosisInput: baseInput,
        language: 'zh',
      })
    ).toBeNull();
  });

  it('feasibility 有数据时使用 heat 作为 opportunityScore', () => {
    const cachedData: AIDataMap = {
      feasibility: toolData({ heat: 88, growth: 20 }),
    };
    const report = computeDiagnosisReport({
      selectedMarket: baseMarket,
      selectedCategory: 'supplement',
      cachedData,
      diagnosisInput: baseInput,
      language: 'zh',
    });
    expect(report?.opportunityScore).toBe(88);
    expect(report?.firstMarketLabel).toBe('美国');
  });

  it('feasibility 缺失时根据 priority 推断 opportunityScore', () => {
    const report = computeDiagnosisReport({
      selectedMarket: { ...baseMarket, priority: 'tier3' },
      selectedCategory: 'supplement',
      cachedData: {},
      diagnosisInput: baseInput,
      language: 'zh',
    });
    expect(report?.opportunityScore).toBe(64); // tier3 fallback
  });

  it('goToMarketDecision 在低预算下走 prepare_first', () => {
    const report = computeDiagnosisReport({
      selectedMarket: baseMarket,
      selectedCategory: 'supplement',
      cachedData: {},
      diagnosisInput: { ...baseInput, budget: 'below-500k' },
      language: 'zh',
    });
    expect(report?.goToMarketDecision).toBe('prepare_first');
    expect(report?.budgetPressure).toBe('high');
  });

  it('高预算 + 已有海外验证走 expert_review', () => {
    const report = computeDiagnosisReport({
      selectedMarket: baseMarket,
      selectedCategory: 'supplement',
      cachedData: { feasibility: toolData({ heat: 70, threshold: "low" }) },
      diagnosisInput: { ...baseInput, budget: '2m-5m', validationStatus: 'existing-overseas' },
      language: 'en',
    });
    expect(report?.goToMarketDecision).toBe('expert_review');
    expect(report?.firstMarketLabel).toBe('USA');
  });

  it('英文模式下 firstMarketLabel 返回 nameEn', () => {
    const report = computeDiagnosisReport({
      selectedMarket: baseMarket,
      selectedCategory: 'supplement',
      cachedData: {},
      diagnosisInput: baseInput,
      language: 'en',
    });
    expect(report?.firstMarketLabel).toBe('USA');
  });
});

describe('computeEvidenceBlocks', () => {
  it('selectedMarket 为 null 时返回空数组', () => {
    expect(
      computeEvidenceBlocks({ selectedMarket: null, cachedData: {}, language: 'zh' })
    ).toEqual([]);
  });

  it('正确组装 3 类证据块', () => {
    const cachedData: AIDataMap = {
      feasibility: { recommendation: "中文推荐", recommendationEn: "EN rec", threshold: "门槛" } as AIToolData,
      compliance: { requirements: ["req1", "req2"], timeline: "6 months", timelineEn: "6 months" } as AIToolData,
      insight: { marketSize: "50亿", trends: ["trend1", "trend2"] } as AIToolData,
      channel: { channels: [{ name: "电商" }, { name: "药店" }], recommendation: "先电商" } as AIToolData,
      risk: { warnings: ["warn1"], mitigations: ["mitigation1"] } as AIToolData,
    };
    const blocks = computeEvidenceBlocks({ selectedMarket: baseMarket, cachedData, language: 'zh' });
    expect(blocks).toHaveLength(3);
    expect(blocks[0].id).toBe('market');
    expect(blocks[1].id).toBe('compliance');
    expect(blocks[2].id).toBe('execution');
    expect(blocks[0].bullets).toContain('市场规模: 50亿');
    expect(blocks[0].bullets).toContain('trend1');
    expect(blocks[2].bullets).toContain('电商');
  });

  it('数据完全缺失时 evidence 不抛错（容错）', () => {
    const blocks = computeEvidenceBlocks({
      selectedMarket: baseMarket,
      cachedData: {},
      language: 'en',
    });
    expect(blocks).toHaveLength(3);
    expect(blocks[0].bullets).toEqual([]);
  });
});

describe('computeQualificationDecision', () => {
  const baseReport = computeDiagnosisReport({
    selectedMarket: baseMarket,
    selectedCategory: 'supplement',
    cachedData: { feasibility: toolData({ heat: 70 }), compliance: toolData({ score: 60 }) },
    diagnosisInput: baseInput,
    language: 'zh',
  });

  it('diagnosisReport 为 null 时返回 null', () => {
    expect(
      computeQualificationDecision({ diagnosisReport: null, diagnosisInput: baseInput, language: 'zh' })
    ).toBeNull();
  });

  it('高预算 + 已有海外验证 = L1 + expert_review', () => {
    const decision = computeQualificationDecision({
      diagnosisReport: baseReport,
      diagnosisInput: { ...baseInput, budget: 'above-5m', validationStatus: 'existing-overseas' },
      language: 'zh',
    });
    expect(decision?.leadTier).toBe('L1');
    expect(decision?.reviewFit).toBe('expert_review');
  });

  it('中等预算 = L2 + prepare_then_apply', () => {
    const decision = computeQualificationDecision({
      diagnosisReport: baseReport,
      diagnosisInput: { ...baseInput, budget: '500k-2m' },
      language: 'zh',
    });
    expect(decision?.leadTier).toBe('L2');
    expect(decision?.reviewFit).toBe('prepare_then_apply');
  });

  it('中等预算低验证 = L2 + prepare_then_apply', () => {
    const decision = computeQualificationDecision({
      diagnosisReport: baseReport,
      diagnosisInput: { ...baseInput, budget: '500k-2m' },
      language: 'en',
    });
    expect(decision?.leadTier).toBe('L2');
    expect(decision?.reviewFit).toBe('prepare_then_apply');
    // 英文返回英文文案
    expect(decision?.escalationReason).toMatch(/promising/i);
  });

  it('非 prepare_first + 非 expert_review = L3 + self_serve', () => {
    // 构造一个 go_now 的 report：高 compliance.score 让 complexityScore 低
    // budget = '2m-5m' (low pressure) + validationStatus = 'none' (非 overseas) 也不会触发 L1
    const reportGoNow = computeDiagnosisReport({
      selectedMarket: baseMarket,
      selectedCategory: 'supplement',
      cachedData: {
        feasibility: toolData({ heat: 80, threshold: 'low' }),
        compliance: toolData({ score: 80 }), // complexityScore = 20
      },
      diagnosisInput: { ...baseInput, budget: '2m-5m', validationStatus: 'none' },
      language: 'zh',
    });
    expect(reportGoNow?.goToMarketDecision).toBe('go_now');
    const decision = computeQualificationDecision({
      diagnosisReport: reportGoNow,
      diagnosisInput: { ...baseInput, budget: '2m-5m', validationStatus: 'none' },
      language: 'en',
    });
    expect(decision?.leadTier).toBe('L3');
    expect(decision?.reviewFit).toBe('self_serve');
  });

  it('requiredBeforeExpert 包含明确要求', () => {
    const decision = computeQualificationDecision({
      diagnosisReport: baseReport,
      diagnosisInput: baseInput,
      language: 'zh',
    });
    expect(decision?.requiredBeforeExpert.length).toBeGreaterThan(0);
  });
});
