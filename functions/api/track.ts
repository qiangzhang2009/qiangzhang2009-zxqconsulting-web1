/**
 * 行为追踪 API
 * POST /api/track
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

export async function onRequestPost(context: { request: Request; env: Env }) {
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
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const clientInfo = getClientInfo(request);
    
    // 生成或使用传入的 visitor_id
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
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      }
    });
    
  } catch (error) {
    console.error('[Track API] Error:', error);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      }
    });
  }
}

// 处理 CORS 预检请求
export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
