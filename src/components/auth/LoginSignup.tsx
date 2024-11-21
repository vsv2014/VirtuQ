import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Phone, ArrowRight, Clock } from 'lucide-react';

export function LoginSignup() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showOTP, setShowOTP] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!termsAccepted) {
      setError('Please accept the terms and conditions');
      return;
    }
    if (phoneNumber.length !== 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }
    setError('');
    setShowOTP(true);
    setCountdown(60);
    // Here you would typically make an API call to send OTP
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const otpValue = otp.join('');
    if (otpValue.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }
    // Here you would typically verify OTP with API
    console.log('Verifying OTP:', otpValue);
  };

  const handleResendOTP = () => {
    setCountdown(60);
    // Here you would typically make an API call to resend OTP
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-sm"
      >
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Welcome to TryNStyle</h2>
          <p className="mt-2 text-sm text-gray-600">
            {showOTP ? 'Verify your mobile number' : 'Login/Signup with your mobile number'}
          </p>
        </div>

        {!showOTP ? (
          <form onSubmit={handlePhoneSubmit} className="mt-8 space-y-6">
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Mobile Number
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">+91</span>
                </div>
                <input
                  type="tel"
                  id="phone"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  className="block w-full pl-12 pr-4 py-3 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Enter your mobile number"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            </div>

            <div className="flex items-start">
              <input
                id="terms"
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
              />
              <label htmlFor="terms" className="ml-2 block text-sm text-gray-600">
                By continuing, I agree to the{' '}
                <Link to="/terms" className="text-purple-600 hover:text-purple-500">
                  Terms & Conditions
                </Link>
              </label>
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <button
              type="submit"
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              Send OTP
              <ArrowRight className="ml-2 h-5 w-5" />
            </button>
          </form>
        ) : (
          <form onSubmit={handleOtpSubmit} className="mt-8 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Enter 6-digit OTP sent to +91 {phoneNumber}
              </label>
              <div className="mt-4 flex justify-between space-x-2">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    className="w-12 h-12 text-center border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500 text-lg"
                  />
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={handleResendOTP}
                disabled={countdown > 0}
                className={`text-sm ${
                  countdown > 0 ? 'text-gray-400' : 'text-purple-600 hover:text-purple-500'
                }`}
              >
                {countdown > 0 ? (
                  <span className="flex items-center">
                    <Clock className="mr-1 h-4 w-4" />
                    Resend OTP in {countdown}s
                  </span>
                ) : (
                  'Resend OTP'
                )}
              </button>
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <button
              type="submit"
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              Verify OTP
              <ArrowRight className="ml-2 h-5 w-5" />
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}