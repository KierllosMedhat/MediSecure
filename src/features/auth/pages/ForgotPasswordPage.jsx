/**
 * Forgot Password Page — two-step flow: email → OTP verification.
 * Pure UI — all business logic lives in useForgotPasswordLogic().
 *
 * Owner: Abanob
 */
import { Link } from 'react-router-dom';
import { Button, Input } from '../../../components/ui';
import { useForgotPasswordLogic } from '../hooks/useAuthLogic';
import './AuthPages.css';

export default function ForgotPasswordPage() {
  const {
    step,
    email,
    setEmail,
    otp,
    setOtp,
    error,
    success,
    isSubmitting,
    handleSendOtp,
    handleVerifyOtp,
  } = useForgotPasswordLogic();

  return (
    <div className="auth-card auth-card--full">
      {/* Back link */}
      <Link to="/auth/login" className="auth-page__back" id="back-to-login">
        ← Back to Login
      </Link>

      {/* Step Indicator */}
      <div className="auth-steps">
        <span className={`auth-steps__dot ${step >= 1 ? 'auth-steps__dot--active' : ''} ${step > 1 ? 'auth-steps__dot--done' : ''}`} />
        <span className={`auth-steps__line ${step > 1 ? 'auth-steps__line--done' : ''}`} />
        <span className={`auth-steps__dot ${step >= 2 ? 'auth-steps__dot--active' : ''}`} />
      </div>

      {step === 1 ? (
        <>
          <h2 className="auth-page__title">Forgot Password</h2>
          <p className="auth-page__subtitle">
            Enter your email to receive a verification code.
          </p>

          {error && (
            <div className="auth-page__error" role="alert">
              {error}
            </div>
          )}

          <form className="auth-page__form" onSubmit={handleSendOtp} noValidate>
            <Input
              id="forgot-email"
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={isSubmitting}
              id="send-otp-btn"
            >
              Send Code
            </Button>
          </form>
        </>
      ) : (
        <>
          <h2 className="auth-page__title">Enter Verification Code</h2>
          <p className="auth-page__subtitle">
            We sent a 6-digit code to <strong>{email}</strong>
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

          <form className="auth-page__form" onSubmit={handleVerifyOtp} noValidate>
            <Input
              id="forgot-otp"
              label="Verification Code"
              type="text"
              placeholder="000000"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              maxLength={6}
              autoComplete="one-time-code"
              required
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={isSubmitting}
              id="verify-otp-btn"
            >
              Verify Code
            </Button>
          </form>
        </>
      )}
    </div>
  );
}
