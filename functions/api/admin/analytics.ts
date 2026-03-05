/**
 * 统计分析 API
 * GET /api/admin/analytics?website_id=&days=30
 */

const SUPABASE_URL = 'https://your-project.supabase.co';
const SUPABASE_SERVICE_KEY = 'your-service-role-key';

const ADMIN_API_KEY = 'zxq_admin_secret_key_2024';

async function verifyAuth(request) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false;
  }
  return authHeader.substring(7) === ADMIN_API_KEY;
}

async function supabaseFetch(endpoint, options = {}) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${endpoint}`, {
    ...options,
    headers: {
      'apikey': SUPABASE_SERVICE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': options.prefer || 'return=representation',
      ...options.headers
    }
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(error);
  }
  
  return { data: await response.json() };
}

export async function onRequestGet(context) {
  const { request } = context;
  
  if (!await verifyAuth(request)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const url = new URL(request.url);
    const websiteId = url.searchParams.get('website_id') || 'zxqconsulting';
    const days = parseInt(url.searchParams.get('days') || '30');
    
    const today = new Date().toISOString().split('T')[0];
    const sinceDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
    
    // 今日统计
    const todayVisitors = await supabaseFetch(
      `visitors?website_id=eq.${websiteId}&last_visit=gte.${today}T00:00:00&select=id`
    );
    const todaySubmissions = await supabaseFetch(
      `submissions?website_id=eq.${websiteId}&created_at=gte.${today}T00:00:00&select=id`
    );
    
    // 总计统计
    const totalVisitors = await supabaseFetch(
      `visitors?website_id=eq.${websiteId}&select=id`
    );
    const totalSubmissions = await supabaseFetch(
      `submissions?website_id=eq.${websiteId}&select=id`
    );
    
    // 趋势数据（按天聚合）
    const { data: behaviors } = await supabaseFetch(
      `behaviors?website_id=eq.${websiteId}&created_at=gte.${sinceDate}&select=created_at,event_type`
    );
    
    // 按天统计
    const dailyStats: Record<string, { pageViews: number; submissions: number }> = {};
    behaviors?.forEach(b => {
      const date = b.created_at.split('T')[0];
      if (!dailyStats[date]) {
        dailyStats[date] = { pageViews: 0, submissions: 0 };
      }
      dailyStats[date].pageViews++;
      if (b.event_type === 'submit') {
        dailyStats[date].submissions++;
      }
    });
    
    const trend = Object.entries(dailyStats)
      .map(([date, stats]) => ({ date, ...stats }))
      .sort((a, b) => a.date.localeCompare(b.date));
    
    // 热门页面
    const { data: topPagesRaw } = await supabaseFetch(
      `behaviors?website_id=eq.${websiteId}&event_type=eq.page_view&select=page_url&created_at=gte.${sinceDate}`
    );
    
    const pageCounts: Record<string, number> = {};
    topPagesRaw?.forEach(b => {
      pageCounts[b.page_url] = (pageCounts[b.page_url] || 0) + 1;
    });
    const topPages = Object.entries(pageCounts)
      .map(([page, views]) => ({ page, views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 10);
    
    // 热门国家
    const { data: topCountriesRaw } = await supabaseFetch(
      `visitors?website_id=eq.${websiteId}&country=not.is.null&select=country`
    );
    
    const countryCounts: Record<string, number> = {};
    topCountriesRaw?.forEach(v => {
      if (v.country) {
        countryCounts[v.country] = (countryCounts[v.country] || 0) + 1;
      }
    });
    const topCountries = Object.entries(countryCounts)
      .map(([country, visitors]) => ({ country, visitors }))
      .sort((a, b) => b.visitors - a.visitors)
      .slice(0, 10);
    
    // 最近提交
    const { data: recentSubmissions } = await supabaseFetch(
      `submissions?website_id=eq.${websiteId}&order=created_at.desc&limit=5`
    );
    
    // 转化率
    const totalV = totalVisitors.data?.length || 0;
    const totalS = totalSubmissions.data?.length || 0;
    const conversionRate = totalV > 0 ? ((totalS / totalV) * 100).toFixed(2) : 0;
    
    return new Response(JSON.stringify({
      today: {
        visitors: todayVisitors.data?.length || 0,
        submissions: todaySubmissions.data?.length || 0
      },
      total: {
        visitors: totalV,
        submissions: totalS,
        conversionRate
      },
      trend,
      topPages,
      topCountries,
      recentSubmissions: recentSubmissions || []
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Analytics error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

/**
 * 更新表单状态
 * PATCH /api/admin/submissions/:id
 */
export async function onRequestPatch(context) {
  const { request, params } = context;
  
  if (!await verifyAuth(request)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const { id } = params;
    const body = await request.json();
    const { status, notes, assigned_to } = body;
    
    const updateData: any = {
      updated_at: new Date().toISOString()
    };
    
    if (status) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;
    if (assigned_to !== undefined) updateData.assigned_to = assigned_to;
    
    await supabaseFetch(`submissions?id=eq.${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updateData)
    });
    
    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Update submission error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
