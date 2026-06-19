import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import usePatientDashboard from './usePatientDashboard';
import patientApi from '../../../api/services/patientService';

vi.mock('../../../api/services/patientService', () => ({
  default: {
    getDashboard: vi.fn(),
    getProfile: vi.fn(),
  }
}));

describe('usePatientDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches dashboard data successfully', async () => {
    const mockData = { stats: { total: 5 } };
    const mockProfile = { first_name: 'John' };
    patientApi.getDashboard.mockResolvedValueOnce({ data: mockData });
    patientApi.getProfile.mockResolvedValueOnce({ data: mockProfile });

    const { result } = renderHook(() => usePatientDashboard());

    // Wait for the effect to resolve
    await act(async () => {
      // Small timeout to allow promises to flush
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(patientApi.getDashboard).toHaveBeenCalledTimes(1);
    expect(result.current.loading).toBe(false);
    expect(result.current.dashboardData).toEqual(mockData);
    expect(result.current.error).toBe(null);
  });

  it('handles fetch error', async () => {
    patientApi.getDashboard.mockRejectedValueOnce(new Error('Network Error'));

    const { result } = renderHook(() => usePatientDashboard());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe('Network error. Please check your internet connection.');
  });
});
