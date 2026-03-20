/**
 * 实用工具板块 - AI实时成本测算
 * 数据来源: AI 实时获取
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Calculator, 
  Clock, 
  TrendingUp,
  RefreshCw,
  Loader2,
  X,
} from 'lucide-react';
import { useAICost } from '@/hooks/useAIData';

export default function Tools() {
  const { i18n } = useTranslation();
  const isZh = i18n.language === 'zh';
  
  // 使用AI实时数据
  const { content: data, loading, error, refresh }: { content: any; loading: boolean; error: string | null; refresh: () => void } = useAICost();
  
  const [showDrawer, setShowDrawer] = useState(false);
  const [drawerContent, setDrawerContent] = useState<{ title: string; items: string[] } | null>(null);

  // 成本加价 25%
  const markup = 1.25;
  
  // 计算总成本（加价后）
  const totalCost = data?.items?.reduce((sum, item) => sum + ((item.min + item.max) / 2) * markup, 0) || 0;

  // 打开详情抽屉
  const openDrawer = (title: string, items: string[]) => {
    setDrawerContent({ title, items });
    setShowDrawer(true);
  };

  if (loading) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 text-emerald-500 animate-spin mb-4" />
        <p className="text-gray-400">{isZh ? '正在获取AI成本数据...' : 'Fetching AI cost data...'}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[400px]">
        <Calculator className="w-10 h-10 text-red-500 mb-4" />
        <p className="text-red-400 mb-4">{error}</p>
        <button
          onClick={refresh}
          className="px-4 py-2 bg-emerald-600 text-white rounded-lg flex items-center gap-2"
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
        <Calculator className="w-10 h-10 text-gray-500 mb-4" />
        <p className="text-gray-400">{isZh ? '请先选择市场和产品类别' : 'Please select market and product category first'}</p>
      </div>
    );
  }

  return (
    <section className="p-6 animate-fadeIn">
      {/* 标题区 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
            <Calculator className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">
              {isZh ? '成本精准测算' : 'Cost Calculator'}
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

      {/* 总成本展示 */}
      <div className="bg-gradient-to-r from-emerald-600/20 to-blue-600/20 rounded-xl p-6 mb-6 border border-emerald-500/30">
        <div className="text-center">
          <div className="text-sm text-emerald-400 mb-1">{isZh ? '预估总成本' : 'Estimated Total Cost'}</div>
          <div className="text-4xl font-bold text-white">
            ¥{Math.round(totalCost).toLocaleString()}
          </div>
          <div className="text-sm text-gray-400 mt-2">
            {isZh ? '人民币 (含注册、检测、代理等费用)' : 'CNY (including registration, testing, agency fees)'}
          </div>
        </div>
      </div>

      {/* 成本明细 */}
      <div className="mb-6">
        <h4 className="text-white font-medium mb-3">{isZh ? '成本明细' : 'Cost Breakdown'}</h4>
        <div className="space-y-3">
          {data.items?.map((item, idx) => (
            <div 
              key={idx}
              className="bg-gray-700/50 rounded-lg p-4 hover:bg-gray-700 transition-colors cursor-pointer"
              onClick={() => openDrawer(
                isZh ? item.name : item.nameEn,
                [isZh ? item.description : item.descriptionEn]
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-white font-medium">
                  {isZh ? item.name : item.nameEn}
                </span>
                <span className="text-emerald-400 font-medium">
                  ¥{Math.round(((item.min + item.max) / 2) * markup).toLocaleString()}
                </span>
              </div>
              <div className="w-full bg-gray-600 rounded-full h-2">
                <div 
                  className="bg-emerald-500 h-2 rounded-full"
                  style={{ width: `${(((item.min + item.max) / 2) * markup / totalCost) * 100}%` }}
                />
              </div>
              <div className="text-xs text-gray-400 mt-1">
                ¥{Math.round(item.min * markup).toLocaleString()} - ¥{Math.round(item.max * markup).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 时间线与ROI */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 时间线 */}
        <div className="bg-gray-700/50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-5 h-5 text-blue-400" />
            <span className="text-white font-medium">{isZh ? '预计时间线' : 'Timeline'}</span>
          </div>
          <div className="text-2xl font-bold text-white mb-2">
            {data.timeline?.months || 0} {isZh ? '个月' : 'months'}
          </div>
          <div className="space-y-2">
            {data.timeline?.phases?.map((phase: any, idx: number) => (
              <div key={idx} className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <span className="text-gray-300">
                  {isZh 
                    ? (phase.name || phase.duration || JSON.stringify(phase))
                    : (phase.nameEn || phase.durationEn || JSON.stringify(phase))
                  }
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ROI */}
        <div className="bg-gray-700/50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-5 h-5 text-green-400" />
            <span className="text-white font-medium">{isZh ? '预期ROI' : 'Expected ROI'}</span>
          </div>
          <div className="text-2xl font-bold text-green-400 mb-2">
            {data.roi?.expected || 0}%
          </div>
          <div className="text-sm text-gray-300">
            {isZh ? data.roi?.payback : data.roi?.paybackEn}
          </div>
        </div>
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
              {drawerContent.items.map((item, idx) => (
                <p key={idx} className="text-gray-300 leading-relaxed mb-3">{item}</p>
              ))}
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
