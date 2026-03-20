/**
 * 可行性评估板块 - AI实时市场分析
 * 数据来源: AI 实时获取
 */

import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  X,
  Sparkles,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import { useAIFeasibility } from '@/hooks/useAIData';

export default function FeasibilityAssessment() {
  const { i18n } = useTranslation();
  const isZh = i18n.language === 'zh';
  
  // 使用AI实时数据
  const { content: data, loading, error, refresh }: { content: any; loading: boolean; error: string | null; refresh: () => void } = useAIFeasibility();
  
  const [showDetails, setShowDetails] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);
  const [drawerContent, setDrawerContent] = useState<{ title: string; content: string } | null>(null);

  // 风险等级颜色 - 同时支持中英文
  const riskColors: Record<string, { bg: string; text: string; label: string }> = {
    low: { bg: 'bg-green-500', text: 'text-green-400', label: isZh ? '低风险' : 'Low Risk' },
    medium: { bg: 'bg-yellow-500', text: 'text-yellow-400', label: isZh ? '中等风险' : 'Medium Risk' },
    high: { bg: 'bg-red-500', text: 'text-red-400', label: isZh ? '高风险' : 'High Risk' },
    // 中文值兼容
    '低': { bg: 'bg-green-500', text: 'text-green-400', label: isZh ? '低风险' : 'Low Risk' },
    '中等': { bg: 'bg-yellow-500', text: 'text-yellow-400', label: isZh ? '中等风险' : 'Medium Risk' },
    '高': { bg: 'bg-red-500', text: 'text-red-400', label: isZh ? '高风险' : 'High Risk' },
  };

  // 获取风险等级，处理中英文值
  const getRiskColor = (risk: string | undefined): { bg: string; text: string; label: string } => {
    if (!risk) return riskColors.medium;
    if (riskColors[risk]) return riskColors[risk];
    // 尝试映射中文到英文
    const chineseToEnglish: Record<string, string> = {
      '低': 'low', '低风险': 'low',
      '中等': 'medium', '中': 'medium',
      '高': 'high', '高风险': 'high'
    };
    return riskColors[chineseToEnglish[risk]] || riskColors.medium;
  };

  const currentRisk = getRiskColor(data?.risk);

  // 打开抽屉
  const openDrawer = (title: string, contentKey: string) => {
    const content = isZh 
      ? (data as any)?.[contentKey] || (data as any)?.[contentKey + 'En'] || ''
      : (data as any)?.[contentKey + 'En'] || (data as any)?.[contentKey] || '';
    setDrawerContent({ title, content });
    setShowDrawer(true);
  };

  if (loading) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
        <p className="text-gray-400">{isZh ? '正在获取AI分析数据...' : 'Fetching AI analysis...'}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[400px]">
        <AlertTriangle className="w-10 h-10 text-red-500 mb-4" />
        <p className="text-red-400 mb-4">{error}</p>
        <button
          onClick={refresh}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          {isZh ? '重试' : 'Retry'}
        </button>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[400px]">
        <Sparkles className="w-10 h-10 text-gray-500 mb-4" />
        <p className="text-gray-400">{isZh ? '请先选择市场和产品类别' : 'Please select market and product category first'}</p>
      </div>
    );
  }

  return (
    <section className="p-6 animate-fadeIn">
      {/* 标题区 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">
              {isZh ? '市场可行性评估' : 'Market Feasibility Assessment'}
            </h3>
            <p className="text-sm text-gray-400">
              {isZh ? 'AI实时分析' : 'AI Real-time Analysis'}
            </p>
          </div>
        </div>
        <button
          onClick={refresh}
          className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
          title={isZh ? '刷新数据' : 'Refresh Data'}
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      {/* 核心指标卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {/* 市场热度 */}
        <div className="bg-gray-700/50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-blue-400" />
            <span className="text-sm text-gray-400">{isZh ? '市场热度' : 'Market Heat'}</span>
          </div>
          <div className="text-2xl font-bold text-white">{data.heat || 0}</div>
          <div className="w-full bg-gray-600 rounded-full h-2 mt-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all" 
              style={{ width: `${data.heat || 0}%` }}
            />
          </div>
        </div>

        {/* 增长潜力 */}
        <div className="bg-gray-700/50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-green-400" />
            <span className="text-sm text-gray-400">{isZh ? '增长潜力' : 'Growth Potential'}</span>
          </div>
          <div className="text-2xl font-bold text-white">{(data.growth || 0).toFixed(1)}%</div>
          <div className="w-full bg-gray-600 rounded-full h-2 mt-2">
            <div 
              className="bg-green-500 h-2 rounded-full transition-all" 
              style={{ width: `${data.growth || 0}%` }}
            />
          </div>
        </div>

        {/* 风险等级 */}
        <div className="bg-gray-700/50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className={`w-4 h-4 ${currentRisk.text}`} />
            <span className="text-sm text-gray-400">{isZh ? '风险等级' : 'Risk Level'}</span>
          </div>
          <div className={`text-lg font-bold ${currentRisk.text}`}>{currentRisk.label}</div>
          <div className="flex gap-1 mt-2">
            {['low', 'medium', 'high'].map(level => (
              <div 
                key={level}
                className={`h-2 flex-1 rounded-full ${
                  data.risk === level 
                    ? riskColors[level as keyof typeof riskColors].bg 
                    : 'bg-gray-600'
                }`}
              />
            ))}
          </div>
        </div>

        {/* 竞争程度 */}
        <div className="bg-gray-700/50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="w-4 h-4 text-orange-400" />
            <span className="text-sm text-gray-400">{isZh ? '竞争程度' : 'Competition'}</span>
          </div>
          <div className="text-2xl font-bold text-white">{data.competition || 0}</div>
          <div className="w-full bg-gray-600 rounded-full h-2 mt-2">
            <div 
              className="bg-orange-500 h-2 rounded-full transition-all" 
              style={{ width: `${data.competition || 0}%` }}
            />
          </div>
        </div>
      </div>

      {/* AI推荐 */}
      <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-xl p-4 mb-6 border border-blue-500/30">
        <div className="flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-blue-400 mt-0.5" />
          <div>
            <div className="text-sm text-blue-400 mb-1">{isZh ? 'AI 智能推荐' : 'AI Recommendation'}</div>
            <div className="text-white font-medium">
              {isZh ? data.recommendation : data.recommendationEn}
            </div>
          </div>
        </div>
      </div>

      {/* 详细分析按钮 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <button
          onClick={() => openDrawer(isZh ? '政策要点' : 'Policy Points', 'policyPoints')}
          className="p-4 bg-gray-700/50 rounded-xl hover:bg-gray-700 transition-colors text-left"
        >
          <div className="flex items-center justify-between">
            <span className="text-white font-medium">{isZh ? '政策要点' : 'Policy Points'}</span>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </div>
        </button>
        <button
          onClick={() => openDrawer(isZh ? '准入门槛' : 'Entry Threshold', 'threshold')}
          className="p-4 bg-gray-700/50 rounded-xl hover:bg-gray-700 transition-colors text-left"
        >
          <div className="flex items-center justify-between">
            <span className="text-white font-medium">{isZh ? '准入门槛' : 'Entry Threshold'}</span>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </div>
        </button>
        <button
          onClick={() => openDrawer(isZh ? '物流渠道' : 'Logistics', 'logistics')}
          className="p-4 bg-gray-700/50 rounded-xl hover:bg-gray-700 transition-colors text-left"
        >
          <div className="flex items-center justify-between">
            <span className="text-white font-medium">{isZh ? '物流渠道' : 'Logistics'}</span>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </div>
        </button>
        <button
          onClick={() => openDrawer(isZh ? '成功案例' : 'Case Studies', 'caseStudies')}
          className="p-4 bg-gray-700/50 rounded-xl hover:bg-gray-700 transition-colors text-left"
        >
          <div className="flex items-center justify-between">
            <span className="text-white font-medium">{isZh ? '成功案例' : 'Case Studies'}</span>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </div>
        </button>
      </div>

      {/* 总结 */}
      <div className="mt-6 p-4 bg-gray-700/30 rounded-xl">
        <h4 className="text-white font-medium mb-2">{isZh ? '综合分析结论' : 'Conclusion'}</h4>
        <p className="text-gray-300 text-sm leading-relaxed">
          {isZh ? data.conclusion : data.conclusionEn}
        </p>
      </div>

      {/* 抽屉层 */}
      {showDrawer && drawerContent && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center">
          <div className="bg-gray-800 w-full sm:max-w-lg max-h-[80vh] rounded-t-2xl sm:rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-gray-700 flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">{drawerContent.title}</h3>
              <button onClick={() => setShowDrawer(false)} className="p-1 hover:bg-gray-700 rounded">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto max-h-[60vh]">
              <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{drawerContent.content}</p>
            </div>
            <div className="p-4 border-t border-gray-700">
              <button
                onClick={() => setShowDrawer(false)}
                className="w-full py-3 bg-gray-700 text-white rounded-lg font-medium hover:bg-gray-600 transition-colors"
              >
                {isZh ? '关闭' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

// 辅助组件
function ChevronRight({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  );
}
