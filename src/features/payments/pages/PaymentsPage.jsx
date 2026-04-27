/**
 * Payments Page — balance, payment history, Fawry/Card payment flows.
 * Owner: Abdullah
 *
 * ERD refs:
 *   Payment → Payment_Id, Patient_Id (FK), Amount, Currency,
 *             Payment_Type, Gateway_Type, Status, Paid_at, Receipt_URL,
 *             created_at, deleted_at
 *   Gateway_Type: FAWRY | INTERNATIONAL (Visa/Mastercard)
 *   Status: PENDING → COMPLETED | FAILED
 *
 * TODO:
 * - Fetch paymentApi.getOutstandingBalance() and paymentApi.getPaymentHistory()
 * - Balance card: show Amount + Currency, "Pay with Fawry" / "Pay with Card" buttons
 * - Fawry modal: fawry_code, amount, currency, payment_type
 *     → paymentApi.payWithFawry(payload) — Gateway_Type=FAWRY
 * - Card modal: card_token, cvv, amount, currency, payment_type
 *     → paymentApi.payWithCard(payload) — Gateway_Type=INTERNATIONAL
 * - Payment history DataTable columns: Amount, Currency, Payment_Type,
 *   Gateway_Type (StatusBadge), created_at, Status (StatusBadge), Paid_at, actions
 * - Status flow: PENDING → COMPLETED (show Receipt) | FAILED (show Retry)
 * - Receipt button → /payments/receipt/:paymentId (uses Receipt_URL)
 * - "Pending Bills" widget with overdue highlighting
 */
import { Card, Button, DataTable, StatusBadge, Modal, Input } from '../../../components/ui';
import './PaymentPages.css';

export default function PaymentsPage() {
  return (
    <div className="payments-page">
      <div className="page-header">
        <h1 className="page-title">Payments</h1>
        <p className="page-subtitle">Manage your billing and payments.</p>
      </div>

      {/* TODO: Balance card (Amount, Currency) with pay buttons */}
      {/* TODO: Pending bills widget with overdue highlighting */}
      {/* TODO: Payment history DataTable */}
      {/* TODO: Fawry payment modal (Gateway_Type=FAWRY) */}
      {/* TODO: Card payment modal (Gateway_Type=INTERNATIONAL) */}
    </div>
  );
}
