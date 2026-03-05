import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './i18n' // 导入 i18n 配置
import './index.css'
import App from './App.tsx'
import Login from './pages/admin/Login';
import Dashboard from './pages/admin/Dashboard';
import Visitors from './pages/admin/Visitors';
import Submissions from './pages/admin/Submissions';
import Analytics from './pages/admin/Analytics';
import AdminLayout from './components/admin/AdminLayout';
import { Toaster } from 'sonner';

// 管理员保护路由
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = localStorage.getItem('admin_auth') === 'true';
  
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }
  
  return <AdminLayout>{children}</AdminLayout>;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        {/* 前台路由 */}
        <Route path="*" element={<App />} />
        
        {/* 后台管理路由 */}
        <Route path="/admin/login" element={<Login />} />
        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="/admin/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/admin/visitors" element={
          <ProtectedRoute>
            <Visitors />
          </ProtectedRoute>
        } />
        <Route path="/admin/submissions" element={
          <ProtectedRoute>
            <Submissions />
          </ProtectedRoute>
        } />
        <Route path="/admin/analytics" element={
          <ProtectedRoute>
            <Analytics />
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
