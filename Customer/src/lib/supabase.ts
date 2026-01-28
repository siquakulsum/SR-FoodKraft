import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Singleton instance to prevent multiple GoTrueClient instances
let supabaseInstance: SupabaseClient | null = null;

function getSupabaseClient(): SupabaseClient {
    if (supabaseInstance) {
        return supabaseInstance;
    }

    if (!supabaseUrl || !supabaseAnonKey ||
        supabaseUrl.includes('placeholder') ||
        supabaseAnonKey.includes('placeholder')) {
        console.warn('Supabase environment variables not configured. Using mock client.');

        // Create a mock client to prevent app crashes
        supabaseInstance = {
            auth: {
                getSession: () => Promise.resolve({ data: { session: null }, error: null }),
                onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => { } } } }),
                signUp: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }),
                signInWithPassword: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }),
                signOut: () => Promise.resolve({ error: null }),
            },
            from: () => ({
                select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }) }) }),
                insert: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }),
                update: () => ({ eq: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }) }),
                delete: () => ({ eq: () => Promise.resolve({ error: new Error('Supabase not configured') }) }),
            }),
            channel: () => ({
                on: () => ({ subscribe: () => ({ unsubscribe: () => { } }) }),
            }),
            rpc: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }),
        } as any;
    } else {
        supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
            auth: {
                persistSession: true,
                autoRefreshToken: true,
            },
        });
    }

    return supabaseInstance;
}

export const supabase = getSupabaseClient();

// Database types
export interface Database {
    public: {
        Tables: {
            user_profiles: {
                Row: {
                    id: string;
                    name: string;
                    phone: string | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id: string;
                    name: string;
                    phone?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    name?: string;
                    phone?: string | null;
                    updated_at?: string;
                };
            };
            addresses: {
                Row: {
                    id: string;
                    user_id: string;
                    type: 'home' | 'office' | 'other';
                    street: string;
                    city: string;
                    state: string;
                    zip_code: string;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    type?: 'home' | 'office' | 'other';
                    street: string;
                    city: string;
                    state: string;
                    zip_code: string;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    type?: 'home' | 'office' | 'other';
                    street?: string;
                    city?: string;
                    state?: string;
                    zip_code?: string;
                };
            };
            notifications: {
                Row: {
                    id: string;
                    user_id: string;
                    type: 'order_update' | 'promotion' | 'system' | 'welcome';
                    title: string;
                    message: string;
                    data: any;
                    is_read: boolean;
                    is_sent: boolean;
                    channels: string[];
                    created_at: string;
                    read_at: string | null;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    type: 'order_update' | 'promotion' | 'system' | 'welcome';
                    title: string;
                    message: string;
                    data?: any;
                    is_read?: boolean;
                    is_sent?: boolean;
                    channels?: string[];
                    created_at?: string;
                    read_at?: string | null;
                };
                Update: {
                    is_read?: boolean;
                    read_at?: string | null;
                };
            };
            notification_preferences: {
                Row: {
                    id: string;
                    user_id: string;
                    order_updates: boolean;
                    promotions: boolean;
                    system_alerts: boolean;
                    email_enabled: boolean;
                    sms_enabled: boolean;
                    push_enabled: boolean;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    order_updates?: boolean;
                    promotions?: boolean;
                    system_alerts?: boolean;
                    email_enabled?: boolean;
                    sms_enabled?: boolean;
                    push_enabled?: boolean;
                };
                Update: {
                    order_updates?: boolean;
                    promotions?: boolean;
                    system_alerts?: boolean;
                    email_enabled?: boolean;
                    sms_enabled?: boolean;
                    push_enabled?: boolean;
                };
            };
            menu_categories: {
                Row: {
                    id: string;
                    name: string;
                    description: string | null;
                    display_order: number;
                    is_active: boolean;
                    created_at: string;
                };
            };
            menu_items: {
                Row: {
                    id: string;
                    name: string;
                    description: string;
                    category_id: string | null;
                    subcategory: string | null;
                    image_url: string;
                    price_per_kg: number | null;
                    price_per_piece: number | null;
                    is_vegetarian: boolean;
                    is_available: boolean;
                    min_quantity: number;
                    created_at: string;
                    updated_at: string;
                };
            };
            orders: {
                Row: {
                    id: string;
                    user_id: string;
                    order_number: string;
                    event_date: string;
                    event_time: string;
                    delivery_address: any;
                    subtotal: number;
                    service_charge: number;
                    total_amount: number;
                    status: 'placed' | 'paid' | 'preparing' | 'delivered' | 'cancelled';
                    payment_method: 'card' | 'upi' | 'netbanking' | 'cash';
                    payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
                    special_instructions: string | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    order_number?: string;
                    event_date: string;
                    event_time: string;
                    delivery_address: any;
                    subtotal: number;
                    service_charge: number;
                    total_amount: number;
                    status?: 'placed' | 'paid' | 'preparing' | 'delivered' | 'cancelled';
                    payment_method?: 'card' | 'upi' | 'netbanking' | 'cash';
                    payment_status?: 'pending' | 'paid' | 'failed' | 'refunded';
                    special_instructions?: string | null;
                };
            };
            order_items: {
                Row: {
                    id: string;
                    order_id: string;
                    menu_item_id: string;
                    quantity: number;
                    unit: 'kg' | 'pieces';
                    unit_price: number;
                    total_price: number;
                    special_instructions: string | null;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    order_id: string;
                    menu_item_id: string;
                    quantity: number;
                    unit: 'kg' | 'pieces';
                    unit_price: number;
                    total_price: number;
                    special_instructions?: string | null;
                };
            };
            user_favorites: {
                Row: {
                    id: string;
                    user_id: string;
                    menu_item_id: string;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    menu_item_id: string;
                };
            };
        };
    };
}