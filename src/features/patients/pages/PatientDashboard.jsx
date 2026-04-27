/**
 * Patient Dashboard — homepage showing overview widgets.
 * Owner: Abanob
 *
 * ERD refs: Patient, Payment (Amount, Status), Consent (Is_Active),
 *           MedicalRecord, Appointment (Scheduled_at, Status)
 *
 * TODO:
 * - Fetch dashboard data from patientApi.getDashboard()
 * - Show outstanding_balance (sum of Payment where Status=PENDING)
 * - Show consent status (count of Consent where Is_Active=true)
 * - Show health records count (MedicalRecord count)
 * - Show upcoming appointments count (Appointment where Status=SCHEDULED)
 * - Show recent activity list
 * - Include RecentUploadsWidget from records module
 */
import { useAuth } from '../../auth/context/AuthContext';
import { Card } from '../../../components/ui';
import './PatientPages.css';

export default function PatientDashboard() {
  const { user } = useAuth();

  return (
    <div className="patient-dashboard">
      <div className="page-header">
        <h1 className="page-title">Welcome back, {user?.name || 'Patient'}</h1>
        <p className="page-subtitle">Here&apos;s an overview of your health account.</p>
      </div>

      {/* TODO: Add stat cards grid */}
      {/* TODO: Add recent activity card */}
    </div>
  );
}
