import { useState, useEffect, useCallback } from 'react';
import staffApi from '../../../api/services/staffService';
import notificationApi from '../../../api/services/notificationService';
import { parseApiError } from '../../../api/errorHandler';

export default function useStaffDashboard() {
  const [stats, setStats] = useState({
    todays_appointments: 0,
    active_patients: 0,
    pending_records: 0,
    unread_notifications: 0,
  });
  const [recentRecords, setRecentRecords] = useState([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [dashRes, notifRes] = await Promise.allSettled([
        staffApi.getStaffDashboard(),
        notificationApi.getUnreadCount(),
      ]);

      let newStats = {
        todays_appointments: 0,
        active_patients: 0,
        pending_records: 0,
        unread_notifications: 0,
      };
      let newRecentRecords = [];

      if (dashRes.status === 'fulfilled') {
        const data = dashRes.value.data;
        newStats.todays_appointments = data.today_appointments || 0;
        newStats.active_patients = data.total_patients || 0;
        newStats.pending_records = data.pending_consents || 0;
        newRecentRecords = data.recent_records || [];
        setUpcomingAppointments(data.upcoming_appointments || []);
      } else {
        const parsed = parseApiError(dashRes.reason);
        setError(parsed.message || 'Failed to load dashboard data.');
      }

      if (notifRes.status === 'fulfilled') {
        newStats.unread_notifications = notifRes.value.data.unread_count || 0;
      }

      setStats(newStats);
      setRecentRecords(newRecentRecords);
    } catch (err) {
      const parsed = parseApiError(err);
      setError(parsed.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchDashboard();
  }, [fetchDashboard]);

  return { stats, recentRecords, upcomingAppointments, loading, error, refetch: fetchDashboard };
}
