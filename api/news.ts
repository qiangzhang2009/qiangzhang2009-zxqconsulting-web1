/**
 * 全球新闻情报 API
 * 聚合多个 RSS 源，实时获取地缘政治、贸易、商业新闻
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

// 新闻 RSS 源配置
const NEWS_SOURCES = [
  {
    id: 'reuters-world',
    name: 'Reuters World',
    url: 'https://www.reutersagency.com/feed/?best-regions=europe-asia-pacific&post_type=best',
    category: 'world',
  },
  {
    id: 'bloomberg-markets',
    name: 'Bloomberg Markets',
    url: 'https://feeds.bloomberg.com/markets/news.rss',
    category: 'finance',
  },
  {
    id: 'wsj-world',
    name: 'WSJ World',
    url: 'https://feeds.a.dj.com/rss/RSSMarketsMain.xml',
    category: 'world',
  },
  {
    id: 'cnbc',
    name: 'CNBC',
    url: 'https://www.cnbc.com/id/100003114/device/rss/rss.html',
    category: 'finance',
  },
  {
    id: 'ft',
    name: 'Financial Times',
    url: 'https://www.ft.com/rss/home',
    category: 'finance',
  },
];

interface NewsItem {
  id: string;
  title: string;
  description: string;
  link: string;
  pubDate: string;
  source: string;
  category: string;
  sentiment?: 'positive' | 'negative' | 'neutral';
  keywords?: string[];
}

// 简单的关键词情感分析
function analyzeSentiment(title: string, description: string): 'positive' | 'negative' | 'neutral' {
  const text = (title + ' ' + description).toLowerCase();
  
  const negativeKeywords = ['crisis', 'war', 'conflict', 'sanction', 'tariff', 'trade war', 'recession', 
    'inflation', 'stock market', 'crash', 'decline', 'fall', 'drop', 'risk', 'warning', 'threat',
    'tension', 'escalate', 'breakthrough', 'attack', 'military', 'death', 'fear', 'concern'];
  
  const positiveKeywords = ['growth', 'rise', 'gain', 'surge', 'boom', 'success', 'deal', 'agreement',
    'optimism', 'rally', 'recovery', 'positive', 'increase', 'improve', 'innovation', 'breakthrough'];
  
  let negativeScore = 0;
  let positiveScore = 0;
  
  negativeKeywords.forEach(kw => {
    if (text.includes(kw)) negativeScore++;
  });
  
  positiveKeywords.forEach(kw => {
    if (text.includes(kw)) positiveScore++;
  });
  
  if (negativeScore > positiveScore + 1) return 'negative';
  if (positiveScore > negativeScore + 1) return 'positive';
  return 'neutral';
}

// 提取关键词
function extractKeywords(title: string, description: string): string[] {
  const text = (title + ' ' + description).toLowerCase();
  const keywords: string[] = [];
  
  const importantTerms = [
    'trump', 'china', 'us', 'usa', 'america', 'europe', 'middle east', 'iran', 'israel',
    'tariff', 'trade', 'economy', 'market', 'stock', 'oil', 'energy', 'gold',
    'fed', 'federal reserve', 'inflation', 'gdp', 'recession', 'growth',
    'russia', 'ukraine', 'war', 'military', 'nato',
    'musk', 'technology', 'tech', 'ai', 'bitcoin',
    'brexit', 'european union', 'euro',
  ];
  
  importantTerms.forEach(term => {
    if (text.includes(term)) {
      keywords.push(term);
    }
  });
  
  return keywords.slice(0, 5);
}

// 解析 RSS XML
async function fetchRSSFeed(source: typeof NEWS_SOURCES[0]): Promise<NewsItem[]> {
  try {
    const response = await fetch(source.url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/rss+xml, application/xml, text/xml',
      },
    });

    if (!response.ok) {
      console.error(`Failed to fetch ${source.name}: ${response.status}`);
      return [];
    }

    const xmlText = await response.text();
    
    // 简单的 XML 解析
    const items: NewsItem[] = [];
    const itemRegex = /<item[^>]*>([\s\S]*?)<\/item>/gi;
    let match;
    let count = 0;
    
    while ((match = itemRegex.exec(xmlText)) !== null && count < 5) {
      const itemXml = match[1];
      
      const titleMatch = itemXml.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>|<title>(.*?)<\/title>/i);
      const descMatch = itemXml.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>|<description>(.*?)<\/description>/i);
      const linkMatch = itemXml.match(/<link>(.*?)<\/link>/i);
      const dateMatch = itemXml.match(/<pubDate>(.*?)<\/pubDate>/i);
      
      if (titleMatch) {
        const title = titleMatch[1] || titleMatch[2] || '';
        const description = descMatch ? (descMatch[1] || descMatch[2] || '').substring(0, 300) : '';
        const link = linkMatch ? linkMatch[1] : '';
        const pubDate = dateMatch ? dateMatch[1] : new Date().toISOString();
        
        if (title && title.length > 5) {
          items.push({
            id: `${source.id}-${count}`,
            title: title.trim(),
            description: description.replace(/<[^>]*>/g, '').trim(),
            link,
            pubDate,
            source: source.name,
            category: source.category,
            sentiment: analyzeSentiment(title, description),
            keywords: extractKeywords(title, description),
          });
          count++;
        }
      }
    }
    
    return items;
  } catch (error) {
    console.error(`Error fetching ${source.name}:`, error);
    return [];
  }
}

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  response.setHeader('Cache-Control', 'public, max-age=600'); // 缓存 10 分钟

  if (request.method === 'OPTIONS') {
    return response.status(200).end();
  }

  if (request.method !== 'GET') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // 获取筛选参数
    const category = request.query.category as string | undefined;
    
    // 筛选来源
    const sourcesToFetch = category 
      ? NEWS_SOURCES.filter(s => s.category === category)
      : NEWS_SOURCES;

    // 并行获取所有新闻源
    const newsPromises = sourcesToFetch.map(source => fetchRSSFeed(source));
    const allNewsResults = await Promise.all(newsPromises);
    
    // 合并所有新闻
    let allNews: NewsItem[] = [];
    allNewsResults.forEach(items => {
      allNews = allNews.concat(items);
    });

    // 按日期排序，最新的在前
    allNews.sort((a, b) => 
      new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
    );

    // 限制返回数量
    const maxItems = 20;
    allNews = allNews.slice(0, maxItems);

    // 计算统计信息
    const sentimentCounts = {
      positive: allNews.filter(n => n.sentiment === 'positive').length,
      negative: allNews.filter(n => n.sentiment === 'negative').length,
      neutral: allNews.filter(n => n.sentiment === 'neutral').length,
    };

    // 风险评估
    const riskScore = Math.round(
      50 + 
      (sentimentCounts.negative / Math.max(allNews.length, 1)) * 30 +
      (sentimentCounts.positive / Math.max(allNews.length, 1)) * (-10)
    );

    return response.status(200).json({
      success: true,
      source: 'RSS Aggregation',
      timestamp: new Date().toISOString(),
      data: {
        news: allNews,
        summary: {
          total: allNews.length,
          sentimentCounts,
          riskScore: Math.max(0, Math.min(100, riskScore)),
        },
      },
    });
  } catch (error) {
    console.error('News API error:', error);
    return response.status(500).json({
      success: false,
      error: 'Failed to fetch news',
    });
  }
}
