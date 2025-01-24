import { BrowserRouter as Router } from 'react-router-dom';
import { AppRoutes } from './routes';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { LocationProvider } from './context/LocationContext';
import { WishlistProvider } from './context/WishlistContext';
import { ThemeProvider } from './context/ThemeContext';
import { SearchProvider } from './context/SearchContext';
import { CompareProvider } from './context/CompareContext';

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <LocationProvider>
            <CartProvider>
              <WishlistProvider>
                <SearchProvider>
                  <CompareProvider>
                    <div className="flex flex-col min-h-screen">
                      <Header />
                      <main className="flex-grow">
                        <AppRoutes />
                      </main>
                      <Footer />
                    </div>
                  </CompareProvider>
                </SearchProvider>
              </WishlistProvider>
            </CartProvider>
          </LocationProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;