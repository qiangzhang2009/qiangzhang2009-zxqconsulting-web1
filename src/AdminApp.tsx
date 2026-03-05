import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import AdminSidebar from './components/admin/AdminSidebar';
import Dashboard from './pages/admin/Dashboard';
import Visitors from './pages/admin/Visitors';
import Submissions from './pages/admin/Submissions';
import Analytics from './pages/admin/Analytics';
import Login from './pages/admin/Login';
import './index.css';

function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar />
      <main className="flex-1 ml-64 p-8">
        {children}
      </main>
      <Toaster position="top-right" />
    </div>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = localStorage.getItem('admin_auth') === 'true';
  
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }
  
  return <AdminLayout>{children}</AdminLayout>;
}

export default function AdminApp() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
      <Route path="/visitors" element={
        <ProtectedRoute>
          <Visitors />
        </ProtectedRoute>
      } />
      <Route path="/submissions" element={
        <ProtectedRoute>
          <Submissions />
        </ProtectedRoute>
      } />
      <Route path="/analytics" element={
        <ProtectedRoute>
          <Analytics />
        </ProtectedRoute>
      } />
    </Routes>
  );
}
