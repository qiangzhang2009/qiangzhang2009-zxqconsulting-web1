/**
 * Cloudflare Analytics API 端点
 * 使用 REST API 获取真实的网站访问统计
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
    // 使用 Cloudflare Analytics REST API
    // 获取过去364天的数据
    const since = Math.floor((Date.now() - 364 * 24 * 60 * 60 * 1000) / 1000);
    const until = Math.floor(Date.now() / 1000);
    
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/zones/${env.CF_ZONE_ID}/analytics/dashboard?since=${since}&until=${until}&metrics=pageViews,uniqueVisitors,requests&dimensions=country`,
      {
        headers: {
          'Authorization': `Bearer ${env.CF_API_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API error ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    
    // 检查 API 响应
    if (!data.success) {
      throw new Error(`API error: ${JSON.stringify(data.errors)}`);
    }

    const result = data.result;
    const totals = result.totals || {};
    const topCountries = result.topCountries || { countries: [] };
    
    // 转换国家数据
    const totalVisitors = totals.uniqueVisitors || 0;
    const countryArray = (topCountries.countries || [])
      .slice(0, 15)
      .map(c => ({
        country: c.country,
        visitors: c.uniques || 0,
        percentage: totalVisitors > 0 ? Math.round((c.uniques / totalVisitors) * 100 * 10) / 10 : 0
      }))
      .filter(c => c.visitors > 0)
      .sort((a, b) => b.visitors - a.visitors);

    const finalResult = {
      ...debugInfo,
      isRealData: true,
      totals: {
        pageViews: totals.pageViews || 0,
        uniqueVisitors: totals.uniqueVisitors || 0,
        requests: totals.requests || 0
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
