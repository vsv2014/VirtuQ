import React from 'react';
import { Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import LoginSignup from '../features/auth/components/LoginSignup';
import { useAuth } from '../context/AuthContext';

export function AuthPage() {
  const { user } = useAuth();
  
  console.log('AuthPage rendering, user:', user);

  // Redirect to home if already logged in
  if (user) {
    console.log('User exists, redirecting to home');
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&q=80"
          alt="Fashion background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40" />
      </div>
      
      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full space-y-8 relative z-10 bg-white/95 dark:bg-gray-900/95 p-8 rounded-lg shadow-xl"
      >
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome to VirtuQuick</h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            Login or signup to continue shopping
          </p>
        </div>

        <LoginSignup />
      </motion.div>
    </div>
  );
}
