import { useState } from 'react';

declare global {
  interface Window {
    gtag?: (command: string, event: string, params?: Record<string, string>) => void;
  }
}

interface UseNewsletterResult {
  subscribe: (email: string) => Promise<void>;
  unsubscribe: (email: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  success: boolean;
}

export function useNewsletter(): UseNewsletterResult {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const subscribe = async (email: string) => {
    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock API response
      if (Math.random() > 0.9) {
        throw new Error('Subscription failed. Please try again.');
      }

      // Simulate checking for existing subscription
      const isAlreadySubscribed = Math.random() > 0.9;
      if (isAlreadySubscribed) {
        throw new Error('This email is already subscribed to our newsletter.');
      }

      setSuccess(true);
      
      // Track successful subscription
      if (window.gtag) {
        window.gtag('event', 'newsletter_subscription', {
          event_category: 'engagement',
          event_label: 'footer_form'
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to subscribe. Please try again.');
      setSuccess(false);
    } finally {
      setIsLoading(false);
    }
  };

  const unsubscribe = async (email: string) => {
    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccess(true);
    } catch (err) {
      setError('Failed to unsubscribe. Please try again.');
      setSuccess(false);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    subscribe,
    unsubscribe,
    isLoading,
    error,
    success
  };
}
