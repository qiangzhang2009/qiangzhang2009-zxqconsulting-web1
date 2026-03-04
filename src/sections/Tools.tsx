import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from 'i18next';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { 
  Calculator, 
  Clock, 
  Target, 
  TrendingUp,
  ChevronRight,
  Loader2,
  Sparkles,
  Search,
  Compass,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Bell,
  Zap
} from 'lucide-react';
import { DEEPSEEK_CONFIG, AI_NAME_REPLACEMENTS } from '@/config';
import { PRODUCT_CATEGORIES, MARKET_POLICIES, DIFFICULTY_LEVELS } from '@/data/marketPolicies';
import SmartMarketSelector from '@/components/SmartMarketSelector';

gsap.registerPlugin(ScrollTrigger);

// 各国认证费用数据
const CERTIFICATION_COSTS = {
  japan: {
    name: '日本',
    pmda: { min: 50000, max: 200000, unit: 'USD', name: 'PMDA注册费' },
    quatco: { min: 3000, max: 10000, unit: 'USD', name: 'QUATCO检测费' },
    translation: { min: 2000, max: 5000, unit: 'USD', name: '翻译公证费' },
    local: { min: 5000, max: 15000, unit: 'USD', name: '当地代理费' },
  },
  australia: {
    name: '澳大利亚',
    tga: { min: 10000, max: 50000, unit: 'USD', name: 'TGA注册费' },
  testing: { min: 5000, max: 15000, unit: 'USD', name: '毒理测试费' },
  translation: { min: 2000, max: 5000, unit: 'USD', name: '翻译公证费' },
  local: { min: 5000, max: 15000, unit: 'USD', name: '当地代理费' },
  },
  southeast: {
    name: '东南亚',
  nifdc: { min: 3000, max: 10000, unit: 'USD', name: '各国准入注册费' },
  testing: { min: 3000, max: 8000, unit: 'USD', name: '检测费' },
  translation: { min: 1000, max: 3000, unit: 'USD', name: '翻译费' },
  local: { min: 3000, max: 8000, unit: 'USD', name: '当地代理费' },
  },
  europe: {
    name: '欧洲',
  ema: { min: 30000, max: 150000, unit: 'USD', name: 'EMA注册费' },
  testing: { min: 10000, max: 30000, unit: 'USD', name: '临床测试费' },
  translation: { min: 5000, max: 10000, unit: 'USD', name: '翻译公证费' },
  local: { min: 10000, max: 30000, unit: 'USD', name: '当地代理费' },
  },
  middleEast: {
    name: '中东',
  registration: { min: 5000, max: 15000, unit: 'USD', name: '注册费' },
  testing: { min: 3000, max: 8000, unit: 'USD', name: '检测费' },
  translation: { min: 2000, max: 5000, unit: 'USD', name: '翻译费' },
  local: { min: 3000, max: 8000, unit: 'USD', name: '当地代理费' },
  },
};

// 各国审批时间数据
const CERTIFICATION_TIMELINE = {
  japan: { min: 12, max: 24, unit: '月', name: '日本PMDA', phases: [
    { name: '资料准备', duration: '2-3月' },
    { name: 'PMDA审查', duration: '8-12月' },
    { name: '现场核查', duration: '2-3月' },
    { name: '获得认证', duration: '1-2月' },
  ]},
  australia: { min: 6, max: 18, unit: '月', name: '澳大利亚TGA', phases: [
    { name: '资料准备', duration: '1-2月' },
    { name: 'TGA审查', duration: '4-10月' },
    { name: '补充资料', duration: '1-3月' },
    { name: '获得认证', duration: '1-2月' },
  ]},
  southeast: { min: 3, max: 12, unit: '月', name: '东南亚各国', phases: [
    { name: '资料准备', duration: '1-2月' },
    { name: '各国审查', duration: '2-6月' },
    { name: '批准上市', duration: '1-2月' },
  ]},
  europe: { min: 12, max: 36, unit: '月', name: '欧洲CE', phases: [
    { name: '资料准备', duration: '3-6月' },
    { name: '公告机构审核', duration: '6-18月' },
    { name: '临床评估', duration: '6-12月' },
    { name: '获得CE', duration: '1-2月' },
  ]},
  middleEast: { min: 3, max: 9, unit: '月', name: '中东各国', phases: [
    { name: '资料准备', duration: '1-2月' },
    { name: 'SFDA/CFDA审查', duration: '2-5月' },
    { name: '获得批准', duration: '1-2月' },
  ]},
};

const Tools = () => {
  const { t } = useTranslation();
  const [activeTool, setActiveTool] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);

  // 全局目标市场选择（用于所有工具）
  const [globalMarket, setGlobalMarket] = useState('japan');

  // 成本计算器状态
  const [costCountry, setCostCountry] = useState('japan');
  const [costProductType, setCostProductType] = useState('supplement');
  
  // 时间估算状态
  const [timeCountry, setTimeCountry] = useState('japan');
  
  // 自测问卷状态
  const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({});

  // ROI模拟器状态
  const [roiInputs, setRoiInputs] = useState({
    market: 'japan',
    investment: 100000,
    productPrice: 50,
    annualSales: 10000,
  });
  const [roiResult, setRoiResult] = useState<any>(null);

  // AI分析状态
  const [aiAnalysis, setAiAnalysis] = useState('');
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);

  // 政策查询状态
  const [policyMarket, setPolicyMarket] = useState('japan');
  const [policyCategory, setPolicyCategory] = useState('supplement');
  const [policyResult, setPolicyResult] = useState<any>(null);

  // 适配度匹配状态
  const [matchProduct, setMatchProduct] = useState('supplement');
  const [matchBudget, setMatchBudget] = useState('medium');
  const [matchTimeline, setMatchTimeline] = useState('12');
  const [matchAdvantage, setMatchAdvantage] = useState('quality');

  const tools = [
    { id: 'cost', icon: Calculator, name: t('tools.cost.name'), desc: t('tools.cost.desc') },
    { id: 'time', icon: Clock, name: t('tools.time.name'), desc: t('tools.time.desc') },
    { id: 'policy', icon: Search, name: t('tools.policy.name'), desc: t('tools.policy.desc') },
    { id: 'match', icon: Compass, name: t('tools.match.name'), desc: t('tools.match.desc') },
    { id: 'quiz', icon: Target, name: t('tools.quiz.name'), desc: t('tools.quiz.desc') },
    { id: 'roi', icon: TrendingUp, name: t('tools.roi.name'), desc: t('tools.roi.desc') },
  ];

  // 计算总成本
  const calculateTotalCost = () => {
    const country = CERTIFICATION_COSTS[costCountry as keyof typeof CERTIFICATION_COSTS];
    
    // 如果当前市场不在成本表中，避免报错
    if (!country) {
      return { total: 0, details: [] };
    }
    
    let total = 0;
    let details: string[] = [];
    
    Object.entries(country).forEach(([key, value]: [string, any]) => {
      if (key !== 'name' && value.min && value.max) {
        const avg = (value.min + value.max) / 2;
        total += avg;
        details.push(`${value.name}: $${value.min.toLocaleString()}-${value.max.toLocaleString()}`);
      }
    });
    
    return { total, details };
  };

  // 获取时间估算
  const getTimeline = () => {
    return CERTIFICATION_TIMELINE[timeCountry as keyof typeof CERTIFICATION_TIMELINE] || null;
  };

  // 自测问卷题目
  const quizQuestions = [
    { id: 1, question: t('tools.quiz.q1'), options: [
      { value: 'a', label: t('tools.quiz.q1a') },
      { value: 'b', label: t('tools.quiz.q1b') },
      { value: 'c', label: t('tools.quiz.q1c') },
    ]},
    { id: 2, question: t('tools.quiz.q2'), options: [
      { value: 'a', label: t('tools.quiz.q2a') },
      { value: 'b', label: t('tools.quiz.q2b') },
      { value: 'c', label: t('tools.quiz.q2c') },
    ]},
    { id: 3, question: t('tools.quiz.q3'), options: [
      { value: 'a', label: t('tools.quiz.q3a') },
      { value: 'b', label: t('tools.quiz.q3b') },
      { value: 'c', label: t('tools.quiz.q3c') },
    ]},
    { id: 4, question: t('tools.quiz.q4'), options: [
      { value: 'a', label: t('tools.quiz.q4a') },
      { value: 'b', label: t('tools.quiz.q4b') },
      { value: 'c', label: t('tools.quiz.q4c') },
    ]},
  ];

  // 计算ROI
  const calculateROI = () => {
    const { investment, productPrice, annualSales } = roiInputs;
    const revenue = productPrice * annualSales;
    const profit = revenue * 0.3; // 假设30%利润率
    const roi = ((profit - investment) / investment) * 100;
    const paybackMonths = investment / (profit / 12);
    
    setRoiResult({
      revenue,
      profit,
      roi,
      paybackMonths: Math.ceil(paybackMonths),
    });
  };

  // 调用AI分析
  const runAIAnalysis = async (type: 'quiz' | 'roi' | 'match') => {
    setIsLoadingAnalysis(true);
    setAiAnalysis('');

    let prompt = '';
    if (type === 'quiz') {
      const answers = Object.entries(quizAnswers).map(([q, a]) => 
        `问题${q}: ${a}`
      ).join(', ');
      prompt = `作为中医药产品出海专家，请根据以下自测结果，为用户推荐最适合的市场和行动建议：\n\n${answers}\n\n请给出专业的市场建议和下一步行动计划。`;
    } else if (type === 'roi') {
      prompt = `作为中医药产品出海专家，请分析以下投资计划的可行性：\n\n- 目标市场: ${CERTIFICATION_COSTS[roiInputs.market as keyof typeof CERTIFICATION_COSTS]?.name || '日本'}\n- 初始投资: $${roiInputs.investment.toLocaleString()}\n- 产品单价: $${roiInputs.productPrice}\n- 预计年销量: ${roiInputs.annualSales.toLocaleString()}件\n\n请给出专业分析和优化建议。`;
    } else if (type === 'match') {
      const productLabels: Record<string, string> = {
        supplement: '保健食品/膳食补充剂',
        traditional: '传统草药/中药制剂',
        cosmetic: '化妆品/护肤品',
        food: '普通食品'
      };
      const budgetLabels: Record<string, string> = {
        low: '10万美元以下',
        medium: '10-50万美元',
        high: '50万美元以上'
      };
      const timelineLabels: Record<string, string> = {
        '6': '6个月内',
        '12': '6-12个月',
        '24': '1-2年',
        '36': '2年以上'
      };
      const advantageLabels: Record<string, string> = {
        quality: '产品质量与标准',
        brand: '品牌与渠道',
        price: '价格竞争力',
        technology: '技术创新'
      };
      prompt = `作为中医药产品出海专家，请根据以下条件为用户推荐最适合的目标市场：\n\n- 产品类型: ${productLabels[matchProduct]}\n- 预算范围: ${budgetLabels[matchBudget]}\n- 期望周期: ${timelineLabels[matchTimeline]}\n- 核心优势: ${advantageLabels[matchAdvantage]}\n\n请按匹配度从高到低推荐3个最适合的市场，并说明推荐理由。`;
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
            { role: 'system', content: '你是中医药产品出海咨询专家，请用专业但易懂的语言回答用户问题。' },
            { role: 'user', content: prompt }
          ],
          max_tokens: 1000,
          temperature: 0.7,
        }),
      });

      const data = await response.json();
      let content = data.choices?.[0]?.message?.content || '抱歉，分析服务暂时不可用。';
      
      // 替换 DeepSeek 为 智探Global 智能体
      Object.entries(AI_NAME_REPLACEMENTS).forEach(([key, value]) => {
        content = content.replace(new RegExp(key, 'gi'), value);
      });
      
      setAiAnalysis(content);
    } catch (error) {
      console.error('AI分析失败:', error);
      setAiAnalysis('抱歉，AI分析服务暂时不可用。请稍后重试或直接联系我们获取专业咨询。');
    } finally {
      setIsLoadingAnalysis(false);
    }
  };

  // 政策查询函数
  const searchPolicy = () => {
    const policy = MARKET_POLICIES[policyMarket]?.[policyCategory];
    if (policy) {
      setPolicyResult(policy);
    }
  };

  // 适配度匹配函数
  const runMatchAnalysis = () => {
    // 使用AI进行智能匹配
    runAIAnalysis('match');
  };

  const costResult = calculateTotalCost();
  const timeline = getTimeline();

  return (
    <section
      id="tools"
      ref={sectionRef}
      className="section py-24 bg-gradient-to-br from-emerald-50 via-white to-teal-50"
    >
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-full px-6 py-2 mb-4">
            <Sparkles className="w-5 h-5 text-emerald-600" />
            <span className="text-sm font-medium text-emerald-600">{t('tools.badge')}</span>
          </div>
          
          <span className="inline-block text-emerald-600 font-medium mb-4 tracking-wider uppercase text-sm">
            {t('tools.title')}
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            {t('tools.subtitle')}
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            {t('tools.description')}
          </p>
        </div>

        {/* Tool Tabs */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {tools.map((tool, index) => (
            <button
              key={tool.id}
              onClick={() => {
                // 切换工具时同步市场选择
                setCostCountry(globalMarket);
                setTimeCountry(globalMarket);
                setPolicyMarket(globalMarket);
                setRoiInputs({ ...roiInputs, market: globalMarket });
                setActiveTool(index);
                setRoiResult(null);
                setAiAnalysis('');
                setPolicyResult(null);
              }}
              className={`flex items-center gap-2 px-5 py-3 rounded-full font-medium transition-all duration-300 ${
                activeTool === index
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg'
                  : 'bg-white text-emerald-600 hover:bg-emerald-50 border border-emerald-200'
              }`}
            >
              <tool.icon className="w-5 h-5" />
              <span>{tool.name}</span>
            </button>
          ))}
        </div>

        {/* Tool Content */}
        <div className="bg-white rounded-3xl shadow-xl border border-emerald-100/30 overflow-hidden">
          
          {/* 全局市场选择器 - 所有工具的第一步 */}
          <div className="p-6 md:p-8 bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-emerald-100">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-emerald-600" />
              <span className="font-medium text-emerald-700">{t('tools.selectMarket') || '选择目标市场'}</span>
            </div>
            <SmartMarketSelector
              value={globalMarket}
              onChange={(marketId) => {
                setGlobalMarket(marketId);
                // 同时更新各个工具的独立市场选择
                setCostCountry(marketId);
                setTimeCountry(marketId);
                setPolicyMarket(marketId);
                setRoiInputs({ ...roiInputs, market: marketId });
              }}
            />
          </div>

          {/* 成本计算器 */}
          {activeTool === 0 && (
            <div className="p-8 md:p-12">
              <h3 className="text-2xl font-bold text-gray-800 mb-8 flex items-center gap-3">
                <Calculator className="w-7 h-7 text-emerald-500" />
                {t('tools.cost.title')}
              </h3>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('tools.cost.country')}
                    </label>
                    <select
                      value={costCountry}
                      onChange={(e) => setCostCountry(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
                    >
                      <option value="japan">🇯🇵 日本</option>
                      <option value="australia">🇦🇺 澳大利亚</option>
                      <option value="southeast">🇸🇬 东南亚</option>
                      <option value="europe">🇪🇺 欧洲</option>
                      <option value="middleEast">🇸🇦 中东</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('tools.cost.productType')}
                    </label>
                    <select
                      value={costProductType}
                      onChange={(e) => setCostProductType(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
                    >
                      <option value="supplement">💊 保健食品</option>
                      <option value="traditional">🌿 传统草药</option>
                      <option value="cosmetic">✨ 化妆品</option>
                      <option value="medical">🏥 医疗器械</option>
                    </select>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6">
                  <h4 className="font-semibold text-gray-800 mb-4">{t('tools.cost.estimate')}</h4>
                  
                  <div className="text-4xl font-bold text-emerald-600 mb-6">
                    ${(costResult.total * (costProductType === 'medical' ? 1.5 : costProductType === 'traditional' ? 1.2 : 1)).toLocaleString()}
                    <span className="text-lg font-normal text-gray-500"> - ${((costResult.total * 1.5) * (costProductType === 'medical' ? 1.5 : costProductType === 'traditional' ? 1.2 : 1)).toLocaleString()}</span>
                  </div>

                  <div className="space-y-2">
                    {costResult.details.map((detail, i) => (
                      <div key={i} className="flex justify-between text-sm text-gray-600">
                        <span>{detail.split(':')[0]}</span>
                        <span className="font-medium">{detail.split(':')[1]}</span>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => runAIAnalysis('roi')}
                    disabled={isLoadingAnalysis}
                    className="mt-6 w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-medium hover:from-emerald-600 hover:to-teal-600 transition-all disabled:opacity-50"
                  >
                    {isLoadingAnalysis ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        {t('tools.common.analyzing')}
                      </span>
                    ) : (
                      t('tools.cost.getAdvice')
                    )}
                  </button>
                </div>
              </div>

              {/* AI 分析结果 */}
              {aiAnalysis && (
                <div className="mt-8 p-6 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl border border-purple-100">
                  <h4 className="font-semibold text-purple-800 mb-3 flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    {t('tools.common.aiAdvice')}
                  </h4>
                  <p className="text-gray-700 whitespace-pre-line">{aiAnalysis}</p>
                </div>
              )}
            </div>
          )}

          {/* 认证时间估算 */}
          {activeTool === 1 && (
            <div className="p-8 md:p-12">
              <h3 className="text-2xl font-bold text-gray-800 mb-8 flex items-center gap-3">
                <Clock className="w-7 h-7 text-emerald-500" />
                {t('tools.time.title')}
              </h3>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('tools.time.country')}
                  </label>
                  <select
                    value={timeCountry}
                    onChange={(e) => setTimeCountry(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
                  >
                    <option value="japan">🇯🇵 日本 (PMDA)</option>
                    <option value="australia">🇦🇺 澳大利亚 (TGA)</option>
                    <option value="southeast">🇸🇬 东南亚各国</option>
                    <option value="europe">🇪🇺 欧洲 (CE)</option>
                    <option value="middleEast">🇸🇦 中东各国</option>
                  </select>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6">
                  {timeline ? (
                    <>
                      <h4 className="font-semibold text-gray-800 mb-4">{t('tools.time.result')}</h4>
                      
                      <div className="text-4xl font-bold text-blue-600 mb-4">
                        {timeline.min} - {timeline.max} {timeline.unit}
                      </div>

                      <div className="space-y-3">
                        {timeline.phases.map((phase, i) => (
                          <div key={i} className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-sm">
                              {i + 1}
                            </div>
                            <div className="flex-1">
                              <div className="text-gray-800 font-medium">{phase.name}</div>
                            </div>
                            <div className="text-blue-600 font-medium">{phase.duration}</div>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="text-sm text-blue-800 py-8 text-center">
                      {i18n.language === 'zh'
                        ? '当前市场暂未配置详细审批时间，请选择日本、澳大利亚、东南亚、欧洲或中东之一查看时间估算。'
                        : 'Timeline estimation is not available for this market. Please select Japan, Australia, Southeast Asia, Europe or Middle East.'}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 政策查询工具 */}
          {activeTool === 2 && (
            <div className="p-8 md:p-12">
              <h3 className="text-2xl font-bold text-gray-800 mb-8 flex items-center gap-3">
                <Search className="w-7 h-7 text-emerald-500" />
                {t('tools.policy.title')}
              </h3>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('tools.policy.selectMarket')}
                    </label>
                    <SmartMarketSelector
                      value={policyMarket}
                      onChange={(marketId) => {
                        setPolicyMarket(marketId);
                        setPolicyResult(null);
                      }}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('tools.policy.selectCategory')}
                    </label>
                    <select
                      value={policyCategory}
                      onChange={(e) => {
                        setPolicyCategory(e.target.value);
                        setPolicyResult(null);
                      }}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
                    >
                      {PRODUCT_CATEGORIES.map(cat => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    onClick={searchPolicy}
                    className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-medium hover:from-emerald-600 hover:to-teal-600 transition-all"
                  >
                    {t('tools.policy.search')}
                  </button>
                </div>

                <div className="space-y-4">
                  {policyResult ? (
                    <>
                      {/* 准入状态 */}
                      <div className={`rounded-2xl p-6 ${policyResult.allowed ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                        <div className="flex items-center gap-3 mb-2">
                          {policyResult.allowed ? (
                            <CheckCircle className="w-6 h-6 text-green-600" />
                          ) : (
                            <XCircle className="w-6 h-6 text-red-600" />
                          )}
                          <span className={`font-bold text-lg ${policyResult.allowed ? 'text-green-700' : 'text-red-700'}`}>
                            {policyResult.allowed ? '✅ 市场准入' : '❌ 暂不支持直接准入'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-medium text-gray-600">{t('tools.policy.difficulty')}:</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            DIFFICULTY_LEVELS[policyResult.difficulty as keyof typeof DIFFICULTY_LEVELS]?.color === 'green' ? 'bg-green-100 text-green-700' :
                            DIFFICULTY_LEVELS[policyResult.difficulty as keyof typeof DIFFICULTY_LEVELS]?.color === 'yellow' ? 'bg-yellow-100 text-yellow-700' :
                            DIFFICULTY_LEVELS[policyResult.difficulty as keyof typeof DIFFICULTY_LEVELS]?.color === 'orange' ? 'bg-orange-100 text-orange-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {policyResult.difficulty}
                          </span>
                        </div>
                      </div>

                      {/* 时间周期 */}
                      <div className="bg-blue-50 rounded-2xl p-6">
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="w-5 h-5 text-blue-600" />
                          <span className="font-semibold text-blue-800">{t('tools.policy.timeline')}</span>
                        </div>
                        <div className="text-2xl font-bold text-blue-600">
                          {i18n.language === 'zh' ? policyResult.timeline : policyResult.timelineEn}
                        </div>
                      </div>

                      {/* 准入要求 */}
                      <div className="bg-white rounded-2xl p-6 border border-gray-200">
                        <div className="flex items-center gap-2 mb-3">
                          <CheckCircle className="w-5 h-5 text-emerald-500" />
                          <span className="font-semibold text-gray-800">{t('tools.policy.requirements')}</span>
                        </div>
                        <ul className="space-y-2">
                          {(i18n.language === 'zh' ? policyResult.requirements : policyResult.requirementsEn).map((req: string, i: number) => (
                            <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                              <span className="text-emerald-500 mt-1">•</span>
                              {req}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* 所需材料 */}
                      <div className="bg-white rounded-2xl p-6 border border-gray-200">
                        <div className="flex items-center gap-2 mb-3">
                          <Zap className="w-5 h-5 text-amber-500" />
                          <span className="font-semibold text-gray-800">{t('tools.policy.documents')}</span>
                        </div>
                        <ul className="space-y-2">
                          {(i18n.language === 'zh' ? policyResult.documents : policyResult.documentsEn).map((doc: string, i: number) => (
                            <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                              <span className="text-amber-500 mt-1">•</span>
                              {doc}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* 注意事项 */}
                      {policyResult.warnings && policyResult.warnings.length > 0 && (
                        <div className="bg-orange-50 rounded-2xl p-6 border border-orange-200">
                          <div className="flex items-center gap-2 mb-3">
                            <AlertTriangle className="w-5 h-5 text-orange-500" />
                            <span className="font-semibold text-orange-800">{t('tools.policy.warnings')}</span>
                          </div>
                          <ul className="space-y-2">
                            {(i18n.language === 'zh' ? policyResult.warnings : policyResult.warningsEn).map((warn: string, i: number) => (
                              <li key={i} className="text-sm text-orange-700 flex items-start gap-2">
                                <span className="text-orange-500 mt-1">⚠</span>
                                {warn}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* 订阅按钮 */}
                      <button className="w-full py-3 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-xl font-medium hover:from-purple-600 hover:to-indigo-600 transition-all flex items-center justify-center gap-2">
                        <Bell className="w-5 h-5" />
                        {t('tools.policy.subscribeAlert')}
                      </button>
                    </>
                  ) : (
                    <div className="text-center py-12 text-gray-400">
                      <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>{i18n.language === 'zh' ? '选择目标市场和产品类型，查询准入规则' : 'Select target market and product type to check access rules'}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 适配度匹配工具 */}
          {activeTool === 3 && (
            <div className="p-8 md:p-12">
              <h3 className="text-2xl font-bold text-gray-800 mb-8 flex items-center gap-3">
                <Compass className="w-7 h-7 text-emerald-500" />
                {t('tools.match.title')}
              </h3>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('tools.match.product')}
                    </label>
                    <select
                      value={matchProduct}
                      onChange={(e) => setMatchProduct(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
                    >
                      <option value="supplement">💊 保健食品/膳食补充剂</option>
                      <option value="traditional">🌿 传统草药/中药制剂</option>
                      <option value="cosmetic">✨ 化妆品/护肤品</option>
                      <option value="food">🍎 普通食品</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('tools.match.budget')}
                    </label>
                    <select
                      value={matchBudget}
                      onChange={(e) => setMatchBudget(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
                    >
                      <option value="low">💰 10万美元以下</option>
                      <option value="medium">💰💰 10-50万美元</option>
                      <option value="high">💰💰💰 50万美元以上</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('tools.match.timeline')}
                    </label>
                    <select
                      value={matchTimeline}
                      onChange={(e) => setMatchTimeline(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
                    >
                      <option value="6">🚀 6个月内</option>
                      <option value="12">🚶 6-12个月</option>
                      <option value="24">🏃 1-2年</option>
                      <option value="36">🐢 2年以上</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('tools.match.advantage')}
                    </label>
                    <select
                      value={matchAdvantage}
                      onChange={(e) => setMatchAdvantage(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
                    >
                      <option value="quality">⭐ 产品质量与标准</option>
                      <option value="brand">🏆 品牌与渠道</option>
                      <option value="price">💵 价格竞争力</option>
                      <option value="technology">🔬 技术创新</option>
                    </select>
                  </div>

                  <button
                    onClick={runMatchAnalysis}
                    disabled={isLoadingAnalysis}
                    className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-medium hover:from-emerald-600 hover:to-teal-600 transition-all disabled:opacity-50"
                  >
                    {isLoadingAnalysis ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        {t('tools.common.analyzing')}
                      </span>
                    ) : (
                      t('tools.match.analyze')
                    )}
                  </button>
                </div>

                <div className="space-y-4">
                  {aiAnalysis ? (
                    <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl p-6 border border-purple-100">
                      <h4 className="font-semibold text-purple-800 mb-3 flex items-center gap-2">
                        <Sparkles className="w-5 h-5" />
                        {t('tools.match.result')}
                      </h4>
                      <div className="text-gray-700 whitespace-pre-line">{aiAnalysis}</div>
                      
                      <button
                        onClick={() => {
                          const contactSection = document.getElementById('contact');
                          if (contactSection) contactSection.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="mt-4 w-full py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-all flex items-center justify-center gap-2"
                      >
                        {i18n.language === 'zh' ? '预约一对一咨询' : 'Book 1-on-1 Consultation'}
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-400">
                      <Compass className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>{i18n.language === 'zh' ? '填写您的条件，获取AI智能市场推荐' : 'Fill in your criteria to get AI-powered market recommendations'}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 市场准入自测 */}
          {activeTool === 4 && (
            <div className="p-8 md:p-12">
              <h3 className="text-2xl font-bold text-gray-800 mb-8 flex items-center gap-3">
                <Target className="w-7 h-7 text-emerald-500" />
                {t('tools.quiz.title')}
              </h3>
              
              <div className="max-w-2xl mx-auto">
                {quizQuestions.map((q, qIndex) => (
                  <div key={q.id} className="mb-8">
                    <p className="font-medium text-gray-800 mb-4">{qIndex + 1}. {q.question}</p>
                    <div className="space-y-2">
                      {q.options.map((opt) => (
                        <label
                          key={opt.value}
                          className={`flex items-center gap-3 p-4 rounded-xl cursor-pointer transition-all ${
                            quizAnswers[q.id] === opt.value
                              ? 'bg-emerald-100 border-emerald-300 border'
                              : 'bg-gray-50 border border-gray-200 hover:bg-emerald-50'
                          }`}
                        >
                          <input
                            type="radio"
                            name={`question-${q.id}`}
                            value={opt.value}
                            checked={quizAnswers[q.id] === opt.value}
                            onChange={() => setQuizAnswers({ ...quizAnswers, [q.id]: opt.value })}
                            className="w-4 h-4 text-emerald-600"
                          />
                          <span className="text-gray-700">{opt.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}

                <button
                  onClick={() => runAIAnalysis('quiz')}
                  disabled={Object.keys(quizAnswers).length < 4 || isLoadingAnalysis}
                  className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-medium hover:from-emerald-600 hover:to-teal-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoadingAnalysis ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      {t('tools.common.analyzing')}
                    </span>
                  ) : (
                    t('tools.quiz.submit')
                  )}
                </button>

                {/* AI 分析结果 */}
                {aiAnalysis && (
                  <div className="mt-8 p-6 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl border border-purple-100">
                    <h4 className="font-semibold text-purple-800 mb-3 flex items-center gap-2">
                      <Sparkles className="w-5 h-5" />
                      {t('tools.common.aiResult')}
                    </h4>
                    <p className="text-gray-700 whitespace-pre-line">{aiAnalysis}</p>
                    
                    <button
                      onClick={() => {
                        const contactSection = document.getElementById('contact');
                        if (contactSection) contactSection.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="mt-4 flex items-center justify-center gap-2 w-full py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-all"
                    >
                      {t('tools.quiz.bookConsultation')}
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ROI 模拟器 */}
          {activeTool === 5 && (
            <div className="p-8 md:p-12">
              <h3 className="text-2xl font-bold text-gray-800 mb-8 flex items-center gap-3">
                <TrendingUp className="w-7 h-7 text-emerald-500" />
                {t('tools.roi.title')}
              </h3>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('tools.roi.market')}
                    </label>
                    <select
                      value={roiInputs.market}
                      onChange={(e) => setRoiInputs({ ...roiInputs, market: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
                    >
                      <option value="japan">🇯🇵 日本</option>
                      <option value="australia">🇦🇺 澳大利亚</option>
                      <option value="southeast">🇸🇬 东南亚</option>
                      <option value="europe">🇪🇺 欧洲</option>
                      <option value="middleEast">🇸🇦 中东</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('tools.roi.investment')} (USD)
                    </label>
                    <input
                      type="number"
                      value={roiInputs.investment}
                      onChange={(e) => setRoiInputs({ ...roiInputs, investment: Number(e.target.value) })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('tools.roi.price')} (USD)
                    </label>
                    <input
                      type="number"
                      value={roiInputs.productPrice}
                      onChange={(e) => setRoiInputs({ ...roiInputs, productPrice: Number(e.target.value) })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('tools.roi.sales')}
                    </label>
                    <input
                      type="number"
                      value={roiInputs.annualSales}
                      onChange={(e) => setRoiInputs({ ...roiInputs, annualSales: Number(e.target.value) })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
                    />
                  </div>

                  <button
                    onClick={calculateROI}
                    className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-medium hover:from-emerald-600 hover:to-teal-600 transition-all"
                  >
                    {t('tools.roi.calculate')}
                  </button>
                </div>

                <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6">
                  {roiResult ? (
                    <>
                      <h4 className="font-semibold text-gray-800 mb-6">{t('tools.roi.result')}</h4>
                      
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="bg-white rounded-xl p-4 text-center">
                          <div className="text-2xl font-bold text-amber-600">${roiResult.revenue.toLocaleString()}</div>
                          <div className="text-sm text-gray-500">{t('tools.roi.revenue')}</div>
                        </div>
                        <div className="bg-white rounded-xl p-4 text-center">
                          <div className="text-2xl font-bold text-green-600">${roiResult.profit.toLocaleString()}</div>
                          <div className="text-sm text-gray-500">{t('tools.roi.profit')}</div>
                        </div>
                      </div>

                      <div className="bg-white rounded-xl p-4 mb-6">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-gray-600">{t('tools.roi.roi')}</span>
                          <span className={`text-xl font-bold ${roiResult.roi > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {roiResult.roi.toFixed(1)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${roiResult.roi > 0 ? 'bg-green-500' : 'bg-red-500'}`}
                            style={{ width: `${Math.min(Math.abs(roiResult.roi), 100)}%` }}
                          />
                        </div>
                      </div>

                      <div className="text-center mb-6">
                        <div className="text-3xl font-bold text-emerald-600">{roiResult.paybackMonths}</div>
                        <div className="text-sm text-gray-500">{t('tools.roi.payback')}</div>
                      </div>

                      <button
                        onClick={() => runAIAnalysis('roi')}
                        disabled={isLoadingAnalysis}
                        className="w-full py-3 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-xl font-medium hover:from-purple-600 hover:to-indigo-600 transition-all disabled:opacity-50"
                      >
                        {isLoadingAnalysis ? (
                          <span className="flex items-center justify-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            {t('tools.common.analyzing')}
                          </span>
                        ) : (
                          t('tools.roi.getAdvice')
                        )}
                      </button>
                    </>
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>{t('tools.roi.hint')}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* AI 分析结果 */}
              {aiAnalysis && (
                <div className="mt-8 p-6 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl border border-purple-100">
                  <h4 className="font-semibold text-purple-800 mb-3 flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    {t('tools.common.aiAdvice')}
                  </h4>
                  <p className="text-gray-700 whitespace-pre-line">{aiAnalysis}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">{t('tools.cta.desc')}</p>
          <button
            onClick={() => {
              const contactSection = document.getElementById('contact');
              if (contactSection) contactSection.scrollIntoView({ behavior: 'smooth' });
            }}
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-full font-medium hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg"
          >
            {t('tools.cta.button')}
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default Tools;
