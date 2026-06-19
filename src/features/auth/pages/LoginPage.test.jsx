import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import LoginPage from './LoginPage';
import * as authLogic from '../hooks/useAuthLogic';

// Mock the hook so we don't need full context/API setup
vi.mock('../hooks/useAuthLogic', () => ({
  useLoginLogic: vi.fn(),
}));

describe('LoginPage Component', () => {
  it('renders login form correctly', () => {
    authLogic.useLoginLogic.mockReturnValue({
      email: '',
      setEmail: vi.fn(),
      password: '',
      setPassword: vi.fn(),
      error: null,
      isSubmitting: false,
      handleSubmit: vi.fn(),
    });

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    // Check headings and text
    expect(screen.getByRole('heading', { name: /welcome back/i })).toBeInTheDocument();
    
    // Check inputs
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    
    // Check submit button
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
    
    // Check links
    expect(screen.getByRole('link', { name: /sign up/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /forgot password\?/i })).toBeInTheDocument();
  });

  it('displays error message when error is provided', () => {
    authLogic.useLoginLogic.mockReturnValue({
      email: '',
      setEmail: vi.fn(),
      password: '',
      setPassword: vi.fn(),
      error: 'Invalid credentials',
      isSubmitting: false,
      handleSubmit: vi.fn(),
    });

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    const errorMessage = screen.getByRole('alert');
    expect(errorMessage).toBeInTheDocument();
    expect(errorMessage).toHaveTextContent(/invalid credentials/i);
  });

  it('shows loading state on submit button when isSubmitting is true', () => {
    authLogic.useLoginLogic.mockReturnValue({
      email: 'test@test.com',
      setEmail: vi.fn(),
      password: 'password123',
      setPassword: vi.fn(),
      error: null,
      isSubmitting: true,
      handleSubmit: vi.fn(),
    });

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    const submitButton = screen.getByRole('button');
    expect(submitButton).toBeDisabled();
    expect(submitButton).toHaveClass('btn--loading');
  });

  it('calls handleSubmit when form is submitted', () => {
    const mockHandleSubmit = vi.fn((e) => e.preventDefault());
    authLogic.useLoginLogic.mockReturnValue({
      email: 'test@test.com',
      setEmail: vi.fn(),
      password: 'password123',
      setPassword: vi.fn(),
      error: null,
      isSubmitting: false,
      handleSubmit: mockHandleSubmit,
    });

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    const submitButton = screen.getByRole('button', { name: /login/i });
    fireEvent.click(submitButton);

    expect(mockHandleSubmit).toHaveBeenCalledTimes(1);
  });
});
