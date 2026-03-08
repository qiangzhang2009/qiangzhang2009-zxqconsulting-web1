// Vercel API 路由 - 用户行为追踪

export const config = {
  runtime: 'edge',
};

export default async function handler(request) {
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
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
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }
    
    // 生成 visitor_id 和 session_id
    const vid = inputVisitorId || `v_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const sid = inputSessionId || `s_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    console.log('[Track API] Received event:', event_type, event_category, event_label);
    
    // 尝试保存到 Supabase（如果配置了）
    if (process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY) {
      try {
        const response = await fetch(`${process.env.SUPABASE_URL}/rest/v1/behaviors`, {
          method: 'POST',
          headers: {
            'apikey': process.env.SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify({
            website_id: website_id || 'zxqconsulting',
            visitor_id: vid,
            session_id: sid,
            event_type,
            event_category: event_category || '',
            event_label: event_label || '',
            page_url: page_url || '',
            page_title: page_title || '',
            duration_seconds,
            metadata: metadata ? JSON.stringify(metadata) : null,
            created_at: new Date().toISOString()
          })
        });
        
        if (response.ok) {
          console.log('[Track API] Saved to Supabase');
        }
      } catch (supabaseError) {
        console.error('[Track API] Supabase error:', supabaseError);
      }
    }
    
    return new Response(JSON.stringify({
      success: true,
      visitor_id: vid,
      session_id: sid
    }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (error) {
    console.error('[Track API] Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
}
