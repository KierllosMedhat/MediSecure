import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import Sidebar from './Sidebar';
import * as useAuthHook from '../../../features/auth/hooks/useAuth';

vi.mock('../../../features/auth/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

const renderSidebar = (role = 'PATIENT') => {
  const logoutMock = vi.fn();
  useAuthHook.useAuth.mockReturnValue({
    user: { role },
    logout: logoutMock,
  });

  render(
    <MemoryRouter>
      <Sidebar />
    </MemoryRouter>
  );

  return { logoutMock };
};

describe('Sidebar', () => {
  it('renders patient links when role is PATIENT', () => {
    renderSidebar('PATIENT');
    expect(screen.getByText('My Profile')).toBeInTheDocument();
    expect(screen.queryByText('Staff Management')).not.toBeInTheDocument();
  });

  it('renders staff links when role is DOCTOR', () => {
    renderSidebar('DOCTOR');
    expect(screen.queryByText('My Profile')).not.toBeInTheDocument();
    expect(screen.getByText('Appointments')).toBeInTheDocument();
    expect(screen.queryByText('Staff Management')).not.toBeInTheDocument();
  });

  it('renders admin links when role is ADMIN', () => {
    renderSidebar('ADMIN');
    expect(screen.getByText('Administration')).toBeInTheDocument();
    expect(screen.getByText('Staff Management')).toBeInTheDocument();
    expect(screen.getByText('Audit Logs')).toBeInTheDocument();
  });

  it('calls logout on logout button click', () => {
    const { logoutMock } = renderSidebar('PATIENT');
    fireEvent.click(screen.getByRole('button', { name: /Log Out/i }));
    expect(logoutMock).toHaveBeenCalled();
  });
});
