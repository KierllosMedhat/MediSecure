import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import consentApi from "../../../api/services/consentService";
import {
  Card,
  Button,
  StatusBadge,
  Modal,
  Input,
} from "../../../components/ui";
import "./ConsentPages.css";

export default function ConsentManagement() {
  const { id: patientIdParam } = useParams();
  const patientId = patientIdParam || 'me';

  const [consents, setConsents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setModalOpen] = useState(false);
  const [newAccess, setNewAccess] = useState({ staff: "", purpose: "" });
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchConsents = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await consentApi.getConsents(patientId);
      setConsents(response.data);
    } catch (error) {
      console.error("Error fetching consents:", error);
    } finally {
      setIsLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    fetchConsents();
  }, [fetchConsents]);

  const handleGrantAccess = async (e) => {
    e.preventDefault();
    setIsProcessing(true);

    const payload = {
      staff: parseInt(newAccess.staff, 10),
      purpose: newAccess.purpose,
    };

    try {
      await consentApi.grantConsent(patientId, payload);
      setModalOpen(false);
      setNewAccess({ staff: "", purpose: "" });
      await fetchConsents();
    } catch (error) {
      console.error("API Error:", error.response?.data);
      alert(
        "Error: " +
          JSON.stringify(error.response?.data || "Failed to grant access")
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApproveAccess = async (consentId) => {
    try {
      await consentApi.approveConsent(patientId, consentId);
      await fetchConsents();
    } catch (error) {
      console.error(error);
      alert("Failed to approve access.");
    }
  };

  const handleDenyAccess = async (consentId) => {
    if (window.confirm("Are you sure you want to deny this request?")) {
      try {
        await consentApi.denyConsent(patientId, consentId);
        await fetchConsents();
      } catch (error) {
        console.error(error);
        alert("Failed to deny access.");
      }
    }
  };

  const handleRevokeAccess = async (consentId) => {
    if (
      window.confirm(
        "Are you sure you want to revoke access? This action is logged for PDPL compliance."
      )
    ) {
      try {
        await consentApi.revokeConsent(patientId, consentId);
        await fetchConsents();
      } catch (error) {
        console.error("Error revoking consent:", error);
        alert("Failed to revoke consent.");
      }
    }
  };

  if (isLoading) {
    return (
      <div className="consent-page" style={{ padding: "2rem" }}>
        <p>Loading security settings...</p>
      </div>
    );
  }

  const pendingRequests = consents.filter((c) => c.status === "PENDING");
  const activeConsents = consents.filter((c) => c.status === "GRANTED" || c.status === "REVOKED");

  return (
    <div
      className="consent-page"
      style={{ padding: "2rem", maxWidth: "1000px", margin: "0 auto" }}
    >
      <div className="page-header" style={{ marginBottom: "2rem" }}>
        <h1
          className="page-title"
          style={{ fontSize: "2rem", color: "#333", margin: "0 0 5px 0" }}
        >
          Consent Management
        </h1>
        <p className="page-subtitle" style={{ color: "#666", margin: 0 }}>
          Manage who has access to your health records (PDPL Compliance).
        </p>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginBottom: "1.5rem",
        }}
      >
        <Button onClick={() => setModalOpen(true)} variant="primary">
          + Grant Access
        </Button>
      </div>

      {pendingRequests.length > 0 && (
        <div style={{ marginBottom: "2rem" }}>
          <h2 style={{ marginBottom: "1rem" }}>Pending Requests</h2>
          <Card style={{ padding: "1.5rem" }}>
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
                    <th style={{ padding: "12px" }}>Staff Name</th>
                    <th style={{ padding: "12px" }}>Purpose</th>
                    <th style={{ padding: "12px", textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingRequests.map((consent) => (
                    <tr
                      key={consent.id}
                      style={{ borderBottom: "1px solid #eee" }}
                    >
                      <td style={{ padding: "12px", fontWeight: "bold" }}>
                        {consent.staff_name || `Staff ID: ${consent.staff || "N/A"}`}
                      </td>
                      <td style={{ padding: "12px" }}>{consent.purpose}</td>
                      <td style={{ padding: "12px", textAlign: "right", display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
                        <Button size="sm" variant="primary" onClick={() => handleApproveAccess(consent.id)}>
                          Approve
                        </Button>
                        <Button size="sm" variant="danger" onClick={() => handleDenyAccess(consent.id)}>
                          Deny
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      <div>
        <h2 style={{ marginBottom: "1rem" }}>Active & Past Consents</h2>
        <Card style={{ padding: "1.5rem" }}>
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
                  <th style={{ padding: "12px" }}>Staff Name</th>
                  <th style={{ padding: "12px" }}>Purpose</th>
                  <th style={{ padding: "12px" }}>Date Granted</th>
                  <th style={{ padding: "12px" }}>Status</th>
                  <th style={{ padding: "12px", textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {activeConsents.length > 0 ? (
                  activeConsents.map((consent) => (
                    <tr
                      key={consent.id}
                      style={{ borderBottom: "1px solid #eee" }}
                    >
                      <td style={{ padding: "12px", fontWeight: "bold" }}>
                        {consent.staff_name || `Staff ID: ${consent.staff || "N/A"}`}
                      </td>
                      <td style={{ padding: "12px" }}>{consent.purpose || "N/A"}</td>
                      <td style={{ padding: "12px" }}>
                        {consent.granted_at ? consent.granted_at.split("T")[0] : "-"}
                      </td>
                      <td style={{ padding: "12px" }}>
                        <StatusBadge status={consent.status} />
                      </td>
                      <td style={{ padding: "12px", textAlign: "right" }}>
                        {consent.status === "GRANTED" ? (
                          <Button
                            size="small"
                            variant="danger"
                            onClick={() => handleRevokeAccess(consent.id)}
                          >
                            Revoke
                          </Button>
                        ) : (
                          <span
                            style={{
                              fontSize: "0.85rem",
                              color: "#999",
                              fontStyle: "italic",
                            }}
                          >
                            Locked
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" style={{ textAlign: "center", padding: "2rem" }}>
                      No access records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setModalOpen(false)}
          title="Grant Record Access"
        >
          <form
            onSubmit={handleGrantAccess}
            style={{ display: "flex", flexDirection: "column", gap: "15px" }}
          >
            <Input
              label="Staff ID"
              type="number"
              required
              value={newAccess.staff}
              onChange={(e) =>
                setNewAccess({ ...newAccess, staff: e.target.value })
              }
            />

            <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
              <label style={{ fontSize: "0.9rem", fontWeight: "bold" }}>
                Purpose of Access
              </label>
              <select
                required
                value={newAccess.purpose}
                onChange={(e) =>
                  setNewAccess({ ...newAccess, purpose: e.target.value })
                }
                style={{
                  padding: "10px",
                  borderRadius: "6px",
                  border: "1px solid #ccc",
                }}
              >
                <option value="" disabled>Select Purpose...</option>
                <option value="TREATMENT">TREATMENT</option>
                <option value="RESEARCH">RESEARCH</option>
                <option value="INSURANCE">INSURANCE</option>
                <option value="BILLING">BILLING</option>
                <option value="EMERGENCY">EMERGENCY</option>
                <option value="REFERRAL">REFERRAL</option>
                <option value="OTHER">OTHER</option>
              </select>
            </div>

            <Button type="submit" disabled={isProcessing}>
              {isProcessing ? "Granting..." : "Grant Access"}
            </Button>
          </form>
        </Modal>
      )}
    </div>
  );
}
