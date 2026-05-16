/**
 * Records List — patient health records with filters.
 * Owner: Fadi
 *
 * ERD refs:
 *   MedicalRecord → Record_Id, Patient_Id, Created_by (Staff_Id),
 *                    Record_type, Title, Description
 *   Document → Document_Id, Record_Id (FK), file_name, file_type, file_size
 *
 * TODO:
 * - Fetch records from recordsApi.getRecords(patientId, { record_type, from_date })
 * - Filter bar: Record_type dropdown (DIAGNOSIS, LAB_RESULT, PRESCRIPTION, IMAGING), date picker
 * - DataTable columns: Title, Record_type (StatusBadge), Created_by (staff name), created_at
 * - On row click, navigate to /patients/:id/records/:recordId
 * - "Upload Record" button → /records/upload (not implemented yet)
 * - Handle consent 403 errors gracefully
 */
import { useParams } from 'react-router-dom';
import { DataTable, Button,StatusBadge } from '../../../components/ui';
import recordsApi from '../../../api/services/recordsService';
import './RecordPages.css';
import { useNavigate } from 'react-router-dom';

import { useState,useEffect } from 'react';
export default function RecordsList() {
  const { id: patientId } = useParams();
  const navigate = useNavigate();

  // dummy data for testing
const DUMMY_PATIENT_ID = "1";

const DUMMY_RECORDS_FOR_PATIENT_1 = [
  {
    record_id: 101,
    title: "Blood Test Report - April 2026",
    record_type: "LAB_RESULT",
    created_by: "Dr. Sara Ahmed",
    created_at: "2026-05-01T10:30:00Z",
  },
  {
    record_id: 102,
    title: "Chest X-Ray - Follow up",
    record_type: "IMAGING",
    created_by: "Dr. Omar Hassan",
    created_at: "2026-05-03T14:10:00Z",
  },
];

  
const [records,setRecords] = useState(null);

const [recordType,setRecordType] = useState('all');
const [fromDate,setFromDate] = useState('1-1-1970');

const [emptyMessage,setEmptyMessage] = useState('No records found.');


const retrieveRecords = async (filters={}) => {
  try{
  const response = await recordsApi.getRecords(patientId, filters);
  setRecords(response.data);
  } catch (error) {
    switch(error.response.status){
      case 403:
        setEmptyMessage('Access denied. You do not have permission to view this resource.');
        break;
      case 404:
        setEmptyMessage('The requested resource was not found.');
        break;
      default:
        setEmptyMessage('An unexpected error occurred.');
    }
    }
}


function getUserIdFromStorage() {
  try {
    const raw = sessionStorage.getItem('user');
    if (!raw) return null;

    // const user = JSON.parse(raw);
    // return user?.id ?? user?.User_Id ?? null; // supports either naming

    return 1; // dummy for now
  } catch {
    return null;
  }
}




//intial records set before filtration
useEffect(() => {
  if(Number(patientId) === 1){
    setRecords(DUMMY_RECORDS_FOR_PATIENT_1);
    return;
  } else if (patientId === "me"){
    const currentID = getUserIdFromStorage();
    if(!currentID){
      return;
    } else {
      if(currentID === 1){
        setRecords(DUMMY_RECORDS_FOR_PATIENT_1);
    return;
      }
    }
  }
  //retrieveRecords();
}, []);

 const handleFilter = (filters) => {
  retrieveRecords(filters);
 }
 const handleRowClick = (record) => {
  navigate(`/patients/${patientId}/records/${record.record_id}`);
 }

 //prepare columns

 const columns = [
  { key: 'title', label: 'Title' },
  { key: 'record_type', label: 'Record Type',
    render:(value) => (<StatusBadge status={value}/>)
   },
  { key: 'created_by', label: 'Created By' },
  { key: 'created_at', label: 'Created At',
    render: (value) => (value ? new Date(value).toLocaleString() : 'N/A'),
  },
]



  return (
    <>
    <div className="records-filter-bar">
    <div className="records-filter-field">
      <label className="records-filter-label" htmlFor="record-type">Record Type</label>
      

      {/* TODO: Add filter bar (Record_type select, from_date picker) */}
      <select
      id="record-type"
      className="records-filter-select"
      value={recordType}
      onChange={(e) => setRecordType(e.target.value)}
      >
      <option value="all">All</option>
      <option value="diagnosis">Diagnosis</option>
      <option value="lab_result">Lab Result</option>
      <option value="prescription">Prescription</option>
      <option value="imaging">Imaging</option>
    </select>
</div>
    
  <div className="records-filter-field">
    <label className="records-filter-label" htmlFor="from-date">From Date</label>
    <input
      type="date"
      id="from-date"
      className="records-filter-input"
      value={fromDate}
      onChange={(e) => setFromDate(e.target.value)}
    />
  </div>
  <div className="records-filter-actions">
    <Button onClick={() => handleFilter({recordType, fromDate})}>Filter</Button>
  </div>
  </div>
{/* TODO: Add DataTable with MedicalRecord data */}

    
    <div>
    <DataTable columns={columns} data={records} emptyMessage={emptyMessage} onRowClick={handleRowClick} />
      </div>
      </>
  );
}
