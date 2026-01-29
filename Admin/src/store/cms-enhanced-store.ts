import { create } from 'zustand';
import { api } from '@/services/api';
import { GalleryImage, ContentPage, FAQ, BlogPost, SiteSetting, ProductCategory, ProductType } from '@/types/cms';

interface CMSEnhancedState {
  galleryImages: GalleryImage[];
  contentPages: ContentPage[];
  faqs: FAQ[];
  blogPosts: BlogPost[];
  siteSettings: SiteSetting[];
  productCategories: ProductCategory[];
  productTypes: ProductType[];
  loading: boolean;
  error: string | null;

  fetchGalleryImages: () => Promise<void>;
  addGalleryImage: (image: Omit<GalleryImage, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateGalleryImage: (id: string, image: Partial<GalleryImage>) => Promise<void>;
  deleteGalleryImage: (id: string) => Promise<void>;


  fetchContentPages: () => Promise<void>;
  updateContentPage: (id: string, page: Partial<ContentPage>) => Promise<void>;

  fetchFAQs: () => Promise<void>;
  addFAQ: (faq: Omit<FAQ, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateFAQ: (id: string, faq: Partial<FAQ>) => Promise<void>;
  deleteFAQ: (id: string) => Promise<void>;

  fetchBlogPosts: () => Promise<void>;
  addBlogPost: (post: Omit<BlogPost, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateBlogPost: (id: string, post: Partial<BlogPost>) => Promise<void>;
  deleteBlogPost: (id: string) => Promise<void>;

  fetchSiteSettings: () => Promise<void>;
  updateSiteSetting: (idOrKey: string, value: string, type?: string) => Promise<void>;

  fetchProductCategories: () => Promise<void>;
  addProductCategory: (category: Omit<ProductCategory, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateProductCategory: (id: string, category: Partial<ProductCategory>) => Promise<void>;
  deleteProductCategory: (id: string) => Promise<void>;

  fetchProductTypes: () => Promise<void>;
  addProductType: (type: Omit<ProductType, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateProductType: (id: string, type: Partial<ProductType>) => Promise<void>;
  deleteProductType: (id: string) => Promise<void>;

  uploadImage: (file: File, bucket: string) => Promise<string>;
}

export const useCMSEnhancedStore = create<CMSEnhancedState>((set, get) => ({
  galleryImages: [],
  contentPages: [],
  faqs: [],
  blogPosts: [],
  siteSettings: [],
  productCategories: [],
  productTypes: [],
  loading: false,
  error: null,

  fetchGalleryImages: async () => {
    set({ loading: true, error: null });
    try {
      const data = await api.getCMSBanners(); // Using banners as gallery images for now or similar
      set({ galleryImages: data || [], loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  addGalleryImage: async (image) => {
    set({ loading: true, error: null });
    try {
      const data = await api.createCMSBanner(image);
      set((state) => ({
        galleryImages: [...state.galleryImages, data],
        loading: false
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  updateGalleryImage: async (id, image) => {
    set({ loading: true, error: null });
    try {
      const data = await api.updateCMSBanner(id, image);
      set((state) => ({
        galleryImages: state.galleryImages.map((img) =>
          img.id === id ? data : img
        ),
        loading: false
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  deleteGalleryImage: async (id) => {
    set({ loading: true, error: null });
    try {
      await api.deleteCMSBanner(id);
      set((state) => ({
        galleryImages: state.galleryImages.filter((img) => img.id !== id),
        loading: false
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },


  fetchContentPages: async () => {
    set({ loading: true, error: null });
    try {
      const data = await api.getCMSPages();
      set({ contentPages: data || [], loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  updateContentPage: async (id, page) => {
    set({ loading: true, error: null });
    try {
      const data = await api.updateCMSPage(id, page);
      set((state) => ({
        contentPages: state.contentPages.map((p) => p.id === id ? data : p),
        loading: false
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  fetchFAQs: async () => {
    set({ loading: true, error: null });
    try {
      const data = await api.getCMSFAQs();
      set({ faqs: data || [], loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  addFAQ: async (faq) => {
    set({ loading: true, error: null });
    try {
      const data = await api.createCMSFAQ(faq);
      set((state) => ({
        faqs: [...state.faqs, data],
        loading: false
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  updateFAQ: async (id, faq) => {
    set({ loading: true, error: null });
    try {
      const data = await api.updateCMSFAQ(id, faq);
      set((state) => ({
        faqs: state.faqs.map((f) => f.id === id ? data : f),
        loading: false
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  deleteFAQ: async (id) => {
    set({ loading: true, error: null });
    try {
      await api.deleteCMSFAQ(id);
      set((state) => ({
        faqs: state.faqs.filter((f) => f.id !== id),
        loading: false
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  fetchBlogPosts: async () => {
    set({ loading: true, error: null });
    try {
      // For now using Testimonials as placeholder for blogs if not separate
      const data = await api.getCMSTestimonials();
      set({ blogPosts: data || [], loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  addBlogPost: async (post) => {
    set({ loading: true, error: null });
    try {
      const data = await api.createCMSTestimonial(post as any);
      set((state) => ({
        blogPosts: [data, ...state.blogPosts],
        loading: false
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  updateBlogPost: async (id, post) => {
    set({ loading: true, error: null });
    try {
      const data = await api.updateCMSTestimonial(id, post as any);
      set((state) => ({
        blogPosts: state.blogPosts.map((p) => p.id === id ? data : p),
        loading: false
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  deleteBlogPost: async (id) => {
    set({ loading: true, error: null });
    try {
      await api.deleteCMSTestimonial(id);
      set((state) => ({
        blogPosts: state.blogPosts.filter((p) => p.id !== id),
        loading: false
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  uploadImage: async (file, _bucket) => {
    // Mock image upload - in real app would use a cloud storage service
    return URL.createObjectURL(file);
  },

  fetchSiteSettings: async () => {
    set({ loading: true, error: null });
    try {
      const data = await api.getCMSSettings();
      set({ siteSettings: data || [], loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  updateSiteSetting: async (idOrKey: string, value: string, type: string = 'text') => {
    set({ loading: true, error: null });
    try {
      const state = get() as CMSEnhancedState;
      // Try to find by ID first, then by Key
      let setting = state.siteSettings.find(s => s.id === idOrKey || s.key === idOrKey);

      const key = setting ? setting.key : idOrKey;
      const data = await api.updateCMSSetting(key, value, type);

      set((state) => {
        const index = state.siteSettings.findIndex(s => s.id === (setting?.id || data.id));
        let newSettings = [...state.siteSettings];

        if (index > -1) {
          newSettings[index] = { ...newSettings[index], value: data.value };
        } else {
          newSettings.push(data);
        }

        return {
          siteSettings: newSettings,
          loading: false
        };
      });
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  fetchProductCategories: async () => {
    set({ loading: true, error: null });
    try {
      const response = await fetch('/api/cms/categories', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      set({ productCategories: data.data || [], loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  addProductCategory: async (category) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch('/api/cms/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(category)
      });
      const data = await response.json();
      set((state) => ({
        productCategories: [...state.productCategories, data.data],
        loading: false
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  updateProductCategory: async (id, category) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`/api/cms/categories/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(category)
      });
      const data = await response.json();
      set((state) => ({
        productCategories: state.productCategories.map((c) => c.id === id ? data.data : c),
        loading: false
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  deleteProductCategory: async (id) => {
    set({ loading: true, error: null });
    try {
      await fetch(`/api/cms/categories/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      set((state) => ({
        productCategories: state.productCategories.filter((c) => c.id !== id),
        loading: false
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  fetchProductTypes: async () => {
    set({ loading: true, error: null });
    try {
      const response = await fetch('/api/cms/product-types', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      set({ productTypes: data.data || [], loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  addProductType: async (type) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch('/api/cms/product-types', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(type)
      });
      const data = await response.json();
      set((state) => ({
        productTypes: [...state.productTypes, data.data],
        loading: false
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  updateProductType: async (id, type) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`/api/cms/product-types/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(type)
      });
      const data = await response.json();
      set((state) => ({
        productTypes: state.productTypes.map((t) => t.id === id ? data.data : t),
        loading: false
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  deleteProductType: async (id) => {
    set({ loading: true, error: null });
    try {
      await fetch(`/api/cms/product-types/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      set((state) => ({
        productTypes: state.productTypes.filter((t) => t.id !== id),
        loading: false
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },
}));
