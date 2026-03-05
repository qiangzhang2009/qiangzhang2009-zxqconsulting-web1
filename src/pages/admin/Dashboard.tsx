/**
 * 仪表盘页面
 */
import { useEffect, useState } from 'react';
import { Users, FileText, TrendingUp, Activity } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getAnalytics } from '@/services/adminApi';

export default function Dashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    loadData();
  }, []);
  
  const loadData = async () => {
    try {
      const result = await getAnalytics(30);
      setData(result);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  const stats = data?.today || { visitors: 0, submissions: 0 };
  const total = data?.total || { visitors: 0, submissions: 0, conversionRate: 0 };
  
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">仪表盘</h1>
      
      {/* 关键指标 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="今日访客"
          value={stats.visitors}
          icon={Users}
          color="blue"
        />
        <StatCard
          title="今日表单"
          value={stats.submissions}
          icon={FileText}
          color="green"
        />
        <StatCard
          title="总访客"
          value={total.visitors}
          icon={TrendingUp}
          color="purple"
        />
        <StatCard
          title="转化率"
          value={`${total.conversionRate}%`}
          icon={Activity}
          color="orange"
        />
      </div>
      
      {/* 趋势图 */}
      <div className="bg-white rounded-xl p-6 shadow-sm mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">访客趋势（近30天）</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data?.trend || []}>
              <defs>
                <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => value.slice(5)}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Area 
                type="monotone" 
                dataKey="pageViews" 
                stroke="#3B82F6" 
                fillOpacity={1} 
                fill="url(#colorVisitors)" 
                name="浏览量"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* 最近提交 */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">最近表单提交</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-medium text-gray-500">姓名</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">电话</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">公司</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">状态</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">时间</th>
              </tr>
            </thead>
            <tbody>
              {(data?.recentSubmissions || []).map((item: any) => (
                <tr key={item.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">{item.name}</td>
                  <td className="py-3 px-4">{item.phone}</td>
                  <td className="py-3 px-4">{item.company || '-'}</td>
                  <td className="py-3 px-4">
                    <StatusBadge status={item.status} />
                  </td>
                  <td className="py-3 px-4 text-gray-500">
                    {new Date(item.created_at).toLocaleString('zh-CN')}
                  </td>
                </tr>
              ))}
              {(!data?.recentSubmissions || data.recentSubmissions.length === 0) && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-500">
                    暂无数据
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// 统计卡片组件
function StatCard({ title, value, icon: Icon, color }: any) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600',
  };
  
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${colors[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}

// 状态标签
function StatusBadge({ status }: { status: string }) {
  const statusMap: Record<string, { label: string; className: string }> = {
    new: { label: '新提交', className: 'bg-blue-100 text-blue-700' },
    contacted: { label: '已联系', className: 'bg-yellow-100 text-yellow-700' },
    closed: { label: '已关闭', className: 'bg-gray-100 text-gray-700' },
  };
  
  const config = statusMap[status] || statusMap.new;
  
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.className}`}>
      {config.label}
    </span>
  );
}
