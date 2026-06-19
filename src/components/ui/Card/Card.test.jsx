import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Card from './Card';

describe('Card', () => {
  it('renders children correctly', () => {
    render(<Card><div data-testid="child">Body Content</div></Card>);
    expect(screen.getByTestId('child')).toHaveTextContent('Body Content');
  });

  it('renders title and subtitle when provided', () => {
    render(<Card title="Test Title" subtitle="Test Subtitle">Body</Card>);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test Subtitle')).toBeInTheDocument();
  });

  it('renders actions when provided', () => {
    render(<Card actions={<button>Action Btn</button>}>Body</Card>);
    expect(screen.getByRole('button', { name: /Action Btn/i })).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<Card className="custom-card">Body</Card>);
    expect(container.firstChild).toHaveClass('card custom-card');
  });
});
