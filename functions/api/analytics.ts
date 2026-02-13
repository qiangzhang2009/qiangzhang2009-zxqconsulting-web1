/**
 * Cloudflare Analytics API 端点
 * 使用 GraphQL API 获取真实的网站访问统计
 */

export async function onRequestGet(context) {
  const { env } = context;
  
  // 调试信息
  const debugInfo = {
    hasToken: !!env.CF_API_TOKEN,
    hasZoneId: !!env.CF_ZONE_ID,
    zoneIdValue: env.CF_ZONE_ID ? env.CF_ZONE_ID.substring(0, 8) + '...' : 'not set'
  };

  // 如果没有配置 API Token，返回模拟数据
  if (!env.CF_API_TOKEN || !env.CF_ZONE_ID) {
    return new Response(JSON.stringify({
      ...debugInfo,
      isMockData: true,
      message: "Using mock data. Configure CF_API_TOKEN and CF_ZONE_ID in Cloudflare Pages for real data.",
      totals: { pageViews: 12847, uniqueVisitors: 4823, requests: 35621 },
      countryMap: [
        { country: "CN", pageViews: 5234, uniqueVisitors: 2102 },
        { country: "US", pageViews: 2847, uniqueVisitors: 923 },
        { country: "AU", pageViews: 1523, uniqueVisitors: 487 },
        { country: "JP", pageViews: 982, uniqueVisitors: 324 },
        { country: "GB", pageViews: 756, uniqueVisitors: 289 },
        { country: "DE", pageViews: 505, uniqueVisitors: 198 }
      ]
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' }
    });
  }

  try {
    // 使用 httpRequests1dGroups 获取日数据
    const graphqlQuery = {
      query: `
        query GetZoneAnalytics($zoneId: string!, $since: DateTime!, $until: DateTime!) {
          viewer {
            zones(filter: { zoneTag: $zoneId }) {
              httpRequests1dGroups(limit: 30, orderBy: [date_ASC], filter: {
                date_geq: $since,
                date_leq: $until
              }) {
                sum {
                  pageViews
                  requests
                  countryMap {
                    requests
                    bytes
                    threats
                    clientCountryName
                  }
                }
                uniq {
                  uniques
                }
                dimensions {
                  date
                }
              }
            }
          }
        }
      `,
      variables: {
        zoneId: env.CF_ZONE_ID,
        since: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        until: new Date().toISOString().split('T')[0]
      }
    };

    const response = await fetch('https://api.cloudflare.com/client/v4/graphql', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.CF_API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(graphqlQuery)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API error ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    
    // 检查 GraphQL 响应
    if (data.errors) {
      throw new Error(`GraphQL error: ${JSON.stringify(data.errors)}`);
    }

    const zoneData = data.data?.viewer?.zones?.[0];
    
    if (!zoneData) {
      throw new Error('No data returned from GraphQL API');
    }

    // 解析日请求数据 - 获取总访问量和国家分布
    const dailyGroups = zoneData.httpRequests1dGroups || [];
    let totalPageViews = 0;
    let totalUniques = 0;
    let totalRequests = 0;
    
    // 汇总国家数据
    const countryMap: Record<string, { requests: number; bytes: number }> = {};

    dailyGroups.forEach(group => {
      totalPageViews += group.sum?.pageViews || 0;
      totalUniques += group.uniq?.uniques || 0;
      totalRequests += group.sum?.requests || 0;
      
      // 解析 countryMap (注意：只有 requests, bytes, threats, clientCountryName)
      const countryList = group.sum?.countryMap || [];
      countryList.forEach((c: { clientCountryName: string; requests: number; bytes: number }) => {
        const country = c.clientCountryName || 'Unknown';
        if (!countryMap[country]) {
          countryMap[country] = { requests: 0, bytes: 0 };
        }
        countryMap[country].requests += c.requests || 0;
        countryMap[country].bytes += c.bytes || 0;
      });
    });

    // 转换为数组并排序 (使用 requests 作为排序依据)
    const countryArray = Object.entries(countryMap)
      .map(([country, stats]) => ({
        country,
        pageViews: stats.requests, // 使用 requests 作为 pageViews 近似值
        uniqueVisitors: Math.round(stats.requests * 0.6) // 估算 uniqueVisitors
      }))
      .sort((a, b) => b.pageViews - a.pageViews)
      .slice(0, 10);

    const finalResult = {
      ...debugInfo,
      isRealData: true,
      totals: {
        pageViews: totalPageViews,
        uniqueVisitors: totalUniques,
        requests: totalRequests
      },
      countryMap: countryArray
    };

    return new Response(JSON.stringify(finalResult), {
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=300' }
    });

  } catch (error) {
    console.error('Analytics API error:', error);
    return new Response(JSON.stringify({
      ...debugInfo,
      error: error.message,
      message: "Failed to fetch Cloudflare Analytics. Check API token permissions.",
      totals: { pageViews: 0, uniqueVisitors: 0, requests: 0 },
      countryMap: []
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' }
    });
  }
}
