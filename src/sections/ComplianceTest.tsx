/**
 * 合规自测板块 - AI实时合规评估
 * 数据来源: AI 实时获取
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Shield,
  CheckCircle2,
  AlertTriangle,
  Clock,
  RefreshCw,
  Loader2,
  X,
  FileText,
} from 'lucide-react';
import { useAICompliance } from '@/hooks/useAIData';

export default function ComplianceTest() {
  const { i18n } = useTranslation();
  const isZh = i18n.language === 'zh';
  
  // 使用AI实时数据
  const { content: data, loading, error, refresh }: { content: any; loading: boolean; error: string | null; refresh: () => void } = useAICompliance();
  
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  const [showDrawer, setShowDrawer] = useState(false);
  const [drawerContent, setDrawerContent] = useState<{ title: string; items: string[] } | null>(null);

  // 状态颜色 - 同时支持中英文
  const defaultLabel = isZh ? '待评估' : 'Pending';
  const statusColors: Record<string, { bg: string; text: string; label: string }> = {
    passed: { bg: 'bg-green-500', text: 'text-green-400', label: isZh ? '通过' : 'Passed' },
    warning: { bg: 'bg-yellow-500', text: 'text-yellow-400', label: isZh ? '警告' : 'Warning' },
    failed: { bg: 'bg-red-500', text: 'text-red-400', label: isZh ? '未通过' : 'Failed' },
    // 中文值兼容
    '通过': { bg: 'bg-green-500', text: 'text-green-400', label: isZh ? '通过' : 'Passed' },
    '警告': { bg: 'bg-yellow-500', text: 'text-yellow-400', label: isZh ? '警告' : 'Warning' },
    '未通过': { bg: 'bg-red-500', text: 'text-red-400', label: isZh ? '未通过' : 'Failed' },
    '失败': { bg: 'bg-red-500', text: 'text-red-400', label: isZh ? '未通过' : 'Failed' },
  };

  // 获取状态，处理中英文值
  const getStatusColor = (status: string | undefined) => {
    if (!status) return null;
    if (statusColors[status]) return statusColors[status];
    // 尝试映射中文到英文
    const chineseToEnglish: Record<string, string> = {
      '通过': 'passed',
      '成功': 'passed',
      '警告': 'warning',
      '未通过': 'failed',
      '失败': 'failed'
    };
    return statusColors[chineseToEnglish[status]] || statusColors.warning;
  };

  const currentStatus = data?.status ? (getStatusColor(data?.status) || statusColors.warning) : null;

  // 切换展开
  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  // 打开详情抽屉
  const openDrawer = (title: string, items: string[]) => {
    setDrawerContent({ title, items });
    setShowDrawer(true);
  };

  if (loading) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 text-purple-500 animate-spin mb-4" />
        <p className="text-gray-400">{isZh ? '正在获取AI合规数据...' : 'Fetching AI compliance data?...'}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[400px]">
        <Shield className="w-10 h-10 text-red-500 mb-4" />
        <p className="text-red-400 mb-4">{error}</p>
        <button
          onClick={refresh}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg flex items-center gap-2"
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
        <Shield className="w-10 h-10 text-gray-500 mb-4" />
        <p className="text-gray-400">{isZh ? '请先选择市场和产品类别' : 'Please select market and product category first'}</p>
      </div>
    );
  }

  return (
    <section className="p-6 animate-fadeIn">
      {/* 标题区 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">
              {isZh ? '产品合规评估' : 'Compliance Assessment'}
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

      {/* 合规状态卡片 */}
      <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-xl p-6 mb-6 border border-purple-500/30">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-purple-400 mb-1">{isZh ? '合规状态' : 'Compliance Status'}</div>
            <div className={`text-3xl font-bold ${currentStatus?.text || 'text-gray-400'}`}>
              {currentStatus?.label || defaultLabel}
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-400 mb-1">{isZh ? '合规评分' : 'Compliance Score'}</div>
            <div className="text-3xl font-bold text-white">{data?.score || 0}</div>
          </div>
        </div>
        {/* 评分进度条 */}
        <div className="w-full bg-gray-600 rounded-full h-3 mt-4">
          <div 
            className={`h-3 rounded-full ${currentStatus?.bg || 'bg-gray-500'}`}
            style={{ width: `${data?.score || 0}%` }}
          />
        </div>
      </div>

      {/* 合规要求 */}
      <div className="mb-4">
        <h4 className="text-white font-medium mb-3">{isZh ? '合规要求' : 'Requirements'}</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {data?.requirements?.map((req: any, idx: number) => (
            <div key={idx} className="flex items-center gap-2 bg-gray-700/50 rounded-lg p-3">
              <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
              <span className="text-gray-300 text-sm">{isZh ? (req.name || req.description || JSON.stringify(req)) : (req.nameEn || req.descriptionEn || JSON.stringify(req))}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 所需文件 */}
      <div className="mb-4">
        <h4 className="text-white font-medium mb-3">{isZh ? '所需文件' : 'Required Documents'}</h4>
        <div className="flex flex-wrap gap-2">
          {data?.documents?.map((doc: any, idx: number) => (
            <button
              key={idx}
              onClick={() => openDrawer(isZh ? '文件说明' : 'Document Details', [doc])}
              className="flex items-center gap-2 bg-blue-600/20 border border-blue-500/30 rounded-lg px-3 py-2 hover:bg-blue-600/30 transition-colors"
            >
              <FileText className="w-4 h-4 text-blue-400" />
              <span className="text-blue-300 text-sm">{isZh ? (doc.name || JSON.stringify(doc)) : (doc.nameEn || JSON.stringify(doc))}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 时间线与警告 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 时间线 */}
        <div className="bg-gray-700/50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-blue-400" />
            <span className="text-white font-medium">{isZh ? '预计时间' : 'Timeline'}</span>
          </div>
          <p className="text-gray-300">{isZh ? (data?.timeline || '') : (data?.timelineEn || data?.timeline || '')}</p>
        </div>

        {/* 警告 */}
        {data?.warnings?.length > 0 && (
          <div className="bg-gray-700/50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-yellow-400" />
              <span className="text-white font-medium">{isZh ? '注意事项' : 'Warnings'}</span>
            </div>
            <ul className="space-y-1">
              {data?.warnings.map((warn: any, idx: number) => (
                <li key={idx} className="text-yellow-300 text-sm flex items-start gap-1">
                  <span>•</span>
                  <span>{isZh ? (warn.name || JSON.stringify(warn)) : (warn.nameEn || JSON.stringify(warn))}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* 专业建议 */}
      {data?.tips?.length > 0 && (
        <div className="mt-4 bg-green-600/20 rounded-xl p-4 border border-green-500/30">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-5 h-5 text-green-400" />
            <span className="text-green-400 font-medium">{isZh ? '专业建议' : 'Professional Tips'}</span>
          </div>
          <ul className="space-y-1">
            {data?.tips.map((tip: any, idx: number) => (
              <li key={idx} className="text-gray-300 text-sm flex items-start gap-1">
                <span>•</span>
                <span>{isZh ? (tip.name || JSON.stringify(tip)) : (tip.nameEn || JSON.stringify(tip))}</span>
              </li>
            ))}
          </ul>
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
