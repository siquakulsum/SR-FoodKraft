import { Admin } from '@/types';

const API_URL = '/api/auth';

const getHeaders = () => {
    const token = localStorage.getItem('token');
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
};

export const api = {
    login: async (identifier: string, password: string) => {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: identifier, password }),
        });

        const data = await response.json();
        console.log(data)
        if (!response.ok) {
            throw new Error(data.message || 'Login failed');
        }

        // 👇 backend does NOT return user object
        if (data.data.role !== 'admin') {
            throw new Error('Unauthorized access. Admin privileges required.');
        }

        return {
            user: {
                id: data.data.id,
                name: data.data.name,
                email: data.data.email,
                phone: data.data.phone,
                role: data.data.role,
            },
            token: data.data.token,
        };
    },

    forgotPassword: async (email: string): Promise<string> => {
        const response = await fetch(`${API_URL}/forgot-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Failed to request password reset');
        }
        return data.message;
    },

    getProfile: async (): Promise<Admin> => {
        const response = await fetch(`${API_URL}/me`, {
            headers: getHeaders(),
        });

        const result = await response.json();
        if (!response.ok) {
            if (response.status === 401) {
                localStorage.removeItem('token');
            }
            throw new Error(result.message || 'Failed to fetch profile');
        }

        // Backend returns: { success, message, data: { user object } }
        if (!result.data) {
            throw new Error('Invalid response from server');
        }

        return result.data;
    },

    updateProfile: async (updates: Partial<Admin>): Promise<Admin> => {
        // Use the new Admin Profile API
        const response = await fetch(`/admin/profile`, {
            method: 'PATCH',
            headers: getHeaders(),
            body: JSON.stringify(updates),
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Failed to update profile');
        }
        return data.data;
    },

    changePassword: async (currentPassword: string, newPassword: string): Promise<string> => {
        const response = await fetch(`${API_URL}/change-password`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ currentPassword, newPassword }),
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Failed to change password');
        }
        return data.message;
    },

    uploadAvatar: async (file: File): Promise<{ avatar_url: string }> => {
        const formData = new FormData();
        formData.append('avatar', file);

        const token = localStorage.getItem('token');
        const headers: HeadersInit = {};
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        // Content-Type is NOT set for FormData so browser can set boundary

        const response = await fetch(`/admin/profile/avatar`, {
            method: 'POST',
            headers: headers,
            body: formData,
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Failed to upload avatar');
        }
        return data.data;
    },

    removeAvatar: async (): Promise<{ avatar_url: string }> => {
        const token = localStorage.getItem('token');
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`/admin/profile/avatar`, {
            method: 'DELETE',
            headers: headers,
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Failed to remove avatar');
        }
        return data.data;
    },

    // Inquiry API methods
    getInquiryStats: async () => {
        const response = await fetch('/api/inquiries/stats', {
            headers: getHeaders(),
        });

        const data = await response.json();
        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                localStorage.removeItem('token');
                window.location.href = '/login';
            }
            throw new Error(data.message || 'Failed to fetch inquiry stats');
        }
        return data.data;
    },

    getInquiries: async (params?: {
        page?: number;
        limit?: number;
        search?: string;
        status?: string;
        priority?: string;
        sortBy?: string;
        sortOrder?: string;
        date_start?: string;
        date_end?: string;
    }) => {
        const queryParams = new URLSearchParams();
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== '') {
                    queryParams.append(key, String(value));
                }
            });
        }

        const url = `/api/inquiries${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
        const response = await fetch(url, {
            headers: getHeaders(),
        });

        const data = await response.json();
        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                localStorage.removeItem('token');
                window.location.href = '/login';
            }
            throw new Error(data.message || 'Failed to fetch inquiries');
        }
        return data.data;
    },

    createInquiry: async (inquiryData: any) => {
        const response = await fetch('/api/inquiries', {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(inquiryData),
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Failed to create inquiry');
        }
        return data.data;
    },

    getInquiryById: async (id: string) => {
        const response = await fetch(`/api/inquiries/${id}`, {
            headers: getHeaders(),
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Failed to fetch inquiry details');
        }
        return data.data;
    },

    updateInquiry: async (id: string, updates: any) => {
        const response = await fetch(`/api/inquiries/${id}`, {
            method: 'PATCH',
            headers: getHeaders(),
            body: JSON.stringify(updates),
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Failed to update inquiry');
        }
        return data.data;
    },

    updateInquiryStatus: async (id: string, status: string) => {
        const response = await fetch(`/api/inquiries/${id}/status`, {
            method: 'PATCH',
            headers: getHeaders(),
            body: JSON.stringify({ status }),
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Failed to update inquiry status');
        }
        return data.data;
    },

    updateInquiryPriority: async (id: string, priority: string) => {
        const response = await fetch(`/api/inquiries/${id}/priority`, {
            method: 'PATCH',
            headers: getHeaders(),
            body: JSON.stringify({ priority }),
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Failed to update inquiry priority');
        }
        return data.data;
    },

    deleteInquiry: async (id: string) => {
        const response = await fetch(`/api/inquiries/${id}`, {
            method: 'DELETE',
            headers: getHeaders(),
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Failed to delete inquiry');
        }
        return data;
    },

    exportInquiries: async (params?: any) => {
        const queryParams = new URLSearchParams();
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== '') {
                    queryParams.append(key, String(value));
                }
            });
        }

        const url = `/api/inquiries/export${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
        const response = await fetch(url, {
            headers: getHeaders(),
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.message || 'Failed to export inquiries');
        }

        // Trigger file download
        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = `inquiries_${Date.now()}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(downloadUrl);
    },
};
