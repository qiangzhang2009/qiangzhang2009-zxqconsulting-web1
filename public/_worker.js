/**
 * Cloudflare Pages API Worker
 * 处理 /api/* 路由
 */

interface Env {
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  SUPABASE_SERVICE_KEY: string;
}

const ADMIN_API_KEY = 'zxq_admin_secret_key_2024';

// 获取客户端信息
function getClientInfo(request: Request) {
  const cf = (request as any).cf || {};
  const userAgent = request.headers.get('user-agent') || '';
  
  const isMobile = /mobile|android|iphone|ipad|phone/i.test(userAgent);
  const deviceType = isMobile ? 'mobile' : 'desktop';
  
  let browser = 'unknown';
  if (userAgent.includes('Chrome')) browser = 'Chrome';
  else if (userAgent.includes('Safari')) browser = 'Safari';
  else if (userAgent.includes('Firefox')) browser = 'Firefox';
  else if (userAgent.includes('Edge')) browser = 'Edge';
  
  return {
    ipAddress: cf.clientIp || '',
    country: cf.country || '',
    city: cf.city || '',
    deviceType,
    browser
  };
}

// 验证管理员权限
async function verifyAuth(request: Request): Promise<boolean> {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false;
  }
  return authHeader.substring(7) === ADMIN_API_KEY;
}

// Supabase 请求
async function supabaseFetch(env: Env, endpoint: string, options: RequestInit = {}) {
  const key = env.SUPABASE_SERVICE_KEY || env.SUPABASE_ANON_KEY;
  const response = await fetch(`${env.SUPABASE_URL}/rest/v1/${endpoint}`, {
    ...options,
    headers: {
      'apikey': key,
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json',
      'Prefer': options.headers?.['Prefer'] || 'return=representation',
      ...options.headers
    }
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(error);
  }
  
  return { data: await response.json() };
}

// CORS 头
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// ==================== TRACK API ====================
async function handleTrack(context: { request: Request; env: Env }) {
  const { request, env } = context;

  try {
    const body = await request.json();
    const { website_id, visitor_id, event_type, event_category, event_label, page_url, page_title, duration_seconds, metadata } = body;
    
    if (!website_id) {
      return new Response(JSON.stringify({ error: 'website_id is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }
    
    const clientInfo = getClientInfo(request);
    const vid = visitor_id || `v_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const data = {
      website_id,
      visitor_id: vid,
      event_type: event_type || 'page_view',
      event_category: event_category || '',
      event_label: event_label || '',
      page_url: page_url || new URL(request.url).pathname,
      page_title: page_title || '',
      duration_seconds,
      metadata: metadata ? JSON.stringify(metadata) : null,
      ip_address: clientInfo.ipAddress,
      country: clientInfo.country,
      city: clientInfo.city,
      device_type: clientInfo.deviceType,
      browser: clientInfo.browser,
      created_at: new Date().toISOString()
    };
    
    await fetch(`${env.SUPABASE_URL}/rest/v1/behaviors`, {
      method: 'POST',
      headers: {
        'apikey': env.SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${env.SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify(data)
    });
    
    return new Response(JSON.stringify({ success: true, visitor_id: vid }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
    
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
}

// ==================== VISITORS API ====================
async function handleVisitorsPut(context: { request: Request; env: Env }) {
  const { request, env } = context;

  try {
    const body = await request.json();
    const { website_id, visitor_id, company_name, contact_name, contact_phone, email, product_category, product_name, target_region, main_need, readiness_score, selected_markets } = body;
    
    if (!website_id) {
      return new Response(JSON.stringify({ error: 'website_id is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }
    
    const clientInfo = getClientInfo(request);
    const vid = visitor_id || `v_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const checkResponse = await fetch(
      `${env.SUPABASE_URL}/rest/v1/visitors?website_id=eq.${website_id}&visitor_id=eq.${vid}`,
      { headers: { 'apikey': env.SUPABASE_ANON_KEY, 'Authorization': `Bearer ${env.SUPABASE_ANON_KEY}` } }
    );
    const existing = await checkResponse.json();
    
    const visitorData: Record<string, any> = {
      website_id,
      visitor_id: vid,
      company_name: company_name || null,
      contact_name: contact_name || null,
      contact_phone: contact_phone || null,
      email: email || null,
      product_category: product_category || null,
      product_name: product_name || null,
      target_region: target_region || null,
      main_need: main_need || null,
      readiness_score: readiness_score || null,
      selected_markets: selected_markets ? JSON.stringify(selected_markets) : null,
      ip_address: clientInfo.ipAddress,
      country: clientInfo.country,
      city: clientInfo.city,
      device_type: clientInfo.deviceType,
      browser: clientInfo.browser,
      last_visit: new Date().toISOString()
    };
    
    if (existing && existing.length > 0) {
      await fetch(`${env.SUPABASE_URL}/rest/v1/visitors?website_id=eq.${website_id}&visitor_id=eq.${vid}`, {
        method: 'PATCH',
        headers: {
          'apikey': env.SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${env.SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify(visitorData)
      });
    } else {
      visitorData.first_visit = new Date().toISOString();
      visitorData.visit_count = 1;
      visitorData.created_at = new Date().toISOString();
      
      await fetch(`${env.SUPABASE_URL}/rest/v1/visitors`, {
        method: 'POST',
        headers: {
          'apikey': env.SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${env.SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify(visitorData)
      });
    }
    
    return new Response(JSON.stringify({ success: true, visitor_id: vid }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
    
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
}

// ==================== CONTACT API ====================
async function handleContact(context: { request: Request; env: Env }) {
  const { request, env } = context;

  try {
    const body = await request.json();
    const { website_id, visitor_id, name, email, phone, company, message, product_interest, source_page } = body;
    
    if (!website_id) {
      return new Response(JSON.stringify({ error: 'website_id is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }
    
    const clientInfo = getClientInfo(request);
    
    const data = {
      website_id,
      visitor_id: visitor_id || null,
      name,
      email: email || null,
      phone: phone || null,
      company: company || null,
      message: message || null,
      product_interest: product_interest || null,
      source_page: source_page || '/',
      ip_address: clientInfo.ipAddress,
      country: clientInfo.country,
      status: 'new',
      created_at: new Date().toISOString()
    };
    
    const response = await fetch(`${env.SUPABASE_URL}/rest/v1/submissions`, {
      method: 'POST',
      headers: {
        'apikey': env.SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${env.SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(data)
    });
    
    const result = await response.json();
    
    return new Response(JSON.stringify({ success: true, id: result[0]?.id }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
    
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
}

// ==================== ADMIN ANALYTICS API ====================
async function handleAdminAnalytics(context: { request: Request; env: Env }) {
  const { request, env } = context;
  
  if (!await verifyAuth(request)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }

  try {
    const url = new URL(request.url);
    const websiteId = url.searchParams.get('website_id') || 'zxqconsulting';
    const days = parseInt(url.searchParams.get('days') || '30');
    
    const today = new Date().toISOString().split('T')[0];
    const sinceDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
    
    const key = env.SUPABASE_SERVICE_KEY || env.SUPABASE_ANON_KEY;
    
    // 今日统计
    const todayVisitorsRes = await fetch(
      `${env.SUPABASE_URL}/rest/v1/visitors?website_id=eq.${websiteId}&last_visit=gte.${today}T00:00:00&select=id`,
      { headers: { 'apikey': key, 'Authorization': `Bearer ${key}` } }
    );
    const todaySubmissionsRes = await fetch(
      `${env.SUPABASE_URL}/rest/v1/submissions?website_id=eq.${websiteId}&created_at=gte.${today}T00:00:00&select=id`,
      { headers: { 'apikey': key, 'Authorization': `Bearer ${key}` } }
    );
    
    // 总计
    const totalVisitorsRes = await fetch(
      `${env.SUPABASE_URL}/rest/v1/visitors?website_id=eq.${websiteId}&select=id`,
      { headers: { 'apikey': key, 'Authorization': `Bearer ${key}` } }
    );
    const totalSubmissionsRes = await fetch(
      `${env.SUPABASE_URL}/rest/v1/submissions?website_id=eq.${websiteId}&select=id`,
      { headers: { 'apikey': key, 'Authorization': `Bearer ${key}` } }
    );
    
    const todayVisitors = await todayVisitorsRes.json();
    const todaySubmissions = await todaySubmissionsRes.json();
    const totalVisitors = await totalVisitorsRes.json();
    const totalSubmissions = await totalSubmissionsRes.json();
    
    // 趋势数据
    const behaviorsRes = await fetch(
      `${env.SUPABASE_URL}/rest/v1/behaviors?website_id=eq.${websiteId}&created_at=gte.${sinceDate}&select=created_at,event_type`,
      { headers: { 'apikey': key, 'Authorization': `Bearer ${key}` } }
    );
    const behaviors = await behaviorsRes.json();
    
    const dailyStats: Record<string, { pageViews: number; submissions: number }> = {};
    (behaviors || []).forEach((b: any) => {
      const date = b.created_at.split('T')[0];
      if (!dailyStats[date]) dailyStats[date] = { pageViews: 0, submissions: 0 };
      dailyStats[date].pageViews++;
      if (b.event_type === 'submit') dailyStats[date].submissions++;
    });
    
    const trend = Object.entries(dailyStats)
      .map(([date, stats]) => ({ date, ...stats }))
      .sort((a: any, b: any) => a.date.localeCompare(b.date));
    
    // 热门页面
    const topPagesRes = await fetch(
      `${env.SUPABASE_URL}/rest/v1/behaviors?website_id=eq.${websiteId}&event_type=eq.page_view&select=page_url&created_at=gte.${sinceDate}`,
      { headers: { 'apikey': key, 'Authorization': `Bearer ${key}` } }
    );
    const topPagesRaw = await topPagesRes.json();
    
    const pageCounts: Record<string, number> = {};
    (topPagesRaw || []).forEach((b: any) => {
      pageCounts[b.page_url] = (pageCounts[b.page_url] || 0) + 1;
    });
    const topPages = Object.entries(pageCounts)
      .map(([page, views]) => ({ page, views }))
      .sort((a: any, b: any) => b.views - a.views)
      .slice(0, 10);
    
    // 热门国家
    const countriesRes = await fetch(
      `${env.SUPABASE_URL}/rest/v1/visitors?website_id=eq.${websiteId}&country=not.is.null&select=country`,
      { headers: { 'apikey': key, 'Authorization': `Bearer ${key}` } }
    );
    const topCountriesRaw = await countriesRes.json();
    
    const countryCounts: Record<string, number> = {};
    (topCountriesRaw || []).forEach((v: any) => {
      if (v.country) countryCounts[v.country] = (countryCounts[v.country] || 0) + 1;
    });
    const topCountries = Object.entries(countryCounts)
      .map(([country, visitors]) => ({ country, visitors }))
      .sort((a: any, b: any) => b.visitors - a.visitors)
      .slice(0, 10);
    
    // 最近提交
    const recentRes = await fetch(
      `${env.SUPABASE_URL}/rest/v1/submissions?website_id=eq.${websiteId}&order=created_at.desc&limit=5`,
      { headers: { 'apikey': key, 'Authorization': `Bearer ${key}` } }
    );
    const recentSubmissions = await recentRes.json();
    
    const totalV = totalVisitors?.length || 0;
    const totalS = totalSubmissions?.length || 0;
    const conversionRate = totalV > 0 ? ((totalS / totalV) * 100).toFixed(2) : 0;
    
    return new Response(JSON.stringify({
      today: { visitors: todayVisitors?.length || 0, submissions: todaySubmissions?.length || 0 },
      total: { visitors: totalV, submissions: totalS, conversionRate },
      trend,
      topPages,
      topCountries,
      recentSubmissions: recentSubmissions || []
    }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
    
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
}

// ==================== ADMIN VISITORS API ====================
async function handleAdminVisitors(context: { request: Request; env: Env }) {
  const { request, env } = context;
  
  if (!await verifyAuth(request)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }

  try {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const search = url.searchParams.get('search') || '';
    const websiteId = url.searchParams.get('website_id') || 'zxqconsulting';
    const offset = (page - 1) * limit;
    
    const key = env.SUPABASE_SERVICE_KEY || env.SUPABASE_ANON_KEY;
    
    let query = `visitors?website_id=eq.${websiteId}&order=created_at.desc&offset=${offset}&limit=${limit}`;
    if (search) {
      query = `visitors?website_id=eq.${websiteId}&or=(contact_name.ilike.*${search}*,company_name.ilike.*${search}*,phone.ilike.*${search}*)&order=created_at.desc&offset=${offset}&limit=${limit}`;
    }
    
    const res = await fetch(`${env.SUPABASE_URL}/rest/v1/${query}`, {
      headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
    });
    const data = await res.json();
    
    const visitors = (data || []).map((v: any) => ({
      ...v,
      selected_markets: v.selected_markets ? JSON.parse(v.selected_markets) : []
    }));
    
    const countRes = await fetch(
      `${env.SUPABASE_URL}/rest/v1/visitors?website_id=eq.${websiteId}&select=id`,
      { headers: { 'apikey': key, 'Authorization': `Bearer ${key}` } }
    );
    const countData = await countRes.json();
    const total = countData?.length || 0;
    
    return new Response(JSON.stringify({
      total, page, limit, totalPages: Math.ceil(total / limit), data: visitors
    }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
    
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
}

// ==================== ADMIN SUBMISSIONS API ====================
async function handleAdminSubmissions(context: { request: Request; env: Env }) {
  const { request, env } = context;
  
  if (!await verifyAuth(request)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }

  try {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const status = url.searchParams.get('status');
    const websiteId = url.searchParams.get('website_id') || 'zxqconsulting';
    const offset = (page - 1) * limit;
    
    const key = env.SUPABASE_SERVICE_KEY || env.SUPABASE_ANON_KEY;
    
    let query = `submissions?website_id=eq.${websiteId}&order=created_at.desc&offset=${offset}&limit=${limit}`;
    if (status) {
      query = `submissions?website_id=eq.${websiteId}&status=eq.${status}&order=created_at.desc&offset=${offset}&limit=${limit}`;
    }
    
    const res = await fetch(`${env.SUPABASE_URL}/rest/v1/${query}`, {
      headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
    });
    const data = await res.json();
    
    let countQuery = `submissions?website_id=eq.${websiteId}&select=id`;
    if (status) {
      countQuery = `submissions?website_id=eq.${websiteId}&status=eq.${status}&select=id`;
    }
    const countRes = await fetch(`${env.SUPABASE_URL}/rest/v1/${countQuery}`, {
      headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
    });
    const countData = await countRes.json();
    const total = countData?.length || 0;
    
    return new Response(JSON.stringify({
      total, page, limit, totalPages: Math.ceil(total / limit), data: data || []
    }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
    
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
}

// ==================== MAIN HANDLER ====================
export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const path = url.pathname;

  // 处理 OPTIONS 预检
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // 路由匹配
    if (path === '/api/track' && request.method === 'POST') {
      return await handleTrack(context);
    }
    
    if (path === '/api/visitors' && request.method === 'PUT') {
      return await handleVisitorsPut(context);
    }
    
    if (path === '/api/contact' && request.method === 'POST') {
      return await handleContact(context);
    }
    
    if (path === '/api/admin/analytics' && request.method === 'GET') {
      return await handleAdminAnalytics(context);
    }
    
    if (path === '/api/admin/visitors' && request.method === 'GET') {
      return await handleAdminVisitors(context);
    }
    
    if (path === '/api/admin/submissions' && request.method === 'GET') {
      return await handleAdminSubmissions(context);
    }

    // 404
    return new Response(JSON.stringify({ error: 'Not found', path }), {
      status: 404,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });

  } catch (error) {
    console.error('API Error:', error);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
}
