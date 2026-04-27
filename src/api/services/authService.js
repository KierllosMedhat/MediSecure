/**
 * Auth API endpoints
 * Owner: Abanob
 *
 * User model (from ERD):
 *   User_Id, Email, Password_Hash, First_Name, Middle_Name, Last_Name,
 *   Phone_Number, Role, created_at, updated_at, deleted_at
 *
 * Roles: PATIENT, DOCTOR, NURSE, BILLING_STAFF, ADMIN
 */
import apiClient from '../apiClient';

const authApi = {
  login: (credentials) =>
    apiClient.post('/auth/login', credentials),
  // credentials: { email, password, device_id }

  forgotPassword: (email) =>
    apiClient.post('/auth/forgot-password', { email }),

  verifyOtp: (email, otp) =>
    apiClient.post('/auth/verify-otp', { email, otp }),

  resetPassword: (payload) =>
    apiClient.post('/auth/reset-password', payload),
  // payload: { email, otp, new_password }

  refreshToken: (refreshToken) =>
    apiClient.post('/auth/refresh', { refresh_token: refreshToken }),

  logout: () =>
    apiClient.post('/auth/logout'),
};

export default authApi;
