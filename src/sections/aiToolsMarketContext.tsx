import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { AI_CONFIG } from '@/config';
import tracking from '@/lib/tracking';

export type TargetMarket = {
  id: string;
  name: string;
  nameEn: string;
  flag: string;
  region: string;
  priority: 'tier1' | 'tier2' | 'tier3';
  gdp?: string;
};

// 工具类型
export type AIToolType = 'feasibility' | 'cost' | 'compliance' | 'insight' | 'channel' | 'risk';

// 缓存配置
const CACHE_EXPIRY_HOURS = 24;
const CACHE_PREFIX = 'zxq_ai_data_';

// 生成缓存 key
function getCacheKey(toolType: AIToolType, marketId: string, category: string, regionId?: string): string {
  return `${CACHE_PREFIX}${toolType}_${marketId}_${category}_${regionId || 'global'}`;
}

// 从缓存获取数据
function getCachedData(key: string): { data: any; timestamp: number } | null {
  try {
    const cached = localStorage.getItem(key);
    if (!cached) return null;
    const { data, timestamp } = JSON.parse(cached);
    const now = Date.now();
    if (now - timestamp > CACHE_EXPIRY_HOURS * 60 * 60 * 1000) {
      localStorage.removeItem(key);
      return null;
    }
    return { data, timestamp };
  } catch { return null; }
}

// 保存数据到缓存
function saveToCache(key: string, data: any): void {
  try {
    localStorage.setItem(key, JSON.stringify({ data, timestamp: Date.now() }));
  } catch {}
}

// 工具类型列表
const ALL_TOOLS: AIToolType[] = ['feasibility', 'cost', 'compliance', 'insight', 'channel', 'risk'];

// 优先级顺序 - feasibility 最先加载
const PRIORITY_TOOLS: AIToolType[] = ['feasibility', 'cost', 'compliance', 'insight', 'channel', 'risk'];

export interface MarketContextType {
  selectedMarket: TargetMarket | null;
  selectedRegion: string | null;
  selectedCategory: string;
  setSelectedMarket: (market: TargetMarket | null) => void;
  setSelectedRegion: (region: string | null) => void;
  setSelectedCategory: (category: string) => void;
  // 批量获取
  prefetchAllData: () => Promise<void>;
  isPrefetching: boolean;
  prefetchProgress: number;
  cachedData: Record<AIToolType, any>;
  isFromCache: Record<AIToolType, boolean>;
  // 错误状态
  error: string | null;
  setError: (error: string | null) => void;
}

export const MarketContext = createContext<MarketContextType>({
  selectedMarket: null,
  selectedRegion: null,
  selectedCategory: 'supplement',
  setSelectedMarket: () => {},
  setSelectedRegion: () => {},
  setSelectedCategory: () => {},
  prefetchAllData: async () => {},
  isPrefetching: false,
  prefetchProgress: 0,
  cachedData: {} as Record<AIToolType, any>,
  isFromCache: {} as Record<AIToolType, boolean>,
  error: null,
  setError: () => {},
});

export const useMarket = () => useContext(MarketContext);

// 获取市场英文名
const getMarketEnName = (marketId: string): string => {
  const names: Record<string, string> = {
    usa: 'USA', canada: 'Canada', mexico: 'Mexico',
    germany: 'Germany', france: 'France', uk: 'UK',
    japan: 'Japan', australia: 'Australia', southkorea: 'South Korea',
    singapore: 'Singapore', nz: 'New Zealand',
    indonesia: 'Indonesia', thailand: 'Thailand', vietnam: 'Vietnam',
    saudiarabia: 'Saudi Arabia', uae: 'UAE', egypt: 'Egypt',
    nigeria: 'Nigeria', southafrica: 'South Africa', kenya: 'Kenya',
    india: 'India', malaysia: 'Malaysia', philippines: 'Philippines',
    brazil: 'Brazil', argentina: 'Argentina', chile: 'Chile',
  };
  return names[marketId] || marketId;
};

const getCategoryEnName = (categoryId: string): string => {
  const names: Record<string, string> = {
    supplement: 'Health Supplements', nutraceutical: 'Nutraceuticals',
    vitamin: 'Vitamins & Minerals', herbal: 'Herbal Slices',
    decoction: 'TCM Granules', decoctions: 'Herbal Decoctions', patent: 'Patent TCM',
    skincare: 'Skincare Products', makeup: 'Makeup Products',
    fragrance: 'Fragrances', diagnostic: 'Diagnostic Equipment',
    therapeutic: 'Therapeutic Equipment', aids: 'Rehabilitation Aids'
  };
  return names[categoryId] || categoryId;
};

// Prompt 模板 - region 参数改为可选
const PROMPT_TEMPLATES: Record<AIToolType, (market: string, marketEn: string, category: string, categoryEn: string, region?: string) => string> = {
  feasibility: (market, marketEn, category, categoryEn) => `请作为中医药/健康产品出海市场分析专家，提供${market}(${marketEn})市场对于${category}(${categoryEn})产品的市场准入可行性分析。请返回JSON格式的数据，包含以下字段：{"heat": 0-100的市场热度评分,"growth": 预期的年增长率(0-100),"risk": "low"或"medium"或"high"的风险等级,"competition": 0-100的竞争激烈程度,"recommendation": 简短的中文推荐建议,"recommendationEn": 简短英文推荐,"conclusion": 中文总结,"conclusionEn": 英文总结,"policyPoints": 中文政策要点,"policyPointsEn": 英文政策要点,"threshold": 中文准入门槛,"thresholdEn": 英文准入门槛,"logistics": 中文物流要点,"logisticsEn": 英文物流要点,"caseStudies": 中文案例,"caseStudiesEn": 英文案例}只返回JSON。`,

  cost: (market, marketEn, category, categoryEn) => `请作为成本测算专家，提供${market}(${marketEn})市场对于${category}(${categoryEn})产品的成本测算。请返回JSON格式：{"items": [{"name": "成本项","nameEn":"Item","min": 1000,"max": 5000,"description":"说明","descriptionEn":"Desc"}],"timeline": {"months": 12,"phases": ["阶段1"],"phasesEn": ["Phase 1"]},"roi": {"expected": 20,"payback":"12个月","paybackEn":"12 months"}}只返回JSON。`,

  compliance: (market, marketEn, category, categoryEn) => `请作为合规专家，提供${market}(${marketEn})市场对于${category}(${categoryEn})产品的合规评估。请返回JSON格式：{"status": "passed","score": 85,"requirements": ["要求1"],"requirementsEn": ["Req 1"],"documents": ["文件1"],"documentsEn": ["Doc 1"],"timeline": "时间线","timelineEn":"Timeline","warnings": ["警告1"],"warningsEn": ["Warning 1"],"tips": ["建议1"],"tipsEn": ["Tip 1"]}只返回JSON。`,

  insight: (market, marketEn, category, categoryEn) => `请作为市场洞察专家，提供${market}(${marketEn})市场对于${category}(${categoryEn})产品的洞察。请返回JSON格式：{"marketSize": "约50亿美元","growth": 15,"ageGroups": [{"range": "18-25岁","rangeEn": "18-25","percentage": 20}],"channels": [{"name": "线上电商","nameEn": "Online","percentage": 45}],"competitors": [{"name": "品牌A","nameEn": "Brand A","share": 25}],"trends": ["趋势1"],"trendsEn": ["Trend 1"],"consumerInsights": "消费者洞察","consumerInsightsEn": "Insights"}只返回JSON。`,

  channel: (market, marketEn, category, categoryEn) => `请作为渠道专家，提供${market}(${marketEn})市场对于${category}(${categoryEn})产品的渠道推荐。请返回JSON格式：{"channels": [{"name": "电商","nameEn": "E-commerce","type": "online","rating": 85,"investment": {"min": 10000,"max": 50000},"pros": ["优势1"],"prosEn": ["Pro 1"],"cons": ["劣势1"],"consEn": ["Con 1"],"description": "描述","descriptionEn": "Desc"}],"recommendation": "推荐","recommendationEn": "Recommendation"}只返回JSON。`,

  risk: (market, marketEn, category, categoryEn) => `请作为风险管理专家，提供${market}(${marketEn})市场对于${category}(${categoryEn})产品的风险预警。请返回JSON格式：{"level": "medium","score": 45,"factors": [{"name": "风险因素","nameEn": "Risk","impact": "negative","description": "描述","descriptionEn": "Desc"}],"warnings": ["警告1"],"warningsEn": ["Warning 1"],"mitigations": ["缓解措施1"],"mitigationsEn": ["Mitigation 1"],"trend": "stable"}只返回JSON。`,
};

// 获取批量数据 - 一次API调用获取所有6个模块
async function fetchBatchData(market: TargetMarket, category: string, region?: string): Promise<Record<AIToolType, any>> {
  const marketEn = getMarketEnName(market.id);
  const categoryEn = getCategoryEnName(category);

  const response = await fetch('/api/ai/batch', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      market: market.name,
      marketEn,
      category,
      categoryEn,
      region: region || ''
    })
  });

  if (!response.ok) throw new Error(`API请求失败: ${response.status}`);

  const result = await response.json();
  if (!result.success || !result.data) throw new Error(result.error || '数据解析失败');

  return result.data as Record<AIToolType, any>;
}

// 获取单个工具数据
async function fetchToolData(toolType: AIToolType, market: TargetMarket, category: string, region?: string): Promise<any> {
  const marketEn = getMarketEnName(market.id);
  const categoryEn = getCategoryEnName(category);
  const prompt = PROMPT_TEMPLATES[toolType](market.name, marketEn, category, categoryEn);

  const response = await fetch(AI_CONFIG.apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      // 使用 DeepSeek 兼容的模型名称
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: '你是专业的国际贸易咨询专家。请严格按照JSON格式返回数据。' },
        { role: 'user', content: prompt }
      ],
      temperature: AI_CONFIG.temperature,
      max_tokens: AI_CONFIG.maxTokens
    })
  });

  if (!response.ok) throw new Error(`API请求失败: ${response.status}`);

  const data = await response.json();
  const aiMessage = data.choices?.[0]?.message?.content;
  if (!aiMessage) throw new Error('无有效响应');

  const jsonMatch = aiMessage.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('JSON解析失败');

  return JSON.parse(jsonMatch[0]);
}

// Market Provider 组件
export function MarketProvider({ children }: { children: ReactNode }) {
  const [selectedMarket, setSelectedMarket] = useState<TargetMarket | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('supplement');
  const [isPrefetching, setIsPrefetching] = useState(false);
  const [prefetchProgress, setPrefetchProgress] = useState(0);
  const [cachedData, setCachedData] = useState<Record<AIToolType, any>>({} as Record<AIToolType, any>);
  const [isFromCache, setIsFromCache] = useState<Record<AIToolType, boolean>>({} as Record<AIToolType, boolean>);
  const [error, setError] = useState<string | null>(null);
  
  // 请求ID追踪 - 防止竞态条件
  const requestIdRef = useRef(0);
  // 追踪当前请求对应的市场ID
  const currentRequestMarketRef = useRef<string>('');
  // 防抖定时器
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const prefetchAllData = useCallback(async () => {
    if (!selectedMarket || !selectedCategory) return;

    // 记录当前请求的市场ID
    const currentMarketId = selectedMarket.id;
    const currentCategory = selectedCategory;
    
    // 增加请求ID，确保只有最新请求的结果会被使用
    requestIdRef.current += 1;
    const currentRequestId = requestIdRef.current;
    currentRequestMarketRef.current = currentMarketId;
    
    // 设置加载状态，但保留旧数据直到新数据返回
    setIsPrefetching(true);
    setPrefetchProgress(0);
    setError(null);

    console.log('[MarketContext] 开始获取数据:', { market: currentMarketId, category: currentCategory, requestId: currentRequestId });

    // 先检查是否有完整缓存（批量数据）
    const batchCacheKey = `zxq_batch_${selectedMarket.id}_${selectedCategory}_${selectedRegion || 'global'}`;
    const batchCached = getCachedData(batchCacheKey);
    
    const newCachedData: Record<AIToolType, any> = {} as Record<AIToolType, any>;
    const newIsFromCache: Record<AIToolType, boolean> = {} as Record<AIToolType, boolean>;

    if (batchCached) {
      // 检查市场是否已改变
      if (currentRequestMarketRef.current !== currentMarketId) {
        console.log('[MarketContext] 市场已改变，忽略缓存');
        setIsPrefetching(false);
        return;
      }
      // 使用批量缓存
      const batchData = batchCached.data;
      for (const toolType of ALL_TOOLS) {
        if (batchData[toolType]) {
          newCachedData[toolType] = batchData[toolType];
          newIsFromCache[toolType] = true;
        }
      }
      setPrefetchProgress(100);
      setCachedData(newCachedData);
      setIsFromCache(newIsFromCache);
      setIsPrefetching(false);
      return;
    }

    // 直接获取完整数据（不分开快速和完整两个阶段）
    try {
      setPrefetchProgress(5);
      console.log('[MarketContext] 开始获取完整数据...');
      
      const batchData = await fetchBatchData(selectedMarket, selectedCategory, selectedRegion || undefined);
        
        // 检查请求是否已过期
        if (requestIdRef.current !== currentRequestId || currentRequestMarketRef.current !== currentMarketId) {
          console.log('[MarketContext] 请求已过期，忽略完整结果');
          setIsPrefetching(false);
          return;
        }
        
        console.log('[MarketContext] 完整数据返回:', batchData);
        
        // 追踪完整分析结果
        const resultKeys = Object.keys(batchData).filter(k => batchData[k]);
        tracking.toolInteraction('full_analysis', 'complete', {
          marketId: selectedMarket.id,
          marketName: selectedMarket.name,
          category: selectedCategory,
          targetRegion: selectedRegion,
          resultSummary: `获取了 ${resultKeys.length} 个模块数据`,
          aiResultLength: JSON.stringify(batchData).length,
          modulesRetrieved: resultKeys,
        });
        
        // 保存批量缓存
        saveToCache(batchCacheKey, batchData);

        // 保存到各模块缓存
        for (const toolType of ALL_TOOLS) {
          if (batchData[toolType]) {
            const toolCacheKey = getCacheKey(toolType, selectedMarket.id, selectedCategory, selectedRegion || undefined);
            saveToCache(toolCacheKey, batchData[toolType]);
            newCachedData[toolType] = batchData[toolType];
            newIsFromCache[toolType] = false;
          }
        }
        
        // 最终再次检查请求ID和市场
        if (requestIdRef.current !== currentRequestId || currentRequestMarketRef.current !== currentMarketId) {
          console.log('[MarketContext] 请求已过期，忽略结果:', { current: currentRequestId, latest: requestIdRef.current });
          setIsPrefetching(false);
          return;
        }
        
        setPrefetchProgress(100);
        setCachedData(batchData);
        setIsFromCache(newIsFromCache);
    } catch (error: any) {
      console.error('[MarketContext] 批量获取失败:', error);
      
      // 如果是 AbortError（超时），忽略它
      if (error?.name === 'AbortError') {
        console.log('[MarketContext] 请求超时，忽略错误');
        setIsPrefetching(false);
        return;
      }
      
      // 检查请求是否已过期 或 市场是否已改变
      if (requestIdRef.current !== currentRequestId || currentRequestMarketRef.current !== currentMarketId) {
        console.log('[MarketContext] 请求已过期，忽略错误:', { current: currentRequestId, latest: requestIdRef.current, currentMarket: currentRequestMarketRef.current });
        setIsPrefetching(false);
        return;
      }
      
      console.error('批量获取失败:', error);
      setError(error instanceof Error ? error.message : '数据获取失败');
      
      // 串行获取每个模块（避免并发超时）
      for (let i = 0; i < ALL_TOOLS.length; i++) {
        // 检查请求是否已过期 或 市场是否已改变
        if (requestIdRef.current !== currentRequestId || currentRequestMarketRef.current !== currentMarketId) {
          console.log('[MarketContext] 请求已过期，停止获取:', { current: currentRequestId, latest: requestIdRef.current });
          setIsPrefetching(false);
          return;
        }
        
        const toolType = ALL_TOOLS[i];
        const cacheKey = getCacheKey(toolType, selectedMarket.id, selectedCategory, selectedRegion || undefined);
        
        // 先检查缓存
        const cached = getCachedData(cacheKey);
        if (cached) {
          // 再次检查请求ID和市场
          if (requestIdRef.current !== currentRequestId || currentRequestMarketRef.current !== currentMarketId) {
            setIsPrefetching(false);
            return;
          }
          newCachedData[toolType] = cached.data;
          newIsFromCache[toolType] = true;
          setPrefetchProgress(Math.round(((i + 1) / ALL_TOOLS.length) * 100));
          setCachedData({ ...newCachedData });
          setIsFromCache({ ...newIsFromCache });
          continue;
        }
        
        // 获取数据
        try {
          const data = await fetchToolData(toolType, selectedMarket, selectedCategory, selectedRegion || undefined);
          
          // 获取后再次检查请求ID和市场
          if (requestIdRef.current !== currentRequestId || currentRequestMarketRef.current !== currentMarketId) {
            console.log('[MarketContext] 获取数据后请求已过期，停止:', { current: currentRequestId, latest: requestIdRef.current });
            setIsPrefetching(false);
            return;
          }
          
          saveToCache(cacheKey, data);
          newCachedData[toolType] = data;
          newIsFromCache[toolType] = false;
        } catch (err) {
          console.error(`获取 ${toolType} 数据失败:`, err);
        }
        
        // 最终检查请求ID和市场
        if (requestIdRef.current !== currentRequestId || currentRequestMarketRef.current !== currentMarketId) {
          setIsPrefetching(false);
          return;
        }
        
        setPrefetchProgress(Math.round(((i + 1) / ALL_TOOLS.length) * 100));
        setCachedData({ ...newCachedData });
        setIsFromCache({ ...newIsFromCache });
      }
    }

    // 最终检查请求ID和市场
    if (requestIdRef.current !== currentRequestId || currentRequestMarketRef.current !== currentMarketId) {
      setIsPrefetching(false);
      return;
    }
    
    setIsPrefetching(false);
    
    // 检查是否所有数据都获取失败（使用 newCachedData 而不是 cachedData）
    const hasData = Object.keys(newCachedData).length > 0;
    if (!hasData && !error) {
      setError('无法获取数据，请稍后重试');
    }
  }, [selectedMarket?.id, selectedCategory, selectedRegion]);

  // 移除自动获取逻辑 - 只在用户点击按钮时获取数据
  // 用户选择市场后可以预览 UI，然后在需要时点击按钮获取完整分析
  
  // 调试：打印数据状态
  useEffect(() => {
    console.log('[MarketContext] cachedData 状态:', cachedData);
  }, [cachedData]);

  return (
    <MarketContext.Provider value={{
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
      isFromCache,
      error,
      setError,
    }}>
      {children}
    </MarketContext.Provider>
  );
}
