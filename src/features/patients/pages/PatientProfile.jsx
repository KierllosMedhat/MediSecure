/**
 * Patient Profile — view & edit personal information.
 * Owner: Abanob
 *
 * ERD refs:
 *   User  → First_Name, Middle_Name, Last_Name, Phone_Number, Email
 *   Patient → National_Id, Date_Of_Birth, Blood_Type, Emergency_Contact, Address
 *
 * TODO:
 * - Fetch profile from patientApi.getProfile()
 * - Display fields:
 *     User: first_name, middle_name, last_name, email, phone_number
 *     Patient: national_id (read-only), date_of_birth, blood_type,
 *              emergency_contact, address
 * - Toggle between view mode and edit mode
 * - On save, call patientApi.updateProfile(formData)
 * - national_id should always be read-only
 */
import { Card, Button, Input } from '../../../components/ui';
import './PatientPages.css';

export default function PatientProfile() {
  return (
    <div className="patient-profile">
      <div className="page-header">
        <h1 className="page-title">My Profile</h1>
        <p className="page-subtitle">View and manage your personal information.</p>
      </div>

      {/* TODO: Implement profile view/edit form */}
    </div>
  );
}
