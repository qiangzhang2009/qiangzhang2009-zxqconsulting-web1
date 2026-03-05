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

  try {
    const body = await request.json();
    const {
      website_id,
      visitor_id,
      event_type,
      event_category,
      event_label,
      page_url,
      page_title,
      duration_seconds,
      metadata
    } = body;
    
    if (!website_id) {
      return new Response(JSON.stringify({ error: 'website_id is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
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
    console.error('Track API error:', error);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
