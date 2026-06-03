/**
 * usePatientProfile — manages profile view/edit state, validation, and API calls.
 * Separates business logic from the PatientProfile UI component (Rule 3).
 *
 * Owner: Abanob
 */
import { useState, useEffect, useCallback } from 'react';
import patientApi from '../../../api/services/patientService';
import { parseApiError } from '../../../api/errorHandler';
import { useAuth } from '../../auth/hooks/useAuth';

/* ---------- Validation Helpers ---------- */
const PHONE_REGEX = /^\+?[\d\s\-()]{7,20}$/;

function validateProfileForm(formData) {
  const errors = {};

  if (!formData.first_name?.trim()) {
    errors.first_name = 'First name is required.';
  }
  if (!formData.last_name?.trim()) {
    errors.last_name = 'Last name is required.';
  }
  if (formData.phone_number && !PHONE_REGEX.test(formData.phone_number)) {
    errors.phone_number = 'Please enter a valid phone number.';
  }
  if (formData.emergency_contact_phone && !PHONE_REGEX.test(formData.emergency_contact_phone)) {
    errors.emergency_contact_phone = 'Please enter a valid emergency contact phone.';
  }

  return errors;
}

/* ---------- Mock Profile (development fallback) ---------- */
const MOCK_PROFILE = {
  patient_id: 'P-12345',
  user_id: 'U-001',
  first_name: 'John',
  middle_name: '',
  last_name: 'Doe',
  email: 'john.doe@email.com',
  phone_number: '+20 123 456 7890',
  national_id: '29901012345678',
  date_of_birth: '1985-01-15',
  blood_type: 'O+',
  emergency_contact: 'Jane Doe — +20 123 456 0000',
  emergency_contact_phone: '+20 123 456 0000',
  address: '12 Tahrir Square, Cairo, Egypt',
  role: 'PATIENT',
  created_at: '2025-11-01T10:00:00Z',
};

export default function usePatientProfile() {
  const { user, updateUser } = useAuth();

  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState(null);

  /* ---- Fetch profile on mount ---- */
  const fetchProfile = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await patientApi.getProfile();
      setProfile(data);
      setFormData({ ...data });
    } catch {
      /* Fallback to mock data during development */
      setProfile(MOCK_PROFILE);
      setFormData({ ...MOCK_PROFILE });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchProfile();
  }, [fetchProfile]);

  /* ---- Toggle edit mode ---- */
  const toggleEdit = useCallback(() => {
    if (isEditing) {
      /* Cancel: reset form to saved profile */
      setFormData({ ...profile });
      setErrors({});
      setSaveError(null);
    }
    setIsEditing((prev) => !prev);
    setSaveSuccess(false);
  }, [isEditing, profile]);

  /* ---- Handle field changes ---- */
  const handleChange = useCallback((field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    /* Clear field-level error on change */
    setErrors((prev) => {
      if (prev[field]) {
        const next = { ...prev };
        delete next[field];
        return next;
      }
      return prev;
    });
  }, []);

  /* ---- Save profile ---- */
  const handleSave = useCallback(async () => {
    setSaveSuccess(false);
    setSaveError(null);

    /* Validate */
    const validationErrors = validateProfileForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSaving(true);
    try {
      /* Send only editable fields */
      const payload = {
        first_name: formData.first_name,
        middle_name: formData.middle_name || '',
        last_name: formData.last_name,
        phone_number: formData.phone_number || '',
        date_of_birth: formData.date_of_birth || '',
        blood_type: formData.blood_type || '',
        emergency_contact: formData.emergency_contact || '',
        address: formData.address || '',
      };

      await patientApi.updateProfile(payload);

      /* Update local state */
      const updatedProfile = { ...profile, ...payload };
      setProfile(updatedProfile);
      setIsEditing(false);
      setSaveSuccess(true);

      /* Sync user context (name may have changed) */
      if (user) {
        updateUser({
          name: `${payload.first_name} ${payload.last_name}`,
          first_name: payload.first_name,
          last_name: payload.last_name,
        });
      }
    } catch (err) {
      const parsed = parseApiError(err);
      setSaveError(parsed.message);
    } finally {
      setSaving(false);
    }
  }, [formData, profile, user, updateUser]);

  return {
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
    fetchProfile,
  };
}
