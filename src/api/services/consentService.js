/**
 * Consent API endpoints
 * Owner: Abdullah
 *
 * Consent model (from ERD):
 *   Consent_Id (PK), Patient_Id (FK), Staff_Id (FK),
 *   Purpose, Is_Active, granted_at, revoked_at, deleted_at
 */
import apiClient from '../apiClient';

const consentApi = {
  getConsents: (patientId) =>
    apiClient.get(`/patients/${patientId}/consents`),
  // Returns: [{ consent_id, patient_id, staff_id, purpose, is_active, granted_at, revoked_at }]

  grantConsent: (patientId, payload) =>
    apiClient.post(`/patients/${patientId}/consents`, payload),
  // payload: { staff_id, purpose }

  revokeConsent: (patientId, consentId) =>
    apiClient.delete(`/patients/${patientId}/consents/${consentId}`),
  // Sets is_active = false, records revoked_at timestamp
};

export default consentApi;
