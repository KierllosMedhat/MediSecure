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
  /**
   * @param {{ email: string, password: string, device_id: string }} credentials
   * @returns {Promise<{ data: { access_token, refresh_token, user } }>}
   */
  login: (credentials) =>
    apiClient.post('/auth/login', credentials),

  /**
   * @param {string} email
   * @returns {Promise<{ data: { message: string } }>}
   */
  forgotPassword: (email) =>
    apiClient.post('/auth/forgot-password', { email }),

  /**
   * @param {string} email
   * @param {string} otp
   * @returns {Promise<{ data: { message: string } }>}
   */
  verifyOtp: (email, otp) =>
    apiClient.post('/auth/verify-otp', { email, otp }),

  /**
   * @param {{ email: string, otp: string, new_password: string }} payload
   * @returns {Promise<{ data: { message: string } }>}
   */
  resetPassword: (payload) =>
    apiClient.post('/auth/reset-password', payload),

  /**
   * @param {string} refreshToken
   */
  refreshToken: (refreshToken) =>
    apiClient.post('/auth/refresh', { refresh_token: refreshToken }),

  logout: () =>
    apiClient.post('/auth/logout'),
};

export default authApi;
