// Vercel API — Track page views and events
// Saves to Supabase if configured, otherwise returns ok to avoid frontend 404s

export const config = {
  runtime: 'edge',
};

export default async function handler(request: Request) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
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
      visitorId,
      sessionId,
      path,
      referrer,
      userAgent,
      visitor_id: visitorId_,
      session_id: sessionId_,
      event_type,
      event_category,
      event_data,
    } = body;

    const vid = visitorId || visitorId_ || `v_${Date.now()}`;
    const sid = sessionId || sessionId_ || `s_${Date.now()}`;

    // Save to Supabase if configured
    if (process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY) {
      try {
        const key = process.env.SUPABASE_ANON_KEY;
        await fetch(`${process.env.SUPABASE_URL}/rest/v1/behaviors`, {
          method: 'POST',
          headers: {
            'apikey': key,
            'Authorization': `Bearer ${key}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal',
          },
          body: JSON.stringify({
            website_id: 'zxqconsulting',
            visitor_id: vid,
            session_id: sid,
            event_type: event_type || (path ? 'page_view' : 'unknown'),
            event_category: event_category || '',
            page_url: path || event_data?.page_path || '/',
            event_data: event_data ? JSON.stringify(event_data) : null,
          }),
        });
      } catch (_) {}
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  } catch (error) {
    return new Response(JSON.stringify({ ok: false }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
}
