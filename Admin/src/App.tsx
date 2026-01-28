import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@/components/ThemeProvider';
import ScrollToTop from '@/components/ScrollToTop';
import AdminLayout from '@/components/layouts/AdminLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import ForgotPassword from '@/pages/ForgotPassword';
import Dashboard from '@/pages/Dashboard';
import Users from '@/pages/Users';
import Menu from '@/pages/Menu';
import Orders from '@/pages/Orders';
import Offers from '@/pages/Offers';
import CMS from '@/pages/CMS';
import Payments from '@/pages/Payments';
import Profile from '@/pages/Profile';
import Inquiries from '@/pages/Inquiries';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/auth-store';

function App() {
  const initialize = useAuthStore((state) => state.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <ScrollToTop />
      <Routes>
        {/* Admin panel routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="users" element={<Users />} />
          <Route path="menu" element={<Menu />} />
          <Route path="orders" element={<Orders />} />
          <Route path="offers" element={<Offers />} />
          <Route path="cms" element={<CMS />} />
          <Route path="payments" element={<Payments />} />
          <Route path="inquiries" element={<Inquiries />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        {/* Root redirects */}
        <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
      </Routes>
    </ThemeProvider>
  );
}

export default App;
