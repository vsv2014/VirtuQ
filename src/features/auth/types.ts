export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  phone: string;
  otp: string;
}

export interface SignupData extends LoginCredentials {
  name: string;
  email: string;
  acceptTerms: boolean;
}

export interface AuthResponse {
  user: User;
  token: string;
}
