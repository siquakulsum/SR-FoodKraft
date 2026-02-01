import { create } from 'zustand';
import { Offer } from '@/types';
// import { mockOffers } from '@/lib/mock-data'; // Removed mock

interface OfferState {
  offers: Offer[];
  loading: boolean;
  error: string | null;
  fetchOffers: () => Promise<void>;
  validateOffer: (code: string) => Promise<Offer | null>;
  addOffer: (offer: Omit<Offer, 'id' | 'created_at'>) => Promise<void>;
  updateOffer: (id: string, offer: Partial<Offer>) => Promise<void>;
  deleteOffer: (id: string) => Promise<void>;
}

export const useOfferStore = create<OfferState>((set) => ({
  offers: [],
  loading: false,
  error: null,

  validateOffer: async (code: string) => {
    try {
      const response = await fetch(`/api/offers?search=${code.trim()}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      if (data.success && data.data && data.data.length > 0) {
        // Find exact match because search is like %code%
        const exactMatch = data.data.find((o: Offer) => o.code.toUpperCase() === code.toUpperCase().trim());
        return exactMatch || null;
      }
      return null;
    } catch (error) {
      console.error('Validation failed', error);
      return null;
    }
  },

  fetchOffers: async () => {
    set({ loading: true, error: null });
    try {
      const response = await fetch('/api/offers', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      if (data.success) {
        set({ offers: data.data || [] });
      } else {
        set({ error: data.message });
      }
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },

  addOffer: async (offer) => {
    // Placeholder for now, simple state update or API call if needed
    // Assuming verification of code is main priority. 
    // Ideally this should POST to /api/offers
    set((state) => ({ loading: true }));
    try {
      const response = await fetch('/api/offers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(offer)
      });
      const data = await response.json();
      if (data.success) { // Refresh
        const fetchRes = await fetch('/api/offers', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
        const fetchData = await fetchRes.json();
        set({ offers: fetchData.data || [] });
      }
    } catch (e) { console.error(e); }
    set({ loading: false });
  },

  updateOffer: async (id, offer) => {
    // Placeholder implementation matching backend
    set({ loading: true });
    try {
      await fetch(`/api/offers/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(offer)
      });
      // Optimistic or refresh
      set(state => ({
        offers: state.offers.map(o => o.id === id ? { ...o, ...offer } : o)
      }));
    } catch (e) { console.error(e); }
    set({ loading: false });
  },

  deleteOffer: async (id) => {
    set({ loading: true });
    try {
      await fetch(`/api/offers/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      set(state => ({
        offers: state.offers.filter(o => o.id !== id)
      }));
    } catch (e) { console.error(e); }
    set({ loading: false });
  },
}));
