/**
 * Forgot Password Page — sends OTP then verifies it.
 * Owner: Abanob
 *
 * TODO:
 * - Step 1: Email input → call authApi.forgotPassword(email)
 * - Step 2: OTP input → call authApi.verifyOtp(email, otp)
 * - On OTP success, navigate to /auth/reset-password with { email, otp } state
 * - Handle errors gracefully
 * - Link back to /auth/login
 */
import { Button, Input } from '../../../components/ui';
import './AuthPages.css';

export default function ForgotPasswordPage() {
  return (
    <div className="auth-page">
      <h2 className="auth-page__title">Forgot Password</h2>
      <p className="auth-page__subtitle">Enter your email to receive a verification code.</p>

      {/* TODO: Implement two-step forgot password flow */}
    </div>
  );
}
