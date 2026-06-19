import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import ResetPasswordPage from './ResetPasswordPage';
import * as authHooks from '../hooks/useAuthLogic';

vi.mock('../hooks/useAuthLogic', () => ({
  useResetPasswordLogic: vi.fn(),
}));

describe('ResetPasswordPage', () => {
  const mockLogic = {
    newPassword: '',
    setNewPassword: vi.fn(),
    confirmPassword: '',
    setConfirmPassword: vi.fn(),
    error: '',
    success: '',
    isSubmitting: false,
    isValidLink: true,
    handleSubmit: vi.fn((e) => e.preventDefault()),
  };

  it('renders form when link is valid', () => {
    authHooks.useResetPasswordLogic.mockReturnValue(mockLogic);
    render(
      <MemoryRouter>
        <ResetPasswordPage />
      </MemoryRouter>
    );

    expect(screen.getByLabelText(/New Password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Confirm Password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Reset Password/i })).toBeInTheDocument();
  });

  it('renders invalid link state', () => {
    authHooks.useResetPasswordLogic.mockReturnValue({ ...mockLogic, isValidLink: false });
    render(
      <MemoryRouter>
        <ResetPasswordPage />
      </MemoryRouter>
    );

    expect(screen.getByText(/invalid or has expired/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/New Password/i)).not.toBeInTheDocument();
  });

  it('calls handleSubmit on form submit', () => {
    authHooks.useResetPasswordLogic.mockReturnValue(mockLogic);
    render(
      <MemoryRouter>
        <ResetPasswordPage />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: /Reset Password/i }));
    expect(mockLogic.handleSubmit).toHaveBeenCalled();
  });
});
