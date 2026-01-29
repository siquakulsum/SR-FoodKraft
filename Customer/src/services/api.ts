import { User } from '../types';

const API_URL = 'http://localhost:5000/api/auth';



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
    login: async (identifier: string, password: string): Promise<{ user: User; token: string }> => {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: identifier, password }), // Backend accepts email or phone as identifier
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Login failed');
        }

        // Backend returns: { success: true, message: 'Login successful', data: { id, name, email, phone, role, token } }
        const userData = data.data;

        return {
            user: {
                id: userData.id,
                name: userData.name,
                email: userData.email,
                phone: userData.phone || '',
                role: userData.role || 'customer', // Ensure role is always present
                addresses: [],
                favorites: []
            },
            token: userData.token
        };
    },

    register: async (userData: any): Promise<{ user: User; token: string }> => {
        const response = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...userData, role: 'customer' }), // Always register as customer
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Registration failed');
        }

        // Backend returns: { success: true, message: 'User registered successfully', data: { id, name, email, phone, role, token } }
        const registeredUser = data.data;

        return {
            user: {
                id: registeredUser.id,
                name: registeredUser.name,
                email: registeredUser.email,
                phone: registeredUser.phone || '',
                role: registeredUser.role || 'customer',
                addresses: [],
                favorites: []
            },
            token: registeredUser.token
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

    resetPassword: async (token: string, password: string): Promise<string> => {
        const response = await fetch(`${API_URL}/reset-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token, password }),
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Password reset failed');
        }
        return data.message;
    },

    getProfile: async (): Promise<User> => {
        const response = await fetch(`${API_URL}/me`, {
            headers: getHeaders(),
        });

        const data = await response.json();
        if (!response.ok) {
            if (response.status === 401) {
                localStorage.removeItem('token');
                // Optional: Trigger logout event or redirect
            }
            throw new Error(data.message || 'Failed to fetch profile');
        }
        return data.data;
    },

    updateProfile: async (updates: Partial<User>): Promise<User> => {
        const response = await fetch(`${API_URL}/me`, {
            method: 'PUT',
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
};
