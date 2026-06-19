/**
 * Payments API endpoints
 * Owner: Abdullah
 *
 * Payment model (from ERD):
 * Payment_Id (PK), Patient_Id (FK), Amount, Currency,
 * Payment_Type, Gateway_Type, Status, Paid_at, Receipt_URL,
 * created_at, updated_at
 *
 * Gateway_Type: FAWRY | CARD
 * Status: PENDING | PROCESSING | PAID | FAILED | REFUNDED | CANCELLED
 *
 * Backend URL alignment:
 * GET    /payments              → getPaymentHistory
 * GET    /payments/balance      → getOutstandingBalance
 * POST   /payments/fawry        → payWithFawry
 * POST   /payments/card         → payWithCard
 * GET    /payments/<id>/status  → getPaymentStatus
 * GET    /payments/<id>/receipt → getReceipt
 */
import apiClient from "../apiClient";

const paymentApi = {
  /**
   * Get all payments for the authenticated patient.
   * @returns {Promise<{ data: Payment[] }>}
   */
  getPaymentHistory: () => apiClient.get("/payments/"),

  /**
   * Get outstanding (PENDING) balance for the authenticated patient.
   * @returns {Promise<{ data: { balance: number, currency: string, pending_count: number } }>}
   */
  getOutstandingBalance: () => apiClient.get("/payments/balance"),

  /**
   * Initiate a Fawry payment.
   * @param {{ fawry_code: string, amount: number, currency: string, payment_type: string }} payload
   * @returns {Promise<{ data: { payment_id: number, fawry_reference_number: string, expires_at: string } }>}
   */
  payWithFawry: (payload) => apiClient.post("/payments/fawry", payload),

  /**
   * Initiate a card (Visa/Mastercard) payment.
   * @param {{ card_token: string, cvv: string, amount: number, currency: string, payment_type: string }} payload
   * @returns {Promise<{ data: { payment_id: number, payment_url: string } }>}
   */
  payWithCard: (payload) => apiClient.post("/payments/card", payload),

  /**
   * Poll the current status of a payment.
   * @param {number} paymentId
   * @returns {Promise<{ data: { payment_id: number, status: string, paid_at: string|null } }>}
   */
  getPaymentStatus: (paymentId) =>
    apiClient.get(`/payments/${paymentId}/status`),

  /**
   * Get the receipt for a PAID payment.
   * @param {number} paymentId
   * @returns {Promise<{ data: { receipt_url: string, ... } }>}
   */
  getReceipt: (paymentId) =>
    apiClient.get(`/payments/${paymentId}/receipt`),

  /**
   * Generate a bill for an appointment (Billing Staff).
   * @param {number} appointment_id
   * @param {number} amount
   * @returns {Promise<{ data: { payment_id: number, status: string } }>}
   */
  generateAppointmentBill: (appointment_id, amount) =>
    apiClient.post('/payments/generate-for-appointment', { appointment_id, amount }),

  /**
   * Mark a payment as paid manually (Billing Staff).
   * @param {number} paymentId
   * @returns {Promise<{ data: { payment_id: number, status: string } }>}
   */
  markPaymentPaid: (paymentId) =>
    apiClient.post(`/payments/${paymentId}/mark-paid`),
};

export default paymentApi;
