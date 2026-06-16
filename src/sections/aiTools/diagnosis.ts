/**
 * 诊断报告 + 证据块 + 资格决策 计算模块
 *
 * 全部为纯函数（输入：AI 数据 + 用户输入 + 语言；输出：UI 友好的派生对象）。
 *
 * 拆分自原 aiToolsMarketContext.tsx，方便单独测试。
 */

import type {
  AIDataMap,
  DiagnosisInput,
  DiagnosisReport,
  EvidenceBlock,
  QualificationDecision,
  TargetMarket,
} from './types';
import { getCategoryEnName } from './names';

function isZh(language: string): boolean {
  return language === 'zh';
}

type AIField = string | number | boolean | string[] | AIField[] | { [key: string]: AIField } | null | undefined;

function pickLocalized(value: AIField, enValue: AIField, language: string): string {
  if (isZh(language)) {
    return (value as string) ?? (enValue as string) ?? '';
  }
  return (enValue as string) ?? (value as string) ?? '';
}

function safeArray<T = AIField>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function asRecord(value: unknown): Record<string, AIField> {
  return (value as Record<string, AIField>) ?? {};
}

/**
 * 计算诊断报告（4 维评分 + 决策 + 总结）。
 * 任何数据缺失都会用合理的 fallback，绝不抛错。
 */
export function computeDiagnosisReport(params: {
  selectedMarket: TargetMarket | null;
  selectedCategory: string;
  cachedData: AIDataMap;
  diagnosisInput: DiagnosisInput;
  language: string;
}): DiagnosisReport | null {
  const { selectedMarket, selectedCategory, cachedData, diagnosisInput, language } = params;
  if (!selectedMarket) return null;

  const feasibility = asRecord(cachedData.feasibility);
  const compliance = asRecord(cachedData.compliance);
  const insight = asRecord(cachedData.insight);
  const risk = asRecord(cachedData.risk);

  const marketLabel = isZh(language) ? selectedMarket.name : selectedMarket.nameEn;
  const categoryLabel = isZh(language) ? selectedCategory : getCategoryEnName(selectedCategory);

  const opportunityScore =
    typeof feasibility.heat === 'number'
      ? feasibility.heat
      : selectedMarket.priority === 'tier1'
        ? 82
        : selectedMarket.priority === 'tier2'
          ? 72
          : 64;

  const complexityScore =
    typeof compliance.score === 'number'
      ? Math.max(0, 100 - compliance.score)
      : selectedCategory.includes('medical') || selectedCategory.includes('traditional')
        ? 78
        : 58;

  const budgetPressure: DiagnosisReport['budgetPressure'] =
    diagnosisInput.budget === 'above-5m' || diagnosisInput.budget === '2m-5m'
      ? 'low'
      : diagnosisInput.budget === '500k-2m'
        ? 'medium'
        : 'high';

  const goToMarketDecision: DiagnosisReport['goToMarketDecision'] =
    complexityScore >= 80 || budgetPressure === 'high'
      ? 'prepare_first'
      : diagnosisInput.validationStatus === 'existing-overseas' ||
          diagnosisInput.validationStatus === 'some-testing'
        ? 'expert_review'
        : 'go_now';

  const recommendation = isZh(language)
    ? `建议先以 ${marketLabel} 作为首站，用 ${categoryLabel} 做低阻力切入，再根据合规与渠道反馈决定是否升级更高监管路径。`
    : `Use ${marketLabel} as the first wedge market, enter through ${categoryLabel}, and only upgrade into a heavier regulatory path after validating compliance and channel traction.`;

  const summary = isZh(language)
    ? `当前项目更适合先做"是否值得进入"的高层判断，而不是立刻投入全量注册与铺渠道。系统建议先验证 ${marketLabel} 的首站可行性，再决定是否进入专家复核。`
    : `This project should first answer whether the move is worth doing before committing to full registration and channel build-out. Validate ${marketLabel} as the first market, then decide whether expert escalation is justified.`;

  const blockerSource =
    (risk.warnings?.[0] as string | undefined) ||
    (compliance.warnings?.[0] as string | undefined) ||
    (feasibility.threshold as string | undefined) ||
    (insight.consumerInsights as string | undefined) ||
    '';

  return {
    summary,
    recommendation,
    goToMarketDecision,
    opportunityScore,
    complexityScore,
    budgetPressure,
    recommendedPath: recommendation,
    firstMarketLabel: marketLabel,
    primaryBlocker:
      blockerSource ||
      (isZh(language)
        ? '需要先确认合规路径与预算匹配度。'
        : 'Compliance pathway and budget fit must be clarified first.'),
  };
}

/**
 * 计算证据块（市场 / 合规 / 执行 三类）。
 */
export function computeEvidenceBlocks(params: {
  selectedMarket: TargetMarket | null;
  cachedData: AIDataMap;
  language: string;
}): EvidenceBlock[] {
  const { selectedMarket, cachedData, language } = params;
  if (!selectedMarket) return [];

  const feasibility = asRecord(cachedData.feasibility);
  const compliance = asRecord(cachedData.compliance);
  const insight = asRecord(cachedData.insight);
  const channel = asRecord(cachedData.channel);
  const risk = asRecord(cachedData.risk);

  return [
    {
      id: 'market',
      title: isZh(language) ? '市场与需求证据' : 'Market and demand evidence',
      summary: pickLocalized(
        feasibility.recommendation,
        feasibility.recommendationEn,
        language
      ) || pickLocalized(insight.consumerInsights, insight.consumerInsightsEn, language),
      bullets: [
        insight.marketSize
          ? `${isZh(language) ? '市场规模' : 'Market size'}: ${insight.marketSize}`
          : '',
        typeof feasibility.growth === 'number'
          ? `${isZh(language) ? '增长潜力' : 'Growth'}: ${feasibility.growth}%`
          : '',
        ...safeArray(insight.trends).slice(0, 2),
      ].filter(Boolean) as string[],
    },
    {
      id: 'compliance',
      title: isZh(language) ? '准入与合规证据' : 'Entry and compliance evidence',
      summary: pickLocalized(compliance.timeline, compliance.timelineEn, language) ||
        pickLocalized(feasibility.threshold, feasibility.thresholdEn, language),
      bullets: [
        ...safeArray(compliance.requirements).slice(0, 2),
        ...safeArray(risk.warnings).slice(0, 2),
      ].filter(Boolean) as string[],
    },
    {
      id: 'execution',
      title: isZh(language) ? '渠道与执行证据' : 'Channel and execution evidence',
      summary: pickLocalized(channel.recommendation, channel.recommendationEn, language),
      bullets: [
        ...safeArray<Record<string, AIField>>(channel.channels)
          .slice(0, 2)
          .map((item) => (item.name as string) || (item.nameEn as string))
          .filter(Boolean),
        ...safeArray(risk.mitigations).slice(0, 2),
      ].filter(Boolean) as string[],
    },
  ];
}

/**
 * 计算资格决策（L1/L2/L3 + reviewFit + blockers + 升级原因）。
 */
export function computeQualificationDecision(params: {
  diagnosisReport: DiagnosisReport | null;
  diagnosisInput: DiagnosisInput;
  language: string;
}): QualificationDecision | null {
  const { diagnosisReport, diagnosisInput, language } = params;
  if (!diagnosisReport) return null;

  const blockers = [diagnosisReport.primaryBlocker];
  const requiredBeforeExpert = isZh(language)
    ? ['确认预算区间', '明确首站市场假设', '补充已有验证/渠道信息']
    : ['Confirm budget range', 'Clarify first-market hypothesis', 'Add validation or channel proof'];

  if (diagnosisInput.budget === 'above-5m' || diagnosisInput.validationStatus === 'existing-overseas') {
    return {
      leadTier: 'L1',
      reviewFit: 'expert_review',
      escalationReason: isZh(language)
        ? '预算和验证程度已达到专家深度介入阈值。'
        : 'Budget and validation level justify direct expert escalation.',
      blockers,
      requiredBeforeExpert,
    };
  }

  if (
    diagnosisInput.budget === '500k-2m' ||
    diagnosisReport.goToMarketDecision === 'prepare_first'
  ) {
    return {
      leadTier: 'L2',
      reviewFit: 'prepare_then_apply',
      escalationReason: isZh(language)
        ? '项目具备潜力，但在预算、路径或验证上仍需补齐。'
        : 'The project is promising but still needs budget, pathway, or validation gaps closed first.',
      blockers,
      requiredBeforeExpert,
    };
  }

  return {
    leadTier: 'L3',
    reviewFit: 'self_serve',
    escalationReason: isZh(language)
      ? '当前更适合继续自助诊断与低成本验证。'
      : 'The project should remain in self-serve diagnosis and low-cost validation for now.',
    blockers,
    requiredBeforeExpert,
  };
}
