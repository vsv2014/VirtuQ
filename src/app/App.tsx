import { BrowserRouter as Router } from 'react-router-dom';
import { AppRoutes } from './routes';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { CartProvider } from '../context/CartContext';
import { AuthProvider } from '../context/AuthContext';
import { LocationProvider } from '../context/LocationContext';
import { SearchProvider } from '../context/SearchContext';
import { ThemeProvider } from '../context/ThemeContext';
import { WishlistProvider } from '../context/WishlistContext';
import { CompareProvider } from '../context/CompareContext';
import { ProductProvider } from '../context/ProductContext';
import { CompareFloatingButton } from '../components/CompareFloatingButton';
import { useTheme } from '../context/ThemeContext';

function AppContent() {
  const { theme } = useTheme();

  return (
    <div className={`${theme === 'dark' ? 'dark' : ''}`}>
      <div className="flex flex-col min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
        <Header />
        <main className="flex-grow">
          <AppRoutes />
        </main>
        <Footer />
        <CompareFloatingButton />
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <LocationProvider>
            <ProductProvider>
              <CartProvider>
                <SearchProvider>
                  <WishlistProvider>
                    <CompareProvider>
                      <AppContent />
                    </CompareProvider>
                  </WishlistProvider>
                </SearchProvider>
              </CartProvider>
            </ProductProvider>
          </LocationProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;