/**
 * Staff List — Admin only, filterable staff table.
 * Owner: Kyrillos
 *
 * ERD refs:
 *   Staff → Staff_Id, User_Id (FK), Hospital_Id (FK → Hospital),
 *           Department, License_no, Address
 *   User  → First_Name, Last_Name, Role, Email
 *   Roles: DOCTOR, NURSE, BILLING_STAFF, ADMIN
 */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, DataTable, StatusBadge } from '../../../components/ui';
import staffApi from '../../../api/services/staffService';
import { IoAddOutline, IoCreateOutline, IoSearchOutline } from 'react-icons/io5';
import './StaffPages.css';

/* ---------- Dummy staff data ---------- */
const DUMMY_STAFF = [
  {
    id: 1,
    first_name: 'Sara',
    last_name: 'Ahmed',
    role: 'DOCTOR',
    department: 'Cardiology',
    hospital: 'Cairo Medical Center',
    license_no: 'MD-20210341',
    status: 'ENABLED',
  },
  {
    id: 2,
    first_name: 'Omar',
    last_name: 'Hassan',
    role: 'DOCTOR',
    department: 'Radiology',
    hospital: 'Cairo Medical Center',
    license_no: 'MD-20190562',
    status: 'ENABLED',
  },
  {
    id: 3,
    first_name: 'Laila',
    last_name: 'Mahmoud',
    role: 'NURSE',
    department: 'Emergency',
    hospital: 'Alexandria General Hospital',
    license_no: 'NR-20221190',
    status: 'ENABLED',
  },
  {
    id: 4,
    first_name: 'Youssef',
    last_name: 'Karim',
    role: 'BILLING_STAFF',
    department: 'Finance',
    hospital: 'Cairo Medical Center',
    license_no: 'BS-20230087',
    status: 'ENABLED',
  },
  {
    id: 5,
    first_name: 'Nada',
    last_name: 'Samir',
    role: 'ADMIN',
    department: 'Administration',
    hospital: 'Alexandria General Hospital',
    license_no: 'AD-20200015',
    status: 'DISABLED',
  },
  {
    id: 6,
    first_name: 'Khaled',
    last_name: 'Mostafa',
    role: 'DOCTOR',
    department: 'Neurology',
    hospital: 'Cairo Medical Center',
    license_no: 'MD-20180923',
    status: 'ENABLED',
  },
];

const DEPARTMENTS = ['All', 'Cardiology', 'Radiology', 'Emergency', 'Neurology', 'Finance', 'Administration'];

export default function StaffList() {
  const navigate = useNavigate();
  const [staff, setStaff] = useState(DUMMY_STAFF);
  const [filteredStaff, setFilteredStaff] = useState(DUMMY_STAFF);

  /* Filter state */
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [deptFilter, setDeptFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('ALL');

  /* Apply filters */
  const applyFilters = () => {
    let result = [...staff];
    if (roleFilter !== 'ALL') {
      result = result.filter((s) => s.role === roleFilter);
    }
    if (deptFilter !== 'All') {
      result = result.filter((s) => s.department === deptFilter);
    }
    if (statusFilter !== 'ALL') {
      result = result.filter((s) => s.status === statusFilter);
    }
    setFilteredStaff(result);
  };

  const resetFilters = () => {
    setRoleFilter('ALL');
    setDeptFilter('All');
    setStatusFilter('ALL');
    setFilteredStaff(staff);
  };

  /* Fetch staff from API (backend-ready) */
  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const response = await staffApi.getStaffList();
        const data = response.data.results || response.data;
        setStaff(data);
        setFilteredStaff(data);
      } catch {
        // Use dummy data on failure (no backend yet)
        setStaff(DUMMY_STAFF);
        setFilteredStaff(DUMMY_STAFF);
      }
    };
    fetchStaff();
  }, []);

  /* Table columns */
  const columns = [
    {
      key: 'name',
      label: 'Name',
      render: (_, row) => (
        <span style={{ fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text-primary)' }}>
          {row.full_name}
        </span>
      ),
    },
    {
      key: 'role',
      label: 'Role',
      render: (value) => <StatusBadge status={value} />,
    },
    { key: 'department', label: 'Department' },
    { key: 'hospital_name', label: 'Hospital' },
    { key: 'license_no', label: 'License No.' },
    {
      key: 'status',
      label: 'Status',
      render: (value) => <StatusBadge status={value} />,
    },
    {
      key: 'actions',
      label: '',
      render: (_, row) => (
        <button
          className="staff-table-action"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/staff/${row.id}/edit`);
          }}
        >
          <IoCreateOutline /> Edit
        </button>
      ),
    },
  ];

  return (
    <div className="staff-page animate-fade-in">
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h1 className="page-title">Staff Management</h1>
            <p className="page-subtitle">View and manage all staff members.</p>
          </div>
          <Button variant="primary" onClick={() => navigate('/staff/new')}>
            <IoAddOutline /> Add Staff
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="staff-filter-bar">
        <div className="staff-filter-field">
          <label htmlFor="role-filter">Role</label>
          <select
            id="role-filter"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="ALL">All Roles</option>
            <option value="DOCTOR">Doctor</option>
            <option value="NURSE">Nurse</option>
            <option value="BILLING_STAFF">Billing Staff</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>

        <div className="staff-filter-field">
          <label htmlFor="dept-filter">Department</label>
          <select
            id="dept-filter"
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
          >
            {DEPARTMENTS.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        <div className="staff-filter-field">
          <label htmlFor="status-filter">Status</label>
          <select
            id="status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All</option>
            <option value="ENABLED">Active</option>
            <option value="DISABLED">Inactive</option>
          </select>
        </div>

        <div className="staff-filter-actions">
          <Button variant="primary" size="sm" onClick={applyFilters}>
            <IoSearchOutline /> Filter
          </Button>
          <Button variant="ghost" size="sm" onClick={resetFilters}>
            Reset
          </Button>
        </div>
      </div>

      {/* Staff DataTable */}
      <DataTable
        columns={columns}
        data={filteredStaff}
        emptyMessage="No staff members found matching your filters."
      />
    </div>
  );
}
