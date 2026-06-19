import { useState, useEffect, useCallback } from 'react';
import staffApi from '../../../api/services/staffService';
import { parseApiError } from '../../../api/errorHandler';
import { useAuth } from '../../auth/hooks/useAuth';

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
  return errors;
}

export default function useStaffProfile() {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState(null);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await staffApi.getProfile();
      setProfile(data);
      setFormData({ ...data });
    } catch (err) {
      const fallbackProfile = {
        first_name: user?.first_name || user?.name?.split(' ')[0] || '',
        last_name: user?.last_name || user?.name?.split(' ').slice(1).join(' ') || '',
        email: user?.email || '',
        phone_number: '',
        role: user?.role || '',
      };
      setProfile(fallbackProfile);
      setFormData(fallbackProfile);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchProfile();
  }, [fetchProfile]);

  const toggleEdit = useCallback(() => {
    if (isEditing) {
      setFormData({ ...profile });
      setErrors({});
      setSaveError(null);
    }
    setIsEditing((prev) => !prev);
    setSaveSuccess(false);
  }, [isEditing, profile]);

  const handleChange = useCallback((field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      if (prev[field]) {
        const next = { ...prev };
        delete next[field];
        return next;
      }
      return prev;
    });
  }, []);

  const handleSave = useCallback(async () => {
    setSaveSuccess(false);
    setSaveError(null);

    const validationErrors = validateProfileForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSaving(true);
    try {
      const payload = {
        first_name: formData.first_name,
        middle_name: formData.middle_name || '',
        last_name: formData.last_name,
        phone_number: formData.phone_number || '',
        address: formData.address || '',
      };

      await staffApi.updateProfile(payload);

      const updatedProfile = { ...profile, ...payload };
      setProfile(updatedProfile);
      setIsEditing(false);
      setSaveSuccess(true);

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
