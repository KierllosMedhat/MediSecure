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
import { useParams,useNavigate } from 'react-router-dom';
import { Card, Button, StatusBadge } from '../../../components/ui';
import './RecordPages.css';
import recordsApi from '../../../api/services/recordsService';
import { useState,useEffect } from 'react';

export default function RecordDetail() {
  const { id: patientId, recordId } = useParams();
  const [record,setRecord] = useState(null);
  const [recError,setRecError] = useState(null);
const [documents,setDocuments] = useState([]);
const [docError, setDocError] = useState(null);
const navigate = useNavigate();
  const fetchRecord = async () => {
    const response = await recordsApi.getRecordById(patientId, recordId);
    setRecord(response.data);
  }
useEffect( () => {
 
 const run = async()=> {
  try{
    await fetchRecord();
    }catch (error) {
      setRecError(error);
      }
 }
 run();
}, []);

const fetchDocuments = async()=>{
  const documents = await recordsApi.getDocumentsByRecord(recordId);
  setDocuments(documents.data)
}

useEffect(()=>{
  const run =async ()=>{ try{
    await fetchDocuments();
    }catch(error){
      setDocError(error);
    }
  }
  if(record) run();
},[record])



const handleDownload = async (documentId, fallbackFileName = 'document') => {
  try {
    const response = await recordsApi.downloadDocument(documentId);

    // response.data is the blob payload from axios (responseType: 'blob')
    const blob = response.data instanceof Blob
      ? response.data
      : new Blob([response.data]);

    // Try to read filename from Content-Disposition header first
    const contentDisposition =
      response.headers?.['content-disposition'] ||
      response.headers?.['Content-Disposition'];

    let fileName = fallbackFileName;

    if (contentDisposition) {
      // Supports: filename="x.pdf" and filename*=UTF-8''x.pdf
      const utf8Match = contentDisposition.match(/filename\*\s*=\s*UTF-8''([^;]+)/i);
      const asciiMatch = contentDisposition.match(/filename\s*=\s*"([^"]+)"|filename\s*=\s*([^;]+)/i);

      if (utf8Match?.[1]) {
        fileName = decodeURIComponent(utf8Match[1]);
      } else if (asciiMatch) {
        fileName = (asciiMatch[1] || asciiMatch[2] || fallbackFileName).trim();
      }
    }

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Failed to download document', error);
  }
};


  
  
  
if(recError){
  return <ErrorFallback errorCode={recError.response.status} onRetry={fetchRecord} patientId = {patientId} />;
  
}else if(!record){
  return <p>Loading...</p>
}
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
    <DocumentSection documents = {documents} docError = {docError} handleDownload = {handleDownload} />
  </div>
);
}

function ErrorFallback(props) {
  const navigate = useNavigate();
  const { errorCode } = props;
  let title = 'Something went wrong';
  let description = 'Please try again in a moment.';
  if (errorCode === 403) {
    title = 'Access denied';
    description = 'You do not have permission to view this content.';
  } else if (errorCode === 404) {
    title = 'Not found';
    description = 'The requested item does not exist.';
  } else if (errorCode >= 500) {
    title = 'Server error';
    description = 'Our server had an issue. Try again shortly.';
  }
  return (
    <div className="records-page--center">
      <section className="error-card" role="alert">
        <h2 className="error-card__title">{title}</h2>
        <p className="error-card__message">{description}</p>
        <div className="error-card__actions">
          <button onClick={props.onRetry}>Retry</button>
          <button onClick={() => navigate(`/patients/${props.patientId}/records`)}>Go Back</button>
        </div>
      </section>
    </div>
  );
}

function DocumentSection (props){
  const documents = props.documents;
  if(props.docError){
    return (
      <p> could not retreive documents</p>
    );
  }
  return (
<Card className="record-documents">
  <h3>Attachments</h3>

  {documents.length === 0 ? (
    <p>No documents available.</p>
  ) : (
    <ul className="documents-list">
      {documents.map((doc) => (
        <li key={doc.Document_Id} className="document-item">
          <div className="document-info">
            <div><strong>{doc.file_name || 'Unnamed file'}</strong></div>
            <div>Type: {doc.file_type || 'N/A'}</div>
            <div>Size: {doc.file_size ?? 'N/A'}</div>
          </div>

          <Button onClick={() => props.handleDownload(doc.Document_Id,doc.file_name)}>
            Download
          </Button>
        </li>
      ))}
    </ul>
  )}
</Card>

  );
}