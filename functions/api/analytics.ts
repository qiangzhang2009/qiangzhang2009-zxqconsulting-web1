/**
 * Cloudflare Analytics API 端点
 * 获取真实的网站访问统计
 * 
 * 使用方法：
 * 1. 在 Cloudflare Dashboard 创建 API Token
 * 2. 将 Token 添加到 Cloudflare Pages 环境变量
 * 3. 确保 Token 有 Analytics Read 权限
 */

export async function onRequestGet(context) {
  const { env } = context;
  
  // 如果没有配置 API Token，返回提示信息
  if (!env.CF_API_TOKEN || !env.CF_ZONE_ID) {
    return new Response(JSON.stringify({
      error: "Missing credentials",
      message: "Please configure CF_API_TOKEN and CF_ZONE_ID in Cloudflare Pages settings",
      totals: { pageViews: 0, uniqueVisitors: 0, requests: 0 },
      countryMap: []
    }), {
      status: 401,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' }
    });
  }

  try {
    // 使用 Cloudflare GraphQL Analytics API
    const query = {
      query: `
        {
          viewer {
            zones(filter: { zoneTag: "${env.CF_ZONE_ID}" }) {
              httpRequests1dGroups(limit: 1, orderBy: [date_DESC]) {
                sum {
                  pageViews
                  requests
                }
              }
              httpRequests1hGroups(limit: 24, orderBy: [datetime_DESC]) {
                sum {
                  uniqueVisitors
                }
                dimension {
                  datetime
                }
              }
              httpRequests1dGroups(limit: 10, orderBy: [uniques_DESC], filter: { date_geq: "${getDateNDaysAgo(30)}" }) {
                sum {
                  pageViews
                  uniqueVisitors
                }
                dimensions {
                  country
                }
              }
            }
          }
        }
      `
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
    
    // 检查 GraphQL 错误
    if (data.errors) {
      throw new Error(`GraphQL error: ${JSON.stringify(data.errors)}`);
    }

    const zone = data.data?.viewer?.zones?.[0];
    if (!zone) {
      throw new Error("No data found for this zone");
    }

    // 解析数据
    const totals = zone.httpRequests1dGroups?.[0]?.sum || {};
    const countryData = zone.httpRequests1dGroups || [];
    
    // 转换国家数据
    const countryMap = countryData.map(item => ({
      country: item.dimensions?.country || 'Unknown',
      pageViews: item.sum?.pageViews || 0,
      uniqueVisitors: item.sum?.uniqueVisitors || 0
    })).filter(c => c.country && c.country !== 'Unknown');

    const result = {
      totals: {
        pageViews: totals.pageViews || 0,
        uniqueVisitors: calculateUniqueVisitors(zone.httpRequests1hGroups || []),
        requests: totals.requests || 0
      },
      countryMap: countryMap.slice(0, 10)
    };

    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=300' }
    });

  } catch (error) {
    // 返回错误信息以便调试
    return new Response(JSON.stringify({
      error: error.message,
      message: "Failed to fetch Cloudflare Analytics",
      details: "Check API token permissions and Zone ID",
      totals: { pageViews: 0, uniqueVisitors: 0, requests: 0 },
      countryMap: []
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' }
    });
  }
}

// 获取 N 天前的日期
function getDateNDaysAgo(n) {
  const date = new Date();
  date.setDate(date.getDate() - n);
  return date.toISOString().split('T')[0];
}

// 计算唯一访客（从小时数据汇总）
function calculateUniqueVisitors(hourlyData) {
  if (!hourlyData || !hourlyData.length) return 0;
  // 取最大值的近似估算
  const max = Math.max(...hourlyData.map(h => h.sum?.uniqueVisitors || 0));
  return max > 0 ? Math.round(max * 1.5) : 0; // 估算日活
}
