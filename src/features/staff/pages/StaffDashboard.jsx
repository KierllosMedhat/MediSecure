import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/hooks/useAuth';
import useStaffDashboard from '../hooks/useStaffDashboard';
import RecentUploadsWidget from '../../records/components/RecentUploadsWidget';
import {
  IoCalendarOutline,
  IoPeopleOutline,
  IoDocumentTextOutline,
  IoNotificationsOutline,
  IoTimeOutline,
} from 'react-icons/io5';
import '../../patients/pages/PatientPages.css';
import './StaffPages.css';

/* ---------- Stat Card ---------- */
function StatCard({ label, value, subtitle, subtitleColor, icon }) {
  return (
    <div className="stat-card animate-fade-in-up">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <span className="stat-card__label">{label}</span>
        {icon && <span style={{ fontSize: '1.5rem', color: 'var(--color-primary-light)' }}>{icon}</span>}
      </div>
      <span className="stat-card__value">{value}</span>
      {subtitle && (
        <span
          className="stat-card__subtitle"
          style={subtitleColor ? { color: subtitleColor } : undefined}
        >
          {subtitle}
        </span>
      )}
    </div>
  );
}

/* ---------- Appointment Item ---------- */
function AppointmentItem({ appointment }) {
  return (
    <div className="record-item">
      <div className="record-item__icon">
        <IoTimeOutline />
      </div>
      <div className="record-item__info">
        <span className="record-item__title">{appointment.patient_name}</span>
        <span className="record-item__meta">
          {new Date(appointment.date).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })} &bull; {appointment.type.replace('_', ' ')}
        </span>
      </div>
      <span className="record-item__tag">{appointment.status}</span>
    </div>
  );
}

/* ====================================================================
   Main Component
   ==================================================================== */
export default function StaffDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { stats, recentRecords: uploads, upcomingAppointments, loading, error } = useStaffDashboard();

  if (loading) {
    return (
      <div className="patient-dashboard">
        <div className="dashboard-loading">
          <div className="dashboard-loading__spinner" />
          <p>Loading dashboard…</p>
        </div>
      </div>
    );
  }

  const firstName = user?.first_name || user?.name?.split(' ')[0] || 'Staff Member';

  return (
    <div className="patient-dashboard animate-fade-in">
      <div className="page-header">
        <h1 className="page-title dashboard-title">Welcome back, {firstName}</h1>
        <p className="page-subtitle">Here is your schedule and overview for today.</p>
      </div>

      {/* ---- Stat Cards Grid ---- */}
      <div className="stats-grid">
        <StatCard
          label="Today's Appointments"
          value={stats.todays_appointments}
          icon={<IoCalendarOutline />}
        />
        <StatCard
          label="Active Patients"
          value={stats.active_patients}
          icon={<IoPeopleOutline />}
        />
        <StatCard
          label="Pending Consents"
          value={stats.pending_records}
          icon={<IoDocumentTextOutline />}
        />
        <StatCard
          label="Unread Notifications"
          value={stats.unread_notifications}
          icon={<IoNotificationsOutline />}
        />
      </div>

      {/* ---- Two Column Layout ---- */}
      <div className="dashboard-columns">
        {/* ---- Left Column ---- */}
        <div className="dashboard-col-main">
          {/* Upcoming Appointments */}
          <section className="dashboard-card">
            <div className="dashboard-card__header">
              <div>
                <h2 className="dashboard-card__title">Upcoming Appointments</h2>
                <p className="dashboard-card__subtitle">Your schedule for the upcoming days</p>
              </div>
              <button
                className="btn-outline btn-sm"
                onClick={() => navigate(`/appointments/new`)}
              >
                <IoCalendarOutline /> Schedule
              </button>
            </div>
            <div className="dashboard-card__body">
              {!upcomingAppointments || upcomingAppointments.length === 0 ? (
                <p className="dashboard-card__empty" style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: 'var(--space-4) 0' }}>No upcoming appointments.</p>
              ) : (
                upcomingAppointments.map((appt) => (
                  <AppointmentItem key={appt.id} appointment={appt} />
                ))
              )}
            </div>
            <button
              className="dashboard-card__view-all"
              onClick={() => navigate(`/appointments`)}
            >
              View All Appointments
            </button>
          </section>

          {/* Recent Uploads */}
          <section className="dashboard-card" style={{ padding: 0, border: 'none', background: 'transparent', boxShadow: 'none' }}>
            <RecentUploadsWidget uploads={uploads} />
          </section>
        </div>

        {/* ---- Right Column (Sidebar) ---- */}
        <div className="dashboard-col-side">
          <section className="dashboard-card profile-sidebar-card">
            <h2 className="dashboard-card__title profile-sidebar-card__title">Quick Links</h2>
            <div className="profile-sidebar" style={{ alignItems: 'stretch' }}>
              <button
                className="btn-outline btn-block"
                style={{ marginBottom: 'var(--space-2)' }}
                onClick={() => navigate('/staff/patients')}
              >
                <IoPeopleOutline /> Patient Directory
              </button>
              <button
                className="btn-outline btn-block"
                onClick={() => navigate('/notifications')}
              >
                <IoNotificationsOutline /> Notifications
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
