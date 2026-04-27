/**
 * ProtectedRoute — redirects unauthenticated users to login.
 * Owner: Abanob
 */
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ allowedRoles }) {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="app-loading">
        <div className="spinner" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    // Role-based redirect
    const fallback = user?.role === 'PATIENT' ? '/dashboard' : '/staff/dashboard';
    return <Navigate to={fallback} replace />;
  }

  return <Outlet />;
}
