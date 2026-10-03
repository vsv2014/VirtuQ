import { Navigate, Route, Routes } from 'react-router-dom';

import { HomePage } from '../components/HomePage';
import { ProductList } from '../components/ProductList';
import { ProductDetail } from '../components/ProductDetail';
import { Cart } from '../components/Cart';
import { Wishlist } from '../components/Wishlist';
import { Checkout } from '../components/Checkout';
import { Orders } from '../components/Orders';
import { OrderDetail } from '../components/OrderDetail';
import { HomeTrial } from '../components/HomeTrial';
import { ReturnProcess } from '../components/ReturnProcess';
import { LoginSignup } from '../components/auth/LoginSignup';
import { Profile } from '../components/Profile';
import { AddressBook } from '../components/AddressBook';
import { LegalPage } from '../components/legal/LegalPage';
import { NotFound } from '../components/NotFound';
import { ProtectedRoute } from '../components/ProtectedRoute';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />

      {/* Both shapes are routed: the nav dropdown emits /category/men/top-wear */}
      <Route path="/category/:category" element={<ProductList />} />
      <Route path="/category/:category/:subcategory" element={<ProductList />} />

      <Route path="/search" element={<ProductList />} />
      <Route path="/product/:id" element={<ProductDetail />} />

      <Route path="/cart" element={<Cart />} />
      <Route path="/wishlist" element={<Wishlist />} />

      <Route
        path="/checkout"
        element={
          <ProtectedRoute>
            <Checkout />
          </ProtectedRoute>
        }
      />
      <Route
        path="/orders"
        element={
          <ProtectedRoute>
            <Orders />
          </ProtectedRoute>
        }
      />
      <Route
        path="/orders/:id"
        element={
          <ProtectedRoute>
            <OrderDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/home-trial"
        element={
          <ProtectedRoute>
            <HomeTrial />
          </ProtectedRoute>
        }
      />
      <Route
        path="/home-trial/:orderId"
        element={
          <ProtectedRoute>
            <HomeTrial />
          </ProtectedRoute>
        }
      />
      <Route
        path="/returns"
        element={
          <ProtectedRoute>
            <ReturnProcess />
          </ProtectedRoute>
        }
      />
      <Route
        path="/returns/:orderId"
        element={
          <ProtectedRoute>
            <ReturnProcess />
          </ProtectedRoute>
        }
      />

      <Route path="/login" element={<LoginSignup />} />

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/address"
        element={
          <ProtectedRoute>
            <AddressBook />
          </ProtectedRoute>
        }
      />

      {/* Legal / information */}
      <Route path="/terms" element={<LegalPage slug="terms" />} />
      <Route path="/privacy" element={<LegalPage slug="privacy" />} />
      <Route path="/refund-policy" element={<LegalPage slug="refund-policy" />} />
      <Route path="/faq" element={<LegalPage slug="faq" />} />
      <Route path="/contact" element={<LegalPage slug="contact" />} />
      <Route path="/how-to-return" element={<LegalPage slug="how-to-return" />} />

      {/* Legacy shortcuts kept working */}
      <Route path="/men" element={<Navigate to="/category/men" replace />} />
      <Route path="/women" element={<Navigate to="/category/women" replace />} />

      {/* Catch-all — previously an unknown URL rendered a blank <main> */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
