import { create } from 'zustand';
import { Admin } from '@/types';

interface AuthState {
  admin: Admin | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (data: Partial<Admin>) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  admin: null,
  isAuthenticated: false,
  login: async (email: string, password: string) => {
    if (email === 'admin@srfoodkraft.com' && password === 'admin123') {
      const admin: Admin = {
        id: 'admin-1',
        email: 'admin@srfoodkraft.com',
        name: 'Admin User',
        phone: '+91 9876543200',
        avatar_url: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg',
      };
      set({ admin, isAuthenticated: true });
      return true;
    }
    return false;
  },
  logout: () => set({ admin: null, isAuthenticated: false }),
  updateProfile: (data) =>
    set((state) => ({
      admin: state.admin ? { ...state.admin, ...data } : null,
    })),
}));
