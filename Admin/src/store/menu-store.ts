import { create } from 'zustand';
import { MenuItem } from '@/types';
import { api } from '@/services/api';

interface MenuState {
  menuItems: MenuItem[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  loading: boolean;
  error: string | null;

  fetchMenuItems: (params?: any) => Promise<void>;
  addMenuItem: (itemData: FormData) => Promise<void>;
  updateMenuItem: (id: string, itemData: FormData) => Promise<void>;
  deleteMenuItem: (id: string) => Promise<void>;
  toggleAvailability: (id: string) => Promise<void>;
  toggleFeatured: (id: string) => Promise<void>;
  updateFeaturedPriority: (items: MenuItem[]) => void; // Keeping for drag-drop if strictly needed, but API might handle it differently
}

export const useMenuStore = create<MenuState>((set, get) => ({
  menuItems: [],
  totalItems: 0,
  totalPages: 0,
  currentPage: 1,
  loading: false,
  error: null,

  fetchMenuItems: async (params) => {
    set({ loading: true, error: null });
    try {
      const data = await api.getMenuItems(params);
      // data is expected to be { items: [...], pagination: { total, pages, ... } } or similar
      // Based on typical response: { success: true, data: { items: [], total: 10, totalPages: 1, currentPage: 1 } }
      // api.getMenuItems returns data.data from the response.

      set({
        menuItems: data.items || [],
        totalItems: data.total || 0,
        totalPages: Math.ceil((data.total || 0) / (params?.limit || 10)), // Calculate locally or use data.limit
        currentPage: data.page || 1,
        loading: false
      });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  addMenuItem: async (itemData: FormData) => {
    set({ loading: true, error: null });
    try {
      await api.createMenuItem(itemData);
      // Refresh list after add
      // We might want to keep current filters, or reset. For now, let's just re-fetch page 1
      await get().fetchMenuItems({ page: 1 });
      set({ loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error; // Re-throw for UI handling
    }
  },

  updateMenuItem: async (id: string, itemData: FormData) => {
    set({ loading: true, error: null });
    try {
      await api.updateMenuItem(id, itemData);
      // Refresh list to show updates (esp image)
      await get().fetchMenuItems({ page: get().currentPage }); // Refresh current page
      set({ loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  deleteMenuItem: async (id: string) => {
    // Optimistic update? Better to be safe and wait for server
    set({ loading: true, error: null });
    try {
      await api.deleteMenuItem(id);
      await get().fetchMenuItems({ page: get().currentPage });
      set({ loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  toggleAvailability: async (id: string) => {
    // Optimistic update
    const previousItems = get().menuItems;
    set({
      menuItems: previousItems.map(item =>
        item.id === id ? { ...item, is_available: !item.is_available } : item
      )
    });

    try {
      await api.toggleMenuAvailability(id);
    } catch (error: any) {
      // Revert on error
      set({ menuItems: previousItems, error: error.message });
    }
  },

  toggleFeatured: async (id: string) => {
    // Optimistic update
    const previousItems = get().menuItems;
    set({
      menuItems: previousItems.map(item =>
        item.id === id ? { ...item, is_featured: !item.is_featured } : item
      )
    });

    try {
      await api.toggleMenuFeatured(id);
    } catch (error: any) {
      // Revert
      set({ menuItems: previousItems, error: error.message });
    }
  },

  updateFeaturedPriority: (items) => {
    // This is likely local reordering.
    // If backend persistence is needed, we'd need an API.
    // Keeping local state update for now.
    set({ menuItems: items });
  },
}));
