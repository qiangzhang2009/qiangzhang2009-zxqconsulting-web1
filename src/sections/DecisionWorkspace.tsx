/**
 * 智能决策工作台 - 顶级智库风格
 * 核心：渐进式问卷、数据可视化、权威感
 * 
 * 设计理念：
 * - 类似麦肯锡/波士顿咨询的年度报告风格
 * - 衬线字体标题 + 无衬线正文
 * - 色彩：深海军蓝 + 炭灰 + 米白 + 古铜金
 * - 大量留白，网格布局
 * - 动画：优雅、克制、缓慢
 */

import { useState, useRef, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  CheckCircle2, 
  Sparkles,
  Building2,
  Target,
  Globe,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  X,
  FileCheck,
  Award,
  Wallet,
  Users,
  AlertCircle
} from 'lucide-react';
import { AI_CONFIG } from '@/config';
import { tracking } from '@/lib/tracking';

// 企业信息字段
const COMPANY_INFO_FIELDS = [
  { id: 'contactName', label: '您的姓名', labelEn: 'Your Name', required: true },
  { id: 'contactPhone', label: '联系电话', labelEn: 'Phone', required: true },
  { id: 'productCategory', label: '产品类型', labelEn: 'Product Category', options: [
    // 保健食品大类
    { value: 'supplement', label: '保健食品', labelEn: 'Health Supplements' },
    { value: 'nutraceutical', label: '功能性食品', labelEn: 'Nutraceuticals' },
    { value: 'vitamin', label: '维生素矿物质', labelEn: 'Vitamins & Minerals' },
    { value: 'probiotic', label: '益生菌产品', labelEn: 'Probiotic Products' },
    { value: 'protein', label: '蛋白质粉', labelEn: 'Protein Powders' },
    { value: 'sports', label: '运动营养品', labelEn: 'Sports Nutrition' },

    // 中医药产品
    { value: 'traditional', label: '中药饮片', labelEn: 'TCM Herbs' },
    { value: 'decoction', label: '中药配方颗粒', labelEn: 'TCM Granules' },
    { value: 'patent', label: '中成药', labelEn: 'Patent TCM' },
    { value: 'tcmdecoction', label: '膏方制剂', labelEn: 'Herbal Decoctions' },
    { value: 'teapills', label: '丸散膏丹', labelEn: 'TCM Pills & Powders' },
    { value: 'tcmexternal', label: '外用膏贴', labelEn: 'TCM Topical Products' },

    // 护肤品类
    { value: 'cosmetic', label: '本草护肤品', labelEn: 'Herbal Skincare' },
    { value: 'skincare', label: '功效性护肤品', labelEn: 'Cosmeceuticals' },
    { value: 'makeup', label: '彩妆产品', labelEn: 'Makeup Products' },
    { value: 'fragrance', label: '香水香氛', labelEn: 'Fragrances' },
    { value: 'haircare', label: '护发产品', labelEn: 'Hair Care Products' },
    { value: 'bodycare', label: '身体护理', labelEn: 'Body Care Products' },

    // 医疗器械/个护
    { value: 'medical', label: '医疗器械', labelEn: 'Medical Devices' },
    { value: 'healthdevice', label: '健康器械', labelEn: 'Health Devices' },
    { value: 'diagnostic', label: '诊断设备', labelEn: 'Diagnostic Equipment' },
    { value: 'therapeutic', label: '治疗设备', labelEn: 'Therapeutic Equipment' },
    { value: 'monitoring', label: '监护设备', labelEn: 'Monitoring Devices' },
    { value: 'disposable', label: '一次性耗材', labelEn: 'Disposable Medical Supplies' },
    { value: 'dental', label: '口腔器械', labelEn: 'Dental Equipment' },

    // 银发经济
    { value: 'elderly', label: '老年营养品', labelEn: 'Elderly Nutrition' },
    { value: 'elderlycare', label: '老年护理用品', labelEn: 'Elderly Care' },
    { value: 'mobility', label: '助行器材', labelEn: 'Mobility Aids' },
    { value: 'hearing', label: '听力辅助', labelEn: 'Hearing Aids' },
    { value: 'vision', label: '视力辅助', labelEn: 'Vision Aids' },

    // 宠物经济
    { value: 'petsupplement', label: '宠物保健品', labelEn: 'Pet Supplements' },
    { value: 'petfood', label: '宠物功能性食品', labelEn: 'Pet Functional Food' },
    { value: 'petcare', label: '宠物护理用品', labelEn: 'Pet Care Products' },
    { value: 'pettoy', label: '宠物玩具', labelEn: 'Pet Toys' },

    // 食品饮料
    { value: 'functionalDrink', label: '功能性饮料', labelEn: 'Functional Beverages' },
    { value: 'healthFood', label: '健康食品', labelEn: 'Health Food' },
    { value: 'organic', label: '有机食品', labelEn: 'Organic Food' },
    { value: 'babyFood', label: '婴幼儿食品', labelEn: 'Baby Food' },
    { value: 'dietary', label: '膳食补充剂', labelEn: 'Dietary Supplements' },

    // 其他
    { value: 'other', label: '其他产品', labelEn: 'Other Products' },
  ]},
  { id: 'targetRegion', label: '目标区域', labelEn: 'Target Region', options: [
    { value: 'east-asia', label: '东亚', labelEn: 'East Asia' },
    { value: 'southeast-asia', label: '东南亚', labelEn: 'Southeast Asia' },
    { value: 'oceania', label: '大洋洲', labelEn: 'Oceania' },
    { value: 'europe', label: '欧洲', labelEn: 'Europe' },
    { value: 'north-america', label: '北美', labelEn: 'North America' },
    { value: 'not-sure', label: '暂不确定', labelEn: 'Not Sure' },
  ]},
];

// 准备度评估维度
const READINESS_DIMENSIONS = [
  { 
    id: 'certification', 
    name: '资质认证', 
    nameEn: 'Certification',
    icon: FileCheck,
    questions: [
      { id: 'gmp', text: '已获得GMP认证', textEn: 'Have GMP' },
      { id: 'iso', text: '已通过ISO认证', textEn: 'Have ISO' },
      { id: 'export', text: '拥有自营出口资质', textEn: 'Export License' },
    ]
  },
  { 
    id: 'product', 
    name: '产品能力', 
    nameEn: 'Product',
    icon: Award,
    questions: [
      { id: 'patent', text: '有知识产权/专利', textEn: 'Have Patents' },
      { id: 'clinical', text: '有临床数据支撑', textEn: 'Clinical Data' },
      { id: 'unique', text: '有独特卖点', textEn: 'Unique Features' },
    ]
  },
  { 
    id: 'financial', 
    name: '资金实力', 
    nameEn: 'Financial',
    icon: Wallet,
    questions: [
      { id: 'budget', text: '预算50万以下', textEn: 'Under 500K' },
      { id: 'budget2', text: '预算50-200万', textEn: '500K-2M' },
      { id: 'budget3', text: '预算200万以上', textEn: 'Over 2M' },
    ]
  },
  { 
    id: 'team', 
    name: '团队能力', 
    nameEn: 'Team',
    icon: Users,
    questions: [
      { id: 'overseas', text: '有海外团队', textEn: 'Overseas Team' },
      { id: 'language', text: '有外语人才', textEn: 'Multilingual' },
      { id: 'experience', text: '有跨境经验', textEn: 'Cross-border Exp' },
    ]
  },
];

type ReadinessQuestion = { id: string; text: string; textEn: string };

// 市场数据
const MARKET_INFO: Record<string, { name: string; flag: string; nameEn: string; tier: string; risk: string; cost: string }> = {
  japan: { name: '日本', flag: '🇯🇵', nameEn: 'Japan', tier: '一线', risk: '低', cost: '$80K-250K' },
  australia: { name: '澳大利亚', flag: '🇦🇺', nameEn: 'Australia', tier: '一线', risk: '低', cost: '$30K-80K' },
  singapore: { name: '新加坡', flag: '🇸🇬', nameEn: 'Singapore', tier: '一线', risk: '低', cost: '$15K-40K' },
  usa: { name: '美国', flag: '🇺🇸', nameEn: 'USA', tier: '一线', risk: '低', cost: '$50K-150K' },
  germany: { name: '德国', flag: '🇩🇪', nameEn: 'Germany', tier: '一线', risk: '低', cost: '$60K-180K' },
  korea: { name: '韩国', flag: '🇰🇷', nameEn: 'South Korea', tier: '二线', risk: '中', cost: '$25K-60K' },
  thailand: { name: '泰国', flag: '🇹🇭', nameEn: 'Thailand', tier: '二线', risk: '中', cost: '$15K-40K' },
  malaysia: { name: '马来西亚', flag: '🇲🇾', nameEn: 'Malaysia', tier: '二线', risk: '低', cost: '$12K-35K' },
  uae: { name: '阿联酋', flag: '🇦🇪', nameEn: 'UAE', tier: '二线', risk: '低', cost: '$20K-50K' },
  hongkong: { name: '中国香港', flag: '🇭🇰', nameEn: 'Hong Kong', tier: '细分', risk: '低', cost: '$8K-25K' },
  taiwan: { name: '中国台湾', flag: '🇹🇼', nameEn: 'Taiwan', tier: '细分', risk: '低', cost: '$12K-35K' },
};

const RISK_LEVELS = {
  low: { label: '低风险', labelEn: 'Low Risk', color: 'text-emerald-700', bg: 'bg-emerald-50' },
  medium: { label: '中等风险', labelEn: 'Medium', color: 'text-amber-700', bg: 'bg-amber-50' },
  high: { label: '较高风险', labelEn: 'High', color: 'text-red-700', bg: 'bg-red-50' },
};

const stripMarkdown = (text: string): string => {
  return text
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/^[-*+]\s+/gm, '')
    .replace(/^\d+\.\s+/gm, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
};

// 进度条组件
const ProgressIndicator = ({ current, total, labels }: { current: number; total: number; labels: string[] }) => {
  return (
    <div className="mb-12">
      <div className="flex items-center justify-between mb-4">
        {Array.from({ length: total }).map((_, i) => (
          <div key={i} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
              i + 1 < current 
                ? 'bg-[#1e3a5f] text-white'
                : i + 1 === current 
                  ? 'bg-[#1e3a5f] text-white'
                  : 'bg-gray-700 text-gray-400'
            }`}>
              {i + 1 < current ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
            </div>
            {i < total - 1 && (
              <div className={`w-24 h-px mx-2 ${i + 1 < current ? 'bg-[#1e3a5f]' : 'bg-gray-700'}`} />
            )}
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between text-xs tracking-wider">
        {labels.map((label, i) => (
          <span key={i} className={i + 1 === current ? 'text-[#1e3a5f] font-medium' : 'text-gray-400'}>
            {label}
          </span>
        ))}
      </div>
    </div>
  );
};

export default function DecisionWorkspace() {
  const { i18n } = useTranslation();
  const sectionRef = useRef<HTMLDivElement>(null);
  const isZh = i18n.language === 'zh';

  // 当前步骤 (1: 企业信息, 2: 准备度, 3: 市场选择)
  const [currentStep, setCurrentStep] = useState(1);

  // 企业信息
  const [companyInfo, setCompanyInfo] = useState({
    contactName: '',
    contactPhone: '',
    productCategory: 'supplement',
    targetRegion: 'not-sure',
  });

  // 准备度数据
  const [readinessData, setReadinessData] = useState<Record<string, Record<string, boolean>>>({
    certification: { gmp: false, iso: false, export: false },
    product: { patent: false, clinical: false, unique: false },
    financial: { budget: false, budget2: false, budget3: false },
    team: { overseas: false, language: false, experience: false },
  });

  // 选中的市场
  const [selectedMarkets, setSelectedMarkets] = useState<string[]>([]);

  // ROI 参数
  const roiParams = {
    investment: 1000000,
    productPrice: 500,
    annualVolume: 10000,
  };

  // AI 分析
  const [aiAnalysis, setAiAnalysis] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // 计算准备度得分
  const readinessScore = useMemo(() => {
    let score = 0;
    const certCount = Object.values(readinessData.certification || {}).filter(Boolean).length;
    const prodCount = Object.values(readinessData.product || {}).filter(Boolean).length;
    const teamCount = Object.values(readinessData.team || {}).filter(Boolean).length;
    const budgetCount = Object.values(readinessData.financial || {}).filter(Boolean).length;
    
    score += certCount * 8;
    score += prodCount * 8;
    score += teamCount * 8;
    score += budgetCount * 10;
    
    return Math.min(score, 100);
  }, [readinessData]);

  // 准备度等级
  const readinessLevel = useMemo(() => {
    if (readinessScore >= 80) return { label: '优秀', labelEn: 'Excellent', color: 'text-emerald-700', bg: 'bg-emerald-50' };
    if (readinessScore >= 60) return { label: '良好', labelEn: 'Good', color: 'text-blue-700', bg: 'bg-blue-50' };
    if (readinessScore >= 40) return { label: '一般', labelEn: 'Average', color: 'text-amber-700', bg: 'bg-amber-50' };
    return { label: '需提升', labelEn: 'Needs Work', color: 'text-red-700', bg: 'bg-red-50' };
  }, [readinessScore]);

  // 推荐市场
  const recommendedMarkets = useMemo(() => {
    if (readinessScore >= 70) return ['japan', 'australia', 'singapore', 'germany', 'usa'];
    if (readinessScore >= 50) return ['singapore', 'thailand', 'malaysia', 'korea', 'uae'];
    return ['hongkong', 'taiwan', 'malaysia', 'thailand', 'uae'];
  }, [readinessScore]);

  // ROI 计算
  const roiResult = useMemo(() => {
    const costMin = selectedMarkets.length * 50000;
    const costMax = selectedMarkets.length * 150000;
    const avgCost = (costMin + costMax) / 2;
    const revenue = roiParams.productPrice * roiParams.annualVolume;
    const profit = revenue - avgCost;
    const roi = avgCost > 0 ? ((revenue - avgCost) / avgCost) * 100 : 0;
    return { revenue, avgCost, profit, roi };
  }, [selectedMarkets.length, roiParams.annualVolume, roiParams.productPrice]);

  // 风险评估
  const riskLevel = useMemo(() => {
    if (selectedMarkets.length === 0) return null;
    const avgRisk = selectedMarkets.reduce((sum, m) => {
      const info = MARKET_INFO[m];
      if (info?.risk === '低') return sum + 1;
      if (info?.risk === '中') return sum + 2;
      return sum + 3;
    }, 0) / selectedMarkets.length;
    
    if (avgRisk <= 1.3) return RISK_LEVELS.low;
    if (avgRisk <= 2) return RISK_LEVELS.medium;
    return RISK_LEVELS.high;
  }, [selectedMarkets]);

  // AI 分析
  const runAIAnalysis = async () => {
    tracking.toolInteraction('Decision AI', 'analysis');
    setIsAnalyzing(true);
    
    const prompt = `作为中医药产品出海专家，请为准备度得分${readinessScore}分的企业分析：1）推荐的出海市场及理由；2）需要重点准备的资质和材料；3）预计投资回报周期。请用简洁专业语言，不需要Markdown格式。`;

    try {
      const response = await fetch(`${AI_CONFIG.apiUrl}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // 使用 DeepSeek 兼容的模型名称
          model: 'deepseek-chat',
          messages: [
            { role: 'system', content: '你是中医药产品出海咨询专家，请用专业但易懂的语言回答。重要：请不要使用Markdown符号。涉及台湾必须说"中国台湾"，香港说"中国香港"。' },
            { role: 'user', content: prompt }
          ],
          max_tokens: 1500,
          temperature: 0.7,
        }),
      });

      const data = await response.json();
      let content = data.choices?.[0]?.message?.content || '抱歉，分析服务暂时不可用。';
      content = stripMarkdown(content);
      setAiAnalysis(content);
    } catch {
      setAiAnalysis('抱歉，AI分析服务暂时不可用。');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const toggleMarket = (marketId: string) => {
    setSelectedMarkets(prev => 
      prev.includes(marketId) 
        ? prev.filter(m => m !== marketId)
        : [...prev, marketId]
    );
  };

  const goToNextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const goToPrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceed = () => {
    if (currentStep === 1) {
      return companyInfo.contactName.trim() !== '' && companyInfo.contactPhone.trim() !== '';
    }
    if (currentStep === 2) {
      return readinessScore > 0;
    }
    return true;
  };

  return (
    <section ref={sectionRef} id="decision-workspace" className="py-24 bg-gray-900">
      <div className="max-w-4xl mx-auto px-6">
        
        {/* 标题 */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-px h-6 bg-[#1e3a5f]" />
            <span className="text-xs tracking-[0.2em] text-gray-400 uppercase">
              {isZh ? '决策支持系统' : 'Decision Support System'}
            </span>
          </div>
          <h2 className="text-4xl font-serif text-white mb-4 leading-tight">
            {isZh ? '企业出海可行性评估' : 'Export Readiness Assessment'}
          </h2>
          <p className="text-lg text-gray-400 font-light max-w-xl">
            {isZh 
              ? '基于多维度数据的企业出海成功率评估与策略建议' 
              : 'Multi-dimensional assessment of your export readiness with strategic recommendations'}
          </p>
        </div>

        {/* 进度指示器 */}
        <ProgressIndicator 
          current={currentStep} 
          total={3} 
          labels={[isZh ? '企业信息' : 'Company Info', isZh ? '准备度评估' : 'Readiness', isZh ? '市场选择' : 'Market Selection']} 
        />

        {/* 主要内容卡片 */}
        <div className="bg-gray-800 border border-gray-700 p-10">
          
          {/* Step 1: 企业信息 */}
          {currentStep === 1 && (
            <div className="animate-fadeIn">
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                  <Building2 className="w-5 h-5 text-[#1e3a5f]" />
                  <h3 className="text-xl font-serif text-white">
                    {isZh ? '企业基础信息' : 'Company Information'}
                  </h3>
                </div>
                <p className="text-gray-400 font-light">
                  {isZh ? '请提供您的企业基本信息，以便我们为您提供更精准的评估' : 'Please provide your company information for a more accurate assessment'}
                </p>
              </div>
              
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs tracking-wider text-gray-400 uppercase mb-2">
                      {isZh ? '您的姓名' : 'Your Name'} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={companyInfo.contactName}
                      onChange={(e) => setCompanyInfo(prev => ({ ...prev, contactName: e.target.value }))}
                      placeholder={isZh ? '请输入姓名' : 'Enter your name'}
                      className="w-full px-4 py-3 border-b border-gray-600 focus:border-[#1e3a5f] focus:outline-none bg-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs tracking-wider text-gray-400 uppercase mb-2">
                      {isZh ? '联系电话' : 'Phone'} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={companyInfo.contactPhone}
                      onChange={(e) => setCompanyInfo(prev => ({ ...prev, contactPhone: e.target.value }))}
                      placeholder={isZh ? '请输入电话' : 'Enter phone number'}
                      className="w-full px-4 py-3 border-b border-gray-600 focus:border-[#1e3a5f] focus:outline-none bg-transparent"
                    />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs tracking-wider text-gray-400 uppercase mb-2">
                      {isZh ? '产品类型' : 'Product Category'}
                    </label>
                    <select
                      value={companyInfo.productCategory}
                      onChange={(e) => setCompanyInfo(prev => ({ ...prev, productCategory: e.target.value }))}
                      className="w-full px-4 py-3 border-b border-gray-600 focus:border-[#1e3a5f] focus:outline-none bg-transparent"
                    >
                      {COMPANY_INFO_FIELDS.find(f => f.id === 'productCategory')?.options?.map(opt => (
                        <option key={opt.value} value={opt.value}>
                          {isZh ? opt.label : opt.labelEn}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs tracking-wider text-gray-400 uppercase mb-2">
                      {isZh ? '目标区域' : 'Target Region'}
                    </label>
                    <select
                      value={companyInfo.targetRegion}
                      onChange={(e) => setCompanyInfo(prev => ({ ...prev, targetRegion: e.target.value }))}
                      className="w-full px-4 py-3 border-b border-gray-600 focus:border-[#1e3a5f] focus:outline-none bg-transparent"
                    >
                      {COMPANY_INFO_FIELDS.find(f => f.id === 'targetRegion')?.options?.map(opt => (
                        <option key={opt.value} value={opt.value}>
                          {isZh ? opt.label : opt.labelEn}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: 准备度评估 */}
          {currentStep === 2 && (
            <div className="animate-fadeIn">
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                  <Target className="w-5 h-5 text-[#1e3a5f]" />
                  <h3 className="text-xl font-serif text-white">
                    {isZh ? '企业准备度评估' : 'Enterprise Readiness'}
                  </h3>
                </div>
                <p className="text-gray-400 font-light">
                  {isZh ? '勾选符合您企业情况的选项，以便我们评估您的出海准备程度' : 'Check the options that apply to your company to assess your export readiness'}
                </p>
              </div>

              {/* 当前得分 */}
              <div className="bg-gray-700 p-6 mb-8 flex items-center justify-between">
                <div>
                  <div className="text-xs tracking-wider text-gray-400 uppercase mb-1">
                    {isZh ? '当前得分' : 'Current Score'}
                  </div>
                  <div className="text-4xl font-serif text-[#1e3a5f]">{readinessScore}</div>
                </div>
                <div className={`px-4 py-2 ${readinessLevel.bg} ${readinessLevel.color} text-sm font-medium`}>
                  {isZh ? readinessLevel.label : readinessLevel.labelEn}
                </div>
              </div>

              <div className="space-y-6">
                {READINESS_DIMENSIONS.map(dim => {
                  const Icon = dim.icon;
                  return (
                    <div key={dim.id} className="border border-gray-700 p-6">
                      <h4 className="font-medium text-gray-800 mb-4 flex items-center gap-2">
                        <Icon className="w-4 h-4 text-[#1e3a5f]" />
                        {isZh ? dim.name : dim.nameEn}
                      </h4>
                      <div className="grid sm:grid-cols-3 gap-3">
                        {dim.questions.map((q: ReadinessQuestion) => (
                          <label 
                            key={q.id} 
                            className="flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-700 transition-colors"
                          >
                            <input
                              type="checkbox"
                              checked={readinessData[dim.id]?.[q.id] === true}
                              onChange={(e) => {
                                setReadinessData(prev => ({
                                  ...prev,
                                  [dim.id]: { ...(prev[dim.id] || {}), [q.id]: e.target.checked }
                                }));
                              }}
                              className="w-4 h-4 text-[#1e3a5f] border-gray-300 focus:ring-[#1e3a5f]"
                            />
                            <span className="text-sm text-gray-300">
                              {isZh ? q.text : q.textEn}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 3: 市场选择 */}
          {currentStep === 3 && (
            <div className="animate-fadeIn">
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                  <Globe className="w-5 h-5 text-[#1e3a5f]" />
                  <h3 className="text-xl font-serif text-white">
                    {isZh ? '目标市场选择' : 'Target Market Selection'}
                  </h3>
                </div>
                <p className="text-gray-400 font-light">
                  {selectedMarkets.length} {isZh ? '个市场已选' : 'markets selected'}
                </p>
              </div>

              {/* 推荐提示 */}
              {readinessScore > 0 && (
                <div className="bg-amber-50 border-l-4 border-amber-300 p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-medium text-amber-900 mb-1">
                        {isZh ? '基于您的准备度，推荐以下市场' : 'Based on your readiness, we recommend'}
                      </div>
                      <div className="text-sm text-amber-800">
                        {recommendedMarkets.slice(0, 3).map(m => MARKET_INFO[m]?.name).join(' · ')}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 市场网格 */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
                {Object.entries(MARKET_INFO).map(([id, market]) => {
                  const isSelected = selectedMarkets.includes(id);
                  return (
                    <button
                      key={id}
                      onClick={() => toggleMarket(id)}
                      className={`p-4 text-left border transition-all ${
                        isSelected 
                          ? 'border-[#1e3a5f] bg-[#1e3a5f]/5' 
                          : 'border-gray-600 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xl">{market.flag}</span>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-[#1e3a5f]" />}
                      </div>
                      <div className="font-medium text-white text-sm">{market.name}</div>
                      <div className="text-xs text-gray-400 mt-1">{market.tier} · {market.cost}</div>
                    </button>
                  );
                })}
              </div>

              {/* 选中市场概览 */}
              {selectedMarkets.length > 0 && (
                <div className="bg-gray-700 p-6">
                  <div className="grid grid-cols-3 gap-8 text-center">
                    <div>
                      <div className="text-xs tracking-wider text-gray-400 uppercase mb-2">
                        {isZh ? '预估成本' : 'Est. Cost'}
                      </div>
                      <div className="text-2xl font-serif text-[#1e3a5f]">
                        ${((selectedMarkets.length * 100000) / 10000).toFixed(0)}万
                      </div>
                    </div>
                    <div>
                      <div className="text-xs tracking-wider text-gray-400 uppercase mb-2">
                        {isZh ? '综合风险' : 'Risk'}
                      </div>
                      <div className={`text-2xl font-serif ${riskLevel?.color}`}>
                        {isZh ? riskLevel?.label : riskLevel?.labelEn}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs tracking-wider text-gray-400 uppercase mb-2">
                        {isZh ? '预计回报' : 'Est. ROI'}
                      </div>
                      <div className="text-2xl font-serif text-emerald-700">
                        {roiResult.roi.toFixed(0)}%
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 底部按钮 */}
          <div className="mt-10 pt-10 border-t border-gray-700 flex gap-4">
            {currentStep > 1 ? (
              <button
                onClick={goToPrevStep}
                className="flex-1 py-4 border border-gray-600 text-gray-300 font-medium hover:bg-gray-700 flex items-center justify-center gap-2 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                {isZh ? '上一步' : 'Previous'}
              </button>
            ) : (
              <button
                onClick={() => {
                  setSelectedMarkets([]);
                  setCompanyInfo({ contactName: '', contactPhone: '', productCategory: 'supplement', targetRegion: 'not-sure' });
                  setReadinessData({ certification: {}, product: {}, financial: {}, team: {} });
                }}
                className="flex-1 py-4 border border-gray-600 text-gray-400 font-medium hover:bg-gray-700 flex items-center justify-center gap-2 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                {isZh ? '重置' : 'Reset'}
              </button>
            )}
            
            {currentStep < 3 ? (
              <button
                onClick={goToNextStep}
                disabled={!canProceed()}
                className="flex-[2] py-4 bg-[#1e3a5f] text-white font-medium hover:bg-[#152a45] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
              >
                {isZh ? '下一步' : 'Next'}
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={runAIAnalysis}
                disabled={isAnalyzing || selectedMarkets.length === 0}
                className="flex-[2] py-4 bg-[#1e3a5f] text-white font-medium hover:bg-[#152a45] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
              >
                <Sparkles className="w-4 h-4" />
                {isAnalyzing 
                  ? (isZh ? '分析中...' : 'Analyzing...') 
                  : (isZh ? '生成分析报告' : 'Generate Report')}
              </button>
            )}
          </div>
        </div>

        {/* AI 分析结果 */}
        {aiAnalysis && (
          <div className="mt-6 bg-[#1e3a5f] text-white p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <h4 className="text-lg font-serif">{isZh ? 'AI 智能分析报告' : 'AI Intelligence Report'}</h4>
              </div>
              <button onClick={() => setAiAnalysis('')} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="text-gray-300 font-light leading-relaxed whitespace-pre-wrap">
              {aiAnalysis}
            </div>
          </div>
        )}

      </div>
    </section>
  );
}
