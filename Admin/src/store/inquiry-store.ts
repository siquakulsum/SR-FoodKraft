import { create } from 'zustand';
import { Inquiry } from '@/types';
import { api } from '@/services/api';

interface InquiryStats {
  totalInquiries: number;
  newInquiries: number;
  contactedInquiries?: number; // Backend stats might differ slightly in keys, mapping if needed
  quotedInquiries: number;
  convertedInquiries: number;
  totalQuoteValue: number;
}

interface InquiryState {
  inquiries: Inquiry[];
  stats: InquiryStats;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  isLoading: boolean;
  error: string | null;

  fetchInquiries: (params?: any) => Promise<void>;
  fetchStats: () => Promise<void>;
  addInquiry: (inquiry: any) => Promise<void>;
  updateInquiryStatus: (id: string, status: Inquiry['status']) => Promise<void>;
  updateInquiryPriority: (id: string, priority: Inquiry['priority']) => Promise<void>;
  updateInquiryNotes: (id: string, notes: string) => Promise<void>;
  updateInquiryQuote: (id: string, quoteAmount: number) => Promise<void>;
  assignInquiry: (id: string, assignedTo: string) => Promise<void>; // This might fail if backend doesn't support separate assign endpoint, assuming updateInquiry handles it
  deleteInquiry: (id: string) => Promise<void>;
  updateInquiry: (id: string, data: any) => Promise<void>;
}

export const useInquiryStore = create<InquiryState>((set, get) => ({
  inquiries: [],
  stats: {
    totalInquiries: 0,
    newInquiries: 0,
    quotedInquiries: 0,
    convertedInquiries: 0,
    totalQuoteValue: 0
  },
  pagination: {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0
  },
  isLoading: false,
  error: null,

  fetchInquiries: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const result = await api.getInquiries(params);
      set({
        inquiries: result.inquiries,
        pagination: result.pagination,
        isLoading: false
      });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  fetchStats: async () => {
    try {
      const stats = await api.getInquiryStats();
      set({ stats });
    } catch (error: any) {
      console.error('Failed to fetch stats:', error);
    }
  },

  addInquiry: async (inquiryData) => {
    set({ isLoading: true, error: null });
    try {
      await api.createInquiry(inquiryData);
      // Refresh list and stats
      await get().fetchInquiries();
      await get().fetchStats();
      set({ isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  updateInquiryStatus: async (id, status) => {
    try {
      await api.updateInquiryStatus(id, status);
      // Optimistic update or refresh
      set((state) => ({
        inquiries: state.inquiries.map((inquiry) =>
          inquiry.id === id ? { ...inquiry, status, updated_at: new Date().toISOString() } : inquiry
        ),
      }));
      get().fetchStats(); // Update stats in background
    } catch (error: any) {
      set({ error: error.message });
      // Revert if needed (fetching list again is safer)
      get().fetchInquiries();
    }
  },

  updateInquiryPriority: async (id, priority) => {
    try {
      await api.updateInquiryPriority(id, priority);
      set((state) => ({
        inquiries: state.inquiries.map((inquiry) =>
          inquiry.id === id ? { ...inquiry, priority, updated_at: new Date().toISOString() } : inquiry
        ),
      }));
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  updateInquiryNotes: async (id, notes) => {
    try {
      // Assuming updateInquiry handles this
      await api.updateInquiry(id, { notes });
      set((state) => ({
        inquiries: state.inquiries.map((inquiry) =>
          inquiry.id === id ? { ...inquiry, notes, updated_at: new Date().toISOString() } : inquiry
        ),
      }));
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  updateInquiryQuote: async (id, quoteAmount) => {
    try {
      await api.updateInquiry(id, { quote_amount: quoteAmount });
      set((state) => ({
        inquiries: state.inquiries.map((inquiry) =>
          inquiry.id === id ? { ...inquiry, quote_amount: quoteAmount, updated_at: new Date().toISOString() } : inquiry
        ),
      }));
      get().fetchStats();
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  assignInquiry: async (id, assignedTo) => {
    try {
      await api.updateInquiry(id, { assigned_to: assignedTo });
      set((state) => ({
        inquiries: state.inquiries.map((inquiry) =>
          inquiry.id === id ? { ...inquiry, assigned_to: assignedTo, updated_at: new Date().toISOString() } : inquiry
        ),
      }));
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  updateInquiry: async (id, data) => {
    try {
      const updatedInquiry = await api.updateInquiry(id, data);
      set((state) => ({
        inquiries: state.inquiries.map((inquiry) =>
          inquiry.id === id ? updatedInquiry : inquiry
        ),
      }));
      get().fetchStats();
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  deleteInquiry: async (id) => {
    try {
      await api.deleteInquiry(id);
      set((state) => ({
        inquiries: state.inquiries.filter((inquiry) => inquiry.id !== id),
      }));
      get().fetchStats();
    } catch (error: any) {
      set({ error: error.message });
    }
  },
}));


