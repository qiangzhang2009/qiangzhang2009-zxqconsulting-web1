/**
 * 市场展示板块 - 专业B2B咨询风格
 * 简洁、清晰，信息丰富
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Clock, Shield, DollarSign, Filter } from 'lucide-react';

interface Market {
  id: string;
  name: string;
  nameEn: string;
  flag: string;
  tier: string;
  tierEn: string;
  difficulty: string;
  difficultyEn: string;
  timeline: string;
  timelineEn: string;
  cost: string;
  description: string;
  descriptionEn: string;
}

const Markets = () => {
  const { t, i18n } = useTranslation();
  const isZh = i18n.language === 'zh';

  const [filter, setFilter] = useState('all');

  const markets: Market[] = [
    {
      id: 'japan', name: '日本', nameEn: 'Japan', flag: '🇯🇵',
      tier: '一线', tierEn: 'Tier 1', difficulty: '高', difficultyEn: 'High',
      timeline: '12-18月', timelineEn: '12-18 months', cost: '$80K-250K',
      description: '成熟市场，消费者对品质要求高，品牌溢价空间大',
      descriptionEn: 'Mature market with high quality standards and strong brand premium potential',
    },
    {
      id: 'australia', name: '澳大利亚', nameEn: 'Australia', flag: '🇦🇺',
      tier: '一线', tierEn: 'Tier 1', difficulty: '中', difficultyEn: 'Medium',
      timeline: '6-12月', timelineEn: '6-12 months', cost: '$30K-80K',
      description: '监管清晰，市场规模适中，是进入大洋洲的优质跳板',
      descriptionEn: 'Clear regulations, moderate market size, excellent gateway to Oceania',
    },
    {
      id: 'singapore', name: '新加坡', nameEn: 'Singapore', flag: '🇸🇬',
      tier: '一线', tierEn: 'Tier 1', difficulty: '低', difficultyEn: 'Low',
      timeline: '3-6月', timelineEn: '3-6 months', cost: '$15K-40K',
      description: '东南亚金融中心，准入门槛低，营商环境优越',
      descriptionEn: 'Southeast Asian financial hub with low barriers and excellent business environment',
    },
    {
      id: 'usa', name: '美国', nameEn: 'USA', flag: '🇺🇸',
      tier: '一线', tierEn: 'Tier 1', difficulty: '高', difficultyEn: 'High',
      timeline: '12-24月', timelineEn: '12-24 months', cost: '$50K-150K',
      description: '全球最大市场，审批严格，但回报潜力最高',
      descriptionEn: 'World largest market with strict approval, but highest return potential',
    },
    {
      id: 'germany', name: '德国', nameEn: 'Germany', flag: '🇩🇪',
      tier: '一线', tierEn: 'Tier 1', difficulty: '高', difficultyEn: 'High',
      timeline: '12-24月', timelineEn: '12-24 months', cost: '$60K-180K',
      description: '欧洲最大市场，标准严格，进入后可辐射欧盟',
      descriptionEn: 'Largest European market with strict standards, gateway to EU',
    },
    {
      id: 'korea', name: '韩国', nameEn: 'South Korea', flag: '🇰🇷',
      tier: '二线', tierEn: 'Tier 2', difficulty: '中', difficultyEn: 'Medium',
      timeline: '6-10月', timelineEn: '6-10 months', cost: '$25K-60K',
      description: '文化相近，消费能力强，对中药接受度逐渐提高',
      descriptionEn: 'Cultural proximity, strong consumption, increasing acceptance of TCM',
    },
    {
      id: 'thailand', name: '泰国', nameEn: 'Thailand', flag: '🇹🇭',
      tier: '二线', tierEn: 'Tier 2', difficulty: '中', difficultyEn: 'Medium',
      timeline: '4-8月', timelineEn: '4-8 months', cost: '$15K-40K',
      description: '东南亚第二大市场，准入政策相对宽松',
      descriptionEn: 'Second largest Southeast Asian market with relatively relaxed policies',
    },
    {
      id: 'malaysia', name: '马来西亚', nameEn: 'Malaysia', flag: '🇲🇾',
      tier: '二线', tierEn: 'Tier 2', difficulty: '低', difficultyEn: 'Low',
      timeline: '3-6月', timelineEn: '3-6 months', cost: '$12K-35K',
      description: '多元文化市场，伊斯兰清真认证优势',
      descriptionEn: 'Multicultural market with Islamic halal certification advantage',
    },
    {
      id: 'uae', name: '阿联酋', nameEn: 'UAE', flag: '🇦🇪',
      tier: '二线', tierEn: 'Tier 2', difficulty: '低', difficultyEn: 'Low',
      timeline: '3-6月', timelineEn: '3-6 months', cost: '$20K-50K',
      description: '中东门户市场，辐射海合会国家',
      descriptionEn: 'Gateway to Middle East, access to GCC countries',
    },
    {
      id: 'hongkong', name: '中国香港', nameEn: 'Hong Kong', flag: '🇭🇰',
      tier: '细分', tierEn: 'Niche', difficulty: '低', difficultyEn: 'Low',
      timeline: '2-4月', timelineEn: '2-4 months', cost: '$8K-25K',
      description: '进入门槛最低，可作为出海第一站',
      descriptionEn: 'Lowest barrier to entry, ideal as first step for expansion',
    },
    {
      id: 'taiwan', name: '中国台湾', nameEn: 'Taiwan', flag: '🇹🇼',
      tier: '细分', tierEn: 'Niche', difficulty: '中', difficultyEn: 'Medium',
      timeline: '4-8月', timelineEn: '4-8 months', cost: '$12K-35K',
      description: '文化相通，语言无障碍，市场熟悉度高',
      descriptionEn: 'Cultural affinity, no language barrier, high market familiarity',
    },
  ];

  const filteredMarkets = filter === 'all'
    ? markets
    : filter === 'tier1'
      ? markets.filter(m => m.tier === '一线')
      : filter === 'tier2'
        ? markets.filter(m => m.tier === '二线')
        : markets.filter(m => m.tier === '细分');

  const getDifficultyColor = (difficulty: string) => {
    if (difficulty === '低') return { bg: 'rgba(16,185,129,0.15)', text: '#10b981', border: 'rgba(16,185,129,0.3)' };
    if (difficulty === '中') return { bg: 'rgba(245,158,11,0.15)', text: '#f59e0b', border: 'rgba(245,158,11,0.3)' };
    return { bg: 'rgba(239,68,68,0.15)', text: '#ef4444', border: 'rgba(239,68,68,0.3)' };
  };

  const getTierColor = (tier: string) => {
    if (tier === '一线') return { bg: 'rgba(59,130,246,0.15)', text: '#60a5fa' };
    if (tier === '二线') return { bg: 'rgba(139,92,246,0.15)', text: '#a78bfa' };
    return { bg: 'rgba(100,116,139,0.2)', text: '#94a3b8' };
  };

  return (
    <section
      id="markets"
      style={{ background: 'linear-gradient(180deg, #080d18 0%, #0d1a2a 50%, #080d18 100%)' }}
    >
      {/* Background decoration */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.03) 1px, transparent 0)', backgroundSize: '32px 32px' }}
      />

      <div className="relative max-w-6xl mx-auto px-4 py-20">
        {/* 标题 */}
        <div className="text-center mb-12">
          <div
            className="inline-flex items-center gap-2 rounded-full text-sm font-semibold mb-4 px-4 py-1.5"
            style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', color: '#10b981' }}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            {isZh ? '全球市场准入' : 'Global Market Entry'}
          </div>
          <h2 className="text-3xl font-bold mb-3" style={{ fontFamily: 'Georgia, serif', color: '#f0f6ff', letterSpacing: '-0.02em' }}>
            {t('markets.title') || (isZh ? '目标市场' : 'Target Markets')}
          </h2>
          <p className="max-w-2xl mx-auto" style={{ color: '#8899aa', lineHeight: 1.7 }}>
            {t('markets.subtitle') || (isZh
              ? '选择适合您的出海目的地，获取详细的市场进入方案'
              : 'Choose your ideal export destination and get detailed market entry plans')}
          </p>
        </div>

        {/* 筛选器 */}
        <div className="flex items-center justify-center gap-2 mb-10">
          <Filter className="w-4 h-4" style={{ color: '#4a6080' }} />
          {[
            { key: 'all', label: isZh ? '全部' : 'All' },
            { key: 'tier1', label: isZh ? '一线市场' : 'Tier 1' },
            { key: 'tier2', label: isZh ? '二线市场' : 'Tier 2' },
            { key: 'niche', label: isZh ? '细分市场' : 'Niche' },
          ].map(btn => (
            <button
              key={btn.key}
              onClick={() => setFilter(btn.key)}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
              style={
                filter === btn.key
                  ? { background: '#10b981', color: '#fff', border: '1px solid rgba(16,185,129,0.5)' }
                  : { background: 'rgba(255,255,255,0.05)', color: '#8899aa', border: '1px solid rgba(255,255,255,0.08)' }
              }
            >
              {btn.label}
            </button>
          ))}
        </div>

        {/* 市场卡片网格 */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMarkets.map((market) => {
            const diff = getDifficultyColor(market.difficulty);
            const tier = getTierColor(market.tier);

            return (
              <div
                key={market.id}
                className="rounded-xl p-5 transition-all duration-200 cursor-pointer group"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(16,185,129,0.3)';
                  (e.currentTarget as HTMLDivElement).style.boxShadow = '0 0 20px rgba(16,185,129,0.1)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.08)';
                  (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
                }}
              >
                {/* 头部 */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{market.flag}</span>
                    <div>
                      <h3 className="font-semibold" style={{ color: '#d0ddef' }}>
                        {isZh ? market.name : market.nameEn}
                      </h3>
                      <span
                        className="inline-block px-2 py-0.5 rounded text-xs font-medium mt-0.5"
                        style={{ background: tier.bg, color: tier.text }}
                      >
                        {isZh ? market.tier : market.tierEn}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 描述 */}
                <p className="text-sm mb-4" style={{ color: '#8899aa', lineHeight: 1.6 }}>
                  {isZh ? market.description : market.descriptionEn}
                </p>

                {/* 指标标签 */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <span
                    className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium"
                    style={{ background: diff.bg, color: diff.text, border: `1px solid ${diff.border}` }}
                  >
                    <Shield className="w-3 h-3" />
                    {isZh ? `难度${market.difficulty}` : market.difficultyEn}
                  </span>
                  <span
                    className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium"
                    style={{ background: 'rgba(255,255,255,0.05)', color: '#8899aa', border: '1px solid rgba(255,255,255,0.08)' }}
                  >
                    <Clock className="w-3 h-3" />
                    {isZh ? market.timeline : market.timelineEn}
                  </span>
                  <span
                    className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium"
                    style={{ background: 'rgba(255,255,255,0.05)', color: '#8899aa', border: '1px solid rgba(255,255,255,0.08)' }}
                  >
                    <DollarSign className="w-3 h-3" />
                    {market.cost}
                  </span>
                </div>

                {/* CTA */}
                <button
                  className="w-full py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all"
                  style={{
                    background: 'transparent',
                    border: '1px solid rgba(255,255,255,0.12)',
                    color: '#8899aa',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLButtonElement).style.background = '#10b981';
                    (e.currentTarget as HTMLButtonElement).style.color = '#fff';
                    (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(16,185,129,0.5)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                    (e.currentTarget as HTMLButtonElement).style.color = '#8899aa';
                    (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.12)';
                  }}
                >
                  {isZh ? '查看详情' : 'View Details'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Markets;
