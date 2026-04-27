/**
 * Staff API endpoints
 * Owner: Kyrillos
 *
 * Staff model (from ERD):
 *   Staff_Id (PK), User_Id (FK → User), Hospital_Id (FK → Hospital),
 *   Department, License_no, Address, created_at, updated_at, deleted_at
 *
 * Staff roles (via User.Role): DOCTOR, NURSE, BILLING_STAFF, ADMIN
 */
import apiClient from '../apiClient';

const staffApi = {
  getStaffList: (params = {}) =>
    apiClient.get('/staff', { params }),
  // params: { role, department, status, hospital_id }

  getStaffById: (staffId) =>
    apiClient.get(`/staff/${staffId}`),

  createStaff: (data) =>
    apiClient.post('/staff', data),
  // data: { email, first_name, middle_name, last_name, phone_number,
  //         role, hospital_id, department, license_no, address }

  updateStaff: (staffId, data) =>
    apiClient.put(`/staff/${staffId}`, data),

  deactivateStaff: (staffId) =>
    apiClient.patch(`/staff/${staffId}/deactivate`),
};

export default staffApi;
