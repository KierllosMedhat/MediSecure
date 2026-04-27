/**
 * Appointments List — with status filters and cancellation.
 * Owner: Kyrillos
 *
 * ERD refs:
 *   Appointment → Appointment_Id, Patient_Id (FK), Staff_Id (FK),
 *                  Scheduled_at, Duration_Min, Status, Type, Location, Notes
 *   Status: SCHEDULED | CONFIRMED | IN_PROGRESS | COMPLETED | CANCELLED | NO_SHOW
 *
 * TODO:
 * - Fetch from appointmentApi.getAppointments({ status, from_date })
 * - Filter bar: Status dropdown, from_date picker
 * - DataTable columns: Patient name, Staff name, Scheduled_at, Duration_Min,
 *   Type, Location, Status (StatusBadge), cancel action
 * - Cancel: open Modal → reason (stored in Notes) →
 *   appointmentApi.cancelAppointment(id, reason)
 * - "New Appointment" button → /appointments/new
 */
import { Button, DataTable, StatusBadge, Modal, Input } from '../../../components/ui';
import './AppointmentPages.css';

export default function AppointmentsList() {
  return (
    <div className="appointments-page">
      <div className="page-header">
        <h1 className="page-title">Appointments</h1>
        <p className="page-subtitle">View and manage all appointments.</p>
      </div>

      {/* TODO: Filter bar (Status, from_date) */}
      {/* TODO: Appointments DataTable */}
      {/* TODO: Cancel appointment modal */}
    </div>
  );
}
