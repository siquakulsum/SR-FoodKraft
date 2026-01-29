export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  addresses: Address[];
  favorites: string[]; // Array of menu item IDs
}

export interface Address {
  id: string;
  type: 'home' | 'office' | 'other';
  name: string;
  address: string;
  phone: string;
  isDefault?: boolean;
  // Detailed address fields
  doorNo?: string;
  street?: string;
  area?: string;
  city?: string;
  state?: string;
  zipCode?: string;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  category: string;
  subcategory?: string;
  image: string;
  pricePerKg?: number;
  pricePerPiece?: number;
  pricePerLiter?: number;
  isVegetarian: boolean;
  isAvailable: boolean;
  minQuantity: number;
  maxQuantity?: number;
  servings?: number;
}

export interface MenuItemRating {
  id: string;
  menuItemId: string;
  userId: string;
  rating: number;
  review?: string;
  createdAt: string;
  userName: string;
}

export interface MenuItemStats {
  menuItemId: string;
  averageRating: number;
  totalRatings: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

export interface CartItem {
  id: string;
  menuItem: MenuItem;
  quantity: number;
  unit: 'kg' | 'pieces' | 'liters';
  specialInstructions?: string;
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  eventDate: string;
  eventTime: string;
  deliveryAddress: Address;
  totalAmount: number;
  status: 'placed' | 'paid' | 'preparing' | 'delivered' | 'cancelled';
  createdAt: string;
  // Payment details
  paymentMethod?: 'card' | 'upi' | 'netbanking' | 'cod';
  transactionId?: string;
  paymentTimestamp?: string;
}