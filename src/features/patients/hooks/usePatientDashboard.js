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

const DEFAULT_DASHBOARD = {
  stats: {
    total_records: 0,
    pending_bills_amount: 0,
    next_appointment: null,
    profile_completion: 0,
  },
  recent_records: [],
  pending_bills: [],
  recent_activity: [],
  consent: { grant_data_access: false },
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

      /* Use API data if available, otherwise fall back to empty defaults */
      setDashboardData(
        dashRes.status === 'fulfilled' ? dashRes.value.data : DEFAULT_DASHBOARD
      );
      setProfile(
        profileRes.status === 'fulfilled' ? profileRes.value.data : null
      );

      /* If both failed, set a user-visible error */
      if (dashRes.status === 'rejected' && profileRes.status === 'rejected') {
        const parsed = parseApiError(dashRes.reason);
        setError(parsed.message);
      }
    } catch (err) {
      const parsed = parseApiError(err);
      setError(parsed.message);
      /* Still provide default data so the UI renders */
      setDashboardData(DEFAULT_DASHBOARD);
      setProfile(null);
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
