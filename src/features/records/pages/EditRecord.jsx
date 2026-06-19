import './RecordPages.css';
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import recordsApi from '../../../api/services/recordsService';

export default function EditRecord() {
  const { id: patientIdParam, recordId } = useParams();
  const navigate = useNavigate();

  const resolvedPatientId = patientIdParam || 'me';
  const [patientId] = useState(resolvedPatientId);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const RECORD_TYPES = [
    { value: '', label: 'Select type…' },
    { value: 'lab_result', label: 'Lab results' },
    { value: 'imaging', label: 'Imaging' },
    { value: 'prescription', label: 'Prescription' },
    { value: 'consultation', label: 'Consultation' },
    { value: 'diagnosis', label: 'Diagnosis' },
    { value: 'discharge_summary', label: 'Discharge Summary' },
    { value: 'other', label: 'Other' },
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

  const formik = useFormik({
    initialValues: {
      title: "",
      description: "",
      record_type: "",
    },
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const payload = {
          record_type: values.record_type.toUpperCase(),
          title: values.title,
          description: values.description,
        };
        await recordsApi.updateRecord(recordId, payload);
        alert("Record updated successfully.");
        navigate(`/patients/${patientId}/records/${recordId}`);
      } catch (err) {
        console.error(err);
        const msg = err.response ? JSON.stringify(err.response.data) : err.message;
        alert("Failed to update the record: " + msg);
      } finally {
        setSubmitting(false);
      }
    },
    validationSchema: recordValidationSchema,
  });

  useEffect(() => {
    const fetchRecord = async () => {
      try {
        const { data } = await recordsApi.getRecordById(patientId, recordId);
        formik.setValues({
          title: data.title || "",
          description: data.description || "",
          record_type: (data.record_type || "").toLowerCase(),
        });
      } catch (err) {
        console.error(err);
        setError("Failed to load record details.");
      } finally {
        setLoading(false);
      }
    };
    fetchRecord();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patientId, recordId]);

  if (loading) {
    return (
      <div className="records-page">
        <p>Loading record details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="records-page">
        <p className="error-card__message">{error}</p>
        <button onClick={() => navigate(`/patients/${patientId}/records/${recordId}`)}>Go Back</button>
      </div>
    );
  }

  return (
    <div className="records-page animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Edit Record</h1>
        <p className="page-subtitle">Update the details of this medical record.</p>
      </div>

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
        
        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <button
            type="button"
            className="btn btn--secondary"
            onClick={() => navigate(`/patients/${patientId}/records/${recordId}`)}
            disabled={formik.isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="record-form__submit"
            disabled={formik.isSubmitting || !formik.dirty}
          >
            {formik.isSubmitting ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
