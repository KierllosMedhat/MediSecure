import React, { useState, useEffect } from "react";
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
  const { id: patientId } = useParams();

  const [consents, setConsents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isModalOpen, setModalOpen] = useState(false);
  const [newAccess, setNewAccess] = useState({ staff_id: "", purpose: "" });
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchConsents = async () => {
    if (!patientId) return;
    setIsLoading(true);
    try {
      const response = await consentApi.getConsents(patientId);
      setConsents(response.data);
    } catch (error) {
      console.error("Error fetching consents:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchConsents();
  }, [patientId]);

  const handleGrantAccess = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      await consentApi.grantConsent(patientId, {
        staff_id: parseInt(newAccess.staff_id), // Converting to number as expected by JSDoc @param
        purpose: newAccess.purpose,
      });
      setModalOpen(false);
      setNewAccess({ staff_id: "", purpose: "" });
      await fetchConsents();
    } catch (error) {
      console.error("Error granting consent:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRevokeAccess = async (consentId) => {
    if (
      window.confirm(
        "Are you sure you want to revoke access? This action is logged for PDPL compliance.",
      )
    ) {
      try {
        await consentApi.revokeConsent(patientId, consentId);
        await fetchConsents();
      } catch (error) {
        console.error("Error revoking consent:", error);
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
          justify: "flex-end",
          marginBottom: "1.5rem",
        }}
      >
        <Button onClick={() => setModalOpen(true)} variant="primary">
          + Grant Access
        </Button>
      </div>

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
                <th style={{ padding: "12px" }}>Date Revoked</th>
                <th style={{ padding: "12px", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {consents.length > 0 ? (
                consents.map((consent) => (
                  <tr
                    key={consent.Consent_Id}
                    style={{ borderBottom: "1px solid #eee" }}
                  >
                    <td
                      style={{
                        padding: "12px",
                        fontWeight: "bold",
                        color: "#333",
                      }}
                    >
                      {consent.Staff_Name || `Staff ID: ${consent.Staff_Id}`}
                    </td>
                    <td style={{ padding: "12px", color: "#666" }}>
                      {consent.Purpose}
                    </td>
                    <td style={{ padding: "12px", color: "#666" }}>
                      {consent.granted_at}
                    </td>
                    <td style={{ padding: "12px" }}>
                      <StatusBadge
                        status={consent.Is_Active ? "ACTIVE" : "REVOKED"}
                      />
                    </td>
                    <td style={{ padding: "12px", color: "#999" }}>
                      {consent.revoked_at || "-"}
                    </td>
                    <td style={{ padding: "12px", textAlign: "right" }}>
                      {consent.Is_Active ? (
                        <Button
                          size="small"
                          variant="danger"
                          onClick={() => handleRevokeAccess(consent.Consent_Id)}
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
                  <td
                    colSpan="6"
                    style={{
                      textAlign: "center",
                      padding: "2rem",
                      color: "#999",
                    }}
                  >
                    No access records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

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
              label="Staff ID (e.g. D-7890)"
              type="text"
              required
              value={newAccess.staff_id}
              onChange={(e) =>
                setNewAccess({ ...newAccess, staff_id: e.target.value })
              }
            />
            <Input
              label="Purpose of Access"
              type="text"
              placeholder="e.g. Consultation"
              required
              value={newAccess.purpose}
              onChange={(e) =>
                setNewAccess({ ...newAccess, purpose: e.target.value })
              }
            />
            <Button
              type="submit"
              disabled={isProcessing}
              style={{ marginTop: "10px" }}
            >
              {isProcessing ? "Granting..." : "Grant Access"}
            </Button>
          </form>
        </Modal>
      )}
    </div>
  );
}
