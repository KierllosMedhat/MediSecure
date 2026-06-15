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
import { useParams, useNavigate,useLocation } from 'react-router-dom';
import { Card, Button, StatusBadge, DataTable } from '../../../components/ui';
import './RecordPages.css';
import recordsApi from '../../../api/services/recordsService';
import { useState, useEffect, useRef } from 'react';
import DragAndDropFileUpload from '../components/DragAndDropFileUpload';
import DocumentSection from '../components/DocumentSection';
import {useAuth} from '../../auth/hooks/useAuth';
import patientApi from '../../../api/services/patientService';
export default function RecordDetail() {
  
  const location = useLocation();
var {patientId,recordId} = location.state;
const {user} = useAuth();
  const navigate = useNavigate();

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

  const [record, setRecord] = useState(null);
  const [recError, setRecError] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [docError, setDocError] = useState(null);
  const [emptyMessage, setEmptyMessage] = useState("Something went wrong");
  const [isLoading,setIsLoading] = useState(true);

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
      formData.append("file_path", file);

      // date adjustment
      const now = new Date();
const year = now.getFullYear();
const month = String(now.getMonth() + 1).padStart(2, "0");
const day = String(now.getDate()).padStart(2, "0");

      const newDocument = {
        // document_id: nextDocID,
        record_id: recordId,
        file_name: file.name,
        file_path: `documents/${year}/${month}/${day}/${file.name}`,
        file_type: file.type,
        file_size: file.size,
        uploaded_By: patientId,
        created_at: `${new Date().toLocaleString()}`

      }

      //add to documents
      setDocuments([...documents, newDocument]);
      setNextDocID(nextDocID + 1);
      await recordsApi.uploadDocument(recordId,formData);

      await new Promise((resolve) => setTimeout(resolve, 800)); // demo delay
      alert(`Upload success: ${file.name}`);
    } catch (error) {
      console.error(error);
      alert("Upload failed.");
    } finally {
      
      setFile(null);
    }

  }

  const fetchRecord = async (id) => {
    const response = await recordsApi.getRecordById(patientId, id);
    console.log(response.data);
    setRecord(response.data);
    if(response.data){
      setRecError(null);
    }
  }
  useEffect(() => {

    // if (Number(recordId) === 101) {
    //   setRecord(DUMMY_RECORD_101);
    //   return;
    // } else if (Number(recordId) === 102) {
    //   setRecord(DUMMY_RECORD_102);
    //   return;
    // }


    const initialize = async () => {
      try {
          const userProfile = await patientApi.getProfile();
          console.log("userProfile:", userProfile);
          const id = userProfile.data.id;
          console.log("id:", id);
          //setPatientId(id);
          patientId=id;
          await fetchRecord(recordId);  // pass id directly, don't rely on state
      } catch (error) {
          console.error("Could not fetch patient:", error);
          //setPatientId(1);
          //setRecords(DUMMY_RECORDS_FOR_PATIENT_1);
      }
  };
if((patientId == undefined)||(patientId == null)){
  initialize();
}
    const run = async () => {
      try {
        await fetchRecord(recordId);
      } catch (error) {
        setRecError(error);
      }
    }
    run();
  }, []);

  const fetchDocuments = async (recordID) => {
    const documents = await recordsApi.getDocumentsByRecord(recordID);
    console.log("fetching documents");
    
    setDocuments(documents.data.results);
    console.log(documents.data.results);
    if(documents.data.results){
      console.log(`number of documents ${documents.data.results.length}`);
      setDocError(null);
    }
  }

  useEffect(() => {

    // if (Number(recordId) === 101) {
    //   setDocuments(DUMMY_DOCUMENTS_FOR_RECORD_101);
    //   return;
    // } else if (Number(recordId) === 102) {
    //   setDocuments(DUMMY_DOCUMENTS_FOR_RECORD_102);
    //   return;
    // }

    const run = async () => {
      try {
        await fetchDocuments(recordId);
      } catch (error) {
        console.log(`Error of documents ${error}`);
        setDocError(error);
      }
    }
    if(record && recordId) run();
  }, [recordId,record])



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
      {/* TODO: Back link */}
      <Button onClick={() => navigate('/patients/me/records')}>Back</Button>

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


