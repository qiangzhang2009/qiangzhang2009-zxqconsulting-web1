// Vercel API 路由 - 访客信息
// PUT /api/visitors - 保存访客信息

export const config = {
  runtime: 'edge',
};

export default async function handler(request) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (request.method !== 'PUT') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }

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
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    const vid = visitor_id || `v_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

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
      last_visit: new Date().toISOString()
    };

    // 保存到 Supabase (如果配置了)
    if (process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY) {
      // 先查询是否已存在
      const checkResponse = await fetch(
        `${process.env.SUPABASE_URL}/rest/v1/visitors?website_id=eq.${website_id}&visitor_id=eq.${vid}`,
        {
          headers: {
            'apikey': process.env.SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY}`
          }
        }
      );

      const existing = await checkResponse.json();

      let response;
      if (existing && existing.length > 0) {
        // 更新
        response = await fetch(
          `${process.env.SUPABASE_URL}/rest/v1/visitors?website_id=eq.${website_id}&visitor_id=eq.${vid}`,
          {
            method: 'PATCH',
            headers: {
              'apikey': process.env.SUPABASE_ANON_KEY,
              'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY}`,
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

        response = await fetch(`${process.env.SUPABASE_URL}/rest/v1/visitors`, {
          method: 'POST',
          headers: {
            'apikey': process.env.SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify(visitorData)
        });
      }

      if (!response.ok) {
        const error = await response.text();
        console.error('[Visitors API] Supabase error:', error);
      }
    }

    return new Response(JSON.stringify({
      success: true,
      visitor_id: vid
    }), {
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
        'Set-Cookie': `visitor_id=${vid}; Path=/; Max-Age=31536000; HttpOnly; SameSite=Lax`
      },
    });

  } catch (error) {
    console.error('[Visitors API] Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
}
