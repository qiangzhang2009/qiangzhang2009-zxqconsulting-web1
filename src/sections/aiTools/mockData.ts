/**
 * AI 工具 Mock 数据生成器
 *
 * 拆分自原 aiToolsMarketContext.tsx。
 *
 * 用途：当 DeepSeek API 不可用（网络错误、配额耗尽、key 失效等）时，
 *      生成可演示的样例数据，保证 UI 不会因 API 失败而崩溃。
 *
 * 标记：所有 mock 数据都会带 _mock: true 字段，
 *       调用方应在 UI 上向用户明示"当前为示例数据"。
 */

import type { AIToolType, AIToolData, TargetMarket, AIDataMap } from './types';
import { ALL_TOOLS } from './types';
import { getMarketEnName, getCategoryEnName } from './names';

// 每个工具的 mock 数据生成器
type MockGenerator = (mName: string, marketEn: string, cName: string, categoryEn: string) => AIToolData;

const MOCK_GENERATORS: Record<AIToolType, MockGenerator> = {
  feasibility: (mName, marketEn, cName, categoryEn) => ({
    heat: 75,
    growth: 22,
    risk: 'medium',
    competition: 55,
    recommendation: `${mName}市场对${cName}产品有较好潜力，建议优先布局`,
    recommendationEn: `${marketEn} market has good potential for ${categoryEn} products, recommended for priority entry`,
    conclusion: `${mName}是本草产品出海的优质目标市场，政策支持力度大，消费者接受度高。`,
    conclusionEn: `${marketEn} is an excellent target market for herbal products with strong policy support and high consumer acceptance.`,
    policyPoints: ['进口资质认证', '产品本地化要求', '税收优惠政策'],
    policyPointsEn: ['Import qualification', 'Product localization', 'Tax incentives'],
    threshold: '需完成当地食品/药品监管部门注册',
    thresholdEn: 'Registration with local food/drug authority required',
    logistics: '建议通过跨境电商试点，再逐步建立本地仓',
    logisticsEn: 'Start with cross-border e-commerce pilot, then establish local warehouse',
    caseStudies: '某中药品牌通过3年布局在新加坡建立了稳定的分销网络',
    caseStudiesEn: 'A TCM brand established a stable distribution network in Singapore over 3 years',
  }),
  cost: () => ({
    items: [
      { name: '产品注册/认证', nameEn: 'Registration/Certification', min: 30000, max: 80000, description: '目标市场注册费用', descriptionEn: 'Target market registration fee' },
      { name: '本地化包装', nameEn: 'Local Packaging', min: 15000, max: 40000, description: '标签翻译和包装调整', descriptionEn: 'Label translation and packaging adjustment' },
      { name: '物流仓储', nameEn: 'Logistics & Storage', min: 20000, max: 60000, description: '跨境运输和本地仓储', descriptionEn: 'Cross-border transport and local storage' },
      { name: '市场营销', nameEn: 'Marketing', min: 50000, max: 200000, description: '本地化推广和渠道建设', descriptionEn: 'Local promotion and channel building' },
      { name: '法律合规', nameEn: 'Legal Compliance', min: 10000, max: 30000, description: '法律咨询和合同审核', descriptionEn: 'Legal consultation and contract review' },
    ],
    timeline: {
      months: 18,
      phases: ['准备期(3月)', '注册期(6月)', '试运营(3月)', '正式运营(6月)'],
      phasesEn: ['Preparation(3mo)', 'Registration(6mo)', 'Pilot(3mo)', 'Full Operations(6mo)'],
    },
    roi: { expected: 35, payback: '18个月', paybackEn: '18 months' },
  }),
  compliance: () => ({
    status: 'partial',
    score: 72,
    requirements: ['产品成分安全报告', '原产地证明', 'GMP认证', '标签合规审核'],
    requirementsEn: ['Product safety report', 'Certificate of origin', 'GMP certification', 'Label compliance review'],
    documents: ['FDA注册确认函', '成分分析报告', '质量检测证书'],
    documentsEn: ['FDA registration confirmation', 'Ingredient analysis report', 'Quality inspection certificate'],
    timeline: '预计6-12个月完成全部合规流程',
    timelineEn: 'Estimated 6-12 months to complete full compliance',
    warnings: ['部分成分可能需要额外审批', '跨境电商渠道规则可能有调整'],
    warningsEn: ['Some ingredients may require additional approval', 'Cross-border e-commerce rules may change'],
    tips: ['建议提前与当地代理沟通注册流程', '保留所有文件的英文版本'],
    tipsEn: ['Communicate with local agent about registration process in advance', 'Keep English versions of all documents'],
  }),
  insight: (mName, marketEn) => ({
    marketSize: '约25亿美元',
    growth: 18,
    ageGroups: [
      { range: '25-35岁', rangeEn: '25-35', percentage: 35 },
      { range: '35-45岁', rangeEn: '35-45', percentage: 40 },
      { range: '45-55岁', rangeEn: '45-55', percentage: 25 },
    ],
    channels: [
      { name: '线上电商平台', nameEn: 'Online E-commerce', percentage: 45 },
      { name: '线下零售药店', nameEn: 'Offline Pharmacies', percentage: 35 },
      { name: '直销/分销商', nameEn: 'Direct/Distributors', percentage: 20 },
    ],
    competitors: [
      { name: '本地头部品牌A', nameEn: 'Local Brand A', share: 25 },
      { name: '国际品牌B', nameEn: 'International Brand B', share: 20 },
      { name: '新兴品牌C', nameEn: 'Emerging Brand C', share: 15 },
    ],
    trends: ['天然有机概念增长', '便携式包装受欢迎', '数字化健康管理'],
    trendsEn: ['Natural organic concept growth', 'Portable packaging popular', 'Digital health management'],
    consumerInsights: `${mName}消费者对健康产品接受度高，愿意为品质付溢价，但对成分透明度和品牌故事有较高要求。`,
    consumerInsightsEn: `${marketEn} consumers are highly accepting of health products and willing to pay premiums for quality, but have high requirements for ingredient transparency and brand storytelling.`,
  }),
  channel: () => ({
    channels: [
      {
        name: '跨境电商平台',
        nameEn: 'Cross-border E-commerce',
        type: 'online',
        rating: 88,
        investment: { min: 50000, max: 150000 },
        pros: ['启动成本低', '覆盖广', '数据反馈快'],
        prosEn: ['Low startup cost', 'Wide coverage', 'Fast data feedback'],
        cons: ['竞争激烈', '品牌认知建立慢'],
        consEn: ['High competition', 'Slow brand awareness building'],
        description: '通过亚马逊、天猫国际等平台直接触达消费者',
        descriptionEn: 'Direct consumer access through Amazon, Tmall Global, etc.',
      },
      {
        name: '本地药店/健康店',
        nameEn: 'Local Pharmacy/Health Store',
        type: 'offline',
        rating: 75,
        investment: { min: 80000, max: 250000 },
        pros: ['信任度高', '客户粘性强', '溢价空间大'],
        prosEn: ['High trust', 'Strong customer loyalty', 'Better margins'],
        cons: ['进入门槛高', '本地化要求严'],
        consEn: ['High entry barriers', 'Strict localization requirements'],
        description: '与当地药店连锁合作，建立品牌专柜',
        descriptionEn: 'Partner with local pharmacy chains to establish brand counters',
      },
      {
        name: 'B2B分销商',
        nameEn: 'B2B Distributor',
        type: 'b2b',
        rating: 70,
        investment: { min: 30000, max: 100000 },
        pros: ['快速铺开', '降低运营压力'],
        prosEn: ['Fast market expansion', 'Reduced operational pressure'],
        cons: ['利润分成', '渠道管控弱'],
        consEn: ['Profit sharing', 'Weak channel control'],
        description: '寻找当地有医药背景的分销商合作',
        descriptionEn: 'Partner with distributors with pharmaceutical background',
      },
    ],
    recommendation: '建议采用"电商+药店"双轨策略，先通过跨境电商建立品牌认知，再逐步进入线下渠道',
    recommendationEn: 'Recommend "E-commerce + Pharmacy" dual-track strategy, build brand awareness via cross-border e-commerce first, then gradually enter offline channels',
  }),
  risk: () => ({
    level: 'medium',
    score: 42,
    factors: [
      {
        name: '政策监管风险',
        nameEn: 'Policy & Regulatory Risk',
        impact: 'negative',
        description: '目标市场监管政策可能收紧，需要持续关注',
        descriptionEn: 'Target market regulations may tighten, requiring ongoing monitoring',
      },
      {
        name: '市场竞争风险',
        nameEn: 'Market Competition Risk',
        impact: 'negative',
        description: '本地和国际品牌竞争激烈，需要差异化定位',
        descriptionEn: 'Intense competition from local and international brands requires differentiated positioning',
      },
      {
        name: '汇率波动风险',
        nameEn: 'Exchange Rate Risk',
        impact: 'negative',
        description: '跨境结算涉及汇率波动，建议锁定汇率',
        descriptionEn: 'Cross-border settlements involve exchange rate fluctuations, hedging recommended',
      },
    ],
    warnings: ['关注目标市场监管动态', '建立本地合规团队', '准备应急预案'],
    warningsEn: ['Monitor target market regulatory updates', 'Build local compliance team', 'Prepare contingency plans'],
    mitigations: ['与当地专业机构合作', '购买汇率保险', '建立多元化市场布局'],
    mitigationsEn: ['Partner with local professional institutions', 'Purchase exchange rate insurance', 'Diversify market presence'],
    trend: 'stable',
  }),
};

/**
 * 生成单个工具的 mock 数据。
 * 带有 _mock: true 标记，UI 应展示"示例数据"提示。
 */
export function generateMockData(
  toolType: AIToolType,
  market: TargetMarket,
  category: string,
  reason: string = 'API 不可用，使用示例数据'
): AIToolData {
  const mName = market.name;
  const marketEn = getMarketEnName(market.id);
  const cName = category;
  const categoryEn = getCategoryEnName(category);

  const generator = MOCK_GENERATORS[toolType];
  const payload = generator(mName, marketEn, cName, categoryEn);

  return {
    _mock: true,
    _mockReason: reason,
    market: mName,
    marketEn,
    category: cName,
    categoryEn,
    ...payload,
  };
}

/**
 * 一键生成 6 模块 mock 数据（API 完全失败时的兜底）。
 */
export function generateAllMockData(
  market: TargetMarket,
  category: string,
  reason: string = 'AI 服务暂时不可用'
): AIDataMap {
  const result: AIDataMap = {};
  for (const tool of ALL_TOOLS) {
    result[tool] = generateMockData(tool, market, category, reason);
  }
  return result;
}
