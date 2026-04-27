/**
 * PublicRoute — redirects authenticated users away from login pages.
 * Owner: Abanob
 */
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function PublicRoute() {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="app-loading">
        <div className="spinner" />
      </div>
    );
  }

  if (isAuthenticated) {
    const redirectTo = user?.role === 'PATIENT' ? '/dashboard' : '/staff/dashboard';
    return <Navigate to={redirectTo} replace />;
  }

  return <Outlet />;
}
