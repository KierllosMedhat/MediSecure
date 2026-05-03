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
import './RecordPages.css';

export default function RecordsList() {
  const { id: patientId } = useParams();
  
const [records,setRecords] = useState([]);
const [recordType,setRecordType] = useState('all');
const [fromDate,setFromDate] = useState('');
const [errorMessage,setErrorMessage] = useState('');
const retrieveRecords = async () => {
  const response = await recordsApi.getRecords(patientId, { record_type, from_date });
  setRecords(response.data);
}

 const handleFilter = (recordType, fromDate) => {
  setRecords(recordsApi.getRecords(patientId, { record_type, from_date }));
 }
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
      <button onClick={() => handleFilter(recordType, fromDate)}>Filter</button>
      {/* TODO: Add DataTable with MedicalRecord data */}
// prepare columns

const columns = {[
  { key: 'title', label: 'Title' },
  { key: 'record_type', label: 'Record Type' },
  { key: 'created_by', label: 'Created By' },
  { key: 'created_at', label: 'Created At' },
]}
<DataTable columns={columns} data={records} emptyMessage="No records found." onRowClick={handleRowClick} />
    </div>
  );
}
