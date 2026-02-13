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
    // 查询1: 获取总体统计数据
    const totalQuery = `query { viewer { zones(filter: { zoneTag: "${env.CF_ZONE_ID}" }) { httpRequests1dGroups(limit: 364) { sum { pageViews requests } uniq { uniques } } } } }`;

    // 查询2: 获取按国家的请求数据
    const countryQuery = `query { viewer { zones(filter: { zoneTag: "${env.CF_ZONE_ID}" }) { httpRequestsByCountryGroups(limit: 20, orderBy: [requests_DESC]) { country: clientCountryName requests pageViews } } } }`;

    // 并行执行两个查询
    const [totalResponse, countryResponse] = await Promise.all([
      fetch('https://api.cloudflare.com/client/v4/graphql', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.CF_API_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query: totalQuery })
      }),
      fetch('https://api.cloudflare.com/client/v4/graphql', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.CF_API_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query: countryQuery })
      })
    ]);

    // 检查总体数据响应
    if (!totalResponse.ok) {
      const errorText = await totalResponse.text();
      throw new Error(`Total API error ${totalResponse.status}: ${errorText}`);
    }
    const totalData = await totalResponse.json();
    if (totalData.errors) {
      throw new Error(`GraphQL total error: ${JSON.stringify(totalData.errors)}`);
    }

    // 检查国家数据响应
    if (!countryResponse.ok) {
      const errorText = await countryResponse.text();
      throw new Error(`Country API error ${countryResponse.status}: ${errorText}`);
    }
    const countryData = await countryResponse.json();
    if (countryData.errors) {
      throw new Error(`GraphQL country error: ${JSON.stringify(countryData.errors)}`);
    }

    // 解析总体数据
    const zoneTotalData = totalData.data?.viewer?.zones?.[0];
    const dailyGroups = zoneTotalData?.httpRequests1dGroups || [];
    
    let totalPageViews = 0;
    let totalUniques = 0;
    let totalRequests = 0;
    
    dailyGroups.forEach((day: any) => {
      totalPageViews += day?.sum?.pageViews || 0;
      totalRequests += day?.sum?.requests || 0;
      totalUniques += day?.uniq?.uniques || 0;
    });

    // 解析国家数据 (使用 pageViews 作为访客指标)
    const zoneCountryData = countryData.data?.viewer?.zones?.[0];
    const countryGroups = zoneCountryData?.httpRequestsByCountryGroups || [];
    
    const countryArray = countryGroups
      .map((c: { country: string; requests: number; pageViews: number }) => ({
        country: c.country,
        visitors: c.pageViews || c.requests,
        percentage: totalPageViews > 0 ? Math.round((c.pageViews / totalPageViews) * 100 * 10) / 10 : 0
      }))
      .filter((c: { visitors: number }) => c.visitors > 0)
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
