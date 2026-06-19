import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataTable, Button } from '../../../components/ui';
import apiClient from '../../../api/apiClient';

export default function PatientList() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await apiClient.get('/patients');
        setPatients(response.data.results || response.data);
      } catch (err) {
        setError('Failed to load patients.');
      } finally {
        setLoading(false);
      }
    };
    fetchPatients();
  }, []);

  const columns = [
    { key: 'national_id', label: 'National ID' },
    { 
      key: 'name', 
      label: 'Name',
      render: (_, patient) => patient.full_name || `${patient.first_name || ''} ${patient.last_name || ''}`.trim() || 'N/A'
    },
    { 
      key: 'email', 
      label: 'Email',
      render: (_, patient) => patient.email || 'N/A'
    },
    { key: 'date_of_birth', label: 'DOB' },
    { key: 'blood_type', label: 'Blood Type' },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, patient) => (
        <Button 
          variant="secondary" 
          size="sm" 
          onClick={() => navigate(`/patients/${patient.patient_id || patient.id}/records`)}
        >
          View Records
        </Button>
      )
    }
  ];

  if (loading) return <div className="dashboard-loading"><div className="dashboard-loading__spinner" /><p>Loading patients...</p></div>;
  if (error) return <div className="auth-page__error">{error}</div>;

  return (
    <div className="animate-fade-in" style={{ padding: 'var(--space-4)' }}>
      <div className="page-header">
        <h1 className="page-title">Patient Records</h1>
        <p className="page-subtitle">Select a patient to view their medical records.</p>
      </div>
      <div className="dashboard-card">
        <DataTable 
          columns={columns} 
          data={patients} 
          emptyMessage="No patients found." 
          onRowClick={(patient) => navigate(`/patients/${patient.patient_id || patient.id}/records`)}
        />
      </div>
    </div>
  );
}
