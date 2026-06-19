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

const ENTITY_TYPES = ['All', 'User', 'Staff', 'MedicalRecord', 'Document', 'Consent', 'Payment', 'Appointment', 'Notification'];
const ACTIONS = ['All', 'LOGIN', 'LOGOUT', 'VIEW', 'CREATE', 'UPDATE', 'DELETE', 'UPLOAD', 'DOWNLOAD', 'REVOKE', 'DEACTIVATE'];

function fmtTs(ts) {
  if (!ts) return '—';
  return new Date(ts).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [filtered, setFiltered] = useState([]);

  /* Filter state */
  const [userFilter, setUserFilter] = useState('');
  const [entityFilter, setEntityFilter] = useState('All');
  const [actionFilter, setActionFilter] = useState('All');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  /* Fetch from API */
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await auditApi.getAuditLogs();
        const data = res.data.results || res.data || [];
        setLogs(data);
        setFiltered(data);
      } catch (err) {
        console.error("Failed to fetch audit logs:", err);
      }
    };
    fetchLogs();
  }, []);

  const applyFilters = () => {
    let result = [...logs];
    if (userFilter.trim()) {
      const q = userFilter.toLowerCase();
      result = result.filter((l) => 
        (l.user_email && l.user_email.toLowerCase().includes(q)) || 
        (l.user_name && l.user_name.toLowerCase().includes(q))
      );
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
    { key: 'user_email', label: 'User' },
    { key: 'action', label: 'Action' },
    { key: 'entity_type', label: 'Entity Type' },
    { key: 'entity_id', label: 'Entity ID' },
    { key: 'details', label: 'Details', render: (v) => {
        const text = typeof v === 'object' && v !== null ? JSON.stringify(v) : String(v || '');
        return <span className="audit-details-cell" title={text}>{text}</span>;
    } },
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
