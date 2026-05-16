/**
 * Audit Logs Page — Admin only, immutable/read-only view.
 * Owner: Kyrillos
 *
 * ERD refs:
 *   Audit_Log → Audit_Id, User_Id (FK), Action, Entity_Type,
 *               Entity_Id, Timestamp, Details, IP_Address
 *   Read-only / append-only — no mutations from frontend.
 */
import { useState, useEffect } from 'react';
import { Button, DataTable } from '../../../components/ui';
import auditApi from '../../../api/services/auditService';
import { IoSearchOutline } from 'react-icons/io5';
import './AuditPages.css';

/* ---------- Dummy audit data ---------- */
const DUMMY_LOGS = [
  { id: 1, timestamp: '2026-05-16T17:02:00Z', user: 'admin@medisecure.com', action: 'LOGIN', entity_type: 'User', entity_id: '1', details: 'Successful login from web', ip_address: '197.38.12.45' },
  { id: 2, timestamp: '2026-05-16T16:45:00Z', user: 'dr.sara@medisecure.com', action: 'VIEW', entity_type: 'MedicalRecord', entity_id: '101', details: 'Viewed blood test results', ip_address: '197.38.12.50' },
  { id: 3, timestamp: '2026-05-16T15:30:00Z', user: 'admin@medisecure.com', action: 'CREATE', entity_type: 'Staff', entity_id: '7', details: 'Created new staff account', ip_address: '197.38.12.45' },
  { id: 4, timestamp: '2026-05-16T14:10:00Z', user: 'dr.omar@medisecure.com', action: 'UPDATE', entity_type: 'Appointment', entity_id: '3', details: 'Status changed to IN_PROGRESS', ip_address: '10.0.1.22' },
  { id: 5, timestamp: '2026-05-16T12:00:00Z', user: 'billing@medisecure.com', action: 'CREATE', entity_type: 'Payment', entity_id: '45', details: 'Payment of $150 processed via Fawry', ip_address: '10.0.1.15' },
  { id: 6, timestamp: '2026-05-15T22:15:00Z', user: 'patient1@email.com', action: 'REVOKE', entity_type: 'Consent', entity_id: '12', details: 'Patient revoked data access', ip_address: '41.33.100.8' },
  { id: 7, timestamp: '2026-05-15T18:00:00Z', user: 'dr.sara@medisecure.com', action: 'UPLOAD', entity_type: 'Document', entity_id: '201', details: 'Uploaded MRI scan report', ip_address: '197.38.12.50' },
  { id: 8, timestamp: '2026-05-15T10:30:00Z', user: 'admin@medisecure.com', action: 'DEACTIVATE', entity_type: 'Staff', entity_id: '5', details: 'Deactivated staff member', ip_address: '197.38.12.45' },
];

const ENTITY_TYPES = ['All', 'User', 'Staff', 'MedicalRecord', 'Document', 'Consent', 'Payment', 'Appointment', 'Notification'];
const ACTIONS = ['All', 'LOGIN', 'LOGOUT', 'VIEW', 'CREATE', 'UPDATE', 'DELETE', 'UPLOAD', 'DOWNLOAD', 'REVOKE', 'DEACTIVATE'];

function fmtTs(ts) {
  if (!ts) return '—';
  return new Date(ts).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState(DUMMY_LOGS);
  const [filtered, setFiltered] = useState(DUMMY_LOGS);

  /* Filter state */
  const [userFilter, setUserFilter] = useState('');
  const [entityFilter, setEntityFilter] = useState('All');
  const [actionFilter, setActionFilter] = useState('All');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  /* Fetch from API */
  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await auditApi.getAuditLogs();
        setLogs(res.data);
        setFiltered(res.data);
      } catch {
        setLogs(DUMMY_LOGS);
        setFiltered(DUMMY_LOGS);
      }
    };
    fetch();
  }, []);

  const applyFilters = () => {
    let result = [...logs];
    if (userFilter.trim()) {
      const q = userFilter.toLowerCase();
      result = result.filter((l) => l.user.toLowerCase().includes(q));
    }
    if (entityFilter !== 'All') result = result.filter((l) => l.entity_type === entityFilter);
    if (actionFilter !== 'All') result = result.filter((l) => l.action === actionFilter);
    if (fromDate) result = result.filter((l) => new Date(l.timestamp) >= new Date(fromDate));
    if (toDate) result = result.filter((l) => new Date(l.timestamp) <= new Date(toDate + 'T23:59:59'));
    setFiltered(result);
  };

  const resetFilters = () => {
    setUserFilter(''); setEntityFilter('All'); setActionFilter('All');
    setFromDate(''); setToDate('');
    setFiltered(logs);
  };

  const columns = [
    { key: 'timestamp', label: 'Timestamp', render: (v) => fmtTs(v) },
    { key: 'user', label: 'User' },
    { key: 'action', label: 'Action' },
    { key: 'entity_type', label: 'Entity Type' },
    { key: 'entity_id', label: 'Entity ID' },
    { key: 'details', label: 'Details', render: (v) => <span className="audit-details-cell" title={v}>{v}</span> },
    { key: 'ip_address', label: 'IP Address' },
  ];

  return (
    <div className="audit-page animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Audit Logs</h1>
        <p className="page-subtitle">Immutable record of all system actions.</p>
      </div>

      {/* Filter Bar */}
      <div className="audit-filter-bar">
        <div className="audit-filter-field">
          <label htmlFor="audit-user">User</label>
          <input id="audit-user" type="text" placeholder="Search user…" value={userFilter} onChange={(e) => setUserFilter(e.target.value)} />
        </div>
        <div className="audit-filter-field">
          <label htmlFor="audit-entity">Entity Type</label>
          <select id="audit-entity" value={entityFilter} onChange={(e) => setEntityFilter(e.target.value)}>
            {ENTITY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div className="audit-filter-field">
          <label htmlFor="audit-action">Action</label>
          <select id="audit-action" value={actionFilter} onChange={(e) => setActionFilter(e.target.value)}>
            {ACTIONS.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
        <div className="audit-filter-field">
          <label htmlFor="audit-from">From</label>
          <input id="audit-from" type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
        </div>
        <div className="audit-filter-field">
          <label htmlFor="audit-to">To</label>
          <input id="audit-to" type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
        </div>
        <div className="audit-filter-actions">
          <Button variant="primary" size="sm" onClick={applyFilters}><IoSearchOutline /> Filter</Button>
          <Button variant="ghost" size="sm" onClick={resetFilters}>Reset</Button>
        </div>
      </div>

      <DataTable columns={columns} data={filtered} emptyMessage="No audit logs found." />
    </div>
  );
}
