/**
 * Staff Dashboard — overview for staff/admin users.
 * Owner: Kyrillos
 *
 * Sections:
 * - Stat cards grid (4 cols): today's appointments, active patients, pending records, unread notifications
 * - Dashboard widgets: RecentUploadsWidget + quick actions
 */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/hooks/useAuth';
import { Card } from '../../../components/ui';
import RecentUploadsWidget from '../../records/components/RecentUploadsWidget';
import {
  IoCalendarOutline,
  IoPeopleOutline,
  IoDocumentTextOutline,
  IoNotificationsOutline,
} from 'react-icons/io5';
import './StaffPages.css';

/* ---------- Dummy dashboard data ---------- */
const DUMMY_STATS = {
  todays_appointments: 8,
  active_patients: 124,
  pending_records: 5,
  unread_notifications: 3,
};

const DUMMY_UPLOADS = [
  { id: 1, title: 'Blood Test Report — Omar Tarek', date: '2026-05-16' },
  { id: 2, title: 'MRI Scan — Noura Said', date: '2026-05-15' },
  { id: 3, title: 'Prescription — Ahmed Fathi', date: '2026-05-15' },
  { id: 4, title: 'X-Ray Results — Sara Ali', date: '2026-05-14' },
];

/* ---------- Stat Card ---------- */
function StaffStatCard({ icon, iconColor, value, label }) {
  return (
    <div className="staff-stat-card">
      <div className={`staff-stat-card__icon staff-stat-card__icon--${iconColor}`}>
        {icon}
      </div>
      <span className="staff-stat-card__value">{value}</span>
      <span className="staff-stat-card__label">{label}</span>
    </div>
  );
}

/* ====================================================================
   Main Component
   ==================================================================== */
export default function StaffDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(DUMMY_STATS);
  const [uploads, setUploads] = useState(DUMMY_UPLOADS);

  /*
   * When the backend is ready, uncomment this block to fetch real data:
   *
   * useEffect(() => {
   *   const fetchStats = async () => {
   *     try {
   *       const [apptRes, notifRes] = await Promise.all([
   *         appointmentApi.getAppointments({ from_date: new Date().toISOString().split('T')[0] }),
   *         notificationApi.getNotifications(),
   *       ]);
   *       setStats({
   *         todays_appointments: apptRes.data.length,
   *         active_patients: 124,
   *         pending_records: 5,
   *         unread_notifications: notifRes.data.filter(n => !n.read_at).length,
   *       });
   *     } catch (err) {
   *       console.error('Failed to fetch dashboard stats:', err);
   *     }
   *   };
   *   fetchStats();
   * }, []);
   */

  return (
    <div className="staff-dashboard animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Staff Dashboard</h1>
        <p className="page-subtitle">Welcome back, {user?.first_name || user?.name || 'Staff Member'}.</p>
      </div>

      {/* ---- Stat Cards Grid ---- */}
      <div className="staff-stats-grid">
        <StaffStatCard
          icon={<IoCalendarOutline />}
          iconColor="blue"
          value={stats.todays_appointments}
          label="Today's Appointments"
        />
        <StaffStatCard
          icon={<IoPeopleOutline />}
          iconColor="green"
          value={stats.active_patients}
          label="Active Patients"
        />
        <StaffStatCard
          icon={<IoDocumentTextOutline />}
          iconColor="amber"
          value={stats.pending_records}
          label="Pending Records"
        />
        <StaffStatCard
          icon={<IoNotificationsOutline />}
          iconColor="purple"
          value={stats.unread_notifications}
          label="Unread Notifications"
        />
      </div>

      {/* ---- Widgets Row ---- */}
      <div className="staff-dashboard-widgets">
        <RecentUploadsWidget uploads={uploads} />
        <Card title="Quick Actions" subtitle="Shortcuts to common tasks">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            <button
              className="staff-table-action"
              style={{ justifyContent: 'center', padding: 'var(--space-2) var(--space-4)' }}
              onClick={() => navigate('/appointments/new')}
            >
              <IoCalendarOutline /> Schedule Appointment
            </button>
            <button
              className="staff-table-action"
              style={{ justifyContent: 'center', padding: 'var(--space-2) var(--space-4)' }}
              onClick={() => navigate('/notifications')}
            >
              <IoNotificationsOutline /> View Notifications
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}
