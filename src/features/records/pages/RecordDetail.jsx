/**
 * Record Detail — renders record content by type.
 * Owner: Fadi
 *
 * ERD refs:
 *   MedicalRecord → Record_type, Title, Description, Created_by (Staff_Id)
 *   Document (child) → Document_Id, Record_Id (FK), file_name, file_path,
 *                       file_type, file_size, Uploaded_by (User_Id)
 *
 * TODO:
 * - Fetch MedicalRecord from recordsApi.getRecordById(patientId, recordId)
 * - Fetch child Documents from recordsApi.getDocumentsByRecord(recordId)
 * - Render differently based on Record_type: DIAGNOSIS, LAB_RESULT, PRESCRIPTION, IMAGING
 * - Show Document list: file_name, file_type, file_size, download button
 * - Download via recordsApi.downloadDocument(documentId) (blob response)
 * - Handle 403 → show "Access Denied / Consent Required" message
 * - Back button to records list
 */
import { useParams } from 'react-router-dom';
import { Card, Button, StatusBadge } from '../../../components/ui';
import './RecordPages.css';

export default function RecordDetail() {
  const { id: patientId, recordId } = useParams();

  return (
    <div className="records-page">
      {/* TODO: Back link */}
      {/* TODO: MedicalRecord header (Title, Created_by, created_at, Record_type badge) */}
      {/* TODO: Description content (type-specific rendering) */}
      {/* TODO: Document attachments list with download buttons */}
      {/* TODO: Consent-denied fallback UI for 403 */}
    </div>
  );
}
