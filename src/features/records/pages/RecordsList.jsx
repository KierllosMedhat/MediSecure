import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { DataTable, Button, StatusBadge } from '../../../components/ui';
import recordsApi from '../../../api/services/recordsService';
import consentApi from '../../../api/services/consentService';
import patientApi from '../../../api/services/patientService';
import { useAuth } from '../../auth/hooks/useAuth';
import { IoSearchOutline } from 'react-icons/io5';
import './RecordPages.css';

export default function RecordsList() {
  const { id: urlPatientId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [patientId, setPatientId] = useState(urlPatientId || 'me');
  
  function getUserFromStorage() {
    try {
      const raw = sessionStorage.getItem('user');
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  const currentUser = user || getUserFromStorage();
  const isStaff = currentUser?.role === 'DOCTOR' || currentUser?.role === 'NURSE' || currentUser?.role === 'BILLING_STAFF';

  const [records, setRecords] = useState([]);
  const [recordType, setRecordType] = useState('all');
  const [fromDate, setFromDate] = useState('2026-01-01');
  const [emptyMessage, setEmptyMessage] = useState('Loading...');
  
  const [globalSearch, setGlobalSearch] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'desc' });
  
  // Consent workflow states
  const [consentStatus, setConsentStatus] = useState('GRANTED'); 
  const [requestPurpose, setRequestPurpose] = useState('TREATMENT');
  const [isRequesting, setIsRequesting] = useState(false);

  const retrieveRecords = async (idToFetch, filters = {}) => {
    try {
      const response = await recordsApi.getRecords(idToFetch, filters);
      setRecords(response.data.results || response.data || []);
      setConsentStatus('GRANTED');
      if ((response.data.results || response.data || []).length === 0) {
        setEmptyMessage('No records found.');
      }
    } catch (error) {
      if (error.response?.status === 403) {
        if (isStaff && idToFetch && idToFetch !== 'me') {
          checkConsentState(idToFetch);
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

  const checkConsentState = async (idToCheck) => {
    try {
      const res = await consentApi.checkConsent(idToCheck, currentUser?.staff_id || currentUser?.id, requestPurpose);
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
        patient: patientId,
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

  useEffect(() => {
    const initialize = async () => {
      let currentId = urlPatientId || 'me';
      const userRole = currentUser?.role;

      if (userRole === "PATIENT") {
        try {
          const userProfile = await patientApi.getProfile();
          currentId = userProfile.data.id;
          setPatientId(currentId);
        } catch (error) {
          console.error("Could not fetch patient profile:", error);
        }
      } else if (urlPatientId) {
        currentId = urlPatientId;
        setPatientId(currentId);
      }
      
      retrieveRecords(currentId, { record_type: recordType !== 'all' ? recordType : undefined, from_date: fromDate });
    };

    if (currentUser) {
      initialize();
    }
  }, [urlPatientId, currentUser]);

  const handleFilter = () => {
    const filters = {};
    if (recordType !== 'all') filters.record_type = recordType;
    if (fromDate) filters.from_date = fromDate;
    retrieveRecords(patientId, filters);
  };

  const handleRowClick = (record) => {
    navigate(`/patients/${urlPatientId || 'me'}/records/${record.id || record.record_id}`, {
      state: { patientId: patientId, recordId: record.id || record.record_id }
    });
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedRecords = [...records].sort((a, b) => {
    if (!sortConfig.key) return 0;
    const aVal = a[sortConfig.key] || '';
    const bVal = b[sortConfig.key] || '';
    if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const columns = [
    { key: 'title', label: 'Title', sortable: true },
    { key: 'record_type', label: 'Record Type', sortable: true, render: (value) => <StatusBadge status={value} /> },
    { key: 'created_by_name', label: 'Created By', sortable: true },
    { key: 'created_at', label: 'Created At', sortable: true, render: (value) => (value ? new Date(value).toLocaleString() : 'N/A') },
  ];

  if (consentStatus === 'PENDING') {
    return (
      <div className="records-filter-bar" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '3rem', gap: '1rem' }}>
        <h2>Access Pending</h2>
        <p>Your request to access these records is waiting for patient approval.</p>
        <Button variant="secondary" onClick={() => retrieveRecords(patientId)}>Check Status Again</Button>
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
            <option value="DIAGNOSIS">Diagnosis</option>
            <option value="LAB_RESULT">Lab Result</option>
            <option value="PRESCRIPTION">Prescription</option>
            <option value="IMAGING">Imaging</option>
            <option value="DISCHARGE_SUMMARY">Discharge Summary</option>
            <option value="VISIT_SUMMARY">Visit Summary</option>
            <option value="OTHER">Other</option>
          </select>
        </div>
        
        <div className="records-filter-field">
          <label className="records-filter-label" htmlFor="from-date">From Date</label>
          <input type="date" id="from-date" className="records-filter-input" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
        </div>
        <div className="records-filter-actions" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: 'auto' }}>
          <div style={{ position: 'relative', width: '250px' }}>
            <IoSearchOutline 
              style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#888', fontSize: '1.1rem' }}
            />
            <input
              type="text"
              placeholder="Search records..."
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              style={{
                padding: '8px 12px 8px 36px', borderRadius: '8px', border: '1px solid #e2e8f0', width: '100%',
                fontSize: '0.95rem', backgroundColor: '#fff', transition: 'all 0.2s ease', outline: 'none',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
              }}
              onFocus={(e) => { e.target.style.borderColor = 'var(--color-primary, #3b82f6)'; e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.15)'; }}
              onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = '0 1px 2px rgba(0,0,0,0.05)'; }}
            />
          </div>
          <Button onClick={handleFilter}>Filter</Button>
          <Button variant="primary" onClick={() => navigate(`/patients/${urlPatientId || 'me'}/records/upload`)}>Add Record</Button>
        </div>
      </div>
    
      <div>
        <DataTable 
          columns={columns} 
          data={sortedRecords} 
          emptyMessage={emptyMessage} 
          onRowClick={handleRowClick}
          sortConfig={sortConfig}
          onSort={handleSort}
          searchable={true}
          searchTerm={globalSearch}
          onSearchChange={setGlobalSearch}
          hideSearchBar={true}
          pagination={true}
          itemsPerPage={5}
        />
      </div>
    </>
  );
}
