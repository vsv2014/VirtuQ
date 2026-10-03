import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { Spinner } from './Spinner';

/**
 * Guards routes that require a session. Previously /cart, /checkout and
 * /orders were reachable while logged out and simply blew up on use.
 */
export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { status } = useAuth();
  const location = useLocation();

  if (status === 'loading') {
    return <Spinner label="Checking your session…" />;
  }

  if (status !== 'authenticated') {
    // Remember where they were going so login can send them back.
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
}
