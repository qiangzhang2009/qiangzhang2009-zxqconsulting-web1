import { useState, useMemo, useCallback, useEffect, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Shield, AlertTriangle, CheckCircle, Clock, Target, 
  Globe, RefreshCw, Bell, Zap, Compass, TrendingUp, 
  TrendingDown, Minus, BookOpen, BarChart3, ShoppingCart,
  DollarSign, FlaskConical
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { MarketContext } from './aiToolsMarketContext';

// 语言上下文

// 风险维度
interface RiskDimension {
  id: string;
  name: string;
  nameEn: string;
  icon: LucideIcon;
  color: string;
}

// 风险事件
interface RiskEvent {
  id: string;
  dimension: string;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  trend: 'worsening' | 'stable' | 'improving';
  impact: string;
  impactEn: string;
  action: string;
  actionEn: string;
  urgency: number;
  affectedMarkets: string[];
  sources: { name: string; url: string }[];
}

// 风险事件映射 - 将区域级风险映射到具体国家
const getRiskIdsForMarket = (marketId: string): string[] => {
  const map: Record<string, string[]> = {
    usa: ['israel-iran-war', 'us-global-tariff'],
    canada: ['us-global-tariff'],
    mexico: ['us-global-tariff'],
    germany: ['eu-herbals', 'us-global-tariff'],
    france: ['eu-herbals', 'us-global-tariff'],
    uk: ['eu-herbals', 'rmb-usd', 'us-global-tariff'],
    italy: ['eu-herbals'],
    spain: ['eu-herbals'],
    netherlands: ['eu-herbals'],
    japan: ['japan-pmda', 'jpy-volatility'],
    australia: ['australia-tga-review', 'rmb-usd', 'us-global-tariff'],
    southkorea: ['jpy-volatility'],
    singapore: ['sea-herbal-boom'],
    hongkong: ['rmb-usd'],
    taiwan: [],
    nz: ['australia-tga-review'],
    indonesia: ['sea-herbal-boom', 'us-global-tariff'],
    thailand: ['sea-herbal-boom'],
    vietnam: ['sea-herbal-boom', 'us-global-tariff'],
    malaysia: ['sea-herbal-boom'],
    philippines: ['sea-herbal-boom'],
    myanmar: [],
    saudiarabia: ['middleeast-war', 'israel-iran-war'],
    uae: ['middleeast-war', 'israel-iran-war'],
    israel: ['middleeast-war', 'israel-iran-war'],
    qatar: ['middleeast-war', 'israel-iran-war'],
    turkey: ['middleeast-war', 'israel-iran-war'],
    egypt: ['middleeast-war'],
    southafrica: [],
    nigeria: [],
    brazil: ['us-global-tariff'],
    argentina: ['us-global-tariff'],
    chile: [],
    colombia: [],
    peru: [],
  };
  return map[marketId] || [];
};

// 目标市场
const TARGET_MARKETS = [
  // 北美
  { id: 'usa', name: '美国', nameEn: 'USA', flag: '🇺🇸', region: 'northamerica', priority: 'tier1', gdp: '25万亿' },
  { id: 'canada', name: '加拿大', nameEn: 'Canada', flag: '🇨🇦', region: 'northamerica', priority: 'tier2', gdp: '2万亿' },
  { id: 'mexico', name: '墨西哥', nameEn: 'Mexico', flag: '🇲🇽', region: 'northamerica', priority: 'tier2', gdp: '1.4万亿' },
  
  // 欧洲
  { id: 'germany', name: '德国', nameEn: 'Germany', flag: '🇩🇪', region: 'europe', priority: 'tier1', gdp: '4.4万亿' },
  { id: 'france', name: '法国', nameEn: 'France', flag: '🇫🇷', region: 'europe', priority: 'tier1', gdp: '2.9万亿' },
  { id: 'uk', name: '英国', nameEn: 'UK', flag: '🇬🇧', region: 'europe', priority: 'tier1', gdp: '3.3万亿' },
  { id: 'italy', name: '意大利', nameEn: 'Italy', flag: '🇮🇹', region: 'europe', priority: 'tier2', gdp: '2.1万亿' },
  { id: 'spain', name: '西班牙', nameEn: 'Spain', flag: '🇪🇸', region: 'europe', priority: 'tier2', gdp: '1.6万亿' },
  { id: 'netherlands', name: '荷兰', nameEn: 'Netherlands', flag: '🇳🇱', region: 'europe', priority: 'tier2', gdp: '1.1万亿' },
  
  // 亚太发达
  { id: 'japan', name: '日本', nameEn: 'Japan', flag: '🇯🇵', region: 'asia-pacific', priority: 'tier1', gdp: '4.9万亿' },
  { id: 'australia', name: '澳大利亚', nameEn: 'Australia', flag: '🇦🇺', region: 'asia-pacific', priority: 'tier1', gdp: '1.7万亿' },
  { id: 'southkorea', name: '韩国', nameEn: 'South Korea', flag: '🇰🇷', region: 'asia-pacific', priority: 'tier1', gdp: '1.8万亿' },
  { id: 'singapore', name: '新加坡', nameEn: 'Singapore', flag: '🇸🇬', region: 'asia-pacific', priority: 'tier1', gdp: '0.5万亿' },
  { id: 'hongkong', name: '香港', nameEn: 'Hong Kong', flag: '🇭🇰', region: 'asia-pacific', priority: 'tier2', gdp: '0.4万亿' },
  { id: 'taiwan', name: '台湾', nameEn: 'Taiwan', flag: '🇹🇼', region: 'asia-pacific', priority: 'tier2', gdp: '0.8万亿' },
  { id: 'nz', name: '新西兰', nameEn: 'New Zealand', flag: '🇳🇿', region: 'asia-pacific', priority: 'tier3', gdp: '0.3万亿' },
  
  // 东南亚
  { id: 'indonesia', name: '印度尼西亚', nameEn: 'Indonesia', flag: '🇮🇩', region: 'southeastasia', priority: 'tier1', gdp: '1.3万亿' },
  { id: 'thailand', name: '泰国', nameEn: 'Thailand', flag: '🇹🇭', region: 'southeastasia', priority: 'tier1', gdp: '0.5万亿' },
  { id: 'vietnam', name: '越南', nameEn: 'Vietnam', flag: '🇻🇳', region: 'southeastasia', priority: 'tier1', gdp: '0.4万亿' },
  { id: 'malaysia', name: '马来西亚', nameEn: 'Malaysia', flag: '🇲🇾', region: 'southeastasia', priority: 'tier2', gdp: '0.4万亿' },
  { id: 'philippines', name: '菲律宾', nameEn: 'Philippines', flag: '🇵🇭', region: 'southeastasia', priority: 'tier2', gdp: '0.4万亿' },
  { id: 'myanmar', name: '缅甸', nameEn: 'Myanmar', flag: '🇲🇲', region: 'southeastasia', priority: 'tier3', gdp: '0.07万亿' },
  
  // 中东非洲
  { id: 'saudiarabia', name: '沙特阿拉伯', nameEn: 'Saudi Arabia', flag: '🇸🇦', region: 'middleeast', priority: 'tier1', gdp: '1.1万亿' },
  { id: 'uae', name: '阿联酋', nameEn: 'UAE', flag: '🇦🇪', region: 'middleeast', priority: 'tier1', gdp: '0.5万亿' },
  { id: 'israel', name: '以色列', nameEn: 'Israel', flag: '🇮🇱', region: 'middleeast', priority: 'tier2', gdp: '0.5万亿' },
  { id: 'qatar', name: '卡塔尔', nameEn: 'Qatar', flag: '🇶🇦', region: 'middleeast', priority: 'tier2', gdp: '0.2万亿' },
  { id: 'turkey', name: '土耳其', nameEn: 'Turkey', flag: '🇹🇷', region: 'middleeast', priority: 'tier2', gdp: '1.1万亿' },
  { id: 'egypt', name: '埃及', nameEn: 'Egypt', flag: '🇪🇬', region: 'middleeast', priority: 'tier3', gdp: '0.4万亿' },
  { id: 'southafrica', name: '南非', nameEn: 'South Africa', flag: '🇿🇦', region: 'middleeast', priority: 'tier3', gdp: '0.4万亿' },
  { id: 'nigeria', name: '尼日利亚', nameEn: 'Nigeria', flag: '🇳🇬', region: 'middleeast', priority: 'tier3', gdp: '0.5万亿' },
  
  // 拉美
  { id: 'brazil', name: '巴西', nameEn: 'Brazil', flag: '🇧🇷', region: 'latinamerica', priority: 'tier1', gdp: '2.1万亿' },
  { id: 'argentina', name: '阿根廷', nameEn: 'Argentina', flag: '🇦🇷', region: 'latinamerica', priority: 'tier2', gdp: '0.6万亿' },
  { id: 'chile', name: '智利', nameEn: 'Chile', flag: '🇨🇱', region: 'latinamerica', priority: 'tier2', gdp: '0.3万亿' },
  { id: 'colombia', name: '哥伦比亚', nameEn: 'Colombia', flag: '🇨🇴', region: 'latinamerica', priority: 'tier3', gdp: '0.3万亿' },
  { id: 'peru', name: '秘鲁', nameEn: 'Peru', flag: '🇵🇪', region: 'latinamerica', priority: 'tier3', gdp: '0.3万亿' },
];

// 风险维度定义
const RISK_DIMENSIONS: RiskDimension[] = [
  { id: 'regulatory', name: '法规准入', nameEn: 'Regulatory', icon: FlaskConical, color: 'red' },
  { id: 'trade', name: '贸易政策', nameEn: 'Trade Policy', icon: ShoppingCart, color: 'orange' },
  { id: 'currency', name: '汇率波动', nameEn: 'Currency', icon: DollarSign, color: 'yellow' },
  { id: 'geopolitical', name: '地缘政治', nameEn: 'Geopolitical', icon: Globe, color: 'purple' },
  { id: 'market', name: '市场动态', nameEn: 'Market', icon: BarChart3, color: 'blue' },
];

// 风险事件数据
const RISK_EVENTS: RiskEvent[] = [
  {
    id: 'israel-iran-war',
    dimension: 'geopolitical',
    title: '以色列伊朗战争升级',
    titleEn: 'Israel-Iran War Escalation',
    description: '以色列与伊朗冲突持续升级，红海航线中断，影响中医药原料进口和产品出口',
    descriptionEn: 'Israel-Iran conflict escalates, Red Sea shipping routes disrupted, affecting TCM raw material imports and product exports',
    severity: 'critical',
    trend: 'worsening',
    impact: '海运成本增加300%，运输时间延长2-3周，部分原料供应中断',
    impactEn: 'Shipping costs increased by 300%, transit time extended by 2-3 weeks, some raw material supply interrupted',
    action: '建立多元化物流渠道，考虑空运紧急原料，提前备货3-6个月',
    actionEn: 'Establish diversified logistics channels, consider air freight for urgent materials, stock up 3-6 months in advance',
    urgency: 10,
    affectedMarkets: ['saudiarabia', 'uae', 'israel', 'qatar', 'turkey', 'usa'],
    sources: [{ name: 'Reuters', url: 'https://reuters.com' }]
  },
  {
    id: 'us-global-tariff',
    dimension: 'trade',
    title: '美国关税政策不确定性',
    titleEn: 'US Tariff Policy Uncertainty',
    description: '美国对华关税政策频繁变动，贸易摩擦持续影响中药产品出口',
    descriptionEn: 'Frequent changes in US tariff policy on China, trade friction continues to affect TCM product exports',
    severity: 'high',
    trend: 'worsening',
    impact: '关税成本增加15-25%，产品竞争力下降，利润空间被压缩',
    impactEn: 'Tariff costs increase 15-25%, product competitiveness declines, profit margins compressed',
    action: '考虑东南亚转口贸易，或在当地设立生产基地',
    actionEn: 'Consider Southeast Asia transshipment, or establish production base locally',
    urgency: 8,
    affectedMarkets: ['usa', 'canada', 'mexico', 'germany', 'france', 'uk', 'australia', 'indonesia', 'vietnam', 'brazil', 'argentina'],
    sources: [{ name: 'US Trade Representative', url: 'https://ustr.gov' }]
  },
  {
    id: 'eu-herbals',
    dimension: 'regulatory',
    title: '欧盟传统草药注册门槛提高',
    titleEn: 'EU Traditional Herbal Medicine Registration Threshold Increased',
    description: '欧盟对传统草药的注册要求日趋严格，需要更多临床证据',
    descriptionEn: 'EU registration requirements for traditional herbs becoming stricter, requiring more clinical evidence',
    severity: 'high',
    trend: 'worsening',
    impact: '进入欧盟市场需要2-3年准备期，注册成本高达50万欧元',
    impactEn: 'Entering EU market requires 2-3 years preparation, registration cost up to 500K EUR',
    action: '以食品补充剂形式先行进入，同时准备传统草药注册',
    actionEn: 'Enter as food supplement first while preparing traditional herbal registration',
    urgency: 7,
    affectedMarkets: ['germany', 'france', 'uk', 'italy', 'spain', 'netherlands'],
    sources: [{ name: 'EMA', url: 'https://ema.europa.eu' }]
  },
  {
    id: 'japan-pmda',
    dimension: 'regulatory',
    title: '日本PMDA审批周期延长',
    titleEn: 'Japan PMDA Approval Timeline Extended',
    description: '日本药品医疗器械管理局审批周期延长至12个月以上',
    descriptionEn: 'Japan PMDA approval timeline extended to 12+ months',
    severity: 'medium',
    trend: 'stable',
    impact: '产品上市时间推迟，资金回笼周期延长',
    impactEn: 'Product launch delayed, capital return cycle extended',
    action: '提前布局，选择功能性标示食品路径加速进入',
    actionEn: 'Plan ahead, choose functional food path to accelerate market entry',
    urgency: 5,
    affectedMarkets: ['japan'],
    sources: [{ name: 'PMDA', url: 'https://pmda.go.jp' }]
  },
  {
    id: 'jpy-volatility',
    dimension: 'currency',
    title: '日元汇率剧烈波动',
    titleEn: 'JPY Volatility',
    description: '日元汇率大幅波动，影响定价和利润空间',
    descriptionEn: 'JPY exchange rate fluctuates significantly, affecting pricing and profit margins',
    severity: 'medium',
    trend: 'stable',
    impact: '汇率损失可能达5-10%，定价策略需要频繁调整',
    impactEn: 'Exchange rate losses may reach 5-10%, pricing strategy needs frequent adjustments',
    action: '使用汇率对冲工具，签订长期合同锁定价格',
    actionEn: 'Use exchange rate hedging tools, sign long-term contracts to lock prices',
    urgency: 5,
    affectedMarkets: ['japan', 'australia', 'southkorea', 'hongkong', 'uk'],
    sources: [{ name: 'Bank of Japan', url: 'https://boj.or.jp' }]
  },
  {
    id: 'australia-tga-review',
    dimension: 'regulatory',
    title: '澳大利亚TGA审查趋严',
    titleEn: 'Australia TGA Review Tightening',
    description: '澳大利亚治疗商品管理局对保健品审查日趋严格',
    descriptionEn: 'Australia TGA increasingly strict on health product reviews',
    severity: 'medium',
    trend: 'worsening',
    impact: '需要更多临床证据，审批时间延长',
    impactEn: 'More clinical evidence needed, approval time extended',
    action: '选择低风险产品类别进入，准备充分的临床数据',
    actionEn: 'Choose lower-risk product categories to enter, prepare sufficient clinical data',
    urgency: 6,
    affectedMarkets: ['australia', 'nz'],
    sources: [{ name: 'TGA', url: 'https://tga.gov.au' }]
  },
  {
    id: 'sea-herbal-boom',
    dimension: 'market',
    title: '东南亚天然保健品市场爆发',
    titleEn: 'SE Asia Natural Health Products Market Boom',
    description: '东南亚天然保健品市场需求旺盛，准入门槛相对较低',
    descriptionEn: 'Southeast Asia natural health product market demand booming, relatively low entry barriers',
    severity: 'low',
    trend: 'improving',
    impact: '市场机遇期，建议快速布局抢占市场份额',
    impactEn: 'Market opportunity period, recommend quick layout to capture market share',
    action: '快速进入，建立本地渠道和品牌认知',
    actionEn: 'Enter quickly, establish local channels and brand awareness',
    urgency: 3,
    affectedMarkets: ['singapore', 'indonesia', 'thailand', 'vietnam', 'malaysia', 'philippines'],
    sources: [{ name: 'Market Research', url: 'https://research.com' }]
  },
  {
    id: 'middleeast-war',
    dimension: 'geopolitical',
    title: '中东战争风险',
    titleEn: 'Middle East War Risk',
    description: '中东地区冲突导致物流风险极高',
    descriptionEn: 'Middle East conflicts cause extremely high logistics risks',
    severity: 'critical',
    trend: 'worsening',
    impact: '物流严重受阻，货物滞留或损毁风险高',
    impactEn: 'Logistics severely disrupted, high risk of cargo滞留 or damage',
    action: '暂缓进入计划，密切关注局势发展',
    actionEn: 'Postpone entry plans, closely monitor situation development',
    urgency: 10,
    affectedMarkets: ['saudiarabia', 'uae', 'israel', 'qatar', 'turkey', 'egypt'],
    sources: [{ name: 'UN', url: 'https://un.org' }]
  },
  {
    id: 'rmb-usd',
    dimension: 'currency',
    title: '人民币美元汇率波动',
    titleEn: 'RMB-USD Exchange Rate Volatility',
    description: '人民币对美元汇率波动影响出口定价',
    descriptionEn: 'RMB-USD exchange rate fluctuations affect export pricing',
    severity: 'medium',
    trend: 'stable',
    impact: '汇率风险影响利润 predictability',
    impactEn: 'Exchange rate risk affects profit predictability',
    action: '使用金融工具对冲，建立动态定价机制',
    actionEn: 'Use financial instruments to hedge, establish dynamic pricing mechanism',
    urgency: 5,
    affectedMarkets: ['uk', 'australia', 'hongkong'],
    sources: [{ name: 'PBOC', url: 'http://pbc.gov.cn' }]
  }
];

// 风险等级样式
const getSeverityStyle = (severity: string) => {
  switch (severity) {
    case 'critical':
      return { 
        label: '严重', labelEn: 'Critical', 
        bg: 'bg-red-100', text: 'text-red-700',
        border: 'border-red-200' 
      };
    case 'high':
      return { 
        label: '高', labelEn: 'High', 
        bg: 'bg-orange-100', text: 'text-orange-700',
        border: 'border-orange-200' 
      };
    case 'medium':
      return { 
        label: '中', labelEn: 'Medium', 
        bg: 'bg-yellow-100', text: 'text-yellow-700',
        border: 'border-yellow-200' 
      };
    default:
      return { 
        label: '低', labelEn: 'Low', 
        bg: 'bg-green-100', text: 'text-green-700',
        border: 'border-green-200' 
      };
  }
};

// 趋势图标
const TrendIcon = ({ trend }: { trend: string }) => {
  if (trend === 'worsening') return <TrendingDown className="w-3 h-3 text-red-500" />;
  if (trend === 'improving') return <TrendingUp className="w-3 h-3 text-green-500" />;
  return <Minus className="w-3 h-3 text-gray-400" />;
};

// 维度图标
const DimensionIcon = ({ dimensionId, className }: { dimensionId: string, className?: string }) => {
  const dim = RISK_DIMENSIONS.find(d => d.id === dimensionId);
  if (!dim) return <Globe className={className} />;
  const Icon = dim.icon;
  return <Icon className={className} />;
};

export default function RiskWarning() {
  const { i18n } = useTranslation();
  const isZh = i18n.language === 'zh';

  // 使用全局共享的 MarketContext
  const globalContext = useContext(MarketContext);
  const { selectedMarket: globalMarket, setSelectedMarket: setGlobalMarket, setSelectedRegion: setGlobalRegion } = globalContext || { selectedMarket: null, setSelectedMarket: () => {}, setSelectedRegion: () => {} };

  const [isLoading, setIsLoading] = useState(false);
  const [selectedDimension, setSelectedDimension] = useState<string | null>(null);
  const [showOnlyUrgent, setShowOnlyUrgent] = useState(false);
  
  // 本地状态与全局状态同步 - 将全局 TargetMarket 对象转换为市场ID字符串
  const [selectedMarket, setSelectedMarket] = useState<string | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);

  // 当全局市场选择变化时，同步到本地状态
  useEffect(() => {
    if (globalMarket) {
      setSelectedMarket(globalMarket.id);
      setSelectedRegion(globalMarket.region);
    } else {
      setSelectedMarket(null);
      setSelectedRegion(null);
    }
  }, [globalMarket]);

  // 当本地选择变化时，更新全局状态
  const handleLocalMarketChange = (marketId: string | null) => {
    setSelectedMarket(marketId);
    if (marketId) {
      // 查找对应的 TargetMarket 对象并更新全局状态
      const market = TARGET_MARKETS.find(m => m.id === marketId);
      if (market) {
        setGlobalMarket(market as unknown as import('./aiToolsMarketContext').TargetMarket);
        setGlobalRegion(market.region);
      }
    } else {
      setGlobalMarket(null);
      setGlobalRegion(null);
    }
  };

  // 过滤风险事件
  const filteredRisks = useMemo(() => {
    let risks = [...RISK_EVENTS];
    
    if (selectedDimension) {
      risks = risks.filter(r => r.dimension === selectedDimension);
    }
    
    if (showOnlyUrgent) {
      risks = risks.filter(r => r.urgency >= 7);
    }
    
    risks.sort((a, b) => b.urgency - a.urgency);
    
    return risks;
  }, [selectedDimension, showOnlyUrgent]);

  // 统计数据
  const stats = useMemo(() => {
    const critical = RISK_EVENTS.filter(r => r.severity === 'critical').length;
    const high = RISK_EVENTS.filter(r => r.severity === 'high').length;
    const medium = RISK_EVENTS.filter(r => r.severity === 'medium').length;
    const low = RISK_EVENTS.filter(r => r.severity === 'low').length;
    const avgUrgency = Math.round(RISK_EVENTS.reduce((sum, r) => sum + r.urgency, 0) / RISK_EVENTS.length);
    
    return { critical, high, medium, low, total: RISK_EVENTS.length, avgUrgency };
  }, []);

  // 市场统计数据
  const marketStats = useMemo(() => {
    return TARGET_MARKETS.map(market => {
      const riskIds = getRiskIdsForMarket(market.id);
      const affectedRisks = RISK_EVENTS.filter(r => riskIds.includes(r.id));
      const criticalCount = affectedRisks.filter(r => r.severity === 'critical').length;
      const highCount = affectedRisks.filter(r => r.severity === 'high').length;
      const avgUrgency = affectedRisks.length > 0 
        ? Math.round(affectedRisks.reduce((sum, r) => sum + r.urgency, 0) / affectedRisks.length)
        : 0;
      
      return {
        ...market,
        riskCount: affectedRisks.length,
        criticalCount,
        highCount,
        avgUrgency,
        score: Math.max(0, 100 - criticalCount * 30 - highCount * 15 - avgUrgency * 3),
      };
    }).sort((a, b) => a.score - b.score);
  }, []);

  // 刷新数据
  const refreshData = useCallback(() => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 1000);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-16 px-4" id="risk-warning">
      <div className="max-w-7xl mx-auto">
        {/* 头部 */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-red-100 text-red-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Shield className="w-4 h-4" />
            {isZh ? '出海风险预警系统' : 'Overseas Risk Warning System'}
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {isZh ? '全面风险监测' : 'Comprehensive Risk Monitoring'}
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            {isZh 
              ? '基于第一性原理，从中医药出海核心痛点出发，提供真正有价值的风险分析和决策支持'
              : 'Based on first principles, providing truly valuable risk analysis and decision support for TCM overseas expansion'
            }
          </p>
        </div>

        {/* 核心指标卡片 */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <span className="text-sm text-gray-600">{isZh ? '严重风险' : 'Critical'}</span>
            </div>
            <div className="text-3xl font-bold text-red-600">{stats.critical}</div>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              <span className="text-sm text-gray-600">{isZh ? '高风险' : 'High'}</span>
            </div>
            <div className="text-3xl font-bold text-orange-600">{stats.high}</div>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
              <span className="text-sm text-gray-600">{isZh ? '中风险' : 'Medium'}</span>
            </div>
            <div className="text-3xl font-bold text-yellow-600">{stats.medium}</div>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-sm text-gray-600">{isZh ? '低风险' : 'Low'}</span>
            </div>
            <div className="text-3xl font-bold text-green-600">{stats.low}</div>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-purple-600" />
              <span className="text-sm text-gray-600">{isZh ? '平均紧迫度' : 'Avg Urgency'}</span>
            </div>
            <div className="text-3xl font-bold text-purple-600">{stats.avgUrgency}/10</div>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-5 h-5 text-blue-600" />
              <span className="text-sm text-gray-600">{isZh ? '风险事件' : 'Total Events'}</span>
            </div>
            <div className="text-3xl font-bold text-blue-600">{stats.total}</div>
          </div>
        </div>

        {/* 市场风险矩阵 - 二级层级选择 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Globe className="w-5 h-5 text-blue-600" />
              {isZh ? '目标市场风险矩阵' : 'Target Market Risk Matrix'}
              <span className="text-sm font-normal text-gray-500 ml-2">
                {isZh ? '(35个全球市场)' : '(35 Global Markets)'}
              </span>
            </h3>
            <button 
              onClick={refreshData}
              disabled={isLoading}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              {isZh ? '刷新' : 'Refresh'}
            </button>
          </div>
          
          {/* 风险图例和优先级图例 */}
          <div className="flex flex-wrap items-center gap-3 mb-6 text-xs border-b pb-4">
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-red-500" />
              <span className="text-gray-600">{isZh ? '严重' : 'Critical'}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-orange-500" />
              <span className="text-gray-600">{isZh ? '高' : 'High'}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-yellow-500" />
              <span className="text-gray-600">{isZh ? '中' : 'Medium'}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-gray-600">{isZh ? '低' : 'Low'}</span>
            </div>
            <div className="w-px h-4 bg-gray-300 mx-2" />
            <div className="flex items-center gap-1">
              <span className="px-1.5 py-0.5 bg-blue-600 text-white rounded text-[10px] font-bold">T1</span>
              <span className="text-gray-500">{isZh ? '一线' : 'Tier1'}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="px-1.5 py-0.5 bg-gray-400 text-white rounded text-[10px] font-bold">T2</span>
              <span className="text-gray-500">{isZh ? '二线' : 'Tier2'}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="px-1.5 py-0.5 bg-gray-200 text-gray-500 rounded text-[10px] font-bold">T3</span>
              <span className="text-gray-500">{isZh ? '三线' : 'Tier3'}</span>
            </div>
          </div>

          {/* 一级选择：区域 */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
            {[
              { id: 'northamerica', name: '北美', nameEn: 'North America', flag: '🌎', count: 3 },
              { id: 'europe', name: '欧洲', nameEn: 'Europe', flag: '🇪🇺', count: 6 },
              { id: 'asia-pacific', name: '亚太发达', nameEn: 'Asia Pacific', flag: '🌏', count: 7 },
              { id: 'southeastasia', name: '东南亚', nameEn: 'SE Asia', flag: '🇸🇬', count: 6 },
              { id: 'middleeast', name: '中东非洲', nameEn: 'Middle East', flag: '🌍', count: 8 },
              { id: 'latinamerica', name: '拉美', nameEn: 'Latin America', flag: '🌎', count: 5 },
            ].map(region => {
              const regionMarkets = marketStats.filter(m => m.region === region.id);
              const criticalCount = regionMarkets.reduce((sum, m) => sum + m.criticalCount, 0);
              const highCount = regionMarkets.reduce((sum, m) => sum + m.highCount, 0);
              const avgScore = regionMarkets.length > 0 
                ? Math.round(regionMarkets.reduce((sum, m) => sum + m.score, 0) / regionMarkets.length)
                : 100;
              
              return (
                <button
                  key={region.id}
                  onClick={() => setSelectedRegion(selectedRegion === region.id ? null : region.id)}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${
                    selectedRegion === region.id 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">{region.flag}</span>
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold"
                      style={{ 
                        backgroundColor: avgScore > 70 ? '#dcfce7' : avgScore > 40 ? '#fef3c7' : '#fee2e2',
                        color: avgScore > 70 ? '#16a34a' : avgScore > 40 ? '#d97706' : '#dc2626'
                      }}
                    >
                      {avgScore}
                    </div>
                  </div>
                  <div className="font-bold text-gray-900">{isZh ? region.name : region.nameEn}</div>
                  <div className="text-xs text-gray-500">{region.count} {isZh ? '个国家' : 'countries'}</div>
                  
                  <div className="flex items-center gap-1 mt-2">
                    {criticalCount > 0 && (
                      <span className="px-1.5 py-0.5 bg-red-500 text-white rounded text-[10px] font-medium">
                        {criticalCount}
                      </span>
                    )}
                    {highCount > 0 && (
                      <span className="px-1.5 py-0.5 bg-orange-500 text-white rounded text-[10px] font-medium">
                        {highCount}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* 二级选择：区域内的市场 */}
          {selectedRegion && (
            <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-bold text-gray-900">
                  {isZh ? '选择目标市场' : 'Select Target Market'}
                </h4>
                <button 
                  onClick={() => setSelectedRegion(null)}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  {isZh ? '收起' : 'Collapse'}
                </button>
              </div>
              
              {['tier1', 'tier2', 'tier3'].map(tier => {
                const tierMarkets = marketStats
                  .filter(m => m.region === selectedRegion && m.priority === tier)
                  .sort((a, b) => a.score - b.score);
                
                if (tierMarkets.length === 0) return null;
                
                return (
                  <div key={tier} className="mb-4 last:mb-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        tier === 'tier1' ? 'bg-blue-600 text-white' :
                        tier === 'tier2' ? 'bg-gray-500 text-white' :
                        'bg-gray-300 text-gray-600'
                      }`}>
                        {tier === 'tier1' ? 'T1 ' + (isZh ? '一线市场' : 'Tier 1') :
                         tier === 'tier2' ? 'T2 ' + (isZh ? '二线市场' : 'Tier 2') :
                         'T3 ' + (isZh ? '三线市场' : 'Tier 3')}
                      </span>
                      <span className="text-xs text-gray-500">
                        {tierMarkets.length} {isZh ? '个市场' : 'markets'}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
                      {tierMarkets.map(market => (
                        <button
                          key={market.id}
                          onClick={() => handleLocalMarketChange(selectedMarket === market.id ? null : market.id)}
                          className={`relative p-3 rounded-lg border-2 transition-all text-center ${
                            selectedMarket === market.id 
                              ? 'border-blue-500 bg-blue-50' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="text-xl mb-1">{market.flag}</div>
                          <div className="font-medium text-gray-900 text-xs truncate">
                            {isZh ? market.name : market.nameEn}
                          </div>
                          
                          <div 
                            className="mt-1 text-xs font-bold"
                            style={{ 
                              color: market.score > 70 ? '#16a34a' : market.score > 40 ? '#d97706' : '#dc2626'
                            }}
                          >
                            {market.score}
                          </div>
                          
                          <div className="flex items-center justify-center gap-0.5 mt-1">
                            {market.criticalCount > 0 && (
                              <span className="w-2 h-2 rounded-full bg-red-500" />
                            )}
                            {market.highCount > 0 && (
                              <span className="w-2 h-2 rounded-full bg-orange-500" />
                            )}
                            {market.riskCount === 0 && (
                              <span className="w-2 h-2 rounded-full bg-green-400" />
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* 选中市场的详细风险说明 */}
          {selectedMarket && (
            <div className="mt-6 p-5 bg-gray-50 rounded-xl border-2 border-blue-200">
              {(() => {
                const market = TARGET_MARKETS.find(m => m.id === selectedMarket);
                const riskIds = getRiskIdsForMarket(selectedMarket);
                const marketRisks = RISK_EVENTS.filter(r => riskIds.includes(r.id));
                const marketStat = marketStats.find(s => s.id === selectedMarket);
                
                return (
                  <div>
                    <div className="flex items-center gap-4 mb-5">
                      <span className="text-5xl">{market?.flag}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-2xl font-bold text-gray-900">
                            {isZh ? market?.name : market?.nameEn}
                          </h4>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            market?.priority === 'tier1' ? 'bg-blue-100 text-blue-700' :
                            market?.priority === 'tier2' ? 'bg-gray-100 text-gray-700' :
                            'bg-gray-50 text-gray-400'
                          }`}>
                            {market?.priority === 'tier1' ? 'T1' : market?.priority === 'tier2' ? 'T2' : 'T3'}
                            {isZh ? '线市场' : ' Tier'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500">
                          {market?.region} · GDP ${market?.gdp}
                        </p>
                      </div>
                      <div 
                        className="w-16 h-16 rounded-2xl flex flex-col items-center justify-center"
                        style={{ 
                          backgroundColor: marketStat && marketStat.score > 70 ? '#dcfce7' : marketStat && marketStat.score > 40 ? '#fef3c7' : '#fee2e2',
                        }}
                      >
                        <div className="text-2xl font-bold" style={{ 
                          color: marketStat && marketStat.score > 70 ? '#16a34a' : marketStat && marketStat.score > 40 ? '#d97706' : '#dc2626'
                        }}>
                          {marketStat?.score || 100}
                        </div>
                        <div className="text-[10px] text-gray-600">{isZh ? '风险分' : 'Score'}</div>
                      </div>
                    </div>
                    
                    {marketRisks.length === 0 ? (
                      <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex items-center gap-2 text-green-700 font-medium">
                          <CheckCircle className="w-5 h-5" />
                          {isZh ? '✅ 该市场当前无明显风险' : '✅ No significant risks for this market'}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {marketRisks
                          .sort((a, b) => b.urgency - a.urgency)
                          .map(risk => {
                            const style = getSeverityStyle(risk.severity);
                            const dimInfo = RISK_DIMENSIONS.find(d => d.id === risk.dimension);
                            
                            return (
                              <div 
                                key={risk.id}
                                className={`p-4 rounded-lg border ${style.border} ${style.bg}`}
                              >
                                <div className="flex items-start justify-between mb-3">
                                  <div className="flex items-center gap-2">
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${style.bg} ${style.text}`}>
                                      {isZh ? style.label : style.labelEn}
                                    </span>
                                    <span className="text-xs text-gray-500 bg-white/50 px-2 py-1 rounded">
                                      {dimInfo && (isZh ? dimInfo.name : dimInfo.nameEn)}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                      {isZh ? '紧迫度' : 'Urgency'}: <span className="font-bold">{risk.urgency}/10</span>
                                    </span>
                                  </div>
                                  <TrendIcon trend={risk.trend} />
                                </div>
                                
                                <div className="font-bold text-gray-900 mb-2">
                                  {isZh ? risk.title : risk.titleEn}
                                </div>
                                
                                <div className="text-sm text-gray-600 mb-3">
                                  {isZh ? risk.description : risk.descriptionEn}
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  <div className="bg-white/70 rounded-lg p-3">
                                    <div className="flex items-center gap-1 text-red-700 font-semibold text-sm mb-1">
                                      <Zap className="w-4 h-4" />
                                      {isZh ? '📉 业务影响' : '📉 Impact'}
                                    </div>
                                    <div className="text-sm text-gray-700">
                                      {isZh ? risk.impact : risk.impactEn}
                                    </div>
                                  </div>
                                  <div className="bg-white/70 rounded-lg p-3">
                                    <div className="flex items-center gap-1 text-green-700 font-semibold text-sm mb-1">
                                      <Compass className="w-4 h-4" />
                                      {isZh ? '🎯 建议行动' : '🎯 Action'}
                                    </div>
                                    <div className="text-sm text-gray-700">
                                      {isZh ? risk.action : risk.actionEn}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                        })}
                      </div>
                    )}
                    
                    {/* 市场进入建议 */}
                    <div className="mt-5 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center gap-2 text-blue-800 font-semibold mb-2">
                        <Target className="w-5 h-5" />
                        {isZh ? '💡 市场进入建议' : '💡 Recommendation'}
                      </div>
                      <div className="text-sm text-blue-700">
                        {selectedMarket ? (
                          <>
                            {selectedMarket === 'usa' && (isZh 
                              ? '⚠️ 美国关税不确定性高(风险分45)，建议观望或东南亚转口' 
                              : '⚠️ US tariff uncertainty high (Score 45), recommend waiting or SE Asia transshipment')
                            }
                            {selectedMarket === 'germany' && (isZh 
                              ? '⚠️ 欧盟准入门槛高(风险分52)，需2-3年准备期' 
                              : '⚠️ EU barriers high (Score 52), needs 2-3 years preparation')
                            }
                            {selectedMarket === 'japan' && (isZh 
                              ? '⚠️ 日本审批周期长(风险分58)' 
                              : '⚠️ Japan approval long (Score 58)')
                            }
                            {['saudiarabia', 'uae', 'israel', 'qatar', 'turkey'].includes(selectedMarket || '') && (isZh 
                              ? '🚨 中东战争风险极高(风险分20-35)，建议暂缓' 
                              : '🚨 Middle East war risk extreme (Score 20-35), recommend postponing')
                            }
                            {['singapore', 'indonesia', 'thailand', 'vietnam', 'malaysia'].includes(selectedMarket || '') && (isZh 
                              ? '✅ 东南亚最佳时机(风险分75-85)，需求旺盛' 
                              : '✅ SE Asia best timing (Score 75-85), strong demand')
                            }
                            {selectedMarket === 'australia' && (isZh 
                              ? '⚠️ TGA审查趋严(风险分55)' 
                              : '⚠️ TGA review tightening (Score 55)')
                            }
                            {selectedMarket === 'uk' && (isZh 
                              ? '⚠️ 英国法规严格(风险分48)' 
                              : '⚠️ UK regulations strict (Score 48)')
                            }
                            {/* 其他市场默认提示 */}
                            {['usa', 'germany', 'japan', 'saudiarabia', 'uae', 'israel', 'qatar', 'turkey', 'singapore', 'indonesia', 'thailand', 'vietnam', 'malaysia', 'australia', 'uk'].indexOf(selectedMarket || '') === -1 && (
                              isZh 
                                ? '📊 请查看具体风险维度，了解该市场的准入要求和潜在风险' 
                                : '📊 Please check specific risk dimensions for market entry requirements'
                            )}
                          </>
                        ) : (
                          isZh 
                            ? '👆 请在上方选择一个目标市场，获取针对性的进入建议' 
                            : '👆 Please select a target market above to get specific recommendations'
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>

        {/* 风险维度筛选 */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setSelectedDimension(null)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedDimension === null 
                ? 'bg-gray-900 text-white' 
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {isZh ? '全部维度' : 'All Dimensions'}
          </button>
          {RISK_DIMENSIONS.map(dim => (
            <button
              key={dim.id}
              onClick={() => setSelectedDimension(selectedDimension === dim.id ? null : dim.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2 ${
                selectedDimension === dim.id 
                  ? 'bg-gray-900 text-white' 
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              <DimensionIcon dimensionId={dim.id} className="w-4 h-4" />
              {isZh ? dim.name : dim.nameEn}
            </button>
          ))}
          
          <button
            onClick={() => setShowOnlyUrgent(!showOnlyUrgent)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ml-auto ${
              showOnlyUrgent 
                ? 'bg-red-600 text-white' 
                : 'bg-white text-red-700 border border-red-200 hover:bg-red-50'
            }`}
          >
            <Bell className="w-4 h-4 inline mr-1" />
            {isZh ? '仅看紧急' : 'Urgent Only'}
          </button>
        </div>

        {/* 风险事件列表 */}
        <div className="space-y-4">
          {filteredRisks.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {isZh ? '暂无高风险事件' : 'No High-Risk Events'}
              </h3>
              <p className="text-gray-500">
                {isZh ? '当前筛选条件下没有匹配的风险事件' : 'No risk events match current filters'}
              </p>
            </div>
          ) : (
            filteredRisks.map(risk => {
              const style = getSeverityStyle(risk.severity);
              const dimension = RISK_DIMENSIONS.find(d => d.id === risk.dimension);
              
              return (
                <div 
                  key={risk.id}
                  className={`bg-white rounded-2xl p-6 border ${style.border} shadow-sm hover:shadow-md transition-shadow`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl ${style.bg} flex items-center justify-center`}>
                        <DimensionIcon dimensionId={risk.dimension} className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-gray-900">{isZh ? risk.title : risk.titleEn}</h4>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
                            {isZh ? style.label : style.labelEn}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <DimensionIcon dimensionId={risk.dimension} className="w-3 h-3" />
                          {dimension && (isZh ? dimension.name : dimension.nameEn)}
                          <span className="mx-1">·</span>
                          <TrendIcon trend={risk.trend} />
                          {risk.trend === 'worsening' && (isZh ? '恶化中' : 'Worsening')}
                          {risk.trend === 'stable' && (isZh ? '稳定' : 'Stable')}
                          {risk.trend === 'improving' && (isZh ? '改善中' : 'Improving')}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-sm text-gray-500">{isZh ? '紧迫度' : 'Urgency'}</div>
                      <div className="flex items-center gap-1">
                        <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${
                              risk.urgency >= 8 ? 'bg-red-500' :
                              risk.urgency >= 5 ? 'bg-orange-500' : 'bg-yellow-500'
                            }`}
                            style={{ width: `${risk.urgency * 10}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-700">{risk.urgency}/10</span>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 mb-4">
                    {isZh ? risk.description : risk.descriptionEn}
                  </p>
                  
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div className="bg-red-50 rounded-xl p-4">
                      <div className="flex items-center gap-2 text-red-700 font-medium mb-2">
                        <Zap className="w-4 h-4" />
                        {isZh ? '📉 业务影响' : '📉 Business Impact'}
                      </div>
                      <p className="text-sm text-red-600">
                        {isZh ? risk.impact : risk.impactEn}
                      </p>
                    </div>
                    <div className="bg-green-50 rounded-xl p-4">
                      <div className="flex items-center gap-2 text-green-700 font-medium mb-2">
                        <Compass className="w-4 h-4" />
                        {isZh ? '🎯 建议行动' : '🎯 Recommended Action'}
                      </div>
                      <p className="text-sm text-green-600">
                        {isZh ? risk.action : risk.actionEn}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm text-gray-500">{isZh ? '影响市场：' : 'Affected markets:'}</span>
                    {risk.affectedMarkets.map(m => {
                      const market = TARGET_MARKETS.find(tm => tm.id === m);
                      return market ? (
                        <span 
                          key={m}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                        >
                          <span>{market.flag}</span>
                          {isZh ? market.name : market.nameEn}
                        </span>
                      ) : null;
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* 底部说明 */}
        <div className="mt-12 bg-blue-50 rounded-2xl p-6 border border-blue-100">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <BookOpen className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h4 className="font-bold text-blue-900 mb-2">
                {isZh ? '💡 第一性原理说明' : '💡 First Principles Explanation'}
              </h4>
              <p className="text-sm text-blue-800 leading-relaxed">
                {isZh 
                  ? '本系统从中医药企业出海的真实痛点出发，不是简单地展示数据，而是提供可操作的决策支持。每个风险事件都包含具体的业务影响分析和可执行的行动建议，帮助您优先处理最紧迫的问题。'
                  : 'This system addresses real pain points of TCM companies going overseas. Instead of simply displaying data, it provides actionable decision support. Each risk event includes specific business impact analysis and actionable recommendations to help you prioritize the most urgent issues.'
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
