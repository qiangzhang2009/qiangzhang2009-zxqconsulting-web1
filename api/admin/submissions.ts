// Vercel API Route — Admin Submissions API
// GET /api/admin/submissions?page=1&limit=20&status=&search=&website_id=zxqconsulting
// PATCH /api/admin/submissions?id=:id — update status/notes

export const config = { runtime: 'edge' };

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'zxq@qq.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'zxq2026';

function auth(request: Request): Response | null {
  const header = request.headers.get('Authorization');
  if (!header?.startsWith('Bearer ')) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  const decoded = atob(header.substring(7));
  const [email, password] = decoded.split(':');
  if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
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
    'Access-Control-Allow-Methods': 'GET, PATCH, OPTIONS',
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

  const websiteId = url.searchParams.get('website_id') || 'zxqconsulting';
  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '20'), 100);
  const offset = (page - 1) * limit;

  try {
    // GET — list submissions
    if (request.method === 'GET') {
      const search = url.searchParams.get('search') || '';
      const status = url.searchParams.get('status') || '';

      let filter = `website_id=eq.${websiteId}`;
      if (status) filter += `&status=eq.${status}`;

      let query = `submissions?${filter}&order=created_at.desc&offset=${offset}&limit=${limit}`;
      const data = await supabase(query);
      const countData = await supabase(`submissions?${filter}&select=id`);
      const total = countData?.length || 0;

      return new Response(JSON.stringify({
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        data: data || [],
      }), { headers: cors() });
    }

    // PATCH — update submission
    if (request.method === 'PATCH') {
      const id = url.searchParams.get('id');
      if (!id) {
        return new Response(JSON.stringify({ error: 'Missing submission id' }), {
          status: 400,
          headers: cors(),
        });
      }
      const body = await request.json();
      const updateData: Record<string, string> = { updated_at: new Date().toISOString() };
      if (body.status) updateData.status = body.status;
      if (body.notes !== undefined) updateData.notes = body.notes;
      if (body.assigned_to) updateData.assigned_to = body.assigned_to;

      await supabase(`submissions?id=eq.${id}`, {
        method: 'PATCH',
        headers: { Prefer: 'return=minimal' },
        body: JSON.stringify(updateData),
      });

      return new Response(JSON.stringify({ success: true }), { headers: cors() });
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: cors(),
    });
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
