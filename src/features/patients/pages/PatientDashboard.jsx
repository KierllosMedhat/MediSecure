/**
 * Patient Dashboard — homepage showing overview widgets.
 * Owner: Abanob
 *
 * ERD refs: Patient, Payment (Amount, Status), Consent (Is_Active),
 *           MedicalRecord, Appointment (Scheduled_at, Status)
 *
 * Sections (matching Figma):
 *  1. Welcome header + Patient ID
 *  2. Stats cards grid (4 cols)
 *  3. Two-column layout:
 *     Left: Medical Records, Pending Bills, Privacy & Consent
 *     Right: Profile card, Recent Activity
 */
import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/hooks/useAuth';
import usePatientDashboard from '../hooks/usePatientDashboard';
import {
  IoDocumentTextOutline,
  IoCloudUploadOutline,
  IoDownloadOutline,
  IoCardOutline,
  IoShieldCheckmarkOutline,
  IoPersonOutline,
  IoCalendarOutline,
  IoTrendingUpOutline,
} from 'react-icons/io5';
import './PatientPages.css';

/* ---------- Helpers ---------- */
function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function getInitials(firstName, lastName) {
  return `${(firstName || '')[0] || ''}${(lastName || '')[0] || ''}`.toUpperCase();
}

/* ---------- Stat Card ---------- */
function StatCard({ label, value, subtitle, subtitleColor }) {
  return (
    <div className="stat-card animate-fade-in-up">
      <span className="stat-card__label">{label}</span>
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

/* ---------- Progress Bar ---------- */
function ProgressBar({ percent }) {
  return (
    <div className="progress-bar">
      <div className="progress-bar__fill" style={{ width: `${percent}%` }} />
    </div>
  );
}

/* ---------- Record Item ---------- */
function RecordItem({ record }) {
  return (
    <div className="record-item">
      <div className="record-item__icon">
        <IoDocumentTextOutline />
      </div>
      <div className="record-item__info">
        <span className="record-item__title">{record.title}</span>
        <span className="record-item__meta">
          {record.doctor_name} &bull; {record.date}
        </span>
      </div>
      <span className="record-item__tag">{record.type}</span>
      <button className="record-item__download" aria-label={`Download ${record.title}`}>
        <IoDownloadOutline />
      </button>
    </div>
  );
}

/* ---------- Bill Item ---------- */
function BillItem({ bill }) {
  const isOverdue = bill.status === 'OVERDUE';
  return (
    <div className="bill-item">
      <div className="bill-item__info">
        <span className="bill-item__desc">{bill.description}</span>
        <span className="bill-item__due">Due: {bill.due_date}</span>
      </div>
      <span className={`bill-item__status ${isOverdue ? 'bill-item__status--overdue' : ''}`}>
        {isOverdue ? 'Overdue' : 'Pending'}
      </span>
      <span className="bill-item__amount">${bill.amount}</span>
    </div>
  );
}

/* ---------- Activity Item ---------- */
function ActivityItem({ activity }) {
  const colorMap = {
    upload: 'var(--color-primary)',
    access: 'var(--color-warning)',
    payment: 'var(--color-success)',
  };
  return (
    <div
      className="activity-item"
      style={{ borderLeftColor: colorMap[activity.type] || 'var(--color-primary)' }}
    >
      <span className="activity-item__action">{activity.action}</span>
      <span className="activity-item__desc">{activity.description}</span>
      <span className="activity-item__time">{activity.timestamp}</span>
    </div>
  );
}

/* ---------- Toggle Switch ---------- */
function ToggleSwitch({ checked, onChange, id }) {
  return (
    <label className="toggle-switch" htmlFor={id}>
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={onChange}
        className="toggle-switch__input"
      />
      <span className="toggle-switch__slider" />
    </label>
  );
}

/* ====================================================================
   Main Dashboard Component
   ==================================================================== */
export default function PatientDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { dashboardData, profile, loading } = usePatientDashboard();

  const [consentEnabled, setConsentEnabled] = useState(true);

  const handleConsentToggle = useCallback(() => {
    setConsentEnabled((prev) => !prev);
    // TODO: call consentApi.updateConsent({ grant_data_access: !consentEnabled })
  }, [consentEnabled]);

  /* Update consent state once dashboard data arrives */
  if (dashboardData?.consent && consentEnabled !== dashboardData.consent.grant_data_access) {
    // Only set on initial load — controlled afterward
  }

  if (loading) {
    return (
      <div className="patient-dashboard">
        <div className="dashboard-loading">
          <div className="dashboard-loading__spinner" />
          <p>Loading your dashboard…</p>
        </div>
      </div>
    );
  }

  const stats = dashboardData?.stats || {};
  const records = dashboardData?.recent_records || [];
  const bills = dashboardData?.pending_bills || [];
  const activity = dashboardData?.recent_activity || [];
  const firstName = user?.first_name || user?.name?.split(' ')[0] || profile?.first_name || 'Patient';
  const patientId = profile?.patient_id || 'N/A';

  const overdueCount = bills.filter((b) => b.status === 'OVERDUE').length;

  return (
    <div className="patient-dashboard animate-fade-in">
      {/* ---- Welcome Header ---- */}
      <div className="page-header">
        <h1 className="page-title dashboard-title">Welcome back, {firstName}</h1>
        <p className="page-subtitle">Patient ID: {patientId}</p>
      </div>

      {/* ---- Stats Cards Grid ---- */}
      <div className="stats-grid">
        <StatCard
          label="Total Records"
          value={stats.total_records ?? 0}
          subtitle={`+4 this month`}
          subtitleColor="var(--color-success)"
        />
        <StatCard
          label="Pending Bills"
          value={`$${stats.pending_bills_amount ?? 0}`}
          subtitle={overdueCount > 0 ? `${overdueCount} overdue` : null}
          subtitleColor="var(--color-danger)"
        />
        <StatCard
          label="Next Appointment"
          value={stats.next_appointment ? formatDate(stats.next_appointment.date) : '—'}
          subtitle={
            stats.next_appointment ? (
              <span className="stat-card__appt-doc">
                <IoCalendarOutline /> {stats.next_appointment.doctor_name}
              </span>
            ) : null
          }
        />
        <StatCard
          label="Profile Complete"
          value={`${stats.profile_completion ?? 0}%`}
          subtitle={<ProgressBar percent={stats.profile_completion ?? 0} />}
        />
      </div>

      {/* ---- Two Column Layout ---- */}
      <div className="dashboard-columns">
        {/* ---- Left Column ---- */}
        <div className="dashboard-col-main">
          {/* Medical Records */}
          <section className="dashboard-card">
            <div className="dashboard-card__header">
              <div>
                <h2 className="dashboard-card__title">Medical Records</h2>
                <p className="dashboard-card__subtitle">View and manage your health documents</p>
              </div>
              <button
                className="btn-outline btn-sm"
                onClick={() => navigate(`/patients/${patientId}/records/upload`)}
                id="dashboard-upload-btn"
              >
                <IoCloudUploadOutline /> Upload
              </button>
            </div>
            <div className="dashboard-card__body">
              {records.map((rec) => (
                <RecordItem key={rec.id} record={rec} />
              ))}
            </div>
            <button
              className="dashboard-card__view-all"
              onClick={() => navigate(`/patients/me/records`)}
              id="dashboard-view-records-btn"
            >
              View All Records
            </button>
          </section>

          {/* Pending Bills */}
          <section className="dashboard-card">
            <div className="dashboard-card__header">
              <div>
                <h2 className="dashboard-card__title">Pending Bills</h2>
                <p className="dashboard-card__subtitle">Outstanding payments and invoices</p>
              </div>
              <button
                className="btn-outline btn-sm"
                onClick={() => navigate('/payments')}
                id="dashboard-pay-btn"
              >
                <IoCardOutline /> Pay Now
              </button>
            </div>
            <div className="dashboard-card__body">
              {bills.map((bill) => (
                <BillItem key={bill.id} bill={bill} />
              ))}
            </div>
          </section>

          {/* Privacy & Consent */}
          <section className="dashboard-card">
            <div className="dashboard-card__header">
              <div>
                <h2 className="dashboard-card__title">Privacy &amp; Consent</h2>
                <p className="dashboard-card__subtitle">Manage your data sharing preferences</p>
              </div>
            </div>
            <div className="dashboard-card__body">
              <div className="consent-row">
                <div className="consent-row__text">
                  <span className="consent-row__label">Grant Data Access</span>
                  <span className="consent-row__desc">
                    Allow authorized medical staff to view your records
                  </span>
                </div>
                <ToggleSwitch
                  id="consent-toggle"
                  checked={consentEnabled}
                  onChange={handleConsentToggle}
                />
              </div>
              <div className="consent-info">
                <p>Your data is protected under:</p>
                <ul>
                  <li>Egyptian Personal Data Protection Law (PDPL)</li>
                  <li>End-to-end encryption for all documents</li>
                  <li>Immutable audit logs for all access</li>
                </ul>
              </div>
            </div>
          </section>
        </div>

        {/* ---- Right Column (Sidebar) ---- */}
        <div className="dashboard-col-side">
          {/* Profile Card */}
          <section className="dashboard-card profile-sidebar-card">
            <h2 className="dashboard-card__title profile-sidebar-card__title">Profile</h2>
            <div className="profile-sidebar">
              <div className="profile-sidebar__avatar">
                {getInitials(profile?.first_name, profile?.last_name)}
              </div>
              <h3 className="profile-sidebar__name">
                {profile?.first_name} {profile?.last_name}
              </h3>
              <p className="profile-sidebar__id">Patient ID: {patientId}</p>

              <div className="profile-sidebar__details">
                <div className="profile-sidebar__row">
                  <span className="profile-sidebar__label">Email:</span>
                  <span className="profile-sidebar__value">{profile?.email || '—'}</span>
                </div>
                <div className="profile-sidebar__row">
                  <span className="profile-sidebar__label">Phone:</span>
                  <span className="profile-sidebar__value">{profile?.phone_number || '—'}</span>
                </div>
                <div className="profile-sidebar__row">
                  <span className="profile-sidebar__label">DOB:</span>
                  <span className="profile-sidebar__value">
                    {profile?.date_of_birth
                      ? new Date(profile.date_of_birth).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })
                      : '—'}
                  </span>
                </div>
                <div className="profile-sidebar__row">
                  <span className="profile-sidebar__label">Blood Type:</span>
                  <span className="profile-sidebar__value">{profile?.blood_type || '—'}</span>
                </div>
              </div>

              <button
                className="btn-outline btn-block"
                onClick={() => navigate('/patients/profile')}
                id="dashboard-edit-profile-btn"
              >
                <IoPersonOutline /> Edit Profile
              </button>
            </div>
          </section>

          {/* Recent Activity */}
          <section className="dashboard-card">
            <div className="dashboard-card__header">
              <div>
                <h2 className="dashboard-card__title">Recent Activity</h2>
                <p className="dashboard-card__subtitle">Your recent account activity</p>
              </div>
            </div>
            <div className="dashboard-card__body activity-list">
              {activity.map((item) => (
                <ActivityItem key={item.id} activity={item} />
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
