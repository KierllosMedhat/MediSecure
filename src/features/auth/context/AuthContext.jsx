/**
 * Auth Context — stores user state, login/logout helpers.
 * SECURITY: Tokens live in-memory via apiClient helpers.
 * Only non-sensitive user profile data uses sessionStorage.
 *
 * Owner: Abanob
 */
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import authApi from '../../../api/services/authService';
import { setTokens, clearTokens } from '../../../api/apiClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  /* Hydrate user profile from sessionStorage on mount (non-sensitive data) */
  useEffect(() => {
    const storedUser = sessionStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        sessionStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

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

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    logout,
    setUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
