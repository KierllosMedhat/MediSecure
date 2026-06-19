import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import ForgotPasswordPage from './ForgotPasswordPage';
import * as authHooks from '../hooks/useAuthLogic';

vi.mock('../hooks/useAuthLogic', () => ({
  useForgotPasswordLogic: vi.fn(),
}));

describe('ForgotPasswordPage', () => {
  const mockLogic = {
    step: 1,
    email: '',
    setEmail: vi.fn(),
    otp: '',
    setOtp: vi.fn(),
    error: '',
    success: '',
    isSubmitting: false,
    handleSendOtp: vi.fn((e) => e.preventDefault()),
    handleVerifyOtp: vi.fn((e) => e.preventDefault()),
  };

  it('renders step 1 (email) correctly', () => {
    authHooks.useForgotPasswordLogic.mockReturnValue(mockLogic);
    render(
      <MemoryRouter>
        <ForgotPasswordPage />
      </MemoryRouter>
    );

    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Send Code/i })).toBeInTheDocument();
  });

  it('renders step 2 (otp) correctly', () => {
    authHooks.useForgotPasswordLogic.mockReturnValue({ ...mockLogic, step: 2, email: 'test@test.com' });
    render(
      <MemoryRouter>
        <ForgotPasswordPage />
      </MemoryRouter>
    );

    expect(screen.getByLabelText(/Verification Code/i)).toBeInTheDocument();
    expect(screen.getByText('test@test.com')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Verify Code/i })).toBeInTheDocument();
  });

  it('calls handleSendOtp on step 1 submit', () => {
    authHooks.useForgotPasswordLogic.mockReturnValue(mockLogic);
    render(
      <MemoryRouter>
        <ForgotPasswordPage />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: /Send Code/i }));
    expect(mockLogic.handleSendOtp).toHaveBeenCalled();
  });
});
