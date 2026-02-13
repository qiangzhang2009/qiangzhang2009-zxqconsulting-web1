/**
 * Cloudflare Analytics API 端点
 * 获取真实的网站访问统计
 */

export async function onRequestGet(context) {
  const { env } = context;
  
  // 调试：记录收到的环境变量
  const debugInfo = {
    hasToken: !!env.CF_API_TOKEN,
    hasZoneId: !!env.CF_ZONE_ID,
    zoneIdValue: env.CF_ZONE_ID ? env.CF_ZONE_ID.substring(0, 8) + '...' : 'not set'
  };

  // 如果没有配置 API Token，返回模拟数据（用于演示）
  if (!env.CF_API_TOKEN || !env.CF_ZONE_ID) {
    // 返回模拟数据以便演示
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
    // 使用 Cloudflare Analytics REST API (更简单的方式)
    // 获取 30 天数据
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/zones/${env.CF_ZONE_ID}/analytics/dashboard?since=-30d&until=now&metrics=pageViews,uniqueVisitors,requests&dimensions=country`,
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
    const countryMap = (topCountries.countries || []).slice(0, 10).map(c => ({
      country: c.country,
      pageViews: c.pageViews || 0,
      uniqueVisitors: c.uniques || 0
    }));

    const finalResult = {
      ...debugInfo,
      totals: {
        pageViews: totals.pageViews || 0,
        uniqueVisitors: totals.uniques || 0,
        requests: totals.requests || 0
      },
      countryMap: countryMap
    };

    return new Response(JSON.stringify(finalResult), {
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=300' }
    });

  } catch (error) {
    // 返回详细错误信息以便调试
    return new Response(JSON.stringify({
      ...debugInfo,
      error: error.message,
      stack: error.stack,
      message: "Failed to fetch Cloudflare Analytics. Check API token permissions.",
      totals: { pageViews: 0, uniqueVisitors: 0, requests: 0 },
      countryMap: []
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' }
    });
  }
}
