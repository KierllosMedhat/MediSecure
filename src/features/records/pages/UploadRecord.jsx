/**
 * Upload Record — create MedicalRecord + upload Document.
 * Owner: Fadi
 *
 * ERD refs:
 *   MedicalRecord → Record_type, Title, Description, Patient_Id
 *   Document → file (PDF, JPEG, PNG), file_name, file_type, file_size
 *
 * TODO:
 * - Step 1: Create MedicalRecord via recordsApi.createRecord({ patient_id, record_type, title, description })
 * - Step 2: Upload Document via recordsApi.uploadDocument(recordId, formData)
 * - Form fields: title, description, record_type (select), file upload
 * - Validate file type client-side: only PDF, JPEG, PNG (check file.type) -- to ask
 * - Show drag-and-drop or click-to-upload zone
 * - Handle upload errors
 * - Navigate back on success
 */
import { Card, Button, Input } from '../../../components/ui';
import './RecordPages.css';
import { useState,useRef } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
export default function UploadRecord() {
  const { id: patientId} = useParams();
  const navigate = useNavigate();

  const RECORD_TYPES = [
    { value: '', label: 'Select type…' },
    { value: 'lab', label: 'Lab results' },
    { value: 'imaging', label: 'Imaging' },
    { value: 'prescription', label: 'Prescription' },
    { value: 'visit', label: 'Visit summary' },
  ];


  const recordValidationSchema = Yup.object({
    title: Yup.string()
      .trim()
      .required('Title is required')
      .max(200, 'Title must be at most 200 characters'),
    description: Yup.string()
      .trim()
      .max(2000, 'Description must be at most 2000 characters'),
    record_type: Yup.string()
      .oneOf(
        RECORD_TYPES.filter((o) => o.value).map((o) => o.value),
        'Please select a record type'
      )
      .required('Record type is required'),
  });

  const dummySubmit = (values)=>{
    alert(`new record for patient ${patientId}`)
  }

  const formSubmit = async (values) => {
    const { data } = await recordsApi.createRecord({
      patient_id: patientId, 
      record_type: values.record_type,
      title: values.title,
      description: values.description,
    });
    return data; // or data.record_id, etc.
  };

  //onSubmit real code 
  /*onSubmit: async (values, helpers) => {
  const { setSubmitting, setStatus, setFieldError } = helpers;
  setStatus(undefined); // clear previous form-level error
  try {
    await formSubmit(values);
    // navigate or toast success
  } catch (error) {
    const status = error.response?.status;
    const body = error.response?.data;
    // Field errors if your API returns them (adjust to your real shape)
    if (status === 422 && body?.errors) {
      Object.entries(body.errors).forEach(([field, messages]) => {
        setFieldError(field, Array.isArray(messages) ? messages[0] : String(messages));
      });
      return;
    }
    setStatus(getApiErrorMessage(error)); // show above the form
  } finally {
    setSubmitting(false);
  }
}, */


  const formDefaults = useFormik({
    initialValues: {
      title: "",
      description: "",
      record_type: ""
    },
    onSubmit: (values) => {formSubmit(values)},
    validationSchema:recordValidationSchema,
  });



// uploading document handling

const [documents,setDocuments] = useState([]); 

 // drag and drop states
 const [file, setFile] = useState(null);
 const [isDragging, setIsDragging] = useState(null);
 const inputRef = useRef();
 const [isUploading, setIsUploading] = useState(null);

 // uploading documents 
 const handleonDragOver = (e) => {
  e.preventDefault();
  setIsDragging(false);
}

const handleonDragLeave = (e) => {
  e.preventDefault();
  setIsDragging(true);
}

const handleFile = (addedFile) => {
  if (!addedFile) return;
  setFile(addedFile);
}


const handleDragOver = (e) => {
  e.preventDefault();
  setIsDragging(true);
};
const handleDragLeave = () => {
  setIsDragging(false);
};

const handleDrop = (e) => {
  e.preventDefault();
  setIsDragging(false);
  const droppedFile = e.dataTransfer.files?.[0];
  handleFile(droppedFile);
};

const handleBrowseClick = () => {
  inputRef.current?.click();
};
const handleInputChange = (e) => {
  const selectedFile = e.target.files?.[0];
  handleFile(selectedFile);
};

const handleUpload = async () => {
  if (!file) {
    alert("File was not uploaded try agian");
    return;
  }

  try {


    const formData = new FormData();
    formData.append("file", file);

    const newDocument = {
      document_idd: nextDocID,
      record_id: recordId,
      file_name: file.name,
      file_path: `/uploads/records/102/${file.name}.${file.type}`,
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
    setIsUploading(false);
    setFile(null);
  }

}



  return (
    <div className="records-page">
      <div className="page-header">
        <h1 className="page-title">Upload Record</h1>
        <p className="page-subtitle">Add a new document to your health record.</p>
      </div>

      {/* TODO: Implement MedicalRecord creation + Document upload form */}


      <div className="upload-section">
        <div
          className={`drop-zone ${isDragging ? "drop-zone--active" : ""}`}
          onClick={handleBrowseClick}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            ref={inputRef}
            type="file"
            className="drop-zone__input"
            onChange={handleInputChange}
          />
          <p className="drop-zone__text">
            {file
              ? `Selected: ${file.name}`
              : "Drag & drop a file here, or click to browse"}
          </p>
          {file && (
            <p className="drop-zone__meta">
              {(file.size / 1024).toFixed(1)} KB
            </p>
          )}
        </div>
        <button
          type="button"
          className="upload-btn"
          onClick={handleUpload}
          disabled={!file || isUploading}
        >
          {isUploading ? "Uploading..." : "Upload"}
        </button>
      </div>
    

      
    
    </div>
  );
}
