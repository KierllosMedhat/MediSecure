/**
 * Role constants and helpers — single source of truth.
 * Must match the backend Role enum from the ERD.
 *
 * Roles: PATIENT, DOCTOR, NURSE, BILLING_STAFF, ADMIN
 *
 * Owner: Abanob
 */

export const ROLES = Object.freeze({
  PATIENT: 'PATIENT',
  DOCTOR: 'DOCTOR',
  NURSE: 'NURSE',
  BILLING_STAFF: 'BILLING_STAFF',
  ADMIN: 'ADMIN',
});

/** All roles that access the staff/admin dashboard */
export const STAFF_ROLES = [ROLES.DOCTOR, ROLES.NURSE, ROLES.BILLING_STAFF, ROLES.ADMIN];

/** All roles (for routes accessible to any authenticated user) */
export const ALL_ROLES = Object.values(ROLES);

/**
 * Get the default dashboard path for a given role.
 * @param {string} role — one of the ROLES values
 * @returns {string} dashboard path
 */
export function getDashboardPath(role) {
  return role === ROLES.PATIENT ? '/dashboard' : '/staff/dashboard';
}
