import { useState, useEffect, useCallback } from 'react';

// ─── Types ───────────────────────────────────────────────────────────────────

interface AnalyticsData {
  today: { visitors: number; submissions: number };
  total: { visitors: number; submissions: number; conversionRate: string };
  trend: Array<{ date: string; visitors: number; submissions: number }>;
  topPages: Array<{ page: string; views: number }>;
  topCountries: Array<{ country: string; visitors: number }>;
  recentSubmissions: Submission[];
  isRealData: boolean;
}

interface Submission {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  company: string | null;
  message: string | null;
  product_interest: string | null;
  source_page: string | null;
  country: string | null;
  status: string;
  notes?: string;
  assigned_to?: string;
  created_at: string;
}

interface VisitorsData {
  total: number;
  page: number;
  totalPages: number;
  data: any[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const API_KEY_STORAGE = 'qhs_admin_key';
const API_KEY_DEFAULT = 'zxqconsulting_admin_2026';

function apiFetch(path: string, apiKey: string) {
  return fetch(path, {
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
  }).then(r => r.json());
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('zh-CN', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

function statusColor(status: string) {
  switch (status) {
    case 'new': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
    case 'contacted': return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
    case 'closed': return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    default: return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
  }
}

function statusLabel(status: string) {
  switch (status) {
    case 'new': return '新提交';
    case 'contacted': return '已联系';
    case 'closed': return '已关闭';
    default: return status;
  }
}

// ─── Login Screen ─────────────────────────────────────────────────────────────

function LoginScreen({ onLogin }: { onLogin: (key: string) => void }) {
  const [key, setKey] = useState(API_KEY_DEFAULT);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!key.trim()) { setError('请输入 API Key'); return; }
    localStorage.setItem(API_KEY_STORAGE, key.trim());
    onLogin(key.trim());
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-3xl font-bold text-white mb-2">岐黄四海</div>
          <div className="text-slate-400">管理后台</div>
        </div>
        <form onSubmit={handleSubmit} className="bg-slate-900 border border-white/10 rounded-2xl p-8 space-y-5">
          <div>
            <label className="block text-sm text-slate-400 mb-2">API Key</label>
            <input
              type="password"
              value={key}
              onChange={e => setKey(e.target.value)}
              placeholder="输入管理员 API Key"
              className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
            />
          </div>
          {error && <div className="text-red-400 text-sm">{error}</div>}
          <button
            type="submit"
            className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold py-3 rounded-xl transition"
          >
            进入后台
          </button>
          <div className="text-center text-xs text-slate-600">
            默认 Key: <code className="text-slate-500">{API_KEY_DEFAULT}</code>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({ label, value, sub, color }: { label: string; value: string | number; sub?: string; color: string }) {
  return (
    <div className="bg-slate-900/80 border border-white/8 rounded-2xl p-5">
      <div className="text-sm text-slate-400 mb-2">{label}</div>
      <div className={`text-3xl font-bold ${color}`}>{value}</div>
      {sub && <div className="text-xs text-slate-500 mt-1">{sub}</div>}
    </div>
  );
}

// ─── Dashboard ───────────────────────────────────────────────────────────────

function Dashboard({ apiKey, onLogout }: { apiKey: string; onLogout: () => void }) {
  const [tab, setTab] = useState<'overview' | 'submissions' | 'visitors'>('overview');
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [submissionsPage, setSubmissionsPage] = useState(1);
  const [submissionsTotal, setSubmissionsTotal] = useState(0);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');
  const [visitors, setVisitors] = useState<VisitorsData | null>(null);
  const [visitorsLoading, setVisitorsLoading] = useState(false);
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');

  const loadAnalytics = useCallback(async () => {
    setAnalyticsLoading(true);
    const data = await apiFetch('/api/admin/analytics', apiKey) as AnalyticsData;
    setAnalytics(data);
    setAnalyticsLoading(false);
  }, [apiKey]);

  const loadSubmissions = useCallback(async (page = 1, status = '') => {
    setSubmissionsLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: '20' });
    if (status) params.set('status', status);
    const data = await apiFetch(`/api/admin/submissions?${params}`, apiKey) as any;
    setSubmissions(data.data || []);
    setSubmissionsTotal(data.total || 0);
    setSubmissionsPage(page);
    setSubmissionsLoading(false);
  }, [apiKey]);

  const loadVisitors = useCallback(async () => {
    setVisitorsLoading(true);
    const data = await apiFetch('/api/admin/visitors?limit=20', apiKey) as VisitorsData;
    setVisitors(data);
    setVisitorsLoading(false);
  }, [apiKey]);

  useEffect(() => { loadAnalytics(); }, [loadAnalytics]);
  useEffect(() => { loadSubmissions(1, filterStatus); }, [loadSubmissions, filterStatus]);

  const handleTabChange = (t: typeof tab) => {
    setTab(t);
    if (t === 'visitors' && !visitors) loadVisitors();
  };

  const updateStatus = async (id: string, status: string) => {
    await fetch(`/api/admin/submissions?id=${id}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    loadSubmissions(submissionsPage, filterStatus);
    loadAnalytics();
  };

  const saveNote = async (id: string) => {
    await fetch(`/api/admin/submissions?id=${id}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ notes: noteText }),
    });
    setEditingNote(null);
    loadSubmissions(submissionsPage, filterStatus);
  };

  const tabs = [
    { key: 'overview', label: '总览' },
    { key: 'submissions', label: `表单提交 (${submissionsTotal})` },
    { key: 'visitors', label: '访客列表' },
  ] as const;

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="border-b border-white/8 bg-slate-950/90 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-lg font-bold">岐黄四海</span>
            <span className="text-slate-500 text-sm">管理后台</span>
          </div>
          <div className="flex items-center gap-3">
            {!analyticsLoading && analytics && !analytics.isRealData && (
              <span className="text-xs text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2 py-1 rounded-full">
                演示模式 — 未配置数据库
              </span>
            )}
            <button onClick={onLogout} className="text-sm text-slate-400 hover:text-white transition">
              退出登录
            </button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
        <div className="flex gap-1 border-b border-white/8 pb-0">
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => handleTabChange(t.key)}
              className={`px-4 py-3 text-sm font-medium border-b-2 -mb-px transition ${
                tab === t.key
                  ? 'border-emerald-500 text-emerald-400'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* ── Overview ── */}
        {tab === 'overview' && (
          <div className="space-y-6">
            {analyticsLoading ? (
              <div className="flex items-center justify-center py-20 text-slate-500">加载中...</div>
            ) : analytics ? (
              <>
                {/* KPI Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard label="今日访客" value={analytics.today.visitors} color="text-emerald-400" />
                  <StatCard label="今日提交" value={analytics.today.submissions} color="text-blue-400" />
                  <StatCard label="总访客" value={analytics.total.visitors} color="text-white" />
                  <StatCard
                    label="总提交"
                    value={analytics.total.submissions}
                    sub={`转化率 ${analytics.total.conversionRate}%`}
                    color="text-amber-400"
                  />
                </div>

                {/* Trend + Countries */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  {/* 30-day trend mini chart */}
                  <div className="lg:col-span-2 bg-slate-900/80 border border-white/8 rounded-2xl p-5">
                    <div className="text-sm text-slate-400 mb-4">近30天趋势</div>
                    <div className="flex items-end gap-0.5 h-32">
                      {analytics.trend.map((d, i) => {
                        const maxV = Math.max(...analytics.trend.map(t => t.visitors), 1);
                        return (
                          <div key={i} className="flex-1 flex flex-col items-center gap-0.5 group">
                            <div className="w-full bg-emerald-500/60 rounded-sm transition hover:bg-emerald-400"
                              style={{ height: `${Math.max((d.visitors / maxV) * 100, 4)}%` }} />
                            <div className="opacity-0 group-hover:opacity-100 text-xs text-slate-500 transition">
                              {d.visitors}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex justify-between text-xs text-slate-600 mt-2">
                      <span>30天前</span><span>今天</span>
                    </div>
                  </div>

                  {/* Top Countries */}
                  <div className="bg-slate-900/80 border border-white/8 rounded-2xl p-5">
                    <div className="text-sm text-slate-400 mb-4">访客来源 TOP</div>
                    <div className="space-y-3">
                      {analytics.topCountries.slice(0, 6).map((c, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <span className="text-xs text-slate-500 w-4">{i + 1}</span>
                          <span className="text-sm flex-1 text-slate-200">{c.country}</span>
                          <span className="text-sm text-slate-400">{c.visitors}</span>
                          <div className="w-16 bg-slate-700 rounded-full h-1">
                            <div className="bg-emerald-500 h-1 rounded-full"
                              style={{ width: `${Math.min((c.visitors / (analytics.total.visitors || 1)) * 100 * 3, 100)}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Top Pages */}
                <div className="bg-slate-900/80 border border-white/8 rounded-2xl p-5">
                  <div className="text-sm text-slate-400 mb-4">热门页面</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                    {analytics.topPages.map((p, i) => (
                      <div key={i} className="bg-slate-800/60 rounded-xl p-3">
                        <div className="text-xs text-slate-400 mb-1">#{i + 1}</div>
                        <div className="text-sm font-mono text-white truncate">{p.page}</div>
                        <div className="text-xs text-slate-500 mt-1">{p.views} views</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Submissions */}
                <div className="bg-slate-900/80 border border-white/8 rounded-2xl p-5">
                  <div className="text-sm text-slate-400 mb-4">最近提交</div>
                  <div className="space-y-2">
                    {(analytics.recentSubmissions || []).slice(0, 5).map((s: Submission) => (
                      <div key={s.id} className="flex items-center gap-4 bg-slate-800/40 rounded-xl px-4 py-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium truncate">{s.name || '匿名'}</span>
                            <span className="text-xs text-slate-500 truncate">{s.company || ''}</span>
                          </div>
                          <div className="text-xs text-slate-500 truncate">{s.message || s.product_interest || ''}</div>
                        </div>
                        <span className={`text-xs border px-2 py-0.5 rounded-full shrink-0 ${statusColor(s.status)}`}>
                          {statusLabel(s.status)}
                        </span>
                        <span className="text-xs text-slate-500 shrink-0">{formatDate(s.created_at)}</span>
                      </div>
                    ))}
                    {(!analytics.recentSubmissions || analytics.recentSubmissions.length === 0) && (
                      <div className="text-center text-slate-500 py-8 text-sm">暂无数据</div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center text-red-400 py-20">加载失败</div>
            )}
          </div>
        )}

        {/* ── Submissions ── */}
        {tab === 'submissions' && (
          <div className="space-y-4">
            {/* Filter */}
            <div className="flex gap-2 flex-wrap">
              {['', 'new', 'contacted', 'closed'].map(s => (
                <button
                  key={s}
                  onClick={() => { setFilterStatus(s); setSubmissionsPage(1); }}
                  className={`px-4 py-2 rounded-xl text-sm transition ${
                    filterStatus === s
                      ? 'bg-emerald-500 text-slate-950 font-semibold'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {s === '' ? '全部' : statusLabel(s)}
                </button>
              ))}
            </div>

            {submissionsLoading ? (
              <div className="text-center text-slate-500 py-12">加载中...</div>
            ) : (
              <>
                <div className="bg-slate-900/80 border border-white/8 rounded-2xl overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/8 text-left text-slate-400">
                        <th className="px-4 py-3 font-medium">姓名/公司</th>
                        <th className="px-4 py-3 font-medium hidden sm:table-cell">联系方式</th>
                        <th className="px-4 py-3 font-medium">状态</th>
                        <th className="px-4 py-3 font-medium hidden md:table-cell">来源</th>
                        <th className="px-4 py-3 font-medium hidden lg:table-cell">备注</th>
                        <th className="px-4 py-3 font-medium">时间</th>
                      </tr>
                    </thead>
                    <tbody>
                      {submissions.map(s => (
                        <tr key={s.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                          <td className="px-4 py-3">
                            <div className="font-medium">{s.name || '匿名'}</div>
                            <div className="text-xs text-slate-500">{s.company || ''}</div>
                          </td>
                          <td className="px-4 py-3 hidden sm:table-cell">
                            <div className="text-xs">{s.email || ''}</div>
                            <div className="text-xs text-slate-500">{s.phone || ''}</div>
                          </td>
                          <td className="px-4 py-3">
                            <select
                              value={s.status}
                              onChange={e => updateStatus(s.id, e.target.value)}
                              className={`text-xs border rounded-lg px-2 py-1 cursor-pointer focus:outline-none ${statusColor(s.status)}`}
                            >
                              <option value="new">新提交</option>
                              <option value="contacted">已联系</option>
                              <option value="closed">已关闭</option>
                            </select>
                          </td>
                          <td className="px-4 py-3 hidden md:table-cell text-xs text-slate-400">
                            {s.source_page || '/'}
                          </td>
                          <td className="px-4 py-3 hidden lg:table-cell max-w-[160px]">
                            {editingNote === s.id ? (
                              <div className="flex gap-1">
                                <input
                                  value={noteText}
                                  onChange={e => setNoteText(e.target.value)}
                                  onKeyDown={e => e.key === 'Enter' && saveNote(s.id)}
                                  className="text-xs bg-slate-800 border border-white/10 rounded px-2 py-1 text-white w-24"
                                  placeholder="添加备注..."
                                  autoFocus
                                />
                                <button onClick={() => saveNote(s.id)} className="text-emerald-400 text-xs">保存</button>
                                <button onClick={() => setEditingNote(null)} className="text-slate-500 text-xs">取消</button>
                              </div>
                            ) : (
                              <div
                                onClick={() => { setEditingNote(s.id); setNoteText(s.notes || ''); }}
                                className="text-xs text-slate-400 cursor-pointer truncate hover:text-white"
                              >
                                {s.notes || <span className="text-slate-600">点击添加</span>}
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3 text-xs text-slate-500">{formatDate(s.created_at)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {submissions.length === 0 && (
                    <div className="text-center text-slate-500 py-12">暂无数据</div>
                  )}
                </div>

                {/* Pagination */}
                {submissionsTotal > 20 && (
                  <div className="flex justify-center gap-2">
                    <button
                      disabled={submissionsPage <= 1}
                      onClick={() => loadSubmissions(submissionsPage - 1, filterStatus)}
                      className="px-4 py-2 bg-slate-800 rounded-xl text-sm disabled:opacity-30 hover:bg-slate-700 transition"
                    >
                      上一页
                    </button>
                    <span className="px-4 py-2 text-sm text-slate-400">
                      {submissionsPage} / {Math.ceil(submissionsTotal / 20)}
                    </span>
                    <button
                      disabled={submissionsPage >= Math.ceil(submissionsTotal / 20)}
                      onClick={() => loadSubmissions(submissionsPage + 1, filterStatus)}
                      className="px-4 py-2 bg-slate-800 rounded-xl text-sm disabled:opacity-30 hover:bg-slate-700 transition"
                    >
                      下一页
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ── Visitors ── */}
        {tab === 'visitors' && (
          <div>
            <button
              onClick={loadVisitors}
              className="mb-4 px-4 py-2 bg-slate-800 rounded-xl text-sm hover:bg-slate-700 transition"
            >
              刷新
            </button>
            {visitorsLoading ? (
              <div className="text-center text-slate-500 py-12">加载中...</div>
            ) : visitors ? (
              <div className="bg-slate-900/80 border border-white/8 rounded-2xl overflow-hidden">
                <div className="px-4 py-3 border-b border-white/8 text-sm text-slate-400">
                  共 {visitors.total} 位访客
                </div>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/8 text-left text-slate-400">
                      <th className="px-4 py-3 font-medium">公司/联系人</th>
                      <th className="px-4 py-3 font-medium hidden sm:table-cell">目标市场</th>
                      <th className="px-4 py-3 font-medium hidden md:table-cell">设备</th>
                      <th className="px-4 py-3 font-medium">国家</th>
                      <th className="px-4 py-3 font-medium">访问时间</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(visitors.data || []).map((v: any) => (
                      <tr key={v.visitor_id || v.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                        <td className="px-4 py-3">
                          <div className="font-medium">{v.company_name || '匿名'}</div>
                          <div className="text-xs text-slate-500">{v.contact_name || ''}</div>
                        </td>
                        <td className="px-4 py-3 hidden sm:table-cell text-xs">
                          {Array.isArray(v.selected_markets)
                            ? v.selected_markets.join(', ')
                            : v.selected_markets || ''}
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell text-xs text-slate-400 capitalize">
                          {v.device_type || 'unknown'}
                        </td>
                        <td className="px-4 py-3 text-xs">{v.country || '-'}</td>
                        <td className="px-4 py-3 text-xs text-slate-500">{formatDate(v.created_at || v.last_visit)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {(!visitors.data || visitors.data.length === 0) && (
                  <div className="text-center text-slate-500 py-12">暂无数据</div>
                )}
              </div>
            ) : (
              <div className="text-center text-red-400 py-12">加载失败</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function AdminPage() {
  const [apiKey, setApiKey] = useState<string | null>(
    () => localStorage.getItem(API_KEY_STORAGE)
  );

  const handleLogin = (key: string) => setApiKey(key);
  const handleLogout = () => {
    localStorage.removeItem(API_KEY_STORAGE);
    setApiKey(null);
  };

  if (!apiKey) return <LoginScreen onLogin={handleLogin} />;
  return <Dashboard apiKey={apiKey} onLogout={handleLogout} />;
}
