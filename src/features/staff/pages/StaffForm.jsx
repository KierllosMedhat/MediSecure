/**
 * Staff Form — Create / Edit / Deactivate staff accounts.
 * Owner: Kyrillos
 *
 * ERD refs:
 *   User  → Email, First_Name, Middle_Name, Last_Name, Phone_Number, Role
 *   Staff → Hospital_Id (FK → Hospital), Department, License_no, Address
 *   Hospital → Hospital_Id, Name (for dropdown)
 */
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Input } from '../../../components/ui';
import staffApi from '../../../api/services/staffService';
import hospitalApi from '../../../api/services/hospitalService';
import {
  IoPersonOutline,
  IoBriefcaseOutline,
  IoArrowBackOutline,
  IoTrashOutline,
} from 'react-icons/io5';
import './StaffPages.css';

/* ---------- Dummy hospitals ---------- */
const DUMMY_HOSPITALS = [
  { hospital_id: 1, name: 'Cairo Medical Center' },
  { hospital_id: 2, name: 'Alexandria General Hospital' },
  { hospital_id: 3, name: 'Giza University Hospital' },
];

const DEPARTMENTS = [
  'Cardiology', 'Radiology', 'Emergency', 'Neurology',
  'Pediatrics', 'Orthopedics', 'Finance', 'Administration',
];

const INITIAL_FORM = {
  email: '',
  first_name: '',
  middle_name: '',
  last_name: '',
  phone_number: '',
  role: 'DOCTOR',
  hospital_id: '',
  department: '',
  license_no: '',
  address: '',
};

export default function StaffForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState(INITIAL_FORM);
  const [hospitals, setHospitals] = useState(DUMMY_HOSPITALS);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null); // { type: 'success'|'error', message }

  /* Fetch hospitals for dropdown */
  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        const res = await hospitalApi.getHospitals();
        setHospitals(res.data);
      } catch {
        // Use dummy data on failure
        setHospitals(DUMMY_HOSPITALS);
      }
    };
    fetchHospitals();
  }, []);

  /* If edit mode, fetch existing staff data */
  useEffect(() => {
    if (!isEdit) return;
    const fetchStaff = async () => {
      try {
        const res = await staffApi.getStaffById(id);
        setForm({
          email: res.data.email || '',
          first_name: res.data.first_name || '',
          middle_name: res.data.middle_name || '',
          last_name: res.data.last_name || '',
          phone_number: res.data.phone_number || '',
          role: res.data.role || 'DOCTOR',
          hospital_id: res.data.hospital_id || '',
          department: res.data.department || '',
          license_no: res.data.license_no || '',
          address: res.data.address || '',
        });
      } catch {
        setAlert({ type: 'error', message: 'Failed to load staff data.' });
      }
    };
    fetchStaff();
  }, [id, isEdit]);

  /* Handle input change */
  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  /* Simple validation */
  const validate = () => {
    const newErrors = {};
    if (!form.email.trim()) newErrors.email = 'Email is required';
    if (!form.first_name.trim()) newErrors.first_name = 'First name is required';
    if (!form.last_name.trim()) newErrors.last_name = 'Last name is required';
    if (!form.phone_number.trim()) newErrors.phone_number = 'Phone number is required';
    if (!form.hospital_id) newErrors.hospital_id = 'Hospital is required';
    if (!form.department.trim()) newErrors.department = 'Department is required';
    if (!form.license_no.trim()) newErrors.license_no = 'License number is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* Submit */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setAlert(null);

    try {
      if (isEdit) {
        await staffApi.updateStaff(id, form);
        setAlert({ type: 'success', message: 'Staff member updated successfully.' });
      } else {
        await staffApi.createStaff(form);
        setAlert({ type: 'success', message: 'Staff member created successfully.' });
      }
      setTimeout(() => navigate('/staff/list'), 1200);
    } catch (err) {
      const msg = err.response?.data?.message || 'An error occurred. Please try again.';
      setAlert({ type: 'error', message: msg });
    } finally {
      setLoading(false);
    }
  };

  /* Deactivate */
  const handleDeactivate = async () => {
    if (!window.confirm('Are you sure you want to deactivate this staff member?')) return;

    setLoading(true);
    try {
      await staffApi.deactivateStaff(id);
      setAlert({ type: 'success', message: 'Staff member deactivated.' });
      setTimeout(() => navigate('/staff/list'), 1200);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to deactivate staff member.';
      setAlert({ type: 'error', message: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="staff-page animate-fade-in">
      <div className="page-header">
        <button
          className="staff-table-action"
          onClick={() => navigate('/staff/list')}
          style={{ marginBottom: 'var(--space-3)' }}
        >
          <IoArrowBackOutline /> Back to Staff List
        </button>
        <h1 className="page-title">{isEdit ? 'Edit Staff' : 'Add New Staff'}</h1>
        <p className="page-subtitle">
          {isEdit ? 'Update staff member information.' : 'Create a new staff account.'}
        </p>
      </div>

      {alert && (
        <div className={`staff-alert staff-alert--${alert.type}`}>
          {alert.message}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="staff-form-card">
          {/* ---- User Fields Section ---- */}
          <div className="staff-form-section">
            <h2 className="staff-form-section__title">
              <IoPersonOutline /> User Information
            </h2>
            <div className="staff-form-grid">
              <Input
                id="staff-email"
                label="Email"
                type="email"
                value={form.email}
                onChange={handleChange('email')}
                error={errors.email}
                placeholder="staff@medisecure.com"
              />
              <div className="input-group input-group--full">
                <label htmlFor="staff-role" className="input-group__label">Role</label>
                <select
                  id="staff-role"
                  className="staff-form-select"
                  value={form.role}
                  onChange={handleChange('role')}
                >
                  <option value="DOCTOR">Doctor</option>
                  <option value="NURSE">Nurse</option>
                  <option value="BILLING_STAFF">Billing Staff</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
              <Input
                id="staff-first-name"
                label="First Name"
                value={form.first_name}
                onChange={handleChange('first_name')}
                error={errors.first_name}
                placeholder="First name"
              />
              <Input
                id="staff-middle-name"
                label="Middle Name"
                value={form.middle_name}
                onChange={handleChange('middle_name')}
                placeholder="Middle name (optional)"
              />
              <Input
                id="staff-last-name"
                label="Last Name"
                value={form.last_name}
                onChange={handleChange('last_name')}
                error={errors.last_name}
                placeholder="Last name"
              />
              <Input
                id="staff-phone"
                label="Phone Number"
                type="tel"
                value={form.phone_number}
                onChange={handleChange('phone_number')}
                error={errors.phone_number}
                placeholder="+20 1XX XXX XXXX"
              />
            </div>
          </div>

          {/* ---- Staff Fields Section ---- */}
          <div className="staff-form-section">
            <h2 className="staff-form-section__title">
              <IoBriefcaseOutline /> Staff Details
            </h2>
            <div className="staff-form-grid">
              <div className="input-group input-group--full">
                <label htmlFor="staff-hospital" className="input-group__label">Hospital</label>
                <select
                  id="staff-hospital"
                  className={`staff-form-select ${errors.hospital_id ? 'input-group__field--error' : ''}`}
                  value={form.hospital_id}
                  onChange={handleChange('hospital_id')}
                >
                  <option value="">Select hospital…</option>
                  {hospitals.map((h) => (
                    <option key={h.hospital_id} value={h.hospital_id}>
                      {h.name}
                    </option>
                  ))}
                </select>
                {errors.hospital_id && (
                  <span className="input-group__error">{errors.hospital_id}</span>
                )}
              </div>
              <div className="input-group input-group--full">
                <label htmlFor="staff-department" className="input-group__label">Department</label>
                <select
                  id="staff-department"
                  className={`staff-form-select ${errors.department ? 'input-group__field--error' : ''}`}
                  value={form.department}
                  onChange={handleChange('department')}
                >
                  <option value="">Select department…</option>
                  {DEPARTMENTS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
                {errors.department && (
                  <span className="input-group__error">{errors.department}</span>
                )}
              </div>
              <Input
                id="staff-license"
                label="License Number"
                value={form.license_no}
                onChange={handleChange('license_no')}
                error={errors.license_no}
                placeholder="e.g. MD-20210341"
              />
              <div className="staff-form-full">
                <Input
                  id="staff-address"
                  label="Address"
                  value={form.address}
                  onChange={handleChange('address')}
                  placeholder="Staff member address"
                />
              </div>
            </div>
          </div>

          {/* ---- Actions ---- */}
          <div className="staff-form-actions">
            <div>
              {isEdit && (
                <Button
                  variant="danger"
                  size="sm"
                  onClick={handleDeactivate}
                  disabled={loading}
                  type="button"
                >
                  <IoTrashOutline /> Deactivate
                </Button>
              )}
            </div>
            <div className="staff-form-actions__right">
              <Button
                variant="ghost"
                onClick={() => navigate('/staff/list')}
                type="button"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                type="submit"
                loading={loading}
              >
                {isEdit ? 'Save Changes' : 'Create Staff'}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
