/**
 * Sidebar Navigation — adapts to patient vs staff roles.
 * Owner: Kyrillos (Shared UI)
 */
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../features/auth/hooks/useAuth';
import {
  IoHomeOutline,
  IoPersonOutline,
  IoDocumentTextOutline,
  IoShieldCheckmarkOutline,
  IoCardOutline,
  IoCalendarOutline,
  IoPeopleOutline,
  IoNotificationsOutline,
  IoListOutline,
  IoLogOutOutline,
} from 'react-icons/io5';
import './Sidebar.css';

const PATIENT_LINKS = [
  { to: '/dashboard', label: 'Dashboard', icon: <IoHomeOutline /> },
  { to: '/patients/profile', label: 'My Profile', icon: <IoPersonOutline /> },
  { to: '/patients/me/records', label: 'Health Records', icon: <IoDocumentTextOutline /> },
  { to: '/patients/me/consents', label: 'Consent', icon: <IoShieldCheckmarkOutline /> },
  { to: '/payments', label: 'Payments', icon: <IoCardOutline /> },
  { to: '/appointments', label: 'Appointments', icon: <IoCalendarOutline /> },
  { to: '/notifications', label: 'Notifications', icon: <IoNotificationsOutline /> },
];

const STAFF_LINKS = [
  { to: '/staff/dashboard', label: 'Dashboard', icon: <IoHomeOutline /> },
  { to: '/appointments', label: 'Appointments', icon: <IoCalendarOutline /> },
  { to: '/notifications', label: 'Notifications', icon: <IoNotificationsOutline /> },
];

const ADMIN_LINKS = [
  { to: '/staff/list', label: 'Staff Management', icon: <IoPeopleOutline /> },
  { to: '/admin/audit-logs', label: 'Audit Logs', icon: <IoListOutline /> },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const role = user?.role || 'PATIENT';
  const isAdmin = role === 'ADMIN';
  const isStaff = ['DOCTOR', 'NURSE', 'BILLING_STAFF', 'ADMIN'].includes(role);

  const links = isStaff ? STAFF_LINKS : PATIENT_LINKS;

  const handleLogout = () => {
    logout();
    navigate('/auth/login');
  };

  return (
    <aside className="sidebar">
      {/* Brand */}
      <div className="sidebar__brand">
        <span className="sidebar__brand-icon">🛡️</span>
        <span className="sidebar__brand-text">MediSecure</span>
      </div>

      {/* Navigation */}
      <nav className="sidebar__nav">
        <ul className="sidebar__list">
          {links.map((link) => (
            <li key={link.to}>
              <NavLink
                to={link.to}
                className={({ isActive }) =>
                  `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`
                }
              >
                <span className="sidebar__link-icon">{link.icon}</span>
                <span>{link.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>

        {/* Admin-only section */}
        {isAdmin && (
          <>
            <div className="sidebar__section-title">Administration</div>
            <ul className="sidebar__list">
              {ADMIN_LINKS.map((link) => (
                <li key={link.to}>
                  <NavLink
                    to={link.to}
                    className={({ isActive }) =>
                      `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`
                    }
                  >
                    <span className="sidebar__link-icon">{link.icon}</span>
                    <span>{link.label}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </>
        )}
      </nav>

      {/* Footer */}
      <div className="sidebar__footer">
        <button className="sidebar__link sidebar__logout" onClick={handleLogout}>
          <span className="sidebar__link-icon"><IoLogOutOutline /></span>
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  );
}
