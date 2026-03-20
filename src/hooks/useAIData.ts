/**
 * AI数据分析服务钩子
 * 使用 MarketContext 中的批量缓存数据
 */

import { useMarket, type AIToolType } from '@/sections/aiToolsMarketContext';

// 主钩子函数 - 从 MarketContext 获取缓存数据
export function useAIData(toolType: AIToolType) {
  const { cachedData, isPrefetching, isFromCache, prefetchAllData } = useMarket();

  return {
    content: cachedData[toolType] || null,
    loading: isPrefetching,
    error: null,
    isFromCache: isFromCache[toolType] || false,
    refresh: () => prefetchAllData()
  };
}

// 为每个工具创建专门的钩子
export const useAIFeasibility = () => useAIData('feasibility');
export const useAICost = () => useAIData('cost');
export const useAICompliance = () => useAIData('compliance');
export const useAIInsight = () => useAIData('insight');
export const useAIChannel = () => useAIData('channel');
export const useAIRisk = () => useAIData('risk');
