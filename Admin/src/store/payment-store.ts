import { create } from 'zustand';
import { Payment } from '@/types';
import { api } from '@/services/api';

interface PaymentState {
  payments: Payment[];
  stats: {
    totalRevenue: number;
    totalTransactions: number;
    completedPayments: number;
  };
  total: number;
  totalPages: number;
  currentPage: number;
  isLoading: boolean;
  error: string | null;

  fetchPayments: (params?: any) => Promise<void>;
  fetchStats: () => Promise<void>;
  addPayment: (payment: any) => Promise<void>;
  updatePaymentStatus: (id: string, status: string) => Promise<void>;
  deletePayment: (id: string) => Promise<void>;
  exportPayments: (filterParams?: any) => Promise<void>;
}

export const usePaymentStore = create<PaymentState>((set, get) => ({
  payments: [],
  stats: {
    totalRevenue: 0,
    totalTransactions: 0,
    completedPayments: 0,
  },
  total: 0,
  totalPages: 1,
  currentPage: 1,
  isLoading: false,
  error: null,

  fetchPayments: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const result = await api.getPayments(params);
      set({
        payments: result.payments,
        total: result.total,
        totalPages: result.totalPages,
        currentPage: result.currentPage,
        isLoading: false,
      });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  fetchStats: async () => {
    try {
      const stats = await api.getPaymentStats();
      set({ stats });
    } catch (error: any) {
      console.error('Failed to fetch payment stats:', error);
    }
  },

  addPayment: async (paymentData) => {
    set({ isLoading: true, error: null });
    try {
      await api.addPayment(paymentData);
      set({ isLoading: false });
      // Refresh list and stats
      get().fetchPayments();
      get().fetchStats();
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  updatePaymentStatus: async (id, status) => {
    set({ isLoading: true, error: null });
    try {
      await api.updatePayment(id, { status });
      set({ isLoading: false });
      // Helper to update local state optimistically or refresh
      const { payments } = get();
      const updatedPayments = payments.map((p) =>
        p.id === id ? { ...p, status: status as Payment['status'] } : p
      );
      set({ payments: updatedPayments });

      // Also refresh stats as status change might affect them
      get().fetchStats();
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  deletePayment: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await api.deletePayment(id);
      set({ isLoading: false });
      // Refresh list
      get().fetchPayments();
      // Refresh stats
      get().fetchStats();
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  exportPayments: async (params) => {
    set({ isLoading: true, error: null });
    try {
      await api.exportPayments(params);
      set({ isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  }
}));
