/**
 * AI智能工具中心 - 升级版
 * 设计理念: 清晰的三步流程
 * Step 1: 选择目标市场
 * Step 2: 选择产品类别（分级筛选）
 * Step 3: 查看6大分析工具的结果
 */

import { useState, useMemo, useContext, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Shield,
  Calculator,
  BarChart3,
  Compass,
  AlertTriangle,
  Bot,
  Globe,
  CheckCircle,
  Target,
  RefreshCw,
  Package,
  ArrowRight,
  Sparkles,
  Leaf,
  Pill,
  FlaskConical,
  Heart,
  Users,
  Dog,
  Coffee,
  Zap,
  Lightbulb,
} from 'lucide-react';
import FeasibilityAssessment from './FeasibilityAssessment';
import Tools from './Tools';
import ComplianceTest from './ComplianceTest';
import MarketInsight from './MarketInsight';
import ChannelMatch from './ChannelMatch';
import RiskWarning from './RiskWarning';
import AIMarketingContent from './AIMarketingContent';
import { MarketContext, type TargetMarket } from './aiToolsMarketContext';
import { tracking } from '../lib/tracking';

// 产品大类
const PRODUCT_TYPES = [
  { 
    value: 'health', 
    label: '健康产品', 
    labelEn: 'Health Products',
    icon: Heart,
    children: [
      { value: 'supplement', label: '保健食品', labelEn: 'Health Supplements' },
      { value: 'nutraceutical', label: '功能性食品', labelEn: 'Nutraceuticals' },
      { value: 'vitamin', label: '维生素矿物质', labelEn: 'Vitamins & Minerals' },
      { value: 'probiotic', label: '益生菌产品', labelEn: 'Probiotic Products' },
      { value: 'protein', label: '蛋白质粉', labelEn: 'Protein Powders' },
      { value: 'sports', label: '运动营养品', labelEn: 'Sports Nutrition' },
    ]
  },
  { 
    value: 'traditional', 
    label: '中医药', 
    labelEn: 'Traditional Chinese Medicine',
    icon: Leaf,
    children: [
      { value: 'herbal', label: '中药饮片', labelEn: 'Herbal Slices' },
      { value: 'decoction', label: '中药配方颗粒', labelEn: 'TCM Granules' },
      { value: 'patent', label: '中成药', labelEn: 'Patent TCM' },
      { value: 'decoctions', label: '膏方制剂', labelEn: 'Herbal Decoctions' },
      { value: 'teapills', label: '丸散膏丹', labelEn: 'TCM Pills & Powders' },
      { value: 'tcmexternal', label: '外用膏贴', labelEn: 'TCM Topical Products' },
    ]
  },
  { 
    value: 'cosmetic', 
    label: '护肤美容', 
    labelEn: 'Skincare & Beauty',
    icon: FlaskConical,
    children: [
      { value: 'skincare', label: '护肤品', labelEn: 'Skincare Products' },
      { value: 'makeup', label: '彩妆产品', labelEn: 'Makeup Products' },
      { value: 'fragrance', label: '香水香氛', labelEn: 'Fragrances' },
      { value: 'haircare', label: '护发产品', labelEn: 'Hair Care Products' },
      { value: 'bodycare', label: '身体护理', labelEn: 'Body Care Products' },
      { value: 'cosmeceutical', label: '功效性护肤品', labelEn: 'Cosmeceuticals' },
    ]
  },
  { 
    value: 'medical', 
    label: '医疗器械', 
    labelEn: 'Medical Devices',
    icon: Pill,
    children: [
      { value: 'diagnostic', label: '诊断设备', labelEn: 'Diagnostic Equipment' },
      { value: 'therapeutic', label: '治疗设备', labelEn: 'Therapeutic Equipment' },
      { value: 'aids', label: '康复辅助', labelEn: 'Rehabilitation Aids' },
      { value: 'monitoring', label: '监护设备', labelEn: 'Monitoring Devices' },
      { value: 'disposable', label: '一次性耗材', labelEn: 'Disposable Medical Supplies' },
      { value: 'dental', label: '口腔器械', labelEn: 'Dental Equipment' },
    ]
  },
  { 
    value: 'elderly', 
    label: '银发经济', 
    labelEn: 'Elderly Care',
    icon: Users,
    children: [
      { value: 'elderlyNutrition', label: '老年营养品', labelEn: 'Elderly Nutrition' },
      { value: 'elderlyCare', label: '老年护理用品', labelEn: 'Elderly Care Products' },
      { value: 'mobility', label: '助行器材', labelEn: 'Mobility Aids' },
      { value: 'hearing', label: '听力辅助', labelEn: 'Hearing Aids' },
      { value: 'vision', label: '视力辅助', labelEn: 'Vision Aids' },
    ]
  },
  { 
    value: 'pet', 
    label: '宠物经济', 
    labelEn: 'Pet Industry',
    icon: Dog,
    children: [
      { value: 'petSupplement', label: '宠物保健品', labelEn: 'Pet Supplements' },
      { value: 'petFood', label: '宠物功能性食品', labelEn: 'Pet Functional Food' },
      { value: 'petCare', label: '宠物护理用品', labelEn: 'Pet Care Products' },
      { value: 'petToy', label: '宠物玩具', labelEn: 'Pet Toys' },
    ]
  },
  { 
    value: 'food', 
    label: '食品饮料', 
    labelEn: 'Food & Beverage',
    icon: Coffee,
    children: [
      { value: 'functionalDrink', label: '功能性饮料', labelEn: 'Functional Beverages' },
      { value: 'healthFood', label: '健康食品', labelEn: 'Health Food' },
      { value: 'organic', label: '有机食品', labelEn: 'Organic Food' },
      { value: 'babyFood', label: '婴幼儿食品', labelEn: 'Baby Food' },
      { value: 'dietary', label: '膳食补充剂', labelEn: 'Dietary Supplements' },
    ]
  },
];

// 扁平化的产品类别选项（用于默认值）
// const DEFAULT_CATEGORY = 'supplement';

// 市场 → 推荐产品类型映射（基于市场特点智能推荐）
const MARKET_PRODUCT_RECOMMENDATIONS: Record<string, { productType: string; category: string; reason: string; reasonEn: string; badge: string }[]> = {
  japan: [
    { productType: 'supplement', category: 'supplement', reason: '日本保健食品市场成熟，消费者接受度高', reasonEn: 'Mature market, high consumer acceptance', badge: '🔥 热门' },
    { productType: 'nutraceutical', category: 'health', reason: '功能性食品分类清晰，注册门槛较低', reasonEn: 'Clear functional food category, lower barriers', badge: '⭐ 推荐' },
    { productType: 'skincare', category: 'cosmetic', reason: '药妆市场规模庞大，利润空间高', reasonEn: 'Huge cosmetics market, high margins', badge: '💎 高价值' },
  ],
  usa: [
    { productType: 'supplement', category: 'health', reason: '全球最大保健品市场，法规透明', reasonEn: "World's largest supplement market, clear regulations", badge: '🔥 热门' },
    { productType: 'nutraceutical', category: 'health', reason: 'NDI认证路径清晰，可规模化', reasonEn: 'Clear NDI pathway, scalable', badge: '⭐ 推荐' },
    { productType: 'probiotic', category: 'health', reason: '益生菌品类增长迅速，消费者意识强', reasonEn: 'Rapidly growing probiotic category', badge: '📈 增长快' },
  ],
  australia: [
    { productType: 'supplement', category: 'health', reason: 'TGA监管清晰，中国产品信任度高', reasonEn: 'Clear TGA regulation, high trust in Chinese products', badge: '⭐ 推荐' },
    { productType: 'nutraceutical', category: 'health', reason: '补充药品分类适合中药产品', reasonEn: 'Complementary medicine category suits TCM', badge: '🏆 最佳' },
    { productType: 'probiotic', category: 'health', reason: '澳洲消费者对益生菌认知度最高', reasonEn: 'Highest probiotic awareness among consumers', badge: '📈 增长快' },
  ],
  germany: [
    { productType: 'supplement', category: 'health', reason: '食品补充剂分类适合，无处方药注册门槛', reasonEn: 'Food supplement category, no prescription barriers', badge: '⭐ 推荐' },
    { productType: 'nutraceutical', category: 'health', reason: '欧盟THR注册完成后可进入全欧', reasonEn: 'THR registration opens entire EU market', badge: '🏆 最佳' },
    { productType: 'herbal', category: 'traditional', reason: '德国消费者对草本产品接受度高', reasonEn: 'High acceptance of herbal products', badge: '📈 潜力' },
  ],
  southeastasia: [
    { productType: 'supplement', category: 'health', reason: '越南/印尼准入门槛低，复制成本低', reasonEn: 'Low entry barriers in Vietnam/Indonesia', badge: '🔥 入门首选' },
    { productType: 'nutraceutical', category: 'health', reason: '东南亚华人群体对中药认知基础好', reasonEn: 'Chinese diaspora has TCM awareness base', badge: '⭐ 推荐' },
    { productType: 'functionalDrink', category: 'food', reason: '功能性饮料在东南亚增速全球最快', reasonEn: 'Fastest growing functional beverage market globally', badge: '📈 增长快' },
  ],
  middleeast: [
    { productType: 'supplement', category: 'health', reason: '阿联酋/沙特消费力强，高端定位合适', reasonEn: 'Strong purchasing power, suits premium positioning', badge: '💎 高价值' },
    { productType: 'nutraceutical', category: 'health', reason: '清真认证后市场空间巨大', reasonEn: 'Massive market after halal certification', badge: '⭐ 推荐' },
    { productType: 'herbal', category: 'traditional', reason: '中东传统草本医学与中医有共鸣', reasonEn: 'Middle Eastern traditional medicine resonates with TCM', badge: '📈 潜力' },
  ],
  southkorea: [
    { productType: 'skincare', category: 'cosmetic', reason: '韩国美妆全球领先，但中国汉方护肤品差异化强', reasonEn: 'Korean beauty leads globally, but Chinese Hanfang skincare differentiates', badge: '⭐ 推荐' },
    { productType: 'supplement', category: 'health', reason: '韩国消费者对健康产品接受度高', reasonEn: 'High health product acceptance', badge: '📈 增长快' },
    { productType: 'nutraceutical', category: 'health', reason: 'K-健康风潮带动功能性食品需求', reasonEn: 'K-health trend drives functional food demand', badge: '🔥 热门' },
  ],
};

function getRecommendations(marketId: string) {
  // 优先精确匹配
  if (MARKET_PRODUCT_RECOMMENDATIONS[marketId]) {
    return MARKET_PRODUCT_RECOMMENDATIONS[marketId];
  }
  // 其次按区域匹配
  const regionMap: Record<string, string> = {
    northamerica: 'usa',
    europe: 'germany',
    asiapacific: 'australia',
    southeastasia: 'southeastasia',
    middleeast: 'middleeast',
    latinamerica: 'usa',
  };
  const regionKey = regionMap[marketId] || 'usa';
  return MARKET_PRODUCT_RECOMMENDATIONS[regionKey] || MARKET_PRODUCT_RECOMMENDATIONS.usa;
}

// 目标市场数据
const TARGET_MARKETS: TargetMarket[] = [
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
  { id: 'japan', name: '日本', nameEn: 'Japan', flag: '🇯🇵', region: 'asiapacific', priority: 'tier1', gdp: '4.9万亿' },
  { id: 'australia', name: '澳大利亚', nameEn: 'Australia', flag: '🇦🇺', region: 'asiapacific', priority: 'tier1', gdp: '1.7万亿' },
  { id: 'southkorea', name: '韩国', nameEn: 'South Korea', flag: '🇰🇷', region: 'asiapacific', priority: 'tier1', gdp: '1.8万亿' },
  { id: 'singapore', name: '新加坡', nameEn: 'Singapore', flag: '🇸🇬', region: 'asiapacific', priority: 'tier1', gdp: '0.5万亿' },
  { id: 'nz', name: '新西兰', nameEn: 'New Zealand', flag: '🇳🇿', region: 'asiapacific', priority: 'tier3', gdp: '0.3万亿' },
  
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

// 区域数据
const REGIONS = [
  { id: 'northamerica', name: '北美', nameEn: 'North America', flag: '🌎', count: 3 },
  { id: 'europe', name: '欧洲', nameEn: 'Europe', flag: '🇪🇺', count: 9 },
  { id: 'asiapacific', name: '亚太发达', nameEn: 'Asia Pacific', flag: '🌏', count: 5 },
  { id: 'southeastasia', name: '东南亚', nameEn: 'SE Asia', flag: '🇸🇬', count: 6 },
  { id: 'middleeast', name: '中东非洲', nameEn: 'Middle East', flag: '🌍', count: 8 },
  { id: 'latinamerica', name: '拉美', nameEn: 'Latin America', flag: '🌎', count: 5 },
];

// Tab配置
const TABS = [
  {
    id: 'feasibility',
    name: '市场分析',
    nameEn: 'Market Analysis',
    icon: BarChart3,
    description: 'AI市场可行性评估',
    descriptionEn: 'AI-powered market feasibility assessment',
    color: 'from-blue-500 to-blue-600',
  },
  {
    id: 'cost',
    name: '成本测算',
    nameEn: 'Cost Calculator',
    icon: Calculator,
    description: '准入成本精准测算',
    descriptionEn: 'Accurate entry cost calculation',
    color: 'from-emerald-500 to-emerald-600',
  },
  {
    id: 'compliance',
    name: '合规自测',
    nameEn: 'Compliance Test',
    icon: Shield,
    description: '产品合规准入评估',
    descriptionEn: 'Product compliance assessment',
    color: 'from-purple-500 to-purple-600',
  },
  {
    id: 'insight',
    name: '市场洞察',
    nameEn: 'Market Insight',
    icon: Compass,
    description: '用户需求深度分析',
    descriptionEn: 'Deep user needs analysis',
    color: 'from-amber-500 to-orange-600',
  },
  {
    id: 'channel',
    name: '渠道推荐',
    nameEn: 'Channel Match',
    icon: Globe,
    description: '智能渠道匹配',
    descriptionEn: 'Smart channel matching',
    color: 'from-cyan-500 to-blue-600',
  },
  {
    id: 'risk',
    name: '风险预警',
    nameEn: 'Risk Warning',
    icon: AlertTriangle,
    description: '政策风险实时监测',
    descriptionEn: 'Real-time policy risk monitoring',
    color: 'from-red-500 to-rose-600',
  },
  {
    id: 'marketing',
    name: '营销内容',
    nameEn: 'Marketing Content',
    icon: Zap,
    description: 'AI生成多平台营销文案',
    descriptionEn: 'AI multi-platform marketing copy',
    color: 'from-violet-500 to-purple-600',
  },
];

export default function AIToolsHub() {
  const { i18n } = useTranslation();
  const isZh = i18n.language === 'zh';
  const [activeTab, setActiveTab] = useState('feasibility');
  const [selectedProductType, setSelectedProductType] = useState<string | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);  // 追踪经过的秒数
  
  // 使用全局共享的 MarketContext
  const { selectedMarket, selectedRegion, selectedCategory, setSelectedMarket, setSelectedRegion, setSelectedCategory, isPrefetching, prefetchProgress, prefetchAllData, error, setError } = useContext(MarketContext);

  // 计时器：每秒钟更新一次进度
  useEffect(() => {
    if (!isPrefetching) {
      setElapsedTime(0);
      return;
    }
    
    const interval = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);
    
    return () => clearInterval(interval);
  }, [isPrefetching]);

  // 计算基于60秒的进度百分比
  const timeBasedProgress = Math.min((elapsedTime / 60) * 100, 95);

  // 根据区域过滤市场
  const filteredMarkets = useMemo(() => {
    if (!selectedRegion) return [];
    return TARGET_MARKETS.filter(m => m.region === selectedRegion);
  }, [selectedRegion]);

  // 获取选中市场对应的区域名称
  const regionName = REGIONS.find(r => r.id === selectedRegion);

  // 处理市场选择
  const handleMarketSelect = (market: TargetMarket) => {
    setSelectedMarket(market);
    setSelectedRegion(market.region);
    // 追踪市场选择
    tracking.click(`select_market_${market.id}`, 'ai_tool');
    tracking.toolInteraction('market_selector', 'select', { marketId: market.id, marketName: market.name });
  };

  // 处理产品大类选择
  const handleProductTypeSelect = (typeValue: string) => {
    setSelectedProductType(typeValue);
    // 默认选择该大类下的第一个产品
    const type = PRODUCT_TYPES.find(t => t.value === typeValue);
    if (type && type.children.length > 0) {
      setSelectedCategory(type.children[0].value);
    }
    // 追踪产品类型选择
    tracking.click(`select_product_type_${typeValue}`, 'ai_tool');
    tracking.toolInteraction('product_selector', 'select_type', { productType: typeValue });
  };

  // 处理具体产品选择
  const handleCategorySelect = (categoryValue: string) => {
    setSelectedCategory(categoryValue);
    // 追踪具体产品选择
    tracking.click(`select_category_${categoryValue}`, 'ai_tool');
    tracking.toolInteraction('product_selector', 'select_category', { category: categoryValue });
  };

  // 重置所有选择
  const handleReset = () => {
    setSelectedMarket(null);
    setSelectedRegion(null);
    setSelectedCategory('supplement');
    setSelectedProductType(null);
    setActiveTab('feasibility');
    // 追踪重置操作
    tracking.click('ai_tools_reset', 'ai_tool');
    tracking.toolInteraction('ai_tools', 'reset', {});
  };

  const hasSelection = selectedMarket && selectedCategory;

  // 获取当前选中的产品类型
  const currentProductType = PRODUCT_TYPES.find(t => t.children.some(c => c.value === selectedCategory));
  const currentSubCategories = currentProductType?.children || [];

  return (
    <section id="ai-tools" className="py-12 bg-gray-900">
      <div className="max-w-6xl mx-auto px-4">
        
        {/* 标题区 */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium mb-4">
            <Bot className="w-4 h-4" />
            {isZh ? 'AI 智能工具中心' : 'AI Tools Hub'}
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
            {isZh ? '一站式AI出海智能解决方案' : 'One-Stop AI Overseas Solution'}
          </h2>
          <p className="text-gray-300 max-w-2xl mx-auto text-lg">
            {isZh 
                ? '基于全球33个国家数据积累，6大AI模块全链路解决出海痛点'
                : 'Based on 33 countries data, 6 AI modules solve overseas pain points'}
          </p>
        </div>

        {/* 统一的筛选选择器卡片 */}
        <div className="bg-gray-800 rounded-2xl shadow-lg border border-gray-600 overflow-hidden mb-8">
          {/* 步骤进度条 */}
          <div className="bg-gray-700 px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-6">
              {/* 步骤1 */}
              <div className={`flex items-center gap-2 ${selectedMarket ? 'text-emerald-400' : 'text-gray-400'}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold ${
                  selectedMarket ? 'bg-emerald-500 text-white' : 'bg-gray-600 text-gray-300'
                }`}>
                  {selectedMarket ? <CheckCircle className="w-4 h-4" /> : '1'}
                </div>
                <span className="text-sm font-medium">{isZh ? '选择市场' : 'Select Market'}</span>
              </div>
              
              <div className="w-12 h-0.5 bg-gray-600" />
              
              {/* 步骤2 */}
              <div className={`flex items-center gap-2 ${selectedCategory ? 'text-blue-400' : 'text-gray-400'}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold ${
                  selectedCategory ? 'bg-blue-500 text-white' : 'bg-gray-600 text-gray-300'
                }`}>
                  {selectedCategory ? <CheckCircle className="w-4 h-4" /> : '2'}
                </div>
                <span className="text-sm font-medium">{isZh ? '选择产品' : 'Select Product'}</span>
              </div>
              
              <div className="w-12 h-0.5 bg-gray-600" />
              
              {/* 步骤3 */}
              <div className={`flex items-center gap-2 ${hasSelection ? 'text-purple-400' : 'text-gray-400'}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold ${
                  hasSelection ? 'bg-purple-500 text-white' : 'bg-gray-600 text-gray-300'
                }`}>
                  3
                </div>
                <span className="text-sm font-medium">{isZh ? '查看结果' : 'View Results'}</span>
              </div>
            </div>
            
            {/* 重置按钮 */}
            {hasSelection && (
              <button
                onClick={handleReset}
                className="text-sm text-gray-400 hover:text-white flex items-center gap-1 transition-colors"
              >
                <RefreshCw className="w-3 h-3" />
                {isZh ? '重新选择' : 'Reset'}
              </button>
            )}
          </div>

          <div className="p-6">
            {/* 已选择显示 */}
            {hasSelection && (
              <div className="mb-6 p-4 bg-gray-700 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Globe className="w-5 h-5 text-emerald-400" />
                    <span className="text-white font-medium">
                      {selectedMarket?.flag} {isZh ? selectedMarket?.name : selectedMarket?.nameEn}
                    </span>
                  </div>
                  <div className="w-px h-6 bg-gray-600" />
                  <div className="flex items-center gap-2">
                    <Package className="w-5 h-5 text-blue-400" />
                    <span className="text-white font-medium">
                      {currentProductType && (isZh ? currentProductType.label : currentProductType.labelEn)} / 
                      {currentSubCategories.find(c => c.value === selectedCategory)?.[isZh ? 'label' : 'labelEn']}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* 错误提示 */}
            {error && (
              <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                  <span className="text-red-300 text-sm">{error}</span>
                </div>
                <button
                  onClick={() => { setError(null); prefetchAllData(); }}
                  className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  {isZh ? '重试' : 'Retry'}
                </button>
              </div>
            )}

            {/* 第一行：目标市场选择 */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Target className="w-5 h-5 text-emerald-500" />
                <span className="font-bold text-white">
                  {isZh ? '第一步：选择目标市场' : 'Step 1: Select Target Market'}
                </span>
              </div>
              
              {/* 区域选择 */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 mb-3">
                {REGIONS.map(region => (
                  <button
                    key={region.id}
                    onClick={() => {
                      const newRegion = selectedRegion === region.id ? null : region.id;
                      setSelectedRegion(newRegion);
                      if (newRegion === null) setSelectedMarket(null);
                      tracking.click(`select_region_${region.id}`, 'ai_tool');
                    }}
                    className={`p-2 rounded-lg border-2 transition-all text-center ${
                      selectedRegion === region.id 
                        ? 'border-emerald-500 bg-emerald-500/10' 
                        : 'border-gray-600 hover:border-emerald-400'
                    }`}
                  >
                    <div className="text-lg">{region.flag}</div>
                    <div className="font-medium text-white text-xs">
                      {isZh ? region.name : region.nameEn}
                    </div>
                  </button>
                ))}
              </div>

              {/* 具体国家选择 */}
              {selectedRegion && (
                <div className="mt-3 p-3 bg-gray-700 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">
                      {isZh ? regionName?.name : regionName?.nameEn} - {isZh ? '选择具体国家' : 'Select country'}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {['tier1', 'tier2', 'tier3'].map(tier => {
                      const tierMarkets = filteredMarkets.filter(m => m.priority === tier);
                      if (tierMarkets.length === 0) return null;
                      return tierMarkets.map(market => (
                        <button
                          key={market.id}
                          onClick={() => handleMarketSelect(market)}
                          className={`px-3 py-1.5 rounded-lg border-2 transition-all flex items-center gap-1.5 ${
                              selectedMarket?.id === market.id 
                                ? 'border-emerald-500 bg-emerald-500/10' 
                                : 'border-gray-600 hover:border-emerald-400'
                          }`}
                        >
                          <span className="text-sm">{market.flag}</span>
                          <span className="text-white text-xs font-medium">
                            {isZh ? market.name : market.nameEn}
                          </span>
                          {selectedMarket?.id === market.id && (
                            <CheckCircle className="w-3 h-3 text-emerald-500" />
                          )}
                        </button>
                      ));
                    })}
                  </div>
                </div>
              )}

            </div>

            {/* 智能推荐：根据已选市场推荐产品类型 */}
            {selectedMarket && (
              <div className="mt-4 p-4 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-xl">
                <div className="flex items-center gap-2 mb-3">
                  <Lightbulb className="w-4 h-4 text-amber-400" />
                  <span className="text-sm font-medium text-amber-400">
                    {isZh
                      ? `💡 ${selectedMarket.flag} ${isZh ? selectedMarket.name : selectedMarket.nameEn} — AI 推荐产品类型`
                    : `💡 AI Recommendations for ${selectedMarket.nameEn}`}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {getRecommendations(selectedMarket.id).map((rec, i) => {
                    const productType = PRODUCT_TYPES.find(pt => pt.value === rec.productType);
                    if (!productType) return null;
                    const Icon = productType.icon;
                    return (
                      <button
                        key={i}
                        onClick={() => {
                          handleProductTypeSelect(rec.productType);
                        }}
                        className="flex items-center gap-2 px-3 py-2 bg-gray-700/50 border border-gray-600 hover:border-amber-500 rounded-lg transition-all group"
                      >
                        <Icon className="w-4 h-4 text-amber-400 group-hover:text-amber-300" />
                        <div className="text-left">
                          <div className="text-xs font-medium text-white">
                            {isZh ? productType.label : productType.labelEn}
                          </div>
                          <div className="text-xs text-gray-400">
                            {isZh ? rec.reason : rec.reasonEn}
                          </div>
                        </div>
                        <span className="text-xs bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded">
                          {rec.badge}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 第二行：产品类别选择 - 分级筛选 */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Package className="w-5 h-5 text-blue-500" />
                <span className="font-bold text-white">
                  {isZh ? '第二步：选择产品类别' : 'Step 2: Select Product Category'}
                </span>
              </div>
              
              {/* 第一级：产品大类 */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                {PRODUCT_TYPES.map(type => {
                  const Icon = type.icon;
                  const isSelected = selectedProductType === type.value || currentProductType?.value === type.value;
                  return (
                    <button
                      key={type.value}
                      onClick={() => handleProductTypeSelect(type.value)}
                      className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                        isSelected 
                          ? 'border-blue-500 bg-blue-500/10' 
                          : 'border-gray-600 hover:border-blue-400'
                      }`}
                    >
                      <Icon className={`w-8 h-8 ${isSelected ? 'text-blue-500' : 'text-gray-400'}`} />
                      <div className="font-bold text-white text-center">
                        {isZh ? type.label : type.labelEn}
                      </div>
                      {isSelected && (
                        <CheckCircle className="w-4 h-4 text-blue-500" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* 第二级：具体产品子类 */}
              {selectedProductType && (
                <div className="mt-4 p-4 bg-gray-700 rounded-xl">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-sm text-gray-400">
                      {isZh ? '选择具体产品类型' : 'Select Specific Product Type'}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {PRODUCT_TYPES.find(t => t.value === selectedProductType)?.children.map(cat => (
                      <button
                        key={cat.value}
                        onClick={() => handleCategorySelect(cat.value)}
                        className={`px-4 py-2 rounded-lg border-2 transition-all ${
                          selectedCategory === cat.value 
                            ? 'border-blue-500 bg-blue-500/10' 
                            : 'border-gray-600 hover:border-blue-400'
                        }`}
                      >
                        <span className="text-white text-sm font-medium">
                          {isZh ? cat.label : cat.labelEn}
                        </span>
                        {selectedCategory === cat.value && (
                          <CheckCircle className="w-3 h-3 text-blue-500 inline ml-1" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tab导航 - 第三步：查看结果 */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-purple-500" />
            <span className="font-bold text-white">
              {isZh ? '第三步：选择分析工具查看结果' : 'Step 3: Select Analysis Tool'}
            </span>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              const isDisabled = !hasSelection;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    if (hasSelection) {
                      setActiveTab(tab.id);
                      tracking.click(`tab_${tab.id}`, 'ai_tool');
                      tracking.toolInteraction('analysis_tab', 'switch', { tabId: tab.id, tabName: tab.name });
                    }
                  }}
                  disabled={isDisabled}
                  className={`
                    relative p-4 rounded-xl text-center transition-all duration-300
                    ${isActive 
                      ? `bg-gradient-to-br ${tab.color} text-white shadow-lg scale-105` 
                      : isDisabled
                        ? 'bg-gray-800 border border-gray-700 text-gray-600 cursor-not-allowed opacity-40'
                        : 'bg-gray-800 border border-gray-600 text-gray-300 hover:border-emerald-400 hover:shadow-lg hover:bg-gray-700'
                    }
                  `}
                >
                  <Icon className={`w-6 h-6 mx-auto mb-1 ${isActive ? 'text-white' : isDisabled ? 'text-gray-600' : 'text-gray-400'}`} />
                  <div className={`text-sm font-medium ${isActive ? 'text-white' : isDisabled ? 'text-gray-600' : 'text-gray-300'}`}>
                    {isZh ? tab.name : tab.nameEn}
                  </div>
                  {!isDisabled && !isActive && (
                    <div className="text-xs text-gray-500 mt-1">
                      {isZh ? tab.description : tab.descriptionEn}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
          
          {/* 开始分析按钮 */}
          <div className="mt-6 flex justify-center">
            {isPrefetching ? (
              <div className="flex items-center gap-3 text-sm">
                <RefreshCw className="w-5 h-5 animate-spin text-amber-400" />
                <div className="flex flex-col">
                  <span className="text-amber-400 font-medium">
                    {isZh ? 'AI 正在获取实时数据并做全面分析...' : 'AI is fetching real-time data and performing comprehensive analysis...'}
                  </span>
                  <span className="text-gray-400 text-xs">
                    {isZh 
                      ? '预计需要 50-60秒，请耐心等待...'
                      : 'Estimated 50-60 seconds, please wait...'}
                  </span>
                  <div className="w-48 h-2 bg-gray-700 rounded-full mt-2 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-emerald-500"
                      style={{ 
                        width: `${timeBasedProgress}%`,
                        transition: 'width 1s linear'
                      }}
                    />
                  </div>
                  <span className="text-gray-500 text-xs mt-1">
                    {elapsedTime}s / 60s
                  </span>
                </div>
              </div>
            ) : (
              <button
                onClick={() => {
                  prefetchAllData();
                  tracking.click('start_analysis', 'ai_tool');
                  tracking.toolInteraction('analysis', 'start', {
                    marketId: selectedMarket?.id,
                    marketName: selectedMarket?.name,
                    category: selectedCategory,
                    targetRegion: selectedRegion,
                  });
                }}
                disabled={!hasSelection}
                className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl text-lg font-bold hover:from-emerald-500 hover:to-teal-500 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-3"
              >
                <Zap className="w-5 h-5" />
                {isZh ? '开始分析' : 'Start Analysis'}
              </button>
            )}
          </div>
        </div>

        {/* 内容展示区 */}
        <div className="bg-gray-800 rounded-2xl shadow-lg border border-gray-700 overflow-hidden min-h-[400px]">
          {!hasSelection ? (
            <div className="p-16 text-center">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-700 flex items-center justify-center">
                <Target className="w-10 h-10 text-gray-500" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                {isZh ? '请完成上方选择' : 'Please complete the selections above'}
              </h3>
              <p className="text-gray-400 max-w-md mx-auto">
                {isZh 
                  ? '选择目标市场和产品类别后，即可查看对应的市场分析、成本测算、合规自测等6大分析工具的结果' 
                  : 'Select target market and product category to view market analysis, cost calculation, compliance test and other analysis results'}
              </p>
            </div>
          ) : (
            <>
              {activeTab === 'feasibility' && <FeasibilityAssessment />}
              {activeTab === 'cost' && <Tools />}
              {activeTab === 'compliance' && <ComplianceTest />}
              {activeTab === 'insight' && <MarketInsight />}
              {activeTab === 'channel' && <ChannelMatch />}
              {activeTab === 'risk' && <RiskWarning />}
              {activeTab === 'marketing' && <AIMarketingContent />}
            </>
          )}
        </div>

      </div>
    </section>
  );
}
