/**
 * Supabase 访客数据收集系统
 * 
 * 使用 Supabase 存储多个网站的访客数据
 * 
 * 配置步骤：
 * 1. 在 supabase.com 创建免费项目
 * 2. 获取 url 和 anon key
 * 3. 在 Cloudflare Workers secrets 中配置
 * 
 * 表结构：
 * - visitors: 访客基础信息
 * - submissions: 联系表单提交  
 * - behaviors: 用户行为追踪
 * - websites: 网站配置（支持多网站）
 */

// Supabase 配置
const SUPABASE_URL = 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key';

// 初始化 Supabase 客户端
function createClient() {
  return {
    url: SUPABASE_URL,
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
    }
  };
}

// 获取客户端IP和位置信息
function getClientInfo(request) {
  const cf = request.cf || {};
  const userAgent = request.headers.get('user-agent') || '';
  
  // 解析设备类型
  const isMobile = /mobile|android|iphone|ipad|phone/i.test(userAgent);
  const deviceType = isMobile ? 'mobile' : 'desktop';
  
  // 解析浏览器
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

/**
 * 行为追踪 API
 * POST /api/track
 */
export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const body = await request.json();
    const {
      website_id,           // 网站标识（必填）
      visitor_id,          // 访客ID
      event_type,          // 事件类型：page_view, click, scroll, submit
      event_category,      // 事件分类
      event_label,         // 事件标签
      page_url,            // 页面URL
      page_title,          // 页面标题
      duration_seconds,    // 停留时长
      metadata             // 额外数据
    } = body;
    
    if (!website_id) {
      return new Response(JSON.stringify({ error: 'website_id is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const clientInfo = getClientInfo(request);
    
    // 生成访客ID
    const vid = visitor_id || `v_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // 构建数据
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
    
    // 发送到 Supabase
    const response = await fetch(`${SUPABASE_URL}/rest/v1/behaviors`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      const error = await response.text();
      console.error('Supabase error:', error);
    }
    
    // 设置访客Cookie
    return new Response(JSON.stringify({
      success: true,
      visitor_id: vid
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': `visitor_id=${vid}; Path=/; Max-Age=31536000; HttpOnly; SameSite=Lax`
      }
    });
    
  } catch (error) {
    console.error('Track API error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

/**
 * 获取访客信息 API
 * POST /api/visitors
 * 
 * 保存决策工作台中的访客企业信息
 */
export async function onRequestPut(context) {
  const { request, env } = context;

  try {
    const body = await request.json();
    const {
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
      selected_markets
    } = body;
    
    if (!website_id) {
      return new Response(JSON.stringify({ error: 'website_id is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const clientInfo = getClientInfo(request);
    const vid = visitor_id || `v_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // 先查询是否已存在
    const checkResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/visitors?website_id=eq.${website_id}&visitor_id=eq.${vid}`,
      {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        }
      }
    );
    
    const existing = await checkResponse.json();
    
    const visitorData = {
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
    
    let response;
    if (existing && existing.length > 0) {
      // 更新
      response = await fetch(
        `${SUPABASE_URL}/rest/v1/visitors?website_id=eq.${website_id}&visitor_id=eq.${vid}`,
        {
          method: 'PATCH',
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify(visitorData)
        }
      );
    } else {
      // 新增
      visitorData.first_visit = new Date().toISOString();
      visitorData.visit_count = 1;
      visitorData.created_at = new Date().toISOString();
      
      response = await fetch(`${SUPABASE_URL}/rest/v1/visitors`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify(visitorData)
      });
    }
    
    if (!response.ok) {
      const error = await response.text();
      console.error('Supabase error:', error);
    }
    
    return new Response(JSON.stringify({
      success: true,
      visitor_id: vid
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': `visitor_id=${vid}; Path=/; Max-Age=31536000; HttpOnly; SameSite=Lax`
      }
    });
    
  } catch (error) {
    console.error('Visitors API error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

/**
 * 联系表单提交 API
 * POST /api/contact
 */
export async function onRequestPatch(context) {
  const { request, env } = context;

  try {
    const body = await request.json();
    const {
      website_id,
      visitor_id,
      name,
      email,
      phone,
      company,
      message,
      product_interest,
      source_page
    } = body;
    
    if (!website_id) {
      return new Response(JSON.stringify({ error: 'website_id is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
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
    
    const response = await fetch(`${SUPABASE_URL}/rest/v1/submissions`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(data)
    });
    
    const result = await response.json();
    
    return new Response(JSON.stringify({
      success: true,
      id: result[0]?.id
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Contact API error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
