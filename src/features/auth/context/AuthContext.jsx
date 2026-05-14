/**
 * Auth Context — stores user state, login/logout helpers.
 * SECURITY: Tokens live in-memory via apiClient helpers.
 * Only non-sensitive user profile data uses sessionStorage.
 *
 * Owner: Abanob
 */
import { createContext, useState, useCallback } from 'react';
import authApi from '../../../api/services/authService';
import { setTokens, clearTokens } from '../../../api/apiClient';
import { getDashboardPath } from '../roles';

const AuthContext = createContext(null);

/**
 * Hydrate user from sessionStorage (lazy initializer — avoids setState in effect).
 * Returns { user, loading } to initialize both state values synchronously.
 */
function getInitialUser() {
  const storedUser = sessionStorage.getItem('user');
  if (storedUser) {
    try {
      return JSON.parse(storedUser);
    } catch {
      sessionStorage.removeItem('user');
    }
  }
  return null;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getInitialUser);
  const [loading] = useState(false);

  const login = useCallback(async (email, password, deviceId) => {
    const { data } = await authApi.login({ email, password, device_id: deviceId });
    setTokens(data.access_token, data.refresh_token);
    sessionStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
    return data;
  }, []);

  const logout = useCallback(() => {
    authApi.logout().catch(() => {});
    clearTokens();
    sessionStorage.removeItem('user');
    setUser(null);
  }, []);

  /** Merge partial updates into user state + sessionStorage. */
  const updateUser = useCallback((partial) => {
    setUser((prev) => {
      const merged = { ...prev, ...partial };
      sessionStorage.setItem('user', JSON.stringify(merged));
      return merged;
    });
  }, []);

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    logout,
    updateUser,
    getDashboardPath,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthContext;
