/**
 * AI营销内容生成器 - 生成多平台营销内容
 * 社交媒体、小红书、官网文案、邮件、SEO、新闻稿
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FileText,
  Instagram,
  Globe,
  Mail,
  Search,
  Newspaper,
  Loader2,
  Copy,
  CheckCheck,
  RefreshCw,
  Sparkles,
  X,
  Send,
} from 'lucide-react';
import { AI_CONFIG } from '@/config';
import { tracking } from '@/lib/tracking';
import { useMarket } from './aiTools/context';

const CONTENT_TYPES = [
  {
    id: 'social',
    icon: Instagram,
    label: '社交媒体',
    labelEn: 'Social Post',
    color: 'from-blue-500 to-indigo-600',
    desc: 'LinkedIn/Facebook 帖子',
    descEn: 'LinkedIn/Facebook Post',
  },
  {
    id: 'xiaohongshu',
    icon: FileText,
    label: '小红书',
    labelEn: 'Xiaohongshu',
    color: 'from-pink-500 to-rose-600',
    desc: '种草笔记',
    descEn: 'Grass-rooting Post',
  },
  {
    id: 'website',
    icon: Globe,
    label: '官网文案',
    labelEn: 'Website Copy',
    color: 'from-emerald-500 to-teal-600',
    desc: '首页 Hero 文案',
    descEn: 'Hero Section Copy',
  },
  {
    id: 'email',
    icon: Mail,
    label: 'B2B开发信',
    labelEn: 'B2B Email',
    color: 'from-amber-500 to-orange-600',
    desc: '合作邀约邮件',
    descEn: 'Partnership Email',
  },
  {
    id: 'seo',
    icon: Search,
    label: 'SEO优化',
    labelEn: 'SEO Content',
    color: 'from-purple-500 to-violet-600',
    desc: '关键词 + Meta',
    descEn: 'Keywords + Meta',
  },
  {
    id: 'pr',
    icon: Newspaper,
    label: '新闻稿',
    labelEn: 'Press Release',
    color: 'from-gray-600 to-slate-700',
    desc: '英文新闻通稿',
    descEn: 'English PR',
  },
];

const TONE_OPTIONS = [
  { value: 'professional', label: '专业严谨', labelEn: 'Professional' },
  { value: 'friendly', label: '亲切友好', labelEn: 'Friendly' },
  { value: 'luxury', label: '高端奢华', labelEn: 'Luxury' },
  { value: 'casual', label: '轻松随意', labelEn: 'Casual' },
];

export default function AIMarketingContent() {
  const { i18n } = useTranslation();
  const isZh = i18n.language === 'zh';

  const [activeType, setActiveType] = useState('social');
  const [productName, setProductName] = useState('');
  const [tone, setTone] = useState('professional');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const normalizeContentLanguage = <T,>(value: T): T => {
    if (Array.isArray(value)) {
      return value.map((item) => normalizeContentLanguage(item)) as T;
    }

    if (value && typeof value === 'object') {
      const source = value as Record<string, any>;
      const normalized: Record<string, any> = {};

      for (const [key, fieldValue] of Object.entries(source)) {
        if (key.endsWith('En')) continue;

        const englishKey = `${key}En`;
        if (!isZh && englishKey in source) {
          normalized[key] = normalizeContentLanguage(source[englishKey]);
        } else {
          normalized[key] = normalizeContentLanguage(fieldValue);
        }
      }

      return normalized as T;
    }

    return value;
  };

  // 使用全局 Context 存储结果（持久化，切换标签后不丢失）
  const { selectedMarket, selectedCategory, marketingData, setMarketingData } = useMarket();
  const normalizedLanguage = (i18n.language || 'zh').split('-')[0].toLowerCase();
  const marketingCacheKey = [
    normalizedLanguage,
    selectedMarket?.id || 'no-market',
    selectedCategory || 'no-category',
    (productName || '').trim().toLowerCase() || 'no-product',
    tone,
  ].join('::');
  const currentMarketingData = marketingData?.[marketingCacheKey] || null;
  const displayMarketingData = currentMarketingData ? normalizeContentLanguage(currentMarketingData) : null;

  const generate = async () => {
    // 直接从 context 读取最新值
    const market = selectedMarket;
    const category = selectedCategory;

    if (!market || !category) {
      alert(isZh ? '请先在 AI 工具中心选择市场和产品类别' : 'Please select market and product category first');
      return;
    }

    setIsGenerating(true);
    tracking.toolInteraction('AI Marketing', 'generate', { activeType, tone, productName });

    try {
      const response = await fetch('/api/ai/marketing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          market: market.name ?? market,
          marketEn: market.nameEn ?? '',
          category: category,
          categoryEn: '',
          productName: productName || category,
          tone,
          language: normalizedLanguage,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          // 存储到全局 Context，按语言和输入条件隔离
          setMarketingData({
            ...(marketingData || {}),
            [marketingCacheKey]: data.data,
          });
        } else {
          throw new Error(data.error || 'Generation failed');
        }
      } else {
        throw new Error(`API ${response.status}`);
      }
    } catch (error: any) {
      console.error('[AIMarketingContent] API failed:', error?.message);
      alert(isZh ? 'AI 服务暂时不可用，请稍后重试' : 'AI service temporarily unavailable, please try again later');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const renderResult = (type: string, data: any) => {
    if (!data) {
      return (
        <div className="text-center py-8 text-gray-400">
          {isGenerating ? (
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
              <p>{isZh ? '正在生成...' : 'Generating...'}</p>
            </div>
          ) : (
            <p>{isZh ? '点击「生成内容」获取内容' : 'Click "Generate Content" to get content'}</p>
          )}
        </div>
      );
    }

    switch (type) {
      case 'social':
        return (
          <div className="space-y-4">
            <div className="bg-gray-700/50 rounded-xl p-4">
              <p className="text-white text-sm leading-relaxed whitespace-pre-wrap">{data.content}</p>
            </div>
            {data.hashtags && (
              <div className="flex flex-wrap gap-2">
                {data.hashtags.map((tag: string, i: number) => (
                  <span key={i} className="text-xs text-blue-400 bg-blue-500/10 px-2 py-1 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <button
                onClick={() => copyToClipboard(data.content, 'social-content')}
                className="text-xs text-gray-400 hover:text-white flex items-center gap-1"
              >
                {copiedId === 'social-content' ? <CheckCheck className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {isZh ? '复制正文' : 'Copy Content'}
              </button>
              {data.hashtags && (
                <button
                  onClick={() => copyToClipboard(data.hashtags.join(' '), 'social-tags')}
                  className="text-xs text-gray-400 hover:text-white flex items-center gap-1"
                >
                  {copiedId === 'social-tags' ? <CheckCheck className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  {isZh ? '复制标签' : 'Copy Tags'}
                </button>
              )}
            </div>
          </div>
        );

      case 'xiaohongshu':
        return (
          <div className="space-y-4">
            <div className="bg-pink-500/10 border border-pink-500/20 rounded-xl p-4">
              <div className="text-pink-400 font-bold text-lg mb-2">{data.title}</div>
              <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{data.content}</p>
            </div>
            {data.tags && (
              <div className="flex flex-wrap gap-2">
                {data.tags.map((tag: string, i: number) => (
                  <span key={i} className="text-xs text-pink-400 bg-pink-500/10 px-2 py-1 rounded-full">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
            <button
              onClick={() => copyToClipboard(`${data.title}\n\n${data.content}\n\n${(data.tags || []).map((t: string) => '#' + t).join(' ')}`, 'xhs')}
              className="text-xs text-gray-400 hover:text-white flex items-center gap-1"
            >
              {copiedId === 'xhs' ? <CheckCheck className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              {isZh ? '复制全部' : 'Copy All'}
            </button>
          </div>
        );

      case 'website':
        return (
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-xl p-4">
              <div className="text-emerald-400 font-bold text-xl mb-1">{data.heroTitle}</div>
              <div className="text-gray-300 text-sm mb-4">{data.heroSubtitle}</div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {(data.valueProps || []).map((prop: any, i: number) => (
                  <div key={i} className="bg-gray-700/30 rounded-lg p-3">
                    <div className="font-medium text-white text-sm mb-1">{prop.title}</div>
                    <div className="text-xs text-gray-400">{prop.desc}</div>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <button className="bg-emerald-600 text-white px-6 py-2 rounded-lg text-sm font-medium">
                  {data.cta}
                </button>
              </div>
            </div>
            <button
              onClick={() => copyToClipboard(JSON.stringify(data, null, 2), 'website')}
              className="text-xs text-gray-400 hover:text-white flex items-center gap-1"
            >
              {copiedId === 'website' ? <CheckCheck className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              {isZh ? '复制 JSON' : 'Copy JSON'}
            </button>
          </div>
        );

      case 'email':
        return (
          <div className="space-y-4">
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
              <div className="text-xs text-gray-400 mb-1">{isZh ? '邮件主题' : 'Email Subject'}</div>
              <div className="text-white font-medium mb-3">{data.subject}</div>
              <div className="text-xs text-gray-400 mb-1">{data.subjectCn}</div>
            </div>
            <div className="bg-gray-700/50 rounded-xl p-4">
              <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{data.body}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => copyToClipboard(`Subject: ${data.subject}\n\n${data.body}`, 'email')}
                className="text-xs text-gray-400 hover:text-white flex items-center gap-1"
              >
                {copiedId === 'email' ? <CheckCheck className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {isZh ? '复制' : 'Copy'}
              </button>
            </div>
          </div>
        );

      case 'seo':
        return (
          <div className="space-y-4">
            <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4">
              <div className="text-xs text-gray-400 mb-2">{isZh ? 'Meta 标题' : 'Meta Title'}</div>
              <div className="text-white text-sm mb-3">{data.metaTitle}</div>
              <div className="text-xs text-gray-400 mb-2">{isZh ? 'Meta 描述' : 'Meta Description'}</div>
              <div className="text-gray-300 text-sm mb-3">{data.metaDescription}</div>
            </div>
            <div>
              <div className="text-xs text-gray-400 mb-2">{isZh ? '长尾关键词' : 'Long-tail Keywords'}</div>
              <div className="flex flex-wrap gap-2">
                {(data.keywords || []).map((kw: string, i: number) => (
                  <span key={i} className="text-xs text-purple-400 bg-purple-500/10 px-2 py-1 rounded-full">
                    {kw}
                  </span>
                ))}
              </div>
            </div>
            {data.contentOutline && (
              <div>
                <div className="text-xs text-gray-400 mb-2">{isZh ? '内容大纲 (H2)' : 'Content Outline (H2)'}</div>
                <div className="space-y-1">
                  {data.contentOutline.map((h: string, i: number) => (
                    <div key={i} className="text-sm text-gray-300 flex items-center gap-2">
                      <span className="text-purple-400">H2:</span> {h}
                    </div>
                  ))}
                </div>
              </div>
            )}
            <button
              onClick={() => copyToClipboard(JSON.stringify(data, null, 2), 'seo')}
              className="text-xs text-gray-400 hover:text-white flex items-center gap-1"
            >
              {copiedId === 'seo' ? <CheckCheck className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              {isZh ? '复制全部' : 'Copy All'}
            </button>
          </div>
        );

      case 'pr':
        return (
          <div className="space-y-4">
            <div className="bg-gray-700/50 rounded-xl p-4">
              <div className="text-white font-bold text-lg mb-1">{data.headline}</div>
              <div className="text-gray-400 text-sm mb-4">{data.subheadline}</div>
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">{isZh ? '导语' : 'Lead'}</div>
              <p className="text-gray-300 text-sm mb-4">{data.lead}</p>
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">{isZh ? '正文' : 'Body'}</div>
              <p className="text-gray-300 text-sm whitespace-pre-wrap mb-4">{data.body}</p>
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">{isZh ? '公司简介' : 'Boilerplate'}</div>
              <p className="text-gray-400 text-xs mb-3">{data.boilerplate}</p>
              <div className="text-xs text-gray-400">{data.contact}</div>
            </div>
            <button
              onClick={() => copyToClipboard(`${data.headline}\n\n${data.lead}\n\n${data.body}\n\n${data.boilerplate}\n\n${data.contact}`, 'pr')}
              className="text-xs text-gray-400 hover:text-white flex items-center gap-1"
            >
              {copiedId === 'pr' ? <CheckCheck className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              {isZh ? '复制新闻稿' : 'Copy Press Release'}
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  const currentType = CONTENT_TYPES.find(t => t.id === activeType)!;
  const CurrentIcon = currentType.icon;
  const currentIcon = currentType.icon;

  return (
    <section className="p-6 animate-fadeIn">
      {/* 标题区 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${currentType.color} flex items-center justify-center`}>
            <CurrentIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">
              {isZh ? 'AI营销内容生成器' : 'AI Marketing Content Generator'}
            </h3>
            <p className="text-sm text-gray-400">
              {isZh ? '6大平台内容一键生成' : 'Generate content for 6 platforms instantly'}
            </p>
          </div>
        </div>
      </div>

      {/* 配置区 */}
      <div className="mb-6 p-4 bg-gray-700/50 rounded-xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* 产品名称 */}
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">
              {isZh ? '产品名称（选填）' : 'Product Name (optional)'}
            </label>
            <input
              type="text"
              value={productName}
              onChange={e => setProductName(e.target.value)}
              placeholder={isZh ? '例如：灵芝孢子粉' : 'e.g., Lingzhi Spore Powder'}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm placeholder-gray-500 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          {/* 文风 */}
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">
              {isZh ? '内容文风' : 'Content Tone'}
            </label>
            <select
              value={tone}
              onChange={e => setTone(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm focus:border-emerald-500 focus:outline-none"
            >
              {TONE_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {isZh ? opt.label : opt.labelEn}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 提示 */}
        <div className="mt-3 text-xs text-gray-500 flex items-center gap-1">
          <Sparkles className="w-3 h-3" />
          {isZh
            ? '内容和文案将基于您在 AI 工具中心选择的市场和产品自动生成'
            : 'Content is auto-generated based on your selected market and product in AI Tools Hub'}
        </div>
      </div>

      {/* 内容类型选择 */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-sm font-medium text-white">{isZh ? '选择内容类型' : 'Select Content Type'}</span>
          <span className="text-xs text-gray-500">
            ({isZh ? '共6种' : '6 types available'})
          </span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
          {CONTENT_TYPES.map(ct => {
            const Icon = ct.icon;
            return (
              <button
                key={ct.id}
                onClick={() => setActiveType(ct.id)}
                className={`p-3 rounded-xl border-2 transition-all text-center ${
                  activeType === ct.id
                    ? `bg-gradient-to-br ${ct.color} text-white border-transparent shadow-lg`
                    : 'bg-gray-700/50 border-gray-600 hover:border-gray-500'
                }`}
              >
                <Icon className={`w-5 h-5 mx-auto mb-1 ${activeType === ct.id ? 'text-white' : 'text-gray-400'}`} />
                <div className={`text-xs font-medium ${activeType === ct.id ? 'text-white' : 'text-gray-300'}`}>
                  {isZh ? ct.label : ct.labelEn}
                </div>
                <div className={`text-xs mt-0.5 ${activeType === ct.id ? 'text-white/70' : 'text-gray-500'}`}>
                  {isZh ? ct.desc : ct.descEn}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 生成按钮 */}
      <div className="mb-6 text-center">
        <button
          onClick={generate}
          disabled={isGenerating}
          className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-bold hover:from-emerald-500 hover:to-teal-500 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              {isZh ? '生成中...' : 'Generating...'}
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              {isZh ? '生成内容' : 'Generate Content'}
            </>
          )}
        </button>
      </div>

      {/* 内容展示 */}
      <div className="bg-gray-700/50 rounded-xl p-4 min-h-[300px]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <CurrentIcon className={`w-5 h-5 bg-gradient-to-br ${currentType.color} bg-clip-text`} />
            <span className="font-medium text-white">
              {isZh ? currentType.label : currentType.labelEn}
            </span>
          </div>
          <span className="text-xs text-gray-500">
            {isZh ? currentType.desc : currentType.descEn}
          </span>
        </div>
        {renderResult(activeType, displayMarketingData?.[activeType])}
      </div>

      {/* 批量预览 */}
      {Object.keys(displayMarketingData || {}).length > 0 && (
        <div className="mt-4">
          <div className="text-sm font-medium text-white mb-3">
            {isZh ? '📋 全部内容预览' : '📋 All Content Preview'}
          </div>
          <div className="space-y-2">
            {CONTENT_TYPES.filter(ct => displayMarketingData?.[ct.id]).map(ct => (
              <div key={ct.id} className="flex items-center justify-between bg-gray-700/30 rounded-lg px-3 py-2">
                <div className="flex items-center gap-2">
                  <ct.icon className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-300">
                    {isZh ? ct.label : ct.labelEn}
                  </span>
                </div>
                <button
                  onClick={() => setActiveType(ct.id)}
                  className="text-xs text-emerald-400 hover:text-emerald-300"
                >
                  {isZh ? '查看详情' : 'View Details'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
