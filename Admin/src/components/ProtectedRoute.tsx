import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/auth-store';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { admin, isAuthenticated, isInitialized } = useAuthStore();

  // Show loading while initializing
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated or not admin
  if (!isAuthenticated || !admin || admin.role !== 'admin') {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
