/**
 * 管理后台 API
 * GET /api/admin/visitors - 获取访客列表
 * GET /api/admin/submissions - 获取表单提交列表  
 * GET /api/admin/analytics - 获取统计数据
 * PATCH /api/admin/submissions/:id - 更新表单状态
 */

interface Env {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_KEY: string;
}

const ADMIN_API_KEY = 'zxq_admin_secret_key_2024';

async function verifyAuth(request: Request): Promise<boolean> {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false;
  }
  return authHeader.substring(7) === ADMIN_API_KEY;
}

async function supabaseFetch(env: Env, endpoint: string, options: RequestInit = {}) {
  const response = await fetch(`${env.SUPABASE_URL}/rest/v1/${endpoint}`, {
    ...options,
    headers: {
      'apikey': env.SUPABASE_SERVICE_KEY,
      'Authorization': `Bearer ${env.SUPABASE_SERVICE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': options.headers?.['Prefer'] || 'return=representation',
      ...options.headers
    }
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(error);
  }
  
  return { data: await response.json() };
}

/**
 * 获取访客列表
 * GET /api/admin/visitors?page=1&limit=20&search=&website_id=
 */
export async function onRequestGet(context: { request: Request; params: any; env: Env }) {
  const { request, env } = context;
  
  if (!await verifyAuth(request)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const search = url.searchParams.get('search') || '';
    const websiteId = url.searchParams.get('website_id') || 'zxqconsulting';
    const offset = (page - 1) * limit;
    
    // 构建查询
    let query = `visitors?website_id=eq.${websiteId}&order=created_at.desc&offset=${offset}&limit=${limit}`;
    
    if (search) {
      query = `visitors?website_id=eq.${websiteId}&or=(contact_name.ilike.*${search}*,company_name.ilike.*${search}*,phone.ilike.*${search}*)&order=created_at.desc&offset=${offset}&limit=${limit}`;
    }
    
    const { data } = await supabaseFetch(env, query);
    
    // 解析 selected_markets JSON
    const visitors = (data || []).map((v: any) => ({
      ...v,
      selected_markets: v.selected_markets ? JSON.parse(v.selected_markets) : []
    }));
    
    // 获取总数
    const countRes = await supabaseFetch(env, `visitors?website_id=eq.${websiteId}&select=id`);
    const total = countRes.data?.length || 0;
    
    return new Response(JSON.stringify({
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      data: visitors
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Get Visitors error:', error);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

/**
 * 获取表单提交列表
 * GET /api/admin/submissions?page=1&limit=20&status=&website_id=
 */
export async function onRequestPatch(context: { request: Request; params: any; env: Env }) {
  const { request, env } = context;
  
  if (!await verifyAuth(request)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const status = url.searchParams.get('status');
    const websiteId = url.searchParams.get('website_id') || 'zxqconsulting';
    const offset = (page - 1) * limit;
    
    // 构建查询
    let query = `submissions?website_id=eq.${websiteId}&order=created_at.desc&offset=${offset}&limit=${limit}`;
    
    if (status) {
      query = `submissions?website_id=eq.${websiteId}&status=eq.${status}&order=created_at.desc&offset=${offset}&limit=${limit}`;
    }
    
    const { data } = await supabaseFetch(env, query);
    
    // 获取总数
    let countQuery = `submissions?website_id=eq.${websiteId}&select=id`;
    if (status) {
      countQuery = `submissions?website_id=eq.${websiteId}&status=eq.${status}&select=id`;
    }
    const countRes = await supabaseFetch(env, countQuery);
    const total = countRes.data?.length || 0;
    
    return new Response(JSON.stringify({
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      data: data || []
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Get Submissions error:', error);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
