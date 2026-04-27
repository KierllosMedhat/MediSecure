/**
 * Audit Logs API endpoints
 * Owner: Kyrillos
 *
 * Audit_Log model (from ERD):
 *   Audit_Id (PK), User_Id (FK), Action, Entity_Type, Entity_Id,
 *   Timestamp, Details, IP_Address
 *
 * Read-only / append-only — no create, update, or delete from frontend.
 */
import apiClient from '../apiClient';

const auditApi = {
  getAuditLogs: (params = {}) =>
    apiClient.get('/audit-logs', { params }),
  // params: { user_id, entity_type, action, from_date, to_date }
  // Returns: [{ audit_id, user_id, action, entity_type, entity_id,
  //             timestamp, details, ip_address }]
};

export default auditApi;
