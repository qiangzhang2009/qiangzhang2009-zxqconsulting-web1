/**
 * 市场展示板块 - 专业B2B咨询风格
 * 简洁、清晰、信息丰富
 */

import { useState, useRef } from 'react';
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
  const sectionRef = useRef<HTMLDivElement>(null);
  const isZh = i18n.language === 'zh';

  const [filter, setFilter] = useState('all');

  const markets: Market[] = [
    {
      id: 'japan',
      name: '日本',
      nameEn: 'Japan',
      flag: '🇯🇵',
      tier: '一线',
      tierEn: 'Tier 1',
      difficulty: '高',
      difficultyEn: 'High',
      timeline: '12-18月',
      timelineEn: '12-18 months',
      cost: '$80K-250K',
      description: '成熟市场，消费者对品质要求高，品牌溢价空间大',
      descriptionEn: 'Mature market with high quality standards and strong brand premium potential',
    },
    {
      id: 'australia',
      name: '澳大利亚',
      nameEn: 'Australia',
      flag: '🇦🇺',
      tier: '一线',
      tierEn: 'Tier 1',
      difficulty: '中',
      difficultyEn: 'Medium',
      timeline: '6-12月',
      timelineEn: '6-12 months',
      cost: '$30K-80K',
      description: '监管清晰，市场规模适中，是进入大洋洲的优质跳板',
      descriptionEn: 'Clear regulations, moderate market size, excellent gateway to Oceania',
    },
    {
      id: 'singapore',
      name: '新加坡',
      nameEn: 'Singapore',
      flag: '🇸🇬',
      tier: '一线',
      tierEn: 'Tier 1',
      difficulty: '低',
      difficultyEn: 'Low',
      timeline: '3-6月',
      timelineEn: '3-6 months',
      cost: '$15K-40K',
      description: '东南亚金融中心，准入门槛低，营商环境优越',
      descriptionEn: 'Southeast Asian financial hub with low barriers and excellent business environment',
    },
    {
      id: 'usa',
      name: '美国',
      nameEn: 'USA',
      flag: '🇺🇸',
      tier: '一线',
      tierEn: 'Tier 1',
      difficulty: '高',
      difficultyEn: 'High',
      timeline: '12-24月',
      timelineEn: '12-24 months',
      cost: '$50K-150K',
      description: '全球最大市场，审批严格，但回报潜力最高',
      descriptionEn: 'World largest market with strict approval, but highest return potential',
    },
    {
      id: 'germany',
      name: '德国',
      nameEn: 'Germany',
      flag: '🇩🇪',
      tier: '一线',
      tierEn: 'Tier 1',
      difficulty: '高',
      difficultyEn: 'High',
      timeline: '12-24月',
      timelineEn: '12-24 months',
      cost: '$60K-180K',
      description: '欧洲最大市场，标准严格，进入后可辐射欧盟',
      descriptionEn: 'Largest European market with strict standards, gateway to EU',
    },
    {
      id: 'korea',
      name: '韩国',
      nameEn: 'South Korea',
      flag: '🇰🇷',
      tier: '二线',
      tierEn: 'Tier 2',
      difficulty: '中',
      difficultyEn: 'Medium',
      timeline: '6-10月',
      timelineEn: '6-10 months',
      cost: '$25K-60K',
      description: '文化相近，消费能力强，对中药接受度逐渐提高',
      descriptionEn: 'Cultural proximity, strong consumption, increasing acceptance of TCM',
    },
    {
      id: 'thailand',
      name: '泰国',
      nameEn: 'Thailand',
      flag: '🇹🇭',
      tier: '二线',
      tierEn: 'Tier 2',
      difficulty: '中',
      difficultyEn: 'Medium',
      timeline: '4-8月',
      timelineEn: '4-8 months',
      cost: '$15K-40K',
      description: '东南亚第二大市场，准入政策相对宽松',
      descriptionEn: 'Second largest Southeast Asian market with relatively relaxed policies',
    },
    {
      id: 'malaysia',
      name: '马来西亚',
      nameEn: 'Malaysia',
      flag: '🇲🇾',
      tier: '二线',
      tierEn: 'Tier 2',
      difficulty: '低',
      difficultyEn: 'Low',
      timeline: '3-6月',
      timelineEn: '3-6 months',
      cost: '$12K-35K',
      description: '多元文化市场，伊斯兰清真认证优势',
      descriptionEn: 'Multicultural market with Islamic halal certification advantage',
    },
    {
      id: 'uae',
      name: '阿联酋',
      nameEn: 'UAE',
      flag: '🇦🇪',
      tier: '二线',
      tierEn: 'Tier 2',
      difficulty: '低',
      difficultyEn: 'Low',
      timeline: '3-6月',
      timelineEn: '3-6 months',
      cost: '$20K-50K',
      description: '中东门户市场，辐射海合会国家',
      descriptionEn: 'Gateway to Middle East, access to GCC countries',
    },
    {
      id: 'hongkong',
      name: '中国香港',
      nameEn: 'Hong Kong',
      flag: '🇭🇰',
      tier: '细分',
      tierEn: 'Niche',
      difficulty: '低',
      difficultyEn: 'Low',
      timeline: '2-4月',
      timelineEn: '2-4 months',
      cost: '$8K-25K',
      description: '进入门槛最低，可作为出海第一站',
      descriptionEn: 'Lowest barrier to entry, ideal as first step for expansion',
    },
    {
      id: 'taiwan',
      name: '中国台湾',
      nameEn: 'Taiwan',
      flag: '🇹🇼',
      tier: '细分',
      tierEn: 'Niche',
      difficulty: '中',
      difficultyEn: 'Medium',
      timeline: '4-8月',
      timelineEn: '4-8 months',
      cost: '$12K-35K',
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
    if (difficulty === '低') return 'bg-green-100 text-green-700';
    if (difficulty === '中') return 'bg-yellow-100 text-yellow-700';
    return 'bg-red-100 text-red-700';
  };

  return (
    <section
      id="markets"
      ref={sectionRef}
      className="py-20 bg-gray-50"
    >
      <div className="max-w-6xl mx-auto px-4">
        {/* 标题 */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            {t('markets.title') || isZh ? '目标市场' : 'Target Markets'}
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto">
            {t('markets.subtitle') || (isZh 
              ? '选择适合您的出海目的地，获取详细的市场进入方案' 
              : 'Choose your ideal export destination and get detailed market entry plans')}
          </p>
        </div>

        {/* 筛选器 */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <Filter className="w-4 h-4 text-gray-400" />
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'all' 
                ? 'bg-gray-900 text-white' 
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            {isZh ? '全部' : 'All'}
          </button>
          <button
            onClick={() => setFilter('tier1')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'tier1' 
                ? 'bg-gray-900 text-white' 
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            {isZh ? '一线市场' : 'Tier 1'}
          </button>
          <button
            onClick={() => setFilter('tier2')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'tier2' 
                ? 'bg-gray-900 text-white' 
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            {isZh ? '二线市场' : 'Tier 2'}
          </button>
          <button
            onClick={() => setFilter('niche')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'niche' 
                ? 'bg-gray-900 text-white' 
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            {isZh ? '细分市场' : 'Niche'}
          </button>
        </div>

        {/* 市场卡片网格 */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMarkets.map((market) => (
            <div
              key={market.id}
              className="bg-white rounded-xl border border-gray-200 p-5 hover:border-gray-300 hover:shadow-md transition-all"
            >
              {/* 头部 */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{market.flag}</span>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {isZh ? market.name : market.nameEn}
                    </h3>
                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                      market.tier === '一线' ? 'bg-blue-100 text-blue-700' :
                      market.tier === '二线' ? 'bg-purple-100 text-purple-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {isZh ? market.tier : market.tierEn}
                    </span>
                  </div>
                </div>
              </div>

              {/* 描述 */}
              <p className="text-sm text-gray-600 mb-4">
                {isZh ? market.description : market.descriptionEn}
              </p>

              {/* 指标标签 */}
              <div className="flex flex-wrap gap-2 mb-4">
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(market.difficulty)}`}>
                  <Shield className="w-3 h-3" />
                  {isZh ? `难度${market.difficulty}` : market.difficultyEn}
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700">
                  <Clock className="w-3 h-3" />
                  {isZh ? market.timeline : market.timelineEn}
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700">
                  <DollarSign className="w-3 h-3" />
                  {market.cost}
                </span>
              </div>

              {/* CTA */}
              <button className="w-full py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-900 hover:text-white hover:border-gray-900 transition-colors flex items-center justify-center gap-2">
                {isZh ? '查看详情' : 'View Details'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default Markets;
