import {
  IoCreateOutline,
  IoCloseOutline,
  IoCheckmarkOutline,
  IoPersonOutline,
  IoCallOutline,
  IoBusinessOutline,
  IoAlertCircleOutline,
  IoTimeOutline,
} from 'react-icons/io5';
import useStaffProfile from '../hooks/useStaffProfile';
import '../../patients/pages/PatientPages.css';

/* ---------- Helpers ---------- */
function getInitials(firstName, lastName) {
  return `${(firstName || '')[0] || ''}${(lastName || '')[0] || ''}`.toUpperCase();
}

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

/* ---------- Constants ---------- */
const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

/* ====================================================================
   Main Profile Component
   ==================================================================== */
export default function StaffProfile() {
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
  } = useStaffProfile();

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
          <p className="page-subtitle">View and manage your staff information.</p>
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
            <p className="profile-header__id">Department: {profile?.department || '—'}</p>
            <p className="profile-header__email">{profile?.email || '—'}</p>
          </div>
        </div>
      </section>

      {/* ---- Form Sections ---- */}
      <div className="profile-form-grid">
        {/* Professional Information */}
        <section className="dashboard-card">
          <div className="dashboard-card__header">
            <div className="dashboard-card__header-icon-group">
              <IoBusinessOutline className="dashboard-card__header-icon" />
              <h2 className="dashboard-card__title">Professional Information</h2>
            </div>
          </div>
          <div className="dashboard-card__body profile-form-section">
            <div className="form-row form-row--2">
              <FormField
                label="Role"
                id="profile-role"
                value={displayData?.role}
                readOnly
              />
              <FormField
                label="Department"
                id="profile-department"
                value={displayData?.department}
                readOnly
              />
            </div>
            <div className="form-row form-row--2">
              <FormField
                label="Hospital"
                id="profile-hospital"
                value={displayData?.hospital_name}
                readOnly
              />
              <FormField
                label="License No."
                id="profile-license"
                value={displayData?.license_no}
                readOnly
              />
            </div>
          </div>
        </section>

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
                label="Email Address"
                id="profile-email"
                type="email"
                value={displayData?.email}
                readOnly
                placeholder="you@example.com"
              />
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
            </div>
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

        {/* Working Hours (Doctors only) */}
        {profile?.role === 'DOCTOR' && (
          <section className="dashboard-card">
            <div className="dashboard-card__header">
              <div className="dashboard-card__header-icon-group">
                <IoTimeOutline className="dashboard-card__header-icon" />
                <h2 className="dashboard-card__title">Working Hours</h2>
              </div>
            </div>
            <div className="dashboard-card__body profile-form-section">
              <div className="working-hours-grid" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {DAYS.map(day => {
                  const dayData = (displayData?.working_hours || {})[day] || { active: false, start: '09:00', end: '17:00' };
                  return (
                    <div key={day} className="working-hours-row" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                      <div style={{ width: '120px', textTransform: 'capitalize', fontWeight: '500' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: isEditing ? 'pointer' : 'default' }}>
                          <input 
                            type="checkbox" 
                            checked={dayData.active}
                            disabled={!isEditing}
                            onChange={(e) => {
                              const newHours = { ...(displayData.working_hours || {}) };
                              newHours[day] = { ...dayData, active: e.target.checked };
                              handleChange('working_hours', newHours);
                            }}
                          />
                          {day}
                        </label>
                      </div>
                      <input 
                        type="time" 
                        value={dayData.start} 
                        disabled={!isEditing || !dayData.active}
                        onChange={(e) => {
                          const newHours = { ...(displayData.working_hours || {}) };
                          newHours[day] = { ...dayData, start: e.target.value };
                          handleChange('working_hours', newHours);
                        }}
                        className="form-field__input"
                        style={{ width: '130px' }}
                      />
                      <span style={{ color: 'var(--color-text-muted)' }}>to</span>
                      <input 
                        type="time" 
                        value={dayData.end} 
                        disabled={!isEditing || !dayData.active}
                        onChange={(e) => {
                          const newHours = { ...(displayData.working_hours || {}) };
                          newHours[day] = { ...dayData, end: e.target.value };
                          handleChange('working_hours', newHours);
                        }}
                        className="form-field__input"
                        style={{ width: '130px' }}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

      </div>
    </div>
  );
}
