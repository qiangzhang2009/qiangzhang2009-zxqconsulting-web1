/**
 * 地缘政治风险 API
 * 实时监测全球热点地区的政治风险
 */

import { type VercelRequest, type VercelResponse } from '@vercel/node';

interface GeopoliticalRisk {
  id: string;
  region: string;
  regionEn: string;
  status: 'active' | 'watching' | 'stable';
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  trend: 'escalating' | 'stable' | 'de-escalating';
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  impact: string;
  impactEn: string;
  lastUpdate: string;
  relatedMarkets: string[];
}

// 模拟地缘政治风险数据（实际应用中可接入真实数据源）
const GEOPOLITICAL_RISKS: GeopoliticalRisk[] = [
  {
    id: 'middleeast-iran-israel',
    region: '中东',
    regionEn: 'Middle East',
    status: 'active',
    riskLevel: 'critical',
    trend: 'escalating',
    title: '以色列-伊朗冲突升级',
    titleEn: 'Israel-Iran Conflict Escalation',
    description: '以色列对伊朗实施军事打击，伊朗发射导弹报复。中东局势急剧升温，原油供应面临中断风险。',
    descriptionEn: 'Israel conducts military strikes on Iran, Iran launches missile retaliation. Middle East situation intensifies sharply, crude oil supply faces disruption risk.',
    impact: '可能导致原油价格暴涨30-50%，影响全球供应链',
    impactEn: 'Could cause crude oil prices to surge 30-50%, affecting global supply chains',
    lastUpdate: new Date().toISOString(),
    relatedMarkets: ['global', 'middleeast', 'europe']
  },
  {
    id: 'us-tariff-china',
    region: '美国-中国',
    regionEn: 'US-China',
    status: 'active',
    riskLevel: 'high',
    trend: 'escalating',
    title: '中美贸易战升级',
    titleEn: 'US-China Trade War Escalation',
    description: '特朗普政府威胁对中国商品加征60%关税，中美贸易关系持续恶化。',
    descriptionEn: 'Trump administration threatens 60% tariffs on Chinese goods, US-China trade relations continue to deteriorate.',
    impact: '中国出口企业面临重大挑战，供应链需重新布局',
    impactEn: 'Chinese export enterprises face major challenges, supply chains need restructuring',
    lastUpdate: new Date().toISOString(),
    relatedMarkets: ['usa', 'global', 'southeast']
  },
  {
    id: 'us-policy-unpredictability',
    region: '美国',
    regionEn: 'United States',
    status: 'active',
    riskLevel: 'high',
    trend: 'escalating',
    title: '美国政策不可预测性',
    titleEn: 'US Policy Unpredictability',
    description: '特朗普政府政策立场频繁变化，对外贸易政策缺乏连续性，企业难以制定长期规划。',
    descriptionEn: 'Trump administration frequently changes policy positions, foreign trade policies lack continuity, making it difficult for enterprises to develop long-term plans.',
    impact: '企业需建立灵活的应对机制，避免过度依赖单一市场',
    impactEn: 'Enterprises need to establish flexible response mechanisms, avoid over-reliance on single markets',
    lastUpdate: new Date().toISOString(),
    relatedMarkets: ['usa', 'global']
  },
  {
    id: 'europe-energy',
    region: '欧洲',
    regionEn: 'Europe',
    status: 'watching',
    riskLevel: 'medium',
    trend: 'stable',
    title: '欧洲能源安全',
    titleEn: 'European Energy Security',
    description: '欧洲能源供应逐步稳定，但地缘政治风险仍存。',
    descriptionEn: 'European energy supply gradually stabilizes, but geopolitical risks remain.',
    impact: '能源价格波动可能影响生产成本',
    impactEn: 'Energy price fluctuations may affect production costs',
    lastUpdate: new Date().toISOString(),
    relatedMarkets: ['europe']
  },
  {
    id: 'southchina-sea',
    region: '南海',
    regionEn: 'South China Sea',
    status: 'watching',
    riskLevel: 'medium',
    trend: 'stable',
    title: '南海局势',
    titleEn: 'South China Sea Situation',
    description: '南海地区领土争议持续，各方军事活动频繁。',
    descriptionEn: 'Territorial disputes in South China Sea continue, military activities by various parties frequent.',
    impact: '影响海上贸易路线，可能导致运输成本上升',
    impactEn: 'Affects sea trade routes, may lead to increased transportation costs',
    lastUpdate: new Date().toISOString(),
    relatedMarkets: ['southeast', 'global']
  },
  {
    id: 'ukraine-war',
    region: '乌克兰',
    regionEn: 'Ukraine',
    status: 'watching',
    riskLevel: 'high',
    trend: 'stable',
    title: '俄乌冲突持续',
    titleEn: 'Russia-Ukraine Conflict Continues',
    description: '俄乌战争进入第3年，冲突暂无缓和迹象。',
    descriptionEn: 'Russia-Ukraine war enters third year, no signs of conflict easing.',
    impact: '全球粮食和能源市场持续波动',
    impactEn: 'Global food and energy markets continue to fluctuate',
    lastUpdate: new Date().toISOString(),
    relatedMarkets: ['europe', 'global']
  }
];

export default function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  // 设置 CORS 头
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  response.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

  if (request.method === 'OPTIONS') {
    return response.status(200).end();
  }

  if (request.method !== 'GET') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  const { region, level } = request.query;

  let results = GEOPOLITICAL_RISKS;

  // 按地区筛选
  if (region && typeof region === 'string') {
    results = results.filter(r => 
      r.region === region || 
      r.regionEn.toLowerCase() === region.toLowerCase() ||
      r.relatedMarkets.includes(region)
    );
  }

  // 按风险等级筛选
  if (level && typeof level === 'string') {
    results = results.filter(r => r.riskLevel === level);
  }

  // 计算整体风险评分
  const riskScores = {
    critical: 100,
    high: 75,
    medium: 50,
    low: 25
  };

  const overallScore = Math.round(
    results.reduce((sum, r) => sum + riskScores[r.riskLevel], 0) / results.length
  );

  // 统计各类风险数量
  const riskCounts = {
    critical: results.filter(r => r.riskLevel === 'critical').length,
    high: results.filter(r => r.riskLevel === 'high').length,
    medium: results.filter(r => r.riskLevel === 'medium').length,
    low: results.filter(r => r.riskLevel === 'low').length
  };

  return response.status(200).json({
    success: true,
    data: {
      risks: results,
      summary: {
        total: results.length,
        overallScore,
        riskCounts,
        trend: results.filter(r => r.trend === 'escalating').length > 0 ? 'escalating' : 'stable'
      },
      lastUpdate: new Date().toISOString()
    }
  });
}
