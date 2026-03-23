import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, Filter, Search, X } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

interface CaseStudy {
  id: string;
  company: string;
  companyEn: string;
  industry: string;
  industryEn: string;
  industryCategory: string; // 用于筛选
  flag: string;
  markets: string[];
  marketsEn: string[];
  challenge: string;
  challengeEn: string;
  solution: string;
  solutionEn: string;
  result: string;
  resultEn: string;
  metrics: { label: string; labelEn: string; value: string }[];
}

const CASE_CATEGORIES = [
  { id: 'all', label: '全部案例', labelEn: 'All Cases' },
  { id: 'supplement', label: '保健食品', labelEn: 'Health Supplements' },
  { id: 'tcm', label: '中医药', labelEn: 'TCM' },
  { id: 'cosmetic', label: '护肤美容', labelEn: 'Skincare' },
  { id: 'medical', label: '医疗器械', labelEn: 'Medical Devices' },
];

const cases: CaseStudy[] = [
  {
    id: 'case1',
    company: '某百年制药企业',
    companyEn: 'A Century-Old Pharmaceutical Co.',
    industry: '中成药',
    industryEn: 'Chinese Patent Medicine',
    industryCategory: 'tcm',
    flag: '🇸🇬',
    markets: ['新加坡', '马来西亚', '泰国'],
    marketsEn: ['Singapore', 'Malaysia', 'Thailand'],
    challenge: '对东南亚市场法规不了解，担心产品合规问题',
    challengeEn: 'Unfamiliar with SE Asian regulations',
    solution: '通过风险评估确定优先市场，完成新加坡HAS认证后快速复制到马来西亚和泰国',
    solutionEn: 'Prioritized markets through risk assessment, completed Singapore HAS certification',
    result: '6个月完成3国准入，首年海外收入突破500万',
    resultEn: 'Completed 3-country entry in 6 months, first year revenue exceeded 5M CNY',
    metrics: [
      { label: '进入时间', labelEn: 'Entry Time', value: '6个月' },
      { label: '覆盖国家', labelEn: 'Countries', value: '3个' },
      { label: '首年收入', labelEn: 'Revenue', value: '500万+' },
    ],
  },
  {
    id: 'case2',
    company: '某中药饮片企业',
    companyEn: 'A TCM Decoction Company',
    industry: '中药饮片',
    industryEn: 'TCM Decoction Pieces',
    industryCategory: 'tcm',
    flag: '🇦🇺',
    markets: ['澳大利亚', '新西兰'],
    marketsEn: ['Australia', 'New Zealand'],
    challenge: '产品定位不清晰，不确定以食品还是药品形式进入',
    challengeEn: 'Unclear product positioning',
    solution: '通过TGA咨询确定以补充药品形式进入，建立本地化渠道',
    solutionEn: 'Determined to enter as complementary medicine through TGA consultation',
    result: '获得TGA登记号，进入澳洲主流连锁药店',
    resultEn: 'Obtained TGA registration, entered major Australian pharmacy chains',
    metrics: [
      { label: '认证时间', labelEn: 'Certification', value: '9个月' },
      { label: '合作连锁', labelEn: 'Chains', value: '5家' },
      { label: '市场占有率', labelEn: 'Market Share', value: '15%' },
    ],
  },
  {
    id: 'case3',
    company: '某保健品集团',
    companyEn: 'A Health Supplements Group',
    industry: '保健食品',
    industryEn: 'Health Supplements',
    industryCategory: 'supplement',
    flag: '🇩🇪',
    markets: ['德国', '法国', '荷兰'],
    marketsEn: ['Germany', 'France', 'Netherlands'],
    challenge: '欧盟传统草药注册门槛高，周期长',
    challengeEn: 'High EU traditional herbal registration barriers',
    solution: '以食品补充剂形式先行进入，同步准备THR注册',
    solutionEn: 'Entered as food supplement while preparing THR registration',
    result: '食品补充剂渠道月销10万欧元，为THR积累临床数据',
    resultEn: 'Food supplement channel 100K EUR/month, accumulated data for THR',
    metrics: [
      { label: '月销额', labelEn: 'Monthly Sales', value: '10万€' },
      { label: '准备周期', labelEn: 'Timeline', value: '2年' },
      { label: '预计ROI', labelEn: 'Expected ROI', value: '300%' },
    ],
  },
  {
    id: 'case4',
    company: '某护肤品企业',
    companyEn: 'A Skincare Company',
    industry: '护肤产品',
    industryEn: 'Skincare Products',
    industryCategory: 'cosmetic',
    flag: '🇯🇵',
    markets: ['日本', '韩国'],
    marketsEn: ['Japan', 'South Korea'],
    challenge: '日本药妆市场竞争激烈，品牌认知度为零',
    challengeEn: 'Intense Japanese cosmetics competition, zero brand awareness',
    solution: '以「汉方护肤」差异化定位，通过小红书种草+独立站承接',
    solutionEn: 'Differentiated as Hanfang skincare, leveraged Xiaohongshu + independent site',
    result: '小红书自然流量月引3万访客，独立站月销8000美元',
    resultEn: '30K monthly visitors from Xiaohongshu, independent site $8K/month',
    metrics: [
      { label: '月访客', labelEn: 'Monthly Visitors', value: '3万' },
      { label: '月销额', labelEn: 'Sales', value: '$8000' },
      { label: '复购率', labelEn: 'Repeat Rate', value: '28%' },
    ],
  },
  {
    id: 'case5',
    company: '某益生菌企业',
    companyEn: 'A Probiotic Company',
    industry: '益生菌产品',
    industryEn: 'Probiotic Products',
    industryCategory: 'supplement',
    flag: '🇻🇳',
    markets: ['越南', '印度尼西亚'],
    marketsEn: ['Vietnam', 'Indonesia'],
    challenge: '东南亚消费者对益生菌认知不足，渠道建设困难',
    challengeEn: 'Low consumer awareness, channel building difficult',
    solution: '与当地母婴连锁合作，以「儿童肠道健康」切入',
    solutionEn: 'Partnered with local mother-child chains, entered via children gut health angle',
    result: '进入越南Tiki和Shopee，月销稳定在15万美元',
    resultEn: 'Entered Vietnam Tiki and Shopee, stable at $150K/month',
    metrics: [
      { label: '月销额', labelEn: 'Monthly Sales', value: '$15万' },
      { label: '覆盖渠道', labelEn: 'Channels', value: '5个' },
      { label: '用户数', labelEn: 'Users', value: '10万+' },
    ],
  },
  {
    id: 'case6',
    company: '某中药配方颗粒企业',
    companyEn: 'A TCM Granules Company',
    industry: '中药配方颗粒',
    industryEn: 'TCM Granules',
    industryCategory: 'tcm',
    flag: '🇺🇸',
    markets: ['美国'],
    marketsEn: ['USA'],
    challenge: 'FDA对中医药产品监管严格，注册路径不明',
    challengeEn: 'Strict FDA regulations, unclear registration path',
    solution: '以膳食补充剂(NDI)路径进入，同步申请药品临床',
    solutionEn: 'Entered as dietary supplement (NDI), simultaneously applied for drug clinical trial',
    result: '首年进入3个州，月销3万美元',
    resultEn: 'Entered 3 states first year, $30K/month',
    metrics: [
      { label: '进入州数', labelEn: 'States', value: '3个' },
      { label: '月销额', labelEn: 'Sales', value: '$3万' },
      { label: '合作诊所', labelEn: 'Clinics', value: '20家' },
    ],
  },
  {
    id: 'case7',
    company: '某康复器械企业',
    companyEn: 'A Rehabilitation Equipment Co.',
    industry: '康复辅助器械',
    industryEn: 'Rehabilitation Aids',
    industryCategory: 'medical',
    flag: '🇪🇺',
    markets: ['德国', '荷兰'],
    marketsEn: ['Germany', 'Netherlands'],
    challenge: '欧盟MDR新规要求严苛，认证成本高',
    challengeEn: 'New EU MDR requirements strict, high certification cost',
    solution: '与荷兰本地经销商合作，借助其MDR认证体系',
    solutionEn: 'Partnered with Dutch local distributor, leveraged their MDR system',
    result: '获得CE认证，进入荷兰、德国公立医疗机构采购目录',
    resultEn: 'Obtained CE certification, entered Dutch/German public medical institution procurement',
    metrics: [
      { label: '认证时间', labelEn: 'Certification', value: '14个月' },
      { label: '采购目录', labelEn: 'Procurement Lists', value: '2国' },
      { label: '年订单额', labelEn: 'Annual Orders', value: '€50万' },
    ],
  },
  {
    id: 'case8',
    company: '某中药香氛企业',
    companyEn: 'A TCM Aromatherapy Co.',
    industry: '中药香氛/精油',
    industryEn: 'TCM Aromatherapy',
    industryCategory: 'cosmetic',
    flag: '🇫🇷',
    markets: ['法国', '英国'],
    marketsEn: ['France', 'UK'],
    challenge: '高端香氛市场竞争成熟，中国品牌难以建立信任',
    challengeEn: 'Mature high-end fragrance market, hard to build trust for Chinese brands',
    solution: '以「中医香疗」文化故事切入高端Spa渠道',
    solutionEn: 'Entered luxury Spa channel with TCM aromatherapy cultural narrative',
    result: '进入巴黎5家高端Spa，月销稳定在2万欧元',
    resultEn: 'Entered 5 luxury Parisian Spas, stable at €20K/month',
    metrics: [
      { label: '月销额', labelEn: 'Sales', value: '€2万' },
      { label: '合作Spa', labelEn: 'Spa Partners', value: '5家' },
      { label: '品牌溢价', labelEn: 'Premium', value: '3倍' },
    ],
  },
  {
    id: 'case9',
    company: '某功能性饮料企业',
    companyEn: 'A Functional Beverage Co.',
    industry: '功能性饮料',
    industryEn: 'Functional Beverages',
    industryCategory: 'supplement',
    flag: '🇮🇩',
    markets: ['印度尼西亚', '菲律宾'],
    marketsEn: ['Indonesia', 'Philippines'],
    challenge: '穆斯林市场需要清真认证，成本高周期长',
    challengeEn: 'Muslim market requires halal certification, costly and time-consuming',
    solution: '先在菲律宾非穆斯林群体试水，同步申请印尼清真认证',
    solutionEn: 'Tested in Philippines non-Muslim group, simultaneously applied for Indonesian halal',
    result: '菲律宾月销50万美元，清真认证获批后印尼月销达30万美元',
    resultEn: 'Philippines $500K/month, Indonesia $300K/month after halal approval',
    metrics: [
      { label: '菲律宾月销', labelEn: 'PH Sales', value: '$50万' },
      { label: '印尼月销', labelEn: 'ID Sales', value: '$30万' },
      { label: '进入周期', labelEn: 'Entry Timeline', value: '8个月' },
    ],
  },
  {
    id: 'case10',
    company: '某医疗器械企业',
    companyEn: 'A Medical Device Company',
    industry: '家用诊断设备',
    industryEn: 'Home Diagnostic Devices',
    industryCategory: 'medical',
    flag: '🇸🇦',
    markets: ['沙特阿拉伯', '阿联酋'],
    marketsEn: ['Saudi Arabia', 'UAE'],
    challenge: '中东医疗器械进口需要SFDA认证，资料要求高',
    challengeEn: 'Middle East medical device import requires SFDA, high documentation requirements',
    solution: '与沙特本地合作伙伴组建JV，共同承担认证成本',
    solutionEn: 'Formed JV with Saudi local partner to share certification costs',
    result: '获得SFDA认证，进入沙特公立医院采购体系',
    resultEn: 'Obtained SFDA certification, entered Saudi public hospital procurement',
    metrics: [
      { label: '认证周期', labelEn: 'Certification', value: '11个月' },
      { label: '年订单额', labelEn: 'Annual Orders', value: '$200万' },
      { label: '合作医院', labelEn: 'Hospitals', value: '15家' },
    ],
  },
];

const CaseStudies = () => {
  const { i18n } = useTranslation();
  const sectionRef = useRef<HTMLDivElement>(null);
  const isZh = i18n.language === 'zh';
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCases = cases.filter(c => {
    const matchesCategory = activeCategory === 'all' || c.industryCategory === activeCategory;
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q ||
      c.company.toLowerCase().includes(q) ||
      c.companyEn.toLowerCase().includes(q) ||
      c.industry.toLowerCase().includes(q) ||
      c.industryEn.toLowerCase().includes(q) ||
      c.markets.some(m => m.toLowerCase().includes(q)) ||
      c.marketsEn.some(m => m.toLowerCase().includes(q));
    return matchesCategory && matchesSearch;
  });

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.case-card',
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          stagger: 0.12,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 70%',
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, [filteredCases.length]);

  const scrollToContact = () => {
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="cases" ref={sectionRef} className="py-24 bg-gray-900">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="inline-block text-blue-600 font-semibold mb-3 text-sm tracking-wide">
            {isZh ? '真实案例' : 'Case Studies'}
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {isZh ? '他们都成功出海了' : 'They All Successfully Went Overseas'}
          </h2>
          <p className="text-gray-300 max-w-2xl mx-auto text-lg">
            {isZh
              ? `来自${cases.length}个不同细分领域的中医药企业，都找到了适合自己的出海之路`
              : `${cases.length} TCM companies from different sectors found their own path overseas`}
          </p>
        </div>

        {/* 筛选器 */}
        <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          {/* 分类筛选 */}
          <div className="flex flex-wrap gap-2">
            {CASE_CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  activeCategory === cat.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-300 border border-gray-700 hover:border-blue-500'
                }`}
              >
                {isZh ? cat.label : cat.labelEn}
              </button>
            ))}
          </div>

          {/* 搜索框 */}
          <div className="relative flex-shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isZh ? '搜索案例...' : 'Search cases...'}
              className="pl-9 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-full text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none w-48"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <X className="w-4 h-4 text-gray-400 hover:text-white" />
              </button>
            )}
          </div>

          <div className="text-sm text-gray-400 flex-shrink-0">
            {isZh ? `显示 ${filteredCases.length}/${cases.length} 个案例` : `Showing ${filteredCases.length}/${cases.length} cases`}
          </div>
        </div>

        {/* Cases Grid */}
        {filteredCases.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-gray-400 text-lg">
              {isZh ? '没有找到匹配的案例' : 'No matching cases found'}
            </p>
            <button
              onClick={() => { setActiveCategory('all'); setSearchQuery(''); }}
              className="mt-4 text-blue-400 hover:text-blue-300 text-sm"
            >
              {isZh ? '清除筛选' : 'Clear filters'}
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {filteredCases.map((caseItem) => (
              <div
                key={caseItem.id}
                className="case-card bg-gray-800 rounded-2xl p-6 border border-gray-700 hover:border-blue-500 hover:shadow-xl transition-all duration-300 flex flex-col"
              >
                {/* Company Header */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-2xl">{caseItem.flag}</span>
                      <h3 className="font-bold text-white text-base">{isZh ? caseItem.company : caseItem.companyEn}</h3>
                    </div>
                    <span className="inline-block text-xs text-gray-300 bg-gray-700 px-2 py-1 rounded-full">
                      {isZh ? caseItem.industry : caseItem.industryEn}
                    </span>
                  </div>
                </div>

                {/* Markets */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {(isZh ? caseItem.markets : caseItem.marketsEn).map((market, idx) => (
                    <span key={idx} className="text-xs text-blue-400 bg-blue-500/10 px-2 py-1 rounded-full">
                      {market}
                    </span>
                  ))}
                </div>

                {/* Challenge */}
                <div className="mb-3 flex-1">
                  <div className="text-xs font-medium text-gray-400 mb-1">{isZh ? '痛点' : 'Challenge'}</div>
                  <p className="text-sm text-gray-300 line-clamp-2">{isZh ? caseItem.challenge : caseItem.challengeEn}</p>
                </div>

                {/* Solution */}
                <div className="mb-3">
                  <div className="text-xs font-medium text-gray-400 mb-1">{isZh ? '方案' : 'Solution'}</div>
                  <p className="text-sm text-gray-300 line-clamp-2">{isZh ? caseItem.solution : caseItem.solutionEn}</p>
                </div>

                {/* Result */}
                <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                  <div className="text-xs font-medium text-emerald-400 mb-1">{isZh ? '成果' : 'Result'}</div>
                  <p className="text-sm text-emerald-300 line-clamp-2">{isZh ? caseItem.result : caseItem.resultEn}</p>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-2 pt-3 border-t border-gray-700">
                  {caseItem.metrics.map((metric, idx) => (
                    <div key={idx} className="text-center">
                      <div className="text-base font-bold text-white">{metric.value}</div>
                      <div className="text-xs text-gray-400">{isZh ? metric.label : metric.labelEn}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="text-center">
          <button
            onClick={scrollToContact}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-semibold inline-flex items-center gap-2 transition-all"
          >
            {isZh ? '预约专家咨询' : 'Book Expert Consultation'}
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default CaseStudies;
