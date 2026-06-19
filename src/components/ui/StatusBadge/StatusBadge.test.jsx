import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import StatusBadge from './StatusBadge';

describe('StatusBadge Component', () => {
  it('renders known status correctly', () => {
    render(<StatusBadge status="SCHEDULED" />);
    const badge = screen.getByText('Scheduled');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('status-badge', 'status-badge--info');
  });

  it('renders another known status correctly', () => {
    render(<StatusBadge status="FAILED" />);
    const badge = screen.getByText('Failed');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('status-badge--danger');
  });

  it('falls back gracefully for unknown status', () => {
    render(<StatusBadge status="UNKNOWN_STATUS" />);
    const badge = screen.getByText('UNKNOWN_STATUS');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('status-badge--muted');
  });

  it('applies custom className', () => {
    render(<StatusBadge status="COMPLETED" className="my-custom-badge" />);
    const badge = screen.getByText('Completed');
    expect(badge).toHaveClass('my-custom-badge', 'status-badge--success');
  });
});
