// Vercel API 路由 - 联系表单提交
// POST /api/contact
// 保存到 Supabase 数据库

export const config = {
  runtime: 'edge',
};

export default async function handler(request) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

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

    const submissionData = {
      website_id: website_id || 'zxqconsulting',
      visitor_id: visitor_id || null,
      name,
      email: email || null,
      phone: phone || null,
      company: company || null,
      message: message || null,
      product_interest: product_interest || null,
      source_page: source_page || '/',
      status: 'new',
      created_at: new Date().toISOString()
    };

    // 保存到 Supabase
    if (process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY) {
      const supabaseResponse = await fetch(`${process.env.SUPABASE_URL}/rest/v1/submissions`, {
        method: 'POST',
        headers: {
          'apikey': process.env.SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(submissionData)
      });

      if (!supabaseResponse.ok) {
        const error = await supabaseResponse.text();
        console.error('[Contact API] Supabase error:', error);
      }
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'Form submitted successfully'
    }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (error) {
    console.error('[Contact API] Error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
}
