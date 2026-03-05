/**
 * 访客信息 API
 * PUT /api/visitors - 保存访客信息
 * PATCH /api/contact - 联系表单提交
 */

interface Env {
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
}

// 获取客户端IP和位置信息
function getClientInfo(request: Request): {
  ipAddress: string;
  country: string;
  city: string;
  deviceType: string;
  browser: string;
} {
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

/**
 * 保存访客信息 (决策工作台)
 * PUT /api/visitors
 */
export async function onRequestPut(context: { request: Request; env: Env }) {
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
      `${env.SUPABASE_URL}/rest/v1/visitors?website_id=eq.${website_id}&visitor_id=eq.${vid}`,
      {
        headers: {
          'apikey': env.SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${env.SUPABASE_ANON_KEY}`
        }
      }
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
    
    let response;
    if (existing && existing.length > 0) {
      // 更新
      response = await fetch(
        `${env.SUPABASE_URL}/rest/v1/visitors?website_id=eq.${website_id}&visitor_id=eq.${vid}`,
        {
          method: 'PATCH',
          headers: {
            'apikey': env.SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${env.SUPABASE_ANON_KEY}`,
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
      
      response = await fetch(`${env.SUPABASE_URL}/rest/v1/visitors`, {
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
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

/**
 * 联系表单提交
 * POST /api/contact
 */
export async function onRequestPost(context: { request: Request; env: Env }) {
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
    
    return new Response(JSON.stringify({
      success: true,
      id: result[0]?.id
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Contact API error:', error);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
