/**
 * Hospital API endpoints
 * Owner: Kyrillos
 *
 * Hospital model (from ERD):
 *   Hospital_Id (PK), Name, Address, Email, Phone,
 *   Subscription, created_at, updated_at, deleted_at
 */
import apiClient from '../apiClient';

const hospitalApi = {
  getHospitals: () =>
    apiClient.get('/hospitals'),

  getHospitalById: (hospitalId) =>
    apiClient.get(`/hospitals/${hospitalId}`),
};

export default hospitalApi;
