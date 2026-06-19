import { useState, useEffect, useRef } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { useAuth } from '../../../features/auth/hooks/useAuth';
import { 
  IoNotificationsOutline, IoPersonOutline, IoLockClosedOutline, IoLogOutOutline,
  IoHomeOutline, IoDocumentTextOutline, IoShieldCheckmarkOutline, 
  IoCardOutline, IoCalendarOutline, IoPeopleOutline, IoListOutline,
  IoMenuOutline, IoCloseOutline, IoMoonOutline, IoSunnyOutline
} from 'react-icons/io5';
import { useTheme } from '../../../hooks/useTheme';
import notificationApi from '../../../api/services/notificationService';
import './Header.css';

const PATIENT_LINKS = [
  { to: '/dashboard', label: 'Dashboard', icon: <IoHomeOutline /> },
  { to: '/profile', label: 'My Profile', icon: <IoPersonOutline /> },
  { to: '/patients/me/records', label: 'Health Records', icon: <IoDocumentTextOutline /> },
  { to: '/patients/me/consents', label: 'Consent', icon: <IoShieldCheckmarkOutline /> },
  { to: '/payments', label: 'Payments', icon: <IoCardOutline /> },
  { to: '/appointments', label: 'Appointments', icon: <IoCalendarOutline /> },
];

const STAFF_LINKS = [
  { to: '/staff/dashboard', label: 'Dashboard', icon: <IoHomeOutline /> },
  { to: '/profile', label: 'My Profile', icon: <IoPersonOutline /> },
  { to: '/staff/patients', label: 'Patient Records', icon: <IoDocumentTextOutline /> },
  { to: '/appointments', label: 'Appointments', icon: <IoCalendarOutline /> },
];

const ADMIN_LINKS = [
  { to: '/staff/list', label: 'Staff Management', icon: <IoPeopleOutline /> },
  { to: '/admin/audit-logs', label: 'Audit Logs', icon: <IoListOutline /> },
];

export default function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const role = user?.role || 'PATIENT';
  const isAdmin = role === 'ADMIN';
  const isStaff = ['DOCTOR', 'NURSE', 'BILLING_STAFF', 'ADMIN'].includes(role);

  const links = isStaff ? STAFF_LINKS : PATIENT_LINKS;

  useEffect(() => {
    if (!isAuthenticated) {
      setUnreadCount(0);
      return;
    }

    const fetchUnreadCount = async () => {
      try {
        const res = await notificationApi.getUnreadCount();
        setUnreadCount(res.data.unread_count || 0);
      } catch (err) {
        console.error('Failed to fetch unread notification count:', err);
      }
    };

    fetchUnreadCount();
  }, [isAuthenticated]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setShowDropdown(false);
    };
    if (showDropdown) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [showDropdown]);

  const displayName = user?.first_name
    ? `${user.first_name} ${user.last_name || ''}`.trim()
    : user?.name || user?.email || 'User';

  const initials = user?.first_name
    ? user.first_name.charAt(0).toUpperCase()
    : (user?.name?.charAt(0) || user?.email?.charAt(0) || 'U').toUpperCase();

  const handleLogout = async () => {
    setShowDropdown(false);
    await logout();
    navigate('/auth/login');
  };

  return (
    <header className="header">
      {/* Mobile Toggle */}
      <button 
        className="header__mobile-toggle"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        aria-label="Toggle navigation menu"
      >
        {isMobileMenuOpen ? <IoCloseOutline size={28} /> : <IoMenuOutline size={28} />}
      </button>

      {/* Brand */}
      <div className="header__brand">
        <img src="/logo.svg" alt="MediSecure Logo" className="header__brand-img" />
        <span className="header__brand-text">MediSecure</span>
      </div>

      {/* Navigation */}
      <nav className={`header__nav ${isMobileMenuOpen ? 'header__nav--mobile-open' : ''}`}>
        <ul className="header__list">
          {links.map((link) => (
            <li key={link.to}>
              <NavLink
                to={link.to}
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `header__link ${isActive ? 'header__link--active' : ''}`
                }
              >
                <span className="header__link-icon">{link.icon}</span>
                <span>{link.label}</span>
              </NavLink>
            </li>
          ))}
          {isAdmin && ADMIN_LINKS.map((link) => (
            <li key={link.to}>
              <NavLink
                to={link.to}
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `header__link ${isActive ? 'header__link--active' : ''}`
                }
              >
                <span className="header__link-icon">{link.icon}</span>
                <span>{link.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Right actions */}
      <div className="header__actions">
        {/* Theme Toggle */}
        <button
          className="header__icon-btn"
          aria-label="Toggle Dark Mode"
          onClick={toggleTheme}
        >
          {theme === 'dark' ? <IoSunnyOutline size={20} /> : <IoMoonOutline size={20} />}
        </button>

        <button
          className="header__icon-btn"
          aria-label="Notifications"
          id="header-notifications-btn"
          onClick={() => navigate('/notifications')}
        >
          <IoNotificationsOutline size={20} />
          {unreadCount > 0 && <span className="header__badge">{unreadCount}</span>}
        </button>

        {/* Avatar + Dropdown */}
        <div className="header__user-menu" ref={dropdownRef}>
          <button
            className="header__avatar"
            id="header-user-avatar"
            onClick={() => setShowDropdown((prev) => !prev)}
            aria-haspopup="true"
            aria-expanded={showDropdown}
            aria-label="User menu"
          >
            <span>{initials}</span>
          </button>

          {showDropdown && (
            <div className="header__dropdown" role="menu">
              {/* User info */}
              <div className="header__dropdown-header">
                <div className="header__dropdown-avatar">
                  <span>{initials}</span>
                </div>
                <div className="header__dropdown-info">
                  <span className="header__dropdown-name">{displayName}</span>
                  <span className="header__dropdown-email">{user?.email}</span>
                  <span className="header__dropdown-role">{user?.role}</span>
                </div>
              </div>

              <div className="header__dropdown-divider" />

              {/* Menu items */}
              <button
                className="header__dropdown-item"
                role="menuitem"
                id="menu-profile"
                onClick={() => { setShowDropdown(false); navigate('/profile'); }}
              >
                <IoPersonOutline size={18} />
                <span>My Profile</span>
              </button>

              <button
                className="header__dropdown-item"
                role="menuitem"
                id="menu-change-password"
                onClick={() => { setShowDropdown(false); navigate('/settings/change-password'); }}
              >
                <IoLockClosedOutline size={18} />
                <span>Change Password</span>
              </button>

              <div className="header__dropdown-divider" />

              <button
                className="header__dropdown-item header__dropdown-item--danger"
                role="menuitem"
                id="menu-logout"
                onClick={handleLogout}
              >
                <IoLogOutOutline size={18} />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
