/**
 * Staff Dashboard — overview for staff/admin users.
 * Owner: Kyrillos
 *
 * TODO:
 * - Show stat cards: today's appointments, active patients, pending records, unread notifications
 * - Include RecentUploadsWidget from records module
 * - Fetch dashboard stats from appropriate APIs
 */
import { useAuth } from '../../auth/hooks/useAuth';
import { Card } from '../../../components/ui';
import './StaffPages.css';

export default function StaffDashboard() {
  const { user } = useAuth();

  return (
    <div className="staff-dashboard">
      <div className="page-header">
        <h1 className="page-title">Staff Dashboard</h1>
        <p className="page-subtitle">Welcome back, {user?.name || 'Staff Member'}.</p>
      </div>

      {/* TODO: Stat cards grid */}
      {/* TODO: Recent uploads widget */}
    </div>
  );
}
