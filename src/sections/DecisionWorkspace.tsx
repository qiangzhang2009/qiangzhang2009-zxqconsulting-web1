/**
 * 智能决策工作台
 * 包含：企业准备度评估、市场优选推荐、准入路径分析、ROI与风险分析
 */

import { useState, useRef, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { 
  CheckCircle, 
  ChevronRight, 
  Target, 
  Clock, 
  DollarSign, 
  AlertTriangle,
  Sparkles,
  Building2,
  Globe,
  Route,
  BarChart3,
  ArrowRight,
  RefreshCw,
  Info
} from 'lucide-react';
import { DEEPSEEK_CONFIG, AI_NAME_REPLACEMENTS } from '@/config';

gsap.registerPlugin(ScrollTrigger);

// 步骤配置
const STEPS = [
  { id: 'readiness', name: '企业准备度', nameEn: 'Readiness', icon: Building2 },
  { id: 'market', name: '市场优选', nameEn: 'Market Select', icon: Globe },
  { id: 'path', name: '准入路径', nameEn: 'Access Path', icon: Route },
  { id: 'roi', name: 'ROI与风险', nameEn: 'ROI & Risk', icon: BarChart3 },
];

// 企业准备度评估维度
const READINESS_DIMENSIONS = [
  { 
    id: 'certification', 
    name: '资质认证', 
    nameEn: 'Certification',
    questions: [
      { id: 'gmp', text: '是否已获得GMP认证？', textEn: 'Do you have GMP certification?' },
      { id: 'iso', text: '是否通过ISO系列认证？', textEn: 'Do you have ISO series certification?' },
      { id: 'export', text: '是否有出口资质？', textEn: 'Do you have export qualification?' },
    ]
  },
  { 
    id: 'product', 
    name: '产品能力', 
    nameEn: 'Product Capability',
    questions: [
      { id: 'patent', text: '产品是否有专利？', textEn: 'Do you have product patents?' },
      { id: 'clinical', text: '是否有临床试验数据？', textEn: 'Do you have clinical trial data?' },
      { id: 'standard', text: '是否符合国际标准？', textEn: 'Does it meet international standards?' },
    ]
  },
  { 
    id: 'financial', 
    name: '资金实力', 
    nameEn: 'Financial Strength',
    questions: [
      { id: 'budget', text: '预算范围？', textEn: 'What is your budget range?' },
      { id: 'timeline', text: '期望的回本周期？', textEn: 'Expected payback period?' },
    ]
  },
  { 
    id: 'team', 
    name: '团队能力', 
    nameEn: 'Team Capability',
    questions: [
      { id: 'overseas', text: '是否有海外运营团队？', textEn: 'Do you have an overseas operations team?' },
      { id: 'language', text: '是否有外语人才？', textEn: 'Do you have multilingual talent?' },
    ]
  },
];

// 市场信息映射
const MARKET_INFO: Record<string, { name: string; flag: string; nameEn: string; tier?: string; chinesePop?: number }> = {
  japan: { name: '日本', flag: '🇯🇵', nameEn: 'Japan', tier: '一线', chinesePop: 1.2 },
  australia: { name: '澳大利亚', flag: '🇦🇺', nameEn: 'Australia', tier: '一线', chinesePop: 1.4 },
  usa: { name: '美国', flag: '🇺🇸', nameEn: 'USA', tier: '一线', chinesePop: 5.5 },
  singapore: { name: '新加坡', flag: '🇸🇬', nameEn: 'Singapore', tier: '一线', chinesePop: 2.8 },
  germany: { name: '德国', flag: '🇩🇪', nameEn: 'Germany', tier: '一线', chinesePop: 0.2 },
  uk: { name: '英国', flag: '🇬🇧', nameEn: 'UK', tier: '一线', chinesePop: 0.5 },
  korea: { name: '韩国', flag: '🇰🇷', nameEn: 'South Korea', tier: '二线', chinesePop: 1.1 },
  thailand: { name: '泰国', flag: '🇹🇭', nameEn: 'Thailand', tier: '二线', chinesePop: 0.9 },
  malaysia: { name: '马来西亚', flag: '🇲🇾', nameEn: 'Malaysia', tier: '二线', chinesePop: 0.8 },
  indonesia: { name: '印度尼西亚', flag: '🇮🇩', nameEn: 'Indonesia', tier: '二线', chinesePop: 0.3 },
  vietnam: { name: '越南', flag: '🇻🇳', nameEn: 'Vietnam', tier: '二线', chinesePop: 0.1 },
  uae: { name: '阿联酋', flag: '🇦🇪', nameEn: 'UAE', tier: '二线', chinesePop: 0.4 },
  saudi: { name: '沙特阿拉伯', flag: '🇸🇦', nameEn: 'Saudi Arabia', tier: '二线', chinesePop: 0.05 },
  india: { name: '印度', flag: '🇮🇳', nameEn: 'India', tier: '二线', chinesePop: 0.02 },
  brazil: { name: '巴西', flag: '🇧🇷', nameEn: 'Brazil', tier: '二线', chinesePop: 0.05 },
  newzealand: { name: '新西兰', flag: '🇳🇿', nameEn: 'New Zealand', tier: '一线', chinesePop: 0.25 },
  taiwan: { name: '中国台湾', flag: '🇹🇼', nameEn: 'Taiwan', tier: '细分', chinesePop: 23 },
  hongkong: { name: '中国香港', flag: '🇭🇰', nameEn: 'Hong Kong', tier: '细分', chinesePop: 7.5 },
  canada: { name: '加拿大', flag: '🇨🇦', nameEn: 'Canada', tier: '一线', chinesePop: 1.8 },
};

// 成本估算数据
const COST_ESTIMATES: Record<string, { name: string; cost: { min: number; max: number }; timeline: string }> = {
  japan: { name: '日本', cost: { min: 80000, max: 250000 }, timeline: '12-24月' },
  australia: { name: '澳大利亚', cost: { min: 30000, max: 80000 }, timeline: '6-12月' },
  usa: { name: '美国', cost: { min: 50000, max: 150000 }, timeline: '12-18月' },
  singapore: { name: '新加坡', cost: { min: 20000, max: 50000 }, timeline: '3-6月' },
  germany: { name: '德国', cost: { min: 60000, max: 180000 }, timeline: '12-24月' },
  uk: { name: '英国', cost: { min: 40000, max: 120000 }, timeline: '9-18月' },
  korea: { name: '韩国', cost: { min: 25000, max: 60000 }, timeline: '6-12月' },
  thailand: { name: '泰国', cost: { min: 15000, max: 40000 }, timeline: '4-8月' },
  malaysia: { name: '马来西亚', cost: { min: 12000, max: 35000 }, timeline: '3-6月' },
  indonesia: { name: '印度尼西亚', cost: { min: 10000, max: 30000 }, timeline: '4-8月' },
  vietnam: { name: '越南', cost: { min: 8000, max: 25000 }, timeline: '3-6月' },
  uae: { name: '阿联酋', cost: { min: 20000, max: 50000 }, timeline: '4-8月' },
  saudi: { name: '沙特阿拉伯', cost: { min: 18000, max: 45000 }, timeline: '6-10月' },
  india: { name: '印度', cost: { min: 10000, max: 30000 }, timeline: '6-12月' },
  brazil: { name: '巴西', cost: { min: 20000, max: 60000 }, timeline: '8-14月' },
  newzealand: { name: '新西兰', cost: { min: 25000, max: 60000 }, timeline: '6-10月' },
  taiwan: { name: '中国台湾', cost: { min: 15000, max: 40000 }, timeline: '4-8月' },
  hongkong: { name: '中国香港', cost: { min: 10000, max: 30000 }, timeline: '2-4月' },
  canada: { name: '加拿大', cost: { min: 35000, max: 90000 }, timeline: '8-14月' },
};

// 风险等级评估
const RISK_LEVELS = {
  low: { label: '低风险', labelEn: 'Low Risk', color: 'text-green-600', bg: 'bg-green-100' },
  medium: { label: '中等风险', labelEn: 'Medium Risk', color: 'text-yellow-600', bg: 'bg-yellow-100' },
  high: { label: '较高风险', labelEn: 'High Risk', color: 'text-orange-600', bg: 'bg-orange-100' },
  veryHigh: { label: '高风险', labelEn: 'Very High Risk', color: 'text-red-600', bg: 'bg-red-100' },
};

export default function DecisionWorkspace() {
  const { i18n } = useTranslation();
  const sectionRef = useRef<HTMLDivElement>(null);
  const isZh = i18n.language === 'zh';

  // 当前步骤
  const [currentStep, setCurrentStep] = useState('readiness');
  
  // 企业准备度数据
  const [readinessData, setReadinessData] = useState<Record<string, Record<string, boolean | string>>>({
    certification: { gmp: false, iso: false, export: false },
    product: { patent: false, clinical: false, standard: false },
    financial: { budget: 'medium', timeline: 'medium' },
    team: { overseas: false, language: false },
  });

  // 选择的市场
  const [selectedMarkets, setSelectedMarkets] = useState<string[]>([]);
  
  // ROI计算参数
  const [roiParams, setRoiParams] = useState({
    investment: 100000,
    productPrice: 50,
    annualVolume: 10000,
    productCategory: 'supplement',
  });

  // AI分析结果
  const [aiAnalysis, setAiAnalysis] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // 计算准备度得分
  const readinessScore = useMemo(() => {
    let score = 0;
    let total = 0;
    
    // 资质认证 (30分)
    if (readinessData.certification.gmp) score += 10;
    if (readinessData.certification.iso) score += 10;
    if (readinessData.certification.export) score += 10;
    total += 30;

    // 产品能力 (30分)
    if (readinessData.product.patent) score += 10;
    if (readinessData.product.clinical) score += 10;
    if (readinessData.product.standard) score += 10;
    total += 30;

    // 资金实力 (20分)
    if (readinessData.financial.budget === 'high') score += 15;
    else if (readinessData.financial.budget === 'medium') score += 10;
    else score += 5;
    total += 20;

    // 团队能力 (20分)
    if (readinessData.team.overseas) score += 10;
    if (readinessData.team.language) score += 10;
    total += 20;

    return Math.round((score / total) * 100);
  }, [readinessData]);

  // 推荐市场
  const recommendedMarkets = useMemo(() => {
    if (readinessScore >= 80) {
      return ['japan', 'usa', 'germany', 'australia', 'singapore'];
    } else if (readinessScore >= 60) {
      return ['australia', 'singapore', 'korea', 'thailand', 'malaysia'];
    } else if (readinessScore >= 40) {
      return ['thailand', 'malaysia', 'indonesia', 'vietnam', 'uae'];
    } else {
      return ['hongkong', 'taiwan', 'singapore', 'malaysia', 'uae'];
    }
  }, [readinessScore]);

  // 计算ROI
  const roiResult = useMemo(() => {
    const costMin = selectedMarkets.reduce((sum, m) => sum + (COST_ESTIMATES[m]?.cost.min || 0), 0);
    const costMax = selectedMarkets.reduce((sum, m) => sum + (COST_ESTIMATES[m]?.cost.max || 0), 0);
    const avgCost = (costMin + costMax) / 2;
    
    const revenue = roiParams.productPrice * roiParams.annualVolume;
    const profitMin = revenue - costMax;
    const profitMax = revenue - costMin;
    const roiMin = avgCost > 0 ? ((revenue - costMax) / costMax) * 100 : 0;
    const roiMax = avgCost > 0 ? ((revenue - costMin) / costMin) * 100 : 0;

    return { revenue, avgCost, profitMin, profitMax, roiMin, roiMax };
  }, [selectedMarkets, roiParams]);

  // 风险评估
  const riskAssessment = useMemo(() => {
    if (selectedMarkets.length === 0) return null;
    
    let riskScore = 0;
    let marketCount = 0;
    
    selectedMarkets.forEach(m => {
      const market = MARKET_INFO[m];
      const cost = COST_ESTIMATES[m];
      if (!market || !cost) return;
      
      marketCount++;
      
      // 市场规模风险
      if (market.tier === '一线') riskScore += 2;
      else if (market.tier === '二线') riskScore += 3;
      else riskScore += 4;
      
      // 成本风险
      if (cost.cost.max > 150000) riskScore += 3;
      else if (cost.cost.max > 50000) riskScore += 2;
      else riskScore += 1;
    });
    
    const avgRisk = riskScore / marketCount;
    if (avgRisk <= 2) return RISK_LEVELS.low;
    if (avgRisk <= 3) return RISK_LEVELS.medium;
    if (avgRisk <= 4) return RISK_LEVELS.high;
    return RISK_LEVELS.veryHigh;
  }, [selectedMarkets]);

  // 运行AI分析
  const runAIAnalysis = async (type: string) => {
    setIsAnalyzing(true);
    
    let prompt = '';
    if (type === 'market') {
      prompt = `作为中医药产品出海专家，请根据企业准备度得分${readinessScore}分，推荐最适合的目标市场，并分析每个市场的优劣势。`;
    } else if (type === 'path') {
      const markets = selectedMarkets.map(m => MARKET_INFO[m]?.name).join('、');
      prompt = `作为中医药产品出海专家，请分析中医药产品进入${markets}市场的准入路径、政策要求、审批流程和时间节点。`;
    } else if (type === 'roi') {
      const markets = selectedMarkets.map(m => MARKET_INFO[m]?.name).join('、');
      prompt = `作为中医药产品出海专家，请分析投资${roiParams.investment}美元进入${markets}市场的投资回报预期和风险评估。`;
    } else {
      prompt = `作为中医药产品出海专家，请对准备度得分${readinessScore}分的企业给出出海建议和改进方向。`;
    }

    try {
      const response = await fetch(`${DEEPSEEK_CONFIG.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${DEEPSEEK_CONFIG.apiKey}`,
        },
        body: JSON.stringify({
          model: DEEPSEEK_CONFIG.model,
          messages: [
            { role: 'system', content: '你是中医药产品出海咨询专家，请用专业但易懂的语言回答用户问题。注意：在所有回复中，涉及台湾地区时必须表述为"中国台湾"，涉及香港地区时必须表述为"中国香港"。' },
            { role: 'user', content: prompt }
          ],
          max_tokens: 1000,
          temperature: 0.7,
        }),
      });

      const data = await response.json();
      let content = data.choices?.[0]?.message?.content || '抱歉，分析服务暂时不可用。';
      
      Object.entries(AI_NAME_REPLACEMENTS).forEach(([key, value]) => {
        content = content.replace(new RegExp(key, 'gi'), value);
      });
      
      setAiAnalysis(content);
    } catch (error) {
      setAiAnalysis('抱歉，AI分析服务暂时不可用。请稍后再试。');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // 切换市场选择
  const toggleMarket = (marketId: string) => {
    setSelectedMarkets(prev => 
      prev.includes(marketId) 
        ? prev.filter(m => m !== marketId)
        : [...prev, marketId]
    );
  };

  // 获取步骤索引
  const currentStepIndex = STEPS.findIndex(s => s.id === currentStep);

  // 自动滚动到当前步骤
  useEffect(() => {
    if (sectionRef.current) {
      gsap.fromTo(sectionRef.current, 
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5 }
      );
    }
  }, [currentStep]);

  // 渲染星星评分
  const renderStars = (score: number) => {
    const fullStars = Math.floor(score / 20);
    const hasHalf = score % 20 >= 10;
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className={`w-3 h-3 rounded-full ${
              i < fullStars ? 'bg-emerald-500' :
              i === fullStars && hasHalf ? 'bg-emerald-300' :
              'bg-gray-200'
            }`}
          />
        ))}
        <span className="ml-2 text-emerald-600 font-semibold">{score}分</span>
      </div>
    );
  };

  return (
    <section ref={sectionRef} id="decision-workspace" className="py-16 bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-7xl mx-auto px-4">
        
        {/* 页面标题 */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-slate-800 mb-2">
            {isZh ? '智能决策工作台' : 'Smart Decision Workspace'}
          </h2>
          <p className="text-slate-600">
            {isZh ? '一步步引导您做出最佳出海决策' : 'Step-by-step guidance for your best export decision'}
          </p>
        </div>

        {/* 顶部步骤导航 */}
        <div className="mb-10">
          <div className="flex items-center justify-between bg-white rounded-2xl shadow-sm p-2">
            {STEPS.map((step, index) => {
              const Icon = step.icon;
              const isActive = step.id === currentStep;
              const isCompleted = STEPS.findIndex(s => s.id === currentStep) > index;
              
              return (
                <button
                  key={step.id}
                  onClick={() => setCurrentStep(step.id)}
                  className={`flex-1 flex items-center gap-2 px-4 py-3 rounded-xl transition-all ${
                    isActive 
                      ? 'bg-emerald-500 text-white shadow-md' 
                      : isCompleted 
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    isActive ? 'bg-white/20' : isCompleted ? 'bg-emerald-500 text-white' : 'bg-slate-100'
                  }`}>
                    {isCompleted ? <CheckCircle className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                  </div>
                  <span className="font-medium text-sm hidden sm:block">
                    {isZh ? step.name : step.nameEn}
                  </span>
                  {index < STEPS.length - 1 && (
                    <ChevronRight className={`w-4 h-4 ml-auto ${isActive ? 'text-white/60' : 'text-slate-300'}`} />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* 主内容区：左侧内容 + 右侧摘要 */}
        <div className="grid lg:grid-cols-3 gap-6">
          
          {/* 左侧主内容区 */}
          <div className="lg:col-span-2">
            
            {/* 步骤1: 企业准备度评估 */}
            {currentStep === 'readiness' && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-slate-800">{isZh ? '企业准备度评估' : 'Enterprise Readiness Assessment'}</h3>
                    <p className="text-slate-500 text-sm mt-1">
                      {isZh ? '评估您的企业是否准备好进入海外市场' : 'Assess if your enterprise is ready for overseas markets'}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-slate-500">{isZh ? '准备度得分' : 'Readiness Score'}</div>
                    {renderStars(readinessScore)}
                  </div>
                </div>

                {/* 准备度维度 */}
                <div className="space-y-6">
                  {READINESS_DIMENSIONS.map(dim => (
                    <div key={dim.id} className="border border-slate-200 rounded-xl p-4">
                      <h4 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
                        <Target className="w-4 h-4 text-emerald-500" />
                        {isZh ? dim.name : dim.nameEn}
                      </h4>
                      <div className="grid sm:grid-cols-2 gap-3">
                        {dim.questions.map(q => (
                          <label 
                            key={q.id} 
                            className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors"
                          >
                            <input
                              type="checkbox"
                              checked={dim.id === 'financial' || dim.id === 'team' 
                                ? (dim.id === 'financial' 
                                    ? (readinessData.financial as any)[q.id] === true
                                    : (readinessData.team as any)[q.id] === true)
                                : (readinessData[dim.id as keyof typeof readinessData] as any)?.[q.id] || false
                              }
                              onChange={(e) => {
                                if (dim.id === 'financial') {
                                  setReadinessData(prev => ({
                                    ...prev,
                                    financial: { ...prev.financial, [q.id]: e.target.checked }
                                  }));
                                } else if (dim.id === 'team') {
                                  setReadinessData(prev => ({
                                    ...prev,
                                    team: { ...prev.team, [q.id]: e.target.checked }
                                  }));
                                } else {
                                  setReadinessData(prev => ({
                                    ...prev,
                                    [dim.id]: { ...prev[dim.id as keyof typeof prev], [q.id]: e.target.checked }
                                  }));
                                }
                              }}
                              className="w-4 h-4 text-emerald-500 rounded focus:ring-emerald-500"
                            />
                            <span className="text-sm text-slate-700">
                              {isZh ? q.text : q.textEn}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* AI建议按钮 */}
                <button
                  onClick={() => runAIAnalysis('readiness')}
                  disabled={isAnalyzing}
                  className="mt-6 w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-medium flex items-center justify-center gap-2 hover:from-emerald-600 hover:to-teal-600 disabled:opacity-50"
                >
                  <Sparkles className="w-5 h-5" />
                  {isAnalyzing ? (isZh ? '分析中...' : 'Analyzing...') : (isZh ? '获取AI改进建议' : 'Get AI Improvement Suggestions')}
                </button>
              </div>
            )}

            {/* 步骤2: 市场优选 */}
            {currentStep === 'market' && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-slate-800">{isZh ? '市场优选推荐' : 'Market Recommendation'}</h3>
                    <p className="text-slate-500 text-sm mt-1">
                      {isZh ? '基于您的准备度，推荐最适合的市场' : 'Based on your readiness, recommend the best markets'}
                    </p>
                  </div>
                  <div className="text-sm text-emerald-600 font-medium">
                    {isZh ? '推荐市场' : 'Recommended'}: {recommendedMarkets.length}
                  </div>
                </div>

                {/* 推荐市场列表 */}
                <div className="mb-6">
                  <h4 className="font-medium text-slate-700 mb-3 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    {isZh ? '根据您的准备度得分推荐的优选市场' : 'Recommended markets based on your readiness score'}
                  </h4>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {recommendedMarkets.map(m => {
                      const market = MARKET_INFO[m];
                      const isSelected = selectedMarkets.includes(m);
                      return (
                        <button
                          key={m}
                          onClick={() => toggleMarket(m)}
                          className={`p-4 rounded-xl border-2 transition-all text-left ${
                            isSelected 
                              ? 'border-emerald-500 bg-emerald-50' 
                              : 'border-slate-200 hover:border-emerald-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-2xl">{market?.flag}</span>
                              <div>
                                <div className="font-medium text-slate-800">{market?.name}</div>
                                <div className="text-xs text-slate-500">{market?.nameEn}</div>
                              </div>
                            </div>
                            {isSelected && <CheckCircle className="w-5 h-5 text-emerald-500" />}
                          </div>
                          <div className="mt-2 flex items-center gap-2">
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              market?.tier === '一线' ? 'bg-blue-100 text-blue-700' :
                              market?.tier === '二线' ? 'bg-purple-100 text-purple-700' :
                              'bg-orange-100 text-orange-700'
                            }`}>
                              {market?.tier}{isZh ? '' : 'Tier'}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 更多市场选择 */}
                <div>
                  <h4 className="font-medium text-slate-700 mb-3 flex items-center gap-2">
                    <Globe className="w-4 h-4 text-blue-500" />
                    {isZh ? '其他市场选项' : 'Other Market Options'}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(MARKET_INFO)
                      .filter(([id]) => !recommendedMarkets.includes(id))
                      .slice(0, 10)
                      .map(([id, market]) => {
                        const isSelected = selectedMarkets.includes(id);
                        return (
                          <button
                            key={id}
                            onClick={() => toggleMarket(id)}
                            className={`px-3 py-2 rounded-lg border transition-all flex items-center gap-2 ${
                              isSelected 
                                ? 'border-emerald-500 bg-emerald-50 text-emerald-700' 
                                : 'border-slate-200 hover:border-emerald-300 text-slate-600'
                            }`}
                          >
                            <span>{market.flag}</span>
                            <span className="text-sm">{market.name}</span>
                            {isSelected && <CheckCircle className="w-4 h-4" />}
                          </button>
                        );
                    })}
                  </div>
                </div>

                {/* AI分析按钮 */}
                <button
                  onClick={() => runAIAnalysis('market')}
                  disabled={isAnalyzing}
                  className="mt-6 w-full py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl font-medium flex items-center justify-center gap-2 hover:from-blue-600 hover:to-indigo-600 disabled:opacity-50"
                >
                  <Sparkles className="w-5 h-5" />
                  {isAnalyzing ? (isZh ? '分析中...' : 'Analyzing...') : (isZh ? '获取AI市场分析' : 'Get AI Market Analysis')}
                </button>
              </div>
            )}

            {/* 步骤3: 准入路径 */}
            {currentStep === 'path' && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-slate-800">{isZh ? '准入路径分析' : 'Access Path Analysis'}</h3>
                    <p className="text-slate-500 text-sm mt-1">
                      {isZh ? '了解目标市场的政策法规和审批流程' : 'Understand the policies and approval process of target markets'}
                    </p>
                  </div>
                </div>

                {selectedMarkets.length === 0 ? (
                  <div className="text-center py-12 text-slate-500">
                    <Route className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                    <p>{isZh ? '请先在"市场优选"步骤选择目标市场' : 'Please select target markets in the Market Selection step first'}</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {selectedMarkets.map(m => {
                      const market = MARKET_INFO[m];
                      const cost = COST_ESTIMATES[m];
                      if (!market || !cost) return null;

                      return (
                        <div key={m} className="border border-slate-200 rounded-xl p-4">
                          <div className="flex items-start gap-4">
                            <span className="text-3xl">{market.flag}</span>
                            <div className="flex-1">
                              <h4 className="font-semibold text-slate-800">{market.name}</h4>
                              
                              {/* 时间和成本信息 */}
                              <div className="grid sm:grid-cols-2 gap-4 mt-3">
                                <div className="flex items-center gap-2 text-sm">
                                  <Clock className="w-4 h-4 text-blue-500" />
                                  <span className="text-slate-600">{isZh ? '预计时间' : 'Timeline'}:</span>
                                  <span className="font-medium text-slate-800">{cost.timeline}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                  <DollarSign className="w-4 h-4 text-emerald-500" />
                                  <span className="text-slate-600">{isZh ? '预估成本' : 'Est. Cost'}:</span>
                                  <span className="font-medium text-slate-800">
                                    ${(cost.cost.min / 1000).toFixed(0)}k - ${(cost.cost.max / 1000).toFixed(0)}k
                                  </span>
                                </div>
                              </div>

                              {/* 政策要点 */}
                              <div className="mt-3 p-3 bg-slate-50 rounded-lg">
                                <div className="text-xs text-slate-500 mb-1">{isZh ? '准入要点' : 'Key Requirements'}</div>
                                <div className="text-sm text-slate-700">
                                  {market.tier === '一线' 
                                    ? (isZh ? '高端市场，需严格认证，建议准备完整临床数据' : 'High-end market, strict certification, complete clinical data recommended')
                                    : market.tier === '二线'
                                      ? (isZh ? '新兴市场，准入门槛适中，发展潜力大' : 'Emerging market, moderate barriers, high growth potential')
                                      : (isZh ? '细分市场，华人认知度高，可快速进入' : 'Niche market, high TCM awareness, quick entry')}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* AI分析按钮 */}
                {selectedMarkets.length > 0 && (
                  <button
                    onClick={() => runAIAnalysis('path')}
                    disabled={isAnalyzing}
                    className="mt-6 w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium flex items-center justify-center gap-2 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50"
                  >
                    <Sparkles className="w-5 h-5" />
                    {isAnalyzing ? (isZh ? '分析中...' : 'Analyzing...') : (isZh ? '获取详细准入路径分析' : 'Get Detailed Access Path Analysis')}
                  </button>
                )}
              </div>
            )}

            {/* 步骤4: ROI与风险 */}
            {currentStep === 'roi' && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-slate-800">{isZh ? 'ROI与风险分析' : 'ROI & Risk Analysis'}</h3>
                    <p className="text-slate-500 text-sm mt-1">
                      {isZh ? '计算投资回报并评估潜在风险' : 'Calculate ROI and assess potential risks'}
                    </p>
                  </div>
                </div>

                {/* ROI计算器 */}
                <div className="grid sm:grid-cols-3 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      {isZh ? '初始投资 ($)' : 'Initial Investment ($)'}
                    </label>
                    <input
                      type="number"
                      value={roiParams.investment}
                      onChange={(e) => setRoiParams(prev => ({ ...prev, investment: Number(e.target.value) }))}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      {isZh ? '产品单价 ($)' : 'Product Unit Price ($)'}
                    </label>
                    <input
                      type="number"
                      value={roiParams.productPrice}
                      onChange={(e) => setRoiParams(prev => ({ ...prev, productPrice: Number(e.target.value) }))}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      {isZh ? '预计年销量' : 'Est. Annual Volume'}
                    </label>
                    <input
                      type="number"
                      value={roiParams.annualVolume}
                      onChange={(e) => setRoiParams(prev => ({ ...prev, annualVolume: Number(e.target.value) }))}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* ROI结果展示 */}
                {selectedMarkets.length > 0 ? (
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-4">
                      <div className="text-sm text-slate-600 mb-1">{isZh ? '预计年营收' : 'Est. Annual Revenue'}</div>
                      <div className="text-2xl font-bold text-emerald-600">
                        ${(roiResult.revenue / 1000).toFixed(0)}k
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4">
                      <div className="text-sm text-slate-600 mb-1">{isZh ? '预估成本' : 'Est. Cost'}</div>
                      <div className="text-2xl font-bold text-blue-600">
                        ${(roiResult.avgCost / 1000).toFixed(0)}k
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4">
                      <div className="text-sm text-slate-600 mb-1">{isZh ? '预估年利润' : 'Est. Annual Profit'}</div>
                      <div className="text-2xl font-bold text-amber-600">
                        ${((roiResult.profitMin + roiResult.profitMax) / 2 / 1000).toFixed(0)}k
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-rose-50 to-red-50 rounded-xl p-4">
                      <div className="text-sm text-slate-600 mb-1">{isZh ? '投资回报率' : 'ROI Range'}</div>
                      <div className="text-2xl font-bold text-rose-600">
                        {roiResult.roiMin.toFixed(0)}% - {roiResult.roiMax.toFixed(0)}%
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-500">
                    <BarChart3 className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                    <p>{isZh ? '请先选择目标市场' : 'Please select target markets first'}</p>
                  </div>
                )}

                {/* 风险评估 */}
                {riskAssessment && (
                  <div className="mt-6 p-4 border border-slate-200 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className={`w-5 h-5 ${riskAssessment.color}`} />
                        <span className="font-medium text-slate-700">{isZh ? '综合风险评估' : 'Comprehensive Risk Assessment'}</span>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${riskAssessment.bg} ${riskAssessment.color}`}>
                        {isZh ? riskAssessment.label : riskAssessment.labelEn}
                      </span>
                    </div>
                  </div>
                )}

                {/* AI分析按钮 */}
                {selectedMarkets.length > 0 && (
                  <button
                    onClick={() => runAIAnalysis('roi')}
                    disabled={isAnalyzing}
                    className="mt-6 w-full py-3 bg-gradient-to-r from-rose-500 to-orange-500 text-white rounded-xl font-medium flex items-center justify-center gap-2 hover:from-rose-600 hover:to-orange-600 disabled:opacity-50"
                  >
                    <Sparkles className="w-5 h-5" />
                    {isAnalyzing ? (isZh ? '分析中...' : 'Analyzing...') : (isZh ? '获取详细ROI与风险分析' : 'Get Detailed ROI & Risk Analysis')}
                  </button>
                )}
              </div>
            )}

            {/* AI分析结果展示 */}
            {aiAnalysis && (
              <div className="mt-6 bg-gradient-to-r from-slate-50 to-slate-100 rounded-2xl p-6 border border-slate-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-500" />
                    <h4 className="font-semibold text-slate-800">{isZh ? 'AI智能分析结果' : 'AI Analysis Result'}</h4>
                  </div>
                  <button
                    onClick={() => setAiAnalysis('')}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    ×
                  </button>
                </div>
                <div className="prose prose-sm max-w-none text-slate-700 whitespace-pre-wrap">
                  {aiAnalysis}
                </div>
              </div>
            )}

            {/* 步骤导航按钮 */}
            <div className="flex justify-between mt-6">
              <button
                onClick={() => {
                  const idx = STEPS.findIndex(s => s.id === currentStep);
                  if (idx > 0) setCurrentStep(STEPS[idx - 1].id);
                }}
                disabled={currentStepIndex === 0}
                className="px-6 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isZh ? '上一步' : 'Previous'}
              </button>
              <button
                onClick={() => {
                  const idx = STEPS.findIndex(s => s.id === currentStep);
                  if (idx < STEPS.length - 1) setCurrentStep(STEPS[idx + 1].id);
                }}
                disabled={currentStepIndex === STEPS.length - 1}
                className="px-6 py-2 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isZh ? '下一步' : 'Next'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 右侧决策摘要卡片 */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 bg-white rounded-2xl shadow-lg p-5">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-emerald-500" />
                {isZh ? '决策摘要' : 'Decision Summary'}
              </h3>

              {/* 准备度得分 */}
              <div className="mb-4 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl">
                <div className="text-sm text-slate-600 mb-1">{isZh ? '企业准备度' : 'Enterprise Readiness'}</div>
                {renderStars(readinessScore)}
              </div>

              {/* 已选市场 */}
              <div className="mb-4">
                <div className="text-sm text-slate-600 mb-2">{isZh ? '已选市场' : 'Selected Markets'}</div>
                {selectedMarkets.length === 0 ? (
                  <div className="text-sm text-slate-400 italic">
                    {isZh ? '请在"市场优选"中选择' : 'Select in Market Selection'}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-1">
                    {selectedMarkets.map(m => (
                      <span 
                        key={m} 
                        className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 rounded-full text-sm"
                      >
                        <span>{MARKET_INFO[m]?.flag}</span>
                        <span>{MARKET_INFO[m]?.name}</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* 成本估算 */}
              {selectedMarkets.length > 0 && (
                <div className="mb-4 p-3 bg-slate-50 rounded-xl">
                  <div className="text-sm text-slate-600 mb-1">{isZh ? '预估总成本' : 'Est. Total Cost'}</div>
                  <div className="text-lg font-bold text-slate-800">
                    ${(roiResult.avgCost / 1000).toFixed(0)}k
                    <span className="text-xs font-normal text-slate-500 ml-1">
                      (${(selectedMarkets.reduce((sum, m) => sum + (COST_ESTIMATES[m]?.cost.min || 0), 0) / 1000).toFixed(0)}k - ${(selectedMarkets.reduce((sum, m) => sum + (COST_ESTIMATES[m]?.cost.max || 0), 0) / 1000).toFixed(0)}k)
                    </span>
                  </div>
                </div>
              )}

              {/* 风险评估 */}
              {riskAssessment && (
                <div className="mb-4 p-3 rounded-xl border">
                  <div className="text-sm text-slate-600 mb-1">{isZh ? '综合风险' : 'Overall Risk'}</div>
                  <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm font-medium ${riskAssessment.bg} ${riskAssessment.color}`}>
                    {isZh ? riskAssessment.label : riskAssessment.labelEn}
                  </div>
                </div>
              )}

              {/* 下一步提示 */}
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-amber-600 mt-0.5" />
                  <div className="text-xs text-amber-800">
                    {currentStep === 'readiness' && (isZh 
                      ? '完成评估后，点击"下一步"获取市场推荐'
                      : 'After assessment, click "Next" for market recommendations')}
                    {currentStep === 'market' && (isZh 
                      ? '选择目标市场后，查看准入路径分析'
                      : 'After selecting markets, view access path analysis')}
                    {currentStep === 'path' && (isZh 
                      ? '查看准入路径后，计算ROI与风险'
                      : 'After viewing access path, calculate ROI and risk')}
                    {currentStep === 'roi' && (isZh 
                      ? '您已完成所有评估步骤！'
                      : 'You have completed all assessment steps!')}
                  </div>
                </div>
              </div>

              {/* 重置按钮 */}
              <button
                onClick={() => {
                  setSelectedMarkets([]);
                  setReadinessData({
                    certification: { gmp: false, iso: false, export: false },
                    product: { patent: false, clinical: false, standard: false },
                    financial: { budget: 'medium', timeline: 'medium' },
                    team: { overseas: false, language: false },
                  });
                  setCurrentStep('readiness');
                }}
                className="mt-4 w-full py-2 text-sm text-slate-500 hover:text-slate-700 flex items-center justify-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                {isZh ? '重新开始评估' : 'Start Over'}
              </button>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
