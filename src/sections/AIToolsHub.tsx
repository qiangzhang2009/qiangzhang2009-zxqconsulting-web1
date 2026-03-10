/**
 * AI智能工具中心 - 整合所有AI工具入口
 * 设计理念: 统一入口、Tab切换、模块化展示
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Shield,
  Calculator,
  BarChart3,
  Compass,
  AlertTriangle,
  Bot,
  Globe,
  Package,
  TrendingUp,
  Clock,
  FileText,
  CheckCircle,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import FeasibilityAssessment from './FeasibilityAssessment';
import Tools from './Tools';

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

  return (
    <section id="ai-tools" className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-6xl mx-auto px-4">
        
        {/* 标题区 */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium mb-4">
            <Bot className="w-4 h-4" />
            {isZh ? 'AI 智能工具中心' : 'AI Tools Hub'}
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            {isZh ? '一站式AI出海智能解决方案' : 'One-Stop AI Overseas Solution'}
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto text-lg">
            {isZh 
              ? '基于全球30+国家数据积累，6大AI模块全链路解决出海痛点'
              : 'Based on 30+ countries data, 6 AI modules solve overseas pain points'}
          </p>
        </div>

        {/* Tab导航 */}
        <div className="mb-8">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    relative p-4 rounded-xl text-left transition-all duration-300
                    ${isActive 
                      ? `bg-gradient-to-br ${tab.color} text-white shadow-lg transform scale-105` 
                      : 'bg-white border border-gray-200 text-gray-700 hover:border-emerald-300 hover:shadow-md'
                    }
                  `}
                >
                  <Icon className={`w-6 h-6 mb-2 ${isActive ? 'text-white' : ''}`} />
                  <div className={`text-sm font-medium ${isActive ? 'text-white' : ''}`}>
                    {isZh ? tab.name : tab.nameEn}
                  </div>
                  <div className={`text-xs mt-1 ${isActive ? 'text-white/80' : 'text-gray-400'}`}>
                    {isZh ? tab.description : tab.descriptionEn}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 内容区 */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          {/* 市场分析 - 已实现 */}
          {activeTab === 'feasibility' && (
            <div className="animate-fadeIn">
              <FeasibilityAssessment />
            </div>
          )}

          {/* 成本测算 - 已实现 */}
          {activeTab === 'cost' && (
            <div className="animate-fadeIn">
              <Tools />
            </div>
          )}

          {/* 合规自测 - 即将上线 */}
          {activeTab === 'compliance' && (
            <div className="p-12 text-center animate-fadeIn">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Shield className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                {isZh ? '合规准入自测系统' : 'Compliance Assessment System'}
              </h3>
              <p className="text-gray-500 max-w-md mx-auto mb-8">
                {isZh 
                  ? '输入产品成分和目标市场，AI自动评估准入可行性，生成个性化合规方案'
                  : 'Input product ingredients and target market, AI automatically assesses feasibility'}
              </p>
              
              {/* 功能预览 */}
              <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto mb-8">
                <div className="p-4 bg-gray-50 rounded-xl">
                  <CheckCircle className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                  <div className="font-medium text-gray-900">{isZh ? '成分红线筛查' : 'Ingredient Screening'}</div>
                  <div className="text-sm text-gray-500">{isZh ? '30+国家成分数据库' : '30+ country database'}</div>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <FileText className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                  <div className="font-medium text-gray-900">{isZh ? '注册路径推荐' : 'Registration Path'}</div>
                  <div className="text-sm text-gray-500">{isZh ? '最优路径智能推荐' : 'Smart recommendations'}</div>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <Clock className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                  <div className="font-medium text-gray-900">{isZh ? '成本周期测算' : 'Cost & Timeline'}</div>
                  <div className="text-sm text-gray-500">{isZh ? '精准预算估算' : 'Accurate estimation'}</div>
                </div>
              </div>

              <button className="px-8 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors inline-flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                {isZh ? '立即试用' : 'Try Now'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* 市场洞察 - 即将上线 */}
          {activeTab === 'insight' && (
            <div className="p-12 text-center animate-fadeIn">
              <div className="w-20 h-20 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Compass className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                {isZh ? '市场洞察分析系统' : 'Market Insight System'}
              </h3>
              <p className="text-gray-500 max-w-md mx-auto mb-8">
                {isZh 
                  ? 'AI深度分析目标市场用户需求，生成差异化竞争策略'
                  : 'AI deeply analyzes target market user needs'}
              </p>
              
              {/* 功能预览 */}
              <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto mb-8">
                <div className="p-4 bg-gray-50 rounded-xl">
                  <BarChart3 className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                  <div className="font-medium text-gray-900">{isZh ? '用户画像分析' : 'User Profile'}</div>
                  <div className="text-sm text-gray-500">{isZh ? '精准目标人群定位' : 'Target audience'}</div>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <TrendingUp className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                  <div className="font-medium text-gray-900">{isZh ? '需求痛点挖掘' : 'Pain Points'}</div>
                  <div className="text-sm text-gray-500">{isZh ? '深度需求洞察' : 'Deep insights'}</div>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <Package className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                  <div className="font-medium text-gray-900">{isZh ? '竞品分析' : 'Competitor Analysis'}</div>
                  <div className="text-sm text-gray-500">{isZh ? '差异化定位建议' : 'Differentiation'}</div>
                </div>
              </div>

              <button className="px-8 py-3 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700 transition-colors inline-flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                {isZh ? '立即试用' : 'Try Now'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* 渠道推荐 - 即将上线 */}
          {activeTab === 'channel' && (
            <div className="p-12 text-center animate-fadeIn">
              <div className="w-20 h-20 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Globe className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                {isZh ? '智能渠道匹配系统' : 'Smart Channel Matching'}
              </h3>
              <p className="text-gray-500 max-w-md mx-auto mb-8">
                {isZh 
                  ? '基于产品特点和预算，AI智能推荐最适合的销售渠道'
                  : 'AI intelligently recommends the best sales channels'}
              </p>
              
              {/* 功能预览 */}
              <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto mb-8">
                <div className="p-4 bg-gray-50 rounded-xl">
                  <Compass className="w-8 h-8 text-cyan-500 mx-auto mb-2" />
                  <div className="font-medium text-gray-900">{isZh ? '渠道智能推荐' : 'Smart Recommendation'}</div>
                  <div className="text-sm text-gray-500">{isZh ? '精准匹配分析' : 'Precision matching'}</div>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <CheckCircle className="w-8 h-8 text-cyan-500 mx-auto mb-2" />
                  <div className="font-medium text-gray-900">{isZh ? '入驻门槛分析' : 'Entry Threshold'}</div>
                  <div className="text-sm text-gray-500">{isZh ? '准入条件清晰' : 'Clear conditions'}</div>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <TrendingUp className="w-8 h-8 text-cyan-500 mx-auto mb-2" />
                  <div className="font-medium text-gray-900">{isZh ? 'ROI预期测算' : 'ROI Projection'}</div>
                  <div className="text-sm text-gray-500">{isZh ? '投入产出分析' : 'Investment analysis'}</div>
                </div>
              </div>

              <button className="px-8 py-3 bg-cyan-600 text-white rounded-lg font-medium hover:bg-cyan-700 transition-colors inline-flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                {isZh ? '立即试用' : 'Try Now'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* 风险预警 - 即将上线 */}
          {activeTab === 'risk' && (
            <div className="p-12 text-center animate-fadeIn">
              <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <AlertTriangle className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                {isZh ? '全球风险预警系统' : 'Global Risk Warning System'}
              </h3>
              <p className="text-gray-500 max-w-md mx-auto mb-8">
                {isZh 
                  ? '7x24小时实时监测政策变动、汇率波动等风险因素'
                  : '7x24 real-time monitoring of policy changes'}
              </p>
              
              {/* 功能预览 */}
              <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto mb-8">
                <div className="p-4 bg-gray-50 rounded-xl">
                  <Shield className="w-8 h-8 text-red-500 mx-auto mb-2" />
                  <div className="font-medium text-gray-900">{isZh ? '政策变动监测' : 'Policy Monitoring'}</div>
                  <div className="text-sm text-gray-500">{isZh ? '实时预警推送' : 'Real-time alerts'}</div>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <TrendingUp className="w-8 h-8 text-red-500 mx-auto mb-2" />
                  <div className="font-medium text-gray-900">{isZh ? '汇率关税跟踪' : 'Exchange Rate'}</div>
                  <div className="text-sm text-gray-500">{isZh ? '成本波动预警' : 'Cost warnings'}</div>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                  <div className="font-medium text-gray-900">{isZh ? '应急方案生成' : 'Contingency Plans'}</div>
                  <div className="text-sm text-gray-500">{isZh ? '智能应对建议' : 'Smart responses'}</div>
                </div>
              </div>

              <button className="px-8 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors inline-flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                {isZh ? '立即试用' : 'Try Now'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

      </div>
    </section>
  );
}
