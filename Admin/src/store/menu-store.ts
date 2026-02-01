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

  categories: any[];
  productTypes: any[];

  fetchMenuItems: (params?: any) => Promise<void>;
  fetchCategories: () => Promise<void>;
  fetchProductTypes: () => Promise<void>;
  addMenuItem: (itemData: FormData) => Promise<void>;
  updateMenuItem: (id: string, itemData: FormData) => Promise<void>;
  deleteMenuItem: (id: string) => Promise<void>;
  toggleAvailability: (id: string) => Promise<void>;
  toggleFeatured: (id: string) => Promise<void>;
  updateFeaturedPriority: (items: MenuItem[]) => void;
}

export const useMenuStore = create<MenuState>((set, get) => ({
  menuItems: [],
  categories: [],
  productTypes: [],
  totalItems: 0,
  totalPages: 0,
  currentPage: 1,
  loading: false,
  error: null,

  fetchMenuItems: async (params) => {
    set({ loading: true, error: null });
    try {
      const data = await api.getMenuItems(params);
      set({
        menuItems: data.items || [],
        totalItems: data.total || 0,
        totalPages: Math.ceil((data.total || 0) / (params?.limit || 10)),
        currentPage: data.page || 1,
        loading: false
      });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  fetchCategories: async () => {
    try {
      // Assuming api.getCategories exists or we add it to api.ts service.
      // If not in api.ts, fetch directly or update api.ts.
      const response = await fetch('/api/cms/categories', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      if (data.success) {
        set({ categories: data.data });
      }
    } catch (error) {
      console.error('Failed to fetch categories', error);
    }
  },

  fetchProductTypes: async () => {
    try {
      const response = await fetch('/api/cms/product-types', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      if (data.success) {
        set({ productTypes: data.data });
      }
    } catch (error) {
      console.error('Failed to fetch product types', error);
    }
  },

  addMenuItem: async (itemData: FormData) => {
    set({ loading: true, error: null });
    try {
      await api.createMenuItem(itemData);
      await get().fetchMenuItems({ page: 1 });
      set({ loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  updateMenuItem: async (id: string, itemData: FormData) => {
    set({ loading: true, error: null });
    try {
      await api.updateMenuItem(id, itemData);
      await get().fetchMenuItems({ page: get().currentPage });
      set({ loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  deleteMenuItem: async (id: string) => {
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
    const previousItems = get().menuItems;
    set({
      menuItems: previousItems.map(item =>
        item.id === id ? { ...item, is_available: !item.is_available } : item
      )
    });

    try {
      await api.toggleMenuAvailability(id);
    } catch (error: any) {
      set({ menuItems: previousItems, error: error.message });
    }
  },

  toggleFeatured: async (id: string) => {
    const previousItems = get().menuItems;
    set({
      menuItems: previousItems.map(item =>
        item.id === id ? { ...item, is_featured: !item.is_featured } : item
      )
    });

    try {
      await api.toggleMenuFeatured(id);
    } catch (error: any) {
      set({ menuItems: previousItems, error: error.message });
    }
  },

  updateFeaturedPriority: (items) => {
    set({ menuItems: items });
  },
}));
