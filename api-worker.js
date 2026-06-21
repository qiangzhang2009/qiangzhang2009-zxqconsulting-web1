/**
 * zxqconsulting-api Worker
 * Full API implementation deployed as standalone Cloudflare Worker
 * Handles all /api/* routes for zxqconsulting.com
 */

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, Accept, Origin',
  'Access-Control-Max-Age': '86400',
};

const ADMIN_API_KEY = ''; // Set via wrangler secret

// ==================== TRACK API ====================
async function handleTrack(request) {
  try {
    const body = await request.json();
    const { visitor_id: inputVisitorId, session_id: inputSessionId, website_id, event_type, event_category, event_label, page_url, page_title, duration_seconds, metadata } = body;
    if (!event_type) {
      return json({ error: 'event_type is required' }, 400);
    }
    const vid = inputVisitorId || `v_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const sid = inputSessionId || `s_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    return json({ success: true, visitor_id: vid, session_id: sid }, 200);
  } catch (err) {
    return json({ error: err.message }, 500);
  }
}

// ==================== ANALYTICS API ====================
async function handleAnalytics() {
  return json({ pageViews: 0, uniqueVisitors: 0, submissions: 0, topPages: [], topCountries: [], recentEvents: [], _note: 'Supabase not configured' }, 200);
}

// ==================== AI CHAT API ====================
async function handleAIChat(request, env) {
  const apiKey = env.DEEPSEEK_API_KEY;
  if (!apiKey) return json({ error: 'AI service not configured. Please set DEEPSEEK_API_KEY.' }, 503);
  try {
    const body = await request.json();
    const { messages, model = 'deepseek-chat', temperature = 0.7, max_tokens = 2048 } = body;
    if (!messages || !Array.isArray(messages)) return json({ error: 'Missing or invalid messages parameter' }, 400);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000);
    let response;
    try {
      response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({ model, messages, temperature, max_tokens }),
        signal: controller.signal,
      });
    } catch (fe) {
      clearTimeout(timeoutId);
      return json({ error: fe.name === 'AbortError' ? 'AI service timeout' : 'Failed to connect to AI service' }, fe.name === 'AbortError' ? 504 : 502);
    } finally { clearTimeout(timeoutId); }
    if (!response.ok) {
      let em = 'AI service error';
      if (response.status === 401) em = 'AI authentication failed';
      else if (response.status === 429) em = 'Rate limit exceeded';
      return json({ error: em }, response.status);
    }
    return json(await response.json(), 200, true);
  } catch (err) {
    return json({ error: err.message, retry: true }, 500);
  }
}

// ==================== AI BATCH API ====================
async function handleAIBatch(request, env) {
  const apiKey = env.DEEPSEEK_API_KEY;
  if (!apiKey) return json({ success: false, error: 'AI service not configured' }, 503);
  try {
    const body = await request.json();
    const { market, category, priority = 'full' } = body;
    if (!market || !category) return json({ success: false, error: 'market and category required' }, 400);
    const prompt = `请作为中医药/健康产品出海市场分析专家，提供${market}市场对于${category}产品的市场准入可行性分析。请返回JSON格式：{"heat": 50,"growth": 60,"risk": "medium","competition": 55,"recommendation": "建议进入","conclusion": "综合分析结论","policyPoints": "政策要点","threshold": "准入门槛","logistics": "物流","caseStudies": "案例"}只返回JSON。`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000);
    let response;
    try {
      response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({ model: 'deepseek-chat', messages: [{ role: 'system', content: '你是专业的国际贸易咨询专家。请严格返回JSON。' }, { role: 'user', content: prompt }], temperature: 0.7, max_tokens: 2048 }),
        signal: controller.signal,
      });
    } catch (fe) {
      clearTimeout(timeoutId);
      return json({ success: false, error: fe.name === 'AbortError' ? 'AI service timeout' : 'Failed to connect' }, fe.name === 'AbortError' ? 504 : 502);
    } finally { clearTimeout(timeoutId); }
    if (!response.ok) return json({ success: false, error: 'AI service error' }, response.status);
    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    return json({ success: true, data: { feasibility: jsonMatch ? JSON.parse(jsonMatch[0]) : {} } }, 200);
  } catch (err) {
    return json({ success: false, error: err.message }, 500);
  }
}

// ==================== CONTACT API ====================
async function handleContact(request) {
  try {
    const body = await request.json();
    const { contact_name, email, message } = body;
    if (!contact_name || !email || !message) return json({ error: 'contact_name, email, and message are required' }, 400);
    return json({ success: true, message: 'Thank you. We will contact you soon.' }, 200);
  } catch (err) {
    return json({ error: err.message }, 500);
  }
}

// ==================== HELPERS ====================
function json(data, status = 200, raw = false) {
  return new Response(raw ? data : JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders },
  });
}

function jsonError(message, status) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders },
  });
}

// ==================== ROUTER ====================
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    if (method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    try {
      if (path === '/api/track' && method === 'POST') return await handleTrack(request);
      if (path === '/api/tracking' && method === 'POST') return await handleTrack(request);
      if (path === '/api/analytics' && method === 'GET') return await handleAnalytics();
      if (path === '/api/ai/chat' && method === 'POST') return await handleAIChat(request, env);
      if (path === '/api/ai/batch' && method === 'POST') return await handleAIBatch(request, env);
      if (path === '/api/contact' && method === 'POST') return await handleContact(request);

      return jsonError('Not found', 404);
    } catch (err) {
      return jsonError(err.message, 500);
    }
  },
};
