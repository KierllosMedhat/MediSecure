/**
 * Auth Layout — wraps login / forgot-password / reset-password pages.
 * Owner: Abanob
 */
import { Outlet } from 'react-router-dom';
import './AuthLayout.css';

export default function AuthLayout() {
  return (
    <div className="auth-layout">
      {/* Decorative side panel */}
      <div className="auth-layout__hero">
        <div className="auth-layout__hero-content">
          <div className="auth-layout__logo">
            <span className="auth-layout__logo-icon">🛡️</span>
            <h1>MediSecure</h1>
          </div>
          <p className="auth-layout__tagline">
            Secure health records management — PDPL compliant, patient-first.
          </p>
          <div className="auth-layout__features">
            <div className="auth-layout__feature">
              <span>🔒</span>
              <span>End-to-End Encryption</span>
            </div>
            <div className="auth-layout__feature">
              <span>📋</span>
              <span>Unified Health Records</span>
            </div>
            <div className="auth-layout__feature">
              <span>✅</span>
              <span>PDPL Consent Management</span>
            </div>
          </div>
        </div>
      </div>

      {/* Form area */}
      <div className="auth-layout__form-area">
        <div className="auth-layout__form-wrapper">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
