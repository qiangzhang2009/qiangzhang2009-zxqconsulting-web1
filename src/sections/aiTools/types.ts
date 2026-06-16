/**
 * AI 工具模块共享类型定义
 *
 * 拆分自原 aiToolsMarketContext.tsx，按职责拆出
 */

export type TargetMarket = {
  id: string;
  name: string;
  nameEn: string;
  flag: string;
  region: string;
  priority: 'tier1' | 'tier2' | 'tier3';
  gdp?: string;
};

export type AIToolType =
  | 'feasibility'
  | 'cost'
  | 'compliance'
  | 'insight'
  | 'channel'
  | 'risk';

export const ALL_TOOLS: AIToolType[] = [
  'feasibility',
  'cost',
  'compliance',
  'insight',
  'channel',
  'risk',
];

/**
 * 工具数据是半结构化 JSON（AI 返回），未指定字段时一律为 unknown。
 * 涉及局部"任意字段取值"时，组件代码应该用 (data as any).field 临时断言，
 * 或者定义具体子类型。这里用 unknown 比 any 更安全。
 */
export type AIToolData = Record<string, unknown> & {
  _mock?: boolean;
  _mockReason?: string;
  market?: string;
  marketEn?: string;
  category?: string;
  categoryEn?: string;
};

export type AIDataMap = Partial<Record<AIToolType, AIToolData>>;

export interface MarketContextType {
  selectedMarket: TargetMarket | null;
  selectedRegion: string | null;
  selectedCategory: string;
  setSelectedMarket: (market: TargetMarket | null) => void;
  setSelectedRegion: (region: string | null) => void;
  setSelectedCategory: (category: string) => void;
  prefetchAllData: () => Promise<void>;
  isPrefetching: boolean;
  prefetchProgress: number;
  cachedData: AIDataMap;
  dataSource: ToolDataSourceMap;
  error: string | null;
  setError: (error: string | null) => void;
  marketingData: Record<string, unknown> | null;
  setMarketingData: (data: Record<string, unknown> | null) => void;
  diagnosisInput: DiagnosisInput;
  setDiagnosisInput: (data: DiagnosisInput) => void;
  diagnosisReport: DiagnosisReport | null;
  evidenceBlocks: EvidenceBlock[];
  qualificationDecision: QualificationDecision | null;
}

export interface DiagnosisInput {
  projectStage: string;
  budget: string;
  validationStatus: string;
  targetMarketsCount: string;
  keyQuestion: string;
}

export interface DiagnosisReport {
  summary: string;
  recommendation: string;
  goToMarketDecision: 'go_now' | 'prepare_first' | 'expert_review';
  opportunityScore: number;
  complexityScore: number;
  budgetPressure: 'low' | 'medium' | 'high';
  recommendedPath: string;
  firstMarketLabel: string;
  primaryBlocker: string;
}

export interface EvidenceBlock {
  id: 'market' | 'compliance' | 'execution';
  title: string;
  summary: string;
  bullets: string[];
}

export interface QualificationDecision {
  leadTier: 'L1' | 'L2' | 'L3';
  reviewFit: 'self_serve' | 'prepare_then_apply' | 'expert_review';
  escalationReason: string;
  blockers: string[];
  requiredBeforeExpert: string[];
}

/**
 * 工具数据来源标记。
 *  - 'api'    来自真实 DeepSeek 接口
 *  - 'mock'   来自 generateMockData 兜底
 *  - 'cache'  来自 localStorage 24h 缓存
 */
export type ToolDataSource = 'api' | 'mock' | 'cache';

export type ToolDataSourceMap = Partial<Record<AIToolType, ToolDataSource>>;
