import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import DashboardLayout from './DashboardLayout';

vi.mock('../components/layout/Sidebar/Sidebar', () => ({
  default: () => <div data-testid="sidebar">Sidebar Mock</div>
}));

vi.mock('../components/layout/Header/Header', () => ({
  default: () => <div data-testid="header">Header Mock</div>
}));

describe('DashboardLayout', () => {
  it('renders Sidebar, Header, and Outlet content', () => {
    render(
      <MemoryRouter>
        <Routes>
          <Route path="/" element={<DashboardLayout />}>
            <Route index element={<div data-testid="dashboard-child">Dashboard Child</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('dashboard-child')).toBeInTheDocument();
  });
});
