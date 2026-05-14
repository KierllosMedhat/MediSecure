/**
 * Sign Up Page — Create Account form matching Figma.
 * Fields: First Name, Last Name, Email, Password, Patient ID (Optional).
 * Pure UI — business logic in useSignUpLogic().
 *
 * Owner: Abanob
 */
import { Link } from 'react-router-dom';
import { Button, Input } from '../../../components/ui';
import { useSignUpLogic } from '../hooks/useAuthLogic';
import './AuthPages.css';

export default function SignUpPage() {
  const {
    firstName,
    setFirstName,
    lastName,
    setLastName,
    email,
    setEmail,
    password,
    setPassword,
    patientId,
    setPatientId,
    error,
    isSubmitting,
    handleSubmit,
  } = useSignUpLogic();

  return (
    <>
      {/* Tab Switcher */}
      <div className="auth-tabs">
        <Link to="/auth/login" className="auth-tabs__tab">
          Login
        </Link>
        <span className="auth-tabs__tab auth-tabs__tab--active">Sign Up</span>
      </div>

      {/* Card */}
      <div className="auth-card">
        <h2 className="auth-page__title">Create Account</h2>
        <p className="auth-page__subtitle">Join MediSecure today</p>

        {error && (
          <div className="auth-page__error" role="alert" id="signup-error">
            {error}
          </div>
        )}

        <form className="auth-page__form" onSubmit={handleSubmit} noValidate>
          <div className="auth-page__row">
            <Input
              id="signup-first-name"
              label="First Name"
              placeholder="John"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              autoComplete="given-name"
              required
            />
            <Input
              id="signup-last-name"
              label="Last Name"
              placeholder="Doe"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              autoComplete="family-name"
              required
            />
          </div>

          <Input
            id="signup-email"
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />

          <Input
            id="signup-password"
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            required
          />

          <Input
            id="signup-patient-id"
            label="Patient ID (Optional)"
            placeholder="P-12345"
            value={patientId}
            onChange={(e) => setPatientId(e.target.value)}
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            loading={isSubmitting}
            id="signup-submit"
          >
            Create Account
          </Button>
        </form>
      </div>
    </>
  );
}
