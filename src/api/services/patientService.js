/**
 * Patient API endpoints
 * Owner: Abanob
 *
 * Patient model (from ERD):
 *   Patient_Id (PK), User_Id (FK → User), National_Id, Date_Of_Birth,
 *   Blood_Type, Emergency_Contact, Address, created_at, updated_at, deleted_at
 *
 * User model (from ERD):
 *   User_Id, Email, Password_Hash, First_Name, Middle_Name, Last_Name,
 *   Phone_Number, Role, created_at, updated_at, deleted_at
 */
import apiClient from '../apiClient';

const patientApi = {
  getPatients: () => apiClient.get('/patients'),
  /**
   * Fetch the authenticated patient's profile (merged User + Patient data).
   *
   * @returns {Promise<{ data: {
   *   patient_id: string,
   *   user_id: string,
   *   first_name: string,
   *   middle_name: string | null,
   *   last_name: string,
   *   email: string,
   *   phone_number: string | null,
   *   national_id: string,
   *   date_of_birth: string,
   *   blood_type: string | null,
   *   emergency_contact: string | null,
   *   address: string | null,
   *   role: string,
   *   created_at: string
   * } }>}
   */
  getProfile: () =>
    apiClient.get('/patients/profile'),

  /**
   * Update the authenticated patient's profile.
   * National_Id and Email are NOT editable.
   *
   * @param {{ first_name?: string, middle_name?: string, last_name?: string,
   *           phone_number?: string, date_of_birth?: string, blood_type?: string,
   *           emergency_contact?: string, address?: string }} data
   * @returns {Promise<{ data: { message: string } }>}
   */
  updateProfile: (data) =>
    apiClient.put('/patients/profile', data),

  /**
   * Fetch the patient's dashboard summary.
   *
   * @returns {Promise<{ data: {
   *   stats: {
   *     total_records: number,
   *     pending_bills_amount: number,
   *     next_appointment: { date: string, doctor_name: string } | null,
   *     profile_completion: number
   *   },
   *   recent_records: Array<{
   *     id: string, title: string, doctor_name: string,
   *     date: string, type: string
   *   }>,
   *   pending_bills: Array<{
   *     id: string, description: string, due_date: string,
   *     amount: number, status: 'PENDING' | 'OVERDUE'
   *   }>,
   *   recent_activity: Array<{
   *     id: string, action: string, description: string,
   *     timestamp: string, type: 'upload' | 'access' | 'payment'
   *   }>,
   *   consent: { grant_data_access: boolean }
   * } }>}
   */
  getDashboard: () =>
    apiClient.get('/patients/dashboard'),
};

export default patientApi;
