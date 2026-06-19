import { describe, it, expect, vi, beforeEach } from 'vitest';
import consentApi from './consentService';
import apiClient from '../apiClient';

vi.mock('../apiClient', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  }
}));

describe('consentService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getConsents calls /patients/:id/consents', async () => {
    const mockData = [{ id: 1 }];
    apiClient.get.mockResolvedValueOnce({ data: mockData });

    const params = { is_active: true };
    const response = await consentApi.getConsents(1, params);

    expect(apiClient.get).toHaveBeenCalledWith('/patients/1/consents', { params });
    expect(response.data).toEqual(mockData);
  });

  it('grantConsent calls POST /patients/:id/consents', async () => {
    const mockData = { id: 1 };
    apiClient.post.mockResolvedValueOnce({ data: mockData });

    const payload = { staff_id: 2, purpose: 'TREATMENT' };
    const response = await consentApi.grantConsent(1, payload);

    expect(apiClient.post).toHaveBeenCalledWith('/patients/1/consents', payload);
    expect(response.data).toEqual(mockData);
  });

  it('revokeConsent calls DELETE /patients/:id/consents/:cid', async () => {
    const mockData = { message: 'Revoked' };
    apiClient.delete.mockResolvedValueOnce({ data: mockData });

    const response = await consentApi.revokeConsent(1, 2);

    expect(apiClient.delete).toHaveBeenCalledWith('/patients/1/consents/2');
    expect(response.data).toEqual(mockData);
  });

  it('checkConsent calls /consents/check', async () => {
    const mockData = { has_consent: true };
    apiClient.get.mockResolvedValueOnce({ data: mockData });

    const params = { patient_id: 1, staff_id: 2, purpose: 'VIEW' };
    const response = await consentApi.checkConsent(params);

    expect(apiClient.get).toHaveBeenCalledWith('/consents/check', { params });
    expect(response.data).toEqual(mockData);
  });
});
