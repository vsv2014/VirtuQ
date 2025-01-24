import { Routes, Route, Navigate } from 'react-router-dom';
import { HomePage } from '../components/HomePage';
import { ProductList } from '../components/ProductList';
import { ProductDetail } from '../components/ProductDetail';
import { Cart } from '../components/Cart';
import { Wishlist } from '../components/Wishlist';
import { Checkout } from '../components/Checkout';
import Orders from '../components/Orders';
import { HomeTrial } from '../components/HomeTrial';
import ReturnProcess from '../components/ReturnProcess';
import { TermsAndConditions } from '../components/legal/TermsandConditions';
import { AuthPage } from '../pages/AuthPage';
import { VirtualTryOnPage } from '../pages/VirtualTryOnPage';
import { useAuth } from '../context/AuthContext';

// Protected route wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  // Skip auth check in development
  if (import.meta.env.DEV) {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
}

export function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/products" element={<ProductList />} />
      <Route path="/product/:id" element={<ProductDetail />} />
      <Route path="/virtual-try-on" element={<VirtualTryOnPage />} />
      <Route path="/terms" element={<TermsAndConditions />} />
      
      {/* Protected routes */}
      <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
      <Route path="/wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
      <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
      <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
      <Route path="/home-trial" element={<ProtectedRoute><HomeTrial /></ProtectedRoute>} />
      <Route path="/return" element={<ProtectedRoute><ReturnProcess /></ProtectedRoute>} />
      
      {/* Redirect /login to /auth */}
      <Route path="/login" element={<Navigate to="/auth" replace />} />
      
      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}