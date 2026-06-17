// Vercel API Route — Admin Visitors API
// GET /api/admin/visitors?page=1&limit=20&search=&website_id=zxqconsulting

export const config = { runtime: 'edge' };

const ADMIN_API_KEY = process.env.ADMIN_API_KEY || 'zxqconsulting_admin_2026';

function auth(request: Request): Response | null {
  const header = request.headers.get('Authorization');
  if (!header?.startsWith('Bearer ')) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  if (header.substring(7) !== ADMIN_API_KEY) {
    return new Response(JSON.stringify({ error: 'Forbidden' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  return null;
}

function cors() {
  return {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

async function supabase(endpoint: string, opts: RequestInit = {}) {
  const { SUPABASE_URL, SUPABASE_SERVICE_KEY } = process.env;
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    throw new Error('SUPABASE_URL or SUPABASE_SERVICE_KEY not configured');
  }
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${endpoint}`, {
    ...opts,
    headers: {
      apikey: SUPABASE_SERVICE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: opts.headers?.['Prefer'] || 'return=representation',
      ...(opts.headers || {}),
    },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export default async function handler(request: Request) {
  const url = new URL(request.url);

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: cors() });
  }

  const authError = auth(request);
  if (authError) return authError;

  if (request.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: cors(),
    });
  }

  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '20'), 100);
  const search = url.searchParams.get('search') || '';
  const websiteId = url.searchParams.get('website_id') || 'zxqconsulting';
  const offset = (page - 1) * limit;

  try {
    let query: string;
    if (search) {
      query = `visitors?website_id=eq.${websiteId}&or=(contact_name.ilike.*${search}*,company_name.ilike.*${search}*,phone.ilike.*${search}*)&order=created_at.desc&offset=${offset}&limit=${limit}`;
    } else {
      query = `visitors?website_id=eq.${websiteId}&order=created_at.desc&offset=${offset}&limit=${limit}`;
    }

    const data = await supabase(query);
    const countData = await supabase(`visitors?website_id=eq.${websiteId}&select=id`);
    const total = countData?.length || 0;

    const visitors = (data || []).map((v: any) => ({
      ...v,
      selected_markets: v.selected_markets ? JSON.parse(v.selected_markets) : [],
    }));

    return new Response(JSON.stringify({
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      data: visitors,
    }), { headers: cors() });
  } catch (err: any) {
    const isMissingEnv = err.message.includes('not configured');
    if (isMissingEnv) {
      return new Response(JSON.stringify({
        total: 0,
        page,
        limit,
        totalPages: 0,
        data: [],
        notice: 'Database not configured — configure SUPABASE_URL and SUPABASE_SERVICE_KEY in Vercel environment variables.',
      }), { headers: cors() });
    }
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: cors(),
    });
  }
}
