/**
 * Consent API endpoints
 * Owner: Abdullah
 *
 * Consent model (from ERD):
 *   Consent_Id (PK), Patient_Id (FK), Staff_Id (FK),
 *   Purpose, Is_Active, granted_at, revoked_at
 *
 * Backend URL alignment (all patient-scoped, registered in root urls.py):
 *   GET    /patients/<id>/consents          → getConsents
 *   POST   /patients/<id>/consents          → grantConsent
 *   DELETE /patients/<id>/consents/<cid>    → revokeConsent
 *
 * Utility (admin/staff):
 *   GET    /consents/check?patient_id=&staff_id=&purpose=  → checkConsent
 */
import apiClient from "../apiClient";

const consentApi = {
  /**
   * Get all consents for a patient.
   * @param {number} patientId
   * @param {{ is_active?: boolean }} params
   * @returns {Promise<{ data: Consent[] }>}
   */
  getConsents: (patientId, params = {}) =>
    apiClient.get(`/patients/${patientId}/consents`, { params }),

  /**
   * Grant a new consent.
   * @param {number} patientId
   * @param {{ staff_id: number, purpose: string, description?: string, expires_at?: string }} payload
   * @returns {Promise<{ data: Consent }>}
   */
  grantConsent: (patientId, payload) => {
    const backendPayload = {
      ...payload,
      staff: payload.staff_id,
    };
    delete backendPayload.staff_id;

    return apiClient.post(`/patients/${patientId}/consents`, backendPayload);
  },
  /**
   * Revoke an active consent (soft-delete — sets is_active=false).
   * Backend returns 200 (not 204) with { message, revoked_at }.
   * @param {number} patientId
   * @param {number} consentId
   * @returns {Promise<{ data: { message: string, revoked_at: string } }>}
   */
  revokeConsent: (patientId, consentId) =>
    apiClient.delete(`/patients/${patientId}/consents/${consentId}`),

  /**
   * Quick check if an active consent exists (used by staff before accessing records).
   * @param {{ patient_id: number, staff_id: number, purpose: string }} params
   * @returns {Promise<{ data: { has_consent: boolean, consent_id: number|null } }>}
   */
  checkConsent: (params) => apiClient.get("/consents/check", { params }),
};

export default consentApi;
