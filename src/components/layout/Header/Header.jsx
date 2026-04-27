/**
 * Header bar — displays page title, search, user avatar, notifications.
 * Owner: Kyrillos (Shared UI)
 */
import { useAuth } from '../../../features/auth/context/AuthContext';
import { IoNotificationsOutline, IoSearchOutline } from 'react-icons/io5';
import './Header.css';

export default function Header() {
  const { user } = useAuth();

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
        <button className="header__icon-btn" aria-label="Notifications" id="header-notifications-btn">
          <IoNotificationsOutline size={20} />
          <span className="header__badge">3</span>
        </button>

        <div className="header__avatar" id="header-user-avatar">
          <span>{user?.name?.charAt(0) || 'U'}</span>
        </div>
      </div>
    </header>
  );
}
