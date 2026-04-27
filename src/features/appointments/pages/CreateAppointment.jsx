/**
 * Create Appointment Page
 * Owner: Kyrillos
 *
 * ERD refs:
 *   Appointment → Patient_Id, Staff_Id, Scheduled_at, Duration_Min,
 *                  Type, Location, Notes
 *
 * TODO:
 * - Form fields: patient_id, staff_id, scheduled_at (datetime),
 *   duration_min, type, location, notes
 * - Submit: appointmentApi.createAppointment(form)
 * - Navigate to /appointments on success
 */
import { Card, Button, Input } from '../../../components/ui';
import './AppointmentPages.css';

export default function CreateAppointment() {
  return (
    <div className="appointments-page">
      <div className="page-header">
        <h1 className="page-title">New Appointment</h1>
        <p className="page-subtitle">Schedule a new appointment.</p>
      </div>

      {/* TODO: Appointment form (patient_id, staff_id, scheduled_at, duration_min, type, location, notes) */}
    </div>
  );
}
