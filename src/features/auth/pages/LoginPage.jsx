/**
 * Login Page — email + password, no role selector.
 * Pure UI — all business logic lives in useLoginLogic().
 *
 * Owner: Abanob
 */
import { Link, useLocation } from 'react-router-dom';
import { Button, Input } from '../../../components/ui';
import { useLoginLogic } from '../hooks/useAuthLogic';
import './AuthPages.css';

export default function LoginPage() {
  const {
    email,
    setEmail,
    password,
    setPassword,
    error,
    isSubmitting,
    handleSubmit,
  } = useLoginLogic();

  const location = useLocation();
  const successMessage = location.state?.message;

  return (
    <>
      {/* Tab Switcher */}
      <div className="auth-tabs">
        <span className="auth-tabs__tab auth-tabs__tab--active">Login</span>
        <Link to="/auth/signup" className="auth-tabs__tab">
          Sign Up
        </Link>
      </div>

      {/* Card */}
      <div className="auth-card">
        <h2 className="auth-page__title">Welcome Back</h2>
        <p className="auth-page__subtitle">Login to access your health records</p>

        {successMessage && (
          <div className="auth-page__success" role="status">
            {successMessage}
          </div>
        )}

        {error && (
          <div className="auth-page__error" role="alert" id="login-error">
            {error}
          </div>
        )}

        <form className="auth-page__form" onSubmit={handleSubmit} noValidate>
          <Input
            id="login-email"
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />

          <Input
            id="login-password"
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            loading={isSubmitting}
            id="login-submit"
          >
            Login
          </Button>
        </form>

        <div className="auth-page__footer">
          <Link to="/auth/forgot-password" className="auth-page__link" id="forgot-password-link">
            Forgot password?
          </Link>
        </div>
      </div>
    </>
  );
}
