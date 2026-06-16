/**
 * Market Context Provider
 *
 * 拆分自原 aiToolsMarketContext.tsx (849 行)：
 * - cache.ts      — localStorage 缓存
 * - mockData.ts   — 6 模块 Mock 兜底数据
 * - diagnosis.ts  — 诊断报告 / 证据 / 资格决策 纯函数
 * - names.ts      — 市场与类别中英名映射
 * - types.ts      — 共享类型
 *
 * 本文件仅承担"Context 状态 + 数据流编排"职责，并把所有"业务计算"委托给上面的模块。
 *
 * 关键设计：API 失败时使用 generateAllMockData 兜底，并在 UI 层展示"示例数据"提示。
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { computeDiagnosisReport, computeEvidenceBlocks, computeQualificationDecision } from './diagnosis';
import { generateAllMockData, generateMockData } from './mockData';
import {
  getBatchCacheKey,
  getCachedData,
  normalizeLanguage,
  saveToCache,
} from './cache';
import { getCategoryEnName, getMarketEnName } from './names';
import { MarketContext } from './context';
import { reportError, reportMessage } from '@/lib/errorReporter';
import type {
  AIDataMap,
  DiagnosisInput,
  EvidenceBlock,
  QualificationDecision,
  TargetMarket,
  ToolDataSourceMap,
  DiagnosisReport,
} from './types';
import { ALL_TOOLS } from './types';
import tracking from '@/lib/tracking';

const initialDiagnosisInput: DiagnosisInput = {
  projectStage: '',
  budget: '',
  validationStatus: '',
  targetMarketsCount: '',
  keyQuestion: '',
};

// ================== 内部工具 ==================

/**
 * 解析 batch API 返回，剥离 markdown 包裹、修复尾随逗号。
 */
function parseBatchResponse(json: unknown): AIDataMap {
  if (!json || typeof json !== 'object') return {};
  const root = json as { success?: boolean; data?: AIDataMap; error?: string };
  if (root.success && root.data && typeof root.data === 'object') {
    return root.data as AIDataMap;
  }
  return {};
}

interface BatchApiResult {
  data: AIDataMap;
  isMock: boolean;
  errorMessage: string | null;
}

async function callBatchApi(params: {
  market: string;
  marketEn: string;
  category: string;
  categoryEn: string;
  language: string;
  region: string;
  phase: 'priority' | 'full';
}): Promise<BatchApiResult> {
  try {
    const response = await fetch('/api/ai/batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!response.ok) {
      reportError(new Error(`Batch API HTTP ${response.status}`), {
        level: 'warning',
        tags: { source: 'ai.batch.api', phase: params.phase },
        context: { market: params.market, category: params.category, status: response.status },
      });
      return {
        data: {},
        isMock: false,
        errorMessage: `HTTP ${response.status}`,
      };
    }
    const json = await response.json();
    const data = parseBatchResponse(json);
    if (Object.keys(data).length === 0) {
      reportMessage(json?.error || 'Empty response', {
        level: 'warning',
        tags: { source: 'ai.batch.empty', phase: params.phase },
        context: { market: params.market, category: params.category },
      });
      return { data, isMock: false, errorMessage: json?.error || 'Empty response' };
    }
    return { data, isMock: false, errorMessage: null };
  } catch (err) {
    const errObj = err as Error;
    reportError(errObj, {
      level: 'error',
      tags: { source: 'ai.batch.network', phase: params.phase },
      context: { market: params.market, category: params.category },
    });
    return { data: {}, isMock: false, errorMessage: errObj?.message || 'Network error' };
  }
}

// ================== Provider ==================

export function MarketProvider({ children }: { children: ReactNode }) {
  const { i18n } = useTranslation();
  const currentLanguage = normalizeLanguage(i18n.language);

  // ----- 基础选择状态 -----
  const [selectedMarket, setSelectedMarket] = useState<TargetMarket | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('supplement');

  // ----- 数据获取状态 -----
  const [isPrefetching, setIsPrefetching] = useState(false);
  const [prefetchProgress, setPrefetchProgress] = useState(0);
  const [cachedData, setCachedData] = useState<AIDataMap>({});
  const [dataSource, setDataSource] = useState<ToolDataSourceMap>({});
  const [error, setError] = useState<string | null>(null);

  // ----- 营销内容（独立于 6 工具数据，单独缓存） -----
  const [marketingData, setMarketingData] = useState<Record<string, unknown> | null>(null);

  // ----- 诊断输入 -----
  const [diagnosisInput, setDiagnosisInput] = useState<DiagnosisInput>(initialDiagnosisInput);

  // ----- 竞态条件控制 -----
  const requestIdRef = useRef(0);
  const currentRequestMarketRef = useRef<string>('');

  // ----- 语言切换：清空缓存并重新拉取 -----
  useEffect(() => {
    const hasExistingData = Object.keys(cachedData).length > 0 || marketingData !== null;
    if (hasExistingData) {
      setCachedData({});
      setDataSource({});
      setMarketingData(null);
      setError(null);
      if (selectedMarket) {
        // 等状态更新后再触发，避免闭包问题
        const marketId = selectedMarket.id;
        const category = selectedCategory;
        const region = selectedRegion;
        setTimeout(() => {
          // 这里直接调用 API 而不依赖 prefetchAllData 闭包
          triggerPrefetch(marketId, category, region);
        }, 0);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentLanguage]);

  // ----- 派生数据：诊断报告 / 证据 / 资格 -----
  const diagnosisReport = useMemo<DiagnosisReport | null>(
    () =>
      computeDiagnosisReport({
        selectedMarket,
        selectedCategory,
        cachedData,
        diagnosisInput,
        language: currentLanguage,
      }),
    [selectedMarket, selectedCategory, cachedData, diagnosisInput, currentLanguage]
  );

  const evidenceBlocks = useMemo<EvidenceBlock[]>(
    () => computeEvidenceBlocks({ selectedMarket, cachedData, language: currentLanguage }),
    [selectedMarket, cachedData, currentLanguage]
  );

  const qualificationDecision = useMemo<QualificationDecision | null>(
    () => computeQualificationDecision({ diagnosisReport, diagnosisInput, language: currentLanguage }),
    [diagnosisReport, diagnosisInput, currentLanguage]
  );

  // ----- 核心：分步拉取 + Mock 降级 -----
  const triggerPrefetch = useCallback(
    async (marketId: string, category: string, region: string | null) => {
      const market = selectedMarketRef.current;
      if (!market || market.id !== marketId) return;

      const currentLanguageKey = currentLanguage;
      const regionKey = region || 'global';

      requestIdRef.current += 1;
      const currentRequestId = requestIdRef.current;
      currentRequestMarketRef.current = marketId;

      setIsPrefetching(true);
      setPrefetchProgress(0);
      setError(null);

      tracking.toolInteraction('market_context', 'prefetch_start', {
        market: marketId,
        category,
        language: currentLanguageKey,
        requestId: currentRequestId,
      });

      // ---- 1. 检查 24h batch 缓存 ----
      const batchCacheKey = getBatchCacheKey(marketId, category, currentLanguageKey, regionKey);
      const batchCached = getCachedData<AIDataMap>(batchCacheKey);
      if (batchCached) {
        if (currentRequestMarketRef.current !== marketId) {
          setIsPrefetching(false);
          return;
        }
        setCachedData(batchCached.data);
        setDataSource(
          Object.fromEntries(ALL_TOOLS.map((t) => [t, 'cache' as const])) as ToolDataSourceMap
        );
        setPrefetchProgress(100);
        setIsPrefetching(false);
        return;
      }

      const newData: AIDataMap = {};
      const newSources: ToolDataSourceMap = {};

      // ---- 2. Phase 1: feasibility 优先 ----
      setPrefetchProgress(10);
      const phase1 = await callBatchApi({
        market: market.name,
        marketEn: getMarketEnName(marketId),
        category,
        categoryEn: getCategoryEnName(category),
        language: currentLanguageKey,
        region: regionKey,
        phase: 'priority',
      });

      if (currentRequestMarketRef.current !== marketId) {
        setIsPrefetching(false);
        return;
      }

      if (phase1.data.feasibility) {
        newData.feasibility = phase1.data.feasibility;
        newSources.feasibility = 'api';
        // 立即更新 UI，让用户看到核心结论
        setCachedData({ ...newData });
        setDataSource({ ...newSources });
        setPrefetchProgress(20);

        // ---- 3. Phase 2: 完整 6 模块 ----
        setPrefetchProgress(25);
        const phase2 = await callBatchApi({
          market: market.name,
          marketEn: getMarketEnName(marketId),
          category,
          categoryEn: getCategoryEnName(category),
          language: currentLanguageKey,
          region: regionKey,
          phase: 'full',
        });

        if (currentRequestMarketRef.current !== marketId) {
          setIsPrefetching(false);
          return;
        }

        if (Object.keys(phase2.data).length > 0) {
          for (const tool of ALL_TOOLS) {
            if (phase2.data[tool]) {
              newData[tool] = phase2.data[tool];
              newSources[tool] = 'api';
            }
          }
          saveToCache(batchCacheKey, newData);
          setCachedData({ ...newData });
          setDataSource({ ...newSources });
          setPrefetchProgress(100);
        } else {
          // Phase 2 失败：保留 feasibility 真实数据 + 用 mock 补齐其他
          fillMissingWithMock(newData, newSources, market, category, phase2.errorMessage || '完整数据获取失败');
          saveToCache(batchCacheKey, newData);
          setCachedData({ ...newData });
          setDataSource({ ...newSources });
          setPrefetchProgress(100);
          setError('部分数据获取失败，已使用示例数据补齐');
        }
      } else {
        // Phase 1 失败：全部走 mock 兜底
        const reason = phase1.errorMessage || 'AI 服务暂时不可用';
        const mockData = generateAllMockData(market, category, reason);
        for (const tool of ALL_TOOLS) {
          newData[tool] = mockData[tool];
          newSources[tool] = 'mock';
        }
        setCachedData({ ...newData });
        setDataSource({ ...newSources });
        setPrefetchProgress(100);
        setError(reason);
      }

      setIsPrefetching(false);

      tracking.toolInteraction('market_context', 'prefetch_done', {
        market: marketId,
        category,
        language: currentLanguageKey,
        requestId: currentRequestId,
        sources: newSources,
      });
    },
    [currentLanguage]
  );

  // 防止 triggerPrefetch 在 effect 中拿到过期闭包的 selectedMarket
  const selectedMarketRef = useRef<TargetMarket | null>(null);
  useEffect(() => {
    selectedMarketRef.current = selectedMarket;
  }, [selectedMarket]);

  /**
   * 在已有真实数据的基础上，把缺失的工具用 mock 补齐。
   */
  const fillMissingWithMock = (
    target: AIDataMap,
    sources: ToolDataSourceMap,
    market: TargetMarket,
    category: string,
    reason: string
  ) => {
    for (const tool of ALL_TOOLS) {
      if (!target[tool]) {
        target[tool] = generateMockData(tool, market, category, reason);
        sources[tool] = 'mock';
      }
    }
  };

  const prefetchAllData = useCallback(async () => {
    if (!selectedMarket || !selectedCategory) return;
    await triggerPrefetch(selectedMarket.id, selectedCategory, selectedRegion);
  }, [selectedMarket, selectedCategory, selectedRegion, triggerPrefetch]);

  return (
    <MarketContext.Provider
      value={{
        selectedMarket,
        selectedRegion,
        selectedCategory,
        setSelectedMarket,
        setSelectedRegion,
        setSelectedCategory,
        prefetchAllData,
        isPrefetching,
        prefetchProgress,
        cachedData,
        dataSource,
        error,
        setError,
        marketingData,
        setMarketingData,
        diagnosisInput,
        setDiagnosisInput,
        diagnosisReport,
        evidenceBlocks,
        qualificationDecision,
      }}
    >
      {children}
    </MarketContext.Provider>
  );
}
