/**
 * Reusable Status Badge component
 * Owner: Kyrillos (Shared UI)
 */
import './StatusBadge.css';

const STATUS_MAP = {
  /* Appointments (ERD: Status) */
  SCHEDULED: { label: 'Scheduled', variant: 'info' },
  CONFIRMED: { label: 'Confirmed', variant: 'primary' },
  IN_PROGRESS: { label: 'In Progress', variant: 'warning' },
  COMPLETED: { label: 'Completed', variant: 'success' },
  CANCELLED: { label: 'Cancelled', variant: 'danger' },
  NO_SHOW: { label: 'No Show', variant: 'muted' },

  /* Payments (ERD: Status) */
  PENDING: { label: 'Pending', variant: 'warning' },
  FAILED: { label: 'Failed', variant: 'danger' },

  /* Payment Gateway Types (ERD: Gateway_Type) */
  FAWRY: { label: 'Fawry', variant: 'info' },
  INTERNATIONAL: { label: 'International', variant: 'primary' },

  /* Consent (ERD: Is_Active) */
  ACTIVE: { label: 'Active', variant: 'success' },
  REVOKED: { label: 'Revoked', variant: 'danger' },

  /* Staff status */
  ENABLED: { label: 'Active', variant: 'success' },
  DISABLED: { label: 'Inactive', variant: 'muted' },

  /* Medical Record Types (ERD: Record_type) */
  DIAGNOSIS: { label: 'Diagnosis', variant: 'info' },
  LAB_RESULT: { label: 'Lab Result', variant: 'primary' },
  PRESCRIPTION: { label: 'Prescription', variant: 'warning' },
  IMAGING: { label: 'Imaging', variant: 'muted' },

  /* User Roles (ERD: User.Role) */
  DOCTOR: { label: 'Doctor', variant: 'primary' },
  NURSE: { label: 'Nurse', variant: 'info' },
  BILLING_STAFF: { label: 'Billing', variant: 'warning' },
  ADMIN: { label: 'Admin', variant: 'danger' },
  PATIENT: { label: 'Patient', variant: 'success' },
};

export default function StatusBadge({ status, className = '' }) {
  const config = STATUS_MAP[status] || { label: status, variant: 'muted' };

  return (
    <span className={`status-badge status-badge--${config.variant} ${className}`}>
      {config.label}
    </span>
  );
}
