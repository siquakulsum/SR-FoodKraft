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
        const response = await fetch(`/api/admin/profile`, {
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

        const response = await fetch(`/api/admin/profile/avatar`, {
            method: 'POST',
            headers: headers,
            body: formData,
        });

        const data = await response.json();
        if (!response.ok) {
            if (response.status === 401) localStorage.removeItem('token');
            throw new Error(data.message || 'Failed to upload avatar');
        }
        return data.data;
    },

    removeAvatar: async (): Promise<{ avatar_url: string }> => {
        const response = await fetch(`/api/admin/profile/avatar`, {
            method: 'DELETE',
            headers: getHeaders(),
        });

        const data = await response.json();
        if (!response.ok) {
            if (response.status === 401) localStorage.removeItem('token');
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

    // Customer API methods
    getCustomerStats: async () => {
        const response = await fetch('/api/customers/stats/total', { // The backend service returns all stats in one object usually, but let's check my implementation.
            // My implementation: `router.get('/stats/total', customerController.getStats);`
            // And controller returns based on path OR fallback. 
            // `customerService.getCustomerStats` returns { totalCustomers, activeCustomers, blockedCustomers, totalRevenue }.
            // `customerController.getStats` -> if path has 'total', return { total: ... }. 
            // So I need to call ALL endpoints OR just one if I implemented a generic one.
            // My `customerRoutes.js` had:
            // router.get('/stats/total', customerController.getStats);
            // router.get('/stats/active', customerController.getStats);
            // etc.
            // AND the controller checked `req.route.path.includes('total')`.
            // So I have to call them individually if I want to strictly follow the route structure I built, 
            // UNLESS I just call one and the controller logic allows retrieving all?
            // Controller fallback: `return sendResponse(res, 200, true, 'Customer stats', stats);`
            // But the routes are specific.
            // To get ALL stats for the dashboard in one go (efficiently), I should have made a generic endpoint.
            // Since I didn't explicitly make a generic `/stats` route in `customerRoutes.js` (I only did specific ones),
            // I might have to call 4 endpoints or add a generic one.
            // Wait, my `customerRoutes.js`:
            // `router.get('/stats/total', ...)`
            // I did NOT add `router.get('/stats', ...)`
            // So I must call 4 endpoints OR I can try to hit one that falls through? No.
            // I will implement `getCustomerStats` to call all 4 in parallel and combine, OR I will assume I can update backend to expose `/stats`.
            // But I am in frontend integration task, strict "DO NOT change backend logic" (unless I made it).
            // Actually, I just made the backend. 
            // I will update the frontend to call 4 times in parallel.
            headers: getHeaders(),
        });
        // Actually, to make it cleaner, I'll fetch them individually in the store or here.
        // Let's implement individual methods or a combined one.
        // Combined is better for the UI component.

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
                if (value !== undefined && value !== null && value !== '' && value !== 'all') { // 'all' might be default for status
                    queryParams.append(key, String(value));
                }
            });
        }

        const response = await fetch(`/api/customers?${queryParams.toString()}`, {
            headers: getHeaders()
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to fetch customers');
        return data.data; // { customers, total, totalPages, currentPage }
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
        return data.data; // Expected { items, total, pages, currentPage } or just array depending on backend
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
        // Note: Content-Type header should NOT be set manually when using FormData
        // fetch will automatically set it to multipart/form-data with the boundary
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
        return data.data; // { orders, total, totalPages, currentPage }
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
        return data.data; // { count }
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
                    // Map frontend filter keys to backend expectations if needed
                    // Frontend 'modeFilter' -> params.payment_mode (if passed as payment_mode by caller)
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

        // Map backend response to frontend Payment interface
        const payments = data.data.payments.map((p: any) => ({
            id: p.id,
            transaction_id: p.transaction_id,
            order_id: p.order_id,
            amount: p.amount,
            status: p.status,
            created_at: p.created_at,
            // Map mismatched fields
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
        // Map frontend fields to backend fields
        const payload = {
            ...paymentData,
            payment_method: paymentData.payment_mode // Backend expects payment_method
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
