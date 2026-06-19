import './RecordPages.css';
import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useFormik } from 'formik';
import DragAndDropFileUpload from '../components/DragAndDropFileUpload';
import DocumentSection from '../components/DocumentSection';
import * as Yup from 'yup';
import recordsApi from '../../../api/services/recordsService';
import patientApi from '../../../api/services/patientService';
import { useAuth } from '../../auth/hooks/useAuth';

export default function UploadRecord() {
  const { id: urlPatientId } = useParams();
  const location = useLocation();
  const { user } = useAuth();
  const [patientId, setPatientId] = useState(urlPatientId || 'me');
  const navigate = useNavigate();

  const [returnedRecordId, setReturnedRecordId] = useState(null);
  const [documents, setDocuments] = useState([]); 
  const docError = null;
  const [nextDocID, setNextDocID] = useState(9104);
  const [rawfiles, SetRawFiles] = useState([]);
  const [file, setFile] = useState(null);

  useEffect(() => {
    if (!user) return;
    if (user.role === "PATIENT") {
      const id = location.state?.patientId || "me";
      setPatientId(id);
    } else if (urlPatientId && !isNaN(Number(urlPatientId))) {
      setPatientId(Number(urlPatientId));
    }
  }, [user, urlPatientId, location.state?.patientId]);

  const RECORD_TYPES = [
    { value: '', label: 'Select type…' },
    { value: 'LAB_RESULT', label: 'Lab Results' },
    { value: 'DIAGNOSIS', label: 'Diagnosis' },
    { value: 'DISCHARGE_SUMMARY', label: 'Discharge Summary' },
    { value: 'IMAGING', label: 'Imaging' },
    { value: 'PRESCRIPTION', label: 'Prescription' },
    { value: 'VISIT_SUMMARY', label: 'Visit Summary' },
    { value: 'CONSULTATION', label: 'Consultation' },
    { value: 'OTHER', label: 'Other' },
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

  const formSubmit = async (values) => {
    try {
      const payload = {
        record_type: values.record_type,
        title: values.title,
        description: values.description,
      };
      
      if (patientId !== 'me') {
        payload.patient = patientId;
      }
      
      const { data } = await recordsApi.createRecord(payload);
      const newRecordId = data.id || data.record_id || data.recordId || data.Payment_Id;
      
      if (newRecordId) {
        setReturnedRecordId(newRecordId);
        try {
          for (const rawfile of rawfiles){
            await recordsApi.uploadDocument(newRecordId, rawfile);
          }
          alert(`Upload success: ${rawfiles.length} files have been uploaded to record ${newRecordId}`);
          setTimeout(() => navigate(`/patients/${patientId}/records`), 1200);
        } catch (error) {
          console.error(error);
          alert("Document upload failed.");
        } finally {
          formik.setFieldValue('files', []);
        }
      } else {
        alert("could not create record");
      }
    } catch (error) {
      console.error(error);
      const msg = error.response ? JSON.stringify(error.response.data) : error.message;
      alert("Failed to create the record: " + msg);
    }
  };

  const formik = useFormik({
    initialValues: {
      title: "",
      description: "",
      record_type: "",
      files: [],
    },
    validationSchema: recordValidationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      if(!values.files.length){
        setSubmitting(false);
        alert("Add files to create record");
        return;
      }
      try {
        await formSubmit(values);
      } catch (error) {
        console.error("Submission failed", error);
      } finally {
        setSubmitting(false);
      }
    },
  });

  const handleFile = (addedFile) => {
    if (!addedFile) return;
    const isPresent = formik.values.files.some(f => f.name === addedFile.name && f.size === addedFile.size);
    if (!isPresent) {
      setFile(addedFile);
    }
  }

  const handleUpload = async () => {
    if (!file) {
      alert("File was not uploaded try agian");
      return;
    }
   
    const formData = new FormData();
    formData.append("file_path", file);

    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");

    const newDocument = {
      record_id: returnedRecordId,
      file_name: file.name,
      file_path: `documents/${year}/${month}/${day}/${file.name}`,
      file_type: file.type,
      file_size: file.size,
      uploaded_By: patientId,
      created_at: `${new Date().toLocaleString()}`
    }

    setDocuments([...documents, newDocument]);
    setNextDocID(nextDocID + 1);
    SetRawFiles([...rawfiles, formData]);

    formik.setFieldValue('files', [...formik.values.files, file]);
    formik.setFieldTouched('files', true);
    
    setFile(null);
  }

  return (
    <div className="records-page">
      <div className="page-header">
        <h1 className="page-title">Upload Record</h1>
        <p className="page-subtitle">Add a new document to your health record.</p>
      </div>

      <form className="record-form" onSubmit={formik.handleSubmit} noValidate>
        <div className="record-form__field">
          <label className="record-form__label" htmlFor="title">Title</label>
          <input
            id="title"
            name="title"
            type="text"
            className={`record-form__input${formik.touched.title && formik.errors.title ? ' record-form__input--error' : ''}`}
            value={formik.values.title}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            aria-invalid={Boolean(formik.touched.title && formik.errors.title)}
            aria-describedby={formik.touched.title && formik.errors.title ? 'title-error' : undefined}
          />
          {formik.touched.title && formik.errors.title ? (
            <p id="title-error" className="record-form__error" role="alert">{formik.errors.title}</p>
          ) : null}
        </div>

        <div className="record-form__field">
          <label className="record-form__label" htmlFor="record_type">Record type</label>
          <select
            id="record_type"
            name="record_type"
            className={`record-form__select${formik.touched.record_type && formik.errors.record_type ? ' record-form__input--error' : ''}`}
            value={formik.values.record_type}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            aria-invalid={Boolean(formik.touched.record_type && formik.errors.record_type)}
            aria-describedby={formik.touched.record_type && formik.errors.record_type ? 'record_type-error' : undefined}
          >
            {RECORD_TYPES.map((opt) => (
              <option key={opt.value || 'placeholder'} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          {formik.touched.record_type && formik.errors.record_type ? (
            <p id="record_type-error" className="record-form__error" role="alert">{formik.errors.record_type}</p>
          ) : null}
        </div>

        <div className="record-form__field">
          <label className="record-form__label" htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            className={`record-form__textarea${formik.touched.description && formik.errors.description ? ' record-form__input--error' : ''}`}
            style={{ minHeight: 250 }}
            value={formik.values.description}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            aria-invalid={Boolean(formik.touched.description && formik.errors.description)}
            aria-describedby={formik.touched.description && formik.errors.description ? 'description-error' : undefined}
          />
          {formik.touched.description && formik.errors.description ? (
            <p id="description-error" className="record-form__error" role="alert">{formik.errors.description}</p>
          ) : null}
        </div>
        
        <DocumentSection documents={documents} docError={docError} downloadable={false} />

        <DragAndDropFileUpload patientId={patientId} recordId={returnedRecordId} file={file} handleFile={handleFile} onUpload={handleUpload}/>
        
        {formik.touched.files && formik.errors.files ? (
          <p className="record-form__error" role="alert">{formik.errors.files}</p>
        ) : null}
        
        <button
          type="submit"
          className="record-form__submit"
          style={{ width: '100%', alignSelf: 'stretch', marginTop: '1rem' }}
          disabled={formik.isSubmitting}
        >
          {formik.isSubmitting ? 'Submitting…' : 'Submit'}
        </button>
      </form>
    </div>
  );
}
