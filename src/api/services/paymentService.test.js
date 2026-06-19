import { describe, it, expect, vi, beforeEach } from 'vitest';
import paymentApi from './paymentService';
import apiClient from '../apiClient';

vi.mock('../apiClient', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  }
}));

describe('paymentService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getPaymentHistory calls /payments', async () => {
    const mockData = [{ id: 1 }];
    apiClient.get.mockResolvedValueOnce({ data: mockData });

    const response = await paymentApi.getPaymentHistory();

    expect(apiClient.get).toHaveBeenCalledWith('/payments');
    expect(response.data).toEqual(mockData);
  });

  it('getOutstandingBalance calls /payments/balance', async () => {
    const mockData = { balance: 100 };
    apiClient.get.mockResolvedValueOnce({ data: mockData });

    const response = await paymentApi.getOutstandingBalance();

    expect(apiClient.get).toHaveBeenCalledWith('/payments/balance');
    expect(response.data).toEqual(mockData);
  });

  it('payWithFawry calls POST /payments/fawry', async () => {
    const mockData = { payment_id: 1 };
    apiClient.post.mockResolvedValueOnce({ data: mockData });

    const payload = { fawry_code: '123', amount: 100, currency: 'EGP', payment_type: 'CONSULTATION' };
    const response = await paymentApi.payWithFawry(payload);

    expect(apiClient.post).toHaveBeenCalledWith('/payments/fawry', payload);
    expect(response.data).toEqual(mockData);
  });

  it('payWithCard calls POST /payments/card', async () => {
    const mockData = { payment_id: 1 };
    apiClient.post.mockResolvedValueOnce({ data: mockData });

    const payload = { card_token: 'abc', cvv: '123', amount: 100, currency: 'EGP', payment_type: 'CONSULTATION' };
    const response = await paymentApi.payWithCard(payload);

    expect(apiClient.post).toHaveBeenCalledWith('/payments/card', payload);
    expect(response.data).toEqual(mockData);
  });

  it('getPaymentStatus calls /payments/:id/status', async () => {
    const mockData = { status: 'PAID' };
    apiClient.get.mockResolvedValueOnce({ data: mockData });

    const response = await paymentApi.getPaymentStatus(1);

    expect(apiClient.get).toHaveBeenCalledWith('/payments/1/status');
    expect(response.data).toEqual(mockData);
  });

  it('getReceipt calls /payments/:id/receipt', async () => {
    const mockData = { receipt_url: 'url' };
    apiClient.get.mockResolvedValueOnce({ data: mockData });

    const response = await paymentApi.getReceipt(1);

    expect(apiClient.get).toHaveBeenCalledWith('/payments/1/receipt');
    expect(response.data).toEqual(mockData);
  });
});
