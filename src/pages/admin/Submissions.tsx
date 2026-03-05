/**
 * 表单提交页面
 */
import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getSubmissions, updateSubmission } from '@/services/adminApi';
import { toast } from 'sonner';

export default function Submissions() {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState('');
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  
  useEffect(() => {
    loadSubmissions();
  }, [page, status]);
  
  const loadSubmissions = async () => {
    setLoading(true);
    try {
      const result = await getSubmissions(page, 20, status);
      setSubmissions(result.data || []);
      setTotal(result.total || 0);
    } catch (error) {
      console.error('Failed to load submissions:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      await updateSubmission(id, { status: newStatus });
      toast.success('状态已更新');
      loadSubmissions();
    } catch (error) {
      toast.error('更新失败');
    }
  };
  
  const totalPages = Math.ceil(total / 20);
  
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">表单提交</h1>
      
      {/* 筛选 */}
      <div className="bg-white rounded-xl p-4 shadow-sm mb-6">
        <div className="flex gap-4">
          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">全部状态</option>
            <option value="new">新提交</option>
            <option value="contacted">已联系</option>
            <option value="closed">已关闭</option>
          </select>
        </div>
      </div>
      
      {/* 列表 */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-gray-500">姓名</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">电话</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">邮箱</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">公司</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">来源页面</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">状态</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">时间</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">操作</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  </td>
                </tr>
              ) : submissions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-gray-500">
                    暂无数据
                  </td>
                </tr>
              ) : (
                submissions.map((item) => (
                  <tr key={item.id} className="border-t hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">{item.name}</td>
                    <td className="py-3 px-4">{item.phone}</td>
                    <td className="py-3 px-4">{item.email || '-'}</td>
                    <td className="py-3 px-4">{item.company || '-'}</td>
                    <td className="py-3 px-4 text-sm text-gray-500">{item.source_page}</td>
                    <td className="py-3 px-4">
                      <StatusSelect 
                        status={item.status} 
                        onChange={(newStatus) => handleStatusChange(item.id, newStatus)} 
                      />
                    </td>
                    <td className="py-3 px-4 text-gray-500 text-sm">
                      {new Date(item.created_at).toLocaleDateString('zh-CN')}
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => setSelectedSubmission(item)}
                        className="text-blue-600 hover:underline text-sm"
                      >
                        查看
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <p className="text-sm text-gray-500">共 {total} 条</p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-2 border rounded disabled:opacity-50">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-2 border rounded disabled:opacity-50">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
      
      {selectedSubmission && (
        <SubmissionModal submission={selectedSubmission} onClose={() => setSelectedSubmission(null)} />
      )}
    </div>
  );
}

// 状态选择
function StatusSelect({ status, onChange }: { status: string; onChange: (status: string) => void }) {
  const config: Record<string, { label: string; color: string }> = {
    new: { label: '新提交', color: 'text-blue-600 bg-blue-50' },
    contacted: { label: '已联系', color: 'text-yellow-600 bg-yellow-50' },
    closed: { label: '已关闭', color: 'text-gray-600 bg-gray-50' },
  };
  const current = config[status] || config.new;
  
  return (
    <select
      value={status}
      onChange={(e) => onChange(e.target.value)}
      className={`px-2 py-1 rounded text-xs font-medium border-0 cursor-pointer ${current.color}`}
    >
      <option value="new">新提交</option>
      <option value="contacted">已联系</option>
      <option value="closed">已关闭</option>
    </select>
  );
}

// 详情弹窗
function SubmissionModal({ submission, onClose }: { submission: any; onClose: () => void }) {
  const [notes, setNotes] = useState(submission.notes || '');
  
  const handleSaveNotes = async () => {
    try {
      await updateSubmission(submission.id, { notes });
      toast.success('备注已保存');
    } catch (error) {
      toast.error('保存失败');
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">表单详情</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">姓名</p>
              <p className="font-medium">{submission.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">电话</p>
              <p className="font-medium">{submission.phone}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">邮箱</p>
              <p className="font-medium">{submission.email || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">公司</p>
              <p className="font-medium">{submission.company || '-'}</p>
            </div>
            <div className="col-span-2">
              <p className="text-sm text-gray-500">感兴趣的产品</p>
              <p className="font-medium">{submission.product_interest || '-'}</p>
            </div>
            <div className="col-span-2">
              <p className="text-sm text-gray-500">留言内容</p>
              <p className="font-medium">{submission.message || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">来源页面</p>
              <p className="font-medium">{submission.source_page}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">提交时间</p>
              <p className="font-medium">{new Date(submission.created_at).toLocaleString('zh-CN')}</p>
            </div>
          </div>
          
          <div>
            <p className="text-sm text-gray-500 mb-2">备注</p>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="添加备注..."
            />
          </div>
        </div>
        
        <div className="mt-6 flex gap-3 justify-end">
          <button onClick={onClose} className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200">关闭</button>
          <button onClick={handleSaveNotes} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">保存备注</button>
        </div>
      </div>
    </div>
  );
}
