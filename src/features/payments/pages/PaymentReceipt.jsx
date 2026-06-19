/**
 * Payment Receipt Page
 * Owner: Abdullah
 *
 * ERD refs: Payment → Payment_Id, Amount, Currency, Payment_Type,
 * Gateway_Type, Status, Paid_at, Receipt_URL
 *
 * TODO:
 * - [x] Fetch receipt from paymentApi.getReceipt(paymentId)
 * - [x] Display: Payment_Id, Amount + Currency, Payment_Type, Gateway_Type,
 * Status, Paid_at, Receipt_URL
 * - [x] Print button (window.print())
 * - [x] Back link to /payments
 */
<<<<<<< HEAD
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button } from '../../../components/ui';
import './PaymentPages.css';
import paymentApi from '../../../api/services/paymentService';
=======
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Button } from "../../../components/ui";
import paymentApi from "../../../api/services/paymentService";
import "./PaymentPages.css";
>>>>>>> 2347680b7caed42fb1c6f6240057f736e933ebb1

export default function PaymentReceipt() {
  const { paymentId } = useParams();
  const navigate = useNavigate();
  const [receipt, setReceipt] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReceipt = async () => {
      if (!paymentId) return;

      setIsLoading(true);
      setError(null);

      try {
        const response = await paymentApi.getReceipt(paymentId);
        setReceipt(response.data);
<<<<<<< HEAD
      } catch (error) {
        console.error("Failed to load receipt", error);
=======
      } catch (err) {
        console.error("Failed to load receipt", err);
        setError("Could not retrieve receipt details. Please try again later.");
>>>>>>> 2347680b7caed42fb1c6f6240057f736e933ebb1
      } finally {
        setIsLoading(false);
      }
    };

    fetchReceipt();
  }, [paymentId]);

  if (isLoading) {
    return (
      <div className="payments-page payments-container">
        <p>Loading receipt details...</p>
      </div>
    );
  }

  if (error || !receipt) {
    return (
      <div className="payments-page payments-container">
        <p style={{ color: "red" }}>{error || "Receipt not found."}</p>
        <div style={{ marginTop: "1rem" }}>
          <Button variant="secondary" onClick={() => navigate("/payments")}>
            &larr; Back to Payments
          </Button>
        </div>
      </div>
    );
  }

  const id =
    receipt.Payment_Id || receipt.payment_id || receipt.id || paymentId;
  const amount = receipt.Amount || receipt.amount || 0;
  const currency = receipt.Currency || receipt.currency || "EGP";
  const type = receipt.Payment_Type || receipt.payment_type || "N/A";
  const gateway = receipt.Gateway_Type || receipt.gateway_type || "N/A";
  const status = receipt.Status || receipt.status || "UNKNOWN";
  const paidAt = receipt.Paid_at || receipt.paid_at || "-";
  const receiptUrl = receipt.Receipt_URL || receipt.receipt_url || "#";

  return (
    <div className="payments-page payments-container">
      <div style={{ marginBottom: "1.5rem" }}>
        <Button variant="secondary" onClick={() => navigate("/payments")}>
          &larr; Back to Payments
        </Button>
      </div>

      <Card className="receipt-card">
        <div className="receipt-header">
          <h2 style={{ color: "#28a745", margin: "0 0 10px 0" }}>
            Payment Successful
          </h2>
          <p style={{ color: "#6c757d", margin: 0 }}>
            Thank you for your payment!
          </p>
        </div>

        <div className="receipt-details">
          <div className="receipt-row">
            <span>Payment ID:</span>
<<<<<<< HEAD
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
=======
            <strong>{id}</strong>
          </div>
          <div className="receipt-row">
            <span>Date Paid:</span>
            <strong>{paidAt}</strong>
          </div>
          <div className="receipt-row">
            <span>Payment Type:</span>
            <strong>{type}</strong>
          </div>
          <div className="receipt-row">
            <span>Gateway:</span>
            <strong>{gateway}</strong>
          </div>
          <div className="receipt-row">
            <span>Status:</span>
            <strong style={{ color: "#28a745", textTransform: "uppercase" }}>
              {status}
            </strong>
>>>>>>> 2347680b7caed42fb1c6f6240057f736e933ebb1
          </div>

          <div className="receipt-row total">
            <span>Amount Paid:</span>
<<<<<<< HEAD
            <span style={{ color: '#0056b3' }}>
              {Number(receipt.amount).toFixed(2)} {receipt.currency}
=======
            <span style={{ color: "#0056b3" }}>
              {Number(amount).toFixed(2)} {currency}
>>>>>>> 2347680b7caed42fb1c6f6240057f736e933ebb1
            </span>
          </div>
        </div>

        <div
          style={{
            marginTop: "2rem",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
          }}
        >
          <Button
            variant="primary"
            onClick={() => window.print()}
            style={{ width: "100%" }}
          >
            Print Receipt
          </Button>
<<<<<<< HEAD
          {receipt.receipt_url && (
            <Button 
              variant="secondary" 
              onClick={() => window.open(receipt.receipt_url, '_blank')} 
              style={{ width: '100%' }}
=======
          {receiptUrl !== "#" && (
            <Button
              variant="secondary"
              onClick={() => window.open(receiptUrl, "_blank")}
              style={{ width: "100%" }}
>>>>>>> 2347680b7caed42fb1c6f6240057f736e933ebb1
            >
              Download Digital Copy
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
