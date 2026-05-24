/**
 * Audit Logs API endpoints
 * Owner: Kyrillos
 *
 * Audit_Log model (from ERD):
 *   Audit_Id (PK), User_Id (FK), Action, Entity_Type, Entity_Id,
 *   Timestamp, Details, IP_Address
 *
 * Read-only / append-only — no create, update, or delete from frontend.
 *
 * Backend URL alignment:
 *   GET /audit-logs              → getAuditLogs
 *   GET /audit-logs/stats        → getAuditStats
 *   GET /audit-logs/export       → exportAuditLogs (CSV download)
 *   GET /audit-logs/<id>         → getAuditLogById
 */
import apiClient from '../apiClient';

const auditApi = {
  /**
   * List audit logs with optional filters (admin only).
   * @param {{ user_id?: number, entity_type?: string, action?: string,
   *           from_date?: string, to_date?: string, page?: number }} params
   * @returns {Promise<{ data: { results: AuditLog[], count: number } }>}
   */
  getAuditLogs: (params = {}) =>
    apiClient.get('/audit-logs', { params }),

  /**
   * Get a single audit log entry by ID.
   * @param {number} auditId
   * @returns {Promise<{ data: AuditLog }>}
   */
  getAuditLogById: (auditId) =>
    apiClient.get(`/audit-logs/${auditId}`),

  /**
   * Get aggregate statistics for the audit dashboard.
   * @returns {Promise<{ data: { total_actions_today, actions_by_type, top_users } }>}
   */
  getAuditStats: () =>
    apiClient.get('/audit-logs/stats'),

  /**
   * Download audit logs as CSV.
   * @param {{ start?: string, end?: string }} params  ISO date strings
   * @returns {Promise<Blob>}  — use responseType: 'blob' in consumer
   */
  exportAuditLogs: (params = {}) =>
    apiClient.get('/audit-logs/export', { params, responseType: 'blob' }),
};

export default auditApi;
