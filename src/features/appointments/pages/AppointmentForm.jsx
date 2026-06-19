/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Input } from '../../../components/ui';
import appointmentApi from '../../../api/services/appointmentService';
import patientApi from '../../../api/services/patientService';
import staffApi from '../../../api/services/staffService';
import hospitalApi from '../../../api/services/hospitalService';
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


const INIT = {
  patient_id: '', hospital_id: '', department: '', staff_id: '',
  scheduled_date: '', scheduled_time: '',
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
  const [hospitals, setHospitals] = useState([]);
  const [bookedSlots, setBookedSlots] = useState([]);
  
  const [billStatus, setBillStatus] = useState(null);
  const [paymentId, setPaymentId] = useState(null);
  const [billingLoading, setBillingLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [hRes, sRes] = await Promise.all([
          hospitalApi.getHospitals(),
          staffApi.getStaffList(),
        ]);
        
        setHospitals(hRes.data.results || hRes.data || []);
        const staffData = sRes.data.results || sRes.data || [];
        setStaff(staffData);
        
        if (!isPatient) {
          const pRes = await patientApi.getPatients();
          setPatients(pRes.data.results || pRes.data || []);
        }

        if (isEdit) {
          const apptRes = await appointmentApi.getAppointmentById(id);
          const appt = apptRes.data;
          
          const dtParts = appt.scheduled_at ? appt.scheduled_at.split('T') : ['', ''];
          const docId = appt.staff.id || appt.staff;
          const assignedDoc = staffData.find(s => s.id === Number(docId));

          setForm({
            patient_id: appt.patient.id || appt.patient || '',
            hospital_id: assignedDoc?.hospital || '',
            department: assignedDoc?.department || '',
            staff_id: docId || '',
            scheduled_date: dtParts[0],
            scheduled_time: dtParts[1] ? dtParts[1].slice(0, 5) : '',
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
        setAlert({ type: 'error', message: 'Failed to load form data.' });
      }
    };
    fetchData();
  }, [id, isEdit]);

  // Fetch booked slots for double-booking prevention
  useEffect(() => {
    if (form.staff_id && form.scheduled_date) {
      appointmentApi.getAppointments({ staff: form.staff_id }).then(res => {
         const appts = res.data.results || res.data || [];
         const dayAppts = appts.filter(a => {
           // Skip current editing appt
           if (isEdit && Number(a.id) === Number(id)) return false;
           return a.scheduled_at && a.scheduled_at.startsWith(form.scheduled_date) && !['CANCELLED', 'NO_SHOW'].includes(a.status);
         });
         
         const booked = dayAppts.map(a => {
            const t = a.scheduled_at.split('T')[1].slice(0, 5);
            return { start: t, duration: a.duration_min };
         });
         setBookedSlots(booked);
      }).catch(err => console.error(err));
    } else {
      setBookedSlots([]);
    }
  }, [form.staff_id, form.scheduled_date, id, isEdit]);

  // Derived cascade options
  const availableDepartments = useMemo(() => {
    if (!form.hospital_id) return [];
    const deps = new Set(staff.filter(s => s.hospital === Number(form.hospital_id) && s.role === 'DOCTOR').map(s => s.department));
    return Array.from(deps).filter(Boolean);
  }, [form.hospital_id, staff]);

  const availableDoctors = useMemo(() => {
    if (!form.hospital_id || !form.department) return [];
    return staff.filter(s => s.hospital === Number(form.hospital_id) && s.department === form.department && s.role === 'DOCTOR');
  }, [form.hospital_id, form.department, staff]);

  const availableTimeSlots = useMemo(() => {
    if (!form.staff_id || !form.scheduled_date || !form.duration_min) return [];
    
    const selectedDoc = staff.find(s => s.id === Number(form.staff_id));
    if (!selectedDoc || !selectedDoc.working_hours) return [];

    const dateObj = new Date(`${form.scheduled_date}T00:00:00`);
    if (isNaN(dateObj.getTime())) return [];

    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayName = days[dateObj.getDay()];
    const daySchedule = selectedDoc.working_hours[dayName];
    
    if (!daySchedule || !daySchedule.active) return [];

    const slots = [];
    const durMin = Number(form.duration_min);
    
    let [currH, currM] = daySchedule.start.split(':').map(Number);
    const [endH, endM] = daySchedule.end.split(':').map(Number);
    const endTotalMins = endH * 60 + endM;

    while ((currH * 60 + currM + durMin) <= endTotalMins) {
      const hh = String(currH).padStart(2, '0');
      const mm = String(currM).padStart(2, '0');
      
      const slotTotalMins = currH * 60 + currM;
      const slotEndMins = slotTotalMins + durMin;
      
      let isOverlap = false;
      for (const b of bookedSlots) {
         const [bh, bm] = b.start.split(':').map(Number);
         const bTotalMins = bh * 60 + bm;
         const bEndMins = bTotalMins + b.duration;
         
         if (slotTotalMins < bEndMins && slotEndMins > bTotalMins) {
            isOverlap = true;
            break;
         }
      }
      
      if (!isOverlap) {
         slots.push(`${hh}:${mm}`);
      }
      
      currM += durMin;
      currH += Math.floor(currM / 60);
      currM %= 60;
    }
    
    return slots;
  }, [form.staff_id, form.scheduled_date, form.duration_min, staff, bookedSlots]);

  const set = (f) => (e) => {
    const val = e.target.value;
    setForm((p) => {
      const next = { ...p, [f]: val };
      if (f === 'hospital_id') {
        next.department = '';
        next.staff_id = '';
      }
      if (f === 'department') {
        next.staff_id = '';
      }
      if (f === 'scheduled_date' || f === 'duration_min') {
        next.scheduled_time = '';
      }
      return next;
    });
    if (errors[f]) setErrors((p) => ({ ...p, [f]: undefined }));
    if (f === 'scheduled_date' && errors.scheduled_at) setErrors(p => ({ ...p, scheduled_at: undefined }));
    if (f === 'scheduled_time' && errors.scheduled_at) setErrors(p => ({ ...p, scheduled_at: undefined }));
  };

  const validate = () => {
    const e = {};
    if (!isPatient && !String(form.patient_id).trim()) e.patient_id = 'Patient is required';
    if (!form.hospital_id) e.hospital_id = 'Hospital is required';
    if (!form.department) e.department = 'Department is required';
    if (!String(form.staff_id).trim()) e.staff_id = 'Doctor is required';
    if (!form.scheduled_date) e.scheduled_date = 'Date is required';
    if (!form.scheduled_time) e.scheduled_time = 'Time is required';
    if (!form.type) e.type = 'Type is required';
    if (!form.location.trim()) e.location = 'Location is required';
    
    // Fallback datetime error summary
    if (!form.scheduled_date || !form.scheduled_time) {
      e.scheduled_at = 'Complete date and time are required';
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setAlert(null);
    try {
      const scheduled_at = `${form.scheduled_date}T${form.scheduled_time}:00`;
      
      const payload = {
        ...form,
        staff: Number(form.staff_id),
        appointment_type: form.type,
        duration_min: Number(form.duration_min),
        scheduled_at
      };
      
      if (!isPatient) {
        payload.patient = Number(form.patient_id);
      }
      
      delete payload.patient_id;
      delete payload.staff_id;
      delete payload.type;
      delete payload.hospital_id;
      delete payload.department;
      delete payload.scheduled_date;
      delete payload.scheduled_time;
      
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
      setAlert({ type: 'error', message: `${err.message}: Failed to generate bill.` });
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
      setAlert({ type: 'error', message: `${err.message}: Failed to process payment.` });
    } finally {
      setBillingLoading(false);
    }
  };

  const selectedDoctor = staff.find(s => s.id === Number(form.staff_id));

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

              {/* Hospital Dropdown */}
              <div className="input-group">
                <label htmlFor="appt-hospital" className="input-group__label">Hospital</label>
                <select id="appt-hospital" className={`appt-form-select ${errors.hospital_id ? 'input-group__field--error' : ''}`} value={form.hospital_id} onChange={set('hospital_id')}>
                  <option value="">Select a hospital…</option>
                  {hospitals.map(h => (
                    <option key={h.id} value={h.id}>{h.name}</option>
                  ))}
                </select>
                {errors.hospital_id && <span className="input-group__error">{errors.hospital_id}</span>}
              </div>

              {/* Department Dropdown */}
              <div className="input-group">
                <label htmlFor="appt-department" className="input-group__label">Department</label>
                <select id="appt-department" className={`appt-form-select ${errors.department ? 'input-group__field--error' : ''}`} value={form.department} onChange={set('department')} disabled={!form.hospital_id}>
                  <option value="">Select a department…</option>
                  {availableDepartments.map(dep => (
                    <option key={dep} value={dep}>{dep}</option>
                  ))}
                </select>
                {errors.department && <span className="input-group__error">{errors.department}</span>}
              </div>

              {/* Doctor Dropdown */}
              <div className="input-group input-group--full">
                <label htmlFor="appt-staff" className="input-group__label">Doctor</label>
                <select id="appt-staff" className={`appt-form-select ${errors.staff_id ? 'input-group__field--error' : ''}`} value={form.staff_id} onChange={set('staff_id')} disabled={!form.department}>
                  <option value="">Select a doctor…</option>
                  {availableDoctors.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.full_name || s.email || `Doctor #${s.id}`}
                    </option>
                  ))}
                </select>
                {errors.staff_id && <span className="input-group__error">{errors.staff_id}</span>}
                {selectedDoctor?.working_hours && (
                  <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--color-text-secondary)', background: 'var(--color-bg-secondary)', padding: '0.5rem', borderRadius: 'var(--radius-sm)' }}>
                    <strong>Working Hours:</strong>
                    <ul style={{ margin: '0.25rem 0 0 1rem', padding: 0 }}>
                      {Object.entries(selectedDoctor.working_hours).filter(([h]) => h.active).map(([day, h]) => (
                        <li key={day} style={{ textTransform: 'capitalize' }}>
                          {day}: {h.start} - {h.end}
                        </li>
                      ))}
                      {Object.values(selectedDoctor.working_hours).filter(h => h.active).length === 0 && (
                        <li>No working hours defined.</li>
                      )}
                    </ul>
                  </div>
                )}
              </div>

              {/* Date Input */}
              <div className="input-group">
                <Input 
                  id="appt-date" 
                  label="Date" 
                  type="date" 
                  value={form.scheduled_date} 
                  onChange={set('scheduled_date')} 
                  error={errors.scheduled_date} 
                />
              </div>

              {/* Timeslot Dropdown */}
              <div className="input-group">
                <label htmlFor="appt-time" className="input-group__label">Time Slot</label>
                <select 
                  id="appt-time" 
                  className={`appt-form-select ${errors.scheduled_time ? 'input-group__field--error' : ''}`} 
                  value={form.scheduled_time} 
                  onChange={set('scheduled_time')}
                  disabled={!form.scheduled_date || !form.staff_id || availableTimeSlots.length === 0}
                >
                  <option value="">Select a time…</option>
                  {availableTimeSlots.map(time => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
                {errors.scheduled_time && <span className="input-group__error">{errors.scheduled_time}</span>}
                {form.scheduled_date && form.staff_id && availableTimeSlots.length === 0 && (
                  <span className="input-group__error" style={{ color: 'var(--color-warning)' }}>
                    No available timeslots on this date.
                  </span>
                )}
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
              
              {!isPatient && (
                <Input 
                  id="appt-bill" 
                  label="Bill Amount ($)" 
                  type="number" 
                  value={form.bill_amount} 
                  onChange={set('bill_amount')} 
                  placeholder="e.g. 150.00"
                  //disabled={!!billStatus} 
                />
              )|| isPatient && (
                <Input
                  id="appt-bill" 
                  label="Bill Amount ($)" 
                  type="number" 
                  value={150.00}  
                  placeholder="150.00"
                  disabled
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
