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
  Info,
  Lightbulb,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useAICost } from '@/hooks/useAIData';

// 示例数据：当 AI 数据加载时展示引导
const EXAMPLE_DATA = {
  items: [
    { name: '产品注册/认证', nameEn: 'Product Registration', min: 30000, max: 80000, description: '目标市场监管注册费用' },
    { name: '检测检验费', nameEn: 'Testing Fee', min: 15000, max: 40000, description: '产品质量检测、安全评估' },
    { name: '本地代理/顾问', nameEn: 'Local Agent', min: 20000, max: 60000, description: '当地合规代理、市场顾问' },
    { name: '包装本地化', nameEn: 'Package Localization', min: 8000, max: 25000, description: '标签翻译、包装设计调整' },
    { name: '物流仓储', nameEn: 'Logistics & Storage', min: 12000, max: 35000, description: '首年仓储物流成本' },
    { name: '市场营销启动', nameEn: 'Marketing', min: 20000, max: 100000, description: '本地推广、渠道建设' },
  ],
  timeline: { months: 12, phases: ['注册准备(1-3月)', '认证申请(3-6月)', '渠道建设(6-9月)', '市场启动(9-12月)'] },
  roi: { expected: 25, payback: '12-18个月', paybackEn: '12-18 months' },
};

// 智能推荐场景
const MARKET_SCENARIOS = [
  { 
    label: '日本一线市场', 
    labelEn: 'Japan Tier 1',
    estimate: '¥25-50万', 
    roi: '20-30%',
    payback: '12-18月',
    color: 'from-blue-500 to-indigo-600',
    features: ['PMDA认证', '日语本地化', '高端定价']
  },
  { 
    label: '东南亚市场', 
    labelEn: 'SE Asia Market',
    estimate: '¥8-20万',
    roi: '30-50%',
    payback: '6-12月',
    color: 'from-emerald-500 to-teal-600',
    features: ['食品/保健品备案', '英语/本地语言', '电商渠道']
  },
  { 
    label: '欧美高端市场', 
    labelEn: 'EU/US Premium',
    estimate: '¥50-150万',
    roi: '15-25%',
    payback: '18-36月',
    color: 'from-purple-500 to-pink-600',
    features: ['GMP/ISO认证', '多语言本地化', '高端品牌策略']
  },
];

export default function Tools() {
  const { i18n } = useTranslation();
  const isZh = i18n.language === 'zh';

  const { content: data, loading, error, refresh }: { content: any; loading: boolean; error: string | null; refresh: () => void } = useAICost();

  const [showDrawer, setShowDrawer] = useState(false);
  const [drawerContent, setDrawerContent] = useState<{ title: string; items: string[] } | null>(null);
  const [showGuide, setShowGuide] = useState(false);
  const [showScenarios, setShowScenarios] = useState(false);

  // 使用真实数据或示例数据
  const displayData = data || (loading ? EXAMPLE_DATA : null);
  const isDemo = !data && !loading;

  const markup = 1.25;
  const totalCost = displayData?.items?.reduce((sum, item: any) => sum + ((item.min + item.max) / 2) * markup, 0) || 0;

  const openDrawer = (title: string, items: string[]) => {
    setDrawerContent({ title, items });
    setShowDrawer(true);
  };

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
              {isDemo && <span className="ml-2 text-amber-400">（示例数据）</span>}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowGuide(!showGuide)}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
            title="查看指引"
          >
            <Info className="w-5 h-5" />
          </button>
          <button
            onClick={refresh}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* 引导面板 */}
      {showGuide && (
        <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
          <div className="flex items-start gap-3">
            <Lightbulb className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
            <div>
              <div className="text-sm font-medium text-blue-400 mb-2">
                {isZh ? '💡 成本测算说明' : '💡 Cost Calculator Guide'}
              </div>
              <div className="text-xs text-gray-400 space-y-1">
                <p>• {isZh ? '成本为人民币估算，含25%服务溢价' : 'Costs in CNY, includes 25% service markup'}</p>
                <p>• {isZh ? '实际成本因产品类型、市场、认证要求不同而有差异' : 'Actual costs vary by product type, market, and certification requirements'}</p>
                <p>• {isZh ? 'ROI 预期基于同类产品历史数据估算' : 'ROI estimates based on historical data of similar products'}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 智能推荐场景 */}
      <div className="mb-6">
        <button
          onClick={() => setShowScenarios(!showScenarios)}
          className="flex items-center gap-2 text-sm font-medium text-emerald-400 hover:text-emerald-300 mb-3"
        >
          <Lightbulb className="w-4 h-4" />
          {isZh ? '快速参考：常见市场成本区间' : 'Quick Reference: Common Market Costs'}
          {showScenarios ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        {showScenarios && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {MARKET_SCENARIOS.map((s, i) => (
              <div key={i} className={`bg-gradient-to-br ${s.color} rounded-xl p-4 opacity-80 hover:opacity-100 transition-opacity`}>
                <div className="font-bold text-white mb-2">{isZh ? s.label : s.labelEn}</div>
                <div className="text-white/80 text-sm space-y-1">
                  <div>💰 {s.estimate}</div>
                  <div>📈 ROI: {s.roi}</div>
                  <div>⏱️ {s.payback}</div>
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {s.features.map((f, j) => (
                    <span key={j} className="text-xs bg-white/20 rounded px-1.5 py-0.5 text-white">{f}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 总成本展示 */}
      <div className="bg-gradient-to-r from-emerald-600/20 to-blue-600/20 rounded-xl p-6 mb-6 border border-emerald-500/30">
        <div className="text-center">
          <div className="text-sm text-emerald-400 mb-1">
            {isZh ? '预估总成本（含25%服务溢价）' : 'Estimated Total Cost (incl. 25% service markup)'}
          </div>
          <div className="text-4xl font-bold text-white">
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
              </span>
            ) : (
              <>¥{Math.round(totalCost).toLocaleString()}</>
            )}
          </div>
          <div className="text-sm text-gray-400 mt-2">
            {isZh ? '人民币 (含注册、检测、代理等费用)' : 'CNY (including registration, testing, agency fees)'}
            {isDemo && <span className="ml-2 text-amber-400">— 示例数据，请选择市场获取真实估算</span>}
          </div>
        </div>
      </div>

      {/* 成本明细 */}
      {displayData && (
        <div className="mb-6">
          <h4 className="text-white font-medium mb-3">{isZh ? '成本明细' : 'Cost Breakdown'}</h4>
          <div className="space-y-3">
            {displayData.items?.map((item: any, idx: number) => (
              <div
                key={idx}
                className="bg-gray-700/50 rounded-lg p-4 hover:bg-gray-700 transition-colors cursor-pointer"
                onClick={() => openDrawer(isZh ? item.name : item.nameEn, [isZh ? item.description : item.descriptionEn])}
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
                    style={{ width: `${totalCost > 0 ? (((item.min + item.max) / 2) * markup / totalCost) * 100 : 0}%` }}
                  />
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  ¥{Math.round(item.min * markup).toLocaleString()} - ¥{Math.round(item.max * markup).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 时间线与ROI */}
      {displayData && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-700/50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-5 h-5 text-blue-400" />
              <span className="text-white font-medium">{isZh ? '预计时间线' : 'Timeline'}</span>
            </div>
            <div className="text-2xl font-bold text-white mb-2">
              {displayData.timeline?.months || 0} {isZh ? '个月' : 'months'}
            </div>
            <div className="space-y-2">
              {(isZh ? displayData.timeline?.phases : displayData.timeline?.phases)?.map((phase: any, idx: number) => (
                <div key={idx} className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  <span className="text-gray-300">
                    {typeof phase === 'string' ? phase : (isZh ? phase.name : phase.nameEn) || JSON.stringify(phase)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-700/50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-5 h-5 text-green-400" />
              <span className="text-white font-medium">{isZh ? '预期ROI' : 'Expected ROI'}</span>
            </div>
            <div className="text-2xl font-bold text-green-400 mb-2">
              {displayData.roi?.expected || 0}%
            </div>
            <div className="text-sm text-gray-300">
              {isZh ? displayData.roi?.payback : displayData.roi?.paybackEn}
            </div>
            {isDemo && (
              <div className="mt-2 text-xs text-gray-500">
                {isZh ? '— 选择市场后显示真实ROI预测' : '— Select market for real ROI prediction'}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 加载中状态 */}
      {loading && (
        <div className="text-center py-4 text-gray-400 text-sm">
          {isZh ? '正在获取最新成本数据...' : 'Fetching latest cost data...'}
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
