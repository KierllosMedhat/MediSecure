import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../features/auth/hooks/useAuth';
import { IoNotificationsOutline, IoSearchOutline, IoPersonOutline, IoLockClosedOutline, IoLogOutOutline } from 'react-icons/io5';
import notificationApi from '../../../api/services/notificationService';
import './Header.css';

export default function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
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
      {/* Search (optional placeholder) */}
      <div className="header__search">
        <IoSearchOutline className="header__search-icon" />
        <input
          type="text"
          placeholder="Search..."
          className="header__search-input"
          id="global-search"
        />
      </div>

      {/* Right actions */}
      <div className="header__actions">
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
