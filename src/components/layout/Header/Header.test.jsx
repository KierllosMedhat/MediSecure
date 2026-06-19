import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import Header from './Header';
import * as useAuthHook from '../../../features/auth/hooks/useAuth';
import notificationApi from '../../../api/services/notificationService';

vi.mock('../../../features/auth/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

vi.mock('../../../api/services/notificationService', () => ({
  default: {
    getUnreadCount: vi.fn(),
  }
}));

describe('Header', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches unread count and displays badge if authenticated and count > 0', async () => {
    useAuthHook.useAuth.mockReturnValue({
      isAuthenticated: true,
      user: { name: 'Alice' }
    });
    notificationApi.getUnreadCount.mockResolvedValueOnce({ data: { unread_count: 5 } });

    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );

    // Initial render might not have it until effect finishes
    await waitFor(() => {
      expect(screen.getByText('5')).toBeInTheDocument();
    });

    expect(screen.getByText('A')).toBeInTheDocument(); // Avatar initial
    expect(notificationApi.getUnreadCount).toHaveBeenCalledTimes(1);
  });

  it('does not display badge if count is 0', async () => {
    useAuthHook.useAuth.mockReturnValue({
      isAuthenticated: true,
      user: { name: 'Alice' }
    });
    notificationApi.getUnreadCount.mockResolvedValueOnce({ data: { unread_count: 0 } });

    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(notificationApi.getUnreadCount).toHaveBeenCalledTimes(1);
    });

    expect(screen.queryByText('0')).not.toBeInTheDocument();
  });

  it('does not fetch count if unauthenticated', async () => {
    useAuthHook.useAuth.mockReturnValue({
      isAuthenticated: false,
      user: null
    });

    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );

    expect(notificationApi.getUnreadCount).not.toHaveBeenCalled();
    expect(screen.getByText('U')).toBeInTheDocument(); // Default avatar initial
  });
});
