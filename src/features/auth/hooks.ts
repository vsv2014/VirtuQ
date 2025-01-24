import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from './context';
import { authService } from './services';
import type { LoginCredentials, SignupData } from './types';

export const useAuth = () => {
  const navigate = useNavigate();
  const { state: { user, isAuthenticated, isLoading, error }, dispatch } = useAuthContext();

  const login = useCallback(async (credentials: LoginCredentials) => {
    try {
      dispatch({ type: 'AUTH_START' });
      const response = await authService.login(credentials);
      dispatch({ type: 'AUTH_SUCCESS', payload: response });
      navigate('/');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      dispatch({ type: 'AUTH_ERROR', payload: { message: errorMessage } });
    }
  }, [dispatch, navigate]);

  const signup = useCallback(async (data: SignupData) => {
    try {
      dispatch({ type: 'AUTH_START' });
      const response = await authService.signup(data);
      dispatch({ type: 'AUTH_SUCCESS', payload: response });
      navigate('/');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      dispatch({ type: 'AUTH_ERROR', payload: { message: errorMessage } });
    }
  }, [dispatch, navigate]);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
      dispatch({ type: 'LOGOUT' });
      navigate('/auth');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Logout failed:', errorMessage);
    }
  }, [dispatch, navigate]);

  const sendOtp = useCallback(async (phone: string) => {
    try {
      await authService.sendOtp(phone);
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      dispatch({ type: 'AUTH_ERROR', payload: { message: errorMessage } });
      return false;
    }
  }, [dispatch]);

  const verifyOtp = useCallback(async (phone: string, otp: string) => {
    try {
      return await authService.verifyOtp(phone, otp);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      dispatch({ type: 'AUTH_ERROR', payload: { message: errorMessage } });
      return false;
    }
  }, [dispatch]);

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    signup,
    logout,
    sendOtp,
    verifyOtp
  };
};
