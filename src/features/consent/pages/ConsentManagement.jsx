import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import consentApi from "../../../api/services/consentService";
import {useAuth} from '../../auth/hooks/useAuth';
import patientApi from '../../../api/services/patientService';
import {
  Card,
  Button,
  StatusBadge,
  Modal,
  Input,
} from "../../../components/ui";
import "./ConsentPages.css";

export default function ConsentManagement() {

  //const { id: patientId } = useParams();
  const {user} = useAuth();
  const [patientId,setPatientId] = useState(null);

  const [consents, setConsents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setModalOpen] = useState(false);
  const [newAccess, setNewAccess] = useState({ staff: "", purpose: "" });
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchConsents = async (id) => {
    if (!id) return;
    setIsLoading(true);
    try {
      const response = await consentApi.getConsents(id);
      setConsents(response.data);
    } catch (error) {
      console.error("Error fetching consents:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const initialize = async () => {
      try {
          const userProfile = await patientApi.getProfile();
          console.log("userProfile:", userProfile);
          const id = userProfile.data.id;
          console.log("id:", id);
          setPatientId(id);
          await fetchConsents(id);  // pass id directly, don't rely on state
      } catch (error) {
          console.error("Could not fetch patient:", error);
          setPatientId(1);
          
      }
  };

  initialize();
    
  }, []);

  const handleGrantAccess = async (e) => {
    e.preventDefault();
    setIsProcessing(true);

    const payload = {
      staff: parseInt(newAccess.staff_id, 10),
      purpose: newAccess.purpose,
    };

    try {
      await consentApi.grantConsent(patientId, {
        staff: parseInt(newAccess.staff), // Converting to number as expected by JSDoc @param
        purpose: newAccess.purpose,
      });
      console.log("granting consent with payload:", payload);  // ← check this
        
      setModalOpen(false);
      setNewAccess({ staff: "", purpose: "" });
      console.log
      await fetchConsents(patientId);
    } catch (error) {
      console.log("error response data:", error.response?.data);
      //console.error("Error granting consent:", error);
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
        await fetchConsents(patientId);
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
              {consents.length > 0 ? (
                consents.map((consent) => (
                  <tr
                    key={consent.id || consent.Consent_Id}
                    style={{ borderBottom: "1px solid #eee" }}
                  >
                    <td style={{ padding: "12px", fontWeight: "bold" }}>
                      {consent.Staff_Name ||
                        `Staff ID: ${consent.Staff_Id || "N/A"}`}
                    </td>
                    <td style={{ padding: "12px" }}>
                      {consent.Purpose || consent.purpose || "N/A"}
                    </td>
                    <td style={{ padding: "12px" }}>
                      {consent.granted_at
                        ? consent.granted_at.split("T")[0]
                        : "-"}
                    </td>
                    <td style={{ padding: "12px" }}>
                      <StatusBadge
                        status={
                          consent.Is_Active || consent.is_active
                            ? "ACTIVE"
                            : "REVOKED"
                        }
                      />
                    </td>
                    <td style={{ padding: "12px", textAlign: "right" }}>
                      {consent.Is_Active || consent.is_active ? (
                        <Button
                          size="small"
                          variant="danger"
                          onClick={() =>
                            handleRevokeAccess(consent.id || consent.Consent_Id)
                          }
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
                    colSpan="5"
                    style={{ textAlign: "center", padding: "2rem" }}
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
              label="Staff ID"
              type="text"
              required
              value={newAccess.staff}
              onChange={(e) =>
                setNewAccess({ ...newAccess, staff: e.target.value })
              }
            />
           <select
           label="Purpose of Access"
    value={newAccess.purpose}
    onChange={(e) => setNewAccess({ ...newAccess, purpose: e.target.value })}
    required
>
    <option value="">Select purpose</option>
    <option value="TREATMENT">Treatment</option>
    <option value="RESEARCH">Research</option>
    <option value="INSURANCE">Insurance</option>
    <option value="BILLING">Billing</option>
    <option value="EMERGENCY">Emergency</option>
    <option value="REFERRAL">Referral</option>
    <option value="OTHER">Other</option>
</select>
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
