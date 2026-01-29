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

        // Map backend fields
        if (data.data && data.data.inquiries) {
            data.data.inquiries = data.data.inquiries.map((inquiry: any) => ({
                ...inquiry,
                created_at: inquiry.createdAt || inquiry.created_at,
                updated_at: inquiry.updatedAt || inquiry.updated_at
            }));
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

    // CMS API methods
    getCMSBanners: async () => {
        const response = await fetch('/api/cms/banners', { headers: getHeaders() });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to fetch banners');
        return data.data;
    },
    createCMSBanner: async (bannerData: any) => {
        const response = await fetch('/api/cms/banners', {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(bannerData),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to create banner');
        return data.data;
    },
    updateCMSBanner: async (id: string, updates: any) => {
        const response = await fetch(`/api/cms/banners/${id}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(updates),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to update banner');
        return data.data;
    },
    deleteCMSBanner: async (id: string) => {
        const response = await fetch(`/api/cms/banners/${id}`, {
            method: 'DELETE',
            headers: getHeaders(),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to delete banner');
        return data;
    },

    getCMSPages: async () => {
        const response = await fetch('/api/cms/pages', { headers: getHeaders() });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to fetch pages');
        return data.data;
    },
    createCMSPage: async (pageData: any) => {
        const response = await fetch('/api/cms/pages', {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(pageData),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to create page');
        return data.data;
    },
    updateCMSPage: async (id: string, updates: any) => {
        const response = await fetch(`/api/cms/pages/${id}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(updates),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to update page');
        return data.data;
    },
    deleteCMSPage: async (id: string) => {
        const response = await fetch(`/api/cms/pages/${id}`, {
            method: 'DELETE',
            headers: getHeaders(),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to delete page');
        return data;
    },

    getCMSFAQs: async () => {
        const response = await fetch('/api/cms/faqs', { headers: getHeaders() });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to fetch FAQs');
        return data.data;
    },
    createCMSFAQ: async (faqData: any) => {
        const response = await fetch('/api/cms/faqs', {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(faqData),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to create FAQ');
        return data.data;
    },
    updateCMSFAQ: async (id: string, updates: any) => {
        const response = await fetch(`/api/cms/faqs/${id}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(updates),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to update FAQ');
        return data.data;
    },
    deleteCMSFAQ: async (id: string) => {
        const response = await fetch(`/api/cms/faqs/${id}`, {
            method: 'DELETE',
            headers: getHeaders(),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to delete FAQ');
        return data;
    },

    getCMSTestimonials: async () => {
        const response = await fetch('/api/cms/testimonials', { headers: getHeaders() });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to fetch testimonials');
        return data.data;
    },
    createCMSTestimonial: async (testimonialData: any) => {
        const response = await fetch('/api/cms/testimonials', {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(testimonialData),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to create testimonial');
        return data.data;
    },
    updateCMSTestimonial: async (id: string, updates: any) => {
        const response = await fetch(`/api/cms/testimonials/${id}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(updates),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to update testimonial');
        return data.data;
    },
    deleteCMSTestimonial: async (id: string) => {
        const response = await fetch(`/api/cms/testimonials/${id}`, {
            method: 'DELETE',
            headers: getHeaders(),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to delete testimonial');
        return data;
    },

    getCMSSettings: async () => {
        const response = await fetch('/api/cms/settings', { headers: getHeaders() });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to fetch settings');
        return data.data;
    },
    updateCMSSetting: async (key: string, value: string, type: string = 'text') => {
        const response = await fetch('/api/cms/settings', {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ key, value, type }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to update setting');
        return data.data;
    },

    // Customer API methods
    getCustomerStats: async () => {
        const [total, active, blocked, revenue] = await Promise.all([
            fetch('/api/customers/stats/total', { headers: getHeaders() }).then(r => r.json()),
            fetch('/api/customers/stats/active', { headers: getHeaders() }).then(r => r.json()),
            fetch('/api/customers/stats/blocked', { headers: getHeaders() }).then(r => r.json()),
            fetch('/api/customers/stats/revenue', { headers: getHeaders() }).then(r => r.json())
        ]);

        return {
            totalCustomers: total.data?.total || 0,
            activeCustomers: active.data?.active || 0,
            blockedCustomers: blocked.data?.blocked || 0,
            totalRevenue: revenue.data?.revenue || 0
        };
    },

    getCustomers: async (params?: any) => {
        const queryParams = new URLSearchParams();
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== '' && value !== 'all') {
                    queryParams.append(key, String(value));
                }
            });
        }

        const response = await fetch(`/api/customers?${queryParams.toString()}`, {
            headers: getHeaders()
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to fetch customers');

        // Map backend fields
        if (data.data) {
            data.data = data.data.map((customer: any) => ({
                ...customer,
                created_at: customer.createdAt || customer.created_at,
                updated_at: customer.updatedAt || customer.updated_at
            }));
        }

        return data.data;
    },

    getCustomerById: async (id: string) => {
        const response = await fetch(`/api/customers/${id}`, {
            headers: getHeaders()
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to fetch customer details');
        return data.data;
    },

    createCustomer: async (customerData: any) => {
        const response = await fetch('/api/customers', {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(customerData)
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to create customer');
        return data.data;
    },

    blockCustomer: async (id: string, reason: string) => {
        const response = await fetch(`/api/customers/${id}/block`, {
            method: 'PATCH',
            headers: getHeaders(),
            body: JSON.stringify({ reason })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to block customer');
        return data.data;
    },

    unblockCustomer: async (id: string) => {
        const response = await fetch(`/api/customers/${id}/unblock`, {
            method: 'PATCH',
            headers: getHeaders()
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to unblock customer');
        return data.data;
    },

    exportCustomers: async (params?: any) => {
        const queryParams = new URLSearchParams();
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value) queryParams.append(key, String(value));
            });
        }

        const response = await fetch(`/api/customers/export?${queryParams.toString()}`, {
            headers: getHeaders()
        });

        if (!response.ok) throw new Error('Failed to export customers');

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `customers_export_${Date.now()}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
    },

    sendMessage: async (payload: { customerIds: string[], message: string, type: string }) => {
        const response = await fetch('/api/customers/notifications/send', {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(payload)
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to send message');
        return data.data;
    },

    // Menu Management API methods
    getMenuItems: async (params?: any) => {
        const queryParams = new URLSearchParams();
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== '' && value !== 'all') {
                    queryParams.append(key, String(value));
                }
            });
        }

        const response = await fetch(`/api/menu-items?${queryParams.toString()}`, {
            headers: getHeaders(),
        });

        const data = await response.json();
        if (!response.ok) {
            if (response.status === 401) localStorage.removeItem('token');
            throw new Error(data.message || 'Failed to fetch menu items');
        }
        return data.data;
    },

    getMenuItemCount: async () => {
        const response = await fetch('/api/menu-items/count', {
            headers: getHeaders(),
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Failed to fetch menu item count');
        }
        return data.data;
    },

    createMenuItem: async (menuItemData: FormData) => {
        const token = localStorage.getItem('token');
        const headers: HeadersInit = {};
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch('/api/menu-items', {
            method: 'POST',
            headers: headers,
            body: menuItemData,
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Failed to create menu item');
        }
        return data.data;
    },

    updateMenuItem: async (id: string, menuItemData: FormData) => {
        const token = localStorage.getItem('token');
        const headers: HeadersInit = {};
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`/api/menu-items/${id}`, {
            method: 'PATCH',
            headers: headers,
            body: menuItemData,
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Failed to update menu item');
        }
        return data.data;
    },

    toggleMenuAvailability: async (id: string) => {
        const response = await fetch(`/api/menu-items/${id}/availability`, {
            method: 'PATCH',
            headers: getHeaders(),
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Failed to toggle availability');
        }
        return data.data;
    },

    toggleMenuFeatured: async (id: string) => {
        const response = await fetch(`/api/menu-items/${id}/featured`, {
            method: 'PATCH',
            headers: getHeaders(),
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Failed to toggle featured status');
        }
        return data.data;
    },

    deleteMenuItem: async (id: string) => {
        const response = await fetch(`/api/menu-items/${id}`, {
            method: 'DELETE',
            headers: getHeaders(),
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Failed to delete menu item');
        }
        return data;
    },

    // Orders API methods
    getOrders: async (params?: any) => {
        const queryParams = new URLSearchParams();
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== '' && value !== 'all') {
                    queryParams.append(key, String(value));
                }
            });
        }

        const response = await fetch(`/api/orders?${queryParams.toString()}`, {
            headers: getHeaders(),
        });

        const data = await response.json();
        if (!response.ok) {
            if (response.status === 401) localStorage.removeItem('token');
            throw new Error(data.message || 'Failed to fetch orders');
        }

        // Map backend fields to frontend interface
        if (data.data.orders) {
            data.data.orders = data.data.orders.map((order: any) => ({
                ...order,
                created_at: order.createdAt || order.created_at,
                updated_at: order.updatedAt || order.updated_at
            }));
        }

        return data.data;
    },

    getOrdersCount: async (params?: any) => {
        const queryParams = new URLSearchParams();
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== '' && value !== 'all') {
                    queryParams.append(key, String(value));
                }
            });
        }

        const response = await fetch(`/api/orders/count?${queryParams.toString()}`, {
            headers: getHeaders(),
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Failed to fetch orders count');
        }
        return data.data;
    },

    getOrderById: async (id: string) => {
        const response = await fetch(`/api/orders/${id}`, {
            headers: getHeaders(),
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Failed to fetch order details');
        }
        return data.data;
    },

    updateOrderStatus: async (id: string, status: string, note?: string) => {
        const response = await fetch(`/api/orders/${id}/status`, {
            method: 'PATCH',
            headers: getHeaders(),
            body: JSON.stringify({ status, note }),
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Failed to update order status');
        }
        return data.data;
    },

    updateOrder: async (id: string, updates: any) => {
        const response = await fetch(`/api/orders/${id}`, {
            method: 'PATCH',
            headers: getHeaders(),
            body: JSON.stringify(updates),
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Failed to update order');
        }
        return data.data;
    },

    deleteOrder: async (id: string) => {
        const response = await fetch(`/api/orders/${id}`, {
            method: 'DELETE',
            headers: getHeaders(),
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Failed to delete order');
        }
        return data;
    },

    // Payment API methods
    getPaymentStats: async () => {
        const response = await fetch('/api/payments/stats', {
            headers: getHeaders(),
        });
        const data = await response.json();
        if (!response.ok) {
            if (response.status === 401) localStorage.removeItem('token');
            throw new Error(data.message || 'Failed to fetch payment stats');
        }
        return data.data;
    },

    getPayments: async (params?: any) => {
        const queryParams = new URLSearchParams();
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== '' && value !== 'all') {
                    queryParams.append(key, String(value));
                }
            });
        }

        const response = await fetch(`/api/payments?${queryParams.toString()}`, {
            headers: getHeaders(),
        });

        const data = await response.json();
        if (!response.ok) {
            if (response.status === 401) localStorage.removeItem('token');
            throw new Error(data.message || 'Failed to fetch payments');
        }

        const payments = data.data.payments.map((p: any) => ({
            id: p.id,
            transaction_id: p.transaction_id,
            order_id: p.order_id,
            amount: p.amount,
            status: p.status,
            created_at: p.created_at,
            payment_mode: p.payment_method,
            customer_name: p.order?.user?.name || 'Walk-in Customer',
            customer_id: p.order?.user?.id || '',
        }));

        return {
            payments,
            total: data.data.total,
            totalPages: data.data.totalPages,
            currentPage: data.data.currentPage
        };
    },

    addPayment: async (paymentData: any) => {
        const payload = {
            ...paymentData,
            payment_method: paymentData.payment_mode
        };
        const response = await fetch('/api/payments', {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(payload),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to add payment');
        return data.data;
    },

    updatePayment: async (id: string, updates: any) => {
        const response = await fetch(`/api/payments/${id}`, {
            method: 'PATCH',
            headers: getHeaders(),
            body: JSON.stringify(updates),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to update payment');
        return data.data;
    },

    deletePayment: async (id: string) => {
        const response = await fetch(`/api/payments/${id}`, {
            method: 'DELETE',
            headers: getHeaders(),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to delete payment');
        return data;
    },

    exportPayments: async (params?: any) => {
        const queryParams = new URLSearchParams();
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== '' && value !== 'all') {
                    queryParams.append(key, String(value));
                }
            });
        }

        const response = await fetch(`/api/payments/export?${queryParams.toString()}`, {
            headers: getHeaders(),
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.message || 'Failed to export payments');
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `payments_export_${Date.now()}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
    }
};

