/**
 * 市场洞察板块 - AI实时市场洞察
 * 数据来源: AI 实时获取
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  TrendingUp,
  Users,
  Compass,
  RefreshCw,
  Loader2,
  X,
} from 'lucide-react';
import { useAIInsight } from '@/hooks/useAIData';

export default function MarketInsight() {
  const { i18n } = useTranslation();
  const isZh = i18n.language === 'zh';
  
  // 使用AI实时数据
  const { content: data, loading, error, refresh }: { content: any; loading: boolean; error: string | null; refresh: () => void } = useAIInsight();
  
  const [showDrawer, setShowDrawer] = useState(false);
  const [drawerContent, setDrawerContent] = useState<{ title: string; content: string } | null>(null);

  // 打开详情抽屉
  const openDrawer = (title: string, content: string) => {
    setDrawerContent({ title, content });
    setShowDrawer(true);
  };

  if (loading) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 text-amber-500 animate-spin mb-4" />
        <p className="text-gray-400">{isZh ? '正在获取AI市场洞察数据...' : 'Fetching AI market insights...'}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[400px]">
        <Compass className="w-10 h-10 text-red-500 mb-4" />
        <p className="text-red-400 mb-4">{error}</p>
        <button
          onClick={refresh}
          className="px-4 py-2 bg-amber-600 text-white rounded-lg flex items-center gap-2"
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
        <Compass className="w-10 h-10 text-gray-500 mb-4" />
        <p className="text-gray-400">{isZh ? '请先选择市场和产品类别' : 'Please select market and product category first'}</p>
      </div>
    );
  }

  return (
    <section className="p-6 animate-fadeIn">
      {/* 标题区 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
            <Compass className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">
              {isZh ? '深度市场洞察' : 'Market Insights'}
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

      {/* 市场概览 */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* 市场规模 */}
        <div className="bg-gray-700/50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-green-400" />
            <span className="text-sm text-gray-400">{isZh ? '市场规模' : 'Market Size'}</span>
          </div>
          <div className="text-2xl font-bold text-white">{data.marketSize}</div>
        </div>

        {/* 增长率 */}
        <div className="bg-gray-700/50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-blue-400" />
            <span className="text-sm text-gray-400">{isZh ? '年增长率' : 'Annual Growth'}</span>
          </div>
          <div className="text-2xl font-bold text-white">+{data.growth || 0}%</div>
        </div>
      </div>

      {/* 消费者洞察 */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Users className="w-5 h-5 text-purple-400" />
          <span className="text-white font-medium">{isZh ? '消费者洞察' : 'Consumer Insights'}</span>
        </div>
        <div 
          onClick={() => openDrawer(isZh ? '消费者洞察' : 'Consumer Insights', isZh ? data.consumerInsights : data.consumerInsightsEn)}
          className="bg-purple-600/20 rounded-xl p-4 border border-purple-500/30 cursor-pointer hover:bg-purple-600/30 transition-colors"
        >
          <p className="text-gray-300 text-sm line-clamp-3">
            {isZh ? data.consumerInsights : data.consumerInsightsEn}
          </p>
        </div>
      </div>

      {/* 年龄分布 */}
      {data.ageGroups?.length > 0 && (
        <div className="mb-6">
          <h4 className="text-white font-medium mb-3">{isZh ? '目标年龄分布' : 'Target Age Distribution'}</h4>
          <div className="space-y-2">
            {data.ageGroups.map((group, idx) => (
              <div key={idx} className="bg-gray-700/50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-gray-300 text-sm">{isZh ? group.range : group.rangeEn}</span>
                  <span className="text-white font-medium">{group.percentage}%</span>
                </div>
                <div className="w-full bg-gray-600 rounded-full h-2">
                  <div 
                    className="bg-purple-500 h-2 rounded-full"
                    style={{ width: `${group.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 渠道分布 */}
      {data.channels?.length > 0 && (
        <div className="mb-6">
          <h4 className="text-white font-medium mb-3">{isZh ? '销售渠道分布' : 'Sales Channel Distribution'}</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {data.channels.map((channel, idx) => (
              <div key={idx} className="bg-gray-700/50 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-white">{channel.percentage}%</div>
                <div className="text-xs text-gray-400">{isZh ? channel.name : channel.nameEn}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 竞争格局 */}
      {data.competitors?.length > 0 && (
        <div className="mb-6">
          <h4 className="text-white font-medium mb-3">{isZh ? '主要竞争者' : 'Key Competitors'}</h4>
          <div className="space-y-2">
            {data.competitors.map((comp, idx) => (
              <div key={idx} className="bg-gray-700/50 rounded-lg p-3 flex items-center justify-between">
                <span className="text-gray-300">{isZh ? comp.name : comp.nameEn}</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 bg-gray-600 rounded-full h-2">
                    <div className="bg-orange-500 h-2 rounded-full" style={{ width: `${comp.share}%` }} />
                  </div>
                  <span className="text-orange-400 text-sm">{comp.share}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 市场趋势 */}
      {data.trends?.length > 0 && (
        <div>
          <h4 className="text-white font-medium mb-3">{isZh ? '市场趋势' : 'Market Trends'}</h4>
          <div className="flex flex-wrap gap-2">
            {data.trends.map((trend, idx) => (
              <button
                key={idx}
                onClick={() => openDrawer(isZh ? '市场趋势' : 'Market Trends', isZh ? trend : trend)}
                className="bg-blue-600/20 border border-blue-500/30 rounded-full px-3 py-1.5 text-sm text-blue-300 hover:bg-blue-600/30 transition-colors"
              >
                {trend}
              </button>
            ))}
          </div>
        </div>
      )}

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
