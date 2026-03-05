/**
 * 获取表单提交列表 API
 * GET /api/admin/submissions
 * 
 * 获取所有联系表单提交列表，支持分页和搜索
 */

const ADMIN_API_KEY = 'zxq_admin_secret_key_2024';

async function verifyAuth(request) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false;
  }
  const token = authHeader.substring(7);
  return token === ADMIN_API_KEY;
}

export async function onRequestGet(context) {
  const { env, request } = context;
  
  const isAuth = await verifyAuth(request);
  if (!isAuth) {
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
    const status = url.searchParams.get('status');
    const dateFrom = url.searchParams.get('date_from');
    const dateTo = url.searchParams.get('date_to');
    const offset = (page - 1) * limit;
    
    const DB = env.DB;
    
    if (!DB) {
      return new Response(JSON.stringify({
        total: 0,
        page,
        limit,
        data: []
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    let whereClause = 'WHERE 1=1';
    const params: any[] = [];
    
    if (search) {
      whereClause += ` AND (name LIKE ? OR email LIKE ? OR phone LIKE ? OR company LIKE ?)`;
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }
    
    if (status) {
      whereClause += ' AND status = ?';
      params.push(status);
    }
    
    if (dateFrom) {
      whereClause += ' AND date(created_at) >= ?';
      params.push(dateFrom);
    }
    
    if (dateTo) {
      whereClause += ' AND date(created_at) <= ?';
      params.push(dateTo);
    }
    
    const countResult = await DB.prepare(
      `SELECT COUNT(*) as total FROM submissions ${whereClause}`
    ).bind(...params).first();
    const total = countResult?.total || 0;
    
    const data = await DB.prepare(`
      SELECT id, visitor_id, name, email, phone, company, message,
             product_interest, source_page, country, status, created_at
      FROM submissions 
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `).bind(...params, limit, offset).all();
    
    return new Response(JSON.stringify({
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      data: data.results || []
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Get Submissions API error:', error);
    return new Response(JSON.stringify({
      error: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

/**
 * 更新表单状态 API
 * PATCH /api/admin/submissions/:id
 */
export async function onRequestPatch(context) {
  const { env, params } = context;
  
  const isAuth = await verifyAuth(context.request);
  if (!isAuth) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const { id } = params;
    const body = await context.request.json();
    const { status, notes, assigned_to } = body;
    
    const DB = env.DB;
    
    if (!DB) {
      return new Response(JSON.stringify({ error: 'Database not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    await DB.prepare(`
      UPDATE submissions 
      SET status = ?, notes = ?, assigned_to = ?, updated_at = datetime("now")
      WHERE id = ?
    `).bind(status, notes || null, assigned_to || null, id).run();
    
    return new Response(JSON.stringify({
      success: true,
      message: '状态已更新'
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Update Submission API error:', error);
    return new Response(JSON.stringify({
      error: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
