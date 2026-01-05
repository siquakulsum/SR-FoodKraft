import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';
import PWARegistration from './components/PWA/PWARegistration';
import OfflineIndicator from './components/PWA/OfflineIndicator';
import { registerServiceWorker, trackPWAEvent } from './utils/pwa';

// Pages
import HomePage from './pages/HomePage';
import MenuPage from './pages/MenuPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderConfirmationPage from './pages/OrderConfirmationPage';
import LoginPage from './pages/LoginPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import OrdersPage from './pages/OrdersPage';
import ProfilePage from './pages/ProfilePage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import FavoritesPage from './pages/FavoritesPage';
import PaymentOptionsPage from './pages/PaymentOptionsPage';

function App() {
  useEffect(() => {
    // Register service worker on app load
    registerServiceWorker();

    // Track PWA usage
    trackPWAEvent('app_loaded');

    // Listen for app installed event
    const handleAppInstalled = () => {
      trackPWAEvent('pwa_installed');
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  return (
    <AppProvider>
      <Router>
        <div className="min-h-screen flex flex-col">
          <OfflineIndicator />
          <Header />
          <main className="flex-grow pt-20">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/menu" element={<MenuPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/order-confirmation" element={<OrderConfirmationPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/orders" element={<OrdersPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/favorites" element={<FavoritesPage />} />
              <Route path="/payment-options" element={<PaymentOptionsPage />} />
            </Routes>
          </main>
          <Footer />
          <PWARegistration />
        </div>
      </Router>
    </AppProvider>
  );
}

export default App;