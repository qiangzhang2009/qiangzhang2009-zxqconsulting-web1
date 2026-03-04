/**
 * 智能决策工具板块
 * 包含：成本计算、时间估算、政策查询、市场匹配、AI分析
 */

import { useState, useRef, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Calculator, Clock, Search, TrendingUp, Sparkles, X } from 'lucide-react';
import { PRODUCT_CATEGORIES, MARKET_POLICIES } from '@/data/marketPolicies';
import { DEEPSEEK_CONFIG, AI_NAME_REPLACEMENTS } from '@/config';
import SmartMarketSelector from '@/components/SmartMarketSelector';

gsap.registerPlugin(ScrollTrigger);

// 统一的市场配置 - 所有工具使用同一套数据
// 成本计算数据
const COST_DATA: Record<string, { name: string; items: { name: string; min: number; max: number }[] }> = {
  japan: {
    name: '日本',
    items: [
      { name: 'PMDA注册费', min: 50000, max: 200000 },
      { name: 'QUATCO检测费', min: 3000, max: 10000 },
      { name: '翻译公证费', min: 2000, max: 5000 },
      { name: '当地代理费', min: 5000, max: 15000 },
    ]
  },
  australia: {
    name: '澳大利亚',
    items: [
      { name: 'TGA注册费', min: 10000, max: 50000 },
      { name: '毒理测试费', min: 5000, max: 15000 },
      { name: '翻译公证费', min: 2000, max: 5000 },
      { name: '当地代理费', min: 5000, max: 15000 },
    ]
  },
  southeast: {
    name: '东南亚',
    items: [
      { name: '各国准入注册费', min: 3000, max: 10000 },
      { name: '检测费', min: 3000, max: 8000 },
      { name: '翻译费', min: 1000, max: 3000 },
      { name: '当地代理费', min: 3000, max: 8000 },
    ]
  },
  europe: {
    name: '欧洲',
    items: [
      { name: 'EMA注册费', min: 30000, max: 150000 },
      { name: '临床测试费', min: 10000, max: 30000 },
      { name: '翻译公证费', min: 5000, max: 10000 },
      { name: '当地代理费', min: 10000, max: 30000 },
    ]
  },
  middleEast: {
    name: '中东',
    items: [
      { name: '注册费', min: 5000, max: 15000 },
      { name: '检测费', min: 3000, max: 8000 },
      { name: '翻译费', min: 2000, max: 5000 },
      { name: '当地代理费', min: 3000, max: 8000 },
    ]
  },
  usa: {
    name: '美国',
    items: [
      { name: 'FDA注册费', min: 5000, max: 20000 },
      { name: '检测费', min: 8000, max: 25000 },
      { name: '翻译费', min: 3000, max: 8000 },
      { name: '当地代理费', min: 5000, max: 15000 },
    ]
  },
};

// 时间估算数据
const TIMELINE_DATA: Record<string, { name: string; phases: { name: string; duration: string }[] }> = {
  japan: {
    name: '日本',
    phases: [
      { name: '资料准备', duration: '2-3月' },
      { name: 'PMDA审查', duration: '8-12月' },
      { name: '现场核查', duration: '2-3月' },
      { name: '获得认证', duration: '1-2月' },
    ]
  },
  australia: {
    name: '澳大利亚',
    phases: [
      { name: '资料准备', duration: '1-2月' },
      { name: 'TGA审查', duration: '4-10月' },
      { name: '补充资料', duration: '1-3月' },
      { name: '获得认证', duration: '1-2月' },
    ]
  },
  southeast: {
    name: '东南亚',
    phases: [
      { name: '资料准备', duration: '1-2月' },
      { name: '各国审查', duration: '2-6月' },
      { name: '批准上市', duration: '1-2月' },
    ]
  },
  europe: {
    name: '欧洲',
    phases: [
      { name: '资料准备', duration: '3-6月' },
      { name: '公告机构审核', duration: '6-18月' },
      { name: '临床评估', duration: '6-12月' },
      { name: '获得CE', duration: '1-2月' },
    ]
  },
  middleEast: {
    name: '中东',
    phases: [
      { name: '资料准备', duration: '1-2月' },
      { name: 'SFDA审查', duration: '2-5月' },
      { name: '获得批准', duration: '1-2月' },
    ]
  },
  usa: {
    name: '美国',
    phases: [
      { name: '资料准备', duration: '2-3月' },
      { name: 'FDA审查', duration: '6-12月' },
      { name: '补充资料', duration: '2-4月' },
      { name: '获得批准', duration: '1-2月' },
    ]
  },
};

// 市场信息映射
const MARKET_INFO: Record<string, { name: string; flag: string; nameEn: string }> = {
  japan: { name: '日本', flag: '🇯🇵', nameEn: 'Japan' },
  australia: { name: '澳大利亚', flag: '🇦🇺', nameEn: 'Australia' },
  southeast: { name: '东南亚', flag: '🇸🇬', nameEn: 'Southeast Asia' },
  usa: { name: '美国', flag: '🇺🇸', nameEn: 'USA' },
  europe: { name: '欧洲', flag: '🇪🇺', nameEn: 'Europe' },
  middleEast: { name: '中东', flag: '🇸🇦', nameEn: 'Middle East' },
  korea: { name: '韩国', flag: '🇰🇷', nameEn: 'South Korea' },
  singapore: { name: '新加坡', flag: '🇸🇬', nameEn: 'Singapore' },
  thailand: { name: '泰国', flag: '🇹🇭', nameEn: 'Thailand' },
  malaysia: { name: '马来西亚', flag: '🇲🇾', nameEn: 'Malaysia' },
  indonesia: { name: '印度尼西亚', flag: '🇮🇩', nameEn: 'Indonesia' },
  vietnam: { name: '越南', flag: '🇻🇳', nameEn: 'Vietnam' },
  newzealand: { name: '新西兰', flag: '🇳🇿', nameEn: 'New Zealand' },
  uk: { name: '英国', flag: '🇬🇧', nameEn: 'United Kingdom' },
  germany: { name: '德国', flag: '🇩🇪', nameEn: 'Germany' },
  france: { name: '法国', flag: '🇫🇷', nameEn: 'France' },
  canada: { name: '加拿大', flag: '🇨🇦', nameEn: 'Canada' },
  india: { name: '印度', flag: '🇮🇳', nameEn: 'India' },
  brazil: { name: '巴西', flag: '🇧🇷', nameEn: 'Brazil' },
  uae: { name: '阿联酋', flag: '🇦🇪', nameEn: 'UAE' },
  hongkong: { name: '中国香港', flag: '🇭🇰', nameEn: 'Hong Kong' },
  taiwan: { name: '中国台湾', flag: '🇹🇼', nameEn: 'Taiwan' },
};

// 政策查询的 ID 映射
const getPolicyId = (marketId: string): string => {
  const map: Record<string, string> = {
    'europe': 'eu',
    'middleEast': 'middleeast',
    'hongkong': 'hongkong',
  };
  return map[marketId] || marketId;
};

export default function Tools() {
  const { t } = useTranslation();
  const sectionRef = useRef<HTMLDivElement>(null);
  
  // 核心状态：统一的目标市场
  const [globalMarket, setGlobalMarket] = useState('japan');
  
  // 成本计算器
  const [costProductType, setCostProductType] = useState('supplement');
  const costData = COST_DATA[globalMarket];
  
  // 政策查询
  const [policyCategory, setPolicyCategory] = useState('supplement');
  const policyId = getPolicyId(globalMarket);
  const policyData = MARKET_POLICIES[policyId]?.[policyCategory];
  
  // 时间估算
  const timelineData = TIMELINE_DATA[globalMarket];
  
  // ROI 计算器
  const [roiInvestment, setRoiInvestment] = useState(100000);
  const [roiProductPrice, setRoiProductPrice] = useState(50);
  const [roiAnnualSales, setRoiAnnualSales] = useState(10000);
  
  // AI 分析
  const [aiAnalysis, setAiAnalysis] = useState('');
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);

  // 计算总成本
  const totalCost = useMemo(() => {
    if (!costData) return 0;
    return costData.items.reduce((sum, item) => sum + (item.min + item.max) / 2, 0);
  }, [costData]);

  // 计算 ROI
  const roiResult = useMemo(() => {
    const revenue = roiProductPrice * roiAnnualSales;
    const cost = totalCost;
    const profit = revenue - cost;
    const roi = cost > 0 ? ((revenue - cost) / cost) * 100 : 0;
    return { revenue, cost, profit, roi };
  }, [roiProductPrice, roiAnnualSales, totalCost]);

  // 运行 AI 分析
  const runAIAnalysis = async (type: string) => {
    setIsLoadingAnalysis(true);
    const marketInfo = MARKET_INFO[globalMarket] || { name: '日本', flag: '🇯🇵', nameEn: 'Japan' };
    
    let prompt = '';
    if (type === 'cost') {
      prompt = `作为中医药产品出海专家，请分析进入${marketInfo.name}市场的成本结构和注意事项。`;
    } else if (type === 'timeline') {
      prompt = `作为中医药产品出海专家，请分析${marketInfo.name}市场的审批时间线和流程难点。`;
    } else if (type === 'roi') {
      prompt = `作为中医药产品出海专家，请分析投资$${roiInvestment.toLocaleString()}进入${marketInfo.name}市场的回报预期。`;
    } else {
      prompt = `作为中医药产品出海专家，请推荐最适合中医药产品出海的目标市场，并说明理由。`;
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
      
      // 替换 AI 名称
      Object.entries(AI_NAME_REPLACEMENTS).forEach(([key, value]) => {
        content = content.replace(new RegExp(key, 'gi'), value);
      });
      
      setAiAnalysis(content);
    } catch (error) {
      setAiAnalysis('抱歉，AI分析服务暂时不可用。请稍后再试。');
    } finally {
      setIsLoadingAnalysis(false);
    }
  };

  // 当前市场信息
  const currentMarket = MARKET_INFO[globalMarket] || MARKET_INFO.japan;

  return (
    <section ref={sectionRef} id="tools" className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4">
        {/* 标题 */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            {t('tools.title') || '智能决策工具'}
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            {t('tools.subtitle') || '选择目标市场，获取专业的成本、时间、政策分析和投资回报建议'}
          </p>
        </div>

        {/* 全局市场选择器 */}
        <div className="mb-12 bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-emerald-600" />
            <span className="font-medium text-emerald-700">{t('tools.selectMarket') || '选择目标市场'}</span>
            {currentMarket && (
              <span className="ml-2 text-lg">{currentMarket.flag} {currentMarket.name}</span>
            )}
          </div>
          <SmartMarketSelector
            value={globalMarket}
            onChange={setGlobalMarket}
          />
        </div>

        {/* 工具网格 */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* 成本计算器 */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                <Calculator className="w-5 h-5 text-emerald-600" />
              </div>
              <h3 className="font-bold text-gray-800">{t('tools.cost.name') || '成本计算器'}</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('tools.cost.productType') || '产品类型'}
                </label>
                <select
                  value={costProductType}
                  onChange={(e) => setCostProductType(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-emerald-500 outline-none"
                >
                  <option value="supplement">💊 保健食品</option>
                  <option value="traditional">🌿 传统草药</option>
                  <option value="cosmetic">✨ 化妆品</option>
                  <option value="food">🍎 普通食品</option>
                </select>
              </div>

              {costData && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="text-2xl font-bold text-emerald-600 mb-3">
                    ${(totalCost * (costProductType === 'medical' ? 1.5 : costProductType === 'traditional' ? 1.2 : 1)).toLocaleString()}
                    <span className="text-sm font-normal text-gray-500"> - ${((totalCost * 1.5) * (costProductType === 'medical' ? 1.5 : costProductType === 'traditional' ? 1.2 : 1)).toLocaleString()}</span>
                  </div>
                  <div className="space-y-2 text-sm">
                    {costData.items.map((item, i) => (
                      <div key={i} className="flex justify-between text-gray-600">
                        <span>{item.name}</span>
                        <span className="font-medium">${item.min.toLocaleString()}-${item.max.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={() => runAIAnalysis('cost')}
                disabled={isLoadingAnalysis}
                className="w-full py-2 bg-emerald-500 text-white rounded-lg font-medium hover:bg-emerald-600 disabled:opacity-50"
              >
                {isLoadingAnalysis ? '分析中...' : '🤖 AI成本分析'}
              </button>
            </div>
          </div>

          {/* 时间估算 */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="font-bold text-gray-800">{t('tools.time.name') || '时间估算'}</h3>
            </div>

            {timelineData ? (
              <div className="space-y-3">
                <div className="text-center py-4">
                  <div className="text-3xl font-bold text-blue-600">
                    {timelineData.phases.reduce((sum, p) => {
                      const match = p.duration.match(/(\d+)/);
                      return sum + (match ? parseInt(match[1]) : 0);
                    }, 0)}-{timelineData.phases.reduce((sum, p) => {
                      const match = p.duration.match(/(\d+)-(\d+)/);
                      return sum + (match ? parseInt(match[2]) : (match ? parseInt(match[1]) : 0));
                    }, 0)} 月
                  </div>
                  <div className="text-gray-500 text-sm">预计总时长</div>
                </div>
                <div className="space-y-2">
                  {timelineData.phases.map((phase, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs">
                        {i + 1}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-800">{phase.name}</div>
                      </div>
                      <div className="text-blue-600 text-sm font-medium">{phase.duration}</div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                暂无时间数据
              </div>
            )}

            <button
              onClick={() => runAIAnalysis('timeline')}
              disabled={isLoadingAnalysis}
              className="w-full mt-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 disabled:opacity-50"
            >
              {isLoadingAnalysis ? '分析中...' : '🤖 AI时间分析'}
            </button>
          </div>

          {/* 政策查询 */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                <Search className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="font-bold text-gray-800">{t('tools.policy.name') || '政策查询'}</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('tools.policy.selectCategory') || '产品类别'}
                </label>
                <select
                  value={policyCategory}
                  onChange={(e) => setPolicyCategory(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-purple-500 outline-none"
                >
                  {PRODUCT_CATEGORIES.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              {policyData ? (
                <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">准入状态</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      policyData.allowed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {policyData.allowed ? '✅ 允许进入' : '❌ 禁止进入'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">难度</span>
                    <span className="text-purple-600 font-medium">{policyData.difficulty}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">周期</span>
                    <span className="text-purple-600 font-medium">{policyData.timeline}</span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  暂无政策数据
                </div>
              )}
            </div>
          </div>

          {/* ROI 计算器 */}
          <div className="bg-white rounded-2xl shadow-lg p-6 md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-orange-600" />
              </div>
              <h3 className="font-bold text-gray-800">{t('tools.roi.name') || 'ROI 计算器'}</h3>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    初始投资 ($)
                  </label>
                  <input
                    type="number"
                    value={roiInvestment}
                    onChange={(e) => setRoiInvestment(Number(e.target.value))}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-orange-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    产品单价 ($)
                  </label>
                  <input
                    type="number"
                    value={roiProductPrice}
                    onChange={(e) => setRoiProductPrice(Number(e.target.value))}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-orange-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    预计年销量
                  </label>
                  <input
                    type="number"
                    value={roiAnnualSales}
                    onChange={(e) => setRoiAnnualSales(Number(e.target.value))}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-orange-500 outline-none"
                  />
                </div>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-6 space-y-4">
                <div className="text-center">
                  <div className="text-sm text-gray-600">预计年营收</div>
                  <div className="text-2xl font-bold text-orange-600">
                    ${roiResult.revenue.toLocaleString()}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-600">预估成本</div>
                  <div className="text-xl font-bold text-gray-700">
                    ${roiResult.cost.toLocaleString()}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-600">预估年利润</div>
                  <div className={`text-2xl font-bold ${roiResult.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${roiResult.profit.toLocaleString()}
                  </div>
                </div>
                <div className="text-center pt-2 border-t border-orange-200">
                  <div className="text-sm text-gray-600">投资回报率</div>
                  <div className={`text-3xl font-bold ${roiResult.roi >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {roiResult.roi.toFixed(1)}%
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => runAIAnalysis('roi')}
              disabled={isLoadingAnalysis}
              className="w-full mt-4 py-2 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 disabled:opacity-50"
            >
              {isLoadingAnalysis ? '分析中...' : '🤖 AI投资分析'}
            </button>
          </div>

          {/* AI 分析结果 */}
          {aiAnalysis && (
            <div className="bg-white rounded-2xl shadow-lg p-6 md:col-span-3">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-bold text-gray-800">AI 智能分析</h3>
                <button
                  onClick={() => setAiAnalysis('')}
                  className="ml-auto text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="prose max-w-none text-gray-700 whitespace-pre-wrap">
                {aiAnalysis}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
