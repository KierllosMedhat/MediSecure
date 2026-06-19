import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import usePatientProfile from './usePatientProfile';
import patientApi from '../../../api/services/patientService';

vi.mock('../../../api/services/patientService', () => ({
  default: {
    getProfile: vi.fn(),
    updateProfile: vi.fn(),
  }
}));

vi.mock('../../auth/hooks/useAuth', () => ({
  useAuth: () => ({ user: { id: 1 }, updateUser: vi.fn() })
}));

describe('usePatientProfile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches profile successfully', async () => {
    const mockData = { first_name: 'John' };
    patientApi.getProfile.mockResolvedValueOnce({ data: mockData });

    const { result } = renderHook(() => usePatientProfile());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(patientApi.getProfile).toHaveBeenCalledTimes(1);
    expect(result.current.loading).toBe(false);
    expect(result.current.profile).toEqual(mockData);
  });

  it('updates profile successfully', async () => {
    patientApi.getProfile.mockResolvedValueOnce({ data: { first_name: 'John', last_name: 'Doe' } });
    patientApi.updateProfile.mockResolvedValueOnce({ data: { message: 'Updated' } });

    const { result } = renderHook(() => usePatientProfile());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    await act(async () => {
      await result.current.handleSave();
    });

    expect(patientApi.updateProfile).toHaveBeenCalledWith({
      first_name: 'John',
      last_name: 'Doe',
      middle_name: '',
      phone_number: '',
      date_of_birth: '',
      blood_type: '',
      emergency_contact: '',
      address: ''
    });
    expect(result.current.saving).toBe(false);
  });
});
