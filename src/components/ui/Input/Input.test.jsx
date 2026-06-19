import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Input from './Input';

describe('Input Component', () => {
  it('renders correctly with label', () => {
    render(<Input id="test-input" label="Username" placeholder="Enter username" />);
    const input = screen.getByLabelText(/username/i);
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('placeholder', 'Enter username');
    expect(input).toHaveAttribute('id', 'test-input');
  });

  it('handles value changes', () => {
    render(<Input id="change-input" label="Email" />);
    const input = screen.getByLabelText(/email/i);
    
    fireEvent.change(input, { target: { value: 'test@example.com' } });
    expect(input.value).toBe('test@example.com');
  });

  it('displays helper text when provided', () => {
    render(<Input id="helper-input" helperText="Must be at least 8 characters" />);
    expect(screen.getByText(/must be at least 8 characters/i)).toBeInTheDocument();
  });

  it('displays error text and error styling when error prop is provided', () => {
    render(
      <Input 
        id="error-input" 
        error="This field is required" 
        helperText="Should not be visible" 
      />
    );
    
    // Error message is displayed
    expect(screen.getByText(/this field is required/i)).toBeInTheDocument();
    // Helper text is hidden when error exists
    expect(screen.queryByText(/should not be visible/i)).not.toBeInTheDocument();
    
    // Error class is applied
    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('input-group__field--error');
  });
});
