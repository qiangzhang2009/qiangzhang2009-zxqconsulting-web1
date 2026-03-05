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
  Clock, 
  DollarSign,
  Sparkles,
  Building2,
  Globe,
  Route,
  BarChart3,
  ArrowRight,
  RefreshCw,
  Info,
  Users,
  FileCheck,
  Award,
  Wallet,
  Shield
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

// 问题类型定义
type Question = {
  id: string;
  text?: string;
  textEn?: string;
  type?: 'select';
  options?: { value: string; label: string; labelEn: string }[];
};

// 企业准备度评估维度
const READINESS_DIMENSIONS: { id: string; name: string; nameEn: string; icon: any; questions: Question[] }[] = [
  { 
    id: 'certification', 
    name: '资质认证', 
    nameEn: 'Certification',
    icon: FileCheck,
    questions: [
      { id: 'gmp', text: '已获得GMP认证', textEn: 'Have GMP certification' },
      { id: 'iso', text: '已通过ISO系列认证', textEn: 'Have ISO certification' },
      { id: 'export', text: '拥有自营出口资质', textEn: 'Have export qualification' },
      { id: 'productCert', text: '产品已获得国内相关认证', textEn: 'Products have domestic certification' },
    ]
  },
  { 
    id: 'product', 
    name: '产品能力', 
    nameEn: 'Product Capability',
    icon: Award,
    questions: [
      { id: 'patent', text: '产品有自主知识产权/专利', textEn: 'Products have patents' },
      { id: 'clinical', text: '有临床试验数据或科研支撑', textEn: 'Have clinical trial data' },
      { id: 'standard', text: '符合国际标准或出口国标准', textEn: 'Meet international standards' },
      { id: 'unique', text: '产品有独特卖点或差异化优势', textEn: 'Products have unique selling points' },
    ]
  },
  { 
    id: 'financial', 
    name: '资金实力', 
    nameEn: 'Financial Strength',
    icon: Wallet,
    questions: [
      { id: 'budget', type: 'select', options: [
        { value: 'low', label: '30万以下', labelEn: 'Under $50K' },
        { value: 'medium', label: '30-100万', labelEn: '$50K-$150K' },
        { value: 'high', label: '100-300万', labelEn: '$150K-$450K' },
        { value: 'premium', label: '300万以上', labelEn: 'Over $450K' },
      ]},
      { id: 'timeline', type: 'select', options: [
        { value: 'urgent', label: '6个月内回本', labelEn: 'Break-even within 6 months' },
        { value: 'normal', label: '6-12个月回本', labelEn: 'Break-even in 6-12 months' },
        { value: 'patient', label: '1-2年回本', labelEn: 'Break-even in 1-2 years' },
        { value: 'long', label: '2年以上回本可接受', labelEn: 'Over 2 years acceptable' },
      ]},
    ]
  },
  { 
    id: 'team', 
    name: '团队能力', 
    nameEn: 'Team Capability',
    icon: Users,
    questions: [
      { id: 'overseas', text: '有海外运营或销售团队', textEn: 'Have overseas team' },
      { id: 'language', text: '有外语（英/日/韩）人才', textEn: 'Have multilingual talent' },
      { id: 'experience', text: '有跨境贸易经验', textEn: 'Have cross-border experience' },
      { id: 'resources', text: '有海外渠道或合作伙伴', textEn: 'Have overseas channels/partners' },
    ]
  },
];

// 市场信息映射
const MARKET_INFO: Record<string, { name: string; flag: string; nameEn: string; tier: string; chinesePop: number; marketSize: string; growth: string; difficulty: string; risk: string }> = {
  japan: { name: '日本', flag: '🇯🇵', nameEn: 'Japan', tier: '一线', chinesePop: 1.2, marketSize: '极大', growth: '稳定', difficulty: '高', risk: '低' },
  australia: { name: '澳大利亚', flag: '🇦🇺', nameEn: 'Australia', tier: '一线', chinesePop: 1.4, marketSize: '大', growth: '稳定', difficulty: '中', risk: '低' },
  usa: { name: '美国', flag: '🇺🇸', nameEn: 'USA', tier: '一线', chinesePop: 5.5, marketSize: '极大', growth: '稳定', difficulty: '高', risk: '低' },
  singapore: { name: '新加坡', flag: '🇸🇬', nameEn: 'Singapore', tier: '一线', chinesePop: 2.8, marketSize: '中', growth: '快速增长', difficulty: '低', risk: '低' },
  germany: { name: '德国', flag: '🇩🇪', nameEn: 'Germany', tier: '一线', chinesePop: 0.2, marketSize: '大', growth: '稳定', difficulty: '高', risk: '低' },
  uk: { name: '英国', flag: '🇬🇧', nameEn: 'UK', tier: '一线', chinesePop: 0.5, marketSize: '大', growth: '稳定', difficulty: '中高', risk: '低' },
  korea: { name: '韩国', flag: '🇰🇷', nameEn: 'South Korea', tier: '二线', chinesePop: 1.1, marketSize: '大', growth: '稳定', difficulty: '中', risk: '中' },
  thailand: { name: '泰国', flag: '🇹🇭', nameEn: 'Thailand', tier: '二线', chinesePop: 0.9, marketSize: '中', growth: '快速增长', difficulty: '低', risk: '中' },
  malaysia: { name: '马来西亚', flag: '🇲🇾', nameEn: 'Malaysia', tier: '二线', chinesePop: 0.8, marketSize: '中', growth: '快速增长', difficulty: '低', risk: '低' },
  indonesia: { name: '印度尼西亚', flag: '🇮🇩', nameEn: 'Indonesia', tier: '二线', chinesePop: 0.3, marketSize: '大', growth: '快速增长', difficulty: '中', risk: '中高' },
  vietnam: { name: '越南', flag: '🇻🇳', nameEn: 'Vietnam', tier: '二线', chinesePop: 0.1, marketSize: '中', growth: '高速增长', difficulty: '低', risk: '中' },
  uae: { name: '阿联酋', flag: '🇦🇪', nameEn: 'UAE', tier: '二线', chinesePop: 0.4, marketSize: '中', growth: '快速增长', difficulty: '中', risk: '低' },
  saudi: { name: '沙特阿拉伯', flag: '🇸🇦', nameEn: 'Saudi Arabia', tier: '二线', chinesePop: 0.05, marketSize: '中', growth: '快速增长', difficulty: '中', risk: '中' },
  india: { name: '印度', flag: '🇮🇳', nameEn: 'India', tier: '二线', chinesePop: 0.02, marketSize: '极大', growth: '高速增长', difficulty: '高', risk: '高' },
  brazil: { name: '巴西', flag: '🇧🇷', nameEn: 'Brazil', tier: '二线', chinesePop: 0.05, marketSize: '大', growth: '波动', difficulty: '高', risk: '中高' },
  newzealand: { name: '新西兰', flag: '🇳🇿', nameEn: 'New Zealand', tier: '一线', chinesePop: 0.25, marketSize: '小', growth: '稳定', difficulty: '低', risk: '低' },
  taiwan: { name: '中国台湾', flag: '🇹🇼', nameEn: 'Taiwan', tier: '细分', chinesePop: 23, marketSize: '中', growth: '稳定', difficulty: '低', risk: '低' },
  hongkong: { name: '中国香港', flag: '🇭🇰', nameEn: 'Hong Kong', tier: '细分', chinesePop: 7.5, marketSize: '小', growth: '稳定', difficulty: '低', risk: '低' },
  canada: { name: '加拿大', flag: '🇨🇦', nameEn: 'Canada', tier: '一线', chinesePop: 1.8, marketSize: '大', growth: '稳定', difficulty: '中', risk: '低' },
};

// 成本估算数据
const COST_ESTIMATES: Record<string, { name: string; cost: { min: number; max: number }; timeline: string; keyReq: string }> = {
  japan: { name: '日本', cost: { min: 80000, max: 250000 }, timeline: '12-24月', keyReq: 'PMDA注册、功能性标示食品认证' },
  australia: { name: '澳大利亚', cost: { min: 30000, max: 80000 }, timeline: '6-12月', keyReq: 'TGA注册、ARTG登记' },
  usa: { name: '美国', cost: { min: 50000, max: 150000 }, timeline: '12-18月', keyReq: 'FDA注册、NDI或GRAS认证' },
  singapore: { name: '新加坡', cost: { min: 15000, max: 40000 }, timeline: '3-6月', keyReq: 'HSA注册、健康补充剂认证' },
  germany: { name: '德国', cost: { min: 60000, max: 180000 }, timeline: '12-24月', keyReq: 'CE认证、NVL注册' },
  uk: { name: '英国', cost: { min: 40000, max: 120000 }, timeline: '9-18月', keyReq: 'MHRA注册、健康声称' },
  korea: { name: '韩国', cost: { min: 25000, max: 60000 }, timeline: '6-12月', keyReq: 'KFDA注册、功能性认证' },
  thailand: { name: '泰国', cost: { min: 15000, max: 40000 }, timeline: '4-8月', keyReq: 'FDA注册、ThaiFDA认证' },
  malaysia: { name: '马来西亚', cost: { min: 12000, max: 35000 }, timeline: '3-6月', keyReq: 'NPRA注册、Malaysian HALAL' },
  indonesia: { name: '印度尼西亚', cost: { min: 10000, max: 30000 }, timeline: '4-8月', keyReq: 'BPOM注册、HALAL认证' },
  vietnam: { name: '越南', cost: { min: 8000, max: 25000 }, timeline: '3-6月', keyReq: 'MOH注册、养生产品分类' },
  uae: { name: '阿联酋', cost: { min: 20000, max: 50000 }, timeline: '4-8月', keyReq: 'ESMA注册、HALAL认证' },
  saudi: { name: '沙特阿拉伯', cost: { min: 18000, max: 45000 }, timeline: '6-10月', keyReq: 'SFDA注册、HALAL认证' },
  india: { name: '印度', cost: { min: 10000, max: 30000 }, timeline: '6-12月', keyReq: 'AYUSH注册、传统医药认证' },
  brazil: { name: '巴西', cost: { min: 20000, max: 60000 }, timeline: '8-14月', keyReq: 'ANVISA注册、Brazilian FDA' },
  newzealand: { name: '新西兰', cost: { min: 20000, max: 50000 }, timeline: '6-10月', keyReq: 'Medsafe注册、补充药品分类' },
  taiwan: { name: '中国台湾', cost: { min: 12000, max: 35000 }, timeline: '4-8月', keyReq: 'TFDA注册、中药制剂认证' },
  hongkong: { name: '中国香港', cost: { min: 8000, max: 25000 }, timeline: '2-4月', keyReq: '中成药注册、商号登记' },
  canada: { name: '加拿大', cost: { min: 35000, max: 90000 }, timeline: '8-14月', keyReq: 'NPN/NIN注册、Health Canada' },
};

// 风险等级配置
const RISK_LEVELS = {
  low: { label: '低风险', labelEn: 'Low Risk', color: 'text-green-600', bg: 'bg-green-100', desc: '市场成熟、政策稳定、回报可预期', descEn: 'Mature market, stable policies, predictable returns' },
  medium: { label: '中等风险', labelEn: 'Medium Risk', color: 'text-yellow-600', bg: 'bg-yellow-100', desc: '市场有潜力但存在一定不确定性', descEn: 'Potential market with some uncertainties' },
  high: { label: '较高风险', labelEn: 'High Risk', color: 'text-orange-600', bg: 'bg-orange-100', desc: '市场复杂或竞争激烈', descEn: 'Complex market or intense competition' },
  veryHigh: { label: '高风险', labelEn: 'Very High Risk', color: 'text-red-600', bg: 'bg-red-100', desc: '政策风险高或市场进入难度大', descEn: 'High policy risk or difficult market entry' },
};

// 去除Markdown格式符号
const stripMarkdown = (text: string): string => {
  return text
    .replace(/^#{1,6}\s+/gm, '')           // 移除标题 #
    .replace(/\*\*([^*]+)\*\*/g, '$1')      // 移除粗体 **
    .replace(/\*([^*]+)\*/g, '$1')          // 移除斜体 *
    .replace(/`([^`]+)`/g, '$1')            // 移除行内代码 `
    .replace(/^[-*+]\s+/gm, '')             // 移除列表符号
    .replace(/^\d+\.\s+/gm, '')             // 移除有序列表
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // 移除链接，保留文字
    .replace(/\n{3,}/g, '\n\n')              // 合并多余的换行
    .trim();
};

export default function DecisionWorkspace() {
  const { i18n } = useTranslation();
  const sectionRef = useRef<HTMLDivElement>(null);
  const isZh = i18n.language === 'zh';

  // 当前步骤
  const [currentStep, setCurrentStep] = useState('readiness');
  
  // 企业准备度数据 - 修复类型定义
  const [readinessData, setReadinessData] = useState<Record<string, Record<string, boolean | string>>>({
    certification: { gmp: false, iso: false, export: false, productCert: false },
    product: { patent: false, clinical: false, standard: false, unique: false },
    financial: { budget: 'medium', timeline: 'normal' },
    team: { overseas: false, language: false, experience: false, resources: false },
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

  // 计算准备度得分 - 优化逻辑
  const readinessScore = useMemo(() => {
    let score = 0;
    let total = 0;
    
    // 资质认证 (25分)
    const certKeys = ['gmp', 'iso', 'export', 'productCert'];
    certKeys.forEach(key => {
      if ((readinessData.certification as any)[key]) score += 6.25;
      total += 6.25;
    });

    // 产品能力 (25分)
    const prodKeys = ['patent', 'clinical', 'standard', 'unique'];
    prodKeys.forEach(key => {
      if ((readinessData.product as any)[key]) score += 6.25;
      total += 6.25;
    });

    // 资金实力 (25分)
    const budgetMap: Record<string, number> = { low: 6.25, medium: 12.5, high: 18.75, premium: 25 };
    score += budgetMap[(readinessData.financial as any).budget as string] || 6.25;
    total += 25;

    // 团队能力 (25分)
    const teamKeys = ['overseas', 'language', 'experience', 'resources'];
    teamKeys.forEach(key => {
      if ((readinessData.team as any)[key]) score += 6.25;
      total += 6.25;
    });

    return Math.round(score);
  }, [readinessData]);

  // 准备度等级
  const readinessLevel = useMemo(() => {
    if (readinessScore >= 80) return { label: '优秀', labelEn: 'Excellent', color: 'text-green-600', bg: 'bg-green-100' };
    if (readinessScore >= 60) return { label: '良好', labelEn: 'Good', color: 'text-blue-600', bg: 'bg-blue-100' };
    if (readinessScore >= 40) return { label: '一般', labelEn: 'Average', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    return { label: '需提升', labelEn: 'Needs Improvement', color: 'text-red-600', bg: 'bg-red-100' };
  }, [readinessScore]);

  // 推荐市场 - 优化逻辑，考虑更多因素
  const recommendedMarkets = useMemo(() => {
    const budget = (readinessData.financial as any).budget as string;
    const hasCert = (readinessData.certification as any).gmp || (readinessData.certification as any).iso;
    
    // 预算越高 + 有资质 + 有团队 = 可以挑战一线市场
    if (readinessScore >= 75 && (budget === 'high' || budget === 'premium') && hasCert) {
      return ['japan', 'usa', 'germany', 'australia', 'singapore'];
    }
    // 准备度较好，中等预算
    if (readinessScore >= 60 && budget === 'medium') {
      return ['singapore', 'australia', 'korea', 'thailand', 'malaysia'];
    }
    // 准备度一般，低预算
    if (readinessScore >= 40) {
      return ['thailand', 'malaysia', 'indonesia', 'vietnam', 'hongkong'];
    }
    // 准备度较低
    return ['hongkong', 'taiwan', 'singapore', 'malaysia', 'uae'];
  }, [readinessScore, readinessData]);

  // 计算ROI - 修复逻辑
  const roiResult = useMemo(() => {
    const costMin = selectedMarkets.reduce((sum, m) => sum + (COST_ESTIMATES[m]?.cost.min || 0), 0);
    const costMax = selectedMarkets.reduce((sum, m) => sum + (COST_ESTIMATES[m]?.cost.max || 0), 0);
    const avgCost = (costMin + costMax) / 2;
    
    const revenue = roiParams.productPrice * roiParams.annualVolume;
    const profitMin = revenue - costMax;
    const profitMax = revenue - costMin;
    
    // 修复ROI计算：避免除以0
    const roiMin = costMax > 0 ? ((revenue - costMax) / costMax) * 100 : 0;
    const roiMax = costMin > 0 ? ((revenue - costMin) / costMin) * 100 : 0;

    return { revenue, avgCost, costMin, costMax, profitMin, profitMax, roiMin, roiMax };
  }, [selectedMarkets, roiParams]);

  // 风险评估 - 修复逻辑：一线市场=低风险，新兴市场=中高风险
  const riskAssessment = useMemo(() => {
    if (selectedMarkets.length === 0) return null;
    
    let riskScore = 0;
    let marketCount = 0;
    
    selectedMarkets.forEach(m => {
      const market = MARKET_INFO[m];
      const cost = COST_ESTIMATES[m];
      if (!market || !cost) return;
      
      marketCount++;
      
      // 修复风险逻辑：一线市场风险低，新兴市场风险高
      if (market.tier === '一线') riskScore += 1;       // 低风险
      else if (market.tier === '二线') riskScore += 2;  // 中等风险
      else if (market.tier === '细分') riskScore += 1.5; // 较低风险
      
      // 成本风险：高成本=高风险
      if (cost.cost.max > 150000) riskScore += 2;
      else if (cost.cost.max > 50000) riskScore += 1;
      else riskScore += 0.5;
    });
    
    const avgRisk = riskScore / marketCount;
    if (avgRisk <= 1.5) return RISK_LEVELS.low;
    if (avgRisk <= 2.5) return RISK_LEVELS.medium;
    if (avgRisk <= 3.5) return RISK_LEVELS.high;
    return RISK_LEVELS.veryHigh;
  }, [selectedMarkets]);

  // 运行AI分析 - 修复Markdown显示问题
  const runAIAnalysis = async (type: string) => {
    setIsAnalyzing(true);
    setAiAnalysis('');
    
    let prompt = '';
    if (type === 'market') {
      const markets = selectedMarkets.length > 0 
        ? selectedMarkets.map(m => MARKET_INFO[m]?.name).join('、')
        : recommendedMarkets.map(m => MARKET_INFO[m]?.name).join('、');
      prompt = `作为中医药产品出海专家，请根据企业准备度得分${readinessScore}分，分析目标市场${markets}的优劣势、准入要点和注意事项。请用简洁专业的语言列出要点，不需要使用Markdown格式符号如#或*，直接以段落形式呈现。`;
    } else if (type === 'path') {
      const markets = selectedMarkets.map(m => MARKET_INFO[m]?.name).join('、');
      prompt = `作为中医药产品出海专家，请分析中医药产品进入${markets}市场的准入路径、政策要求、审批流程和时间节点。请用简洁专业的语言列出要点，不需要使用Markdown格式符号如#或*。`;
    } else if (type === 'roi') {
      const markets = selectedMarkets.map(m => MARKET_INFO[m]?.name).join('、');
      prompt = `作为中医药产品出海专家，请分析投资${(roiParams.investment/10000).toFixed(0)}万美元进入${markets}市场的投资回报预期、风险评估和运营建议。请用简洁专业的语言列出要点，不需要使用Markdown格式符号如#或*。`;
    } else {
      prompt = `作为中医药产品出海专家，请对准备度得分${readinessScore}分的企业给出出海建议和改进方向，特别是哪些方面需要提升。请用简洁专业的语言列出要点，不需要使用Markdown格式符号如#或*。`;
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
            { role: 'system', content: '你是中医药产品出海咨询专家，请用专业但易懂的语言回答用户问题。重要：请不要使用任何Markdown格式符号（如#、*、-等），直接用纯文本段落形式回答。涉及台湾地区时必须表述为"中国台湾"，涉及香港地区时必须表述为"中国香港"。' },
            { role: 'user', content: prompt }
          ],
          max_tokens: 1500,
          temperature: 0.7,
        }),
      });

      const data = await response.json();
      let content = data.choices?.[0]?.message?.content || '抱歉，分析服务暂时不可用。';
      
      // 去除Markdown符号
      content = stripMarkdown(content);
      
      // 替换AI名称
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

  // 渲染准备度得分
  const renderReadiness = () => (
    <div className="flex items-center gap-3">
      <div className="relative w-16 h-16">
        <svg className="w-16 h-16 transform -rotate-90">
          <circle cx="32" cy="32" r="28" strokeWidth="6" fill="none" className="stroke-slate-200" />
          <circle 
            cx="32" cy="32" r="28" strokeWidth="6" fill="none" 
            className="stroke-emerald-500 transition-all duration-500"
            strokeDasharray={`${(readinessScore / 100) * 176} 176`}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-bold text-emerald-600">{readinessScore}</span>
        </div>
      </div>
      <div>
        <div className="text-sm text-slate-500">{isZh ? '准备度得分' : 'Readiness Score'}</div>
        <div className={`font-bold ${readinessLevel.color}`}>
          {isZh ? readinessLevel.label : readinessLevel.labelEn}
        </div>
      </div>
    </div>
  );

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
          <div className="flex items-center justify-between bg-white rounded-2xl shadow-sm p-2 overflow-x-auto">
            {STEPS.map((step, index) => {
              const Icon = step.icon;
              const isActive = step.id === currentStep;
              const isCompleted = STEPS.findIndex(s => s.id === currentStep) > index;
              
              return (
                <button
                  key={step.id}
                  onClick={() => setCurrentStep(step.id)}
                  className={`flex-1 flex items-center gap-2 px-3 py-3 rounded-xl transition-all whitespace-nowrap ${
                    isActive 
                      ? 'bg-emerald-500 text-white shadow-md' 
                      : isCompleted 
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    isActive ? 'bg-white/20' : isCompleted ? 'bg-emerald-500 text-white' : 'bg-slate-100'
                  }`}>
                    {isCompleted ? <CheckCircle className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                  </div>
                  <span className="font-medium text-sm">
                    {isZh ? step.name : step.nameEn}
                  </span>
                  {index < STEPS.length - 1 && (
                    <ChevronRight className={`w-4 h-4 ml-auto shrink-0 ${isActive ? 'text-white/60' : 'text-slate-300'}`} />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* 主内容区 */}
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
                    {renderReadiness()}
                  </div>
                </div>

                {/* 准备度维度 */}
                <div className="space-y-4">
                  {READINESS_DIMENSIONS.map(dim => {
                    const Icon = dim.icon;
                    return (
                      <div key={dim.id} className="border border-slate-200 rounded-xl p-4">
                        <h4 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
                          <Icon className="w-4 h-4 text-emerald-500" />
                          {isZh ? dim.name : dim.nameEn}
                        </h4>
                        <div className="grid sm:grid-cols-2 gap-3">
                          {dim.questions.map(q => {
                            // 判断是下拉选择还是复选框
                            const isSelect = 'type' in q && q.type === 'select';
                            if (isSelect) {
                              const selectQ = q as Question;
                              return (
                                <div key={selectQ.id} className="p-3 bg-slate-50 rounded-lg">
                                  <label className="block text-xs text-slate-500 mb-1">
                                    {isZh ? '期望预算' : 'Budget Expectation'}
                                  </label>
                                  <select
                                    value={(readinessData[dim.id as keyof typeof readinessData] as any)?.[selectQ.id] as string || 'medium'}
                                    onChange={(e) => {
                                      setReadinessData(prev => ({
                                        ...prev,
                                        [dim.id]: { ...(prev[dim.id] as object), [selectQ.id]: e.target.value }
                                      }));
                                    }}
                                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:border-emerald-500 focus:outline-none"
                                  >
                                    {selectQ.options?.map((opt) => (
                                      <option key={opt.value} value={opt.value}>
                                        {isZh ? opt.label : opt.labelEn}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              );
                            }
                            
                            const checkboxQ = q;
                            return (
                              <label 
                                key={checkboxQ.id} 
                                className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors"
                              >
                                <input
                                  type="checkbox"
                                  checked={(readinessData[dim.id as keyof typeof readinessData] as any)?.[checkboxQ.id] === true}
                                  onChange={(e) => {
                                    setReadinessData(prev => ({
                                      ...prev,
                                      [dim.id]: { ...(prev[dim.id] as object), [checkboxQ.id]: e.target.checked }
                                    }));
                                  }}
                                  className="w-4 h-4 text-emerald-500 rounded focus:ring-emerald-500"
                                />
                                <span className="text-sm text-slate-700">
                                  {isZh ? checkboxQ.text : checkboxQ.textEn}
                                </span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
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
                    {isZh ? '已选' : 'Selected'}: {selectedMarkets.length}
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
                          <div className="mt-2 flex flex-wrap items-center gap-1">
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              market?.tier === '一线' ? 'bg-blue-100 text-blue-700' :
                              market?.tier === '二线' ? 'bg-purple-100 text-purple-700' :
                              'bg-orange-100 text-orange-700'
                            }`}>
                              {market?.tier}{isZh ? '' : ' Tier'}
                            </span>
                            <span className="text-xs text-slate-500">
                              {isZh ? `难度${market?.difficulty}` : `Diff: ${market?.difficulty}`}
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
                    {isZh ? '其他市场选项' : 'Other Markets'}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(MARKET_INFO)
                      .filter(([id]) => !recommendedMarkets.includes(id))
                      .slice(0, 12)
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
                            <span className="text-3xl shrink-0">{market.flag}</span>
                            <div className="flex-1">
                              <h4 className="font-semibold text-slate-800">{market.name}</h4>
                              
                              {/* 时间和成本信息 */}
                              <div className="grid sm:grid-cols-2 gap-3 mt-3">
                                <div className="flex items-center gap-2 text-sm">
                                  <Clock className="w-4 h-4 text-blue-500 shrink-0" />
                                  <span className="text-slate-600">{isZh ? '预计时间' : 'Timeline'}:</span>
                                  <span className="font-medium text-slate-800">{cost.timeline}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                  <DollarSign className="w-4 h-4 text-emerald-500 shrink-0" />
                                  <span className="text-slate-600">{isZh ? '预估成本' : 'Est. Cost'}:</span>
                                  <span className="font-medium text-slate-800">
                                    ${(cost.cost.min / 10000).toFixed(1)}万 - ${(cost.cost.max / 10000).toFixed(1)}万
                                  </span>
                                </div>
                              </div>

                              {/* 准入要点 */}
                              <div className="mt-3 p-3 bg-slate-50 rounded-lg">
                                <div className="text-xs text-slate-500 mb-1">{isZh ? '准入要点' : 'Key Requirements'}</div>
                                <div className="text-sm text-slate-700">
                                  {cost.keyReq}
                                </div>
                              </div>

                              {/* 市场特点 */}
                              <div className="mt-2 flex flex-wrap gap-2">
                                <span className={`text-xs px-2 py-1 rounded ${
                                  market.risk === '低' ? 'bg-green-100 text-green-700' :
                                  market.risk === '中' ? 'bg-yellow-100 text-yellow-700' :
                                  'bg-red-100 text-red-700'
                                }`}>
                                  {isZh ? `风险${market.risk}` : `Risk: ${market.risk}`}
                                </span>
                                <span className="text-xs px-2 py-1 bg-slate-100 text-slate-600 rounded">
                                  {isZh ? `市场${market.marketSize}` : `Size: ${market.marketSize}`}
                                </span>
                                <span className="text-xs px-2 py-1 bg-slate-100 text-slate-600 rounded">
                                  {isZh ? `增长${market.growth}` : `Growth: ${market.growth}`}
                                </span>
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
                      {isZh ? '初始投资 (元)' : 'Investment (CNY)'}
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
                      {isZh ? '产品单价 (元)' : 'Unit Price (CNY)'}
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
                      {isZh ? '预计年销量' : 'Annual Volume'}
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
                  <>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-4">
                        <div className="text-sm text-slate-600 mb-1">{isZh ? '预计年营收' : 'Annual Revenue'}</div>
                        <div className="text-xl font-bold text-emerald-600">
                          ¥{((roiResult.revenue / 10000)).toFixed(1)}万
                        </div>
                      </div>
                      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4">
                        <div className="text-sm text-slate-600 mb-1">{isZh ? '预估成本' : 'Est. Cost'}</div>
                        <div className="text-xl font-bold text-blue-600">
                          ¥{((roiResult.avgCost / 10000)).toFixed(1)}万
                        </div>
                        <div className="text-xs text-slate-400">
                          ¥{((roiResult.costMin / 10000)).toFixed(1)}万 - ¥{((roiResult.costMax / 10000)).toFixed(1)}万
                        </div>
                      </div>
                      <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4">
                        <div className="text-sm text-slate-600 mb-1">{isZh ? '预估年利润' : 'Annual Profit'}</div>
                        <div className={`text-xl font-bold ${roiResult.profitMin > 0 ? 'text-amber-600' : 'text-red-600'}`}>
                          ¥{(((roiResult.profitMin + roiResult.profitMax) / 2 / 10000)).toFixed(1)}万
                        </div>
                      </div>
                      <div className="bg-gradient-to-br from-rose-50 to-red-50 rounded-xl p-4">
                        <div className="text-sm text-slate-600 mb-1">{isZh ? '投资回报率' : 'ROI Range'}</div>
                        <div className={`text-xl font-bold ${roiResult.roiMin > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {roiResult.roiMin.toFixed(0)}% - {roiResult.roiMax.toFixed(0)}%
                        </div>
                      </div>
                    </div>

                    {/* 风险评估 */}
                    {riskAssessment && (
                      <div className="p-4 border-2 border-slate-200 rounded-xl mb-6">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Shield className={`w-5 h-5 ${riskAssessment.color}`} />
                            <span className="font-medium text-slate-700">{isZh ? '综合风险评估' : 'Comprehensive Risk'}</span>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${riskAssessment.bg} ${riskAssessment.color}`}>
                            {isZh ? riskAssessment.label : riskAssessment.labelEn}
                          </span>
                        </div>
                        <div className="text-sm text-slate-500">
                          {isZh ? riskAssessment.desc : riskAssessment.descEn}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-8 text-slate-500">
                    <BarChart3 className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                    <p>{isZh ? '请先选择目标市场' : 'Please select target markets first'}</p>
                  </div>
                )}

                {/* AI分析按钮 */}
                {selectedMarkets.length > 0 && (
                  <button
                    onClick={() => runAIAnalysis('roi')}
                    disabled={isAnalyzing}
                    className="mt-2 w-full py-3 bg-gradient-to-r from-rose-500 to-orange-500 text-white rounded-xl font-medium flex items-center justify-center gap-2 hover:from-rose-600 hover:to-orange-600 disabled:opacity-50"
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
                    className="text-slate-400 hover:text-slate-600 text-2xl leading-none"
                  >
                    ×
                  </button>
                </div>
                <div className="prose prose-sm max-w-none text-slate-700 whitespace-pre-wrap leading-relaxed">
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
                <div className="text-sm text-slate-600 mb-2">{isZh ? '企业准备度' : 'Enterprise Readiness'}</div>
                {renderReadiness()}
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
                    ¥{((roiResult.avgCost / 10000)).toFixed(1)}万
                    <span className="text-xs font-normal text-slate-500 ml-1">
                      (¥{((roiResult.costMin / 10000)).toFixed(1)}万 - ¥{((roiResult.costMax / 10000)).toFixed(1)}万)
                    </span>
                  </div>
                </div>
              )}

              {/* 风险评估 */}
              {riskAssessment && (
                <div className="mb-4 p-3 rounded-xl border-2 border-slate-100">
                  <div className="text-sm text-slate-600 mb-1">{isZh ? '综合风险' : 'Overall Risk'}</div>
                  <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm font-medium ${riskAssessment.bg} ${riskAssessment.color}`}>
                    <Shield className="w-3 h-3" />
                    {isZh ? riskAssessment.label : riskAssessment.labelEn}
                  </div>
                </div>
              )}

              {/* 下一步提示 */}
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
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
                    certification: { gmp: false, iso: false, export: false, productCert: false },
                    product: { patent: false, clinical: false, standard: false, unique: false },
                    financial: { budget: 'medium', timeline: 'normal' },
                    team: { overseas: false, language: false, experience: false, resources: false },
                  });
                  setAiAnalysis('');
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
