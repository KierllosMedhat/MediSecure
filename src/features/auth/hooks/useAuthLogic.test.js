import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useLoginLogic, useSignUpLogic, useForgotPasswordLogic, useResetPasswordLogic } from './useAuthLogic';
import * as useAuthHook from './useAuth';
import authApi from '../../../api/services/authService';

vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
  useLocation: () => ({ state: null }),
}));

vi.mock('../../../api/services/authService', () => ({
  default: {
    register: vi.fn(),
    forgotPassword: vi.fn(),
    verifyOtp: vi.fn(),
    resetPassword: vi.fn(),
  }
}));

vi.mock('./useAuth', () => ({
  useAuth: vi.fn(),
}));

describe('useAuthLogic Hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useLoginLogic', () => {
    it('sets error if fields are empty', async () => {
      useAuthHook.useAuth.mockReturnValue({ login: vi.fn() });
      const { result } = renderHook(() => useLoginLogic());

      await act(async () => {
        await result.current.handleSubmit({ preventDefault: vi.fn() });
      });

      expect(result.current.error).toBe('Please enter your email and password.');
    });

    it('calls login on submit', async () => {
      const loginMock = vi.fn().mockResolvedValue({ user: { role: 'PATIENT' } });
      useAuthHook.useAuth.mockReturnValue({ login: loginMock });
      
      const { result } = renderHook(() => useLoginLogic());

      act(() => {
        result.current.setEmail('test@test.com');
        result.current.setPassword('password');
      });

      await act(async () => {
        await result.current.handleSubmit({ preventDefault: vi.fn() });
      });

      expect(loginMock).toHaveBeenCalled();
    });
  });

  describe('useSignUpLogic', () => {
    it('sets error if name is empty', async () => {
      const { result } = renderHook(() => useSignUpLogic());

      await act(async () => {
        await result.current.handleSubmit({ preventDefault: vi.fn() });
      });

      expect(result.current.error).toBe('Please enter your first and last name.');
    });

    it('calls register on valid submit', async () => {
      authApi.register.mockResolvedValueOnce({});
      const { result } = renderHook(() => useSignUpLogic());

      act(() => {
        result.current.setFirstName('John');
        result.current.setLastName('Doe');
        result.current.setEmail('test@test.com');
        result.current.setPassword('password123');
      });

      await act(async () => {
        await result.current.handleSubmit({ preventDefault: vi.fn() });
      });

      expect(authApi.register).toHaveBeenCalled();
    });
  });

  describe('useForgotPasswordLogic', () => {
    it('handles send OTP flow', async () => {
      authApi.forgotPassword.mockResolvedValueOnce({});
      const { result } = renderHook(() => useForgotPasswordLogic());

      act(() => {
        result.current.setEmail('test@test.com');
      });

      await act(async () => {
        await result.current.handleSendOtp({ preventDefault: vi.fn() });
      });

      expect(authApi.forgotPassword).toHaveBeenCalledWith('test@test.com');
      expect(result.current.step).toBe(2);
    });

    it('handles verify OTP flow', async () => {
      authApi.verifyOtp.mockResolvedValueOnce({});
      const { result } = renderHook(() => useForgotPasswordLogic());

      act(() => {
        result.current.setEmail('test@test.com');
        result.current.setOtp('123456');
      });

      await act(async () => {
        await result.current.handleVerifyOtp({ preventDefault: vi.fn() });
      });

      expect(authApi.verifyOtp).toHaveBeenCalledWith('test@test.com', '123456');
    });
  });

  describe('useResetPasswordLogic', () => {
    it('sets error on password mismatch', async () => {
      const { result } = renderHook(() => useResetPasswordLogic());

      act(() => {
        result.current.setNewPassword('password123');
        result.current.setConfirmPassword('password456');
      });

      await act(async () => {
        await result.current.handleSubmit({ preventDefault: vi.fn() });
      });

      expect(result.current.error).toBe('Passwords do not match.');
    });
  });
});
