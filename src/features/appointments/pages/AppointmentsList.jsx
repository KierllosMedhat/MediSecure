/**
 * Appointments List — with status filters and cancellation.
 * Owner: Kyrillos
 *
 * ERD refs:
 *   Appointment → Appointment_Id, Patient_Id (FK), Staff_Id (FK),
 *                  Scheduled_at, Duration_Min, Status, Type, Location, Notes
 *   Status: SCHEDULED | CONFIRMED | IN_PROGRESS | COMPLETED | CANCELLED | NO_SHOW
 */
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/hooks/useAuth';
import { Button, DataTable, StatusBadge, Modal } from '../../../components/ui';
import appointmentApi from '../../../api/services/appointmentService';
import paymentApi from '../../../api/services/paymentService';
import {
  IoAddOutline,
  IoSearchOutline,
  IoCloseCircleOutline,
} from 'react-icons/io5';
import './AppointmentPages.css';

/* ---------- Dummy appointment data ---------- */
const DUMMY_APPOINTMENTS = [
  {
    id: 1,
    patient_name: 'Omar Tarek',
    staff_name: 'Dr. Sara Ahmed',
    scheduled_at: '2026-05-17T09:00:00Z',
    duration_min: 30,
    type: 'Check-up',
    location: 'Room 201',
    status: 'SCHEDULED',
    notes: '',
  },
  {
    id: 2,
    patient_name: 'Noura Said',
    staff_name: 'Dr. Omar Hassan',
    scheduled_at: '2026-05-17T10:30:00Z',
    duration_min: 45,
    type: 'Follow-up',
    location: 'Room 105',
    status: 'CONFIRMED',
    notes: '',
  },
  {
    id: 3,
    patient_name: 'Ahmed Fathi',
    staff_name: 'Dr. Sara Ahmed',
    scheduled_at: '2026-05-16T14:00:00Z',
    duration_min: 60,
    type: 'Consultation',
    location: 'Room 302',
    status: 'IN_PROGRESS',
    notes: '',
  },
  {
    id: 4,
    patient_name: 'Sara Ali',
    staff_name: 'Dr. Khaled Mostafa',
    scheduled_at: '2026-05-15T11:00:00Z',
    duration_min: 30,
    type: 'Check-up',
    location: 'Room 201',
    status: 'COMPLETED',
    notes: 'Routine examination completed.',
  },
  {
    id: 5,
    patient_name: 'Hassan Youssef',
    staff_name: 'Dr. Omar Hassan',
    scheduled_at: '2026-05-14T16:00:00Z',
    duration_min: 30,
    type: 'Follow-up',
    location: 'Room 105',
    status: 'CANCELLED',
    notes: 'Patient requested reschedule.',
  },
  {
    id: 6,
    patient_name: 'Mona Ramadan',
    staff_name: 'Dr. Sara Ahmed',
    scheduled_at: '2026-05-13T08:30:00Z',
    duration_min: 45,
    type: 'Emergency',
    location: 'ER Bay 3',
    status: 'NO_SHOW',
    notes: '',
  },
];

function formatDateTime(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function AppointmentsList() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isBillingStaff = user?.role === 'BILLING_STAFF';
  const isPatient = user?.role === 'PATIENT';

  const [appointments, setAppointments] = useState(DUMMY_APPOINTMENTS);
  const [filtered, setFiltered] = useState(DUMMY_APPOINTMENTS);

  /* Filters */
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [fromDate, setFromDate] = useState('');

  /* Cancel modal */
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelLoading, setCancelLoading] = useState(false);

  /* Alert */
  const [alert, setAlert] = useState(null);

  /* Fetch appointments from API */
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const res = await appointmentApi.getAppointments();
        const data = res.data.results || res.data;
        setAppointments(data);
        setFiltered(data);
      } catch {
        // Use dummy data
        setAppointments(DUMMY_APPOINTMENTS);
        setFiltered(DUMMY_APPOINTMENTS);
      }
    };
    fetchAppointments();
  }, []);

  /* Apply filters */
  const applyFilters = () => {
    let result = [...appointments];
    if (statusFilter !== 'ALL') {
      result = result.filter((a) => a.status === statusFilter);
    }
    if (fromDate) {
      const from = new Date(fromDate);
      result = result.filter((a) => new Date(a.scheduled_at) >= from);
    }
    setFiltered(result);
  };

  const resetFilters = () => {
    setStatusFilter('ALL');
    setFromDate('');
    setFiltered(appointments);
  };

  /* Cancel appointment */
  const handleCancelConfirm = useCallback(async () => {
    if (!cancelTarget) return;
    setCancelLoading(true);
    try {
      await appointmentApi.cancelAppointment(cancelTarget.id, cancelReason);
      // Update local state
      const updated = appointments.map((a) =>
        a.id === cancelTarget.id
          ? { ...a, status: 'CANCELLED', notes: cancelReason }
          : a
      );
      setAppointments(updated);
      setFiltered(updated);
      setAlert({ type: 'success', message: `Appointment for ${cancelTarget.patient_name} cancelled.` });
    } catch {
      // Optimistic update for demo
      const updated = appointments.map((a) =>
        a.id === cancelTarget.id
          ? { ...a, status: 'CANCELLED', notes: cancelReason }
          : a
      );
      setAppointments(updated);
      setFiltered(updated);
      setAlert({ type: 'success', message: `Appointment for ${cancelTarget.patient_name} cancelled.` });
    } finally {
      setCancelLoading(false);
      setCancelTarget(null);
      setCancelReason('');
    }
  }, [cancelTarget, cancelReason, appointments]);

  /* Billing Handlers */
  const handleGenerateBill = async (appointmentId) => {
    try {
      await paymentApi.generateAppointmentBill(appointmentId, 150.00); // default amount for demo
      const res = await appointmentApi.getAppointments();
      const data = res.data.results || res.data;
      setAppointments(data);
      setFiltered(data);
      setAlert({ type: 'success', message: 'Bill generated successfully.' });
    } catch (err) {
      setAlert({ type: 'error', message: 'Failed to generate bill.' });
    }
  };

  const handleMarkPaid = async (paymentId) => {
    try {
      await paymentApi.markPaymentPaid(paymentId);
      const res = await appointmentApi.getAppointments();
      const data = res.data.results || res.data;
      setAppointments(data);
      setFiltered(data);
      setAlert({ type: 'success', message: 'Bill marked as paid.' });
    } catch (err) {
      setAlert({ type: 'error', message: 'Failed to mark bill as paid.' });
    }
  };

  /* Table columns */
  const columns = [
    { key: 'patient_name', label: 'Patient' },
    { key: 'staff_name', label: 'Staff' },
    {
      key: 'scheduled_at',
      label: 'Date & Time',
      render: (value) => formatDateTime(value),
    },
    {
      key: 'duration_min',
      label: 'Duration',
      render: (value) => `${value} min`,
    },
    { key: 'appointment_type', label: 'Type' },
    { key: 'location', label: 'Location' },
    {
      key: 'status',
      label: 'Status',
      render: (value) => <StatusBadge status={value} />,
    },
    {
      key: 'bill_status',
      label: 'Bill',
      render: (_, row) => {
        if (!row.payment_id) {
          if (isBillingStaff && row.status === 'COMPLETED') {
            return (
              <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); handleGenerateBill(row.id); }}>
                Generate Bill
              </Button>
            );
          }
          return <span style={{ color: 'var(--color-text-muted)' }}>No Bill</span>;
        }
        if (row.payment_status === 'PENDING') {
          return (
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <StatusBadge status="PENDING" />
              {isBillingStaff && (
                <Button size="sm" variant="primary" onClick={(e) => { e.stopPropagation(); handleMarkPaid(row.payment_id); }}>
                  Mark Paid
                </Button>
              )}
            </div>
          );
        }
        return <StatusBadge status={row.payment_status} />;
      }
    },
    {
      key: 'actions',
      label: '',
      render: (_, row) => {
        const canCancel = !['CANCELLED', 'COMPLETED', 'NO_SHOW'].includes(row.status);
        return (
          <div style={{ display: 'flex', gap: '8px' }}>
            {!isPatient && (
              <Button
                size="sm"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/appointments/${row.id}/edit`);
                }}
              >
                Edit
              </Button>
            )}
            {canCancel && (
              <button
                className="appt-cancel-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  setCancelTarget(row);
                }}
              >
                <IoCloseCircleOutline /> Cancel
              </button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="appointments-page animate-fade-in">
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h1 className="page-title">Appointments</h1>
            <p className="page-subtitle">View and manage all appointments.</p>
          </div>
          {!isPatient && (
            <Button variant="primary" onClick={() => navigate('/appointments/new')}>
              <IoAddOutline /> New Appointment
            </Button>
          )}
        </div>
      </div>

      {alert && (
        <div className={`appt-alert appt-alert--${alert.type}`}>
          {alert.message}
        </div>
      )}

      {/* Filter Bar */}
      <div className="appt-filter-bar">
        <div className="appt-filter-field">
          <label htmlFor="appt-status-filter">Status</label>
          <select
            id="appt-status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Statuses</option>
            <option value="SCHEDULED">Scheduled</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="NO_SHOW">No Show</option>
          </select>
        </div>

        <div className="appt-filter-field">
          <label htmlFor="appt-from-date">From Date</label>
          <input
            id="appt-from-date"
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />
        </div>

        <div className="appt-filter-actions">
          <Button variant="primary" size="sm" onClick={applyFilters}>
            <IoSearchOutline /> Filter
          </Button>
          <Button variant="ghost" size="sm" onClick={resetFilters}>
            Reset
          </Button>
        </div>
      </div>

      {/* Appointments DataTable */}
      <DataTable
        columns={columns}
        data={filtered}
        emptyMessage="No appointments found matching your filters."
      />

      {/* Cancel Appointment Modal */}
      <Modal
        isOpen={Boolean(cancelTarget)}
        onClose={() => {
          setCancelTarget(null);
          setCancelReason('');
        }}
        title="Cancel Appointment"
        size="sm"
      >
        <div className="cancel-modal-body">
          <p>
            Are you sure you want to cancel the appointment for{' '}
            <strong>{cancelTarget?.patient_name}</strong> with{' '}
            <strong>{cancelTarget?.staff_name}</strong>?
          </p>
          <div>
            <label
              htmlFor="cancel-reason"
              style={{
                display: 'block',
                fontSize: 'var(--font-size-sm)',
                fontWeight: 'var(--font-weight-medium)',
                marginBottom: 'var(--space-1)',
                color: 'var(--color-text-secondary)',
              }}
            >
              Reason for cancellation
            </label>
            <textarea
              id="cancel-reason"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Enter the reason for cancelling this appointment…"
            />
          </div>
          <div className="cancel-modal-actions">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setCancelTarget(null);
                setCancelReason('');
              }}
            >
              Keep Appointment
            </Button>
            <Button
              variant="danger"
              size="sm"
              loading={cancelLoading}
              onClick={handleCancelConfirm}
            >
              Confirm Cancellation
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
