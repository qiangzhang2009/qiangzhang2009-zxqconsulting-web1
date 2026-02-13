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
        { country: "CN", visitors: 2102, percentage: 43.6 },
        { country: "US", visitors: 923, percentage: 19.1 },
        { country: "AU", visitors: 487, percentage: 10.1 },
        { country: "JP", visitors: 324, percentage: 6.7 },
        { country: "GB", visitors: 289, percentage: 6.0 },
        { country: "DE", visitors: 198, percentage: 4.1 }
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
              httpRequests1dGroups(limit: 364, orderBy: [date_ASC], filter: {
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
        // Cloudflare API 限制：时间范围不能超过 31539600 秒（约 364 天）
        since: new Date(Date.now() - 364 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
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

    // 解析日请求数据
    const dailyGroups = zoneData.httpRequests1dGroups || [];
    
    // 计算总数据 - 汇总所有天的数据
    let totalPageViews = 0;
    let totalUniques = 0;
    let totalRequests = 0;
    
    // 汇总国家数据 - 使用 pageViews（页面浏览量）而不是 requests（请求数）
    const countryMap: Record<string, { requests: number; pageViews: number; uniques: number }> = {};
    
    dailyGroups.forEach((day: any) => {
      totalPageViews += day?.sum?.pageViews || 0;
      totalRequests += day?.sum?.requests || 0;
      // 累加每天的独立访客数（注意：这不是完美的累计方式，但更接近真实）
      totalUniques += day?.uniq?.uniques || 0;
      
      if (day?.sum?.countryMap) {
        const countryList = day.sum.countryMap;
        countryList.forEach((c: { clientCountryName: string; requests: number; pageViews?: number; uniques?: number }) => {
          const country = c.clientCountryName || 'Unknown';
          if (!countryMap[country]) {
            countryMap[country] = { requests: 0, pageViews: 0, uniques: 0 };
          }
          countryMap[country].requests += c.requests || 0;
          countryMap[country].pageViews += c.pageViews || 0;
          countryMap[country].uniques += c.uniques || 0;
        });
      }
    });

    // 转换为数组并排序 - 使用 uniques（独立访客数）
    const countryArray = Object.entries(countryMap)
      .map(([country, stats]) => ({
        country,
        visitors: stats.uniques || stats.pageViews, // 优先使用独立访客数，如果没有则使用页面浏览量
        percentage: totalPageViews > 0 ? Math.round((stats.pageViews / totalPageViews) * 100 * 10) / 10 : 0
      }))
      .sort((a, b) => b.visitors - a.visitors)
      .slice(0, 15);

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
