import { describe, it, expect, vi, beforeEach } from 'vitest';
import appointmentApi from './appointmentService';
import apiClient from '../apiClient';

vi.mock('../apiClient', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
  }
}));

describe('appointmentService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getAppointments calls /appointments with params', async () => {
    const mockData = [{ id: 1 }];
    apiClient.get.mockResolvedValueOnce({ data: mockData });

    const params = { status: 'SCHEDULED' };
    const response = await appointmentApi.getAppointments(params);

    expect(apiClient.get).toHaveBeenCalledWith('/appointments', { params });
    expect(response.data).toEqual(mockData);
  });

  it('getAppointmentById calls /appointments/:id', async () => {
    const mockData = { id: 1 };
    apiClient.get.mockResolvedValueOnce({ data: mockData });

    const response = await appointmentApi.getAppointmentById(1);

    expect(apiClient.get).toHaveBeenCalledWith('/appointments/1');
    expect(response.data).toEqual(mockData);
  });

  it('createAppointment calls /appointments with data', async () => {
    const mockData = { id: 1 };
    apiClient.post.mockResolvedValueOnce({ data: mockData });

    const data = { patient_id: 1, staff_id: 2 };
    const response = await appointmentApi.createAppointment(data);

    expect(apiClient.post).toHaveBeenCalledWith('/appointments', data);
    expect(response.data).toEqual(mockData);
  });

  it('cancelAppointment calls PATCH /appointments/:id', async () => {
    const mockData = { id: 1, status: 'CANCELLED' };
    apiClient.patch.mockResolvedValueOnce({ data: mockData });

    const response = await appointmentApi.cancelAppointment(1, 'No show');

    expect(apiClient.patch).toHaveBeenCalledWith('/appointments/1', {
      status: 'CANCELLED',
      notes: 'No show',
    });
    expect(response.data).toEqual(mockData);
  });
});
