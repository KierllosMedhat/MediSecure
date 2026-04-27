/**
 * Login Page — email/password + device_id
 * Owner: Abanob
 *
 * ERD refs: User (Email, Password_Hash, Role)
 *
 * TODO:
 * - Build login form (email, password fields)
 * - Generate device_id from navigator.userAgent or UUID
 * - Call useAuth().login(email, password, deviceId)
 * - Handle errors via parseApiError()
 * - Redirect based on User.Role:
 *     PATIENT → /dashboard
 *     DOCTOR | NURSE | BILLING_STAFF → /staff/dashboard
 *     ADMIN → /staff/dashboard
 * - Link to /auth/forgot-password
 */
import { Button, Input } from '../../../components/ui';
import './AuthPages.css';

export default function LoginPage() {
  return (
    <div className="auth-page">
      <h2 className="auth-page__title">Welcome back</h2>
      <p className="auth-page__subtitle">Sign in to your MediSecure account</p>

      {/* TODO: Implement login form */}
    </div>
  );
}
