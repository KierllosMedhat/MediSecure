import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  Button,
  StatusBadge,
  Modal,
  Input,
} from "../../../components/ui";
import "./PaymentPages.css";
import paymentApi from "../../../api/services/paymentService";

export default function PaymentsPage() {
  const navigate = useNavigate();

  // --- States ---
  const [balance, setBalance] = useState({ amount: 0, currency: "EGP" });
  const [pendingBills, setPendingBills] = useState([]);
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal States
  const [isFawryModalOpen, setFawryModalOpen] = useState(false);
  const [isCardModalOpen, setCardModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Form Payloads
  const [fawryPayload, setFawryPayload] = useState({
    fawry_code: "",
    amount: "",
    currency: "EGP",
    payment_type: "CONSULTATION",
  });
  const [cardPayload, setCardPayload] = useState({
    card_token: "",
    cvv: "",
    amount: "",
    currency: "EGP",
    payment_type: "CONSULTATION",
  });

  // --- Fetch Data ---
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [balanceRes, historyRes] = await Promise.all([
          paymentApi.getOutstandingBalance(),
          paymentApi.getPaymentHistory(),
        ]);

        setBalance({
          amount: balanceRes.data.balance || 0,
          currency: balanceRes.data.currency || "EGP",
        });

        // Ensure history is an array
        const historyData = Array.isArray(historyRes.data)
          ? historyRes.data
          : historyRes.data.results || [];
        setHistory(historyData);

        const pending = historyData.filter(
          (item) =>
            item.Status === "PENDING" ||
            item.Status === "PROCESSING" ||
            item.status === "PENDING" ||
            item.status === "PROCESSING",
        );
        setPendingBills(pending);
      } catch (error) {
        console.error("Error fetching payment data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  // --- Handlers ---
  const handleFawrySubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      // Use balance amount if payload amount is not set
      const payload = {
        ...fawryPayload,
        amount: fawryPayload.amount || balance.amount,
      };
      const response = await paymentApi.payWithFawry(payload);
      alert(`Fawry Code Generated: ${response.data.fawry_reference_number}`);
      setFawryModalOpen(false);
    } catch (error) {
      console.error("Fawry payment failed:", error);
      alert("Failed to generate Fawry code. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCardSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      // Use balance amount if payload amount is not set
      const payload = {
        ...cardPayload,
        amount: cardPayload.amount || balance.amount,
      };
      const response = await paymentApi.payWithCard(payload);
      if (response.data.payment_url) {
        window.location.href = response.data.payment_url;
      } else {
        navigate(
          `/payments/receipt/${response.data.payment_id || response.data.Payment_Id}`,
        );
      }
    } catch (error) {
      console.error("Card payment failed:", error);
      alert("Card payment failed. Please check your details and try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading)
    return (
      <div className="payments-page payments-container">
        <p>Loading payment details...</p>
      </div>
    );

  return (
    <div className="payments-page payments-container">
      <div className="page-header" style={{ marginBottom: "2rem" }}>
        <h1
          className="page-title"
          style={{ fontSize: "2rem", color: "#333", margin: 0 }}
        >
          Payments
        </h1>
        <p
          className="page-subtitle"
          style={{ color: "#666", marginTop: "5px" }}
        >
          Manage your billing and payments securely.
        </p>
      </div>

      <div
        className="payments-grid"
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}
      >
        {/* First Column: Balance and Pending Bills */}
        <div>
          {/* Balance card */}
          <Card className="balance-card">
            <h3 className="balance-label">Outstanding Balance</h3>
            <h2 className="balance-amount">
              {Number(balance.amount).toFixed(2)} {balance.currency}
            </h2>

            <div style={{ display: "flex", gap: "10px", marginTop: "1.5rem" }}>
              <Button
                onClick={() => setCardModalOpen(true)}
                variant="primary"
                style={{ flex: 1 }}
                disabled={balance.amount <= 0}
              >
                Pay with Card
              </Button>
              <Button
                onClick={() => setFawryModalOpen(true)}
                variant="secondary"
                style={{ flex: 1 }}
                disabled={balance.amount <= 0}
              >
                Pay with Fawry
              </Button>
            </div>
          </Card>

          {/* Pending bills widget */}
          <section className="bills-section">
            <h3 className="section-title">Pending Bills</h3>
            <div className="bills-list">
              {pendingBills.length > 0 ? (
                pendingBills.map((bill) => (
                  <div
                    key={bill.Payment_Id || bill.id || Math.random()}
                    className={`bill-item ${bill.Status === "OVERDUE" || bill.status === "OVERDUE" ? "overdue" : ""}`}
                  >
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "4px",
                      }}
                    >
                      <strong style={{ color: "#333" }}>
                        {bill.Payment_Type || bill.payment_type || "Service"}
                      </strong>
                      <span style={{ fontSize: "0.85rem", color: "#666" }}>
                        ID: {bill.Payment_Id || bill.payment_id}
                      </span>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <strong
                        style={{
                          display: "block",
                          color:
                            bill.Status === "OVERDUE" ||
                            bill.status === "OVERDUE"
                              ? "#dc3545"
                              : "#333",
                        }}
                      >
                        {Number(bill.Amount || bill.amount).toFixed(2)}{" "}
                        {bill.Currency || bill.currency || "EGP"}
                      </strong>
                      {(bill.Status === "OVERDUE" ||
                        bill.status === "OVERDUE") && (
                        <span className="overdue-badge">OVERDUE</span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p style={{ color: "#999", padding: "1rem 0" }}>
                  No pending bills at the moment.
                </p>
              )}
            </div>
          </section>
        </div>

        {/* Second Column: Payment History */}
        <div
          style={{
            backgroundColor: "#fff",
            padding: "1.5rem",
            borderRadius: "8px",
            border: "1px solid #dee2e6",
            minHeight: "350px",
          }}
        >
          <h3 className="section-title">Payment History</h3>

          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                textAlign: "left",
                borderCollapse: "collapse",
              }}
            >
              <thead>
                <tr style={{ borderBottom: "2px solid #eee", color: "#666" }}>
                  <th style={{ padding: "12px" }}>Amount</th>
                  <th style={{ padding: "12px" }}>Gateway</th>
                  <th style={{ padding: "12px" }}>Status</th>
                  <th style={{ padding: "12px", textAlign: "right" }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {history.length > 0 ? (
                  history.map((record) => {
                    const status = record.Status || record.status;
                    const id =
                      record.Payment_Id || record.payment_id || record.id;
                    return (
                      <tr key={id} style={{ borderBottom: "1px solid #eee" }}>
                        <td
                          style={{
                            padding: "12px",
                            fontWeight: "500",
                            color: "#333",
                          }}
                        >
                          {Number(record.Amount || record.amount).toFixed(2)}{" "}
                          {record.Currency || record.currency || "EGP"}
                        </td>
                        <td style={{ padding: "12px" }}>
                          <StatusBadge
                            status={
                              record.Gateway_Type ||
                              record.gateway_type ||
                              "UNKNOWN"
                            }
                          />
                        </td>
                        <td style={{ padding: "12px" }}>
                          <StatusBadge status={status} />
                        </td>
                        <td style={{ padding: "12px", textAlign: "right" }}>
                          {status === "COMPLETED" || status === "PAID" ? (
                            <Button
                              size="small"
                              onClick={() =>
                                navigate(`/payments/receipt/${id}`)
                              }
                            >
                              Receipt
                            </Button>
                          ) : (
                            <span
                              style={{ color: "#999", fontSize: "0.85rem" }}
                            >
                              Pending
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan="4"
                      style={{
                        textAlign: "center",
                        padding: "2rem",
                        color: "#999",
                      }}
                    >
                      No payment history found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* --- Fawry Modal --- */}
      {isFawryModalOpen && (
        <Modal
          isOpen={isFawryModalOpen}
          onClose={() => setFawryModalOpen(false)}
          title="Pay with Fawry"
        >
          <form onSubmit={handleFawrySubmit} className="payment-form">
            <Input
              label="Amount"
              type="number"
              value={fawryPayload.amount || balance.amount}
              onChange={(e) =>
                setFawryPayload({ ...fawryPayload, amount: e.target.value })
              }
              required
            />
            <Input
              label="Payment Type"
              type="text"
              value={fawryPayload.payment_type}
              disabled
            />
            <Button
              type="submit"
              disabled={isProcessing}
              style={{ width: "100%", marginTop: "10px" }}
            >
              {isProcessing ? "Generating Code..." : "Generate Fawry Code"}
            </Button>
          </form>
        </Modal>
      )}

      {/* --- Card Modal --- */}
      {isCardModalOpen && (
        <Modal
          isOpen={isCardModalOpen}
          onClose={() => setCardModalOpen(false)}
          title="Secure Card Payment"
        >
          <form onSubmit={handleCardSubmit} className="payment-form">
            <Input
              label="Amount to Pay"
              type="number"
              value={cardPayload.amount || balance.amount}
              disabled
            />
            <Input
              label="Card Token / Number"
              type="text"
              placeholder="**** **** **** ****"
              value={cardPayload.card_token}
              onChange={(e) =>
                setCardPayload({ ...cardPayload, card_token: e.target.value })
              }
              required
            />
            <div style={{ display: "flex", gap: "10px" }}>
              <div style={{ flex: 1 }}>
                <Input label="Expiry Date" placeholder="MM/YY" required />
              </div>
              <div style={{ flex: 1 }}>
                <Input
                  label="CVV"
                  type="password"
                  placeholder="***"
                  value={cardPayload.cvv}
                  onChange={(e) =>
                    setCardPayload({ ...cardPayload, cvv: e.target.value })
                  }
                  required
                />
              </div>
            </div>
            <Button
              type="submit"
              disabled={isProcessing}
              style={{ width: "100%", marginTop: "10px" }}
            >
              {isProcessing
                ? "Processing Payment..."
                : `Pay ${balance.amount} ${balance.currency}`}
            </Button>
          </form>
        </Modal>
      )}
    </div>
  );
}
