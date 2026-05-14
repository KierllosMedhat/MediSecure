/**
 * Auth Layout — centered card on lavender background.
 * Wraps login / forgot-password / reset-password pages.
 *
 * Redesigned from split-screen to match Figma design.
 * Owner: Abanob
 */
import { Outlet } from 'react-router-dom';
import './AuthLayout.css';

export default function AuthLayout() {
  return (
    <div className="auth-layout">
      <div className="auth-layout__card-container">
        <Outlet />
      </div>
    </div>
  );
}
