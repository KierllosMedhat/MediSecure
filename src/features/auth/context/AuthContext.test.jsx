import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useContext } from 'react';
import AuthContext, { AuthProvider } from './AuthContext';
import authApi from '../../../api/services/authService';

vi.mock('../../../api/services/authService', () => ({
  default: {
    login: vi.fn(),
    logout: vi.fn(),
  }
}));

vi.mock('../../../api/apiClient', () => ({
  setTokens: vi.fn(),
  clearTokens: vi.fn(),
}));

const TestComponent = () => {
  const auth = useContext(AuthContext);
  return (
    <div>
      <div data-testid="auth-status">{auth.isAuthenticated ? 'Logged In' : 'Logged Out'}</div>
      <button onClick={() => auth.login('test@test.com', 'password', 'device1')}>Login</button>
      <button onClick={() => auth.logout()}>Logout</button>
      <button onClick={() => auth.updateUser({ first_name: 'Updated' })}>Update</button>
      {auth.user && <div data-testid="user-name">{auth.user.first_name}</div>}
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.clearAllMocks();
  });

  it('provides initial logged out state when no session exists', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    expect(screen.getByTestId('auth-status')).toHaveTextContent('Logged Out');
  });

  it('provides logged in state when session exists', () => {
    sessionStorage.setItem('user', JSON.stringify({ first_name: 'John' }));
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    expect(screen.getByTestId('auth-status')).toHaveTextContent('Logged In');
    expect(screen.getByTestId('user-name')).toHaveTextContent('John');
  });

  it('handles login flow', async () => {
    authApi.login.mockResolvedValueOnce({
      data: {
        access_token: 'acc',
        refresh_token: 'ref',
        user: { first_name: 'Alice' },
      }
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await act(async () => {
      screen.getByText('Login').click();
    });

    expect(authApi.login).toHaveBeenCalledWith({ email: 'test@test.com', password: 'password', device_id: 'device1' });
    expect(screen.getByTestId('auth-status')).toHaveTextContent('Logged In');
    expect(screen.getByTestId('user-name')).toHaveTextContent('Alice');
    expect(JSON.parse(sessionStorage.getItem('user'))).toEqual({ first_name: 'Alice' });
  });

  it('handles logout flow', async () => {
    sessionStorage.setItem('user', JSON.stringify({ first_name: 'John' }));
    authApi.logout.mockResolvedValueOnce({});

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('auth-status')).toHaveTextContent('Logged In');

    await act(async () => {
      screen.getByText('Logout').click();
    });

    expect(authApi.logout).toHaveBeenCalled();
    expect(screen.getByTestId('auth-status')).toHaveTextContent('Logged Out');
    expect(sessionStorage.getItem('user')).toBeNull();
  });

  it('handles updateUser flow', () => {
    sessionStorage.setItem('user', JSON.stringify({ first_name: 'John', last_name: 'Doe' }));
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    act(() => {
      screen.getByText('Update').click();
    });

    expect(screen.getByTestId('user-name')).toHaveTextContent('Updated');
    expect(JSON.parse(sessionStorage.getItem('user'))).toEqual({ first_name: 'Updated', last_name: 'Doe' });
  });
});
