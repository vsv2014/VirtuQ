import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Phone, ArrowRight, Clock } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

export default function LoginSignup() {
  const navigate = useNavigate();
  const { sendOTP, verifyOTP, error: authError, isAuthenticated } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showOTP, setShowOTP] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate(-1); // Go back to previous page
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (authError) {
      setError(authError);
      setIsLoading(false);
    }
  }, [authError]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!termsAccepted) {
      setError('Please accept the terms and conditions');
      return;
    }
    if (phoneNumber.length !== 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    try {
      setIsLoading(true);
      await sendOTP(phoneNumber);
      setShowOTP(true);
      setCountdown(30);
      setError('');
    } catch (err) {
      // Error is handled by auth context
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const otpString = otp.join('');
    if (otpString.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    try {
      setIsLoading(true);
      await verifyOTP(phoneNumber, otpString);
      // On success, useEffect will handle navigation
    } catch (err) {
      // Error is handled by auth context
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPChange = (index: number, value: string) => {
    if (value.length > 1) return; // Only allow single digits
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleResendOTP = async () => {
    if (countdown > 0) return;
    
    try {
      setIsLoading(true);
      await sendOTP(phoneNumber);
      setCountdown(30);
      setError('');
    } catch (err) {
      // Error is handled by auth context
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      {!showOTP ? (
        <form onSubmit={handlePhoneSubmit} className="space-y-6">
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
              Mobile Number
            </label>
            <div className="mt-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Phone className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="tel"
                id="phone"
                name="phone"
                pattern="[0-9]{10}"
                maxLength={10}
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter 10-digit mobile number"
                required
              />
            </div>
          </div>

          <div className="flex items-center">
            <input
              id="terms"
              type="checkbox"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="terms" className="ml-2 block text-sm text-gray-900">
              I accept the <a href="/terms" className="text-blue-600 hover:text-blue-500">terms and conditions</a>
            </label>
          </div>

          {error && (
            <div className="text-red-600 text-sm">{error}</div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isLoading ? 'Sending OTP...' : (
              <>
                Continue <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </button>
        </form>
      ) : (
        <form onSubmit={handleOTPSubmit} className="space-y-6">
          <div>
            <label htmlFor="otp-0" className="block text-sm font-medium text-gray-700">
              Enter OTP sent to {phoneNumber}
            </label>
            <div className="mt-1 flex space-x-2">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  type="text"
                  id={`otp-${index}`}
                  pattern="[0-9]"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOTPChange(index, e.target.value)}
                  className="w-12 h-12 text-center border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              ))}
            </div>
          </div>

          {error && (
            <div className="text-red-600 text-sm">{error}</div>
          )}

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={handleResendOTP}
              disabled={countdown > 0 || isLoading}
              className="text-sm text-blue-600 hover:text-blue-500 disabled:text-gray-400 flex items-center"
            >
              <Clock className="mr-1 h-4 w-4" />
              {countdown > 0 ? `Resend OTP in ${countdown}s` : 'Resend OTP'}
            </button>

            <button
              type="submit"
              disabled={isLoading}
              className="flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isLoading ? 'Verifying...' : (
                <>
                  Verify OTP <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}