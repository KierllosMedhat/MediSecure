/**
 * usePatientDashboard — fetches dashboard summary + profile for the sidebar.
 * Separates data-fetching logic from PatientDashboard UI (Rule 3).
 *
 * Falls back to mock data when the API is unavailable so the UI
 * always renders during development.
 *
 * Owner: Abanob
 */
import { useState, useEffect, useCallback } from 'react';
import patientApi from '../../../api/services/patientService';
import { parseApiError } from '../../../api/errorHandler';

/* ---------- Mock Fallback Data (matches Figma) ---------- */
const MOCK_DASHBOARD = {
  stats: {
    total_records: 24,
    pending_bills_amount: 430,
    next_appointment: { date: '2026-04-22', doctor_name: 'Dr. Johnson' },
    profile_completion: 85,
  },
  recent_records: [
    { id: '1', title: 'Blood Test Results', doctor_name: 'Dr. Sarah Johnson', date: '2026-04-10', type: 'Lab Report' },
    { id: '2', title: 'X-Ray Chest', doctor_name: 'Dr. Michael Chen', date: '2026-04-05', type: 'Imaging' },
    { id: '3', title: 'Prescription - Antibiotics', doctor_name: 'Dr. Sarah Johnson', date: '2026-03-28', type: 'Prescription' },
    { id: '4', title: 'Annual Physical Exam', doctor_name: 'Dr. Emily White', date: '2026-03-15', type: 'Exam Report' },
  ],
  pending_bills: [
    { id: '1', description: 'Consultation Fee', due_date: '2026-04-20', amount: 150, status: 'PENDING' },
    { id: '2', description: 'Lab Tests', due_date: '2026-04-18', amount: 280, status: 'OVERDUE' },
  ],
  recent_activity: [
    { id: '1', action: 'Document uploaded', description: 'Blood Test Results.pdf', timestamp: '2 hours ago', type: 'upload' },
    { id: '2', action: 'Record accessed', description: 'Dr. Sarah Johnson viewed your records', timestamp: '1 day ago', type: 'access' },
    { id: '3', action: 'Payment processed', description: '$150.00 consultation fee', timestamp: '3 days ago', type: 'payment' },
  ],
  consent: { grant_data_access: true },
};

const MOCK_PROFILE = {
  patient_id: 'P-12345',
  first_name: 'John',
  middle_name: null,
  last_name: 'Doe',
  email: 'john.doe@email.com',
  phone_number: '+20 123 456 7890',
  date_of_birth: '1985-01-15',
  blood_type: 'O+',
};

export default function usePatientDashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [dashRes, profileRes] = await Promise.allSettled([
        patientApi.getDashboard(),
        patientApi.getProfile(),
      ]);

      /* Use API data if available, otherwise fall back to mocks */
      setDashboardData(
        dashRes.status === 'fulfilled' ? dashRes.value.data : MOCK_DASHBOARD
      );
      setProfile(
        profileRes.status === 'fulfilled' ? profileRes.value.data : MOCK_PROFILE
      );

      /* If both failed, set a user-visible error but still show mock data */
      if (dashRes.status === 'rejected' && profileRes.status === 'rejected') {
        const parsed = parseApiError(dashRes.reason);
        setError(parsed.message);
      }
    } catch (err) {
      const parsed = parseApiError(err);
      setError(parsed.message);
      /* Still provide mock data so the UI renders */
      setDashboardData(MOCK_DASHBOARD);
      setProfile(MOCK_PROFILE);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchDashboard();
  }, [fetchDashboard]);

  return { dashboardData, profile, loading, error, refetch: fetchDashboard };
}
