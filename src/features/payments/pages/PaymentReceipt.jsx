/**
 * Payment Receipt Page
 * Owner: Abdullah
 *
 * ERD refs: Payment → Payment_Id, Amount, Currency, Payment_Type,
 * Gateway_Type, Status, Paid_at, Receipt_URL
 *
 * TODO:
 * - Fetch receipt from paymentApi.getReceipt(paymentId)
 * - Display: Payment_Id, Amount + Currency, Payment_Type, Gateway_Type,
 * Status, Paid_at, Receipt_URL
 * - Print button (window.print())
 * - Back link to /payments
 */
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button } from '../../../components/ui';
import './PaymentPages.css';
import paymentApi from '../../../api/services/paymentService';

export default function PaymentReceipt() {
  const { paymentId } = useParams();
  const navigate = useNavigate(); 
  const [receipt, setReceipt] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchReceipt = async () => {
      setIsLoading(true);
      try {
        const response = await paymentApi.getReceipt(paymentId);
        setReceipt(response.data);
      } catch (error) {
        console.error("Failed to load receipt", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchReceipt();
  }, [paymentId]);

  if (isLoading) {
    return <div className="payments-page payments-container"><p>Loading receipt details...</p></div>;
  }

  if (!receipt) {
    return <div className="payments-page payments-container"><p>Receipt not found.</p></div>;
  }

  return (
    <div className="payments-page payments-container">
      
      {/* TODO: Back link */}
      <div style={{ marginBottom: '1.5rem' }}>
        <Button variant="secondary" onClick={() => navigate('/payments')}>
          &larr; Back to Payments
        </Button>
      </div>

      {/* TODO: Receipt card with ERD Payment fields + print button */}
      <Card className="receipt-card">
        <div className="receipt-header">
          <h2 style={{ color: '#28a745', margin: '0 0 10px 0' }}>Payment Successful</h2>
          <p style={{ color: '#6c757d', margin: 0 }}>Thank you for your payment!</p>
        </div>

        <div className="receipt-details">
          <div className="receipt-row">
            <span>Payment ID:</span>
            <strong>{receipt.id}</strong>
          </div>
          <div className="receipt-row">
            <span>Date Paid:</span>
            <strong>{receipt.paid_at ? new Date(receipt.paid_at).toLocaleString() : 'N/A'}</strong>
          </div>
          <div className="receipt-row">
            <span>Payment Type:</span>
            <strong>{receipt.payment_type}</strong>
          </div>
          <div className="receipt-row">
            <span>Gateway:</span>
            <strong>{receipt.gateway_type}</strong>
          </div>
          <div className="receipt-row">
            <span>Status:</span>
            <strong style={{ color: '#28a745' }}>{receipt.status}</strong>
          </div>
          
          <div className="receipt-row total">
            <span>Amount Paid:</span>
            <span style={{ color: '#0056b3' }}>
              {Number(receipt.amount).toFixed(2)} {receipt.currency}
            </span>
          </div>
        </div>

        {/* TODO: Print button (window.print()) */}
        <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <Button variant="primary" onClick={() => window.print()} style={{ width: '100%' }}>
            Print Receipt
          </Button>
          {receipt.receipt_url && (
            <Button 
              variant="secondary" 
              onClick={() => window.open(receipt.receipt_url, '_blank')} 
              style={{ width: '100%' }}
            >
              Download Digital Copy
            </Button>
          )}
        </div>
      </Card>
      
    </div>
  );
}