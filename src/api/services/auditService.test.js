import { describe, it, expect, vi, beforeEach } from 'vitest';
import auditApi from './auditService';
import apiClient from '../apiClient';

vi.mock('../apiClient', () => ({
  default: {
    get: vi.fn(),
  }
}));

describe('auditService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getAuditLogs calls /audit-logs with params', async () => {
    const mockData = { results: [] };
    apiClient.get.mockResolvedValueOnce({ data: mockData });

    const params = { action: 'VIEW' };
    const response = await auditApi.getAuditLogs(params);

    expect(apiClient.get).toHaveBeenCalledWith('/audit-logs', { params });
    expect(response.data).toEqual(mockData);
  });

  it('getAuditLogById calls /audit-logs/:id', async () => {
    const mockData = { id: 1 };
    apiClient.get.mockResolvedValueOnce({ data: mockData });

    const response = await auditApi.getAuditLogById(1);

    expect(apiClient.get).toHaveBeenCalledWith('/audit-logs/1');
    expect(response.data).toEqual(mockData);
  });

  it('getAuditStats calls /audit-logs/stats', async () => {
    const mockData = { total: 10 };
    apiClient.get.mockResolvedValueOnce({ data: mockData });

    const response = await auditApi.getAuditStats();

    expect(apiClient.get).toHaveBeenCalledWith('/audit-logs/stats');
    expect(response.data).toEqual(mockData);
  });

  it('exportAuditLogs calls /audit-logs/export with blob responseType', async () => {
    const mockBlob = new Blob();
    apiClient.get.mockResolvedValueOnce({ data: mockBlob });

    const params = { start: 'date' };
    const response = await auditApi.exportAuditLogs(params);

    expect(apiClient.get).toHaveBeenCalledWith('/audit-logs/export', {
      params,
      responseType: 'blob',
    });
    expect(response.data).toEqual(mockBlob);
  });
});
