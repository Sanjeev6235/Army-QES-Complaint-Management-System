import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import Layout from './components/layout/Layout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import EngineerDashboard from './pages/EngineerDashboard';
import ComplaintForm from './pages/ComplaintForm';
import ComplaintHistory from './pages/ComplaintHistory';
import ComplaintDetail from './pages/ComplaintDetail';
import AdminUsers from './pages/AdminUsers';
import AdminComplaints from './pages/AdminComplaints';
import EngineerComplaints from './pages/EngineerComplaints';
import NotFoundPage from './pages/NotFoundPage';

const PrivateRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-stone-950">
      <div className="text-army-400 font-display text-xl tracking-widest animate-pulse">LOADING...</div>
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
};

const RoleRedirect = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
  if (user.role === 'engineer') return <Navigate to="/engineer/dashboard" replace />;
  return <Navigate to="/dashboard" replace />;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/" element={<RoleRedirect />} />

      {/* User routes */}
      <Route path="/dashboard" element={
        <PrivateRoute allowedRoles={['user']}>
          <NotificationProvider><Layout><UserDashboard /></Layout></NotificationProvider>
        </PrivateRoute>
      } />
      <Route path="/complaint/new" element={
        <PrivateRoute allowedRoles={['user', 'admin']}>
          <NotificationProvider><Layout><ComplaintForm /></Layout></NotificationProvider>
        </PrivateRoute>
      } />
      <Route path="/complaints" element={
        <PrivateRoute allowedRoles={['user']}>
          <NotificationProvider><Layout><ComplaintHistory /></Layout></NotificationProvider>
        </PrivateRoute>
      } />
      <Route path="/complaints/:id" element={
        <PrivateRoute>
          <NotificationProvider><Layout><ComplaintDetail /></Layout></NotificationProvider>
        </PrivateRoute>
      } />

      {/* Admin routes */}
      <Route path="/admin/dashboard" element={
        <PrivateRoute allowedRoles={['admin']}>
          <NotificationProvider><Layout><AdminDashboard /></Layout></NotificationProvider>
        </PrivateRoute>
      } />
      <Route path="/admin/complaints" element={
        <PrivateRoute allowedRoles={['admin']}>
          <NotificationProvider><Layout><AdminComplaints /></Layout></NotificationProvider>
        </PrivateRoute>
      } />
      <Route path="/admin/users" element={
        <PrivateRoute allowedRoles={['admin']}>
          <NotificationProvider><Layout><AdminUsers /></Layout></NotificationProvider>
        </PrivateRoute>
      } />

      {/* Engineer routes */}
      <Route path="/engineer/dashboard" element={
        <PrivateRoute allowedRoles={['engineer']}>
          <NotificationProvider><Layout><EngineerDashboard /></Layout></NotificationProvider>
        </PrivateRoute>
      } />
      <Route path="/engineer/complaints" element={
        <PrivateRoute allowedRoles={['engineer']}>
          <NotificationProvider><Layout><EngineerComplaints /></Layout></NotificationProvider>
        </PrivateRoute>
      } />

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
