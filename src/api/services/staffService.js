/**
 * Staff API endpoints
 * Owner: Kyrillos
 *
 * Staff model (from ERD):
 *   Staff_Id (PK), User_Id (FK → User), Hospital_Id (FK → Hospital),
 *   Department, License_no, Address, created_at, updated_at
 *
 * Staff roles (via User.Role): DOCTOR, NURSE, BILLING_STAFF, ADMIN
 *
 * Backend URL alignment:
 *   GET    /staff                    → getStaffList
 *   GET    /staff/<id>               → getStaffById
 *   POST   /staff                    → createStaff  (same endpoint, POST method)
 *   PUT    /staff/<id>               → updateStaff
 *   PATCH  /staff/<id>/deactivate    → deactivateStaff
 *   GET    /staff/dashboard          → getStaffDashboard
 */
import apiClient from '../apiClient';

const staffApi = {
  /**
   * @param {{ role?: string, department?: string, status?: string, hospital_id?: number }} params
   * @returns {Promise<{ data: Staff[] }>}
   */
  getStaffList: (params = {}) =>
    apiClient.get('/staff', { params }),

  /**
   * @param {number} staffId
   * @returns {Promise<{ data: Staff }>}
   */
  getStaffById: (staffId) =>
    apiClient.get(`/staff/${staffId}`),

  /**
   * @param {{ email: string, first_name: string, middle_name?: string, last_name: string,
   *           phone_number?: string, role: string, hospital_id: number, department: string,
   *           license_no?: string, address?: string }} data
   * @returns {Promise<{ data: Staff }>}
   */
  createStaff: (data) =>
    apiClient.post('/staff', data),

  /**
   * @param {number} staffId
   * @param {object} data
   * @returns {Promise<{ data: Staff }>}
   */
  updateStaff: (staffId, data) =>
    apiClient.put(`/staff/${staffId}`, data),

  /**
   * Soft-deactivate a staff member (sets is_active=false).
   * @param {number} staffId
   * @returns {Promise<{ data: { message: string } }>}
   */
  deactivateStaff: (staffId) =>
    apiClient.patch(`/staff/${staffId}/deactivate`),

  /**
   * Get dashboard stats for the authenticated staff member.
   * @returns {Promise<{ data: { total_patients, today_appointments, pending_consents, recent_records } }>}
   */
  getStaffDashboard: () =>
    apiClient.get('/staff/dashboard'),

  /**
   * Get the authenticated staff member's own profile.
   * @returns {Promise<{ data: Staff }>}
   */
  getProfile: () =>
    apiClient.get('/staff/profile'),

  /**
   * Update the authenticated staff member's own profile.
   * @param {object} data
   * @returns {Promise<{ data: Staff }>}
   */
  updateProfile: (data) =>
    apiClient.put('/staff/profile', data),
};

export default staffApi;
