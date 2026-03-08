/**
 * Cloudflare Pages API Worker
 * 处理 /api/* 路由
 */

const ADMIN_API_KEY = 'zxq_admin_secret_key_2024';

// 开发环境使用的 DeepSeek API Key（fallback）
const FALLBACK_DEEPSEEK_API_KEY = 'sk-af7161086d14482aac4d8127002e6bcd';

// 获取客户端信息
function getClientInfo(request) {
  const cf = request.cf || {};
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
async function verifyAuth(request) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false;
  }
  return authHeader.substring(7) === ADMIN_API_KEY;
}

// CORS 头 - 更宽松的配置
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, Accept, Origin',
  'Access-Control-Max-Age': '86400',
};

// ==================== TRACK API ====================
async function handleTrack(context) {
  const { request, env } = context;

  console.log('[Track API] Request received');
  console.log('[Track API] SUPABASE_URL configured:', !!env.SUPABASE_URL);
  console.log('[Track API] SUPABASE_ANON_KEY configured:', !!env.SUPABASE_ANON_KEY);

  try {
    const body = await request.json();
    
    const {
      visitor_id: inputVisitorId,
      session_id: inputSessionId,
      website_id,
      event_type,
      event_category,
      event_label,
      page_url,
      page_title,
      duration_seconds,
      metadata
    } = body;
    
    if (!event_type) {
      return new Response(JSON.stringify({ error: 'event_type is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }
    
    const clientInfo = getClientInfo(request);
    
    const vid = inputVisitorId || `v_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const sid = inputSessionId || `s_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const data = {
      website_id: website_id || 'zxqconsulting',
      visitor_id: vid,
      session_id: sid,
      event_type: event_type,
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
    
    console.log('[Track API] Received event:', event_type, event_category, event_label);
    
    // 如果 Supabase 配置存在，存储数据
    if (env.SUPABASE_URL && env.SUPABASE_ANON_KEY) {
      console.log('[Track API] Saving to Supabase...');
      
      const response = await fetch(`${env.SUPABASE_URL}/rest/v1/behaviors`, {
        method: 'POST',
        headers: {
          'apikey': env.SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${env.SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        const error = await response.text();
        console.error('[Track API] Supabase error:', response.status, error);
      } else {
        console.log('[Track API] Successfully saved to Supabase');
      }
    } else {
      console.log('[Track API] Supabase not configured, skipping save');
    }
    
    return new Response(JSON.stringify({
      success: true,
      visitor_id: vid,
      session_id: sid,
      debug: {
        event_type,
        event_category,
        supabase_configured: !!(env.SUPABASE_URL && env.SUPABASE_ANON_KEY)
      }
    }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
    
  } catch (error) {
    console.error('[Track API] Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
}

// ==================== AI CHAT API ====================
async function handleAIChat(context) {
  const { request, env } = context;
  
  console.log('[AI Proxy] Request received');
  
  // 优先使用环境变量，如果没有则使用 fallback
  const apiKey = env.DEEPSEEK_API_KEY || FALLBACK_DEEPSEEK_API_KEY;
  
  if (!apiKey) {
    console.error('[AI Proxy] Missing DEEPSEEK_API_KEY');
    return new Response(JSON.stringify({ error: 'Server configuration error: Missing API key' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
  
  console.log('[AI Proxy] API key configured:', !!apiKey);

  try {
    const body = await request.json();
    const { 
      messages, 
      model = 'deepseek-chat', 
      temperature = 0.7, 
      max_tokens = 2048 
    } = body;

    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: 'Missing or invalid messages parameter' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    console.log('[AI Proxy] Calling DeepSeek API...');
    
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        messages,
        temperature,
        max_tokens
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[AI Proxy] DeepSeek API error:', response.status, errorText);
      
      let errorMessage = 'AI service error';
      if (response.status === 401) {
        errorMessage = 'AI service authentication failed - check API key';
      } else if (response.status === 429) {
        errorMessage = 'AI service rate limit exceeded';
      } else if (response.status >= 500) {
        errorMessage = 'AI service temporarily unavailable';
      }
      
      return new Response(JSON.stringify({ error: errorMessage }), {
        status: response.status,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    const data = await response.json();
    console.log('[AI Proxy] Success! Got response');
    
    return new Response(JSON.stringify(data), {
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        ...corsHeaders
      }
    });

  } catch (error) {
    console.error('[AI Proxy] Error:', error);
    
    return new Response(JSON.stringify({ 
      error: error.message || 'Internal server error',
      retry: true
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
}

// ==================== VISITORS API ====================
async function handleVisitorsPut(context) {
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
    
    const data = {
      website_id,
      visitor_id,
      company_name,
      contact_name,
      contact_phone,
      email,
      product_category,
      product_name,
      target_region,
      main_need,
      readiness_score,
      selected_markets: selected_markets ? JSON.stringify(selected_markets) : null,
      ip_address: clientInfo.ipAddress,
      country: clientInfo.country,
      city: clientInfo.city,
      device_type: clientInfo.deviceType,
      browser: clientInfo.browser,
      updated_at: new Date().toISOString()
    };
    
    await fetch(`${env.SUPABASE_URL}/rest/v1/visitors?visitor_id=eq.${visitor_id}`, {
      method: 'PATCH',
      headers: {
        'apikey': env.SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${env.SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify(data)
    });
    
    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
    
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
}

// ==================== CONTACT FORM API ====================
async function handleContact(context) {
  const { request, env } = context;

  try {
    const body = await request.json();
    const { website_id, visitor_id, company_name, contact_name, contact_phone, email, product_category, product_name, target_region, main_need, message } = body;
    
    if (!contact_name || !email || !message) {
      return new Response(JSON.stringify({ error: 'contact_name, email, and message are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }
    
    const data = {
      website_id: website_id || 'zxqconsulting',
      visitor_id: visitor_id || '',
      company_name,
      contact_name,
      contact_phone,
      email,
      product_category,
      product_name,
      target_region,
      main_need,
      message,
      status: 'pending',
      created_at: new Date().toISOString()
    };
    
    await fetch(`${env.SUPABASE_URL}/rest/v1/submissions`, {
      method: 'POST',
      headers: {
        'apikey': env.SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${env.SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify(data)
    });
    
    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
    
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
}

// ==================== ADMIN ANALYTICS API ====================
async function handleAdminAnalytics(context) {
  const { request, env } = context;
  const isAuth = await verifyAuth(request);
  
  if (!isAuth) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }

  try {
    const url = new URL(request.url);
    const websiteId = url.searchParams.get('website_id') || 'zxqconsulting';
    const days = parseInt(url.searchParams.get('days') || '30');
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const key = env.SUPABASE_SERVICE_KEY || env.SUPABASE_ANON_KEY;
    
    // 获取行为数据统计
    const behaviorsRes = await fetch(
      `${env.SUPABASE_URL}/rest/v1/behaviors?website_id=eq.${websiteId}&created_at=gte.${startDate.toISOString()}&select=event_type,event_category,country,device_type`,
      { headers: { 'apikey': key, 'Authorization': `Bearer ${key}` } }
    );
    const behaviors = await behaviorsRes.json();
    
    // 获取唯一访客数
    const visitorsRes = await fetch(
      `${env.SUPABASE_URL}/rest/v1/behaviors?website_id=eq.${websiteId}&created_at=gte.${startDate.toISOString()}&select=visitor_id`,
      { headers: { 'apikey': key, 'Authorization': `Bearer ${key}` } }
    );
    const visitorsData = await visitorsRes.json();
    const uniqueVisitors = visitorsData ? [...new Set(visitorsData.map(v => v.visitor_id))].length : 0;
    
    // 获取表单提交数
    const submissionsRes = await fetch(
      `${env.SUPABASE_URL}/rest/v1/submissions?website_id=eq.${websiteId}&created_at=gte.${startDate.toISOString()}&select=id`,
      { headers: { 'apikey': key, 'Authorization': `Bearer ${key}` } }
    );
    const submissions = await submissionsRes.json();
    
    // 按事件类型统计
    const eventStats = {};
    behaviors.forEach(b => {
      const key = b.event_type;
      eventStats[key] = (eventStats[key] || 0) + 1;
    });
    
    // 按国家统计
    const countryStats = {};
    behaviors.forEach(b => {
      if (b.country) {
        countryStats[b.country] = (countryStats[b.country] || 0) + 1;
      }
    });
    
    // 按设备统计
    const deviceStats = {};
    behaviors.forEach(b => {
      if (b.device_type) {
        deviceStats[b.device_type] = (deviceStats[b.device_type] || 0) + 1;
      }
    });
    
    return new Response(JSON.stringify({
      totalVisitors: uniqueVisitors,
      totalEvents: behaviors ? behaviors.length : 0,
      totalSubmissions: submissions ? submissions.length : 0,
      eventStats,
      countryStats,
      deviceStats,
      period: { days, startDate: startDate.toISOString() }
    }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
    
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
}

// ==================== ADMIN VISITORS API ====================
async function handleAdminVisitors(context) {
  const { request, env } = context;
  const isAuth = await verifyAuth(request);
  
  if (!isAuth) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }

  try {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const websiteId = url.searchParams.get('website_id') || 'zxqconsulting';
    const offset = (page - 1) * limit;
    
    const key = env.SUPABASE_SERVICE_KEY || env.SUPABASE_ANON_KEY;
    
    const res = await fetch(
      `${env.SUPABASE_URL}/rest/v1/visitors?website_id=eq.${websiteId}&order=updated_at.desc&offset=${offset}&limit=${limit}`,
      { headers: { 'apikey': key, 'Authorization': `Bearer ${key}` } }
    );
    const data = await res.json();
    
    let countRes = await fetch(
      `${env.SUPABASE_URL}/rest/v1/visitors?website_id=eq.${websiteId}&select=id`,
      { headers: { 'apikey': key, 'Authorization': `Bearer ${key}` } }
    );
    const countData = await countRes.json();
    const total = countData ? countData.length : 0;
    
    return new Response(JSON.stringify({
      total, page, limit, totalPages: Math.ceil(total / limit), data: data || []
    }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
    
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
}

// ==================== ADMIN SUBMISSIONS API ====================
async function handleAdminSubmissions(context) {
  const { request, env } = context;
  const isAuth = await verifyAuth(request);
  
  if (!isAuth) {
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
    const total = countData ? countData.length : 0;
    
    return new Response(JSON.stringify({
      total: total, page: page, limit: limit, totalPages: Math.ceil(total / limit), data: data || []
    }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
    
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
}

// ==================== MAIN HANDLER ====================
export async function onRequest(context) {
  const { request, env } = context;
  const { url, method } = request;
  const path = url.pathname;

  // 调试：打印请求信息
  console.log('[Worker] Request received:', method, path);
  console.log('[Worker] User-Agent:', request.headers.get('user-agent'));
  console.log('[Worker] Origin:', request.headers.get('origin'));
  console.log('[Worker] Host:', request.headers.get('host'));

  // 处理 OPTIONS 预检 - 立即返回
  if (method === 'OPTIONS') {
    console.log('[Worker] Handling OPTIONS preflight');
    return new Response(null, { 
      status: 204,
      headers: corsHeaders 
    });
  }

  // 只处理 API 路由
  if (path.startsWith('/api/')) {
    console.log('[Worker] API path detected, processing...');
    
    // 调试：确保我们知道请求正在被处理
    try {
      // Track API
      if (path === '/api/track' && method === 'POST') {
        console.log('[Worker] Routing to handleTrack');
        return await handleTrack(context);
      }
      
      // AI Chat API
      if (path === '/api/ai/chat' && method === 'POST') {
        console.log('[Worker] Routing to handleAIChat');
        return await handleAIChat(context);
      }
      
      // Visitors API
      if (path === '/api/visitors' && method === 'PUT') {
        return await handleVisitorsPut(context);
      }
      
      // Contact API
      if (path === '/api/contact' && method === 'POST') {
        return await handleContact(context);
      }
      
      // Admin Analytics API
      if (path === '/api/admin/analytics' && method === 'GET') {
        return await handleAdminAnalytics(context);
      }
      
      // Admin Visitors API
      if (path === '/api/admin/visitors' && method === 'GET') {
        return await handleAdminVisitors(context);
      }
      
      // Admin Submissions API
      if (path === '/api/admin/submissions' && method === 'GET') {
        return await handleAdminSubmissions(context);
      }

      // 未匹配的 API 路由 - 返回 404 而不是 403
      console.log('[Worker] API route not found:', path, method);
      return new Response(JSON.stringify({ 
        error: 'Not found', 
        path: path, 
        method: method,
        message: 'API endpoint not defined'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    } catch (error) {
      console.error('[Worker] API Error:', error);
      return new Response(JSON.stringify({ error: error.message, stack: error.stack }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }
  }

  // 非 API 路径返回 404（静态文件由 Cloudflare Pages 直接服务）
  console.log('[Worker] Non-API path, returning 404');
  return new Response('Not Found', { status: 404 });
}

// 全局错误处理
export async function onRequestError(context) {
  console.error('[Worker] Uncaught error:', context.error);
  return new Response('Internal Server Error', { status: 500 });
}
