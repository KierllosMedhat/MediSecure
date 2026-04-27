/**
 * Consent Management — PDPL compliance UI.
 * Owner: Abdullah
 *
 * ERD refs:
 *   Consent → Consent_Id, Patient_Id (FK), Staff_Id (FK),
 *             Purpose, Is_Active, granted_at, revoked_at, deleted_at
 *
 * TODO:
 * - Fetch consents from consentApi.getConsents(patientId)
 * - DataTable columns: Staff name (via Staff_Id), Purpose, granted_at,
 *   Is_Active status (StatusBadge: ACTIVE/REVOKED), revoked_at, actions
 * - "Grant Access" button → opens Modal:
 *     staff_id input, purpose input
 *     → consentApi.grantConsent(patientId, { staff_id, purpose })
 * - "Revoke" button per active consent:
 *     → consentApi.revokeConsent(patientId, consentId)
 *     Sets Is_Active=false, records revoked_at timestamp
 * - Toggle ON/OFF for Is_Active
 */
import { useParams } from 'react-router-dom';
import { Card, Button, DataTable, StatusBadge, Modal, Input } from '../../../components/ui';
import './ConsentPages.css';

export default function ConsentManagement() {
  const { id: patientId } = useParams();

  return (
    <div className="consent-page">
      <div className="page-header">
        <h1 className="page-title">Consent Management</h1>
        <p className="page-subtitle">Manage who has access to your health records (PDPL Compliance).</p>
      </div>

      {/* TODO: Consent DataTable with Is_Active toggle, grant/revoke actions */}
      {/* TODO: Grant Access modal (staff_id, purpose) */}
    </div>
  );
}
