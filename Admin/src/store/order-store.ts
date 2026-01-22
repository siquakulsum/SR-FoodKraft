import { create } from 'zustand';
import { Order } from '@/types';
import { api } from '@/services/api';

interface OrderState {
  orders: Order[];
  totalOrders: number;
  totalPages: number;
  currentPage: number;
  loading: boolean;

  fetchOrders: (params?: any) => Promise<void>;
  updateOrderStatus: (id: string, status: Order['status'], note?: string) => Promise<void>;
  deleteOrder: (id: string) => Promise<void>;
  getOrderById: (id: string) => Promise<Order | null>;
  updateOrder: (id: string, updates: any) => Promise<void>;
}

export const useOrderStore = create<OrderState>((set, get) => ({
  orders: [],
  totalOrders: 0,
  totalPages: 1,
  currentPage: 1,
  loading: false,

  fetchOrders: async (params = {}) => {
    set({ loading: true });
    try {
      const result = await api.getOrders(params);
      set({
        orders: result.orders,
        totalOrders: result.total,
        totalPages: result.totalPages,
        currentPage: result.currentPage,
        loading: false,
      });
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      set({ loading: false });
    }
  },

  updateOrderStatus: async (id, status, note) => {
    try {
      // Optimistic update
      set((state) => ({
        orders: state.orders.map((order) =>
          order.id === id ? { ...order, status } : order
        ),
      }));

      await api.updateOrderStatus(id, status, note);

      // Optionally refresh to ensure data consistency
      // await get().fetchOrders({ page: get().currentPage }); // Or just trust the optimistic update
    } catch (error) {
      console.error('Failed to update order status:', error);
      // Revert optimization would be needed here ideally, but for now we rely on next fetch
    }
  },

  updateOrder: async (id, updates) => {
    try {
      await api.updateOrder(id, updates);
      // Refresh orders 
      // await get().fetchOrders({ page: get().currentPage });
    } catch (error) {
      console.error('Failed to update order:', error);
      throw error;
    }
  },

  deleteOrder: async (id) => {
    try {
      await api.deleteOrder(id);
      set((state) => ({
        orders: state.orders.filter((order) => order.id !== id),
        totalOrders: state.totalOrders - 1
      }));
    } catch (error) {
      console.error('Failed to delete order:', error);
    }
  },

  getOrderById: async (id) => {
    try {
      // Check if we have detailed order? No, list only gives summary often. Better fetch fresh.
      const order = await api.getOrderById(id);
      return order;
    } catch (error) {
      console.error('Failed to fetch order details:', error);
      return null;
    }
  }
}));
