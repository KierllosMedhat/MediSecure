import { describe, it, expect, vi, beforeEach } from 'vitest';
import authApi from './authService';
import apiClient from '../apiClient';

// Mock the apiClient
vi.mock('../apiClient', () => ({
  default: {
    post: vi.fn(),
  }
}));

describe('authService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('login calls /auth/login with credentials', async () => {
    const mockData = { access: 'token', refresh: 'token', user: {} };
    apiClient.post.mockResolvedValueOnce({ data: mockData });

    const credentials = { email: 'test@example.com', password: 'password123' };
    const response = await authApi.login(credentials);

    expect(apiClient.post).toHaveBeenCalledWith('/auth/login', credentials);
    expect(response.data).toEqual(mockData);
  });

  it('register calls /auth/register with data', async () => {
    const mockData = { access: 'token', refresh: 'token', user: {} };
    apiClient.post.mockResolvedValueOnce({ data: mockData });

    const data = { email: 'test@example.com', password: 'password123', first_name: 'John' };
    const response = await authApi.register(data);

    expect(apiClient.post).toHaveBeenCalledWith('/auth/register', data);
    expect(response.data).toEqual(mockData);
  });

  it('forgotPassword calls /auth/forgot-password with email', async () => {
    apiClient.post.mockResolvedValueOnce({ data: { message: 'sent' } });
    await authApi.forgotPassword('test@example.com');
    expect(apiClient.post).toHaveBeenCalledWith('/auth/forgot-password', { email: 'test@example.com' });
  });

  it('verifyOtp calls /auth/verify-otp with email and otp', async () => {
    apiClient.post.mockResolvedValueOnce({ data: { message: 'verified' } });
    await authApi.verifyOtp('test@example.com', '123456');
    expect(apiClient.post).toHaveBeenCalledWith('/auth/verify-otp', { email: 'test@example.com', otp: '123456' });
  });

  it('resetPassword calls /auth/reset-password with payload', async () => {
    apiClient.post.mockResolvedValueOnce({ data: { message: 'success' } });
    const payload = { email: 'test@example.com', otp: '123456', new_password: 'newpassword123' };
    await authApi.resetPassword(payload);
    expect(apiClient.post).toHaveBeenCalledWith('/auth/reset-password', payload);
  });

  it('refreshToken calls /auth/refresh with token', async () => {
    apiClient.post.mockResolvedValueOnce({ data: { access: 'newtoken' } });
    await authApi.refreshToken('oldrefreshtoken');
    expect(apiClient.post).toHaveBeenCalledWith('/auth/refresh', { refresh: 'oldrefreshtoken' });
  });

  it('logout calls /auth/logout', async () => {
    apiClient.post.mockResolvedValueOnce({ data: { message: 'logged out' } });
    await authApi.logout();
    expect(apiClient.post).toHaveBeenCalledWith('/auth/logout');
  });

  it('changePassword calls /auth/change-password with payload', async () => {
    apiClient.post.mockResolvedValueOnce({ data: { message: 'success' } });
    const payload = { old_password: 'old', new_password: 'new', new_password_confirm: 'new' };
    await authApi.changePassword(payload);
    expect(apiClient.post).toHaveBeenCalledWith('/auth/change-password', payload);
  });
});
