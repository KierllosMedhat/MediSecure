/**
 * Reset Password Page — new password after OTP verification.
 * Reads { email, otp } from router state. Shows invalid link if missing.
 * Pure UI — all business logic lives in useResetPasswordLogic().
 *
 * Owner: Abanob
 */
import { Link } from 'react-router-dom';
import { Button, Input } from '../../../components/ui';
import { useResetPasswordLogic } from '../hooks/useAuthLogic';
import './AuthPages.css';

export default function ResetPasswordPage() {
  const {
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    error,
    success,
    isSubmitting,
    isValidLink,
    handleSubmit,
  } = useResetPasswordLogic();

  /* Guard: invalid link (no email/otp in router state) */
  if (!isValidLink) {
    return (
      <div className="auth-card auth-card--full">
        <div className="auth-page__invalid">
          <div className="auth-page__invalid-icon">🔗</div>
          <h2 className="auth-page__title">Invalid Link</h2>
          <p>
            This password reset link is invalid or has expired.
            Please start the process again.
          </p>
          <Link to="/auth/forgot-password">
            <Button variant="primary" size="lg" id="restart-reset-btn">
              Reset Password
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-card auth-card--full">
      {/* Back link */}
      <Link to="/auth/login" className="auth-page__back">
        ← Back to Login
      </Link>

      <h2 className="auth-page__title">Reset Password</h2>
      <p className="auth-page__subtitle">Create a new password for your account.</p>

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
          id="reset-new-password"
          label="New Password"
          type="password"
          placeholder="Minimum 8 characters"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          autoComplete="new-password"
          required
        />

        <Input
          id="reset-confirm-password"
          label="Confirm Password"
          type="password"
          placeholder="Re-enter your password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          autoComplete="new-password"
          required
        />

        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          loading={isSubmitting}
          disabled={!!success}
          id="reset-password-btn"
        >
          Reset Password
        </Button>
      </form>
    </div>
  );
}
