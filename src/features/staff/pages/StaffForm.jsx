/**
 * Staff Form — Create / Edit / Deactivate staff accounts.
 * Owner: Kyrillos
 *
 * ERD refs:
 *   User  → Email, First_Name, Middle_Name, Last_Name, Phone_Number, Role
 *   Staff → Hospital_Id (FK → Hospital), Department, License_no, Address
 *   Hospital → Hospital_Id, Name (for dropdown)
 *
 * TODO:
 * - If :id param exists → edit mode, fetch staffApi.getStaffById(id)
 * - Form fields:
 *     User: email, first_name, middle_name, last_name, phone_number,
 *           role (select: DOCTOR, NURSE, BILLING_STAFF, ADMIN)
 *     Staff: hospital_id (dropdown from hospitalApi.getHospitals()),
 *            department, license_no, address
 * - Create: staffApi.createStaff(form)
 * - Update: staffApi.updateStaff(id, form)
 * - Deactivate button (edit only): staffApi.deactivateStaff(id)
 * - Navigate to /staff/list on success
 */
import { useParams } from 'react-router-dom';
import { Card, Button, Input } from '../../../components/ui';
import './StaffPages.css';

export default function StaffForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);

  return (
    <div className="staff-page">
      <div className="page-header">
        <h1 className="page-title">{isEdit ? 'Edit Staff' : 'Add New Staff'}</h1>
      </div>

      {/* TODO: Staff create/edit form (User fields + Staff fields + Hospital dropdown) */}
      {/* TODO: Deactivate button (edit mode only) */}
    </div>
  );
}
