/**
 * Notifications Page — notification center with mark-as-read.
 * Owner: Kyrillos
 *
 * ERD refs:
 *   Notification → Notification_Id, User_Id (FK), Type, Subject, Content,
 *                   Sent_at, Delivered_at, Read_at, created_at, deleted_at
 *
 * TODO:
 * - Fetch from notificationApi.getNotifications()
 * - Render list: icon (by Type), Subject, Content, Sent_at, Read_at indicator
 * - Click unread → notificationApi.markAsRead(id) sets Read_at
 * - "Mark all read" button → notificationApi.markAllAsRead()
 */
import { Card, Button } from '../../../components/ui';
import './NotificationPages.css';

export default function NotificationsPage() {
  return (
    <div className="notifications-page">
      <div className="page-header">
        <h1 className="page-title">Notifications</h1>
        <p className="page-subtitle">0 unread notifications</p>
      </div>
      {/* TODO: Notification list */}
    </div>
  );
}
