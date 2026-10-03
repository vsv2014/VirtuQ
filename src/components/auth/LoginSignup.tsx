import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Phone, ArrowRight, Clock, ArrowLeft } from 'lucide-react';
import type { FormEvent } from 'react';

import { useAuth } from '../../context/useAuth';
import { useToast } from '../../context/useToast';
import { getErrorMessage } from '../../lib/api';

const OTP_LENGTH = 6;
const RESEND_SECONDS = 60;

interface LocationState {
  from?: string;
}

export function LoginSignup() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, requestOtp, verifyOtp, error, clearError } = useAuth();
  const { show } = useToast();

  const from = (location.state as LocationState | null)?.from ?? '/';

  const [phoneNumber, setPhoneNumber] = useState('');
  const [showOTP, setShowOTP] = useState(false);
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [resendAt, setResendAt] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [localError, setLocalError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const inputs = useRef<Array<HTMLInputElement | null>>([]);

  // Already signed in? Bounce to where they were headed.
  useEffect(() => {
    if (isAuthenticated && user) navigate(from, { replace: true });
  }, [isAuthenticated, user, navigate, from]);

  useEffect(() => {
    if (!resendAt) return undefined;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [resendAt]);

  const secondsLeft = resendAt ? Math.max(0, Math.ceil((resendAt - now) / 1000)) : 0;

  const setOtpDigit = (index: number, value: string) => {
    setOtp((current) => {
      const next = [...current];
      next[index] = value;
      return next;
    });
  };

  const handlePhoneSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLocalError('');
    clearError();

    if (!termsAccepted) {
      setLocalError('Please accept the terms and conditions');
      return;
    }
    if (phoneNumber.length !== 10) {
      setLocalError('Please enter a valid 10-digit mobile number');
      return;
    }

    setSubmitting(true);
    try {
      const result = await requestOtp(phoneNumber);
      setShowOTP(true);
      setResendAt(Date.now() + RESEND_SECONDS * 1000);

      // Outside production the API returns the code so the flow is testable.
      if (result.devCode) {
        setOtp(result.devCode.split(''));
        show(`Development OTP: ${result.devCode}`, 'info');
      } else {
        show('OTP sent to your mobile number', 'success');
      }
      setTimeout(() => inputs.current[0]?.focus(), 0);
    } catch (err) {
      setLocalError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    setOtpDigit(index, digit);
    if (digit && index < OTP_LENGTH - 1) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (
    index: number,
    event: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (event.key === 'Backspace' && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handleOtpSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLocalError('');
    clearError();

    const code = otp.join('');
    if (code.length !== OTP_LENGTH) {
      setLocalError(`Please enter the full ${OTP_LENGTH}-digit OTP`);
      return;
    }

    setSubmitting(true);
    try {
      await verifyOtp(phoneNumber, code);
      show('Welcome to TryNStyle!', 'success');
      navigate(from, { replace: true });
    } catch (err) {
      setLocalError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleResendOTP = async () => {
    setLocalError('');
    try {
      const result = await requestOtp(phoneNumber);
      setResendAt(Date.now() + RESEND_SECONDS * 1000);
      if (result.devCode) {
        setOtp(result.devCode.split(''));
        show(`Development OTP: ${result.devCode}`, 'info');
      } else {
        show('A new OTP is on its way', 'success');
      }
    } catch (err) {
      setLocalError(getErrorMessage(err));
    }
  };

  const message = localError || error || '';

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md space-y-8 rounded-xl bg-white p-8 shadow-sm"
      >
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Welcome to TryNStyle</h2>
          <p className="mt-2 text-sm text-gray-600">
            {showOTP
              ? 'Verify your mobile number'
              : 'Login/Signup with your mobile number'}
          </p>
        </div>

        {message ? (
          <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700" role="alert">
            {message}
          </p>
        ) : null}

        {!showOTP ? (
          <form onSubmit={handlePhoneSubmit} className="mt-8 space-y-6" noValidate>
            <div>
              <label htmlFor="phone" className="field-label">
                Mobile Number
              </label>
              <div className="relative mt-1 rounded-md shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <span className="text-gray-500 sm:text-sm">+91</span>
                </div>
                <input
                  id="phone"
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel-national"
                  value={phoneNumber}
                  onChange={(event) =>
                    setPhoneNumber(event.target.value.replace(/\D/g, '').slice(0, 10))
                  }
                  className="field-input pl-12"
                  placeholder="Enter your mobile number"
                  aria-describedby="phone-hint"
                />
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
              </div>
              <p id="phone-hint" className="mt-1 text-xs text-gray-500">
                We’ll send a one-time code to this number.
              </p>
            </div>

            <div className="flex items-start">
              <input
                id="terms"
                type="checkbox"
                checked={termsAccepted}
                onChange={(event) => setTermsAccepted(event.target.checked)}
                className="mt-1 h-4 w-4 rounded border-gray-300 text-purple-600"
              />
              <label htmlFor="terms" className="ml-2 block text-sm text-gray-600">
                By continuing, I agree to the{' '}
                <Link to="/terms" className="text-purple-600 hover:text-purple-500">
                  Terms &amp; Conditions
                </Link>
              </label>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary w-full"
            >
              {submitting ? 'Sending…' : 'Send OTP'}
              <ArrowRight className="ml-2 h-5 w-5" />
            </button>
          </form>
        ) : (
          <form onSubmit={handleOtpSubmit} className="mt-8 space-y-6" noValidate>
            <div>
              <label className="field-label" htmlFor="otp-0">
                Enter 6-digit OTP sent to +91 {phoneNumber}
              </label>
              <div className="mt-4 flex justify-between gap-2">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-${index}`}
                    ref={(element) => {
                      inputs.current[index] = element;
                    }}
                    type="text"
                    inputMode="numeric"
                    autoComplete={index === 0 ? 'one-time-code' : 'off'}
                    maxLength={1}
                    value={digit}
                    aria-label={`Digit ${index + 1} of ${OTP_LENGTH}`}
                    onChange={(event) => handleOtpChange(index, event.target.value)}
                    onKeyDown={(event) => handleOtpKeyDown(index, event)}
                    className="h-12 w-full rounded-md border border-gray-300 text-center text-lg focus:border-purple-500 focus:ring-purple-500"
                  />
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  setShowOTP(false);
                  setOtp(Array(OTP_LENGTH).fill(''));
                  setLocalError('');
                }}
                className="flex items-center text-sm text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="mr-1 h-4 w-4" />
                Change number
              </button>

              <button
                type="button"
                onClick={handleResendOTP}
                disabled={secondsLeft > 0}
                className={`text-sm ${
                  secondsLeft > 0
                    ? 'text-gray-400'
                    : 'text-purple-600 hover:text-purple-500'
                }`}
              >
                {secondsLeft > 0 ? (
                  <span className="flex items-center">
                    <Clock className="mr-1 h-4 w-4" />
                    Resend OTP in {secondsLeft}s
                  </span>
                ) : (
                  'Resend OTP'
                )}
              </button>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary w-full"
            >
              {submitting ? 'Verifying…' : 'Verify OTP'}
              <ArrowRight className="ml-2 h-5 w-5" />
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}
