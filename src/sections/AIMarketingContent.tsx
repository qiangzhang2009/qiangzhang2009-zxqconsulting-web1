/**
 * AI营销内容生成器 - 生成多平台营销内容
 * 社交媒体、小红书、官网文案、邮件、SEO、新闻稿
 */

import { useState } from 'react';
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
import { useMarket } from './aiToolsMarketContext';

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
  const [results, setResults] = useState<Record<string, any>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const { selectedMarket, selectedCategory } = useMarket();

  // Mock 数据生成器
  const generateMockMarketingData = (type: string, market: string, category: string, prodName: string): any => {
    const m = market || '目标市场';
    const c = category || '产品类别';
    const p = prodName || c;

    switch (type) {
      case 'social':
        return {
          content: `【${p}出海攻略】\n\n你是否也在关注${m}市场的机会？\n\n经过深度调研，我们发现${c}品类在当地市场增长迅速，消费者需求旺盛。\n\n如果你想了解更多${m}市场的准入策略，欢迎留言或私信交流！`,
          hashtags: [`${m}市场`, '本草出海', `${c}出口`, '海外市场', '中医药国际化'],
        };
      case 'xiaohongshu':
        return {
          title: `【${m}市场洞察】${p}出海的机遇与挑战`,
          content: `今天来聊聊${m}市场的${c}品类机会！\n\n经过我们团队的分析，${m}市场对${c}的需求正在快速增长。\n\n✅ 优势：消费者接受度高，政策支持\n⚠️ 挑战：需要完成当地注册认证\n💡 建议：提前规划，6-12个月完成布局\n\n有想了解${m}具体市场策略的薯友吗？评论区见。`,
          tags: [`${m}市场攻略`, '中医药出海', `${c}选品`, '海外市场', '创业笔记'],
        };
      case 'website':
        return {
          heroTitle: `专业${c}出海解决方案 | 助您快速进入${m}市场`,
          heroSubtitle: `基于全球33国市场数据，AI驱动的${m}市场准入分析，让您的${c}产品顺利出海`,
          valueProps: [
            { title: 'AI智能分析', desc: '6大维度深度洞察' },
            { title: '全程合规支持', desc: '一站式认证代办' },
            { title: '本地化策略', desc: '深度市场调研' },
          ],
          cta: '获取免费市场报告',
        };
      case 'email':
        return {
          subject: `Partnership Inquiry: ${p} Market Entry to ${m}`,
          subjectCn: `合作咨询：${p}进入${m}市场`,
          body: `Dear Partner,\n\nI am reaching out regarding ${p} (${c}) market entry to ${m}.\n\nOur team specializes in TCM and herbal product internationalization, with proven track records in Asia-Pacific markets.\n\nWould you be available for a brief call this week to discuss potential collaboration?\n\nBest regards`,
        };
      case 'seo':
        return {
          metaTitle: `${c}出口${m} | ${m}市场准入攻略 | 认证要求与成本分析`,
          metaDescription: `了解${c}如何出口到${m}市场，包括${m}当地认证要求、市场准入成本、以及最佳进入策略。专业的本草产品出海咨询服务。`,
          keywords: [`${c}出口${m}`, `${m}市场准入`, '本草产品出海', '海外认证', `${m}药品注册`],
          contentOutline: [`${m}市场概况与机遇`, `${c}产品准入要求`, `注册流程与时间线`, `成本估算与ROI分析`, '本地化策略建议'],
        };
      case 'pr':
        return {
          headline: `ZXQ Consulting Launches AI-Powered ${m} Market Entry Service for TCM Products`,
          subheadline: `Revolutionary platform provides comprehensive market analysis and compliance support for ${c} exporters`,
          lead: `Shanghai-based consulting firm ZXQ Consulting today announced the launch of its AI-powered market entry platform, designed to help TCM and herbal product manufacturers navigate ${m} market requirements efficiently.`,
          body: `The platform leverages advanced AI to analyze market data across 33 countries, providing actionable insights for product localization, regulatory compliance, and channel strategy.\n\n"${m} represents a significant opportunity for quality TCM products," said Zhang Xiaoqiang, Founder. "Our platform removes the complexity of international market entry."`,
          boilerplate: `ZXQ Consulting is a Shanghai-based professional services firm specializing in TCM and herbal product internationalization, with expertise in Japan, Australia, Southeast Asia, and global markets.`,
          contact: `Contact: customer@zxqconsulting.com | www.zxqconsulting.com`,
        };
      default:
        return {};
    }
  };

  const generate = async () => {
    if (!selectedMarket || !selectedCategory) {
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
          market: selectedMarket?.name ?? selectedMarket ?? '',
          marketEn: selectedMarket?.nameEn ?? '',
          category: selectedCategory,
          categoryEn: '',
          productName: productName || selectedCategory,
          tone,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setResults(data.data);
        } else {
          throw new Error(data.error || 'Generation failed');
        }
      } else {
        throw new Error(`API ${response.status}`);
      }
    } catch {
      // API 失败时使用 mock 数据
      const mockData: Record<string, any> = {};
      for (const ct of CONTENT_TYPES) {
        mockData[ct.id] = generateMockMarketingData(ct.id, selectedMarket, selectedCategory, productName);
      }
      setResults(mockData);
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
        {renderResult(activeType, results[activeType])}
      </div>

      {/* 批量预览 */}
      {Object.keys(results).length > 0 && (
        <div className="mt-4">
          <div className="text-sm font-medium text-white mb-3">
            {isZh ? '📋 全部内容预览' : '📋 All Content Preview'}
          </div>
          <div className="space-y-2">
            {CONTENT_TYPES.filter(ct => results[ct.id]).map(ct => (
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
