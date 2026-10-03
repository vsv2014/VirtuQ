import { BrowserRouter as Router } from 'react-router-dom';
import { AppRoutes } from './routes';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ScrollToTop } from './components/ScrollToTop';

import { ToastProvider } from './context/ToastProvider';
import { AuthProvider } from './context/AuthContext';
import { LocationProvider } from './context/LocationContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { OrderProvider } from './context/OrderContext';

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <ToastProvider>
          {/* OrderProvider depends on useAuth, so it must sit inside it. */}
          <AuthProvider>
            <LocationProvider>
              <CartProvider>
                <WishlistProvider>
                  <OrderProvider>
                    <ScrollToTop />
                    <div className="flex min-h-screen flex-col">
                      <Header />
                      <main id="main" className="flex-grow">
                        <ErrorBoundary>
                          <AppRoutes />
                        </ErrorBoundary>
                      </main>
                      <Footer />
                    </div>
                  </OrderProvider>
                </WishlistProvider>
              </CartProvider>
            </LocationProvider>
          </AuthProvider>
        </ToastProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
