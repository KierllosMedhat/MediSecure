/**
 * Patient Profile — view & edit personal information.
 * Owner: Abanob
 *
 * ERD refs:
 *   User  → First_Name, Middle_Name, Last_Name, Phone_Number, Email
 *   Patient → National_Id, Date_Of_Birth, Blood_Type, Emergency_Contact, Address
 *
 * Features:
 *  - Toggle between view mode and edit mode
 *  - Form validation (required fields, phone format)
 *  - national_id and email are always read-only
 *  - On save, syncs AuthContext user data
 */
import usePatientProfile from '../hooks/usePatientProfile';
import {
  IoCreateOutline,
  IoCloseOutline,
  IoCheckmarkOutline,
  IoPersonOutline,
  IoCallOutline,
  IoMailOutline,
  IoMedkitOutline,
  IoLocationOutline,
  IoAlertCircleOutline,
} from 'react-icons/io5';
import './PatientPages.css';

/* ---------- Helpers ---------- */
function getInitials(firstName, lastName) {
  return `${(firstName || '')[0] || ''}${(lastName || '')[0] || ''}`.toUpperCase();
}

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

/* ---------- Form Field Component ---------- */
function FormField({ label, id, value, onChange, type = 'text', readOnly, error, placeholder, children }) {
  if (children) {
    return (
      <div className={`form-field ${error ? 'form-field--error' : ''}`}>
        <label className="form-field__label" htmlFor={id}>{label}</label>
        {children}
        {error && <span className="form-field__error">{error}</span>}
      </div>
    );
  }

  return (
    <div className={`form-field ${error ? 'form-field--error' : ''} ${readOnly ? 'form-field--readonly' : ''}`}>
      <label className="form-field__label" htmlFor={id}>{label}</label>
      <input
        id={id}
        type={type}
        className="form-field__input"
        value={value || ''}
        onChange={(e) => onChange?.(e.target.value)}
        readOnly={readOnly}
        disabled={readOnly}
        placeholder={placeholder}
      />
      {error && <span className="form-field__error">{error}</span>}
    </div>
  );
}

/* ====================================================================
   Main Profile Component
   ==================================================================== */
export default function PatientProfile() {
  const {
    profile,
    formData,
    isEditing,
    errors,
    loading,
    saving,
    saveSuccess,
    saveError,
    toggleEdit,
    handleChange,
    handleSave,
  } = usePatientProfile();

  if (loading) {
    return (
      <div className="patient-profile">
        <div className="dashboard-loading">
          <div className="dashboard-loading__spinner" />
          <p>Loading profile…</p>
        </div>
      </div>
    );
  }

  const displayData = isEditing ? formData : profile;

  return (
    <div className="patient-profile animate-fade-in">
      {/* ---- Page Header ---- */}
      <div className="page-header profile-page-header">
        <div>
          <h1 className="page-title">My Profile</h1>
          <p className="page-subtitle">View and manage your personal information.</p>
        </div>
        <div className="profile-page-actions">
          {isEditing ? (
            <>
              <button className="btn-ghost" onClick={toggleEdit} id="profile-cancel-btn">
                <IoCloseOutline /> Cancel
              </button>
              <button
                className="btn-primary"
                onClick={handleSave}
                disabled={saving}
                id="profile-save-btn"
              >
                {saving ? (
                  <span className="btn-spinner" />
                ) : (
                  <IoCheckmarkOutline />
                )}
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
            </>
          ) : (
            <button className="btn-outline" onClick={toggleEdit} id="profile-edit-btn">
              <IoCreateOutline /> Edit Profile
            </button>
          )}
        </div>
      </div>

      {/* ---- Feedback Messages ---- */}
      {saveSuccess && (
        <div className="profile-alert profile-alert--success" role="status">
          <IoCheckmarkOutline /> Profile updated successfully.
        </div>
      )}
      {saveError && (
        <div className="profile-alert profile-alert--error" role="alert">
          <IoAlertCircleOutline /> {saveError}
        </div>
      )}

      {/* ---- Profile Header Card ---- */}
      <section className="dashboard-card profile-header-card">
        <div className="profile-header">
          <div className="profile-header__avatar">
            {getInitials(profile?.first_name, profile?.last_name)}
          </div>
          <div className="profile-header__info">
            <h2 className="profile-header__name">
              {profile?.first_name} {profile?.middle_name ? `${profile.middle_name} ` : ''}{profile?.last_name}
            </h2>
            <p className="profile-header__id">Patient ID: {profile?.patient_id || '—'}</p>
            <p className="profile-header__email">{profile?.email || '—'}</p>
          </div>
        </div>
      </section>

      {/* ---- Form Sections ---- */}
      <div className="profile-form-grid">
        {/* Personal Information */}
        <section className="dashboard-card">
          <div className="dashboard-card__header">
            <div className="dashboard-card__header-icon-group">
              <IoPersonOutline className="dashboard-card__header-icon" />
              <h2 className="dashboard-card__title">Personal Information</h2>
            </div>
          </div>
          <div className="dashboard-card__body profile-form-section">
            <div className="form-row form-row--3">
              <FormField
                label="First Name"
                id="profile-first-name"
                value={displayData?.first_name}
                onChange={(val) => handleChange('first_name', val)}
                readOnly={!isEditing}
                error={errors.first_name}
                placeholder="John"
              />
              <FormField
                label="Middle Name"
                id="profile-middle-name"
                value={displayData?.middle_name}
                onChange={(val) => handleChange('middle_name', val)}
                readOnly={!isEditing}
                placeholder="—"
              />
              <FormField
                label="Last Name"
                id="profile-last-name"
                value={displayData?.last_name}
                onChange={(val) => handleChange('last_name', val)}
                readOnly={!isEditing}
                error={errors.last_name}
                placeholder="Doe"
              />
            </div>
            <div className="form-row form-row--2">
              <FormField
                label="Email"
                id="profile-email"
                type="email"
                value={displayData?.email}
                readOnly
                placeholder="you@example.com"
              />
              <FormField
                label="National ID"
                id="profile-national-id"
                value={displayData?.national_id}
                readOnly
                placeholder="—"
              />
            </div>
          </div>
        </section>

        {/* Contact Information */}
        <section className="dashboard-card">
          <div className="dashboard-card__header">
            <div className="dashboard-card__header-icon-group">
              <IoCallOutline className="dashboard-card__header-icon" />
              <h2 className="dashboard-card__title">Contact Information</h2>
            </div>
          </div>
          <div className="dashboard-card__body profile-form-section">
            <div className="form-row form-row--2">
              <FormField
                label="Phone Number"
                id="profile-phone"
                type="tel"
                value={displayData?.phone_number}
                onChange={(val) => handleChange('phone_number', val)}
                readOnly={!isEditing}
                error={errors.phone_number}
                placeholder="+20 123 456 7890"
              />
              <FormField
                label="Emergency Contact"
                id="profile-emergency"
                value={displayData?.emergency_contact}
                onChange={(val) => handleChange('emergency_contact', val)}
                readOnly={!isEditing}
                error={errors.emergency_contact_phone}
                placeholder="Jane Doe — +20 123 456 0000"
              />
            </div>
          </div>
        </section>

        {/* Medical Information */}
        <section className="dashboard-card">
          <div className="dashboard-card__header">
            <div className="dashboard-card__header-icon-group">
              <IoMedkitOutline className="dashboard-card__header-icon" />
              <h2 className="dashboard-card__title">Medical Information</h2>
            </div>
          </div>
          <div className="dashboard-card__body profile-form-section">
            <div className="form-row form-row--2">
              <FormField
                label="Date of Birth"
                id="profile-dob"
                type="date"
                value={displayData?.date_of_birth}
                onChange={(val) => handleChange('date_of_birth', val)}
                readOnly={!isEditing}
              />
              <FormField
                label="Blood Type"
                id="profile-blood-type"
                readOnly={!isEditing}
                value={displayData?.blood_type}
              >
                {isEditing ? (
                  <select
                    id="profile-blood-type"
                    className="form-field__input form-field__select"
                    value={formData?.blood_type || ''}
                    onChange={(e) => handleChange('blood_type', e.target.value)}
                  >
                    <option value="">Select blood type</option>
                    {BLOOD_TYPES.map((bt) => (
                      <option key={bt} value={bt}>{bt}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    id="profile-blood-type-view"
                    type="text"
                    className="form-field__input"
                    value={displayData?.blood_type || '—'}
                    readOnly
                    disabled
                  />
                )}
              </FormField>
            </div>
          </div>
        </section>

        {/* Address */}
        <section className="dashboard-card">
          <div className="dashboard-card__header">
            <div className="dashboard-card__header-icon-group">
              <IoLocationOutline className="dashboard-card__header-icon" />
              <h2 className="dashboard-card__title">Address</h2>
            </div>
          </div>
          <div className="dashboard-card__body profile-form-section">
            <div className="form-row form-row--1">
              <div className={`form-field ${!isEditing ? 'form-field--readonly' : ''}`}>
                <label className="form-field__label" htmlFor="profile-address">Full Address</label>
                <textarea
                  id="profile-address"
                  className="form-field__input form-field__textarea"
                  value={isEditing ? (formData?.address || '') : (profile?.address || '—')}
                  onChange={(e) => handleChange('address', e.target.value)}
                  readOnly={!isEditing}
                  disabled={!isEditing}
                  rows={3}
                  placeholder="Enter your full address"
                />
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
