/**
 * 社交媒体情报 API
 * 追踪关键影响者的言论和潜在市场影响
 */

type VercelRequest = {
  method?: string;
  query: Record<string, string | string[] | undefined>;
};

type VercelResponse = {
  setHeader: (name: string, value: string) => void;
  status: (code: number) => {
    json: (body: unknown) => void;
    end: () => void;
  };
};

interface SocialMediaPost {
  id: string;
  author: {
    name: string;
    username: string;
    avatar: string;
    role: string;
    roleEn: string;
    influence: number; // 1-100
    category: 'politics' | 'business' | 'tech' | 'finance';
  };
  content: string;
  contentEn: string;
  timestamp: string;
  engagement: {
    likes: number;
    retweets: number;
    replies: number;
    views: number;
  };
  sentiment: 'positive' | 'negative' | 'neutral';
  impact: 'high' | 'medium' | 'low' | 'critical';
  relatedTopics: string[];
  marketImpact: {
    affected: string[];
    description: string;
    descriptionEn: string;
  };
}

// 模拟社交媒体情报数据
const SOCIAL_INTELLIGENCE: SocialMediaPost[] = [
  {
    id: '1',
    author: {
      name: 'Donald Trump',
      username: '@realDonaldTrump',
      avatar: '',
      role: '美国前总统',
      roleEn: 'Former US President',
      influence: 100,
      category: 'politics'
    },
    content: '中国必须为他们的行为付出代价！我们将对中国商品征收前所未有的关税。这对美国工人来说是伟大的日子！',
    contentEn: 'China must pay for what they have done! We will impose unprecedented tariffs on Chinese goods. This is a great day for American workers!',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    engagement: {
      likes: 125000,
      retweets: 45000,
      replies: 23000,
      views: 8500000
    },
    sentiment: 'negative',
    impact: 'high',
    relatedTopics: ['关税', '中美贸易', '中国商品'],
    marketImpact: {
      affected: ['usa', 'china', 'global'],
      description: '可能导致中美贸易战升级，影响出口型企业',
      descriptionEn: 'Could lead to escalated US-China trade war, affecting export-oriented enterprises'
    }
  },
  {
    id: '2',
    author: {
      name: 'Elon Musk',
      username: '@elonmusk',
      avatar: '',
      role: '企业家/Tesla CEO',
      roleEn: 'Entrepreneur/Tesla CEO',
      influence: 100,
      category: 'tech'
    },
    content: '全球经济形势严峻，我们需要为困难时期做好准备。Tesla将调整产能以适应需求变化。',
    contentEn: 'The global economic situation is severe, we need to prepare for difficult times. Tesla will adjust capacity to adapt to demand changes.',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    engagement: {
      likes: 89000,
      retweets: 12000,
      replies: 5600,
      views: 5200000
    },
    sentiment: 'negative',
    impact: 'high',
    relatedTopics: ['经济', '特斯拉', '电动汽车'],
    marketImpact: {
      affected: ['usa', 'global', 'automotive'],
      description: '可能引发对全球经济衰退的担忧，电动汽车行业承压',
      descriptionEn: 'May trigger concerns about global economic recession, EV industry under pressure'
    }
  },
  {
    id: '3',
    author: {
      name: 'Howard Lutnick',
      username: '@howardlutnick',
      avatar: '',
      role: '商务部长',
      roleEn: 'Commerce Secretary',
      influence: 85,
      category: 'politics'
    },
    content: '关税是保护美国工人的必要工具。我们正在制定历史上最激进的贸易政策。',
    contentEn: 'Tariffs are a necessary tool to protect American workers. We are developing the most aggressive trade policy in history.',
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    engagement: {
      likes: 34000,
      retweets: 8900,
      replies: 4200,
      views: 2100000
    },
    sentiment: 'neutral',
    impact: 'high',
    relatedTopics: ['关税', '贸易政策', '商务部长'],
    marketImpact: {
      affected: ['usa', 'china', 'global'],
      description: '确认关税政策方向，全球贸易格局可能重塑',
      descriptionEn: 'Confirms tariff policy direction, global trade landscape may reshape'
    }
  },
  {
    id: '4',
    author: {
      name: '路透社 Breaking',
      username: '@Reuters',
      avatar: '',
      role: '国际媒体',
      roleEn: 'International Media',
      influence: 95,
      category: 'finance'
    },
    content: '独家：以色列正在准备对伊朗发动大规模军事行动，目标是伊朗核设施。国际油价应声上涨超过5%。',
    contentEn: 'EXCLUSIVE: Israel preparing large-scale military operation against Iran, targeting nuclear facilities. International oil prices surge over 5%.',
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    engagement: {
      likes: 15000,
      retweets: 28000,
      replies: 3400,
      views: 12000000
    },
    sentiment: 'negative',
    impact: 'critical',
    relatedTopics: ['中东', '以色列', '伊朗', '石油'],
    marketImpact: {
      affected: ['middleeast', 'global', 'energy'],
      description: '中东局势急剧升温，原油价格暴涨，能源供应链面临风险',
      descriptionEn: 'Middle East situation intensifies sharply, crude oil prices surge, energy supply chain at risk'
    }
  },
  {
    id: '5',
    author: {
      name: '华尔街日报',
      username: '@WSJ',
      avatar: '',
      role: '国际媒体',
      roleEn: 'International Media',
      influence: 90,
      category: 'finance'
    },
    content: '分析：特朗普政府的贸易政策不确定性使全球供应链管理成为企业最大挑战之一。',
    contentEn: 'Analysis: Trump administration trade policy uncertainty makes supply chain management one of the biggest challenges for enterprises.',
    timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    engagement: {
      likes: 8900,
      retweets: 3400,
      replies: 1200,
      views: 1800000
    },
    sentiment: 'negative',
    impact: 'medium',
    relatedTopics: ['贸易政策', '供应链', '特朗普'],
    marketImpact: {
      affected: ['usa', 'global', 'supply-chain'],
      description: '企业需要重新评估供应链策略，降低政策风险',
      descriptionEn: 'Enterprises need to reassess supply chain strategies, reduce policy risks'
    }
  },
  {
    id: '6',
    author: {
      name: 'Peter Schiff',
      username: '@PeterSchiff',
      avatar: '',
      role: '经济学家',
      roleEn: 'Economist',
      influence: 75,
      category: 'finance',
    },
    content: '美联储不会拯救市场。通胀仍然高企，利率将维持在高位。黄金是唯一的避风港。',
    contentEn: "The Fed won't save the market. Inflation remains high, interest rates will stay elevated. Gold is the only safe haven.",
    timestamp: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
    engagement: {
      likes: 12000,
      retweets: 4500,
      replies: 2800,
      views: 950000
    },
    sentiment: 'negative',
    impact: 'medium',
    relatedTopics: ['美联储', '通胀', '黄金', '利率'],
    marketImpact: {
      affected: ['usa', 'global', 'financial'],
      description: '可能导致避险情绪升温，黄金需求上升',
      descriptionEn: 'May trigger risk aversion sentiment, gold demand rising'
    }
  },
  {
    id: '7',
    author: {
      name: 'Bloomberg',
      username: '@business',
      avatar: '',
      role: '国际媒体',
      roleEn: 'International Media',
      influence: 95,
      category: 'finance'
    },
    content: '独家消息：特朗普团队正在考虑对中国商品征收高达60%的关税，最快可能在下月实施。',
    contentEn: 'EXCLUSIVE: Trump team considering up to 60% tariffs on Chinese goods, could be implemented as early as next month.',
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    engagement: {
      likes: 22000,
      retweets: 18000,
      replies: 5600,
      views: 9500000
    },
    sentiment: 'negative',
    impact: 'critical',
    relatedTopics: ['关税', '中美', '贸易战'],
    marketImpact: {
      affected: ['usa', 'china', 'global'],
      description: '极端关税政策可能引发全球贸易战，企业需提前布局',
      descriptionEn: 'Extreme tariff policies may trigger global trade war, enterprises need advance planning'
    }
  }
];

export default function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  response.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

  if (request.method === 'OPTIONS') {
    return response.status(200).end();
  }

  if (request.method !== 'GET') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  const { category, impact, sentiment } = request.query;

  let results = SOCIAL_INTELLIGENCE;

  // 按类别筛选
  if (category && typeof category === 'string') {
    results = results.filter(post => post.author.category === category);
  }

  // 按影响程度筛选
  if (impact && typeof impact === 'string') {
    results = results.filter(post => post.impact === impact);
  }

  // 按情感筛选
  if (sentiment && typeof sentiment === 'string') {
    results = results.filter(post => post.sentiment === sentiment);
  }

  // 按时间排序
  results.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  // 计算影响力评分
  const avgInfluence = Math.round(
    results.reduce((sum, p) => sum + p.author.influence, 0) / results.length
  );

  // 统计情感分布
  const sentimentCounts = {
    positive: results.filter(p => p.sentiment === 'positive').length,
    negative: results.filter(p => p.sentiment === 'negative').length,
    neutral: results.filter(p => p.sentiment === 'neutral').length
  };

  // 计算整体风险评分（基于负面情感和高影响力帖子）
  const riskScore = Math.round(
    50 + 
    (sentimentCounts.negative / results.length) * 30 +
    (results.filter(p => p.impact === 'critical' || p.impact === 'high').length / results.length) * 20
  );

  return response.status(200).json({
    success: true,
    data: {
      posts: results,
      summary: {
        total: results.length,
        avgInfluence,
        riskScore: Math.min(100, riskScore),
        sentimentCounts,
        criticalPosts: results.filter(p => p.impact === 'critical').length,
        highImpactPosts: results.filter(p => p.impact === 'high').length
      },
      lastUpdate: new Date().toISOString()
    }
  });
}
