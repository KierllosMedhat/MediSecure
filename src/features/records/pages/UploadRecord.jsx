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
import { useParams, useNavigate } from 'react-router-dom';
import { useFormik,Formik, Form, Field, ErrorMessage } from 'formik';
import DragAndDropFileUpload from '../components/DragAndDropFileUpload';
import DocumentSection from '../components/DocumentSection';
import * as Yup from 'yup';
import { mergeConfig } from 'axios';
export default function UploadRecord() {
  //const { id: patientId} = useParams();
  const patientId = 1;
  const navigate = useNavigate();
const [returnedRecordId,setReturnedRecordId] = useState(null);
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
    files: Yup.array()
      .min(1, 'At least one file is required')
      .max(5, 'You can upload up to 5 files')
      .test('fileSize', 'Each file must be under 5MB', files =>
        !files || files.every(f => f.size <= 5 * 1024 * 1024)
      ),
  });

  


  const formik = useFormik({
    initialValues: {
      title: "",
      description: "",
      record_type: "",
      files:[],
    },
    onSubmit: (values, { setSubmitting }) => {

if(!values.files.length){
  setSubmitting(false);
  alert("Add files to create record");
}


      dummySubmit(values);
      setSubmitting(false);
    },
    validationSchema:recordValidationSchema,
  });

  const dummySubmit = (values)=>{
    alert(`new record created successfully`);
    navigate(`/patients/${patientId}/records`);
    return;
  }

  const formSubmit = async (values) => {
    const { data } = await recordsApi.createRecord({
      patient_id: patientId, 
      record_type: values.record_type,
      title: values.title,
      description: values.description,
    });
    setReturnedRecordId(data.recordId);

    if(returnedRecordId){
     try{
for (const rawfile of rawfiles){
  //await recordsApi.uploadDocument(returnedRecordId,rawfile);
}
await new Promise((resolve) => setTimeout(resolve, 800)); // demo delay
alert(`Upload success: ${files.length} files have been uploaded to record ${returnedRecordId }`);

     }catch (error) {
      console.error(error);
      alert("Upload failed.");
      
    } finally {
      
      formik.setFieldValue('files', []);
      
    }


    }else {
      alert("could not create record");
      return;
    }
    return data; 
  };

// uploading document handling

const [documents,setDocuments] = useState([]); 
const [docError,setDocError] = useState(null);
const [nextDocID,setNextDocID] = useState(9104);
const [rawfiles,SetRawFiles] = useState([]);

 // drag and drop states
 const [file, setFile] = useState(null);
 

 // uploading documents 
 
const handleFile = (addedFile) => {

  if (!addedFile) return;

// const fileCollection = formik.values.files;

const isPresent = rawfiles.some(f=>f.name== addedFile.name && f.size==addedFile.size)

if(!isPresent){
 setFile(addedFile);
}
}



const handleUpload = async () => {

  
  if (!file) {
    alert("File was not uploaded try agian");
    return;
  }
 
    const formData = new FormData();
    formData.append("file", file);

    SetRawFiles([...rawfiles,formData]);

    const newDocument = {
      document_id: nextDocID,
      record_id: 102,
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

    // add to formik
    formik.setFieldValue('files',[...formik.values.files,file]);
    formik.setFieldTouched('files',true);
    

    setFile(null);
  }
    

  return (
    <div className="records-page">
      <div className="page-header">
        <h1 className="page-title">Upload Record</h1>
        <p className="page-subtitle">Add a new document to your health record.</p>
      </div>

      {/* TODO: Implement MedicalRecord creation + Document upload form */}
      <form className="record-form" onSubmit={formik.handleSubmit} noValidate>
  <div className="record-form__field">
    <label className="record-form__label" htmlFor="title">
      Title
    </label>
    <input
      id="title"
      name="title"
      type="text"
      className={`record-form__input${
        formik.touched.title && formik.errors.title ? ' record-form__input--error' : ''
      }`}
      value={formik.values.title}
      onChange={formik.handleChange}
      onBlur={formik.handleBlur}
      aria-invalid={Boolean(formik.touched.title && formik.errors.title)}
      aria-describedby={formik.touched.title && formik.errors.title ? 'title-error' : undefined}
    />
    {formik.touched.title && formik.errors.title ? (
      <p id="title-error" className="record-form__error" role="alert">
        {formik.errors.title}
      </p>
    ) : null}
  </div>

  <div className="record-form__field">
    <label className="record-form__label" htmlFor="record_type">
      Record type
    </label>
    <select
      id="record_type"
      name="record_type"
      className={`record-form__select${
        formik.touched.record_type && formik.errors.record_type
          ? ' record-form__input--error'
          : ''
      }`}
      value={formik.values.record_type}
      onChange={formik.handleChange}
      onBlur={formik.handleBlur}
      aria-invalid={Boolean(formik.touched.record_type && formik.errors.record_type)}
      aria-describedby={
        formik.touched.record_type && formik.errors.record_type
          ? 'record_type-error'
          : undefined
      }
    >
      {RECORD_TYPES.map((opt) => (
        <option key={opt.value || 'placeholder'} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
    {formik.touched.record_type && formik.errors.record_type ? (
      <p id="record_type-error" className="record-form__error" role="alert">
        {formik.errors.record_type}
      </p>
    ) : null}
  </div>

  <div className="record-form__field">
    <label className="record-form__label" htmlFor="description">
      Description
    </label>
    <textarea
      id="description"
      name="description"
      className={`record-form__textarea${
        formik.touched.description && formik.errors.description
          ? ' record-form__input--error'
          : ''
      }`}
      style={{ minHeight: 250 }}
      value={formik.values.description}
      onChange={formik.handleChange}
      onBlur={formik.handleBlur}
      aria-invalid={Boolean(formik.touched.description && formik.errors.description)}
      aria-describedby={
        formik.touched.description && formik.errors.description
          ? 'description-error'
          : undefined
      }
    />
    {formik.touched.description && formik.errors.description ? (
      <p id="description-error" className="record-form__error" role="alert">
        {formik.errors.description}
      </p>
    ) : null}
  </div>
  <DocumentSection documents={documents} docError={docError} downloadable={false} />

  <DragAndDropFileUpload patientId={patientId} recordId = {returnedRecordId} file={file} handleFile={handleFile} onUpload={handleUpload}/>
  {formik.touched.files && formik.errors.files ? (
  <p className="record-form__error" role="alert">
    {formik.errors.files}
  </p>
) : null}
  
  <button
    type="submit"
    className="record-form__submit"
    style={{ width: '100%', alignSelf: 'stretch' }}
    disabled={formik.isSubmitting}
  >
    {formik.isSubmitting ? 'Submitting…' : 'Submit'}
  </button>
</form>

    
    </div>
  );
}
