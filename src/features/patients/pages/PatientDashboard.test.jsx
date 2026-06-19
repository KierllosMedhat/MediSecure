import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import PatientDashboard from './PatientDashboard';
import * as authHooks from '../../auth/hooks/useAuth';
import * as dashboardHooks from '../hooks/usePatientDashboard';

vi.mock('../../auth/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

vi.mock('../hooks/usePatientDashboard', () => ({
  default: vi.fn(),
}));

describe('PatientDashboard', () => {
  it('renders loading state', () => {
    authHooks.useAuth.mockReturnValue({ user: { name: 'John Doe' } });
    dashboardHooks.default.mockReturnValue({ loading: true });

    render(
      <MemoryRouter>
        <PatientDashboard />
      </MemoryRouter>
    );

    expect(screen.getByText('Loading your dashboard…')).toBeInTheDocument();
  });

  it('renders dashboard content when loaded', () => {
    authHooks.useAuth.mockReturnValue({ user: { name: 'John Doe' } });
    dashboardHooks.default.mockReturnValue({
      loading: false,
      profile: { patient_id: 'P-123' },
      dashboardData: {
        stats: { total_records: 10, pending_bills_amount: 50 },
        recent_records: [{ id: 1, title: 'Lab Results', date: '2023-01-01', doctor_name: 'Dr. Smith', type: 'Lab' }],
        pending_bills: [],
        recent_activity: [],
      }
    });

    render(
      <MemoryRouter>
        <PatientDashboard />
      </MemoryRouter>
    );

    expect(screen.getByText(/Welcome back, John/i)).toBeInTheDocument();
    expect(screen.getByText(/P-123/i)).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument(); // total records
    expect(screen.getByText('$50')).toBeInTheDocument(); // pending bills
    expect(screen.getByText('Lab Results')).toBeInTheDocument();
  });
});
