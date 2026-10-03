import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { api, getErrorMessage } from '../lib/api';
import { clearToken, getToken, setToken } from '../lib/authToken';
import type { Address, User } from '../types';
import { AuthContext } from './useAuth';
import type { AuthStatus, OtpRequestResult } from './useAuth';

/**
 * Real authentication: phone + OTP against /api/auth, JWT persisted to
 * localStorage and attached to every request by the axios instance.
 *
 * Previously this was a stub that accepted any credentials and hardcoded a
 * fake user, and the login screen never even called it.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(() => getToken());
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<AuthStatus>(() =>
    getToken() ? 'loading' : 'unauthenticated',
  );
  const [error, setError] = useState<string | null>(null);

  // Restore the session on first load.
  useEffect(() => {
    if (!token) {
      setStatus('unauthenticated');
      return;
    }

    let cancelled = false;
    setStatus('loading');

    (async () => {
      try {
        const { data } = await api.get<{ user: User }>('/auth/me');
        if (cancelled) return;
        setUser(data.user);
        setStatus('authenticated');
      } catch {
        if (cancelled) return;
        // Token expired or revoked — drop it instead of looping.
        clearToken();
        setTokenState(null);
        setUser(null);
        setStatus('unauthenticated');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token]);

  const clearError = useCallback(() => setError(null), []);

  const requestOtp = useCallback(async (phone: string) => {
    setError(null);
    try {
      const { data } = await api.post<OtpRequestResult>('/auth/otp/request', { phone });
      return data;
    } catch (err) {
      setError(getErrorMessage(err));
      throw err;
    }
  }, []);

  const verifyOtp = useCallback(async (phone: string, code: string) => {
    setError(null);
    try {
      const { data } = await api.post<{ token: string; user: User }>(
        '/auth/otp/verify',
        { phone, code },
      );
      setToken(data.token);
      setTokenState(data.token);
      setUser(data.user);
      setStatus('authenticated');
      return data.user;
    } catch (err) {
      setError(getErrorMessage(err, 'Could not verify that code'));
      throw err;
    }
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setTokenState(null);
    setUser(null);
    setStatus('unauthenticated');
  }, []);

  const updateProfile = useCallback(
    async (patch: { name?: string; email?: string }) => {
      setError(null);
      const { data } = await api.patch<{ user: User }>('/auth/me', patch);
      setUser(data.user);
    },
    [],
  );

  const addAddress = useCallback(async (address: Omit<Address, 'id'>) => {
    const { data } = await api.post<{ addresses: Address[] }>(
      '/auth/addresses',
      address,
    );
    setUser((current) =>
      current ? { ...current, addresses: data.addresses } : current,
    );
    return data.addresses;
  }, []);

  const updateAddress = useCallback(async (id: string, patch: Partial<Address>) => {
    const { data } = await api.patch<{ addresses: Address[] }>(
      `/auth/addresses/${id}`,
      patch,
    );
    setUser((current) =>
      current ? { ...current, addresses: data.addresses } : current,
    );
    return data.addresses;
  }, []);

  const removeAddress = useCallback(async (id: string) => {
    const { data } = await api.delete<{ addresses: Address[] }>(
      `/auth/addresses/${id}`,
    );
    setUser((current) =>
      current ? { ...current, addresses: data.addresses } : current,
    );
    return data.addresses;
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      status,
      isAuthenticated: status === 'authenticated' && user !== null,
      error,
      clearError,
      requestOtp,
      verifyOtp,
      logout,
      updateProfile,
      addAddress,
      updateAddress,
      removeAddress,
    }),
    [
      user,
      token,
      status,
      error,
      clearError,
      requestOtp,
      verifyOtp,
      logout,
      updateProfile,
      addAddress,
      updateAddress,
      removeAddress,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
