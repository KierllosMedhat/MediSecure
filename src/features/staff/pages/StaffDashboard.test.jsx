import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import StaffDashboard from './StaffDashboard';
import * as authHooks from '../../auth/hooks/useAuth';

vi.mock('../../auth/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

describe('StaffDashboard', () => {
  it('renders dashboard with stats and widgets', () => {
    authHooks.useAuth.mockReturnValue({ user: { first_name: 'Admin' } });
    
    render(
      <MemoryRouter>
        <StaffDashboard />
      </MemoryRouter>
    );

    expect(screen.getByText('Staff Dashboard')).toBeInTheDocument();
    expect(screen.getByText(/Welcome back, Admin/i)).toBeInTheDocument();
    expect(screen.getByText("Today's Appointments")).toBeInTheDocument();
    expect(screen.getByText('Active Patients')).toBeInTheDocument();
    expect(screen.getByText('Pending Records')).toBeInTheDocument();
    expect(screen.getByText('Unread Notifications')).toBeInTheDocument();
  });
});
