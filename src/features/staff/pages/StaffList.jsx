/**
 * Staff List — Admin only, filterable staff table.
 * Owner: Kyrillos
 *
 * ERD refs:
 *   Staff → Staff_Id, User_Id (FK), Hospital_Id (FK → Hospital),
 *           Department, License_no, Address
 *   User  → First_Name, Last_Name, Role, Email
 *   Roles: DOCTOR, NURSE, BILLING_STAFF, ADMIN
 *
 * TODO:
 * - Fetch staff from staffApi.getStaffList({ role, department, status, hospital_id })
 * - Filter bar: role dropdown (DOCTOR, NURSE, BILLING_STAFF, ADMIN),
 *   department dropdown, status dropdown
 * - DataTable columns: name (First_Name + Last_Name), Role (StatusBadge),
 *   Department, Hospital, License_no, status, edit button
 * - "Add Staff" button → /staff/new
 * - Edit button → /staff/:id/edit
 */
import { Button, DataTable, StatusBadge } from '../../../components/ui';
import './StaffPages.css';

export default function StaffList() {
  return (
    <div className="staff-page">
      <div className="page-header">
        <h1 className="page-title">Staff Management</h1>
        <p className="page-subtitle">View and manage all staff members.</p>
      </div>

      {/* TODO: Filter bar (role, department, status) */}
      {/* TODO: Staff DataTable */}
    </div>
  );
}
