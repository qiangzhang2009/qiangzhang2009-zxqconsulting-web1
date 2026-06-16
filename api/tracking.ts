// Vercel API 路由 - 用户行为追踪
// 将追踪数据转发到后台管理系统

export const config = {
  runtime: 'edge',
};

export default async function handler(request: Request) {
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  // Handle OPTIONS
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }

  try {
    const body = await request.json();
    
    console.log('[Tracking API] Received event:', body.event_type, body.event_data);
    
    // 后台管理系统的 API 地址
    const BACKEND_API_URL = process.env.BACKEND_API_URL || 'https://websites-admin.zxqconsulting.com';
    
    // 转发到后台管理系统
    const response = await fetch(`${BACKEND_API_URL}/api/tracking`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (response.ok) {
      const result = await response.json();
      console.log('[Tracking API] Forwarded to backend:', result);
      
      return new Response(JSON.stringify({ 
        success: true, 
        forwarded: true,
        ...result
      }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    } else {
      console.error('[Tracking API] Backend error:', response.status);
      return new Response(JSON.stringify({ 
        success: false,
        forwarded: false,
        skipped: true,
        reason: 'backend_unavailable',
        status: response.status 
      }), {
        status: 202,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

  } catch (error) {
    console.error('[Tracking API] Error:', error);
    return new Response(JSON.stringify({
      success: false,
      forwarded: false,
      skipped: true,
      reason: 'tracking_proxy_error',
    }), {
      status: 202,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
}
