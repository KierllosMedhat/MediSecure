/**
 * Records & Documents API endpoints
 * Owner: Fadi
 *
 * MedicalRecord model (from ERD):
 *   Record_Id (PK), Patient_Id (FK), Created_by/Staff_Id (FK),
 *   Record_type, Title, Description, created_at, updated_at, deleted_at
 *
 * Document model (from ERD — child of MedicalRecord):
 *   Document_Id (PK), Record_Id (FK), file_name, file_path,
 *   file_type, file_size, Uploaded_by/User_Id (FK), created_at, updated_at, deleted_at
 */
import apiClient from '../apiClient';

const recordsApi = {
  /* --- Medical Records --- */
  getRecords: (patientId, params = {}) =>
    apiClient.get(`/patients/${patientId}/records`, { params }),
  // params: { record_type, from_date }

  getRecordById: (patientId, recordId) =>
    apiClient.get(`/patients/${patientId}/records/${recordId}`),

  createRecord: (data) =>
    apiClient.post('/records/', data),
  // data: { patient_id, record_type, title, description }

  /* --- Documents (child of MedicalRecord) --- */
  getDocumentsByRecord: (recordId) =>
    apiClient.get(`/records/${recordId}/documents`),

  uploadDocument: (recordId, formData) =>
    apiClient.post(`/records/${recordId}/documents`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  // formData: file (PDF, JPEG, PNG), file_name

  downloadDocument: (documentId) =>
    apiClient.get(`/documents/${documentId}/download`, {
      responseType: 'blob',
    }),
};

export default recordsApi;
