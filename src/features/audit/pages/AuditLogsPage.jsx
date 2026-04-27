/**
 * Audit Logs Page — Admin only, immutable/read-only view.
 * Owner: Kyrillos
 *
 * ERD refs:
 *   Audit_Log → Audit_Id, User_Id (FK), Action, Entity_Type,
 *               Entity_Id, Timestamp, Details, IP_Address
 *   Read-only / append-only — no mutations from frontend.
 *
 * TODO:
 * - Fetch from auditApi.getAuditLogs({ user_id, entity_type, action, from_date, to_date })
 * - Filter bar: user_id, entity_type, action, date range (from_date, to_date)
 * - DataTable columns: Timestamp, User (via User_Id), Action, Entity_Type,
 *   Entity_Id, Details, IP_Address
 * - No edit/delete — immutable log-only view
 */
import { DataTable } from '../../../components/ui';
import './AuditPages.css';

export default function AuditLogsPage() {
  const columns = [
    { key: 'timestamp', label: 'Timestamp' },
    { key: 'user', label: 'User' },
    { key: 'action', label: 'Action' },
    { key: 'entity_type', label: 'Entity Type' },
    { key: 'entity_id', label: 'Entity ID' },
    { key: 'details', label: 'Details' },
    { key: 'ip_address', label: 'IP Address' },
  ];

  return (
    <div className="audit-page">
      <div className="page-header">
        <h1 className="page-title">Audit Logs</h1>
        <p className="page-subtitle">Immutable record of all system actions.</p>
      </div>
      {/* TODO: Filter bar (user_id, entity_type, action, date range) */}
      <DataTable columns={columns} data={[]} emptyMessage="No audit logs found." />
    </div>
  );
}
