/**
 * Patient API endpoints
 * Owner: Abanob
 *
 * Patient model (from ERD):
 *   Patient_Id (PK), User_Id (FK → User), National_Id, Date_Of_Birth,
 *   Blood_Type, Emergency_Contact, Address, created_at, updated_at, deleted_at
 */
import apiClient from '../apiClient';

const patientApi = {
  getProfile: () =>
    apiClient.get('/patients/profile'),

  updateProfile: (data) =>
    apiClient.put('/patients/profile', data),
  // data: { national_id, date_of_birth, blood_type, emergency_contact, address,
  //         first_name, middle_name, last_name, phone_number }

  getDashboard: () =>
    apiClient.get('/patients/dashboard'),
};

export default patientApi;
