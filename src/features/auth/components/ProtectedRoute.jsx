/**
 * ProtectedRoute — redirects unauthenticated users to login.
 * If allowedRoles is provided, unauthorized roles are sent to their dashboard.
 * Owner: Abanob
 */
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getDashboardPath } from '../roles';

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
    return <Navigate to={getDashboardPath(user?.role)} replace />;
  }

  return <Outlet />;
}
