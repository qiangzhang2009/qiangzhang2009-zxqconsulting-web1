import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, Search, X, BadgeCheck, Route, ShieldAlert, TrendingUp } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

interface CaseStudy {
  id: string;
  company: string;
  companyEn: string;
  industry: string;
  industryEn: string;
  industryCategory: string;
  decisionType: DecisionType;
  flag: string;
  markets: string[];
  marketsEn: string[];
  challenge: string;
  challengeEn: string;
  solution: string;
  solutionEn: string;
  result: string;
  resultEn: string;
  insight: string;
  insightEn: string;
  metrics: { label: string; labelEn: string; value: string }[];
}

type DecisionType = 'market' | 'compliance' | 'channel' | 'resource';

const CASE_CATEGORIES = [
  { id: 'all' },
  { id: 'market' },
  { id: 'compliance' },
  { id: 'channel' },
  { id: 'resource' },
];

const cases: CaseStudy[] = [
  {
    id: 'case1',
    company: '某百年制药企业', companyEn: 'A Century-Old Pharmaceutical Co.',
    industry: '中成药', industryEn: 'Chinese Patent Medicine', industryCategory: 'tcm',
    decisionType: 'compliance',
    flag: '🇸🇬',
    markets: ['新加坡', '马来西亚', '泰国'], marketsEn: ['Singapore', 'Malaysia', 'Thailand'],
    challenge: '对东南亚市场法规不了解，担心产品合规问题', challengeEn: 'Unfamiliar with SE Asian regulations',
    solution: '通过风险评估确定优先市场，完成新加坡 HAS 认证后复制到马来西亚和泰国',
    solutionEn: 'Prioritized markets through risk assessment, then used Singapore HAS certification as the wedge into Malaysia and Thailand',
    result: '6个月完成3国准入，首年海外收入突破500万',
    resultEn: 'Completed 3-country entry in 6 months, with first-year overseas revenue above RMB 5M',
    insight: '先拿法规最清晰的小市场做样板，再复制到区域市场。',
    insightEn: 'Use the clearest regulatory market as the first proof point, then replicate regionally.',
    metrics: [
      { label: '进入时间', labelEn: 'Entry Time', value: '6个月' },
      { label: '覆盖国家', labelEn: 'Countries', value: '3个' },
      { label: '首年收入', labelEn: 'Revenue', value: '500万+' },
    ],
  },
  {
    id: 'case2',
    company: '某中药饮片企业', companyEn: 'A TCM Decoction Company',
    industry: '中药饮片', industryEn: 'TCM Decoction Pieces', industryCategory: 'tcm',
    decisionType: 'compliance',
    flag: '🇦🇺',
    markets: ['澳大利亚', '新西兰'], marketsEn: ['Australia', 'New Zealand'],
    challenge: '产品定位不清晰，不确定以食品还是药品形式进入', challengeEn: 'Unclear product positioning',
    solution: '通过 TGA 咨询确定以补充药品形式进入，并搭配本地专业渠道',
    solutionEn: 'Used TGA pathway analysis to position the product as complementary medicine and pair it with local professional channels',
    result: '获得 TGA 登记号，进入澳洲主流连锁药店',
    resultEn: 'Obtained TGA registration and entered major Australian pharmacy chains',
    insight: '品类定位本身就是路径设计，错一步会拖慢整个项目。',
    insightEn: 'Product classification is itself pathway design; a wrong choice can slow the entire project.',
    metrics: [
      { label: '认证时间', labelEn: 'Certification', value: '9个月' },
      { label: '合作连锁', labelEn: 'Chains', value: '5家' },
      { label: '市场占有率', labelEn: 'Market Share', value: '15%' },
    ],
  },
  {
    id: 'case3',
    company: '某保健品集团', companyEn: 'A Health Supplements Group',
    industry: '保健食品', industryEn: 'Health Supplements', industryCategory: 'supplement',
    decisionType: 'channel',
    flag: '🇩🇪',
    markets: ['德国', '法国', '荷兰'], marketsEn: ['Germany', 'France', 'Netherlands'],
    challenge: '欧盟传统草药注册门槛高，周期长', challengeEn: 'High EU traditional herbal registration barriers',
    solution: '先按食品补充剂进入，同时为 THR 做中长期准备',
    solutionEn: 'Entered first through the supplement category while preparing a longer-term THR route',
    result: '食品补充剂渠道月销10万欧元，并为 THR 积累基础数据',
    resultEn: 'Reached EUR 100K monthly sales in the supplement channel while building a base for THR',
    insight: '先找能跑通的商业路径，再决定是否进入高门槛法规路径。',
    insightEn: 'Find the commercial path that can move first, then decide whether the higher-barrier regulatory path is justified.',
    metrics: [
      { label: '月销额', labelEn: 'Monthly Sales', value: '10万€' },
      { label: '准备周期', labelEn: 'Timeline', value: '2年' },
      { label: '预计ROI', labelEn: 'Expected ROI', value: '300%' },
    ],
  },
  {
    id: 'case4',
    company: '某护肤品企业', companyEn: 'A Skincare Company',
    industry: '护肤产品', industryEn: 'Skincare Products', industryCategory: 'cosmetic',
    decisionType: 'market',
    flag: '🇯🇵',
    markets: ['日本', '韩国'], marketsEn: ['Japan', 'South Korea'],
    challenge: '日本药妆市场竞争激烈，品牌认知度为零', challengeEn: 'Intense Japanese cosmetics competition, zero brand awareness',
    solution: '以"汉方护肤"定位切入，并用内容种草 + 独立站承接验证需求',
    solutionEn: 'Entered with a Hanfang skincare angle and used content + DTC infrastructure to validate demand',
    result: '小红书自然流量月引3万访客，独立站月销8000美元',
    resultEn: 'Generated 30K monthly visitors from Xiaohongshu and USD 8K monthly DTC sales',
    insight: '在高竞争市场，定位差异化往往比铺渠道更早决定成败。',
    insightEn: 'In highly competitive markets, positioning differentiation often matters before channel scale.',
    metrics: [
      { label: '月访客', labelEn: 'Monthly Visitors', value: '3万' },
      { label: '月销额', labelEn: 'Sales', value: '$8000' },
      { label: '复购率', labelEn: 'Repeat Rate', value: '28%' },
    ],
  },
];

const CaseStudies = () => {
  const { t, i18n } = useTranslation();
  const isZh = i18n.language === 'zh';
  const sectionRef = useRef<HTMLDivElement>(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCases = useMemo(
    () =>
      cases.filter((c) => {
        const matchesCategory = activeCategory === 'all' || c.decisionType === activeCategory;
        const q = searchQuery.toLowerCase();
        const matchesSearch =
          !q ||
          c.company.toLowerCase().includes(q) ||
          c.companyEn.toLowerCase().includes(q) ||
          c.industry.toLowerCase().includes(q) ||
          c.industryEn.toLowerCase().includes(q) ||
          c.markets.some((m) => m.toLowerCase().includes(q)) ||
          c.marketsEn.some((m) => m.toLowerCase().includes(q));
        return matchesCategory && matchesSearch;
      }),
    [activeCategory, searchQuery]
  );

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.case-card',
        { y: 34, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.65,
          stagger: 0.08,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 72%',
          },
        }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, [filteredCases.length]);

  const catLabel = (id: string) =>
    t(`cases.cat_${id}`, id === 'all' ? t('cases.cat_all') : id);

  return (
    <section id="cases" ref={sectionRef} className="bg-[#08131d] py-24">
      <div className="container mx-auto px-6">
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm text-emerald-300">
            <BadgeCheck className="h-4 w-4" />
            {t('cases.badge')}
          </div>
          <h2 className="mt-5 text-3xl font-semibold text-white md:text-5xl">
            {t('cases.badgeTitle')}
          </h2>
          <p className="mt-5 text-lg leading-8 text-slate-400">
            {t('cases.desc')}
          </p>
        </div>

        <div className="mt-10 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-3">
            {CASE_CATEGORIES.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  activeCategory === category.id
                    ? 'bg-white text-slate-900'
                    : 'border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
                }`}
              >
                {catLabel(category.id)}
              </button>
            ))}
          </div>

          <div className="relative w-full max-w-md">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('cases.searchPlaceholder')}
              className="w-full rounded-2xl border border-white/10 bg-white/[0.04] py-3 pl-11 pr-11 text-sm text-white placeholder:text-slate-500 focus:border-emerald-400/40 focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        <div className="mt-4 text-sm text-slate-500">
          {t('cases.showCount', { n: filteredCases.length })}
        </div>

        <div className="mt-10 grid gap-6 xl:grid-cols-2">
          {filteredCases.map((item) => (
            <article key={item.id} className="case-card rounded-[2rem] border border-white/10 bg-white/[0.04] p-7 backdrop-blur-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-sm uppercase tracking-[0.22em] text-emerald-300/80">
                    {item.flag} {isZh ? item.industry : item.industryEn}
                  </div>
                  <h3 className="mt-3 text-2xl font-semibold text-white">{isZh ? item.company : item.companyEn}</h3>
                  <div className="mt-3 text-sm text-slate-400">
                    {(isZh ? item.markets : item.marketsEn).join(' / ')}
                  </div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-[#0c1722] px-4 py-2 text-xs uppercase tracking-[0.18em] text-slate-400">
                  {t('cases.proofCase')}
                </div>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-[#0c1722] p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-amber-200">
                    <ShieldAlert className="h-4 w-4" />
                    {t('cases.industry')}
                  </div>
                  <p className="mt-3 text-sm leading-7 text-slate-300">{isZh ? item.challenge : item.challengeEn}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-[#0c1722] p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-emerald-300">
                    <Route className="h-4 w-4" />
                    {t('cases.pathway')}
                  </div>
                  <p className="mt-3 text-sm leading-7 text-slate-300">{isZh ? item.solution : item.solutionEn}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-[#0c1722] p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-cyan-300">
                    <TrendingUp className="h-4 w-4" />
                    {t('cases.outcome')}
                  </div>
                  <p className="mt-3 text-sm leading-7 text-slate-300">{isZh ? item.result : item.resultEn}</p>
                </div>
              </div>

              <div className="mt-5 rounded-2xl border border-emerald-400/15 bg-emerald-400/5 p-4">
                <div className="text-sm font-semibold text-white">{t('cases.insight')}</div>
                <p className="mt-2 text-sm leading-7 text-slate-300">{isZh ? item.insight : item.insightEn}</p>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                {item.metrics.map((metric) => (
                  <div key={metric.label + metric.value} className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4">
                    <div className="text-2xl font-semibold text-white">{metric.value}</div>
                    <div className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-500">{isZh ? metric.label : metric.labelEn}</div>
                  </div>
                ))}
              </div>

              <Link
                to="/expert"
                className="mt-6 inline-flex items-center gap-2 rounded-2xl border border-white/12 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
              >
                {t('cases.applyCase')} <ArrowRight className="h-4 w-4" />
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CaseStudies;
