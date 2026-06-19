/**
 * Change Password Page — for authenticated users.
 * Requires current password + new password + confirmation.
 *
 * Owner: Abanob
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Input } from '../../../components/ui';
import authApi from '../../../api/services/authService';
import { parseApiError } from '../../../api/errorHandler';
import './AuthPages.css';

export default function ChangePasswordPage() {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!oldPassword || !newPassword || !confirmPassword) {
      setError('All fields are required.');
      return;
    }

    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }

    if (oldPassword === newPassword) {
      setError('New password must be different from current password.');
      return;
    }

    setIsSubmitting(true);
    try {
      await authApi.changePassword({
        old_password: oldPassword,
        new_password: newPassword,
        new_password_confirm: confirmPassword,
      });
      setSuccess('Password changed successfully! Redirecting...');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => navigate(-1), 2000);
    } catch (err) {
      const parsed = parseApiError(err);
      setError(parsed.message || 'Failed to change password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="change-password-page">
      <div className="change-password-card">
        <h2 className="auth-page__title">Change Password</h2>
        <p className="auth-page__subtitle">
          Enter your current password and choose a new one.
        </p>

        {success && (
          <div className="auth-page__success" role="status">
            {success}
          </div>
        )}

        {error && (
          <div className="auth-page__error" role="alert">
            {error}
          </div>
        )}

        <form className="auth-page__form" onSubmit={handleSubmit} noValidate>
          <Input
            id="current-password"
            label="Current Password"
            type="password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            autoComplete="current-password"
            required
          />

          <Input
            id="new-password"
            label="New Password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            autoComplete="new-password"
            required
          />

          <Input
            id="confirm-new-password"
            label="Confirm New Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
            required
          />

          <div className="change-password-actions">
            <Button
              type="button"
              variant="secondary"
              size="lg"
              onClick={() => navigate(-1)}
              id="cancel-change-password"
            >
              Cancel
            </Button>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={isSubmitting}
              id="submit-change-password"
            >
              Update Password
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
