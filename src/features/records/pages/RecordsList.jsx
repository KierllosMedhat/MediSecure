/**
 * Records List — patient health records with filters.
 * Owner: Fadi
 *
 * ERD refs:
 *   MedicalRecord → Record_Id, Patient_Id, Created_by (Staff_Id),
 *                    Record_type, Title, Description
 *   Document → Document_Id, Record_Id (FK), file_name, file_type, file_size
 */
import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { DataTable, Button, StatusBadge } from '../../../components/ui';
import recordsApi from '../../../api/services/recordsService';
import consentApi from '../../../api/services/consentService';
import './RecordPages.css';

export default function RecordsList() {
  const { id: patientIdParam } = useParams();
  const navigate = useNavigate();

  const currentUser = getUserFromStorage();
  const patientId = patientIdParam || currentUser?.id || 1;
  const isStaff = currentUser?.role === 'DOCTOR' || currentUser?.role === 'NURSE' || currentUser?.role === 'BILLING_STAFF';

  const [records, setRecords] = useState([]);
  const [recordType, setRecordType] = useState('all');
  const [fromDate, setFromDate] = useState('2026-01-01');
  const [emptyMessage, setEmptyMessage] = useState('Loading...');
  
  // Consent workflow states
  const [consentStatus, setConsentStatus] = useState('GRANTED'); 
  const [requestPurpose, setRequestPurpose] = useState('TREATMENT');
  const [isRequesting, setIsRequesting] = useState(false);

  const retrieveRecords = async (filters = {}) => {
    try {
      const response = await recordsApi.getRecords(patientId, filters);
      setRecords(response.data.results || response.data || []);
      setConsentStatus('GRANTED');
      if ((response.data.results || response.data || []).length === 0) {
        setEmptyMessage('No records found.');
      }
    } catch (error) {
      if (error.response?.status === 403) {
        if (isStaff && patientIdParam && patientIdParam !== 'me') {
          checkConsentState();
        } else {
          setEmptyMessage('Access denied. You do not have permission to view this resource.');
          setConsentStatus('DENIED');
        }
      } else if (error.response?.status === 404) {
        setEmptyMessage('The requested resource was not found.');
      } else {
        setEmptyMessage('An unexpected error occurred.');
      }
    }
  };

  const checkConsentState = async () => {
    try {
      // Default to TREATMENT to check if any request is pending.
      // The API returns the latest consent for this patient/staff.
      const res = await consentApi.checkConsent(patientIdParam, currentUser.staff_id || currentUser.id, requestPurpose);
      setConsentStatus(res.data.status || 'NONE');
    } catch (err) {
      console.error("Failed to check consent", err);
      setConsentStatus('NONE');
    }
  };

  const handleRequestAccess = async () => {
    setIsRequesting(true);
    try {
      await consentApi.requestConsent({
        patient: patientIdParam,
        purpose: requestPurpose,
        description: 'Requested access via Records dashboard.'
      });
      setConsentStatus('PENDING');
      alert("Access request sent to patient.");
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.detail || JSON.stringify(error.response?.data) || "Failed to request access.");
    } finally {
      setIsRequesting(false);
    }
  };

  function getUserFromStorage() {
    try {
      const raw = sessionStorage.getItem('user');
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  useEffect(() => {
    retrieveRecords();
  }, [patientIdParam]);

  const handleFilter = () => {
    retrieveRecords({ record_type: recordType !== 'all' ? recordType : undefined, from_date: fromDate });
  };

  const handleRowClick = (record) => {
    navigate(`/patients/${patientIdParam || 'me'}/records/${record.id || record.record_id}`, {
      state: { id: patientId, recordId: record.record_id || record.id }
    });
  };

  const columns = [
    { key: 'title', label: 'Title' },
    { key: 'record_type', label: 'Record Type', render: (value) => <StatusBadge status={value} /> },
    { key: 'created_by_name', label: 'Created By' },
    { key: 'created_at', label: 'Created At', render: (value) => (value ? new Date(value).toLocaleString() : 'N/A') },
  ];

  if (consentStatus === 'PENDING') {
    return (
      <div className="records-filter-bar" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '3rem', gap: '1rem' }}>
        <h2>Access Pending</h2>
        <p>Your request to access these records is waiting for patient approval.</p>
        <Button variant="secondary" onClick={() => retrieveRecords()}>Check Status Again</Button>
      </div>
    );
  }

  if (consentStatus === 'NONE' || consentStatus === 'DENIED' || consentStatus === 'REVOKED') {
    return (
      <div className="records-filter-bar" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '3rem', gap: '1rem' }}>
        <h2>Access Required</h2>
        <p>You must request consent from the patient to view their medical records.</p>
        
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <select value={requestPurpose} onChange={(e) => setRequestPurpose(e.target.value)} style={{ padding: '0.5rem', borderRadius: '4px' }}>
            <option value="TREATMENT">TREATMENT</option>
            <option value="RESEARCH">RESEARCH</option>
            <option value="INSURANCE">INSURANCE</option>
            <option value="BILLING">BILLING</option>
            <option value="EMERGENCY">EMERGENCY</option>
            <option value="REFERRAL">REFERRAL</option>
            <option value="OTHER">OTHER</option>
          </select>
          <Button variant="primary" onClick={handleRequestAccess} disabled={isRequesting}>
            {isRequesting ? 'Requesting...' : 'Request Access'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="records-filter-bar">
        <div className="records-filter-field">
          <label className="records-filter-label" htmlFor="record-type">Record Type</label>
          <select id="record-type" className="records-filter-select" value={recordType} onChange={(e) => setRecordType(e.target.value)}>
            <option value="all">All</option>
            <option value="diagnosis">Diagnosis</option>
            <option value="lab_result">Lab Result</option>
            <option value="prescription">Prescription</option>
            <option value="imaging">Imaging</option>
          </select>
        </div>
        
        <div className="records-filter-field">
          <label className="records-filter-label" htmlFor="from-date">From Date</label>
          <input type="date" id="from-date" className="records-filter-input" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
        </div>
        <div className="records-filter-actions">
          <Button onClick={handleFilter}>Filter</Button>
          <Button variant="primary" onClick={() => navigate(`/patients/${patientIdParam || 'me'}/records/upload`)}>Add Record</Button>
        </div>
      </div>
    
      <div>
        <DataTable columns={columns} data={records} emptyMessage={emptyMessage} onRowClick={handleRowClick} />
      </div>
    </>
  );
}
