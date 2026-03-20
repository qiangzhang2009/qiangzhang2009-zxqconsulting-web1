import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface CaseStudy {
  id: string;
  company: string;
  companyEn: string;
  industry: string;
  industryEn: string;
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

const CaseStudies = () => {
  const { i18n } = useTranslation();
  const sectionRef = useRef<HTMLDivElement>(null);
  const isZh = i18n.language === 'zh';

  const cases: CaseStudy[] = [
    {
      id: 'case1',
      company: '某百年制药企业',
      companyEn: 'A Century-Old Pharmaceutical Company',
      industry: '中成药',
      industryEn: 'Chinese Patent Medicine',
      flag: '🇸🇬',
      markets: ['新加坡', '马来西亚', '泰国'],
      marketsEn: ['Singapore', 'Malaysia', 'Thailand'],
      challenge: '对东南亚市场法规不了解，担心产品合规问题',
      challengeEn: 'Unfamiliar with Southeast Asian market regulations, concerned about product compliance',
      solution: '通过风险评估确定优先市场，完成新加坡HAS认证后快速复制到马来西亚和泰国',
      solutionEn: 'Prioritized markets through risk assessment, completed Singapore HAS certification, then quickly expanded to Malaysia and Thailand',
      result: '6个月完成3国准入，首年海外收入突破500万',
      resultEn: 'Completed 3-country market entry in 6 months, first year overseas revenue exceeded 5 million',
      metrics: [
        { label: '进入时间', labelEn: 'Entry Time', value: '6个月' },
        { label: '覆盖国家', labelEn: 'Countries Covered', value: '3个' },
        { label: '首年收入', labelEn: 'First Year Revenue', value: '500万+' },
      ],
    },
    {
      id: 'case2',
      company: '某中药饮片企业',
      companyEn: 'A TCM Decoction Company',
      industry: '中药饮片',
      industryEn: 'TCM Decoction Pieces',
      flag: '🇦🇺',
      markets: ['澳大利亚', '新西兰'],
      marketsEn: ['Australia', 'New Zealand'],
      challenge: '产品定位不清晰，不确定以食品还是药品形式进入',
      challengeEn: 'Unclear product positioning, unsure whether to enter as food or medicine',
      solution: '通过TGA咨询确定以补充药品形式进入，建立本地化渠道',
      solutionEn: 'Determined to enter as complementary medicine through TGA consultation, established localized channels',
      result: '获得TGA登记号，进入澳洲主流连锁药店',
      resultEn: 'Obtained TGA registration, entered major Australian pharmacy chains',
      metrics: [
        { label: '认证时间', labelEn: 'Certification Time', value: '9个月' },
        { label: '合作连锁', labelEn: 'Partner Chains', value: '5家' },
        { label: '市场占有率', labelEn: 'Market Share', value: '15%' },
      ],
    },
    {
      id: 'case3',
      company: '某保健品集团',
      companyEn: 'A Health Supplements Group',
      industry: '保健食品',
      industryEn: 'Health Supplements',
      flag: '🇩🇪',
      markets: ['德国', '法国', '荷兰'],
      marketsEn: ['Germany', 'France', 'Netherlands'],
      challenge: '欧盟传统草药注册门槛高，周期长',
      challengeEn: 'High EU traditional herbal registration barriers, long timeline',
      solution: '以食品补充剂形式先行进入，同步准备THR注册',
      solutionEn: 'Entered first as food supplement while preparing THR registration',
      result: '食品补充剂渠道月销10万欧元，为THR积累临床数据',
      resultEn: 'Food supplement channel achieved 100K EUR monthly sales, accumulated clinical data for THR',
      metrics: [
        { label: '月销额', labelEn: 'Monthly Sales', value: '10万€' },
        { label: '准备周期', labelEn: 'Preparation Timeline', value: '2年' },
        { label: '预计ROI', labelEn: 'Expected ROI', value: '300%' },
      ],
    },
  ];

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.case-card',
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          stagger: 0.15,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 70%',
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const scrollToContact = () => {
    const contactSection = document.getElementById('contact');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section
      id="cases"
      ref={sectionRef}
      className="py-24 bg-gray-900"
    >
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block text-blue-600 font-semibold mb-3 text-sm tracking-wide">
            {isZh ? '真实案例' : 'Case Studies'}
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {isZh ? '他们都成功出海了' : 'They All Successfully Went Overseas'}
          </h2>
          <p className="text-gray-300 max-w-2xl mx-auto text-lg">
            {isZh ? '来自不同细分领域的中医药企业，都找到了适合自己的出海之路' : 'TCM companies from different sectors found their own path to overseas markets'}
          </p>
        </div>

        {/* Cases Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {cases.map((caseItem) => (
            <div
              key={caseItem.id}
              className="case-card bg-gray-800 rounded-2xl p-6 border border-gray-700 hover:shadow-xl transition-all duration-300"
            >
              {/* Company Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-2xl">{caseItem.flag}</span>
                    <h3 className="font-bold text-white">{isZh ? caseItem.company : caseItem.companyEn}</h3>
                  </div>
                  <span className="text-xs text-gray-300 bg-gray-100 px-2 py-1 rounded-full">
                    {isZh ? caseItem.industry : caseItem.industryEn}
                  </span>
                </div>
              </div>

              {/* Markets */}
              <div className="flex flex-wrap gap-1 mb-4">
                {(isZh ? caseItem.markets : caseItem.marketsEn).map((market, idx) => (
                  <span
                    key={idx}
                    className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full"
                  >
                    {market}
                  </span>
                ))}
              </div>

              {/* Challenge */}
              <div className="mb-4">
                <div className="text-xs font-medium text-gray-400 mb-1">{isZh ? '痛点' : 'Challenge'}</div>
                <p className="text-sm text-gray-300">{isZh ? caseItem.challenge : caseItem.challengeEn}</p>
              </div>

              {/* Solution */}
              <div className="mb-4">
                <div className="text-xs font-medium text-gray-400 mb-1">{isZh ? '方案' : 'Solution'}</div>
                <p className="text-sm text-gray-300">{isZh ? caseItem.solution : caseItem.solutionEn}</p>
              </div>

              {/* Result */}
              <div className="mb-4 p-3 bg-green-50 rounded-lg">
                <div className="text-xs font-medium text-green-700 mb-1">{isZh ? '成果' : 'Result'}</div>
                <p className="text-sm text-green-700">{isZh ? caseItem.result : caseItem.resultEn}</p>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-3 gap-2 pt-4 border-t border-gray-700">
                {caseItem.metrics.map((metric, idx) => (
                  <div key={idx} className="text-center">
                    <div className="text-lg font-bold text-white">{metric.value}</div>
                    <div className="text-xs text-gray-400">{isZh ? metric.label : metric.labelEn}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CaseStudies;
