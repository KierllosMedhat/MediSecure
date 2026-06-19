import { describe, it, expect, vi, beforeEach } from 'vitest';
import patientApi from './patientService';
import apiClient from '../apiClient';

vi.mock('../apiClient', () => ({
  default: {
    get: vi.fn(),
    put: vi.fn(),
  }
}));

describe('patientService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getProfile calls /patients/profile', async () => {
    const mockData = { id: 1, first_name: 'John' };
    apiClient.get.mockResolvedValueOnce({ data: mockData });

    const response = await patientApi.getProfile();

    expect(apiClient.get).toHaveBeenCalledWith('/patients/profile');
    expect(response.data).toEqual(mockData);
  });

  it('updateProfile calls /patients/profile with data', async () => {
    const mockData = { message: 'Updated' };
    apiClient.put.mockResolvedValueOnce({ data: mockData });

    const updateData = { blood_type: 'O+' };
    const response = await patientApi.updateProfile(updateData);

    expect(apiClient.put).toHaveBeenCalledWith('/patients/profile', updateData);
    expect(response.data).toEqual(mockData);
  });

  it('getDashboard calls /patients/dashboard', async () => {
    const mockData = { stats: {} };
    apiClient.get.mockResolvedValueOnce({ data: mockData });

    const response = await patientApi.getDashboard();

    expect(apiClient.get).toHaveBeenCalledWith('/patients/dashboard');
    expect(response.data).toEqual(mockData);
  });
});
