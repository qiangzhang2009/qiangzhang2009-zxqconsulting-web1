/**
 * 侧边栏组件
 */
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, FileText, BarChart3, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const menuItems = [
  { path: '/admin/dashboard', label: '仪表盘', icon: LayoutDashboard },
  { path: '/admin/visitors', label: '客户管理', icon: Users },
  { path: '/admin/submissions', label: '表单提交', icon: FileText },
  { path: '/admin/analytics', label: '数据分析', icon: BarChart3 },
];

export default function AdminSidebar() {
  const navigate = useNavigate();
  
  const handleLogout = () => {
    localStorage.removeItem('admin_auth');
    navigate('/admin/login');
  };
  
  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-slate-900 text-white flex flex-col">
      <div className="p-6 border-b border-slate-800">
        <h1 className="text-xl font-bold">智信数据后台</h1>
        <p className="text-sm text-slate-400 mt-1">访客管理系统</p>
      </div>
      
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-300 hover:bg-slate-800'
                  }`
                }
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="p-4 border-t border-slate-800">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 w-full text-slate-300 hover:bg-slate-800 rounded-lg transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>退出登录</span>
        </button>
      </div>
    </aside>
  );
}
