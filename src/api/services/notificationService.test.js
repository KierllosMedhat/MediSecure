import { describe, it, expect, vi, beforeEach } from 'vitest';
import notificationApi from './notificationService';
import apiClient from '../apiClient';

vi.mock('../apiClient', () => ({
  default: {
    get: vi.fn(),
    patch: vi.fn(),
  }
}));

describe('notificationService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getNotifications calls /notifications with params', async () => {
    const mockData = [{ id: 1 }];
    apiClient.get.mockResolvedValueOnce({ data: mockData });

    const params = { is_read: false };
    const response = await notificationApi.getNotifications(params);

    expect(apiClient.get).toHaveBeenCalledWith('/notifications', { params });
    expect(response.data).toEqual(mockData);
  });

  it('markAsRead calls PATCH /notifications/:id/read', async () => {
    const mockData = { id: 1 };
    apiClient.patch.mockResolvedValueOnce({ data: mockData });

    const response = await notificationApi.markAsRead(1);

    expect(apiClient.patch).toHaveBeenCalledWith('/notifications/1/read');
    expect(response.data).toEqual(mockData);
  });

  it('markAllAsRead calls PATCH /notifications/read-all', async () => {
    const mockData = { updated: 5 };
    apiClient.patch.mockResolvedValueOnce({ data: mockData });

    const response = await notificationApi.markAllAsRead();

    expect(apiClient.patch).toHaveBeenCalledWith('/notifications/read-all');
    expect(response.data).toEqual(mockData);
  });

  it('getUnreadCount calls /notifications/unread-count', async () => {
    const mockData = { count: 3 };
    apiClient.get.mockResolvedValueOnce({ data: mockData });

    const response = await notificationApi.getUnreadCount();

    expect(apiClient.get).toHaveBeenCalledWith('/notifications/unread-count');
    expect(response.data).toEqual(mockData);
  });
});
