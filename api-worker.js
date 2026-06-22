/**
 * zxqconsulting-api — Complete API for zxqconsulting.com
 * - D1-backed comment system with auto AI replies
 * - Daily seeder via Workers cron trigger (0 8 * * *)
 */

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, Accept, Origin',
  'Access-Control-Max-Age': '86400',
};

const ok = (data, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
const err = (msg, status = 500) =>
  new Response(JSON.stringify({ error: msg }), { status, headers: { 'Content-Type': 'application/json', ...corsHeaders } });

// ─── Utility ───────────────────────────────────────────────────────────────────

function uuid4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
}

function stripMarkdown(text) {
  if (!text) return '';
  return text
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/`(.+?)`/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^[-*_]{3,}\s*$/gm, '')
    .replace(/^>\s+/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function detectLang(text) {
  const chinese = (text || '').match(/[\u4e00-\u9fff]/g) || [];
  return chinese.length / Math.max((text || '').length, 1) > 0.3 ? 'zh' : 'en';
}

function getClientIp(request) {
  return request.headers.get('cf-connecting-ip') ||
    request.headers.get('x-real-ip') ||
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() || '';
}

function getGeoFromCf(request) {
  return {
    country: request.headers.get('cf-ipcountry') || '',
    region: request.headers.get('cf-region') || '',
    city: request.headers.get('cf-ipcity') || '',
  };
}

// ─── AI Agents & Prompts ─────────────────────────────────────────────────────

const AI_AGENTS = [
  { id: 'consultant', name: '商务顾问', nameEn: 'Business Consultant', emoji: '💼',
    role: '外贸进出口 · 商务谈判 · 合作撮合',
    gradient: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' },
  { id: 'legal', name: '法律顾问', nameEn: 'Legal Advisor', emoji: '⚖️',
    role: '知识产权 · 合同审核 · 合规咨询',
    gradient: 'linear-gradient(135deg, #10b981, #06b6d4)' },
  { id: 'finance', name: '财税顾问', nameEn: 'Finance Advisor', emoji: '💰',
    role: '进出口税务 · 外汇管理 · 成本优化',
    gradient: 'linear-gradient(135deg, #f59e0b, #ef4444)' },
  { id: 'logistics', name: '物流顾问', nameEn: 'Logistics Advisor', emoji: '🚢',
    role: '国际物流 · 清关报关 · 仓储配送',
    gradient: 'linear-gradient(135deg, #06b6d4, #3b82f6)' },
];

const AGENT_PROMPTS = {
  consultant: {
    zh: `你是一位专业的外贸进出口商务顾问，拥有10年+国际商务经验，精通多语言商务谈判，善于帮助企业拓展海外市场、寻找合作伙伴、撮合贸易机会。你的回答应该专业、具体、可操作，包含数据和案例支持。禁止使用任何Markdown格式字符（**加粗**、## 标题、--- 分割线、*斜体*等），请用纯文本直接回复，每个要点单独成段即可。语言风格：专业但亲切，避免空话套话。`,
    en: `You are a professional international trade and business consultant with 10+ years of experience. You excel at cross-cultural business negotiations, market expansion strategies, and partnership facilitation. Provide specific, data-driven, actionable advice. Never use any Markdown formatting — write in clean plain text paragraphs only. Be professional yet approachable.`,
  },
  legal: {
    zh: `你是一位专业的外贸法律顾问，精通中国对外贸易法、国际商法、知识产权保护、合同法等。擅长帮助企业识别合同风险，保护知识产权、解决跨境贸易纠纷。禁止使用任何Markdown格式字符，请用纯文本段落直接回复，每个要点单独成段即可。语言严谨专业。`,
    en: `You are a professional legal advisor specializing in international trade law, intellectual property protection, contract law, and cross-border dispute resolution. Never use any Markdown formatting — write in clean plain text paragraphs only.`,
  },
  finance: {
    zh: `你是一位专业的进出口财税顾问，精通国际贸易结算、外汇管理、出口退税、跨境税务筹划。禁止使用Markdown格式字符，用纯文本直接回复，每个要点单独成段即可。`,
    en: `You are a professional import/export finance and tax advisor. Never use Markdown formatting — write in clean plain text paragraphs only.`,
  },
  logistics: {
    zh: `你是一位专业的国际物流与供应链顾问，精通海运、空运、多式联运、跨境仓储、清关报关等全链路物流服务。禁止使用Markdown格式字符，用纯文本直接回复，每个要点单独成段即可。`,
    en: `You are a professional international logistics and supply chain advisor. Never use Markdown formatting — write in clean plain text paragraphs only.`,
  },
};

function selectAgentForContent(content) {
  const lower = (content || '').toLowerCase();
  const keywords = {
    legal: ['法律', '合同', '诉讼', '仲裁', '商标', '专利', '版权', '合规', 'law', 'contract', 'legal', 'trademark', 'patent', 'dispute', 'compliance', 'claim', 'registration'],
    finance: ['税', '关税', '增值税', '退税', '外汇', '财务', '成本', 'tax', 'tariff', 'vat', 'cost', 'price', 'budget', 'refund', 'currency', 'rebate'],
    logistics: ['物流', '运输', '海运', '空运', '清关', '报关', 'shipping', 'freight', 'logistics', 'delivery', 'customs', 'clearance', 'warehouse', 'cargo', 'container', 'cold chain'],
  };
  let best = 'consultant', bestScore = 0;
  for (const [agentId, words] of Object.entries(keywords)) {
    const score = words.filter(w => lower.includes(w)).length;
    if (score > bestScore) { bestScore = score; best = agentId; }
  }
  return best;
}

// ─── DeepSeek AI Reply ─────────────────────────────────────────────────────────

async function callDeepSeek(apiKey, systemPrompt, userContent) {
  if (!apiKey) return null;
  try {
    const upstream = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userContent },
        ],
        max_tokens: 600,
        temperature: 0.65,
        top_p: 0.9,
      }),
    });
    if (!upstream.ok) return null;
    const data = await upstream.json();
    return (data.choices || [])[0]?.message?.content || '';
  } catch { return null; }
}

// ─── Daily Seeder Q&A Library ─────────────────────────────────────────────────

const SEED_QA_LIBRARY = [
  { q: '我们是一家广东的中药饮片厂，想把黄芪、党参等品种出口到日本市场，请问需要哪些认证？', agent: 'legal', geo: { country: 'CN', region: '广东', city: '广州' }, name: '林厂长', lang: 'zh' },
  { q: 'We are an American importer looking to bring high quality TCM herbal supplements into the US market. What FDA compliance steps do we need for products containing ginseng and reishi?', agent: 'consultant', geo: { country: 'US', region: 'California', city: 'Los Angeles' }, name: 'Michael Chen', lang: 'en' },
  { q: '请问保健食品出口到美国需要什么资质？我们的产品主要含有灵芝和虫草提取物。', agent: 'legal', geo: { country: 'CN', region: '上海', city: '上海' }, name: '王博士', lang: 'zh' },
  { q: 'Wir importieren chinesische Kräuterextrakte für Nahrungsergänzungsmittel nach Deutschland. Was sind die aktuellen EU-Novel-Food-Bestimmungen für Produkte mit Ginseng und Goji?', agent: 'consultant', geo: { country: 'DE', region: 'Bayern', city: 'München' }, name: 'Hans Mueller', lang: 'en' },
  { q: 'We want to import TCM herbal products into Australia for health food stores. What TGA requirements apply to listed medicines with Chinese herbal ingredients?', agent: 'consultant', geo: { country: 'AU', region: 'New South Wales', city: 'Sydney' }, name: 'Emma Thompson', lang: 'en' },
  { q: '我们想把中药配方颗粒出口到东南亚，特别是新加坡和马来西亚，华人市场为主。', agent: 'consultant', geo: { country: 'CN', region: '四川', city: '成都' }, name: '李经理', lang: 'zh' },
  { q: 'We are a UAE-based pharmaceutical distributor exploring TCM/health supplements for the GCC market. What regulatory requirements apply in the UAE and Saudi Arabia?', agent: 'legal', geo: { country: 'AE', region: 'Dubai', city: 'Dubai' }, name: 'Ahmed Al-Rashid', lang: 'en' },
  { q: '请问中医药出口的关税政策如何？特别是出口到RCEP成员国的税率优惠有哪些？', agent: 'finance', geo: { country: 'CN', region: '浙江', city: '杭州' }, name: '陈财务', lang: 'zh' },
  { q: 'We want to import Chinese patent medicines for a chain of TCM clinics in the US. What import permits and FDA registrations are required?', agent: 'legal', geo: { country: 'US', region: 'New York', city: 'New York' }, name: 'Dr. Sarah Wu', lang: 'en' },
  { q: '中药提取物出口物流走海运好还是空运好？考虑到活性成分稳定性问题。', agent: 'logistics', geo: { country: 'CN', region: '山东', city: '济南' }, name: '刘经理', lang: 'zh' },
  { q: 'We are a Malaysian company looking to distribute TCM health supplements. What are the NPCB regulations and import procedures for Chinese herbal products?', agent: 'consultant', geo: { country: 'MY', region: 'Selangor', city: 'Shah Alam' }, name: 'Lim Wei Jie', lang: 'en' },
  { q: '中国から健康食品チェーンに漢方を輸入したいですが、必要な規制手続きを教えてください。', agent: 'consultant', geo: { country: 'JP', region: '東京都', city: '東京' }, name: '田中太郎', lang: 'zh' },
  { q: '我们是四川的一家火锅底料和中药材出口商，想把当归、枸杞子出口到北美华人超市，请问FDA和海关的流程是怎样的？', agent: 'legal', geo: { country: 'CN', region: '四川', city: '成都' }, name: '张老板', lang: 'zh' },
  { q: 'We are a Brazilian import company interested in distributing Chinese herbal teas and TCM supplements in São Paulo. What ANVISA regulations and import documentation are required?', agent: 'legal', geo: { country: 'BR', region: 'São Paulo', city: 'São Paulo' }, name: 'Ricardo Santos', lang: 'en' },
  { q: '想咨询一下，中药产品出口到欧盟，如果走传统食品补充剂路线，大概需要多少时间和费用？和药品注册路线相比哪个更划算？', agent: 'finance', geo: { country: 'CN', region: '江苏', city: '苏州' }, name: '周总', lang: 'zh' },
  { q: 'We are a UK-based TCM clinic chain looking to import Chinese patent medicines and granular extracts. What MHRA licensing, import declaration and VAT implications apply?', agent: 'legal', geo: { country: 'GB', region: 'England', city: 'London' }, name: 'Dr. Wei Zhang', lang: 'en' },
  { q: '我们的中药配方颗粒在日本申请的一般用医药品认证被拒了，审查意见说临床数据不足。请问有什么补救方案？', agent: 'legal', geo: { country: 'CN', region: '北京', city: '北京' }, name: '李医师', lang: 'zh' },
  { q: '中医药品出口到韩国需要做哪些检测？KFDA认证的大概周期和费用是多少？', agent: 'finance', geo: { country: 'CN', region: '吉林', city: '长春' }, name: '崔经理', lang: 'zh' },
  { q: 'We are an Indonesian distributor exploring distribution rights for TCM health supplements in Jakarta and Bali. What BPOM registration process and timelines should we expect?', agent: 'consultant', geo: { country: 'ID', region: 'DKI Jakarta', city: 'Jakarta' }, name: 'Budi Santoso', lang: 'en' },
  { q: '请问中医药出口包装有什么特殊要求？目标市场对中药包装的标签和说明书有什么规定？', agent: 'logistics', geo: { country: 'CN', region: '安徽', city: '亳州' }, name: '王工', lang: 'zh' },
  { q: '我们是海南的热带植物提取物出口商，想把石斛、沉香提取物出口到法国和意大利，有什么特殊的植物药规定吗？', agent: 'legal', geo: { country: 'CN', region: '海南', city: '海口' }, name: '陈总', lang: 'zh' },
  { q: 'We are a Thai distributor looking to import Chinese TCM herbal products for modern clinic chains in Bangkok and Chiang Mai. What Thai FDA (TFDA) product registration and labeling requirements apply?', agent: 'legal', geo: { country: 'TH', region: 'Bangkok', city: 'Bangkok' }, name: 'Niran Kittisak', lang: 'en' },
  { q: '请问中医药出口跨境电商平台（如亚马逊全球开店、TikTok Shop）有哪些合规要点需要特别注意？', agent: 'consultant', geo: { country: 'CN', region: '浙江', city: '杭州' }, name: '刘总', lang: 'zh' },
  { q: '我们是做中药保健酒的工厂，想出口到东南亚和澳大利亚，酒类出口和普通食品出口的法规有什么不同？', agent: 'legal', geo: { country: 'CN', region: '四川', city: '泸州' }, name: '李厂长', lang: 'zh' },
];

// ─── Comment Handlers ─────────────────────────────────────────────────────────

async function handleCommentsGet(request, env) {
  if (!env.zxqconsulting_comments) {
    return ok({ success: true, comments: [], total: 0 });
  }
  const url = new URL(request.url);
  const sort = url.searchParams.get('sort') || 'latest';
  const order = sort === 'popular' ? 'likes DESC' : 'timestamp DESC';

  try {
    const results = await env.zxqconsulting_comments
      .prepare(`SELECT id, user_name, user_email, content, timestamp, likes, liked_by, replies, status, geo_country, geo_region, geo_city, lang FROM comments WHERE status = 'approved' ORDER BY ${order} LIMIT 100`)
      .all();
    return ok({ success: true, comments: results.results || [], total: results.results?.length || 0 });
  } catch (e) {
    return ok({ success: true, comments: [], total: 0, _error: e.message });
  }
}

async function handleCommentsPost(request, env, ctx) {
  if (!env.zxqconsulting_comments) return err('Database not configured', 503);
  try {
    const body = await request.json();
    if (!body.content?.trim()) return err('Content is required', 400);
    if (body.content.length > 2000) return err('Content too long (max 2000 chars)', 400);

    const geo = getGeoFromCf(request);
    const lang = detectLang(body.content);
    const id = uuid4();
    const timestamp = new Date().toISOString();
    const userName = (body.user_name || '').trim().slice(0, 50) || '游客';

    await env.zxqconsulting_comments
      .prepare(`INSERT INTO comments (id, user_name, user_email, content, timestamp, likes, liked_by, replies, status, geo_country, geo_region, geo_city, lang)
                VALUES (?, ?, ?, ?, ?, 0, '[]', '[]', 'approved', ?, ?, ?, ?)`)
      .bind(id, userName, (body.user_email || '').trim().slice(0, 100), body.content.trim(), timestamp, geo.country, geo.region, geo.city, lang)
      .run();

    if (env.DEEPSEEK_API_KEY) {
      ctx.waitUntil(triggerAiReply(env, id, body.content, lang));
    }

    return ok({ success: true, id, timestamp }, 201);
  } catch (e) { return err(e.message, 500); }
}

async function handleCommentsLike(request, env) {
  if (!env.zxqconsulting_comments) return err('Database not configured', 503);
  const url = new URL(request.url);
  const id = url.searchParams.get('id');
  if (!id) return err('Missing comment id', 400);

  const ip = getClientIp(request);
  const userId = `guest_${ip.replace(/[^a-z0-9]/gi, '').slice(-8) || 'anon'}`;

  try {
    const row = await env.zxqconsulting_comments.prepare('SELECT * FROM comments WHERE id = ?').bind(id).first();
    if (!row) return err('Not found', 404);

    const likedBy = JSON.parse(row.liked_by || '[]');
    const idx = likedBy.indexOf(userId);
    if (idx >= 0) likedBy.splice(idx, 1);
    else likedBy.push(userId);
    const newLikes = row.likes + (idx >= 0 ? -1 : 1);

    await env.zxqconsulting_comments
      .prepare('UPDATE comments SET likes = ?, liked_by = ? WHERE id = ?')
      .bind(newLikes, JSON.stringify(likedBy), id)
      .run();

    return ok({ success: true, liked: idx < 0, likes: newLikes });
  } catch (e) { return err(e.message, 500); }
}

async function triggerAiReply(env, commentId, content, lang) {
  const apiKey = env.DEEPSEEK_API_KEY;
  if (!apiKey) return;
  const agentId = selectAgentForContent(content);
  const agent = AI_AGENTS.find(a => a.id === agentId) || AI_AGENTS[0];
  const prompts = AGENT_PROMPTS[agentId] || AGENT_PROMPTS.consultant;
  const systemPrompt = lang === 'en' ? prompts.en : prompts.zh;

  const replyContent = await callDeepSeek(apiKey, systemPrompt, content);
  if (!replyContent) return;

  const reply = {
    id: uuid4(),
    user_name: lang === 'en' ? agent.nameEn : agent.name,
    user_emoji: agent.emoji,
    user_gradient: agent.gradient,
    user_role: agent.role,
    is_agent: true,
    agent_id: agent.id,
    content: stripMarkdown(replyContent),
    timestamp: Date.now(),
    is_admin: false,
    is_system: false,
  };

  try {
    const row = await env.zxqconsulting_comments.prepare('SELECT replies FROM comments WHERE id = ?').bind(commentId).first();
    if (row) {
      const existing = JSON.parse(row.replies || '[]');
      existing.unshift(reply);
      await env.zxqconsulting_comments.prepare('UPDATE comments SET replies = ? WHERE id = ?').bind(JSON.stringify(existing), commentId).run();
    }
  } catch (e) {}
}

// ─── Daily Seeder ─────────────────────────────────────────────────────────────

async function runDailySeeder(env) {
  if (!env.zxqconsulting_comments || !env.DEEPSEEK_API_KEY) return;
  const today = new Date().toISOString().slice(0, 10);

  try {
    const existing = await env.zxqconsulting_comments.prepare('SELECT count FROM seed_log WHERE date = ?').bind(today).first();
    if (existing) return;
  } catch {}

  const count = 4 + Math.floor(Math.random() * 3);
  const shuffled = [...SEED_QA_LIBRARY].sort(() => Math.random() - 0.5).slice(0, count);
  const now = Date.now();
  const maxAge = 8 * 60 * 60 * 1000;

  for (let i = 0; i < shuffled.length; i++) {
    const item = shuffled[i];
    const minutesAgo = Math.floor(Math.random() * maxAge / 60000);
    const ts = new Date(now - minutesAgo * 60000);

    const agent = AI_AGENTS.find(a => a.id === item.agent) || AI_AGENTS[0];
    const systemPrompt = (AGENT_PROMPTS[item.agent] || AGENT_PROMPTS.consultant)[item.lang === 'en' ? 'en' : 'zh'];
    const replyContent = await callDeepSeek(env.DEEPSEEK_API_KEY, systemPrompt, item.q);

    const commentId = uuid4();
    const timestamp = ts.toISOString();

    const reply = replyContent ? {
      id: uuid4(),
      user_name: item.lang === 'en' ? agent.nameEn : agent.name,
      user_emoji: agent.emoji,
      user_gradient: agent.gradient,
      user_role: agent.role,
      is_agent: true,
      agent_id: agent.id,
      content: stripMarkdown(replyContent),
      timestamp: now - (minutesAgo - 2) * 60000,
      is_admin: false,
      is_system: false,
    } : null;

    try {
      await env.zxqconsulting_comments.prepare(`INSERT INTO comments (id, user_name, user_email, content, timestamp, likes, liked_by, replies, status, geo_country, geo_region, geo_city, lang) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'approved', ?, ?, ?, ?)`)
        .bind(commentId, item.name, '', item.q, timestamp, Math.floor(Math.random() * 30) + 3, JSON.stringify([]),
              reply ? JSON.stringify([reply]) : '[]', item.geo.country, item.geo.region, item.geo.city, item.lang).run();
    } catch (e) {}
  }

  try {
    await env.zxqconsulting_comments.prepare('INSERT INTO seed_log (date, count) VALUES (?, ?)').bind(today, count).run();
  } catch (e) {}
}

// ─── Track API ────────────────────────────────────────────────────────────────

async function handleTrackPage(request) {
  try {
    const body = await request.json();
    const { visitorId, visitor_id, sessionId, session_id, path, page_url } = body;
    const v = visitorId || visitor_id || `v_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const s = sessionId || session_id || `s_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    return ok({ success: true, visitor_id: v, session_id: s, page: path || page_url || '/' });
  } catch (e) { return err(e.message, 500); }
}

async function handleTrackEvent(request) {
  try {
    const body = await request.json();
    return ok({ success: true, visitor_id: body.visitor_id || '', session_id: body.session_id || '', event_type: body.event_type || '' });
  } catch (e) { return err(e.message, 500); }
}

// ─── Main Router ───────────────────────────────────────────────────────────────

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    if (method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders });

    if (path === '/api/comments') {
      if (method === 'GET') return await handleCommentsGet(request, env);
      if (method === 'POST') return await handleCommentsPost(request, env, ctx);
    }

    const likeMatch = path.match(/^\/api\/comments\/([^/]+)\/like$/);
    if (likeMatch && method === 'PUT') {
      return await handleCommentsLike(new Request(`${request.url.split('?')[0]}?id=${likeMatch[1]}`, request), env);
    }

    // Admin: inject AI reply directly into a comment
    if (path === '/api/admin/inject-reply' && method === 'POST') {
      if (!env.zxqconsulting_comments) return err('DB not configured', 503);
      try {
        const { commentId, reply } = await request.json();
        if (!commentId || !reply) return err('commentId and reply required', 400);
        const row = await env.zxqconsulting_comments.prepare('SELECT replies FROM comments WHERE id = ?').bind(commentId).first();
        if (!row) return err('Comment not found', 404);
        const existing = JSON.parse(row.replies || '[]');
        existing.unshift(reply);
        await env.zxqconsulting_comments.prepare('UPDATE comments SET replies = ? WHERE id = ?').bind(JSON.stringify(existing), commentId).run();
        return ok({ success: true, commentId, replyId: reply.id });
      } catch (e) { return err(e.message, 500); }
    }

    if (method === 'POST') {
      if (path === '/api/track/page') return await handleTrackPage(request);
      if (path === '/api/track/event') return await handleTrackEvent(request);
      if (path === '/api/tracking') return await handleTrackEvent(request);
    }

    if (path === '/api/contact' && method === 'POST') {
      try {
        const body = await request.json();
        if (!body.contact_name || !body.email || !body.message) return err('contact_name, email, and message are required', 400);
        return ok({ success: true, message: 'Thank you. We will contact you soon.' });
      } catch (e) { return err(e.message, 500); }
    }

    return err('Not found', 404);
  },

  async scheduled(event, env, ctx) {
    await runDailySeeder(env);
  },
};
