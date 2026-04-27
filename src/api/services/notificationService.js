/**
 * Notifications API endpoints
 * Owner: Kyrillos
 *
 * Notification model (from ERD):
 *   Notification_Id (PK), User_Id (FK), Type, Subject, Content,
 *   Sent_at, Delivered_at, Read_at, created_at, deleted_at
 */
import apiClient from '../apiClient';

const notificationApi = {
  getNotifications: () =>
    apiClient.get('/notifications'),
  // Returns: [{ notification_id, user_id, type, subject, content,
  //             sent_at, delivered_at, read_at, created_at }]

  markAsRead: (notificationId) =>
    apiClient.patch(`/notifications/${notificationId}/read`),
  // Sets read_at timestamp

  markAllAsRead: () =>
    apiClient.patch('/notifications/read-all'),
};

export default notificationApi;
