import { create } from 'zustand';
import { api } from '@/services/api';
import { Admin } from '@/types';

interface AuthState {
  admin: Admin | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<Admin>) => Promise<void>;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  admin: null,
  isAuthenticated: false,
  isInitialized: false,
  login: async (email: string, password: string) => {
    try {
      const { user, token } = await api.login(email, password);
      localStorage.setItem('token', token);
      set({ admin: user, isAuthenticated: true, isInitialized: true });
    } catch (error) {
      console.error('Login failed:', error);
      // Re-throw the error so the Login component can display it
      throw error;
    }
  },
  logout: () => {
    localStorage.removeItem('token');
    set({ admin: null, isAuthenticated: false, isInitialized: true });
  },
  updateProfile: async (data) => {
    try {
      const updatedAdmin = await api.updateProfile(data);
      set((state) => ({
        admin: state.admin ? { ...state.admin, ...updatedAdmin } : null,
      }));
    } catch (error) {
      console.error('Profile update failed:', error);
    }
  },
  // Session restore on app load
  initialize: async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      set({ isInitialized: true });
      return; // No token, skip restore
    }

    try {
      const admin = await api.getProfile();

      // Check if user has admin role
      if (admin.role === 'admin') {
        set({ admin, isAuthenticated: true, isInitialized: true });
        console.log('Admin session restored successfully');
      } else {
        // User is not admin, clear token for admin context
        console.log('User is not admin, redirecting...');
        set({ admin: null, isAuthenticated: false, isInitialized: true });
      }
    } catch (error) {
      console.error('Session restore failed:', error);
      // Don't clear token here - might be valid for customer
      set({ admin: null, isAuthenticated: false, isInitialized: true });
    }
  }
}));
