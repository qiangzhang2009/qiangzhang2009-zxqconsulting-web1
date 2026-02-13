/**
 * Cloudflare Analytics API 端点
 * 获取真实的网站访问统计
 * 
 * 使用方法：
 * 1. 在 Cloudflare Dashboard 创建 API Token
 * 2. 将 Token 添加到 Cloudflare Pages 环境变量
 * 3. 或者使用 Cloudflare Analytics JS SDK
 */

export async function onRequestGet(context) {
  const { env } = context;
  
  // 如果没有配置 API Token，返回提示信息
  if (!env.CF_API_TOKEN || !env.CF_ZONE_ID) {
    // 返回模拟数据结构（实际使用时应替换为真实 API 调用）
    // 注意：这里返回空数据，让前端显示"暂无数据"
    return new Response(JSON.stringify({
      error: "Analytics not configured",
      message: "Please configure CF_API_TOKEN and CF_ZONE_ID in Cloudflare Pages settings",
      totals: {
        pageViews: 0,
        uniqueVisitors: 0,
        requests: 0
      },
      countryMap: []
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      }
    });
  }

  try {
    // 使用 Cloudflare Analytics API v4
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/zones/${env.CF_ZONE_ID}/analytics/dashboard?metrics=pageViews,uniqueVisitors&dimensions=country&limit=10`,
      {
        headers: {
          'Authorization': `Bearer ${env.CF_API_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    
    // 转换数据格式
    const result = {
      totals: {
        pageViews: data.result?.totals?.pageViews || 0,
        uniqueVisitors: data.result?.totals?.uniqueVisitors || 0,
        requests: data.result?.totals?.requests || 0
      },
      series: {
        timeseries: data.result?.data?.map(item => ({
          date: item.dimensions.date,
          pageViews: item.metrics.pageViews,
          uniqueVisitors: item.metrics.uniqueVisitors
        })) || []
      },
      countryMap: data.result?.topCountries?.countries?.map(country => ({
        country: country.country,
        pageViews: country.pageViews,
        uniqueVisitors: country.uniqueVisitors
      })) || []
    };

    return new Response(JSON.stringify(result), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300' // 缓存 5 分钟
      }
    });

  } catch (error) {
    return new Response(JSON.stringify({
      error: error.message,
      totals: {
        pageViews: 0,
        uniqueVisitors: 0,
        requests: 0
      },
      countryMap: []
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}
