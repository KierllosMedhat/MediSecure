/**
 * Create Appointment Page
 * Owner: Kyrillos
 *
 * ERD refs:
 *   Appointment → Patient_Id, Staff_Id, Scheduled_at, Duration_Min,
 *                  Type, Location, Notes
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Input } from '../../../components/ui';
import appointmentApi from '../../../api/services/appointmentService';
import { IoArrowBackOutline, IoCalendarOutline } from 'react-icons/io5';
import './AppointmentPages.css';

const TYPES = ['Check-up', 'Follow-up', 'Consultation', 'Emergency', 'Lab Work', 'Imaging'];
const DURATIONS = [15, 30, 45, 60, 90, 120];

const INIT = {
  patient_id: '', staff_id: '', scheduled_at: '',
  duration_min: '30', type: '', location: '', notes: '',
};

export default function CreateAppointment() {
  const navigate = useNavigate();
  const [form, setForm] = useState(INIT);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);

  const set = (f) => (e) => {
    setForm((p) => ({ ...p, [f]: e.target.value }));
    if (errors[f]) setErrors((p) => ({ ...p, [f]: undefined }));
  };

  const validate = () => {
    const e = {};
    if (!form.patient_id.trim()) e.patient_id = 'Patient ID is required';
    if (!form.staff_id.trim()) e.staff_id = 'Staff ID is required';
    if (!form.scheduled_at) e.scheduled_at = 'Date & time is required';
    if (!form.type) e.type = 'Type is required';
    if (!form.location.trim()) e.location = 'Location is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setAlert(null);
    try {
      await appointmentApi.createAppointment({ ...form, duration_min: Number(form.duration_min) });
      setAlert({ type: 'success', message: 'Appointment created successfully!' });
      setTimeout(() => navigate('/appointments'), 1200);
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.message || 'Failed to create appointment.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="appointments-page animate-fade-in">
      <div className="page-header">
        <button className="appt-cancel-btn" style={{ background: 'var(--color-primary-50)', color: 'var(--color-primary)', marginBottom: 'var(--space-3)' }} onClick={() => navigate('/appointments')}>
          <IoArrowBackOutline /> Back to Appointments
        </button>
        <h1 className="page-title">New Appointment</h1>
        <p className="page-subtitle">Schedule a new appointment.</p>
      </div>

      {alert && <div className={`appt-alert appt-alert--${alert.type}`}>{alert.message}</div>}

      <form onSubmit={handleSubmit}>
        <div className="appt-form-card">
          <div className="appt-form-body">
            <div className="appt-form-grid">
              <Input id="appt-patient" label="Patient ID" value={form.patient_id} onChange={set('patient_id')} error={errors.patient_id} placeholder="Enter patient ID" />
              <Input id="appt-staff" label="Staff ID" value={form.staff_id} onChange={set('staff_id')} error={errors.staff_id} placeholder="Enter staff ID" />
              <Input id="appt-date" label="Date & Time" type="datetime-local" value={form.scheduled_at} onChange={set('scheduled_at')} error={errors.scheduled_at} />
              <div className="input-group input-group--full">
                <label htmlFor="appt-dur" className="input-group__label">Duration (minutes)</label>
                <select id="appt-dur" className="appt-form-select" value={form.duration_min} onChange={set('duration_min')}>
                  {DURATIONS.map((d) => <option key={d} value={d}>{d} min</option>)}
                </select>
              </div>
              <div className="input-group input-group--full">
                <label htmlFor="appt-type" className="input-group__label">Appointment Type</label>
                <select id="appt-type" className={`appt-form-select ${errors.type ? 'input-group__field--error' : ''}`} value={form.type} onChange={set('type')}>
                  <option value="">Select type…</option>
                  {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
                {errors.type && <span className="input-group__error">{errors.type}</span>}
              </div>
              <Input id="appt-loc" label="Location" value={form.location} onChange={set('location')} error={errors.location} placeholder="e.g. Room 201" />
              <div className="appt-form-full">
                <div className="input-group input-group--full">
                  <label htmlFor="appt-notes" className="input-group__label">Notes</label>
                  <textarea id="appt-notes" className="appt-form-textarea" value={form.notes} onChange={set('notes')} placeholder="Additional notes (optional)" />
                </div>
              </div>
            </div>
          </div>
          <div className="appt-form-actions">
            <Button variant="ghost" onClick={() => navigate('/appointments')} type="button">Cancel</Button>
            <Button variant="primary" type="submit" loading={loading}><IoCalendarOutline /> Create Appointment</Button>
          </div>
        </div>
      </form>
    </div>
  );
}
