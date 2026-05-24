/**
 * Auth API endpoints
 * Owner: Abanob
 *
 * User model (from ERD):
 *   User_Id, Email, Password_Hash, First_Name, Middle_Name, Last_Name,
 *   Phone_Number, Role, created_at, updated_at
 *
 * Roles: PATIENT, DOCTOR, NURSE, BILLING_STAFF, ADMIN
 *
 * JWT field names (Django SimpleJWT):
 *   Request body for login:   { email, password }
 *   Response from login:      { access, refresh, user: {...} }
 *   Request body for refresh: { refresh }
 *   Response from refresh:    { access }
 */
import apiClient from '../apiClient';

const authApi = {
  /**
   * @param {{ email: string, password: string }} credentials
   * @returns {Promise<{ data: { access: string, refresh: string, user: object } }>}
   */
  login: (credentials) =>
    apiClient.post('/auth/login', credentials),

  /**
   * @param {{ email: string, password: string, first_name: string, last_name: string,
   *           middle_name?: string, phone_number?: string, role?: string }} data
   * @returns {Promise<{ data: { access: string, refresh: string, user: object } }>}
   */
  register: (data) =>
    apiClient.post('/auth/register', data),

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
   * Refresh the access token using the stored refresh token.
   * SimpleJWT accepts { refresh } and returns { access }.
   *
   * @param {string} refreshToken
   * @returns {Promise<{ data: { access: string } }>}
   */
  refreshToken: (refreshToken) =>
    apiClient.post('/auth/refresh', { refresh: refreshToken }),

  /**
   * Blacklist the refresh token on logout.
   */
  logout: () =>
    apiClient.post('/auth/logout'),

  /**
   * @param {{ old_password: string, new_password: string, new_password_confirm: string }} payload
   */
  changePassword: (payload) =>
    apiClient.post('/auth/change-password', payload),
};

export default authApi;
