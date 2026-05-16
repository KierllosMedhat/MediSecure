/**
 * Notifications Page — notification center with mark-as-read.
 * Owner: Kyrillos
 *
 * ERD refs:
 *   Notification → Notification_Id, User_Id (FK), Type, Subject, Content,
 *                   Sent_at, Delivered_at, Read_at, created_at, deleted_at
 */
import { useState, useEffect, useCallback } from 'react';
import { Card, Button } from '../../../components/ui';
import notificationApi from '../../../api/services/notificationService';
import {
  IoCalendarOutline,
  IoCardOutline,
  IoDocumentTextOutline,
  IoShieldCheckmarkOutline,
  IoSettingsOutline,
  IoWarningOutline,
  IoNotificationsOffOutline,
  IoCheckmarkDoneOutline,
} from 'react-icons/io5';
import './NotificationPages.css';

/* ---------- Dummy notifications ---------- */
const DUMMY_NOTIFICATIONS = [
  {
    notification_id: 1, type: 'APPOINTMENT', subject: 'Upcoming Appointment',
    content: 'You have an appointment with Dr. Sara Ahmed tomorrow at 9:00 AM in Room 201.',
    sent_at: '2026-05-16T08:00:00Z', read_at: null,
  },
  {
    notification_id: 2, type: 'PAYMENT', subject: 'Payment Received',
    content: 'Your payment of $150.00 for consultation has been processed successfully.',
    sent_at: '2026-05-15T14:30:00Z', read_at: null,
  },
  {
    notification_id: 3, type: 'RECORD', subject: 'New Lab Results Available',
    content: 'Your blood test results from Cairo Medical Center are now available in your records.',
    sent_at: '2026-05-15T10:00:00Z', read_at: null,
  },
  {
    notification_id: 4, type: 'CONSENT', subject: 'Consent Request',
    content: 'Dr. Omar Hassan has requested access to your medical records for a follow-up consultation.',
    sent_at: '2026-05-14T16:45:00Z', read_at: '2026-05-14T17:00:00Z',
  },
  {
    notification_id: 5, type: 'SYSTEM', subject: 'System Maintenance',
    content: 'MediSecure will undergo scheduled maintenance on May 20 from 2:00 AM to 4:00 AM.',
    sent_at: '2026-05-13T09:00:00Z', read_at: '2026-05-13T11:30:00Z',
  },
  {
    notification_id: 6, type: 'ALERT', subject: 'Security Alert',
    content: 'A new login was detected from Cairo, Egypt. If this was not you, please change your password.',
    sent_at: '2026-05-12T22:15:00Z', read_at: '2026-05-13T08:00:00Z',
  },
];

/* Icon by notification type */
const ICON_MAP = {
  APPOINTMENT: { icon: <IoCalendarOutline />, css: 'appointment' },
  PAYMENT:     { icon: <IoCardOutline />, css: 'payment' },
  RECORD:      { icon: <IoDocumentTextOutline />, css: 'record' },
  CONSENT:     { icon: <IoShieldCheckmarkOutline />, css: 'consent' },
  SYSTEM:      { icon: <IoSettingsOutline />, css: 'system' },
  ALERT:       { icon: <IoWarningOutline />, css: 'alert' },
};

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(DUMMY_NOTIFICATIONS);

  /* Fetch from API */
  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await notificationApi.getNotifications();
        setNotifications(res.data);
      } catch {
        setNotifications(DUMMY_NOTIFICATIONS);
      }
    };
    fetch();
  }, []);

  const unreadCount = notifications.filter((n) => !n.read_at).length;

  /* Mark single as read */
  const handleMarkRead = useCallback(async (id) => {
    try { await notificationApi.markAsRead(id); } catch { /* optimistic */ }
    setNotifications((prev) =>
      prev.map((n) => n.notification_id === id ? { ...n, read_at: new Date().toISOString() } : n)
    );
  }, []);

  /* Mark all as read */
  const handleMarkAllRead = useCallback(async () => {
    try { await notificationApi.markAllAsRead(); } catch { /* optimistic */ }
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, read_at: n.read_at || new Date().toISOString() }))
    );
  }, []);

  return (
    <div className="notifications-page animate-fade-in">
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h1 className="page-title">Notifications</h1>
            <p className="page-subtitle">
              {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
            </p>
          </div>
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={handleMarkAllRead}>
              <IoCheckmarkDoneOutline /> Mark All Read
            </Button>
          )}
        </div>
      </div>

      {notifications.length === 0 ? (
        <div className="notification-empty">
          <div className="notification-empty__icon"><IoNotificationsOffOutline /></div>
          <p className="notification-empty__text">No notifications yet</p>
          <p className="notification-empty__sub">You&apos;ll see updates here when they arrive.</p>
        </div>
      ) : (
        <div className="notification-list">
          {notifications.map((n) => {
            const isUnread = !n.read_at;
            const iconInfo = ICON_MAP[n.type] || ICON_MAP.SYSTEM;
            return (
              <div
                key={n.notification_id}
                className={`notification-item ${isUnread ? 'notification-item--unread' : ''}`}
                onClick={() => isUnread && handleMarkRead(n.notification_id)}
                role={isUnread ? 'button' : undefined}
                tabIndex={isUnread ? 0 : undefined}
                onKeyDown={(e) => { if (isUnread && e.key === 'Enter') handleMarkRead(n.notification_id); }}
              >
                <div className={`notification-icon notification-icon--${iconInfo.css}`}>
                  {iconInfo.icon}
                </div>
                <div className="notification-content">
                  <span className="notification-subject">{n.subject}</span>
                  <span className="notification-body">{n.content}</span>
                  <span className="notification-time">{timeAgo(n.sent_at)}</span>
                </div>
                {isUnread && <div className="notification-unread-dot" />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
