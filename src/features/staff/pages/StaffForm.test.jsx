import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import StaffForm from './StaffForm';
import staffApi from '../../../api/services/staffService';
import hospitalApi from '../../../api/services/hospitalService';

vi.mock('../../../api/services/staffService', () => ({
  default: {
    getStaffById: vi.fn(),
    createStaff: vi.fn(),
    updateStaff: vi.fn(),
  }
}));

vi.mock('../../../api/services/hospitalService', () => ({
  default: {
    getHospitals: vi.fn(),
  }
}));

describe('StaffForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderForm = (path, initialEntries) => {
    return render(
      <MemoryRouter initialEntries={initialEntries}>
        <Routes>
          <Route path={path} element={<StaffForm />} />
        </Routes>
      </MemoryRouter>
    );
  };

  it('renders create mode and handles submit', async () => {
    hospitalApi.getHospitals.mockResolvedValueOnce({ data: [{ id: 1, name: 'Test Hospital' }] });
    staffApi.createStaff.mockResolvedValueOnce({});

    renderForm('/staff/new', ['/staff/new']);

    expect(screen.getByText('Add New Staff')).toBeInTheDocument();
    
    // Fill required fields
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'test@test.com' } });
    fireEvent.change(screen.getByLabelText(/First Name/i), { target: { value: 'John' } });
    fireEvent.change(screen.getByLabelText(/Last Name/i), { target: { value: 'Doe' } });
    fireEvent.change(screen.getByLabelText(/Phone Number/i), { target: { value: '123' } });
    fireEvent.change(screen.getByLabelText(/Temporary Password/i), { target: { value: 'password123' } });
    
    await waitFor(() => {
      const select = screen.getByLabelText(/Hospital/i);
      fireEvent.change(select, { target: { value: '1' } });
    });
    
    fireEvent.change(screen.getByLabelText(/Department/i), { target: { value: 'CARDIOLOGY' } });
    fireEvent.change(screen.getByLabelText(/License Number/i), { target: { value: 'LIC123' } });

    fireEvent.click(screen.getByRole('button', { name: 'Create Staff' }));

    await waitFor(() => {
      expect(staffApi.createStaff).toHaveBeenCalled();
    });
  });

  it('renders edit mode and loads data', async () => {
    hospitalApi.getHospitals.mockResolvedValueOnce({ data: [{ id: 1, name: 'Test Hospital' }] });
    staffApi.getStaffById.mockResolvedValueOnce({
      data: {
        email: 'edit@test.com',
        first_name: 'Jane',
        last_name: 'Smith',
        role: 'NURSE'
      }
    });

    renderForm('/staff/:id/edit', ['/staff/1/edit']);

    expect(screen.getByText('Edit Staff')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByDisplayValue('edit@test.com')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Jane')).toBeInTheDocument();
    });
  });
});
