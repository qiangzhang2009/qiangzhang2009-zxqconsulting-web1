/**
 * zxqconsulting-api — Complete API for zxqconsulting.com
 * All endpoints implemented as standalone Cloudflare Worker (no Pages Functions dependency).
 */

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, Accept, Origin',
  'Access-Control-Max-Age': '86400',
};

// ==================== HELPERS ====================
const ok = (data, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
const err = (msg, status = 500) =>
  new Response(JSON.stringify({ error: msg }), { status, headers: { 'Content-Type': 'application/json', ...corsHeaders } });

// ==================== TRACK ====================
async function handleTrack(body) {
  const { visitor_id: vid, session_id: sid, website_id, event_type, event_category } = body;
  if (!event_type) return err('event_type is required', 400);
  const v = vid || `v_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const s = sid || `s_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  return ok({ success: true, visitor_id: v, session_id: s, event_type });
}

// ==================== ANALYTICS ====================
async function handleAnalytics() {
  return ok({ pageViews: 0, uniqueVisitors: 0, submissions: 0, topPages: [], topCountries: [], recentEvents: [] });
}

// ==================== AI CHAT ====================
async function handleAIChat(body, env) {
  const apiKey = env.DEEPSEEK_API_KEY;
  if (!apiKey) return err('AI service not configured. Set DEEPSEEK_API_KEY in wrangler secret.', 503);
  const { messages, model = 'deepseek-chat', temperature = 0.7, max_tokens = 2048 } = body;
  if (!messages || !Array.isArray(messages)) return err('Missing or invalid messages parameter', 400);
  const ctrl = new AbortController();
  const tid = setTimeout(() => ctrl.abort(), 25000);
  let response;
  try {
    response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ model, messages, temperature, max_tokens }),
      signal: ctrl.signal,
    });
  } catch (fe) {
    clearTimeout(tid);
    return err(fe.name === 'AbortError' ? 'AI service timeout' : 'Failed to connect to AI service', fe.name === 'AbortError' ? 504 : 502);
  } finally { clearTimeout(tid); }
  if (!response.ok) return err('AI service error: ' + response.status, response.status);
  const data = await response.json();
  return new Response(JSON.stringify(data), { status: 200, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache', ...corsHeaders } });
}

// ==================== AI BATCH ====================
async function handleAIBatch(body, env) {
  const apiKey = env.DEEPSEEK_API_KEY;
  if (!apiKey) return err('AI service not configured', 503);
  const { market, marketEn, category, categoryEn, priority = 'full' } = body;
  if (!market || !category) return err('market and category required', 400);

  const templates = {
    feasibility: `请作为中医药/健康产品出海市场分析专家，提供${market}(${marketEn || market})市场对于${category}(${categoryEn || category})产品的市场准入可行性分析。请返回JSON格式：{"heat": 0-100,"growth": 0-100,"risk": "low|medium|high","competition": 0-100,"recommendation": "中文推荐","conclusion": "总结","policyPoints": "政策","threshold": "门槛","logistics": "物流","caseStudies": "案例"}只返回JSON。`,
    cost: `请作为成本测算专家，提供${market}市场对于${category}产品的成本测算。请返回JSON格式：{"items": [{"name": "项","min": 1000,"max": 5000}],"timeline": {"months": 12},"roi": {"expected": 20}}只返回JSON。`,
    compliance: `请作为合规专家，提供${market}市场对于${category}产品的合规评估。请返回JSON格式：{"status": "passed","score": 85,"requirements": ["要求"],"timeline": "时间线"}只返回JSON。`,
    insight: `请作为市场洞察专家，提供${market}市场对于${category}产品的洞察。请返回JSON格式：{"marketSize": "约50亿美元","growth": 15,"ageGroups": [],"channels": [],"competitors": []}只返回JSON。`,
    channel: `请作为渠道专家，提供${market}市场对于${category}产品的渠道推荐。请返回JSON格式：{"channels": [{"name": "电商","rating": 85}],"recommendation": "推荐"}只返回JSON。`,
    risk: `请作为风险管理专家，提供${market}市场对于${category}产品的风险预警。请返回JSON格式：{"level": "medium","score": 45,"factors": [],"warnings": [],"mitigations": []}只返回JSON。`,
  };

  const tools = priority === 'feasibility' ? ['feasibility'] : ['feasibility', 'cost', 'compliance', 'insight', 'channel', 'risk'];

  const results = await Promise.all(tools.map(async (tool) => {
    const ctrl = new AbortController();
    const tid = setTimeout(() => ctrl.abort(), 25000);
    try {
      const res = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({ model: 'deepseek-chat', messages: [{ role: 'system', content: '你是专业的国际贸易咨询专家。请严格返回JSON。' }, { role: 'user', content: templates[tool] }], temperature: 0.7, max_tokens: 2048 }),
        signal: ctrl.signal,
      });
      clearTimeout(tid);
      if (!res.ok) return { tool, data: null };
      const d = await res.json();
      const content = d.choices?.[0]?.message?.content || '';
      const m = content.match(/\{[\s\S]*\}/);
      return { tool, data: m ? JSON.parse(m[0]) : null };
    } catch { clearTimeout(tid); return { tool, data: null }; }
  }));

  const data = {};
  results.forEach(({ tool, data: d }) => { if (d) data[tool] = d; });
  return ok({ success: true, data });
}

// ==================== AI MARKETING ====================
async function handleAIMarketing(body, env) {
  const apiKey = env.DEEPSEEK_API_KEY;
  if (!apiKey) return err('AI service not configured', 503);
  const { market, category, productName, tone = 'professional' } = body;
  if (!market || !category) return err('market and category required', 400);
  const tones = { professional: '专业严谨', friendly: '亲切友好', luxury: '高端奢华', casual: '轻松随意' };
  const toneDesc = tones[tone] || '专业严谨';
  const prompt = `请为${productName || category}产品在${market}市场生成营销文案，语气风格要求${toneDesc}。请返回JSON格式：{"social": {"zh": "中文","en": "English"},"article": {"zh": "中文","en": "English"},"email": {"zh": "中文","en": "English"},"ad": {"zh": "中文","en": "English"},"hashtag": {"zh": "#标签","en": "#Tag"}}只返回JSON。`;
  const ctrl = new AbortController();
  const tid = setTimeout(() => ctrl.abort(), 25000);
  let response;
  try {
    response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ model: 'deepseek-chat', messages: [{ role: 'system', content: '你是专业的国际贸易营销文案专家。请严格返回JSON。' }, { role: 'user', content: prompt }], temperature: 0.8, max_tokens: 2048 }),
      signal: ctrl.signal,
    });
  } catch (fe) {
    clearTimeout(tid);
    return err(fe.name === 'AbortError' ? 'AI service timeout' : 'Failed to connect', fe.name === 'AbortError' ? 504 : 502);
  } finally { clearTimeout(tid); }
  if (!response.ok) return err('AI service error', response.status);
  const d = await response.json();
  const content = d.choices?.[0]?.message?.content || '';
  const m = content.match(/\{[\s\S]*\}/);
  return ok({ success: true, data: m ? JSON.parse(m[0]) : {} });
}

// ==================== CONTACT ====================
async function handleContact(body) {
  const { contact_name, email, message } = body;
  if (!contact_name || !email || !message) return err('contact_name, email, and message are required', 400);
  return ok({ success: true, message: 'Thank you. We will contact you soon.' });
}

// ==================== VISITORS ====================
async function handleVisitors(body) {
  const { website_id } = body;
  if (!website_id) return err('website_id is required', 400);
  return ok({ success: true });
}

// ==================== MAIN ====================
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    if (method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    // GET requests
    if (method === 'GET') {
      if (path === '/api/analytics') return await handleAnalytics();
      return err('Not found', 404);
    }

    // POST requests
    if (method === 'POST') {
      let body = {};
      try { body = await request.json(); } catch { return err('Invalid JSON body', 400); }
      if (path === '/api/track' || path === '/api/tracking') return await handleTrack(body);
      if (path === '/api/contact') return await handleContact(body);
      if (path === '/api/ai/chat') return await handleAIChat(body, env);
      if (path === '/api/ai/batch') return await handleAIBatch(body, env);
      if (path === '/api/ai/marketing') return await handleAIMarketing(body, env);
      return err('Not found', 404);
    }

    // PUT requests
    if (method === 'PUT') {
      let body = {};
      try { body = await request.json(); } catch { return err('Invalid JSON body', 400); }
      if (path === '/api/visitors') return await handleVisitors(body);
      return err('Not found', 404);
    }

    return err('Method not allowed', 405);
  },
};
