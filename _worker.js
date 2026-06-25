/**
 * Cloudflare Pages API Worker
 * Handles /api/* routes
 */

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, Accept, Origin',
  'Access-Control-Max-Age': '86400',
};

function getClientInfo(request) {
  const cf = request.cf || {};
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
    browser,
  };
}

async function verifyAuth(request, env) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) return false;
  const adminKey = env.ADMIN_API_KEY;
  if (!adminKey) return false;
  return authHeader.substring(7) === adminKey;
}

// ==================== TRACK API (POST /api/track/page and POST /api/track/event) ====================
async function handleTrackPage(context) {
  const { request, env } = context;
  try {
    const body = await request.json();
    const { visitorId, sessionId, path, referrer, userAgent } = body;
    if (env.SUPABASE_URL && env.SUPABASE_ANON_KEY) {
      const key = env.SUPABASE_ANON_KEY;
      await fetch(`${env.SUPABASE_URL}/rest/v1/behaviors`, {
        method: 'POST',
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`,
          'Content-Type': 'application/json',
          Prefer: 'return=minimal',
        },
        body: JSON.stringify({
          website_id: 'zxqconsulting',
          visitor_id: visitorId || `v_${Date.now()}`,
          session_id: sessionId || `s_${Date.now()}`,
          event_type: 'page_view',
          page_url: path || '/',
          referrer: referrer || '',
          user_agent: userAgent || '',
        }),
      });
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

async function handleTrack(context) {
  const { request, env } = context;
  try {
    const body = await request.json();
    const { visitor_id, session_id, event_type, page_url } = body;
    if (env.SUPABASE_URL && env.SUPABASE_ANON_KEY) {
      const key = env.SUPABASE_ANON_KEY;
      await fetch(`${env.SUPABASE_URL}/rest/v1/behaviors`, {
        method: 'POST',
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`,
          'Content-Type': 'application/json',
          Prefer: 'return=minimal',
        },
        body: JSON.stringify({
          website_id: body.website_id || 'zxqconsulting',
          visitor_id: visitor_id || `v_${Date.now()}`,
          session_id: session_id || `s_${Date.now()}`,
          event_type: event_type || 'unknown',
          page_url: page_url || body.page_url || '/',
          event_category: body.event_category || '',
          event_label: body.event_label || '',
        }),
      });
    }
    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
}

// ==================== AI CHAT API ====================
async function handleAIChat(context) {
  const { request, env } = context;

  const apiKey = env.DEEPSEEK_API_KEY;

  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: 'Server configuration error: AI service not configured. Please contact the administrator.' }),
      { status: 503, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }

  try {
    const body = await request.json();
    const { messages, model = 'deepseek-chat', temperature = 0.7, max_tokens = 2048 } = body;

    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: 'Missing or invalid messages parameter' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000);

    let response;
    try {
      response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({ model, messages, temperature, max_tokens }),
        signal: controller.signal,
      });
    } catch (fetchError) {
      clearTimeout(timeoutId);
      if (fetchError.name === 'AbortError') {
        return new Response(JSON.stringify({ error: 'AI service timeout - please try again later' }), {
          status: 504,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }
      return new Response(JSON.stringify({ error: 'Failed to connect to AI service' }), {
        status: 502,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    } finally {
      clearTimeout(timeoutId);
    }

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = 'AI service error';
      if (response.status === 401) errorMessage = 'AI service authentication failed - check API key';
      else if (response.status === 429) errorMessage = 'AI service rate limit exceeded';
      else if (response.status === 504) errorMessage = 'AI service timeout - please try again';
      else if (response.status >= 500) errorMessage = 'AI service temporarily unavailable';

      return new Response(JSON.stringify({ error: errorMessage }), {
        status: response.status,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    const data = await response.json();
    return new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache', ...corsHeaders },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message || 'Internal server error', retry: true }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
}

// ==================== VISITORS API ====================
async function handleVisitorsPut(context) {
  const { request, env } = context;

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
      selected_markets,
    } = body;

    if (!website_id) {
      return new Response(JSON.stringify({ error: 'website_id is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    const clientInfo = getClientInfo(request);

    const data = {
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
      selected_markets: selected_markets ? JSON.stringify(selected_markets) : null,
      ip_address: clientInfo.ipAddress,
      country: clientInfo.country,
      city: clientInfo.city,
      device_type: clientInfo.deviceType,
      browser: clientInfo.browser,
      updated_at: new Date().toISOString(),
    };

    await fetch(`${env.SUPABASE_URL}/rest/v1/visitors?visitor_id=eq.${visitor_id}`, {
      method: 'PATCH',
      headers: {
        apikey: env.SUPABASE_ANON_KEY,
        Authorization: `Bearer ${env.SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify(data),
    });

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
}

// ==================== CONTACT FORM API ====================
async function handleContact(context) {
  const { request, env } = context;

  try {
    const body = await request.json();
    const {
      website_id,
      visitor_id,
      contact_name,
      name,
      company,
      company_name,
      email,
      phone,
      contact_phone,
      projectStage,
      targetMarkets,
      timeline,
      challenge,
      budget,
      hasValidation,
      message,
      product_category,
      product_name,
      target_region,
      main_need,
      source_page,
    } = body;

    // Accept both camelCase (source) and snake_case (deployed) field names
    const finalContactName = contact_name || name || '';
    const finalCompany = company || company_name || '';
    const finalPhone = phone || contact_phone || '';
    const finalMessage = message || '';
    const finalProductCategory = product_category || '';
    const finalProductName = product_name || '';
    const finalTargetRegion = target_region || '';
    const finalMainNeed = main_need || '';

    if (!finalContactName || !email || !finalMessage) {
      return new Response(JSON.stringify({ error: 'contact_name, email, and message are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Forward to backend (local server with SQLite)
    const backendUrl = env.BACKEND_URL || 'https://websites-admin.zxqconsulting.com';
    try {
      await fetch(`${backendUrl}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          website_id: website_id || 'zxqconsulting',
          visitor_id: visitor_id || '',
          contact_name: finalContactName,
          email,
          company: finalCompany,
          phone: finalPhone,
          message: finalMessage,
          project_stage: projectStage || '',
          target_markets: targetMarkets || '',
          timeline: timeline || '',
          challenge: challenge || '',
          budget: budget || '',
          has_validation: hasValidation || '',
          source_page: source_page || '/',
        }),
      });
    } catch (_) {}

    // Save to Supabase submissions if configured
    if (env.SUPABASE_URL && env.SUPABASE_ANON_KEY) {
      await fetch(`${env.SUPABASE_URL}/rest/v1/submissions`, {
        method: 'POST',
        headers: {
          apikey: env.SUPABASE_ANON_KEY,
          Authorization: `Bearer ${env.SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
          Prefer: 'return=minimal',
        },
        body: JSON.stringify({
          website_id: website_id || 'zxqconsulting',
          visitor_id: visitor_id || '',
          contact_name: finalContactName,
          email,
          company: finalCompany,
          phone: finalPhone,
          message: finalMessage,
          product_category: finalProductCategory,
          product_name: finalProductName,
          target_region: finalTargetRegion,
          main_need: finalMainNeed,
          status: 'pending',
          created_at: new Date().toISOString(),
        }),
      });
    }

    return new Response(JSON.stringify({ success: true, message: 'Thank you. We will contact you soon.' }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
}

// ==================== ADMIN ANALYTICS API ====================
async function handleAdminAnalytics(context) {
  const { request, env } = context;
  if (!(await verifyAuth(request, env))) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }

  try {
    const url = new URL(request.url);
    const websiteId = url.searchParams.get('website_id') || 'zxqconsulting';
    const days = parseInt(url.searchParams.get('days') || '30');

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const key = env.SUPABASE_SERVICE_KEY || env.SUPABASE_ANON_KEY;

    const behaviorsRes = await fetch(
      `${env.SUPABASE_URL}/rest/v1/behaviors?website_id=eq.${websiteId}&created_at=gte.${startDate.toISOString()}&select=event_type,event_category,country,device_type`,
      { headers: { apikey: key, Authorization: `Bearer ${key}` } }
    );
    const behaviors = await behaviorsRes.json();

    const visitorsRes = await fetch(
      `${env.SUPABASE_URL}/rest/v1/behaviors?website_id=eq.${websiteId}&created_at=gte.${startDate.toISOString()}&select=visitor_id`,
      { headers: { apikey: key, Authorization: `Bearer ${key}` } }
    );
    const visitorsData = await visitorsRes.json();
    const uniqueVisitors = visitorsData ? [...new Set(visitorsData.map((v) => v.visitor_id))].length : 0;

    const submissionsRes = await fetch(
      `${env.SUPABASE_URL}/rest/v1/submissions?website_id=eq.${websiteId}&created_at=gte.${startDate.toISOString()}&select=id`,
      { headers: { apikey: key, Authorization: `Bearer ${key}` } }
    );
    const submissions = await submissionsRes.json();

    const eventStats = {};
    behaviors.forEach((b) => {
      const k = b.event_type;
      eventStats[k] = (eventStats[k] || 0) + 1;
    });

    const countryStats = {};
    behaviors.forEach((b) => {
      if (b.country) countryStats[b.country] = (countryStats[b.country] || 0) + 1;
    });

    const deviceStats = {};
    behaviors.forEach((b) => {
      if (b.device_type) deviceStats[b.device_type] = (deviceStats[b.device_type] || 0) + 1;
    });

    return new Response(
      JSON.stringify({
        totalVisitors: uniqueVisitors,
        totalEvents: behaviors ? behaviors.length : 0,
        totalSubmissions: submissions ? submissions.length : 0,
        eventStats,
        countryStats,
        deviceStats,
        period: { days, startDate: startDate.toISOString() },
      }),
      { headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
}

// ==================== ADMIN VISITORS API ====================
async function handleAdminVisitors(context) {
  const { request, env } = context;
  if (!(await verifyAuth(request, env))) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }

  try {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const websiteId = url.searchParams.get('website_id') || 'zxqconsulting';
    const offset = (page - 1) * limit;

    const key = env.SUPABASE_SERVICE_KEY || env.SUPABASE_ANON_KEY;

    const res = await fetch(
      `${env.SUPABASE_URL}/rest/v1/visitors?website_id=eq.${websiteId}&order=updated_at.desc&offset=${offset}&limit=${limit}`,
      { headers: { apikey: key, Authorization: `Bearer ${key}` } }
    );
    const data = await res.json();

    const countRes = await fetch(
      `${env.SUPABASE_URL}/rest/v1/visitors?website_id=eq.${websiteId}&select=id`,
      { headers: { apikey: key, Authorization: `Bearer ${key}` } }
    );
    const countData = await countRes.json();
    const total = countData ? countData.length : 0;

    return new Response(
      JSON.stringify({ total, page, limit, totalPages: Math.ceil(total / limit), data: data || [] }),
      { headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
}

// ==================== ADMIN SUBMISSIONS API ====================
async function handleAdminSubmissions(context) {
  const { request, env } = context;
  if (!(await verifyAuth(request, env))) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }

  try {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const status = url.searchParams.get('status');
    const websiteId = url.searchParams.get('website_id') || 'zxqconsulting';
    const offset = (page - 1) * limit;

    const key = env.SUPABASE_SERVICE_KEY || env.SUPABASE_ANON_KEY;

    let query = `submissions?website_id=eq.${websiteId}&order=created_at.desc&offset=${offset}&limit=${limit}`;
    if (status) query = `submissions?website_id=eq.${websiteId}&status=eq.${status}&order=created_at.desc&offset=${offset}&limit=${limit}`;

    const res = await fetch(`${env.SUPABASE_URL}/rest/v1/${query}`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
    });
    const data = await res.json();

    let countQuery = `submissions?website_id=eq.${websiteId}&select=id`;
    if (status) countQuery = `submissions?website_id=eq.${websiteId}&status=eq.${status}&select=id`;

    const countRes = await fetch(`${env.SUPABASE_URL}/rest/v1/${countQuery}`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
    });
    const countData = await countRes.json();
    const total = countData ? countData.length : 0;

    return new Response(
      JSON.stringify({ total, page, limit, totalPages: Math.ceil(total / limit), data: data || [] }),
      { headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
}

// ==================== AI BATCH API ====================
async function handleAIBatch(context) {
  const { request, env } = context;

  const apiKey = env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ success: false, error: 'AI service not configured' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }

  try {
    const body = await request.json();
    const { market, marketEn, category, categoryEn, region, priority } = body;

    if (!market || !category) {
      return new Response(JSON.stringify({ success: false, error: 'market and category required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    const toolTypes = priority === 'feasibility' ? ['feasibility'] : ['feasibility', 'cost', 'compliance', 'insight', 'channel', 'risk'];

    const promptTemplates = {
      feasibility: `请作为中医药/健康产品出海市场分析专家，提供${market}(${marketEn})市场对于${category}(${categoryEn})产品的市场准入可行性分析。请返回JSON格式的数据，包含以下字段：{"heat": 0-100,"growth": 0-100,"risk": "low"|"medium"|"high","competition": 0-100,"recommendation": "中文推荐","recommendationEn": "En rec","conclusion": "中文总结","conclusionEn": "En summary","policyPoints": "政策要点","policyPointsEn": "Policy","threshold": "准入门槛","thresholdEn": "Threshold","logistics": "物流要点","logisticsEn": "Logistics","caseStudies": "案例","caseStudiesEn": "Cases"}只返回JSON。`,
      cost: `请作为成本测算专家，提供${market}市场对于${category}产品的成本测算。请返回JSON格式：{"items": [{"name": "项","nameEn":"Item","min": 1000,"max": 5000,"description":"说明","descriptionEn":"Desc"}],"timeline": {"months": 12,"phases": ["阶段1"],"phasesEn": ["Phase 1"]},"roi": {"expected": 20,"payback":"12个月","paybackEn":"12 months"}}只返回JSON。`,
      compliance: `请作为合规专家，提供${market}市场对于${category}产品的合规评估。请返回JSON格式：{"status": "passed","score": 85,"requirements": ["要求1"],"requirementsEn": ["Req 1"],"documents": ["文件1"],"documentsEn": ["Doc 1"],"timeline": "时间线","timelineEn":"Timeline","warnings": ["警告1"],"warningsEn": ["Warning 1"],"tips": ["建议1"],"tipsEn": ["Tip 1"]}只返回JSON。`,
      insight: `请作为市场洞察专家，提供${market}市场对于${category}产品的洞察。请返回JSON格式：{"marketSize": "约50亿美元","growth": 15,"ageGroups": [{"range": "18-25岁","rangeEn": "18-25","percentage": 20}],"channels": [{"name": "线上电商","nameEn": "Online","percentage": 45}],"competitors": [{"name": "品牌A","nameEn": "Brand A","share": 25}],"trends": ["趋势1"],"trendsEn": ["Trend 1"],"consumerInsights": "洞察","consumerInsightsEn": "Insights"}只返回JSON。`,
      channel: `请作为渠道专家，提供${market}市场对于${category}产品的渠道推荐。请返回JSON格式：{"channels": [{"name": "电商","nameEn": "E-commerce","type": "online","rating": 85,"investment": {"min": 10000,"max": 50000},"pros": ["优势1"],"prosEn": ["Pro 1"],"cons": ["劣势1"],"consEn": ["Con 1"],"description": "描述","descriptionEn": "Desc"}],"recommendation": "推荐","recommendationEn": "Rec"}只返回JSON。`,
      risk: `请作为风险管理专家，提供${market}市场对于${category}产品的风险预警。请返回JSON格式：{"level": "medium","score": 45,"factors": [{"name": "风险","nameEn": "Risk","impact": "negative","description": "描述","descriptionEn": "Desc"}],"warnings": ["警告1"],"warningsEn": ["Warning 1"],"mitigations": ["缓解1"],"mitigationsEn": ["Mitigation 1"],"trend": "stable"}只返回JSON。`,
    };

    if (priority === 'feasibility') {
      const response = await fetchWithRetry('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            { role: 'system', content: '你是专业的国际贸易咨询专家。请严格按照JSON格式返回数据。' },
            { role: 'user', content: promptTemplates.feasibility },
          ],
          temperature: 0.7,
          max_tokens: 2048,
        }),
      });

      if (!response.ok) {
        return new Response(JSON.stringify({ success: false, error: 'AI service error', status: response.status }), {
          status: response.status,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || '';
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : {};

      return new Response(JSON.stringify({ success: true, data: { feasibility: parsed } }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    const toolPromises = toolTypes.map(async (toolType) => {
      const response = await fetchWithRetry('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            { role: 'system', content: '你是专业的国际贸易咨询专家。请严格按照JSON格式返回数据。' },
            { role: 'user', content: promptTemplates[toolType] },
          ],
          temperature: 0.7,
          max_tokens: 2048,
        }),
      });

      if (!response.ok) return { toolType, data: null };

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || '';
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      return { toolType, data: jsonMatch ? JSON.parse(jsonMatch[0]) : null };
    });

    const results = await Promise.all(toolPromises);
    const data = {};
    results.forEach(({ toolType, data: toolData }) => {
      if (toolData) data[toolType] = toolData;
    });

    return new Response(JSON.stringify({ success: true, data }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
}

async function fetchWithRetry(url, options, retries = 2) {
  for (let i = 0; i <= retries; i++) {
    try {
      const res = await fetch(url, options);
      if (res.ok || i === retries) return res;
      await new Promise((r) => setTimeout(r, 500 * (i + 1)));
    } catch (e) {
      if (i === retries) throw e;
      await new Promise((r) => setTimeout(r, 500 * (i + 1)));
    }
  }
}

// ==================== AI MARKETING CONTENT API ====================
async function handleAIMarketing(context) {
  const { request, env } = context;

  const apiKey = env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ success: false, error: 'AI service not configured' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }

  try {
    const body = await request.json();
    const { market, category, productName, tone = 'professional' } = body;

    if (!market || !category) {
      return new Response(JSON.stringify({ success: false, error: 'market and category required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    const toneDesc = {
      professional: '专业严谨',
      friendly: '亲切友好',
      luxury: '高端奢华',
      casual: '轻松随意',
    };

    const systemPrompt = '你是专业的国际贸易营销文案专家。请严格按照JSON格式返回数据。';
    const userPrompt = `请为${productName || category}产品在${market}市场生成营销文案，语气风格要求${toneDesc[tone] || '专业严谨'}。请返回JSON格式：{"social": {"zh": "中文社交媒体文案","en": "English social media post"},"article": {"zh": "中文文章","en": "English article"},"email": {"zh": "中文邮件","en": "English email"},"ad": {"zh": "中文广告语","en": "English ad copy"},"hashtag": {"zh": "#标签1 #标签2","en": "#Tag1 #Tag2"}}只返回JSON。`;

    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.8,
        max_tokens: 2048,
      }),
    });

    if (!response.ok) {
      return new Response(JSON.stringify({ success: false, error: 'AI service error' }), {
        status: response.status,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : {};

    return new Response(JSON.stringify({ success: true, data: parsed }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
}

// ==================== ANALYTICS API ====================
async function handleAnalytics(context) {
  const { request, env } = context;

  try {
    const url = new URL(request.url);
    const websiteId = url.searchParams.get('website_id') || 'zxqconsulting';
    const days = parseInt(url.searchParams.get('days') || '30');

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const key = env.SUPABASE_SERVICE_KEY || env.SUPABASE_ANON_KEY;

    if (!env.SUPABASE_URL || !key) {
      return new Response(
        JSON.stringify({ pageViews: 0, uniqueVisitors: 0, submissions: 0, topPages: [], topCountries: [], recentEvents: [] }),
        { headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    const behaviorsRes = await fetch(
      `${env.SUPABASE_URL}/rest/v1/behaviors?website_id=eq.${websiteId}&created_at=gte.${startDate.toISOString()}&select=*`,
      { headers: { apikey: key, Authorization: `Bearer ${key}` } }
    );
    const behaviors = behaviorsRes.ok ? await behaviorsRes.json() : [];

    const submissionsRes = await fetch(
      `${env.SUPABASE_URL}/rest/v1/submissions?website_id=eq.${websiteId}&created_at=gte.${startDate.toISOString()}&select=id`,
      { headers: { apikey: key, Authorization: `Bearer ${key}` } }
    );
    const submissions = submissionsRes.ok ? await submissionsRes.json() : [];

    const uniqueVisitors = behaviors ? [...new Set(behaviors.map((v) => v.visitor_id))].length : 0;

    const pageCounts = {};
    behaviors.forEach((b) => {
      const page = b.page_url || '/';
      pageCounts[page] = (pageCounts[page] || 0) + 1;
    });
    const topPages = Object.entries(pageCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([page, count]) => ({ page, count }));

    const countryCounts = {};
    behaviors.forEach((b) => {
      if (b.country) countryCounts[b.country] = (countryCounts[b.country] || 0) + 1;
    });
    const topCountries = Object.entries(countryCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([country, count]) => ({ country, count }));

    return new Response(
      JSON.stringify({
        pageViews: behaviors ? behaviors.length : 0,
        uniqueVisitors,
        submissions: submissions ? submissions.length : 0,
        topPages,
        topCountries,
        recentEvents: [],
      }),
      { headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
}

// ==================== COMMENTS API ====================
// Comments are now served directly by zxqconsulting-api worker
// which uses D1 database zxqconsulting_comments
async function handleCommentsGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const sort = url.searchParams.get('sort') || 'latest';

  // Call the dedicated zxqconsulting-api worker
  const apiUrl = `https://zxqconsulting.com/api/comments?sort=${sort}`;

  try {
    const res = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });
    const data = await res.json();
    return new Response(JSON.stringify(data), {
      status: res.status,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', ...corsHeaders },
    });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
}

async function handleCommentsPost(context) {
  const { request, env } = context;

  try {
    const body = await request.json();
    const res = await fetch('https://zxqconsulting.com/api/comments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return new Response(JSON.stringify(data), {
      status: res.status,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
}

async function handleCommentsLike(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const match = url.pathname.match(/^\/api\/comments\/([^/]+)\/like$/);
  if (!match) {
    return new Response(JSON.stringify({ error: 'Not found' }), { status: 404, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
  }
  const commentId = match[1];

  try {
    const body = await request.json().catch(() => ({}));
    const res = await fetch(`https://zxqconsulting.com/api/comments/${commentId}/like`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return new Response(JSON.stringify(data), {
      status: res.status,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
}

// ==================== MAIN HANDLER ====================
export async function onRequest(context) {
  const { request, env } = context;
  const { url, method } = request;
  const path = new URL(url).pathname;

  if (method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (path.startsWith('/api/')) {
    try {
      if (path === '/api/track/page' && method === 'POST') return await handleTrackPage(context);
      if (path === '/api/track' && method === 'POST') return await handleTrack(context);
      if (path === '/api/tracking' && method === 'POST') return await handleTrack(context);
      if (path === '/api/track/event' && method === 'POST') return await handleTrack(context);
      if (path === '/api/ai/chat' && method === 'POST') return await handleAIChat(context);
      if (path === '/api/visitors' && method === 'PUT') return await handleVisitorsPut(context);
      if (path === '/api/contact' && method === 'POST') return await handleContact(context);
      if (path === '/api/admin/analytics' && method === 'GET') return await handleAdminAnalytics(context);
      if (path === '/api/admin/visitors' && method === 'GET') return await handleAdminVisitors(context);
      if (path === '/api/admin/submissions' && method === 'GET') return await handleAdminSubmissions(context);
      if (path === '/api/ai/batch' && method === 'POST') return await handleAIBatch(context);
      if (path === '/api/ai/marketing' && method === 'POST') return await handleAIMarketing(context);
      if (path === '/api/analytics' && method === 'GET') return await handleAnalytics(context);
      if (path === '/api/comments' && method === 'GET') return await handleCommentsGet(context);
      if (path === '/api/comments' && method === 'POST') return await handleCommentsPost(context);
      if (path.match(/^\/api\/comments\/[^/]+\/like$/) && method === 'PUT') return await handleCommentsLike(context);

      return new Response(JSON.stringify({ error: 'Not found', path, method }), {
        status: 404,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }
  }

  // Non-API paths: serve static files via the built-in ASSETS binding.
  // context.env.ASSETS is a built-in CF Pages binding that returns
  // the deployed static file (same as when no worker is present).
  return context.env.ASSETS.fetch(request);
}

export async function onRequestError(context) {
  return new Response('Internal Server Error', { status: 500 });
}
