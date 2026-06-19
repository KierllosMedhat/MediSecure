/**
 * Appointment Form Page (Create / Edit)
 * Owner: Kyrillos
 *
 * ERD refs:
 *   Appointment → Patient_Id, Staff_Id, Scheduled_at, Duration_Min,
 *                  Type, Location, Notes, Status
 */
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Input } from '../../../components/ui';
import appointmentApi from '../../../api/services/appointmentService';
import patientApi from '../../../api/services/patientService';
import staffApi from '../../../api/services/staffService';
import paymentApi from '../../../api/services/paymentService';
import { useAuth } from '../../auth/hooks/useAuth';
import { IoArrowBackOutline, IoCalendarOutline, IoCardOutline } from 'react-icons/io5';
import './AppointmentPages.css';

const TYPES = [
  { value: 'IN_PERSON', label: 'In-Person' },
  { value: 'TELEMEDICINE', label: 'Telemedicine' },
  { value: 'FOLLOW_UP', label: 'Follow-Up' },
  { value: 'EMERGENCY', label: 'Emergency' },
];
const DURATIONS = [15, 30, 45, 60, 90, 120];

const INIT = {
  patient_id: '', staff_id: '', scheduled_at: '',
  duration_min: '30', type: '', location: '', notes: '', status: 'SCHEDULED',
  bill_amount: ''
};

export default function AppointmentForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const { user } = useAuth();
  const isBillingStaff = user?.role === 'BILLING_STAFF' || user?.role === 'ADMIN';
  const isPatient = user?.role === 'PATIENT';

  const [form, setForm] = useState(INIT);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);

  const [patients, setPatients] = useState([]);
  const [staff, setStaff] = useState([]);
  
  // Billing specific state
  const [billStatus, setBillStatus] = useState(null);
  const [paymentId, setPaymentId] = useState(null);
  const [billingLoading, setBillingLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const sRes = await staffApi.getStaffList();
        setStaff(sRes.data.results || sRes.data || []);
        
        if (!isPatient) {
          const pRes = await patientApi.getPatients();
          setPatients(pRes.data.results || pRes.data || []);
        }

        if (isEdit) {
          const apptRes = await appointmentApi.getAppointmentById(id);
          const appt = apptRes.data;
          
          setForm({
            patient_id: appt.patient.id || appt.patient,
            staff_id: appt.staff.id || appt.staff,
            scheduled_at: appt.scheduled_at ? appt.scheduled_at.slice(0, 16) : '',
            duration_min: appt.duration_min || '30',
            type: appt.appointment_type || '',
            location: appt.location || '',
            notes: appt.notes || '',
            status: appt.status || 'SCHEDULED',
            bill_amount: appt.payment_amount || ''
          });
          
          setBillStatus(appt.payment_status);
          setPaymentId(appt.payment_id);
        }
      } catch (err) {
        console.error("Failed to load data", err);
        setAlert({ type: 'error', message: 'Failed to load appointment data.' });
      }
    };
    fetchData();
  }, [id, isEdit]);

  const set = (f) => (e) => {
    setForm((p) => ({ ...p, [f]: e.target.value }));
    if (errors[f]) setErrors((p) => ({ ...p, [f]: undefined }));
  };

  const validate = () => {
    const e = {};
    if (!isPatient && !String(form.patient_id).trim()) e.patient_id = 'Patient is required';
    if (!String(form.staff_id).trim()) e.staff_id = 'Doctor is required';
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
      const payload = {
        ...form,
        staff: Number(form.staff_id),
        appointment_type: form.type,
        duration_min: Number(form.duration_min)
      };
      if (!isPatient) {
        payload.patient = Number(form.patient_id);
      }
      delete payload.patient_id;
      delete payload.staff_id;
      delete payload.type;
      
      if (isEdit) {
        await appointmentApi.updateAppointment(id, payload);
        setAlert({ type: 'success', message: 'Appointment updated successfully!' });
      } else {
        const res = await appointmentApi.createAppointment(payload);
        if (isBillingStaff && form.bill_amount) {
          await paymentApi.generateAppointmentBill(res.data.id, Number(form.bill_amount));
        }
        setAlert({ type: 'success', message: 'Appointment created successfully!' });
        setTimeout(() => navigate('/appointments'), 1200);
      }
    } catch (err) {
      const msg = err.response?.data 
        ? JSON.stringify(err.response.data) 
        : `Failed to ${isEdit ? 'update' : 'create'} appointment.`;
      setAlert({ type: 'error', message: msg });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateBill = async () => {
    try {
      setBillingLoading(true);
      const amount = form.bill_amount ? Number(form.bill_amount) : 150.00;
      const res = await paymentApi.generateAppointmentBill(id, amount);
      setBillStatus('PENDING');
      setPaymentId(res.data.id);
      setAlert({ type: 'success', message: 'Bill generated successfully!' });
    } catch (err) {
      setAlert({ type: 'error', message: 'Failed to generate bill.' });
    } finally {
      setBillingLoading(false);
    }
  };

  const handleProcessPayment = async () => {
    if (!paymentId) return;
    try {
      setBillingLoading(true);
      await paymentApi.markPaymentPaid(paymentId);
      setBillStatus('PAID');
      setAlert({ type: 'success', message: 'Payment processed successfully!' });
    } catch (err) {
      setAlert({ type: 'error', message: 'Failed to process payment.' });
    } finally {
      setBillingLoading(false);
    }
  };

  return (
    <div className="appointments-page animate-fade-in">
      <div className="page-header">
        <button className="appt-cancel-btn" style={{ background: 'var(--color-primary-50)', color: 'var(--color-primary)', marginBottom: 'var(--space-3)' }} onClick={() => navigate('/appointments')}>
          <IoArrowBackOutline /> Back to Appointments
        </button>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 className="page-title">{isEdit ? 'Edit Appointment' : 'New Appointment'}</h1>
            <p className="page-subtitle">{isEdit ? 'Update appointment details.' : 'Schedule a new appointment.'}</p>
          </div>
          {isEdit && isBillingStaff && (
            <div className="billing-actions" style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
              {!billStatus && (
                <Button variant="primary" onClick={handleGenerateBill} loading={billingLoading} disabled={!form.bill_amount}>
                  <IoCardOutline /> Generate Bill
                </Button>
              )}
              {billStatus === 'PENDING' && (
                <Button variant="success" onClick={handleProcessPayment} loading={billingLoading}>
                  <IoCardOutline /> Process Payment
                </Button>
              )}
              {billStatus === 'PAID' && (
                <span style={{ padding: '0.5rem 1rem', background: 'var(--color-success)', color: 'white', borderRadius: '4px', fontWeight: 'bold' }}>
                  PAID
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {alert && <div className={`appt-alert appt-alert--${alert.type}`}>{alert.message}</div>}

      <form onSubmit={handleSubmit}>
        <div className="appt-form-card">
          <div className="appt-form-body">
            <div className="appt-form-grid">
              {!isPatient && (
                <div className="input-group input-group--full">
                  <label htmlFor="appt-patient" className="input-group__label">Patient</label>
                  <select id="appt-patient" className={`appt-form-select ${errors.patient_id ? 'input-group__field--error' : ''}`} value={form.patient_id} onChange={set('patient_id')}>
                    <option value="">Select a patient…</option>
                    {patients.map(p => (
                      <option key={p.id} value={p.id}>{p.full_name || p.first_name + ' ' + p.last_name || p.email || `Patient #${p.id}`}</option>
                    ))}
                  </select>
                  {errors.patient_id && <span className="input-group__error">{errors.patient_id}</span>}
                </div>
              )}

              <div className="input-group input-group--full">
                <label htmlFor="appt-staff" className="input-group__label">Doctor</label>
                <select id="appt-staff" className={`appt-form-select ${errors.staff_id ? 'input-group__field--error' : ''}`} value={form.staff_id} onChange={set('staff_id')}>
                  <option value="">Select a doctor…</option>
                  {staff.filter(s => s.role === 'DOCTOR' || s.role === 'doctor').map(s => (
                    <option key={s.id} value={s.id}>
                      {s.full_name || s.email || `Doctor #${s.id}`}
                    </option>
                  ))}
                </select>
                {errors.staff_id && <span className="input-group__error">{errors.staff_id}</span>}
              </div>
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
                  {TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
                {errors.type && <span className="input-group__error">{errors.type}</span>}
              </div>
              
              {isEdit && (
                <div className="input-group input-group--full">
                  <label htmlFor="appt-status" className="input-group__label">Status</label>
                  <select id="appt-status" className={`appt-form-select`} value={form.status} onChange={set('status')}>
                    <option value="SCHEDULED">Scheduled</option>
                    <option value="CONFIRMED">Confirmed</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>
                    <option value="NO_SHOW">No Show</option>
                  </select>
                </div>
              )}

              <Input id="appt-loc" label="Location" value={form.location} onChange={set('location')} error={errors.location} placeholder="e.g. Room 201" />
              
              {isBillingStaff && (
                <Input 
                  id="appt-bill" 
                  label="Bill Amount ($)" 
                  type="number" 
                  value={form.bill_amount} 
                  onChange={set('bill_amount')} 
                  placeholder="e.g. 150.00"
                  disabled={!!billStatus} 
                />
              )}

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
            <Button variant="primary" type="submit" loading={loading}><IoCalendarOutline /> {isEdit ? 'Save Changes' : 'Create Appointment'}</Button>
          </div>
        </div>
      </form>
    </div>
  );
}
