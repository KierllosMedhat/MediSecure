/**
 * Appointments API endpoints
 * Owner: Kyrillos
 *
 * Appointment model (from ERD):
 *   Appointment_Id (PK), Patient_Id (FK), Staff_Id (FK),
 *   Scheduled_at, Duration_Min, Status, Type, Location, Notes,
 *   created_at, updated_at, deleted_at
 *
 * Status: SCHEDULED | CONFIRMED | IN_PROGRESS | COMPLETED | CANCELLED | NO_SHOW
 */
import apiClient from '../apiClient';

const appointmentApi = {
  getAppointments: (params = {}) =>
    apiClient.get('/appointments', { params }),
  // params: { status, from_date, patient_id, staff_id }

  getAppointmentById: (appointmentId) =>
    apiClient.get(`/appointments/${appointmentId}`),

  createAppointment: (data) =>
    apiClient.post('/appointments', data),
  // data: { patient_id, staff_id, scheduled_at, duration_min, type, location, notes }

  cancelAppointment: (appointmentId, reason) =>
    apiClient.patch(`/appointments/${appointmentId}`, {
      status: 'CANCELLED',
      cancelled_reason: reason,
    }),

  updateAppointment: (appointmentId, data) =>
    apiClient.put(`/appointments/${appointmentId}`, data),
};

export default appointmentApi;
