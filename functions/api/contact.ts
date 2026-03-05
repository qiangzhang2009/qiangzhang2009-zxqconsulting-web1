/**
 * 联系表单提交 API
 * POST /api/contact
 * 
 * 保存用户通过联系表单提交的信息到 Supabase
 */

interface Env {
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
}

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
    
    // 获取客户端信息
    const cf = (request as any).cf || {};
    const ipAddress = cf.clientIp || '';
    const country = cf.country || '';
    
    const data = {
      website_id: website_id || 'zxqconsulting',
      visitor_id: visitor_id || null,
      name,
      email: email || null,
      phone: phone || null,
      company: company || null,
      message: message || null,
      product_interest: product_interest || null,
      source_page: source_page || '/',
      ip_address: ipAddress,
      country: country,
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
    
    if (!response.ok) {
      const error = await response.text();
      console.error('Supabase error:', error);
      return new Response(JSON.stringify({
        success: false,
        error: 'Failed to save submission'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const result = await response.json();
    
    return new Response(JSON.stringify({
      success: true,
      id: result[0]?.id,
      message: '表单提交成功'
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Contact Form API error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: (error as Error).message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
