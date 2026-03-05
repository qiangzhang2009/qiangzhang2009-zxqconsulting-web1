/**
 * 管理后台 API 服务
 * 通过 Cloudflare Workers 调用 Supabase
 */

const API_BASE = '/api/admin';
const API_KEY = 'zxq_admin_secret_key_2024';

const WEBSITE_ID = 'zxqconsulting';

const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${API_KEY}`
};

// 获取统计数据
export async function getAnalytics(days = 30) {
  const res = await fetch(`${API_BASE}/analytics?website_id=${WEBSITE_ID}&days=${days}`, { headers });
  return res.json();
}

// 获取访客列表
export async function getVisitors(page = 1, limit = 20, search = '') {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    website_id: WEBSITE_ID
  });
  if (search) params.append('search', search);
  
  const res = await fetch(`${API_BASE}/visitors?${params}`, { headers });
  return res.json();
}

// 获取表单提交列表
export async function getSubmissions(page = 1, limit = 20, status = '') {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    website_id: WEBSITE_ID
  });
  if (status) params.append('status', status);
  
  const res = await fetch(`${API_BASE}/submissions?${params}`, { headers });
  return res.json();
}

// 更新表单状态
export async function updateSubmission(id: number, data: { status?: string; notes?: string; assigned_to?: string }) {
  const res = await fetch(`${API_BASE}/submissions/${id}?website_id=${WEBSITE_ID}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify(data)
  });
  return res.json();
}
