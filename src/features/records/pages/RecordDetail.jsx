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
import { useParams, useNavigate } from 'react-router-dom';
import { Button, StatusBadge, DataTable } from '../../../components/ui';
import './RecordPages.css';
import recordsApi from '../../../api/services/recordsService';
import { useState, useEffect, useCallback } from 'react';
import DragAndDropFileUpload from '../components/DragAndDropFileUpload';
import DocumentSection from '../components/DocumentSection';

// dummy data for testing
const DUMMY_RECORD_101 = {
  record_id: 101,
  patient_id: 1,
  title: "Blood Test Report - April 2026",
  record_type: "LAB_RESULT",
  created_by: "Dr. Sara Ahmed",
  created_at: "2026-05-01T10:30:00Z",
  description: "CBC + differential. All values within expected range.",
};

const DUMMY_RECORD_102 = {
  record_id: 102,
  patient_id: 1,
  title: "Chest X-Ray - Follow Up",
  record_type: "IMAGING",
  created_by: "Dr. Omar Hassan",
  created_at: "2026-05-03T14:10:00Z",
  description:
    "Chest X-ray follow-up after persistent cough. Mild perihilar markings, no focal consolidation, no pleural effusion. Clinical correlation advised.",
};

const DUMMY_DOCUMENTS_FOR_RECORD_101 = [
  {
    document_id: 9001,
    record_id: 101,
    file_name: "cbc_april_2026.pdf",
    file_path: "/uploads/records/101/cbc_april_2026.pdf",
    file_type: "application/pdf",
    file_size: 234567,
    uploaded_by: 1,
    created_at: "2026-05-01T10:35:00Z",
  },
  {
    document_id: 9002,
    record_id: 101,
    file_name: "lab_summary_notes.txt",
    file_path: "/uploads/records/101/lab_summary_notes.txt",
    file_type: "text/plain",
    file_size: 4821,
    uploaded_by: 1,
    created_at: "2026-05-01T10:40:00Z",
  },
];

const DUMMY_DOCUMENTS_FOR_RECORD_102 = [
  {
    document_id: 9101,
    record_id: 102,
    file_name: "chest_xray_ap_2026_05_03.png",
    file_path: "/uploads/records/102/chest_xray_ap_2026_05_03.png",
    file_type: "image/png",
    file_size: 1845220,
    uploaded_by: 1,
    created_at: "2026-05-03T14:20:00Z",
  },
  {
    document_id: 9102,
    record_id: 102,
    file_name: "radiology_report_2026_05_03.pdf",
    file_path: "/uploads/records/102/radiology_report_2026_05_03.pdf",
    file_type: "application/pdf",
    file_size: 348912,
    uploaded_by: 1,
    created_at: "2026-05-03T14:28:00Z",
  },
  {
    document_id: 9103,
    record_id: 102,
    file_name: "followup_instructions.txt",
    file_path: "/uploads/records/102/followup_instructions.txt",
    file_type: "text/plain",
    file_size: 5294,
    uploaded_by: 1,
    created_at: "2026-05-03T14:31:00Z",
  },
];

export default function RecordDetail() {
  const { id: patientId, recordId } = useParams();
  const navigate = useNavigate();



  const [record, setRecord] = useState(null);
  const [recError, setRecError] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [docError, setDocError] = useState(null);
  const emptyMessage = "Something went wrong";

  // drag and drop states
  const [file, setFile] = useState(null);

  //dummy data for trial
  const [nextDocID, setNextDocID] = useState(9104);

  const handleFile = (addedFile) => {
    if (!addedFile) return;
    setFile(addedFile);
  }

  const handleUpload = async () => {
    if (!file) {
      alert("File was not uploaded try agian");
      return;
    }

    try {


      const formData = new FormData();
      formData.append("file", file);

      const newDocument = {
        document_id: nextDocID,
        record_id: recordId,
        file_name: file.name,
        file_path: `/uploads/records/${recordId}/${file.name}.${file.type}`,
        file_type: file.type,
        file_size: file.size,
        uploaded_By: patientId,
        created_at: `${new Date().toLocaleString()}`

      }

      //add to documents
      setDocuments([...documents, newDocument]);
      setNextDocID(nextDocID + 1);
      //await recordsApi.uploadDocument(recordId,formData);

      await new Promise((resolve) => setTimeout(resolve, 800)); // demo delay
      alert(`Upload success: ${file.name}`);
    } catch (error) {
      console.error(error);
      alert("Upload failed.");
    } finally {
      
      setFile(null);
    }

  }

  const fetchRecord = useCallback(async () => {
    try {
      const response = await recordsApi.getRecordById(patientId, recordId);
      setRecord(response.data);
    } catch (error) {
      setRecError(error);
    }
  }, [patientId, recordId]);

  useEffect(() => {
    if (Number(recordId) === 101) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setRecord(DUMMY_RECORD_101);
      return;
    } else if (Number(recordId) === 102) {
      setRecord(DUMMY_RECORD_102);
      return;
    }
    fetchRecord();
  }, [recordId, fetchRecord]);

  const fetchDocuments = useCallback(async () => {
    try {
      const response = await recordsApi.getDocumentsByRecord(recordId);
      setDocuments(response.data.results || response.data);
    } catch (error) {
      setDocError(error);
    }
  }, [recordId]);

  useEffect(() => {
    if (Number(recordId) === 101) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDocuments(DUMMY_DOCUMENTS_FOR_RECORD_101);
      return;
    } else if (Number(recordId) === 102) {
      setDocuments(DUMMY_DOCUMENTS_FOR_RECORD_102);
      return;
    }

    if (record) {
      fetchDocuments();
    }
  }, [record, recordId, fetchDocuments]);



  const handleDownload = async (document_id, fallbackFileName = 'document') => {
    try {
      const response = await recordsApi.downloadDocument(document_id);

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

  // record header and data
  //prepare columns

  const columns = [
    { key: 'title', label: 'Title' },
    {
      key: 'record_type', label: 'Record Type',
      render: (value) => (<StatusBadge status={value} />)
    },
    {
      key: 'description', label: 'Description'
    },
    { key: 'created_by', label: 'Created By' },
    {
      key: 'created_at', label: 'Created At',
      render: (value) => (value ? new Date(value).toLocaleString() : 'N/A'),
    },
  ]



  if (recError) {
    return <ErrorFallback errorCode={recError.response.status} onRetry={fetchRecord} patientId={patientId} />;

  } else if (!record) {
    return <p>Loading...</p>
  }
  return (
    <div className="records-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <Button onClick={() => navigate(`/patients/${patientId || 'me'}/records`)}>Back</Button>
        <Button onClick={() => navigate(`/patients/${patientId || 'me'}/records/${recordId}/edit`)}>Edit Record</Button>
      </div>

      {/* TODO: MedicalRecord header (Title, Created_by, created_at, Record_type badge) */}
      {/* <Card className="record-header">
    <span className="col title">Title</span>
<span className="col type">
  Record Type
</span>
<span className="col created-by">Created By</span>
<span className="col created-at">
Created At
</span>
    </Card> */}
      



      {/* TODO: Description content (type-specific rendering) */}


      <DataTable columns={columns} data={[record]} emptyMessage={emptyMessage} />

      {/* TODO: Document attachments list with download buttons */}
      <DocumentSection documents={documents} docError={docError} downloadable={true} handleDownload={handleDownload} />

      <DragAndDropFileUpload patientId={patientId} recordId = {recordId} file={file} handleFile={handleFile} onUpload={handleUpload}/>

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


