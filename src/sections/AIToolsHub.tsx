/**
 * AI智能工具中心 - 整合所有AI工具入口
 * 设计理念: 统一入口、Tab切换、两级市场选择、模块化展示
 */

import { useState, useMemo, useContext } from 'react';
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
} from 'lucide-react';
import FeasibilityAssessment from './FeasibilityAssessment';
import Tools from './Tools';
import ComplianceTest from './ComplianceTest';
import MarketInsight from './MarketInsight';
import ChannelMatch from './ChannelMatch';
import RiskWarning from './RiskWarning';
import { MarketContext, type TargetMarket } from './aiToolsMarketContext';

// 目标市场数据（与RiskWarning一致）
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
  { id: 'hongkong', name: '香港', nameEn: 'Hong Kong', flag: '🇭🇰', region: 'asiapacific', priority: 'tier2', gdp: '0.4万亿' },
  { id: 'taiwan', name: '台湾', nameEn: 'Taiwan', flag: '🇹🇼', region: 'asiapacific', priority: 'tier2', gdp: '0.8万亿' },
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
  { id: 'asiapacific', name: '亚太发达', nameEn: 'Asia Pacific', flag: '🌏', count: 7 },
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
];

export default function AIToolsHub() {
  const { i18n } = useTranslation();
  const isZh = i18n.language === 'zh';
  const [activeTab, setActiveTab] = useState('feasibility');
  
  // 使用全局共享的 MarketContext
  const { selectedMarket, selectedRegion, setSelectedMarket, setSelectedRegion } = useContext(MarketContext);

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
  };

  return (
    <section id="ai-tools" className="py-12 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-6xl mx-auto px-4">
          
          {/* 标题区 */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium mb-4">
              <Bot className="w-4 h-4" />
              {isZh ? 'AI 智能工具中心' : 'AI Tools Hub'}
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              {isZh ? '一站式AI出海智能解决方案' : 'One-Stop AI Overseas Solution'}
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto text-lg">
              {isZh 
                ? '基于全球35个国家数据积累，6大AI模块全链路解决出海痛点'
                : 'Based on 35 countries data, 6 AI modules solve overseas pain points'}
            </p>
          </div>

          {/* 统一市场选择器 - 两级层级 */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-5 h-5 text-emerald-600" />
              <span className="font-bold text-gray-900">
                {isZh ? '选择目标市场' : 'Select Target Market'}
              </span>
              {selectedMarket && (
                <span className="ml-2 px-2 py-1 bg-emerald-100 text-emerald-700 text-sm rounded-full">
                  {selectedMarket.flag} {isZh ? selectedMarket.name : selectedMarket.nameEn}
                </span>
              )}
            </div>

            {/* 一级选择：区域 */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
              {REGIONS.map(region => (
                <button
                  key={region.id}
                  onClick={() => {
                    setSelectedRegion(selectedRegion === region.id ? null : region.id);
                    if (selectedRegion === region.id) setSelectedMarket(null);
                  }}
                  className={`p-3 rounded-xl border-2 transition-all text-center ${
                    selectedRegion === region.id 
                      ? 'border-emerald-500 bg-emerald-50' 
                      : 'border-gray-200 hover:border-emerald-300'
                  }`}
                >
                  <div className="text-2xl mb-1">{region.flag}</div>
                  <div className="font-medium text-gray-900 text-sm">
                    {isZh ? region.name : region.nameEn}
                  </div>
                  <div className="text-xs text-gray-500">
                    {region.count} {isZh ? '个国家' : 'countries'}
                  </div>
                </button>
              ))}
            </div>

            {/* 二级选择：Tier分级 + 具体国家 */}
            {selectedRegion && (
              <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-gray-500" />
                    <span className="font-medium text-gray-700">
                      {isZh ? regionName?.name : regionName?.nameEn}
                    </span>
                  </div>
                  <button 
                    onClick={() => {
                      setSelectedRegion(null);
                      setSelectedMarket(null);
                    }}
                    className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    {isZh ? '清除选择' : 'Clear'}
                  </button>
                </div>
                
                {['tier1', 'tier2', 'tier3'].map(tier => {
                  const tierMarkets = filteredMarkets.filter(m => m.priority === tier);
                  if (tierMarkets.length === 0) return null;
                  
                  return (
                    <div key={tier} className="mb-3 last:mb-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${
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
                      
                      <div className="flex flex-wrap gap-2">
                        {tierMarkets.map(market => (
                          <button
                            key={market.id}
                            onClick={() => handleMarketSelect(market)}
                            className={`px-3 py-2 rounded-lg border-2 transition-all flex items-center gap-2 ${
                              selectedMarket?.id === market.id 
                                ? 'border-emerald-500 bg-emerald-50' 
                                : 'border-gray-200 hover:border-emerald-300 bg-white'
                            }`}
                          >
                            <span className="text-lg">{market.flag}</span>
                            <span className="font-medium text-gray-900 text-sm">
                              {isZh ? market.name : market.nameEn}
                            </span>
                            {selectedMarket?.id === market.id && (
                              <CheckCircle className="w-4 h-4 text-emerald-500" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Tab导航 */}
          <div className="mb-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      relative p-3 rounded-xl text-left transition-all duration-300
                      ${isActive 
                        ? `bg-gradient-to-br ${tab.color} text-white shadow-lg` 
                        : 'bg-white border border-gray-200 text-gray-700 hover:border-emerald-300 hover:shadow-md'
                      }
                    `}
                  >
                    <Icon className={`w-5 h-5 mb-1 ${isActive ? 'text-white' : ''}`} />
                    <div className={`text-sm font-medium ${isActive ? 'text-white' : ''}`}>
                      {isZh ? tab.name : tab.nameEn}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 内容区 */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            {/* 市场分析 */}
            {activeTab === 'feasibility' && (
              <div className="animate-fadeIn">
                <FeasibilityAssessment />
              </div>
            )}

            {/* 成本测算 */}
            {activeTab === 'cost' && (
              <div className="animate-fadeIn">
                <Tools />
              </div>
            )}

            {/* 合规自测 */}
            {activeTab === 'compliance' && (
              <div className="animate-fadeIn">
                <ComplianceTest />
              </div>
            )}

            {/* 市场洞察 */}
            {activeTab === 'insight' && (
              <div className="animate-fadeIn">
                <MarketInsight />
              </div>
            )}

            {/* 渠道推荐 */}
            {activeTab === 'channel' && (
              <div className="animate-fadeIn">
                <ChannelMatch />
              </div>
            )}

            {/* 风险预警 */}
            {activeTab === 'risk' && (
              <div className="animate-fadeIn">
                <RiskWarning />
              </div>
            )}
          </div>

        </div>
      </section>
    );
}
