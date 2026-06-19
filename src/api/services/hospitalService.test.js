import { describe, it, expect, vi, beforeEach } from 'vitest';
import hospitalApi from './hospitalService';
import apiClient from '../apiClient';

vi.mock('../apiClient', () => ({
  default: {
    get: vi.fn(),
  }
}));

describe('hospitalService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getHospitals calls /hospitals', async () => {
    const mockData = [{ id: 1 }];
    apiClient.get.mockResolvedValueOnce({ data: mockData });

    const response = await hospitalApi.getHospitals();

    expect(apiClient.get).toHaveBeenCalledWith('/hospitals');
    expect(response.data).toEqual(mockData);
  });

  it('getHospitalById calls /hospitals/:id', async () => {
    const mockData = { id: 1 };
    apiClient.get.mockResolvedValueOnce({ data: mockData });

    const response = await hospitalApi.getHospitalById(1);

    expect(apiClient.get).toHaveBeenCalledWith('/hospitals/1');
    expect(response.data).toEqual(mockData);
  });
});
