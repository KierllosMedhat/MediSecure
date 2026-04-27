/**
 * Reset Password Page — new password after OTP verification.
 * Owner: Abanob
 *
 * TODO:
 * - Read { email, otp } from location.state (passed by ForgotPasswordPage)
 * - Show "Invalid link" if state is missing
 * - New password + confirm password form
 * - Call authApi.resetPassword({ email, otp, new_password })
 * - On success, navigate to /auth/login with success message
 */
import { Button, Input } from '../../../components/ui';
import './AuthPages.css';

export default function ResetPasswordPage() {
  return (
    <div className="auth-page">
      <h2 className="auth-page__title">Reset Password</h2>
      <p className="auth-page__subtitle">Create a new password for your account.</p>

      {/* TODO: Implement reset password form */}
    </div>
  );
}
