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
import patientApi from '../../../api/services/patientService';
import './RecordPages.css';
import { useNavigate } from 'react-router-dom';
import {useAuth} from '../../auth/hooks/useAuth';
import { useState,useEffect } from 'react';
export default function RecordsList() {
  //const { id: patientId } = useParams();
  const {user} = useAuth();
  const navigate = useNavigate();
const [patientId,setPatientId] = useState(null);
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

const DUMMY_RECORDS_FOR_PATIENT_2 = [
  {
    record_id: 101,
    title: "CBC - MAY 2026",
    record_type: "LAB_RESULT",
    created_by: "Dr. Sara Ahmed",
    created_at: "2026-05-24T10:30:00Z",
  },
  {
    record_id: 102,
    title: "Leg X-Ray - Follow up",
    record_type: "IMAGING",
    created_by: "Dr. Omar Hassan",
    created_at: "2026-05-24T14:10:00Z",
  },
];

  
const [records,setRecords] = useState(null);

const [recordType,setRecordType] = useState('all');
const [fromDate,setFromDate] = useState('');

const [emptyMessage,setEmptyMessage] = useState('No records found.');


const retrieveRecords = async (id,filters={}) => {
  try{
  const response = await recordsApi.getRecords(id, filters);
  setRecords([...response.data.results]);
  console.log(records);
  } catch (error) {
    if (!error.response) {
      setEmptyMessage('Network error. Please check your connection.');
      return;
  }
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

    const user = JSON.parse(raw);

    if(user.id){
      return user.id;
    }
    return null; // supports either naming

    //return 1; // dummy for now
  } catch {
    return null;
  }
}


//setting initial id


useEffect(() => {
  const initialize = async () => {
      try {
          const userProfile = await patientApi.getProfile();
          console.log("userProfile:", userProfile);
          const id = userProfile.data.id;
          console.log("id:", id);
          setPatientId(id);
          await retrieveRecords(id);  // pass id directly, don't rely on state
      } catch (error) {
          console.error("Could not fetch patient:", error);
          setPatientId(1);
          setRecords(DUMMY_RECORDS_FOR_PATIENT_1);
      }
  };

  initialize();
}, []);


// useEffect(()=>{

//   try{
//   id = fetchId()
// setPatientId(id);
//   } catch(erorr){
//     console.log("could not fetch patientId")
//     setPatientId(1);
//   }




// //  const currentUserID = getUserIdFromStorage();

// //  if(currentUserID){
// //   setPatientId(currentUserID);
// //   return;
// //  }else{
// // setPatientId(1);//dummyid
// //  }
// return;
// }
//   ,[])



// //intial records set before filtration
// useEffect(() => {
//   retrieveRecords();

//   if(records) return;
//   if(Number(patientId) === 1){
//     setRecords(DUMMY_RECORDS_FOR_PATIENT_1);
//     return;
//   } else if (Number(patientId) === 2){
//     setRecords(DUMMY_RECORDS_FOR_PATIENT_2)
//   }else {
//     setRecords(DUMMY_RECORDS_FOR_PATIENT_2)
//   }
  
// }, [patientId]);

 const handleFilter = (filters) => {
  const params = {};
  if (filters.recordType && filters.recordType !== 'all') {
    params.record_type = filters.recordType;
  }
  if (filters.fromDate) {
    params.from_date = filters.fromDate;
  }
  retrieveRecords(patientId, params);
 }
 const handleRowClick = (record) => {
  navigate(`/patients/me/records/currentRecord`,{
    state: {patientId:patientId,recordId:record.id}
  });
 }

 //prepare columns

 const columns = [
  { key: 'title', label: 'Title' },
  { key: 'record_type', label: 'Record Type',
    render:(value) => (<StatusBadge status={value}/>)
   },
  { key: 'created_by_name', label: 'Created By' },
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
{console.log(records)}
    
    <div>
    <DataTable columns={columns} data={records} emptyMessage={emptyMessage} onRowClick={handleRowClick} />
      </div>
      </>
  );
}
