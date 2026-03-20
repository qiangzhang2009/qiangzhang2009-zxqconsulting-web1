/**
 * 渠道推荐板块 - AI智能渠道匹配
 * 数据来源: AI 实时获取
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Globe,
  Store,
  ShoppingCart,
  Sparkles,
  RefreshCw,
  Loader2,
  X,
  DollarSign,
  Clock,
} from 'lucide-react';
import { useAIChannel } from '@/hooks/useAIData';

export default function ChannelMatch() {
  const { i18n } = useTranslation();
  const isZh = i18n.language === 'zh';
  
  // 使用AI实时数据
  const { content: data, loading, error, refresh }: { content: any; loading: boolean; error: string | null; refresh: () => void } = useAIChannel();
  
  const [showDrawer, setShowDrawer] = useState(false);
  const [drawerContent, setDrawerContent] = useState<{ title: string; content: string } | null>(null);

  // 打开详情抽屉
  const openDrawer = (title: string, content: string) => {
    setDrawerContent({ title, content });
    setShowDrawer(true);
  };

  // 获取渠道图标
  const getChannelIcon = (type: string) => {
    switch (type) {
      case 'online': return <ShoppingCart className="w-5 h-5 text-blue-400" />;
      case 'offline': return <Store className="w-5 h-5 text-purple-400" />;
      default: return <Globe className="w-5 h-5 text-green-400" />;
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 text-cyan-500 animate-spin mb-4" />
        <p className="text-gray-400">{isZh ? '正在获取AI渠道数据...' : 'Fetching AI channel data...'}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[400px]">
        <Globe className="w-10 h-10 text-red-500 mb-4" />
        <p className="text-red-400 mb-4">{error}</p>
        <button
          onClick={refresh}
          className="px-4 py-2 bg-cyan-600 text-white rounded-lg flex items-center gap-2"
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
        <Globe className="w-10 h-10 text-gray-500 mb-4" />
        <p className="text-gray-400">{isZh ? '请先选择市场和产品类别' : 'Please select market and product category first'}</p>
      </div>
    );
  }

  return (
    <section className="p-6 animate-fadeIn">
      {/* 标题区 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
            <Globe className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">
              {isZh ? '智能渠道推荐' : 'Channel Match'}
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

      {/* AI推荐 */}
      {data.recommendation && (
        <div className="bg-gradient-to-r from-cyan-600/20 to-blue-600/20 rounded-xl p-4 mb-6 border border-cyan-500/30">
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-cyan-400 mt-0.5" />
            <div>
              <div className="text-sm text-cyan-400 mb-1">{isZh ? 'AI 渠道推荐' : 'AI Channel Recommendation'}</div>
              <div className="text-white font-medium">
                {isZh ? data.recommendation : data.recommendationEn}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 渠道列表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {data.channels?.map((channel, idx) => (
          <div 
            key={idx}
            className="bg-gray-700/50 rounded-xl p-4 hover:bg-gray-700 transition-colors cursor-pointer"
            onClick={() => openDrawer(
              isZh ? channel.name : channel.nameEn,
              `${isZh ? channel.description : channel.descriptionEn}\n\n${isZh ? '优势:' : 'Pros:'} ${channel.pros?.slice(0,3).map((p: any) => isZh ? (p.name || p) : (p.nameEn || p)).join(', ')}\n${isZh ? '劣势:' : 'Cons:'} ${channel.cons?.slice(0,2).map((c: any) => isZh ? (c.name || c) : (c.nameEn || c)).join(', ')}`
            )}
          >
            {/* 渠道头部 */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                {getChannelIcon(channel.type)}
                <span className="text-white font-medium">
                  {isZh ? channel.name : channel.nameEn}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-16 bg-gray-600 rounded-full h-2">
                  <div 
                    className="bg-cyan-500 h-2 rounded-full"
                    style={{ width: `${channel.rating}%` }}
                  />
                </div>
                <span className="text-cyan-400 text-sm font-medium">{channel.rating}</span>
              </div>
            </div>

            {/* 投资额 */}
            <div className="flex items-center gap-2 text-sm text-gray-400 mb-3">
              <DollarSign className="w-4 h-4" />
              <span>
                ¥{channel.investment?.min?.toLocaleString() || 0} - ¥{channel.investment?.max?.toLocaleString() || 0}
              </span>
            </div>

            {/* 优劣势标签 */}
            <div className="flex flex-wrap gap-1">
              {channel.pros?.slice(0, 2).map((pro: any, idx: number) => (
                <span key={idx} className="text-xs bg-green-600/20 text-green-400 px-2 py-0.5 rounded">
                  {isZh ? (pro.name || pro || JSON.stringify(pro)) : (pro.nameEn || pro || JSON.stringify(pro))}
                </span>
              ))}
              {channel.cons?.slice(0, 1).map((con: any, idx: number) => (
                <span key={idx} className="text-xs bg-red-600/20 text-red-400 px-2 py-0.5 rounded">
                  {isZh ? (con.name || con || JSON.stringify(con)) : (con.nameEn || con || JSON.stringify(con))}
                </span>
              ))}
            </div>
          </div>
        ))}
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
