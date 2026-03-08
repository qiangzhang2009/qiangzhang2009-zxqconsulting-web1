/**
 * 可行性评估板块 - AI市场分析
 * 设计理念: 极简双筛、实时刷新、可视化图表、抽屉详情
 */

import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Globe,
  Package,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  X,
  RefreshCw,
  Sparkles,
  Info,
  BarChart3,
  PieChart,
  LineChart
} from 'lucide-react';

// 地区选项
const REGIONS = [
  { value: 'japan', label: '日本', labelEn: 'Japan', flag: '🇯🇵' },
  { value: 'europe', label: '欧洲', labelEn: 'Europe', flag: '🇪🇺' },
  { value: 'southeast', label: '东南亚', labelEn: 'Southeast Asia', flag: '🇸🇬' },
  { value: 'australia', label: '澳大利亚', labelEn: 'Australia', flag: '🇦🇺' },
  { value: 'middleeast', label: '中东', labelEn: 'Middle East', flag: '🇸🇦' },
  { value: 'global', label: '全球', labelEn: 'Global', flag: '🌍' },
];

// 品类选项
const CATEGORIES = [
  { value: 'supplement', label: '保健食品', labelEn: 'Health Supplements' },
  { value: 'traditional', label: '中医药饮片', labelEn: 'TCM Products' },
  { value: 'cosmetic', label: '本草护肤品', labelEn: 'Herbal Skincare' },
  { value: 'medical', label: '医疗器械', labelEn: 'Medical Devices' },
];

// 市场数据
const MARKET_DATA: Record<string, Record<string, {
  heat: number;
  growth: number;
  risk: 'low' | 'medium' | 'high';
  conclusion: string;
  conclusionEn: string;
  policyPoints: string;
  policyPointsEn: string;
  threshold: string;
  thresholdEn: string;
  suggestion: string;
  suggestionEn: string;
}>> = {
  japan: {
    supplement: {
      heat: 92,
      growth: 7.4,
      risk: 'low',
      conclusion: '日本保健食品出海可行性高，热度92%，核心门槛为PMDA注册',
      conclusionEn: 'High feasibility for Japan health supplements, heat 92%, key threshold is PMDA registration',
      policyPoints: 'PMDA注册要求严格，需提供产品成分、功效数据、生产资质等完整资料',
      policyPointsEn: 'PMDA registration requires strict documentation including product composition, efficacy data, and production qualifications',
      threshold: '需完成PMDA注册，预计周期12-18个月，需日本当地代理商',
      thresholdEn: 'PMDA registration required, estimated 12-18 months, local Japanese agent needed',
      suggestion: '建议依托我司日本本地团队完成PMDA合规，降低沟通成本',
      suggestionEn: 'Recommend using our local Japan team for PMDA compliance to reduce communication costs',
    },
    traditional: {
      heat: 78,
      growth: 5.2,
      risk: 'low',
      conclusion: '日本中医药市场稳步增长，汉方药接受度高',
      conclusionEn: 'Japanese TCM market growing steadily, high acceptance of Kampo medicines',
      policyPoints: '汉方药属于医药品类别，需PMDA审批，注册门槛较高',
      policyPointsEn: 'Kampo medicines classified as pharmaceuticals require PMDA approval',
      threshold: '需PMDA医药品注册，周期18-24个月',
      thresholdEn: 'PMDA pharmaceutical registration required, 18-24 months',
      suggestion: '建议从特定保健食品切入，降低准入门槛',
      suggestionEn: 'Recommend starting with Food for Specified Health Uses to reduce barriers',
    },
    cosmetic: {
      heat: 85,
      growth: 8.1,
      risk: 'low',
      conclusion: '日本美妆市场成熟，本草护肤品热度高，增长迅速',
      conclusionEn: 'Mature Japanese cosmetics market, high demand for herbal skincare, rapid growth',
      policyPoints: '医药部外品分类需PMDA备案，普通化妆品相对简单',
      policyPointsEn: 'Quasi-drug category requires PMDA notification, general cosmetics simpler',
      threshold: '医药部外品备案约6-12个月，普通化妆品约3-6个月',
      thresholdEn: 'Quasi-drug notification 6-12 months, general cosmetics 3-6 months',
      suggestion: '推荐从普通化妆品入手，后续升级到医药部外品',
      suggestionEn: 'Recommend starting with general cosmetics, upgrading to quasi-drugs later',
    },
    medical: {
      heat: 65,
      growth: 4.3,
      risk: 'medium',
      conclusion: '日本医疗器械市场准入门槛高，需PMDA认证',
      conclusionEn: 'High barriers for Japanese medical device market, PMDA certification required',
      policyPoints: '医疗器械根据风险等级分为I-IV类，III-IV类需PMDA认证',
      policyPointsEn: 'Medical devices classified by risk level I-IV, Class III-IV require PMDA certification',
      threshold: 'II类医疗器械约12-18个月，III-IV类约24-36个月',
      thresholdEn: 'Class II devices 12-18 months, Class III-IV 24-36 months',
      suggestion: '建议与日本经销商合作，借助其认证资质',
      suggestionEn: 'Recommend partnering with Japanese distributors who have certification qualifications',
    },
  },
  europe: {
    supplement: {
      heat: 88,
      growth: 6.8,
      risk: 'low',
      conclusion: '欧洲保健食品市场活跃，准入需遵循EFSA法规',
      conclusionEn: 'Active European health supplement market, access requires EFSA compliance',
      policyPoints: '需符合欧盟食品补充剂指令(2002/46/EC)，功效宣称的EFSA批准',
      policyPointsEn: 'Must comply with EU Food Supplement Directive (2002/46/EC), EFSA approval for health claims',
      threshold: '约6-12个月完成合规准备，需本地授权代表',
      thresholdEn: '6-12 months for compliance preparation, local authorized representative required',
      suggestion: '依托我司意大利本地团队完成CE合规认证',
      suggestionEn: 'Use our Italian local team for CE compliance certification',
    },
    traditional: {
      heat: 72,
      growth: 4.5,
      risk: 'medium',
      conclusion: '欧洲中医药接受度逐渐提升，但法规严格',
      conclusionEn: 'Increasing acceptance of TCM in Europe, but strict regulations',
      policyPoints: '传统草药产品需符合传统草药指令(THMPD)，注册程序复杂',
      policyPointsEn: 'Traditional herbal products must comply with THMPD, complex registration process',
      threshold: 'THMPD注册约12-24个月，需提供30年以上使用历史证明',
      thresholdEn: 'THMPD registration 12-24 months, requires 30+ years usage history proof',
      suggestion: '建议从食品补充剂切入，积累市场后再升级',
      suggestionEn: 'Recommend starting as food supplements, upgrading later after market entry',
    },
    cosmetic: {
      heat: 90,
      growth: 9.2,
      risk: 'low',
      conclusion: '欧洲美妆市场庞大，本草概念受欢迎',
      conclusionEn: 'Large European cosmetics market, herbal concepts well-received',
      policyPoints: '需符合欧盟化妆品法规(EC 1223/2009)，CPNP通报',
      policyPointsEn: 'Must comply with EU Cosmetic Regulation (EC 1223/2009), CPNP notification',
      threshold: '约3-6个月完成CPNP通报，可上市销售',
      thresholdEn: '3-6 months for CPNP notification, can then be sold',
      suggestion: '本草护肤品概念在欧洲市场有差异化优势',
      suggestionEn: 'Herbal skincare concept has differentiation advantage in European market',
    },
    medical: {
      heat: 75,
      growth: 5.5,
      risk: 'medium',
      conclusion: '欧洲医疗器械市场成熟，MDR法规趋严',
      conclusionEn: 'Mature European medical device market, MDR regulations tightening',
      policyPoints: '需符合MDR(2017/745)法规，公告机构审核',
      policyPointsEn: 'Must comply with MDR (2017/745), notified body review required',
      threshold: 'I类约3-6个月，IIa-IIb类12-24个月，III类18-36个月',
      thresholdEn: 'Class I 3-6 months, Class IIa-IIb 12-24 months, Class III 18-36 months',
      suggestion: '建议提前准备技术文件，选择合适公告机构',
      suggestionEn: 'Recommend preparing technical documents early, choosing appropriate notified body',
    },
  },
  southeast: {
    supplement: {
      heat: 87,
      growth: 13.7,
      risk: 'low',
      conclusion: '东南亚保健食品市场增长迅速，电商渠道活跃',
      conclusionEn: 'Southeast Asian health supplement market growing rapidly, active e-commerce channels',
      policyPoints: '各国法规不同马来西亚NPRA、泰国FDA、新加坡HSA等',
      policyPointsEn: 'Different regulations per country: Malaysia NPRA, Thailand FDA, Singapore HSA',
      threshold: '各国约3-9个月，可多国同时申请',
      thresholdEn: '3-9 months per country, can apply to multiple countries simultaneously',
      suggestion: '建议依托本地电商平台降低渠道成本',
      suggestionEn: 'Recommend using local e-commerce platforms to reduce channel costs',
    },
    traditional: {
      heat: 82,
      growth: 11.2,
      risk: 'low',
      conclusion: '东南亚中医药接受度高，华人市场庞大',
      conclusionEn: 'High TCM acceptance in Southeast Asia, large Chinese community market',
      policyPoints: '新加坡、泰国对中药管理相对宽松，马来西亚需HALAL认证',
      policyPointsEn: 'Singapore, Thailand relatively lenient on TCM, Malaysia requires HALAL certification',
      threshold: '约3-6个月，马来西亚HALAL认证需额外2-3个月',
      thresholdEn: '3-6 months, Malaysia HALAL certification add 2-3 months',
      suggestion: '优先布局新加坡、泰国市场，马来西亚重点推广HALAL产品',
      suggestionEn: 'Prioritize Singapore and Thailand, focus HALAL products for Malaysia',
    },
    cosmetic: {
      heat: 84,
      growth: 10.5,
      risk: 'low',
      conclusion: '东南亚美妆市场年轻化，本土品牌崛起',
      conclusionEn: 'Southeast Asian cosmetics market getting younger, local brands rising',
      policyPoints: '各国化妆品法规差异大，需分别注册',
      policyPointsEn: 'Different cosmetics regulations per country, separate registration needed',
      threshold: '约3-6个月完成各国注册',
      thresholdEn: '3-6 months for country registrations',
      suggestion: '建议与本地分销商合作，快速进入市场',
      suggestionEn: 'Recommend partnering with local distributors for fast market entry',
    },
    medical: {
      heat: 58,
      growth: 6.2,
      risk: 'medium',
      conclusion: '东南亚医疗器械市场发展潜力大',
      conclusionEn: 'Southeast Asian medical device market has great growth potential',
      policyPoints: '各国医疗器材法规不同，部分国家需本地测试',
      policyPointsEn: 'Different medical device regulations per country, some require local testing',
      threshold: '约6-12个月完成注册',
      thresholdEn: '6-12 months for registration',
      suggestion: '建议从新加坡起步，辐射周边国家',
      suggestionEn: 'Recommend starting from Singapore, radiating to neighboring countries',
    },
  },
  australia: {
    supplement: {
      heat: 79,
      growth: 5.8,
      risk: 'low',
      conclusion: '澳大利亚保健品市场成熟，TGA监管严格',
      conclusionEn: 'Mature Australian health supplement market, strict TGA oversight',
      policyPoints: '需符合TGA补充药品框架，完成ARTG注册',
      policyPointsEn: 'Must comply with TGA complementary medicines framework, complete ARTG registration',
      threshold: '约6-12个月ARTG注册完成',
      thresholdEn: '6-12 months for ARTG registration',
      suggestion: 'TGA认证国际认可度高，可作为跳板进入其他市场',
      suggestionEn: 'TGA certification highly recognized internationally, can be stepping stone to other markets',
    },
    traditional: {
      heat: 65,
      growth: 4.2,
      risk: 'low',
      conclusion: '澳大利亚中医药市场稳定增长',
      conclusionEn: 'Stable growth in Australian TCM market',
      policyPoints: '同补充药品框架，需ARTG注册',
      policyPointsEn: 'Same complementary medicines framework, ARTG registration required',
      threshold: '约6-12个月',
      thresholdEn: '6-12 months',
      suggestion: '澳大利亚市场可作为产品功效背书',
      suggestionEn: 'Australian market can serve as product efficacy endorsement',
    },
    cosmetic: {
      heat: 88,
      growth: 7.9,
      risk: 'low',
      conclusion: '澳大利亚美妆市场高端化趋势明显',
      conclusionEn: 'Australian cosmetics market showing clear premium trend',
      policyPoints: '需完成澳大利亚化妆品通知(CCN)，相对简单',
      policyPointsEn: 'Must complete Australian Cosmetics Notification (CCN), relatively simple',
      threshold: '约1-3个月完成CCN',
      thresholdEn: '1-3 months for CCN',
      suggestion: '天然、有机概念在澳市场有溢价优势',
      suggestionEn: 'Natural, organic concepts have premium advantage in Australian market',
    },
    medical: {
      heat: 62,
      growth: 4.8,
      risk: 'medium',
      conclusion: '澳大利亚医疗器械市场准入需TGA认证',
      conclusionEn: 'Australian medical device market requires TGA certification',
      policyPoints: '需符合TGA医疗器械法规，根据风险分类注册',
      policyPointsEn: 'Must comply with TGA medical device regulations, register by risk classification',
      threshold: 'IIa类约9-15个月',
      thresholdEn: 'Class IIa about 9-15 months',
      suggestion: '与当地经销商合作可加速准入',
      suggestionEn: 'Partnering with local distributors can accelerate access',
    },
  },
  middleeast: {
    supplement: {
      heat: 76,
      growth: 8.5,
      risk: 'low',
      conclusion: '中东保健食品市场快速增长，阿联酋为核心市场',
      conclusionEn: 'Rapidly growing Middle East health supplement market, UAE as core market',
      policyPoints: '需符合阿联酋ESMA标准，部分国家需HALAL认证',
      policyPointsEn: 'Must comply with UAE ESMA standards, some countries require HALAL certification',
      threshold: '约4-8个月完成注册',
      thresholdEn: '4-8 months for registration',
      suggestion: 'HALAL认证是关键，建议优先申请',
      suggestionEn: 'HALAL certification is key, recommend applying first',
    },
    traditional: {
      heat: 68,
      growth: 6.3,
      risk: 'medium',
      conclusion: '中东传统医学市场正在兴起',
      conclusionEn: 'Middle Eastern traditional medicine market emerging',
      policyPoints: '阿联酋对中药管理相对开放，需符合进口许可',
      policyPointsEn: 'UAE relatively open to TCM, import license required',
      threshold: '约4-8个月',
      thresholdEn: '4-8 months',
      suggestion: '可作为进入中东市场的切入点',
      suggestionEn: 'Can be entry point to Middle East market',
    },
    cosmetic: {
      heat: 82,
      growth: 9.1,
      risk: 'low',
      conclusion: '中东美妆市场消费力强，对高端品牌需求大',
      conclusionEn: 'Strong Middle East cosmetics market demand, high-end brands in demand',
      policyPoints: '需符合GCC化妆品法规，需HALAL认证',
      policyPointsEn: 'Must comply with GCC cosmetics regulations, HALAL certification required',
      threshold: '约3-6个月',
      thresholdEn: '3-6 months',
      suggestion: '高端定位、本草概念有差异化优势',
      suggestionEn: 'Premium positioning, herbal concepts have differentiation advantage',
    },
    medical: {
      heat: 70,
      growth: 7.2,
      risk: 'medium',
      conclusion: '中东医疗器械市场潜力大，阿联酋为区域中心',
      conclusionEn: 'Great potential in Middle East medical device market, UAE as regional hub',
      policyPoints: '需符合SFDA(沙特)/ESMA(阿联酋)法规',
      policyPointsEn: 'Must comply with SFDA (Saudi)/ESMA (UAE) regulations',
      threshold: '约6-12个月',
      thresholdEn: '6-12 months',
      suggestion: '建议以阿联酋为基地辐射海湾国家',
      suggestionEn: 'Recommend using UAE as base to radiate Gulf countries',
    },
  },
  global: {
    supplement: {
      heat: 85,
      growth: 8.2,
      risk: 'low',
      conclusion: '全球保健食品市场整体活跃，亚太地区增长最快',
      conclusionEn: 'Global health supplement market active, Asia-Pacific growing fastest',
      policyPoints: '各国法规差异大，建议分阶段布局',
      policyPointsEn: 'Different regulations per country, recommend phased approach',
      threshold: '建议分区域准入，周期因地区而异',
      thresholdEn: 'Recommend regional approach, timeline varies by region',
      suggestion: '优先日本、欧洲、东南亚三大市场',
      suggestionEn: 'Prioritize Japan, Europe, Southeast Asia three major markets',
    },
    traditional: {
      heat: 75,
      growth: 6.5,
      risk: 'medium',
      conclusion: '全球中医药市场扩大，发达国家准入门槛高',
      conclusionEn: 'Global TCM market expanding, high barriers in developed countries',
      policyPoints: '建议从东南亚等相对宽松市场起步',
      policyPointsEn: 'Recommend starting from relatively lenient markets like Southeast Asia',
      threshold: '全球布局建议3-5年规划',
      thresholdEn: '3-5 year plan for global rollout',
      suggestion: '分段拓展，先易后难',
      suggestionEn: 'Phased expansion, easy to hard',
    },
    cosmetic: {
      heat: 86,
      growth: 9.0,
      risk: 'low',
      conclusion: '全球美妆市场持续增长，本草概念日益流行',
      conclusionEn: 'Global cosmetics market growing, herbal concepts increasingly popular',
      policyPoints: '优先准入美国、欧盟、日本三大市场',
      policyPointsEn: 'Prioritize US, EU, Japan three major markets',
      threshold: '主要市场准入约12-18个月',
      thresholdEn: 'Major market access about 12-18 months',
      suggestion: '本草护肤品有全球差异化竞争力',
      suggestionEn: 'Herbal skincare has global differentiation competitiveness',
    },
    medical: {
      heat: 68,
      growth: 5.8,
      risk: 'medium',
      conclusion: '全球医疗器械市场成熟，准入门槛普遍较高',
      conclusionEn: 'Mature global medical device market, generally high barriers',
      policyPoints: '建议依托成熟市场认证背书',
      policyPointsEn: 'Recommend leveraging mature market certifications',
      threshold: '全球布局周期较长，建议长期规划',
      thresholdEn: 'Long timeline for global rollout, recommend long-term planning',
      suggestion: '优先CE、FDA认证，获得全球背书',
      suggestionEn: 'Prioritize CE, FDA certification for global endorsement',
    },
  },
};

// 风险标签
const RISK_LABELS = {
  low: { label: '低风险', labelEn: 'Low Risk', color: 'text-emerald-600', bg: 'bg-emerald-50' },
  medium: { label: '中等风险', labelEn: 'Medium Risk', color: 'text-amber-600', bg: 'bg-amber-50' },
  high: { label: '较高风险', labelEn: 'High Risk', color: 'text-red-600', bg: 'bg-red-50' },
};

// 热度颜色
const getHeatColor = (heat: number) => {
  if (heat >= 85) return '#2E7D32';
  if (heat >= 70) return '#1976D2';
  return '#757575';
};

export default function FeasibilityAssessment() {
  const { i18n } = useTranslation();
  const isZh = i18n.language === 'zh';

  // 筛选状态
  const [selectedRegion, setSelectedRegion] = useState('japan');
  const [selectedCategory, setSelectedCategory] = useState('supplement');

  // 展开详情
  const [showDetails, setShowDetails] = useState(false);

  // 抽屉状态
  const [showDrawer, setShowDrawer] = useState(false);

  // 获取当前数据
  const currentData = useMemo(() => {
    return MARKET_DATA[selectedRegion]?.[selectedCategory] || {
      heat: 0,
      growth: 0,
      risk: 'low' as const,
      conclusion: isZh ? '暂无数据' : 'No data available',
      conclusionEn: 'No data available',
      policyPoints: '',
      policyPointsEn: '',
      threshold: '',
      thresholdEn: '',
      suggestion: '',
      suggestionEn: '',
    };
  }, [selectedRegion, selectedCategory, isZh]);

  // 重置筛选
  const handleReset = () => {
    setSelectedRegion('japan');
    setSelectedCategory('supplement');
    setShowDetails(false);
    setShowDrawer(false);
  };

  // 风险等级
  const riskInfo = RISK_LABELS[currentData.risk];

  // 筛选地区名称
  const regionName = REGIONS.find(r => r.value === selectedRegion);
  const categoryName = CATEGORIES.find(c => c.value === selectedCategory);

  return (
    <section id="feasibility" className="py-20 bg-gray-50">
      <div className="max-w-5xl mx-auto px-4">
        
        {/* 标题 */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium mb-4">
            <BarChart3 className="w-4 h-4" />
            {isZh ? '可行性评估' : 'Feasibility Assessment'}
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            {isZh ? 'AI 市场可行性分析' : 'AI Market Feasibility Analysis'}
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            {isZh 
              ? '基于全球实时数据，智能评估海外市场准入可行性' 
              : 'AI-powered feasibility assessment based on global real-time data'}
          </p>
        </div>

        {/* 筛选栏 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-wrap items-center gap-4">
            {/* 地区筛选 */}
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-gray-400" />
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:border-emerald-500 focus:outline-none bg-white min-w-[140px]"
              >
                {REGIONS.map(region => (
                  <option key={region.value} value={region.value}>
                    {region.flag} {isZh ? region.label : region.labelEn}
                  </option>
                ))}
              </select>
            </div>

            {/* 品类筛选 */}
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-gray-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:border-emerald-500 focus:outline-none bg-white min-w-[140px]"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat.value} value={cat.value}>
                    {isZh ? cat.label : cat.labelEn}
                  </option>
                ))}
              </select>
            </div>

            {/* 重置按钮 */}
            <button
              onClick={handleReset}
              className="ml-auto flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              {isZh ? '重置' : 'Reset'}
            </button>
          </div>
        </div>

        {/* 核心结论 */}
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-xl p-6 mb-8 text-white">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-white/20 rounded-lg shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <div className="text-sm text-white/80 mb-2">
                {isZh ? 'AI 核心结论' : 'AI Conclusion'}
              </div>
              <div className="text-xl font-medium leading-relaxed">
                {isZh ? currentData.conclusion : currentData.conclusionEn}
              </div>
            </div>
          </div>
        </div>

        {/* 可视化图表区 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {/* 热度环形图 */}
          <div 
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 cursor-pointer hover:border-emerald-300 transition-colors"
            onClick={() => setShowDrawer(true)}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-500">{isZh ? '市场热度' : 'Market Heat'}</span>
              <PieChart className="w-4 h-4 text-gray-400" />
            </div>
            <div className="relative w-24 h-24 mx-auto mb-4">
              <svg className="w-24 h-24 transform -rotate-90">
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="8"
                />
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  fill="none"
                  stroke={getHeatColor(currentData.heat)}
                  strokeWidth="8"
                  strokeDasharray={`${(currentData.heat / 100) * 251.2} 251.2`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold" style={{ color: getHeatColor(currentData.heat) }}>
                  {currentData.heat}%
                </span>
              </div>
            </div>
            <div className="text-center text-sm text-gray-500">
              {isZh ? '点击查看详情' : 'Click for details'}
            </div>
          </div>

          {/* 增长趋势 */}
          <div 
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 cursor-pointer hover:border-blue-300 transition-colors"
            onClick={() => setShowDrawer(true)}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-500">{isZh ? '年增长率' : 'Annual Growth'}</span>
              <LineChart className="w-4 h-4 text-gray-400" />
            </div>
            <div className="flex items-center justify-center mb-4">
              {currentData.growth > 0 ? (
                <TrendingUp className="w-12 h-12 text-emerald-500" />
              ) : (
                <TrendingDown className="w-12 h-12 text-red-500" />
              )}
            </div>
            <div className="text-center">
              <span className={`text-3xl font-bold ${currentData.growth > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {currentData.growth > 0 ? '+' : ''}{currentData.growth}%
              </span>
            </div>
            <div className="text-center text-sm text-gray-500 mt-2">
              {isZh ? '点击查看详情' : 'Click for details'}
            </div>
          </div>

          {/* 政策风险 */}
          <div 
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 cursor-pointer hover:border-amber-300 transition-colors"
            onClick={() => setShowDrawer(true)}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-500">{isZh ? '政策风险' : 'Policy Risk'}</span>
              <AlertTriangle className="w-4 h-4 text-gray-400" />
            </div>
            <div className={`p-4 rounded-lg ${riskInfo.bg} text-center mb-4`}>
              <span className={`text-2xl font-bold ${riskInfo.color}`}>
                {isZh ? riskInfo.label : riskInfo.labelEn}
              </span>
            </div>
            <div className="flex justify-center gap-1">
              {['low', 'medium', 'high'].map((level) => (
                <div
                  key={level}
                  className={`w-8 h-2 rounded-full ${
                    level === 'low' ? 'bg-emerald-500' :
                    level === 'medium' ? 'bg-amber-500' : 'bg-red-500'
                  } ${currentData.risk === level ? 'opacity-100' : 'opacity-30'}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* 展开详情 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
          >
            <span className="font-medium text-gray-900">
              {isZh ? '查看完整分析' : 'View Full Analysis'}
            </span>
            {showDetails ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </button>
          
          {showDetails && (
            <div className="px-6 pb-6 border-t border-gray-100 animate-fadeIn">
              <div className="pt-6 space-y-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">
                    {isZh ? '政策要点' : 'Policy Points'}
                  </h4>
                  <p className="text-gray-700">
                    {isZh ? currentData.policyPoints : currentData.policyPointsEn}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">
                    {isZh ? '准入门槛' : 'Threshold'}
                  </h4>
                  <p className="text-gray-700">
                    {isZh ? currentData.threshold : currentData.thresholdEn}
                  </p>
                </div>
                <div className="bg-emerald-50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-emerald-800 mb-2">
                    {isZh ? 'AI 建议' : 'AI Suggestion'}
                  </h4>
                  <p className="text-emerald-700">
                    {isZh ? currentData.suggestion : currentData.suggestionEn}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 数据更新时间 */}
        <div className="text-center mt-6 text-xs text-gray-400">
          {isZh ? '数据更新：2026-03-08 10:00 | 数据源：18+全球跨境数据库' : 'Data updated: 2026-03-08 10:00 | Source: 18+ global databases'}
        </div>
      </div>

      {/* 抽屉详情面板 */}
      {showDrawer && (
        <div className="fixed inset-0 z-50">
          {/* 遮罩 */}
          <div 
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowDrawer(false)}
          />
          
          {/* 抽屉内容 */}
          <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl overflow-y-auto">
            <div className="p-6">
              {/* 标题 */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {regionName?.flag} {isZh ? regionName?.label : regionName?.labelEn}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {isZh ? categoryName?.label : categoryName?.labelEn}
                  </p>
                </div>
                <button
                  onClick={() => setShowDrawer(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              {/* 政策要点 */}
              <div className="mb-6">
                <h4 className="flex items-center gap-2 text-sm font-medium text-gray-500 mb-3">
                  <Info className="w-4 h-4" />
                  {isZh ? '政策要点' : 'Policy Points'}
                </h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700">
                    {isZh ? currentData.policyPoints : currentData.policyPointsEn}
                  </p>
                </div>
              </div>

              {/* 准入门槛 */}
              <div className="mb-6">
                <h4 className="flex items-center gap-2 text-sm font-medium text-gray-500 mb-3">
                  <AlertTriangle className="w-4 h-4" />
                  {isZh ? '准入门槛' : 'Threshold'}
                </h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700">
                    {isZh ? currentData.threshold : currentData.thresholdEn}
                  </p>
                </div>
              </div>

              {/* AI 建议 */}
              <div className="mb-6">
                <h4 className="flex items-center gap-2 text-sm font-medium text-emerald-600 mb-3">
                  <Sparkles className="w-4 h-4" />
                  {isZh ? 'AI 出海建议' : 'AI Suggestion'}
                </h4>
                <div className="bg-emerald-50 p-4 rounded-lg">
                  <p className="text-emerald-800">
                    {isZh ? currentData.suggestion : currentData.suggestionEn}
                  </p>
                </div>
              </div>

              {/* 关闭按钮 */}
              <button
                onClick={() => setShowDrawer(false)}
                className="w-full py-3 border border-gray-200 text-gray-600 rounded-lg font-medium hover:bg-gray-50 transition-colors"
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
