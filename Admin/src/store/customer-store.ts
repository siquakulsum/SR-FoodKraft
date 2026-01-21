import { create } from 'zustand';
import { Customer } from '@/types';
import { api } from '@/services/api';

interface CustomerState {
  customers: Customer[];
  total: number;
  totalPages: number;
  currentPage: number;
  stats: {
    totalCustomers: number;
    activeCustomers: number;
    blockedCustomers: number;
    totalRevenue: number;
  };
  isLoading: boolean;
  error: string | null;

  fetchCustomers: (params?: any) => Promise<void>;
  fetchStats: () => Promise<void>;
  updateCustomerStatus: (id: string, is_blocked: boolean, reason?: string) => Promise<void>; // Handles block/unblock
  addCustomer: (customerData: any) => Promise<void>;
  sendMessage: (payload: { customerIds: string[], message: string, type: string }) => Promise<void>;
}

export const useCustomerStore = create<CustomerState>((set, get) => ({
  customers: [],
  total: 0,
  totalPages: 0,
  currentPage: 1,
  stats: {
    totalCustomers: 0,
    activeCustomers: 0,
    blockedCustomers: 0,
    totalRevenue: 0
  },
  isLoading: false,
  error: null,

  fetchCustomers: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const result = await api.getCustomers(params);
      set({
        customers: result.customers,
        total: result.total,
        totalPages: result.totalPages,
        currentPage: result.currentPage,
        isLoading: false
      });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  fetchStats: async () => {
    try {
      const stats = await api.getCustomerStats();
      set({ stats });
    } catch (error: any) {
      console.error('Failed to fetch stats:', error);
    }
  },

  updateCustomerStatus: async (id, is_blocked, reason) => {
    set({ isLoading: true, error: null });
    try {
      if (is_blocked) {
        // If true, we are blocking
        await api.blockCustomer(id, reason || 'Blocked from Admin Panel');
      } else {
        await api.unblockCustomer(id);
      }

      // Update local state optimistically or re-fetch
      set(state => ({
        customers: state.customers.map(c => c.id === id ? { ...c, is_blocked } : c)
      }));

      // Also refresh stats
      get().fetchStats();
      set({ isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  addCustomer: async (customerData) => {
    set({ isLoading: true, error: null });
    try {
      await api.createCustomer(customerData);
      // Refresh list
      get().fetchCustomers({ page: 1, limit: 10 }); // Default refresh
      get().fetchStats();
      set({ isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error; // Re-throw so UI can catch and show specific error/close modal
    }
  },

  sendMessage: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      await api.sendMessage(payload);
      set({ isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  }
}));
