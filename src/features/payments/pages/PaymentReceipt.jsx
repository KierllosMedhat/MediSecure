/**
 * Payment Receipt Page
 * Owner: Abdullah
 *
 * ERD refs: Payment → Payment_Id, Amount, Currency, Payment_Type,
 *           Gateway_Type, Status, Paid_at, Receipt_URL
 *
 * TODO:
 * - Fetch receipt from paymentApi.getReceipt(paymentId)
 * - Display: Payment_Id, Amount + Currency, Payment_Type, Gateway_Type,
 *   Status, Paid_at, Receipt_URL
 * - Print button (window.print())
 * - Back link to /payments
 */
import { useParams } from 'react-router-dom';
import { Card, Button } from '../../../components/ui';
import './PaymentPages.css';

export default function PaymentReceipt() {
  const { paymentId } = useParams();

  return (
    <div className="payments-page">
      {/* TODO: Back link */}
      {/* TODO: Receipt card with ERD Payment fields + print button */}
    </div>
  );
}
