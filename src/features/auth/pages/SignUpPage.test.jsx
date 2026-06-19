import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import SignUpPage from './SignUpPage';
import * as authHooks from '../hooks/useAuthLogic';

vi.mock('../hooks/useAuthLogic', () => ({
  useSignUpLogic: vi.fn(),
}));

describe('SignUpPage', () => {
  const mockLogic = {
    firstName: '',
    setFirstName: vi.fn(),
    lastName: '',
    setLastName: vi.fn(),
    email: '',
    setEmail: vi.fn(),
    password: '',
    setPassword: vi.fn(),
    patientId: '',
    setPatientId: vi.fn(),
    error: '',
    isSubmitting: false,
    handleSubmit: vi.fn((e) => e.preventDefault()),
  };

  it('renders sign up form correctly', () => {
    authHooks.useSignUpLogic.mockReturnValue(mockLogic);
    render(
      <MemoryRouter>
        <SignUpPage />
      </MemoryRouter>
    );

    expect(screen.getByLabelText(/First Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Last Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Create Account/i })).toBeInTheDocument();
  });

  it('displays error if provided', () => {
    authHooks.useSignUpLogic.mockReturnValue({ ...mockLogic, error: 'Test Error' });
    render(
      <MemoryRouter>
        <SignUpPage />
      </MemoryRouter>
    );

    expect(screen.getByText('Test Error')).toBeInTheDocument();
  });

  it('calls handleSubmit on form submission', () => {
    authHooks.useSignUpLogic.mockReturnValue(mockLogic);
    render(
      <MemoryRouter>
        <SignUpPage />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: /Create Account/i }));
    expect(mockLogic.handleSubmit).toHaveBeenCalled();
  });
});
