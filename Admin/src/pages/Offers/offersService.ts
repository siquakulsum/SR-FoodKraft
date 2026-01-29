import { Offer } from '@/types';

// Extend Offer type if needed or ensure it matches backend response
export interface OfferFilters {
    search?: string;
    status?: string;
    discount_type?: string;
    date_from?: string;
    date_to?: string;
    page?: number;
    limit?: number;
}

const getHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
    };
};

export const offersService = {
    getOffers: async (filters: OfferFilters) => {
        const queryParams = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== '' && value !== 'all') {
                queryParams.append(key, String(value));
            }
        });

        const response = await fetch(`/api/offers?${queryParams.toString()}`, {
            headers: getHeaders(),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to fetch offers');
        return data;
    },

    getOffersCount: async (filters: OfferFilters) => {
        const queryParams = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== '' && value !== 'all') {
                queryParams.append(key, String(value));
            }
        });

        const response = await fetch(`/api/offers/count?${queryParams.toString()}`, {
            headers: getHeaders(),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to fetch offers count');
        return data;
    },

    createOffer: async (offerData: any) => {
        const response = await fetch('/api/offers', {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(offerData),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to create offer');
        return data.data;
    },

    updateOffer: async (id: string, offerData: any) => {
        const response = await fetch(`/api/offers/${id}`, {
            method: 'PATCH',
            headers: getHeaders(),
            body: JSON.stringify(offerData),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to update offer');
        return data.data;
    },

    toggleOfferStatus: async (id: string) => {
        const response = await fetch(`/api/offers/${id}/status`, {
            method: 'PATCH',
            headers: getHeaders(),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to update status');
        return data.data;
    },

    deleteOffer: async (id: string) => {
        const response = await fetch(`/api/offers/${id}`, {
            method: 'DELETE',
            headers: getHeaders(),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to delete offer');
        return data;
    },
};
