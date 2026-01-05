import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@/components/ThemeProvider';
import ScrollToTop from '@/components/ScrollToTop';
import AuthLayout from '@/components/layouts/AuthLayout';
import AdminLayout from '@/components/layouts/AdminLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import Login from '@/pages/Login';
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

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          {/* Public routes */}
          <Route element={<AuthLayout />}>
            <Route path="/admin/login" element={<Login />} />
            <Route path="/admin/forgot-password" element={<ForgotPassword />} />
          </Route>
          
          {/* Admin panel routes */}
          <Route
            path="/admin"
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
          <Route path="/" element={<Navigate to="/admin/login" replace />} />
          <Route path="/login" element={<Navigate to="/admin/login" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
