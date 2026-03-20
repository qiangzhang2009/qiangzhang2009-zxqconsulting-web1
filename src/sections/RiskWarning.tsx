/**
 * 风险预警板块 - AI实时风险监测
 * 数据来源: AI 实时获取
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  AlertTriangle,
  RefreshCw,
  Loader2,
  X,
  TrendingUp,
  TrendingDown,
  Minus,
  Shield,
} from 'lucide-react';
import { useAIRisk } from '@/hooks/useAIData';

export default function RiskWarning() {
  const { i18n } = useTranslation();
  const isZh = i18n.language === 'zh';
  
  // 使用AI实时数据
  const { content: data, loading, error, refresh }: { content: any; loading: boolean; error: string | null; refresh: () => void } = useAIRisk();
  
  const [showDrawer, setShowDrawer] = useState(false);
  const [drawerContent, setDrawerContent] = useState<{ title: string; content: string } | null>(null);

  // 风险等级颜色 - 同时支持中英文
  const levelColors: Record<string, { bg: string; text: string; border: string; label: string }> = {
    low: { bg: 'bg-green-500', text: 'text-green-400', border: 'border-green-500/30', label: isZh ? '低风险' : 'Low Risk' },
    medium: { bg: 'bg-yellow-500', text: 'text-yellow-400', border: 'border-yellow-500/30', label: isZh ? '中等风险' : 'Medium Risk' },
    high: { bg: 'bg-orange-500', text: 'text-orange-400', border: 'border-orange-500/30', label: isZh ? '高风险' : 'High Risk' },
    critical: { bg: 'bg-red-500', text: 'text-red-400', border: 'border-red-500/30', label: isZh ? '极高风险' : 'Critical Risk' },
    // 中文值兼容
    '低': { bg: 'bg-green-500', text: 'text-green-400', border: 'border-green-500/30', label: isZh ? '低风险' : 'Low Risk' },
    '中等': { bg: 'bg-yellow-500', text: 'text-yellow-400', border: 'border-yellow-500/30', label: isZh ? '中等风险' : 'Medium Risk' },
    '高': { bg: 'bg-orange-500', text: 'text-orange-400', border: 'border-orange-500/30', label: isZh ? '高风险' : 'High Risk' },
    '极高': { bg: 'bg-red-500', text: 'text-red-400', border: 'border-red-500/30', label: isZh ? '极高风险' : 'Critical Risk' },
  };

  // 获取风险等级，处理中英文值
  const getRiskLevel = (level: string | undefined): string => {
    if (!level) return 'medium';
    if (levelColors[level]) return level;
    // 尝试映射中文到英文
    const chineseToEnglish: Record<string, string> = {
      '低': 'low', '低风险': 'low',
      '中等': 'medium', '中': 'medium',
      '高': 'high', '高风险': 'high',
      '极高': 'critical', '极高风险': 'critical'
    };
    return chineseToEnglish[level] || 'medium';
  };

  const currentLevel = levelColors[getRiskLevel(data?.level)] || levelColors.medium;

  // 趋势图标
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'worsening': return <TrendingDown className="w-4 h-4 text-red-400" />;
      case 'improving': return <TrendingUp className="w-4 h-4 text-green-400" />;
      default: return <Minus className="w-4 h-4 text-gray-400" />;
    }
  };

  // 影响因素图标
  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case 'positive': return <Shield className="w-4 h-4 text-green-400" />;
      case 'negative': return <AlertTriangle className="w-4 h-4 text-red-400" />;
      default: return <Minus className="w-4 h-4 text-gray-400" />;
    }
  };

  // 打开详情抽屉
  const openDrawer = (title: string, content: string) => {
    setDrawerContent({ title, content });
    setShowDrawer(true);
  };

  if (loading) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 text-red-500 animate-spin mb-4" />
        <p className="text-gray-400">{isZh ? '正在获取AI风险数据...' : 'Fetching AI risk data...'}</p>
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
          className="px-4 py-2 bg-red-600 text-white rounded-lg flex items-center gap-2"
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
        <AlertTriangle className="w-10 h-10 text-gray-500 mb-4" />
        <p className="text-gray-400">{isZh ? '请先选择市场和产品类别' : 'Please select market and product category first'}</p>
      </div>
    );
  }

  return (
    <section className="p-6 animate-fadeIn">
      {/* 标题区 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">
              {isZh ? '风险预警监测' : 'Risk Warning'}
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

      {/* 风险概览 */}
      <div className={`bg-gradient-to-r ${currentLevel.bg}/20 to-transparent rounded-xl p-6 mb-6 border ${currentLevel.border}`}>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-400 mb-1">{isZh ? '风险等级' : 'Risk Level'}</div>
            <div className={`text-3xl font-bold ${currentLevel.text}`}>
              {currentLevel.label}
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-400 mb-1">{isZh ? '风险评分' : 'Risk Score'}</div>
            <div className="text-3xl font-bold text-white">{data.score || 0}</div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-400 mb-1">{isZh ? '趋势' : 'Trend'}</div>
            <div className="flex items-center gap-1">
              {getTrendIcon(data.trend || 'stable')}
              <span className="text-white font-medium">
                {data.trend === 'worsening' ? (isZh ? '恶化' : 'Worsening') :
                 data.trend === 'improving' ? (isZh ? '改善' : 'Improving') :
                 (isZh ? '稳定' : 'Stable')}
              </span>
            </div>
          </div>
        </div>
        {/* 评分进度条 */}
        <div className="w-full bg-gray-600 rounded-full h-3 mt-4">
          <div 
            className={`h-3 rounded-full ${currentLevel.bg}`}
            style={{ width: `${data.score || 0}%` }}
          />
        </div>
      </div>

      {/* 风险因素 */}
      {data.factors?.length > 0 && (
        <div className="mb-6">
          <h4 className="text-white font-medium mb-3">{isZh ? '风险因素分析' : 'Risk Factors'}</h4>
          <div className="space-y-2">
            {data.factors.map((factor, idx) => (
              <div 
                key={idx}
                onClick={() => openDrawer(
                  isZh ? factor.name : factor.nameEn,
                  isZh ? factor.description : factor.descriptionEn
                )}
                className="bg-gray-700/50 rounded-lg p-4 hover:bg-gray-700 transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getImpactIcon(factor.impact)}
                    <span className="text-white font-medium">
                      {isZh ? factor.name : factor.nameEn}
                    </span>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${
                    factor.impact === 'positive' ? 'bg-green-600/20 text-green-400' :
                    factor.impact === 'negative' ? 'bg-red-600/20 text-red-400' :
                    'bg-gray-600/20 text-gray-400'
                  }`}>
                    {factor.impact === 'positive' ? (isZh ? '正面' : 'Positive') :
                     factor.impact === 'negative' ? (isZh ? '负面' : 'Negative') :
                     (isZh ? '中性' : 'Neutral')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 风险警告 */}
      {data.warnings?.length > 0 && (
        <div className="mb-6">
          <h4 className="text-white font-medium mb-3">{isZh ? '风险警告' : 'Risk Warnings'}</h4>
          <div className="space-y-2">
            {data.warnings.map((warn: any, idx: number) => (
              <div key={idx} className="flex items-start gap-2 bg-red-600/10 border border-red-500/30 rounded-lg p-3">
                <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                <span className="text-red-300 text-sm">{isZh ? (warn.name || JSON.stringify(warn)) : (warn.nameEn || JSON.stringify(warn))}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 风险缓解建议 */}
      {data.mitigations?.length > 0 && (
        <div>
          <h4 className="text-white font-medium mb-3">{isZh ? '风险缓解建议' : 'Mitigations'}</h4>
          <div className="space-y-2">
            {data.mitigations.map((mit: any, idx: number) => (
              <div key={idx} className="flex items-start gap-2 bg-green-600/10 border border-green-500/30 rounded-lg p-3">
                <Shield className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                <span className="text-green-300 text-sm">{isZh ? (mit.name || JSON.stringify(mit)) : (mit.nameEn || JSON.stringify(mit))}</span>
              </div>
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
