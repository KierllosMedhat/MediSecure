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
import recordsApi from '../../../api/services/recordsService';

export default function RecordDetail() {
  const { id: patientId, recordId } = useParams();
  const [record,setRecord] = useState(null);
  const [error,setError] = useState(null);

  const fetchRecord = async () => {
    const response = await recordsApi.getRecordById(patientId, recordId);
    setRecord(response.data);
  }
useEffect(() => {
 
  try{
  fetchRecord();
  }catch (error) {
    setError(error);
    }
}, []);

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


  
  if((record === null)&& (errorMessage === '')){
  return (
    <div className="records-page">
      {/* TODO: Back link */}
      <Button onClick={() => navigate(`/patients/${patientId}/records`)}>Back</Button>

      {/* TODO: MedicalRecord header (Title, Created_by, created_at, Record_type badge) */}
      <Card className="record-header">
      <span className="col title">Title</span>
  <span className="col type">
    <StatusBadge>Record Type</StatusBadge>
  </span>
  <span className="col created-by">Created By</span>
  <span className="col created-at">
  Created At
  </span>
      </Card>
      
      {/* TODO: Description content (type-specific rendering) */}
      <Card className="record-header-row">
  <span className="col title">{record?.Title || 'Untitled Record'}</span>
  <span className="col type">
    <StatusBadge>{record?.Record_type || 'UNKNOWN'}</StatusBadge>
  </span>
  <span className="col created-by">{record?.Created_by || 'N/A'}</span>
  <span className="col created-at">
    {record?.created_at ? new Date(record.created_at).toLocaleString() : 'N/A'}
  </span>
</Card>
      {/* TODO: Document attachments list with download buttons */}
      
    </div>
  );
} else if(error){
  return <ErrorFallback error={error} onRetry={fetchRecord} />;
  
}}

function ErrorFallback(error) {
  const code = error?.code;
  let title = 'Something went wrong';
  let description = 'Please try again in a moment.';
  if (code === 403) {
    title = 'Access denied';
    description = 'You do not have permission to view this content.';
  } else if (code === 404) {
    title = 'Not found';
    description = 'The requested item does not exist.';
  } else if (code >= 500) {
    title = 'Server error';
    description = 'Our server had an issue. Try again shortly.';
  }
  return (
    <section role="alert" style={{ border: '1px solid #ddd', padding: 16, borderRadius: 8 }}>
      <h2>{title}</h2>
      <p>{description}</p>
      <div style={{ display: 'flex', gap: 8 }}>
      <button onClick={onRetry}>Retry</button>
        <button onClick={() => window.history.back()}>Go Back</button>
      </div>
      <small style={{ color: '#666' }}>
        Error code: {code || 'UNKNOWN'}
      </small>
    </section>
  );
}
