import { describe, it, expect, vi, beforeEach } from 'vitest';
import staffApi from './staffService';
import apiClient from '../apiClient';

vi.mock('../apiClient', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
  }
}));

describe('staffService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getStaffList calls /staff with params', async () => {
    const mockData = [{ id: 1 }];
    apiClient.get.mockResolvedValueOnce({ data: mockData });

    const params = { role: 'DOCTOR' };
    const response = await staffApi.getStaffList(params);

    expect(apiClient.get).toHaveBeenCalledWith('/staff', { params });
    expect(response.data).toEqual(mockData);
  });

  it('getStaffById calls /staff/:id', async () => {
    const mockData = { id: 1 };
    apiClient.get.mockResolvedValueOnce({ data: mockData });

    const response = await staffApi.getStaffById(1);

    expect(apiClient.get).toHaveBeenCalledWith('/staff/1');
    expect(response.data).toEqual(mockData);
  });

  it('createStaff calls POST /staff', async () => {
    const mockData = { id: 1 };
    apiClient.post.mockResolvedValueOnce({ data: mockData });

    const data = { email: 'doc@test.com' };
    const response = await staffApi.createStaff(data);

    expect(apiClient.post).toHaveBeenCalledWith('/staff', data);
    expect(response.data).toEqual(mockData);
  });

  it('updateStaff calls PUT /staff/:id', async () => {
    const mockData = { id: 1 };
    apiClient.put.mockResolvedValueOnce({ data: mockData });

    const data = { department: 'Cardiology' };
    const response = await staffApi.updateStaff(1, data);

    expect(apiClient.put).toHaveBeenCalledWith('/staff/1', data);
    expect(response.data).toEqual(mockData);
  });

  it('deactivateStaff calls PATCH /staff/:id/deactivate', async () => {
    const mockData = { message: 'Deactivated' };
    apiClient.patch.mockResolvedValueOnce({ data: mockData });

    const response = await staffApi.deactivateStaff(1);

    expect(apiClient.patch).toHaveBeenCalledWith('/staff/1/deactivate');
    expect(response.data).toEqual(mockData);
  });

  it('getStaffDashboard calls GET /staff/dashboard', async () => {
    const mockData = { stats: {} };
    apiClient.get.mockResolvedValueOnce({ data: mockData });

    const response = await staffApi.getStaffDashboard();

    expect(apiClient.get).toHaveBeenCalledWith('/staff/dashboard');
    expect(response.data).toEqual(mockData);
  });
});
