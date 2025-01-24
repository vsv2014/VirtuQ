import { api } from '@/shared/services/api';
import type { ApiResponse } from '@/shared/types';
import type { AuthResponse, LoginCredentials, SignupData } from './types';

export const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/login', credentials);
    const { token, user } = response.data.data;
    localStorage.setItem('token', token);
    return { token, user };
  },

  signup: async (data: SignupData): Promise<AuthResponse> => {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/signup', data);
    const { token, user } = response.data.data;
    localStorage.setItem('token', token);
    return { token, user };
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
    localStorage.removeItem('token');
  },

  sendOtp: async (phone: string): Promise<void> => {
    await api.post<ApiResponse<void>>('/auth/send-otp', { phone });
  },

  verifyOtp: async (phone: string, otp: string): Promise<boolean> => {
    const response = await api.post<ApiResponse<{ valid: boolean }>>('/auth/verify-otp', { phone, otp });
    return response.data.data.valid;
  },

  getProfile: async (): Promise<AuthResponse> => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No token found');
    
    const response = await api.get<ApiResponse<AuthResponse>>('/auth/profile');
    return response.data.data;
  }
};
