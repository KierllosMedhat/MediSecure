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

  const handleDownload = async (documentId) => {
    try {
      const response = await recordsApi.downloadDocument(documentId);
      const blob = new Blob([response.data], { type: response.data.type });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = response.data.filename;
      a.click();
    } catch (error) {
      console.error('Failed to download document', error);
    }
  }

  return (
    <div className="records-page">
      {/* TODO: Back link */}
      <Button onClick={() => navigate(`/patients/${patientId}/records`)}>Back</Button>

      {/* TODO: MedicalRecord header (Title, Created_by, created_at, Record_type badge) */}
      <Card className="record-header">
  <div className="record-header__top">
    <h2 className="record-header__title">{record?.Title || 'Untitled Record'}</h2>
    <StatusBadge>{record?.Record_type || 'UNKNOWN'}</StatusBadge>
  </div>

  <div className="record-header__meta">
    <span><strong>Created by:</strong> {record?.Created_by || 'N/A'}</span>
    <span><strong>Created at:</strong> {record?.created_at ? new Date(record.created_at).toLocaleString() : 'N/A'}</span>
  </div>
</Card>
      {/* TODO: Description content (type-specific rendering) */}

      {/* TODO: Document attachments list with download buttons */}
      {/* TODO: Consent-denied fallback UI for 403 */}
    </div>
  );
}
