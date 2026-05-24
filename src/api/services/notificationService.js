/**
 * Notifications API endpoints
 * Owner: Kyrillos
 *
 * Notification model (from ERD):
 *   Notification_Id (PK), User_Id (FK), Type, Subject, Content,
 *   Sent_at, Delivered_at, Read_at
 *
 * Backend URL alignment:
 *   GET    /notifications              → getNotifications
 *   PATCH  /notifications/<id>/read   → markAsRead
 *   PATCH  /notifications/read-all    → markAllAsRead
 *   GET    /notifications/unread-count → getUnreadCount
 */
import apiClient from '../apiClient';

const notificationApi = {
  /**
   * Get all notifications for the authenticated user.
   * @param {{ notification_type?: string, is_read?: boolean }} params
   * @returns {Promise<{ data: Notification[] }>}
   */
  getNotifications: (params = {}) =>
    apiClient.get('/notifications', { params }),

  /**
   * Mark a single notification as read.
   * Sets is_read=true and read_at=now on the backend.
   * @param {number} notificationId
   * @returns {Promise<{ data: Notification }>}
   */
  markAsRead: (notificationId) =>
    apiClient.patch(`/notifications/${notificationId}/read`),

  /**
   * Mark ALL unread notifications as read for the current user.
   * @returns {Promise<{ data: { updated_count: number } }>}
   */
  markAllAsRead: () =>
    apiClient.patch('/notifications/read-all'),

  /**
   * Lightweight count for navbar badge.
   * @returns {Promise<{ data: { unread_count: number } }>}
   */
  getUnreadCount: () =>
    apiClient.get('/notifications/unread-count'),
};

export default notificationApi;
