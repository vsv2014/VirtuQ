import axios from 'axios';
import { getToken } from './authToken';

/**
 * Single axios instance for the app.
 * `baseURL: '/api'` means calls hit the Vite dev-server proxy in development
 * and same-origin `/api` in production — previously there was no baseURL and no
 * proxy, so every request returned the SPA's index.html.
 */
export const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/** Normalises API/transport errors into a message safe to show a user. */
export function getErrorMessage(
  error: unknown,
  fallback = 'Something went wrong. Please try again.',
): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as
      { message?: string; details?: Record<string, string> } | undefined;

    if (data?.details) {
      return Object.values(data.details).join(' ');
    }
    if (data?.message) return data.message;
    if (!error.response) return 'Network error — check your connection.';
  }
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

export { axios };
