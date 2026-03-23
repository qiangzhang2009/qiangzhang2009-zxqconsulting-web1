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

// 获取批量数据 - 分两步: 1) feasibility快速 2) 其余并发
async function fetchBatchData(market: TargetMarket, category: string, region?: string): Promise<{ feasibility?: any; data?: Record<AIToolType, any>; phase: number }> {
  const marketEn = getMarketEnName(market.id);
  const categoryEn = getCategoryEnName(category);

  // 第一步: 获取 feasibility (优先)
  const phase1Response = await fetch('/api/ai/batch', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      market: market.name,
      marketEn,
      category,
      categoryEn,
      region: region || '',
      priority: 'feasibility'
    })
  });

  if (!phase1Response.ok) throw new Error(`Phase 1 API请求失败: ${phase1Response.status}`);
  const phase1 = await phase1Response.json();

  if (phase1.success && phase1.data?.feasibility) {
    // 第二步: 并发获取其余模块
    const phase2Response = await fetch('/api/ai/batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        market: market.name,
        marketEn,
        category,
        categoryEn,
        region: region || '',
        priority: 'full'
      })
    });

    if (phase2Response.ok) {
      const phase2 = await phase2Response.json();
      if (phase2.success && phase2.data) {
        return {
          feasibility: phase1.data.feasibility,
          data: { ...phase1.data, ...phase2.data },
          phase: 2
        };
      }
    }

    // 第二步失败，只返回 feasibility
    return { feasibility: phase1.data.feasibility, phase: 1 };
  }

  throw new Error(phase1.error || 'Phase 1 failed');
}

// 在 prefetchAllData 中，当 batch API 完全失败时，使用 mock 数据
async function fetchAllWithMockFallback(market: TargetMarket, category: string, region?: string): Promise<Record<AIToolType, any>> {
  const result = {} as Record<AIToolType, any>;
  for (const toolType of ALL_TOOLS) {
    try {
      const data = await fetchToolData(toolType, market, category, region);
      result[toolType] = data;
    } catch (error: any) {
      console.warn(`[MarketContext] ${toolType} API 失败，使用演示数据:`, error.message);
      result[toolType] = generateMockData(toolType, market, category);
    }
  }
  return result;
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

// Mock 数据生成器 - 当 API 不可用时提供演示数据
function generateMockData(toolType: AIToolType, market: TargetMarket, category: string): any {
  const marketEn = getMarketEnName(market.id);
  const categoryEn = getCategoryEnName(category);
  const mName = market.name;
  const cName = category;

  const base = { _mock: true, market: mName, marketEn, category: cName, categoryEn };

  switch (toolType) {
    case 'feasibility':
      return {
        ...base,
        heat: 75,
        growth: 22,
        risk: 'medium',
        competition: 55,
        recommendation: `${mName}市场对${cName}产品有较好潜力，建议优先布局`,
        recommendationEn: `${marketEn} market has good potential for ${categoryEn} products, recommended for priority entry`,
        conclusion: `${mName}是本草产品出海的优质目标市场，政策支持力度大，消费者接受度高。`,
        conclusionEn: `${marketEn} is an excellent target market for herbal products with strong policy support and high consumer acceptance.`,
        policyPoints: ['进口资质认证', '产品本地化要求', '税收优惠政策'],
        policyPointsEn: ['Import qualification', 'Product localization', 'Tax incentives'],
        threshold: '需完成当地食品/药品监管部门注册',
        thresholdEn: 'Registration with local food/drug authority required',
        logistics: '建议通过跨境电商试点，再逐步建立本地仓',
        logisticsEn: 'Start with cross-border e-commerce pilot, then establish local warehouse',
        caseStudies: '某中药品牌通过3年布局在新加坡建立了稳定的分销网络',
        caseStudiesEn: 'A TCM brand established a stable distribution network in Singapore over 3 years',
      };
    case 'cost':
      return {
        ...base,
        items: [
          { name: '产品注册/认证', nameEn: 'Registration/Certification', min: 30000, max: 80000, description: '目标市场注册费用', descriptionEn: 'Target market registration fee' },
          { name: '本地化包装', nameEn: 'Local Packaging', min: 15000, max: 40000, description: '标签翻译和包装调整', descriptionEn: 'Label translation and packaging adjustment' },
          { name: '物流仓储', nameEn: 'Logistics & Storage', min: 20000, max: 60000, description: '跨境运输和本地仓储', descriptionEn: 'Cross-border transport and local storage' },
          { name: '市场营销', nameEn: 'Marketing', min: 50000, max: 200000, description: '本地化推广和渠道建设', descriptionEn: 'Local promotion and channel building' },
          { name: '法律合规', nameEn: 'Legal Compliance', min: 10000, max: 30000, description: '法律咨询和合同审核', descriptionEn: 'Legal consultation and contract review' },
        ],
        timeline: { months: 18, phases: ['准备期(3月)', '注册期(6月)', '试运营(3月)', '正式运营(6月)'], phasesEn: ['Preparation(3mo)', 'Registration(6mo)', 'Pilot(3mo)', 'Full Operations(6mo)'] },
        roi: { expected: 35, payback: '18个月', paybackEn: '18 months' },
      };
    case 'compliance':
      return {
        ...base,
        status: 'partial',
        score: 72,
        requirements: ['产品成分安全报告', '原产地证明', 'GMP认证', '标签合规审核'],
        requirementsEn: ['Product safety report', 'Certificate of origin', 'GMP certification', 'Label compliance review'],
        documents: ['FDA注册确认函', '成分分析报告', '质量检测证书'],
        documentsEn: ['FDA registration confirmation', 'Ingredient analysis report', 'Quality inspection certificate'],
        timeline: '预计6-12个月完成全部合规流程',
        timelineEn: 'Estimated 6-12 months to complete full compliance',
        warnings: ['部分成分可能需要额外审批', '跨境电商渠道规则可能有调整'],
        warningsEn: ['Some ingredients may require additional approval', 'Cross-border e-commerce rules may change'],
        tips: ['建议提前与当地代理沟通注册流程', '保留所有文件的英文版本'],
        tipsEn: ['Communicate with local agent about registration process in advance', 'Keep English versions of all documents'],
      };
    case 'insight':
      return {
        ...base,
        marketSize: '约25亿美元',
        growth: 18,
        ageGroups: [
          { range: '25-35岁', rangeEn: '25-35', percentage: 35 },
          { range: '35-45岁', rangeEn: '35-45', percentage: 40 },
          { range: '45-55岁', rangeEn: '45-55', percentage: 25 },
        ],
        channels: [
          { name: '线上电商平台', nameEn: 'Online E-commerce', percentage: 45 },
          { name: '线下零售药店', nameEn: 'Offline Pharmacies', percentage: 35 },
          { name: '直销/分销商', nameEn: 'Direct/Distributors', percentage: 20 },
        ],
        competitors: [
          { name: '本地头部品牌A', nameEn: 'Local Brand A', share: 25 },
          { name: '国际品牌B', nameEn: 'International Brand B', share: 20 },
          { name: '新兴品牌C', nameEn: 'Emerging Brand C', share: 15 },
        ],
        trends: ['天然有机概念增长', '便携式包装受欢迎', '数字化健康管理'],
        trendsEn: ['Natural organic concept growth', 'Portable packaging popular', 'Digital health management'],
        consumerInsights: `${mName}消费者对健康产品接受度高，愿意为品质付溢价，但对成分透明度和品牌故事有较高要求。`,
        consumerInsightsEn: `${marketEn} consumers are highly accepting of health products and willing to pay premiums for quality, but have high requirements for ingredient transparency and brand storytelling.`,
      };
    case 'channel':
      return {
        ...base,
        channels: [
          {
            name: '跨境电商平台',
            nameEn: 'Cross-border E-commerce',
            type: 'online',
            rating: 88,
            investment: { min: 50000, max: 150000 },
            pros: ['启动成本低', '覆盖广', '数据反馈快'],
            prosEn: ['Low startup cost', 'Wide coverage', 'Fast data feedback'],
            cons: ['竞争激烈', '品牌认知建立慢'],
            consEn: ['High competition', 'Slow brand awareness building'],
            description: '通过亚马逊、天猫国际等平台直接触达消费者',
            descriptionEn: 'Direct consumer access through Amazon, Tmall Global, etc.',
          },
          {
            name: '本地药店/健康店',
            nameEn: 'Local Pharmacy/Health Store',
            type: 'offline',
            rating: 75,
            investment: { min: 80000, max: 250000 },
            pros: ['信任度高', '客户粘性强', '溢价空间大'],
            prosEn: ['High trust', 'Strong customer loyalty', 'Better margins'],
            cons: ['进入门槛高', '本地化要求严'],
            consEn: ['High entry barriers', 'Strict localization requirements'],
            description: '与当地药店连锁合作，建立品牌专柜',
            descriptionEn: 'Partner with local pharmacy chains to establish brand counters',
          },
          {
            name: 'B2B分销商',
            nameEn: 'B2B Distributor',
            type: 'b2b',
            rating: 70,
            investment: { min: 30000, max: 100000 },
            pros: ['快速铺开', '降低运营压力'],
            prosEn: ['Fast market expansion', 'Reduced operational pressure'],
            cons: ['利润分成', '渠道管控弱'],
            consEn: ['Profit sharing', 'Weak channel control'],
            description: '寻找当地有医药背景的分销商合作',
            descriptionEn: 'Partner with distributors with pharmaceutical background',
          },
        ],
        recommendation: `建议采用"电商+药店"双轨策略，先通过跨境电商建立品牌认知，再逐步进入线下渠道`,
        recommendationEn: `Recommend "E-commerce + Pharmacy" dual-track strategy, build brand awareness via cross-border e-commerce first, then gradually enter offline channels`,
      };
    case 'risk':
      return {
        ...base,
        level: 'medium',
        score: 42,
        factors: [
          {
            name: '政策监管风险',
            nameEn: 'Policy & Regulatory Risk',
            impact: 'negative',
            description: '目标市场监管政策可能收紧，需要持续关注',
            descriptionEn: 'Target market regulations may tighten, requiring ongoing monitoring',
          },
          {
            name: '市场竞争风险',
            nameEn: 'Market Competition Risk',
            impact: 'negative',
            description: '本地和国际品牌竞争激烈，需要差异化定位',
            descriptionEn: 'Intense competition from local and international brands requires differentiated positioning',
          },
          {
            name: '汇率波动风险',
            nameEn: 'Exchange Rate Risk',
            impact: 'negative',
            description: '跨境结算涉及汇率波动，建议锁定汇率',
            descriptionEn: 'Cross-border settlements involve exchange rate fluctuations, hedging recommended',
          },
        ],
        warnings: ['关注目标市场监管动态', '建立本地合规团队', '准备应急预案'],
        warningsEn: ['Monitor target market regulatory updates', 'Build local compliance team', 'Prepare contingency plans'],
        mitigations: ['与当地专业机构合作', '购买汇率保险', '建立多元化市场布局'],
        mitigationsEn: ['Partner with local professional institutions', 'Purchase exchange rate insurance', 'Diversify market presence'],
        trend: 'stable',
      };
    default:
      return base;
  }
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

    const currentMarketId = selectedMarket.id;
    const currentCategory = selectedCategory;

    requestIdRef.current += 1;
    const currentRequestId = requestIdRef.current;
    currentRequestMarketRef.current = currentMarketId;

    setIsPrefetching(true);
    setPrefetchProgress(0);
    setError(null);

    console.log('[MarketContext] 开始分步获取数据:', { market: currentMarketId, category: currentCategory, requestId: currentRequestId });

    // 检查完整缓存
    const batchCacheKey = `zxq_batch_${selectedMarket.id}_${selectedCategory}_${selectedRegion || 'global'}`;
    const batchCached = getCachedData(batchCacheKey);

    if (batchCached) {
      if (currentRequestMarketRef.current !== currentMarketId) {
        setIsPrefetching(false);
        return;
      }
      const batchData = batchCached.data as Record<AIToolType, any>;
      setCachedData(batchData);
      setIsFromCache({} as Record<AIToolType, boolean>);
      setPrefetchProgress(100);
      setIsPrefetching(false);
      return;
    }

    const newCachedData: Record<AIToolType, any> = {} as Record<AIToolType, any>;
    const newIsFromCache: Record<AIToolType, boolean> = {} as Record<AIToolType, boolean>;

    // ====== 第一阶段: feasibility 优先快速返回 ======
    setPrefetchProgress(10);
    console.log('[MarketContext] 第一阶段: 获取 feasibility...');

    try {
      const phase1Response = await fetch('/api/ai/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          market: selectedMarket.name,
          marketEn: getMarketEnName(selectedMarket.id),
          category: selectedCategory,
          categoryEn: getCategoryEnName(selectedCategory),
          region: selectedRegion || '',
          priority: 'feasibility'
        })
      });

      if (requestIdRef.current !== currentRequestId || currentRequestMarketRef.current !== currentMarketId) {
        console.log('[MarketContext] 请求已过期，忽略阶段1结果');
        setIsPrefetching(false);
        return;
      }

      if (phase1Response.ok) {
        const phase1 = await phase1Response.json();
        if (phase1.success && phase1.data?.feasibility) {
          // feasibility 数据就绪，立即更新 UI
          newCachedData.feasibility = phase1.data.feasibility;
          newIsFromCache.feasibility = false;
          setCachedData({ ...newCachedData } as Record<AIToolType, any>);
          setIsFromCache({ ...newIsFromCache } as Record<AIToolType, boolean>);
          setPrefetchProgress(20);
          console.log('[MarketContext] feasibility 就绪，进度 20%');

          // ====== 第二阶段: 其余5个模块并发 ======
          console.log('[MarketContext] 第二阶段: 并发获取其余模块...');
          setPrefetchProgress(25);

          const phase2Response = await fetch('/api/ai/batch', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              market: selectedMarket.name,
              marketEn: getMarketEnName(selectedMarket.id),
              category: selectedCategory,
              categoryEn: getCategoryEnName(selectedCategory),
              region: selectedRegion || '',
              priority: 'full'
            })
          });

          if (requestIdRef.current !== currentRequestId || currentRequestMarketRef.current !== currentMarketId) {
            setIsPrefetching(false);
            return;
          }

          if (phase2Response.ok) {
            const phase2 = await phase2Response.json();
            if (phase2.success && phase2.data) {
              for (const toolType of ALL_TOOLS) {
                if (phase2.data[toolType]) {
                  newCachedData[toolType] = phase2.data[toolType];
                  newIsFromCache[toolType] = false;
                }
              }
              saveToCache(batchCacheKey, newCachedData);
              setCachedData({ ...newCachedData } as Record<AIToolType, any>);
              setIsFromCache({ ...newIsFromCache } as Record<AIToolType, boolean>);
              setPrefetchProgress(100);
              console.log('[MarketContext] 全部数据就绪');
            } else {
              // phase2 失败，但 feasibility 已有
              setPrefetchProgress(20);
            }
          } else {
            setPrefetchProgress(20);
          }
        } else {
          // feasibility 获取失败，使用 mock 数据作为演示
          console.warn('[MarketContext] Feasibility 获取失败，使用演示数据');
          const mockFeasibility = generateMockData('feasibility', selectedMarket, selectedCategory);
          newCachedData.feasibility = mockFeasibility;
          newIsFromCache.feasibility = false;
          setCachedData({ ...newCachedData } as Record<AIToolType, any>);
          setIsFromCache({ ...newIsFromCache } as Record<AIToolType, boolean>);
          setPrefetchProgress(20);

          // 其余模块也使用 mock 数据
          console.log('[MarketContext] 其余模块也使用演示数据...');
          for (let i = 1; i < ALL_TOOLS.length; i++) {
            const toolType = ALL_TOOLS[i];
            const mockData = generateMockData(toolType, selectedMarket, selectedCategory);
            newCachedData[toolType] = mockData;
            newIsFromCache[toolType] = false;
          }
          saveToCache(batchCacheKey, newCachedData);
          setCachedData({ ...newCachedData } as Record<AIToolType, any>);
          setIsFromCache({ ...newIsFromCache } as Record<AIToolType, boolean>);
          setPrefetchProgress(100);
          setError(null); // 清除错误，因为我们已经用 mock 数据填充了
          console.log('[MarketContext] 演示数据填充完成');
          setIsPrefetching(false);
          return;
        }
      } else {
        throw new Error(`Phase 1 failed: ${phase1Response.status}`);
      }
    } catch (error: any) {
      // 所有 API 失败都走这里：使用 mock 数据填充
      console.error('[MarketContext] API 获取失败，使用演示数据兜底:', error?.message);
      if (error?.name === 'AbortError' || requestIdRef.current !== currentRequestId) {
        setIsPrefetching(false);
        return;
      }
      setError(null); // 清除错误，使用 mock 数据兜底

      // 串行回退: 逐个获取各模块，API 失败则使用 mock 数据
      for (let i = 0; i < ALL_TOOLS.length; i++) {
        if (requestIdRef.current !== currentRequestId || currentRequestMarketRef.current !== currentMarketId) {
          setIsPrefetching(false);
          return;
        }
        const toolType = ALL_TOOLS[i];
        const cacheKey = getCacheKey(toolType, selectedMarket.id, selectedCategory, selectedRegion || undefined);
        const cached = getCachedData(cacheKey);
        if (cached) {
          newCachedData[toolType] = cached.data;
          newIsFromCache[toolType] = true;
        } else {
          try {
            const data = await fetchToolData(toolType, selectedMarket, selectedCategory, selectedRegion || undefined);
            if (requestIdRef.current !== currentRequestId) { setIsPrefetching(false); return; }
            saveToCache(cacheKey, data);
            newCachedData[toolType] = data;
            newIsFromCache[toolType] = false;
          } catch (apiError: any) {
            // API 失败时，使用 mock 数据作为演示
            console.warn(`[MarketContext] ${toolType} API 失败，使用演示数据:`, apiError?.message);
            const mockData = generateMockData(toolType, selectedMarket, selectedCategory);
            saveToCache(cacheKey, mockData);
            newCachedData[toolType] = mockData;
            newIsFromCache[toolType] = false;
          }
        }
        if (requestIdRef.current !== currentRequestId) { setIsPrefetching(false); return; }
        setPrefetchProgress(Math.round(((i + 1) / ALL_TOOLS.length) * 100));
        setCachedData({ ...newCachedData } as Record<AIToolType, any>);
        setIsFromCache({ ...newIsFromCache } as Record<AIToolType, boolean>);
      }
    }

    if (requestIdRef.current !== currentRequestId || currentRequestMarketRef.current !== currentMarketId) {
      setIsPrefetching(false);
      return;
    }
    setIsPrefetching(false);

    const hasData = Object.keys(newCachedData).length > 0;
    if (!hasData) {
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
