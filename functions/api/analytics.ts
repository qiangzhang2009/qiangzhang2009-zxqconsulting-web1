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
    // 先获取总访问量（日数据）
    const dailyQuery = {
      query: `
        query GetDailyAnalytics($zoneId: string!, $since: DateTime!, $until: DateTime!) {
          viewer {
            zones(filter: { zoneTag: $zoneId }) {
              httpRequests1dGroups(limit: 30, orderBy: [date_ASC], filter: {
                date_geq: $since,
                date_leq: $until
              }) {
                sum {
                  pageViews
                  requests
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

    // 获取国家分布（小时数据）
    const countryQuery = {
      query: `
        query GetCountryAnalytics($zoneId: string!, $since: DateTime!, $until: DateTime!) {
          viewer {
            zones(filter: { zoneTag: $zoneId }) {
              httpRequests1hGroups(limit: 1000, filter: {
                datetime_geq: $since,
                datetime_leq: $until
              }) {
                sum {
                  pageViews
                  requests
                }
                uniq {
                  uniques
                }
                dimensions {
                  country
                }
              }
            }
          }
        }
      `,
      variables: {
        zoneId: env.CF_ZONE_ID,
        since: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        until: new Date().toISOString()
      }
    };

    // 发送两个请求
    const [dailyResponse, countryResponse] = await Promise.all([
      fetch('https://api.cloudflare.com/client/v4/graphql', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.CF_API_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dailyQuery)
      }),
      fetch('https://api.cloudflare.com/client/v4/graphql', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.CF_API_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(countryQuery)
      })
    ]);

    if (!dailyResponse.ok || !countryResponse.ok) {
      throw new Error(`API error: ${dailyResponse.status} or ${countryResponse.status}`);
    }

    const dailyData = await dailyResponse.json();
    const countryData = await countryResponse.json();
    
    // 检查 GraphQL 响应
    if (dailyData.errors || countryData.errors) {
      const errors = dailyData.errors || countryData.errors;
      throw new Error(`GraphQL error: ${JSON.stringify(errors)}`);
    }

    const dailyZone = dailyData.data?.viewer?.zones?.[0];
    const countryZone = countryData.data?.viewer?.zones?.[0];
    
    if (!dailyZone) {
      throw new Error('No daily data returned from GraphQL API');
    }

    // 解析日请求数据 - 获取总访问量
    const dailyGroups = dailyZone.httpRequests1dGroups || [];
    let totalPageViews = 0;
    let totalUniques = 0;
    let totalRequests = 0;

    dailyGroups.forEach(group => {
      totalPageViews += group.sum?.pageViews || 0;
      totalUniques += group.uniq?.uniques || 0;
      totalRequests += group.sum?.requests || 0;
    });

    // 解析国家数据
    const hourlyGroups = countryZone?.httpRequests1hGroups || [];
    const countryMap: Record<string, { pageViews: number; uniqueVisitors: number }> = {};

    hourlyGroups.forEach(group => {
      const country = group.dimensions?.country || 'Unknown';
      if (!countryMap[country]) {
        countryMap[country] = { pageViews: 0, uniqueVisitors: 0 };
      }
      countryMap[country].pageViews += group.sum?.pageViews || 0;
      countryMap[country].uniqueVisitors += group.uniq?.uniques || 0;
    });

    // 转换为数组并排序
    const countryArray = Object.entries(countryMap)
      .map(([country, stats]) => ({
        country,
        pageViews: stats.pageViews,
        uniqueVisitors: stats.uniqueVisitors
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
