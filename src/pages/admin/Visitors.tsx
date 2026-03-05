/**
 * 客户管理页面
 */
import { useEffect, useState } from 'react';
import { Search, Download, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { getVisitors } from '@/services/adminApi';

export default function Visitors() {
  const [visitors, setVisitors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [selectedVisitor, setSelectedVisitor] = useState<any>(null);
  
  useEffect(() => {
    loadVisitors();
  }, [page]);
  
  const loadVisitors = async () => {
    setLoading(true);
    try {
      const result = await getVisitors(page, 20, search);
      setVisitors(result.data || []);
      setTotal(result.total || 0);
    } catch (error) {
      console.error('Failed to load visitors:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSearch = () => {
    setPage(1);
    loadVisitors();
  };
  
  const totalPages = Math.ceil(total / 20);
  
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">客户管理</h1>
        <button
          onClick={() => {
            const csv = convertToCSV(visitors);
            downloadCSV(csv, 'visitors.csv');
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Download className="w-4 h-4" />
          导出CSV
        </button>
      </div>
      
      {/* 搜索栏 */}
      <div className="bg-white rounded-xl p-4 shadow-sm mb-6">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="搜索姓名、公司、电话..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={handleSearch}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            搜索
          </button>
        </div>
      </div>
      
      {/* 客户列表 */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-gray-500">姓名</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">电话</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">公司</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">产品类型</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">目标区域</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">来源</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">访问次数</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">最后访问</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">操作</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  </td>
                </tr>
              ) : visitors.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-gray-500">
                    暂无数据
                  </td>
                </tr>
              ) : (
                visitors.map((visitor) => (
                  <tr key={visitor.id} className="border-t hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">{visitor.contact_name}</td>
                    <td className="py-3 px-4">{visitor.contact_phone}</td>
                    <td className="py-3 px-4">{visitor.company_name || '-'}</td>
                    <td className="py-3 px-4">{visitor.product_category || '-'}</td>
                    <td className="py-3 px-4">{visitor.target_region || '-'}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                        {visitor.country || '未知'}
                      </span>
                    </td>
                    <td className="py-3 px-4">{visitor.visit_count}</td>
                    <td className="py-3 px-4 text-gray-500 text-sm">
                      {visitor.last_visit ? new Date(visitor.last_visit).toLocaleDateString('zh-CN') : '-'}
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => setSelectedVisitor(visitor)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* 分页 */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <p className="text-sm text-gray-500">
              共 {total} 条，第 {page}/{totalPages} 页
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 border rounded hover:bg-gray-50 disabled:opacity-50"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 border rounded hover:bg-gray-50 disabled:opacity-50"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* 详情弹窗 */}
      {selectedVisitor && (
        <VisitorDetailModal 
          visitor={selectedVisitor} 
          onClose={() => setSelectedVisitor(null)} 
        />
      )}
    </div>
  );
}

// 详情弹窗
function VisitorDetailModal({ visitor, onClose }: { visitor: any; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">访客详情</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">姓名</p>
              <p className="font-medium">{visitor.contact_name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">电话</p>
              <p className="font-medium">{visitor.contact_phone}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">公司</p>
              <p className="font-medium">{visitor.company_name || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">邮箱</p>
              <p className="font-medium">{visitor.email || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">产品类型</p>
              <p className="font-medium">{visitor.product_category || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">产品名称</p>
              <p className="font-medium">{visitor.product_name || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">目标区域</p>
              <p className="font-medium">{visitor.target_region || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">主要需求</p>
              <p className="font-medium">{visitor.main_need || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">准备度得分</p>
              <p className="font-medium">{visitor.readiness_score || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">访问次数</p>
              <p className="font-medium">{visitor.visit_count}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">国家/地区</p>
              <p className="font-medium">{visitor.country || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">设备类型</p>
              <p className="font-medium">{visitor.device_type || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">首次访问</p>
              <p className="font-medium">{visitor.first_visit ? new Date(visitor.first_visit).toLocaleString('zh-CN') : '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">最后访问</p>
              <p className="font-medium">{visitor.last_visit ? new Date(visitor.last_visit).toLocaleString('zh-CN') : '-'}</p>
            </div>
          </div>
          
          {visitor.selected_markets && visitor.selected_markets.length > 0 && (
            <div>
              <p className="text-sm text-gray-500 mb-2">目标市场</p>
              <div className="flex flex-wrap gap-2">
                {visitor.selected_markets.map((market: string, idx: number) => (
                  <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                    {market}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
}

// 工具函数
function convertToCSV(data: any[]): string {
  const headers = ['姓名', '电话', '公司', '产品类型', '目标区域', '国家', '访问次数', '最后访问'];
  const rows = data.map(v => [
    v.contact_name,
    v.contact_phone,
    v.company_name || '',
    v.product_category || '',
    v.target_region || '',
    v.country || '',
    v.visit_count,
    v.last_visit || ''
  ]);
  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}

function downloadCSV(csv: string, filename: string) {
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
}
