/**
 * Payments API endpoints
 * Owner: Abdullah
 *
 * Payment model (from ERD):
 *   Payment_Id (PK), Patient_Id (FK), Amount, Currency,
 *   Payment_Type, Gateway_Type, Status, Paid_at, Receipt_URL,
 *   created_at, deleted_at
 *
 * Gateway_Type: FAWRY | INTERNATIONAL (Visa/Mastercard)
 * Status: PENDING | COMPLETED | FAILED
 */
import apiClient from '../apiClient';

const paymentApi = {
  getPaymentHistory: () =>
    apiClient.get('/payments'),
  // Returns: [{ payment_id, patient_id, amount, currency, payment_type,
  //             gateway_type, status, paid_at, receipt_url, created_at }]

  getOutstandingBalance: () =>
    apiClient.get('/payments/balance'),

  payWithFawry: (payload) =>
    apiClient.post('/payments/fawry', payload),
  // payload: { fawry_code, amount, currency, payment_type }
  // gateway_type = FAWRY (set by backend)

  payWithCard: (payload) =>
    apiClient.post('/payments/card', payload),
  // payload: { card_token, cvv, amount, currency, payment_type }
  // gateway_type = INTERNATIONAL (set by backend)

  getPaymentStatus: (paymentId) =>
    apiClient.get(`/payments/${paymentId}/status`),

  getReceipt: (paymentId) =>
    apiClient.get(`/payments/${paymentId}/receipt`),
  // Returns: { receipt_url, ... }
};

export default paymentApi;
