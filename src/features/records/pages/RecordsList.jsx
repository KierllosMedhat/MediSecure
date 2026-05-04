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
 * - "Upload Record" button → /records/upload
 * - Handle consent 403 errors gracefully
 */
import { useParams } from 'react-router-dom';
import { DataTable, Button } from '../../../components/ui';
import recordsApi from '../../../api/services/recordsService';
import './RecordPages.css';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button/Button';
import { useState } from 'react';
export default function RecordsList() {
  const { id: patientId } = useParams();
  const navigate = useNavigate();
  
const [records,setRecords] = useState([]);
const [recordType,setRecordType] = useState('all');
const [fromDate,setFromDate] = useState('');

const [emptyMessage,setEmptyMessage] = useState('No records found.');
const retrieveRecords = async () => {
  try{
  const response = await recordsApi.getRecords(patientId, { recordType, fromDate });
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
//intial records set before filtration
retrieveRecords();

 const handleFilter = () => {
  retrieveRecords();
 }
 const handleRowClick = (record) => {
  navigate(`/patients/${patientId}/records/${record.record_id}`);
 }

 //prepare columns

 const columns = [
  { key: 'title', label: 'Title' },
  { key: 'record_type', label: 'Record Type' },
  { key: 'created_by', label: 'Created By' },
  { key: 'created_at', label: 'Created At' },
]


  return (
    <div className="records-page">
      <div className="page-header">
        <h1 className="page-title">Health Records</h1>
        <p className="page-subtitle">View and manage your unified health record.</p>
      </div>

      {/* TODO: Add filter bar (Record_type select, from_date picker) */}
      <select id="record-type" value={recordType} onChange={(e) => setRecordType(e.target.value)}>
        <option value="all">All</option>
        <option value="diagnosis">Diagnosis</option>
        <option value="lab_result">Lab Result</option>
        <option value="prescription">Prescription</option>
        <option value="imaging">Imaging</option>
      </select>

      <input type="date" id="from-date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
      <Button onClick={() => handleFilter(recordType, fromDate)}>Filter</Button>
      {/* TODO: Add DataTable with MedicalRecord data */}

<DataTable columns={columns} data={records} emptyMessage={emptyMessage} onRowClick={handleRowClick} />
    </div>
  );
}
