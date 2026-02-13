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
    // 计算时间范围
    const since = new Date(Date.now() - 364 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const until = new Date().toISOString().split('T')[0];

    // 查询: 获取总体统计数据和国家分布 - 使用 httpRequests1dGroups 的 countryMap
    const query = {
      query: `
        query GetZoneAnalytics($zoneTag: string!, $since: string!, $until: string!) {
          viewer {
            zones(filter: { zoneTag: $zoneTag }) {
              httpRequests1dGroups(
                filter: { date_geq: $since, date_leq: $until }
                limit: 364
              ) {
                sum {
                  pageViews
                  requests
                }
                uniq {
                  uniques
                }
                countryMap {
                  clientCountryName
                  requests
                  pageViews
                }
              }
            }
          }
        }
      `,
      variables: {
        zoneTag: env.CF_ZONE_ID,
        since: since,
        until: until
      }
    };

    const response = await fetch('https://api.cloudflare.com/client/v4/graphql', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.CF_API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(query)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API error ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    if (data.errors) {
      throw new Error(`GraphQL error: ${JSON.stringify(data.errors)}`);
    }

    // 解析数据
    const zoneData = data.data?.viewer?.zones?.[0];
    const dailyGroups = zoneData?.httpRequests1dGroups || [];
    
    let totalPageViews = 0;
    let totalUniques = 0;
    let totalRequests = 0;
    const countryMapData: Record<string, { requests: number; pageViews: number }> = {};
    
    dailyGroups.forEach((day: any) => {
      totalPageViews += day?.sum?.pageViews || 0;
      totalRequests += day?.sum?.requests || 0;
      totalUniques += day?.uniq?.uniques || 0;
      
      // 聚合国家数据
      const countryMap = day?.countryMap || [];
      countryMap.forEach((c: { clientCountryName: string; requests: number; pageViews: number }) => {
        if (!countryMapData[c.clientCountryName]) {
          countryMapData[c.clientCountryName] = { requests: 0, pageViews: 0 };
        }
        countryMapData[c.clientCountryName].requests += c.requests || 0;
        countryMapData[c.clientCountryName].pageViews += c.pageViews || 0;
      });
    });

    // 转换为数组并排序
    const countryArray = Object.entries(countryMapData)
      .map(([country, values]) => ({
        country,
        visitors: values.pageViews || values.requests,
        percentage: totalPageViews > 0 ? Math.round((values.pageViews / totalPageViews) * 100 * 10) / 10 : 0
      }))
      .filter((c) => c.visitors > 0)
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
