import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import AuthLayout from './AuthLayout';

describe('AuthLayout', () => {
  it('renders Outlet content centered inside a card container', () => {
    render(
      <MemoryRouter>
        <Routes>
          <Route path="/" element={<AuthLayout />}>
            <Route index element={<div data-testid="auth-child">Auth Child</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByTestId('auth-child')).toBeInTheDocument();
  });
});
