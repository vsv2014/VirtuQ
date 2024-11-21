import { BrowserRouter as Router } from 'react-router-dom';
import { AppRoutes } from './routes';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { LocationProvider } from './context/LocationContext';

function App() {
  return (
    <Router>
      <AuthProvider>
        <LocationProvider>
          <CartProvider>
            <div className="flex flex-col min-h-screen">
              <Header />
              <main className="flex-grow">
                <AppRoutes />
              </main>
              <Footer />
            </div>
          </CartProvider>
        </LocationProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;