import { createContext, useContext } from 'react';
import type { Address, User } from '../types';

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

export interface OtpRequestResult {
  sent: boolean;
  isNewUser: boolean;
  expiresInSeconds: number;
  /** Only returned outside production so the flow is testable without SMS. */
  devCode?: string;
}

export interface AuthContextValue {
  user: User | null;
  token: string | null;
  status: AuthStatus;
  isAuthenticated: boolean;
  error: string | null;
  clearError: () => void;
  requestOtp: (phone: string) => Promise<OtpRequestResult>;
  verifyOtp: (phone: string, code: string) => Promise<User>;
  logout: () => void;
  updateProfile: (patch: { name?: string; email?: string }) => Promise<void>;
  addAddress: (address: Omit<Address, 'id'>) => Promise<Address[]>;
  updateAddress: (id: string, patch: Partial<Address>) => Promise<Address[]>;
  removeAddress: (id: string) => Promise<Address[]>;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
