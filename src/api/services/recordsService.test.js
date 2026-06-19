import { describe, it, expect, vi, beforeEach } from 'vitest';
import recordsApi from './recordsService';
import apiClient from '../apiClient';

vi.mock('../apiClient', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  }
}));

describe('recordsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getRecords calls /patients/:id/records', async () => {
    const mockData = [{ id: 1 }];
    apiClient.get.mockResolvedValueOnce({ data: mockData });

    const params = { record_type: 'DIAGNOSIS' };
    const response = await recordsApi.getRecords(1, params);

    expect(apiClient.get).toHaveBeenCalledWith('/patients/1/records', { params });
    expect(response.data).toEqual(mockData);
  });

  it('getRecordById calls /patients/:id/records/:rid', async () => {
    const mockData = { id: 1 };
    apiClient.get.mockResolvedValueOnce({ data: mockData });

    const response = await recordsApi.getRecordById(1, 2);

    expect(apiClient.get).toHaveBeenCalledWith('/patients/1/records/2');
    expect(response.data).toEqual(mockData);
  });

  it('createRecord calls POST /records', async () => {
    const mockData = { id: 1 };
    apiClient.post.mockResolvedValueOnce({ data: mockData });

    const payload = { patient_id: 1, title: 'Title' };
    const response = await recordsApi.createRecord(payload);

    expect(apiClient.post).toHaveBeenCalledWith('/records', payload);
    expect(response.data).toEqual(mockData);
  });

  it('getDocumentsByRecord calls /records/:id/documents', async () => {
    const mockData = [{ id: 1 }];
    apiClient.get.mockResolvedValueOnce({ data: mockData });

    const response = await recordsApi.getDocumentsByRecord(1);

    expect(apiClient.get).toHaveBeenCalledWith('/records/1/documents');
    expect(response.data).toEqual(mockData);
  });

  it('uploadDocument calls POST /records/:id/documents with formData', async () => {
    const mockData = { id: 1 };
    apiClient.post.mockResolvedValueOnce({ data: mockData });

    const formData = new FormData();
    const response = await recordsApi.uploadDocument(1, formData);

    expect(apiClient.post).toHaveBeenCalledWith('/records/1/documents', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    expect(response.data).toEqual(mockData);
  });

  it('downloadDocument calls /documents/:id/download with blob responseType', async () => {
    const mockBlob = new Blob();
    apiClient.get.mockResolvedValueOnce({ data: mockBlob });

    const response = await recordsApi.downloadDocument(1);

    expect(apiClient.get).toHaveBeenCalledWith('/documents/1/download', {
      responseType: 'blob',
    });
    expect(response.data).toEqual(mockBlob);
  });
});
