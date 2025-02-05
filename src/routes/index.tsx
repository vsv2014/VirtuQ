import { Routes, Route } from 'react-router-dom';
import { HomePage } from '../components/HomePage';
import { ProductList } from '../components/ProductList';
import { ProductDetail } from '../components/ProductDetail';
import { Cart } from '../components/Cart';
import { Wishlist } from '../components/Wishlist';
import { Checkout } from '../components/Checkout';
import { Orders } from '../components/Orders';
import { HomeTrial } from '../components/HomeTrial';
import { ReturnProcess } from '../components/ReturnProcess';
import { LoginSignup } from '../components/auth/LoginSignup';
import { TermsAndConditions } from '../components/legal/TermsandConditions';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/category/:category" element={<ProductList />} />
      <Route path="/product/:id" element={<ProductDetail />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/wishlist" element={<Wishlist />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/orders" element={<Orders />} />
      <Route path="/home-trial" element={<HomeTrial />} />
      <Route path="/returns" element={<ReturnProcess />} />
      <Route path="/login" element={<LoginSignup />} />
      <Route path="/terms" element={<TermsAndConditions />} />
    </Routes>
  );
}