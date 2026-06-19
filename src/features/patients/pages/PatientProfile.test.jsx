import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import PatientProfile from './PatientProfile';
import * as profileHooks from '../hooks/usePatientProfile';

vi.mock('../hooks/usePatientProfile', () => ({
  default: vi.fn(),
}));

describe('PatientProfile', () => {
  const mockHook = {
    profile: { first_name: 'Alice', last_name: 'Smith', email: 'alice@test.com' },
    formData: { first_name: 'Alice', last_name: 'Smith', email: 'alice@test.com' },
    isEditing: false,
    errors: {},
    loading: false,
    saving: false,
    saveSuccess: false,
    saveError: null,
    toggleEdit: vi.fn(),
    handleChange: vi.fn(),
    handleSave: vi.fn(),
  };

  it('renders loading state', () => {
    profileHooks.default.mockReturnValue({ ...mockHook, loading: true });
    render(<PatientProfile />);
    expect(screen.getByText('Loading profile…')).toBeInTheDocument();
  });

  it('renders profile in view mode', () => {
    profileHooks.default.mockReturnValue(mockHook);
    render(<PatientProfile />);

    expect(screen.getByText('Alice Smith')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Alice')).toHaveAttribute('readonly');
    expect(screen.getByRole('button', { name: /Edit Profile/i })).toBeInTheDocument();
  });

  it('renders profile in edit mode and allows saving', () => {
    profileHooks.default.mockReturnValue({ ...mockHook, isEditing: true });
    render(<PatientProfile />);

    expect(screen.getByDisplayValue('Alice')).not.toHaveAttribute('readonly');
    const saveBtn = screen.getByRole('button', { name: /Save Changes/i });
    expect(saveBtn).toBeInTheDocument();

    fireEvent.click(saveBtn);
    expect(mockHook.handleSave).toHaveBeenCalled();
  });

  it('displays success and error messages', () => {
    profileHooks.default.mockReturnValue({
      ...mockHook,
      saveSuccess: true,
      saveError: 'Update failed',
    });
    render(<PatientProfile />);

    expect(screen.getByText('Profile updated successfully.')).toBeInTheDocument();
    expect(screen.getByText('Update failed')).toBeInTheDocument();
  });
});
