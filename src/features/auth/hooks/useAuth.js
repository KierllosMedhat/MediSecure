/**
 * useAuth — convenience hook to consume AuthContext.
 * Separated from AuthContext.jsx to satisfy React fast-refresh
 * (files should export only components OR only hooks/constants).
 *
 * Owner: Abanob
 */
import { useContext } from 'react';
import AuthContext from '../context/AuthContext';

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
