import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import StaffList from './StaffList';
import staffApi from '../../../api/services/staffService';

vi.mock('../../../api/services/staffService', () => ({
  default: {
    getStaffList: vi.fn(),
  }
}));

describe('StaffList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders staff data from API', async () => {
    const mockStaff = [
      { id: 1, full_name: 'Dr. John', role: 'DOCTOR', department: 'Cardiology', hospital_name: 'Test Hospital', license_no: '123', status: 'ENABLED' }
    ];
    staffApi.getStaffList.mockResolvedValueOnce({ data: { results: mockStaff } });

    render(
      <MemoryRouter>
        <StaffList />
      </MemoryRouter>
    );

    expect(screen.getByText('Staff Management')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Dr. John')).toBeInTheDocument();
    });
    expect(screen.getByText('Cardiology')).toBeInTheDocument();
  });

  it('falls back to dummy data if API fails', async () => {
    staffApi.getStaffList.mockRejectedValueOnce(new Error('API failed'));

    render(
      <MemoryRouter>
        <StaffList />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Sara')).toBeInTheDocument(); // Sara Ahmed from DUMMY_STAFF
    });
  });
});
