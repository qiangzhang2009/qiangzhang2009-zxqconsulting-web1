/**
 * 市场展示板块 - 统一风格
 * 与 AIToolsHub / Contact 等组件保持一致的 Tailwind 风格
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

const DIFFICULTY_STYLES = {
  低: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  中: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  高: 'bg-red-500/15 text-red-300 border-red-500/30',
};

const TIER_STYLES = {
  一线: 'bg-blue-500/15 text-blue-300',
  二线: 'bg-purple-500/15 text-purple-300',
  细分: 'bg-slate-500/15 text-slate-300',
};

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

  return (
    <section id="markets" className="relative bg-[#07111a] py-20">
      {/* Background decoration */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.03) 1px, transparent 0)', backgroundSize: '32px 32px' }}
      />

      <div className="relative mx-auto max-w-7xl px-6">
        {/* 标题 */}
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm font-semibold text-emerald-300">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            {isZh ? '全球市场准入' : 'Global Market Entry'}
          </div>
          <h2 className="mb-3 text-3xl font-bold text-white md:text-4xl" style={{ fontFamily: 'Georgia, serif', letterSpacing: '-0.02em' }}>
            {t('markets.title') || (isZh ? '目标市场' : 'Target Markets')}
          </h2>
          <p className="mx-auto max-w-2xl leading-relaxed text-slate-400">
            {t('markets.subtitle') || (isZh
              ? '选择适合您的出海目的地，获取详细的市场进入方案'
              : 'Choose your ideal export destination and get detailed market entry plans')}
          </p>
        </div>

        {/* 筛选器 - 统一风格 */}
        <div className="mb-10 flex items-center justify-center gap-2">
          <Filter className="h-4 w-4 text-slate-500" />
          {[
            { key: 'all', label: isZh ? '全部' : 'All' },
            { key: 'tier1', label: isZh ? '一线市场' : 'Tier 1' },
            { key: 'tier2', label: isZh ? '二线市场' : 'Tier 2' },
            { key: 'niche', label: isZh ? '细分市场' : 'Niche' },
          ].map(btn => (
            <button
              key={btn.key}
              onClick={() => setFilter(btn.key)}
              className={`rounded-2xl px-4 py-2 text-sm font-medium transition-all ${
                filter === btn.key
                  ? 'bg-emerald-500 text-white'
                  : 'border border-white/10 bg-slate-900/40 text-slate-300 hover:border-white/20'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>

        {/* 市场卡片网格 - 统一风格 */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredMarkets.map((market) => {
            const diffClass = DIFFICULTY_STYLES[market.difficulty as keyof typeof DIFFICULTY_STYLES] || DIFFICULTY_STYLES.中;
            const tierClass = TIER_STYLES[market.tier as keyof typeof TIER_STYLES] || TIER_STYLES.细分;

            return (
              <div
                key={market.id}
                className="group cursor-pointer rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 transition-all duration-200 hover:border-emerald-400/30 hover:shadow-lg hover:shadow-emerald-400/5"
              >
                {/* 头部 */}
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{market.flag}</span>
                    <div>
                      <h3 className="font-semibold text-white">
                        {isZh ? market.name : market.nameEn}
                      </h3>
                      <span className={`mt-0.5 inline-block rounded px-2 py-0.5 text-xs font-medium ${tierClass}`}>
                        {isZh ? market.tier : market.tierEn}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 描述 */}
                <p className="mb-4 text-sm leading-relaxed text-slate-400">
                  {isZh ? market.description : market.descriptionEn}
                </p>

                {/* 指标标签 */}
                <div className="mb-4 flex flex-wrap gap-2">
                  <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium ${diffClass}`}>
                    <Shield className="h-3 w-3" />
                    {isZh ? `难度${market.difficulty}` : market.difficultyEn}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-slate-900/40 px-2.5 py-1 text-xs font-medium text-slate-400">
                    <Clock className="h-3 w-3" />
                    {isZh ? market.timeline : market.timelineEn}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-slate-900/40 px-2.5 py-1 text-xs font-medium text-slate-400">
                    <DollarSign className="h-3 w-3" />
                    {market.cost}
                  </span>
                </div>

                {/* CTA */}
                <button className="group/btn flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-slate-900/40 px-4 py-3 text-sm font-medium text-slate-300 transition-all hover:border-emerald-400/40 hover:bg-emerald-500 hover:text-white">
                  <span>{isZh ? '查看详情' : 'View Details'}</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-0.5" />
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
