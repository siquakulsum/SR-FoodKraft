import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { User, CartItem, Order, MenuItemRating, MenuItemStats, Address } from '../types';
import { menuData } from '../data/menuData';

interface CartError {
  type: 'MAX_QUANTITY_EXCEEDED';
  message: string;
  itemName: string;
  currentQuantity: number;
  maxQuantity: number;
}

interface AppState {
  user: User | null;
  cart: CartItem[];
  orders: Order[];
  isLoggedIn: boolean;
  ratings: MenuItemRating[];
  ratingStats: MenuItemStats[];
  cartError: CartError | null;
}

type AppAction =
  | { type: 'LOGIN'; payload: User }
  | { type: 'DEMO_LOGIN' }
  | { type: 'LOGOUT' }
  | { type: 'ADD_TO_CART'; payload: CartItem }
  | { type: 'UPDATE_CART_ITEM'; payload: { id: string; quantity: number } }
  | { type: 'REMOVE_FROM_CART'; payload: string }
  | { type: 'CLEAR_CART' }
  | { type: 'CLEAR_CART_ERROR' }
  | { type: 'ADD_ORDER'; payload: Order }
  | { type: 'CANCEL_ORDER'; payload: string }
  | { type: 'ADD_TO_FAVORITES'; payload: string }
  | { type: 'REMOVE_FROM_FAVORITES'; payload: string }
  | { type: 'ADD_ADDRESS'; payload: Address }
  | { type: 'UPDATE_ADDRESS'; payload: Address }
  | { type: 'DELETE_ADDRESS'; payload: string }
  | { type: 'ADD_RATING'; payload: MenuItemRating }
  | { type: 'UPDATE_RATING'; payload: MenuItemRating }
  | { type: 'DELETE_RATING'; payload: string };

const initialState: AppState = {
  user: null,
  cart: [],
  cartError: null,
  orders: [
    {
      id: 'ORD1759245056008',
      userId: 'demo-user-1',
      items: [
        {
          id: 'starter-1',
          name: 'Chicken 65',
          quantity: 2,
          unit: 'kg',
          price: 450,
          image: 'https://images.pexels.com/photos/60616/fried-chicken-chicken-fried-crunchy-60616.jpeg'
        },
        {
          id: 'main-1',
          name: 'Butter Chicken',
          quantity: 1,
          unit: 'kg',
          price: 550,
          image: 'https://images.pexels.com/photos/2474661/pexels-photo-2474661.jpeg'
        }
      ],
      totalAmount: 1450,
      deliveryCharge: 99,
      eventDate: '2025-01-15',
      eventTime: '19:00',
      deliveryAddress: {
        id: 'addr-1',
        type: 'home',
        name: 'Home',
        address: '123 Main Street, Chennai, Tamil Nadu 600001',
        phone: '+91 98765 43210',
        isDefault: true
      },
      deliveryMethod: 'door',
      paymentMethod: 'card',
      status: 'delivered',
      createdAt: '2025-01-10T10:00:00Z',
      updatedAt: '2025-01-15T20:00:00Z'
    },
    {
      id: 'ORD1759245056009',
      userId: 'demo-user-1',
      items: [
        {
          id: 'rice-1',
          name: 'Chicken Biryani',
          quantity: 3,
          unit: 'kg',
          price: 600,
          image: 'https://images.pexels.com/photos/2474661/pexels-photo-2474661.jpeg'
        },
        {
          id: 'starter-2',
          name: 'Samosas',
          quantity: 2,
          unit: 'dozen',
          price: 200,
          image: 'https://images.pexels.com/photos/2474661/pexels-photo-2474661.jpeg'
        }
      ],
      totalAmount: 2000,
      deliveryCharge: 199,
      eventDate: '2025-01-20',
      eventTime: '18:30',
      deliveryAddress: {
        id: 'addr-2',
        type: 'office',
        name: 'Office',
        address: '456 Business Park, Chennai, Tamil Nadu 600002',
        phone: '+91 98765 43211',
        isDefault: false
      },
      deliveryMethod: 'door',
      paymentMethod: 'upi',
      status: 'delivered',
      createdAt: '2025-01-15T14:30:00Z',
      updatedAt: '2025-01-20T19:30:00Z'
    },
    {
      id: 'ORD1759245056010',
      userId: 'demo-user-1',
      items: [
        {
          id: 'main-2',
          name: 'Mutton Curry',
          quantity: 2,
          unit: 'kg',
          price: 800,
          image: 'https://images.pexels.com/photos/2474661/pexels-photo-2474661.jpeg'
        },
        {
          id: 'rice-2',
          name: 'Mutton Biryani',
          quantity: 2,
          unit: 'kg',
          price: 700,
          image: 'https://images.pexels.com/photos/2474661/pexels-photo-2474661.jpeg'
        }
      ],
      totalAmount: 3000,
      deliveryCharge: 199,
      eventDate: '2025-01-25',
      eventTime: '20:00',
      deliveryAddress: {
        id: 'addr-1',
        type: 'home',
        name: 'Home',
        address: '123 Main Street, Chennai, Tamil Nadu 600001',
        phone: '+91 98765 43210',
        isDefault: true
      },
      deliveryMethod: 'pickup',
      paymentMethod: 'cod',
      status: 'delivered',
      createdAt: '2025-01-20T16:00:00Z',
      updatedAt: '2025-01-25T21:00:00Z'
    }
  ],
  isLoggedIn: false,
  ratings: [
    // Sample ratings for demo
    {
      id: '1',
      menuItemId: 'starter-1',
      userId: 'demo-user-1',
      rating: 5,
      review: 'Amazing Chicken 65! Perfectly spiced and crispy. The portion was generous and the quality was excellent. Will definitely order again!',
      createdAt: '2025-01-20T10:00:00Z',
      userName: 'John Doe'
    },
    {
      id: '2',
      menuItemId: 'main-1',
      userId: 'demo-user-2',
      rating: 4,
      review: 'Delicious butter chicken with rich creamy texture. The chicken was tender and the sauce was perfectly balanced. Highly recommended!',
      createdAt: '2025-01-21T15:30:00Z',
      userName: 'Priya S.'
    },
    {
      id: '3',
      menuItemId: 'rice-1',
      userId: 'demo-user-3',
      rating: 5,
      review: 'Best chicken biryani I have ever tasted! The rice was perfectly cooked and the chicken was flavorful. The aroma was incredible!',
      createdAt: '2025-01-22T12:15:00Z',
      userName: 'Rajesh K.'
    },
    {
      id: '4',
      menuItemId: 'starter-2',
      userId: 'demo-user-4',
      rating: 4,
      review: 'Great samosas! Crispy on the outside and flavorful filling inside. Perfect for appetizers.',
      createdAt: '2025-01-23T16:45:00Z',
      userName: 'Anita P.'
    },
    {
      id: '5',
      menuItemId: 'main-2',
      userId: 'demo-user-5',
      rating: 5,
      review: 'Outstanding mutton curry! The meat was so tender it fell off the bone. The spices were perfectly balanced. Excellent quality!',
      createdAt: '2025-01-24T11:20:00Z',
      userName: 'Suresh M.'
    },
    {
      id: '6',
      menuItemId: 'rice-2',
      userId: 'demo-user-6',
      rating: 4,
      review: 'Good mutton biryani. The rice was well-cooked and the mutton was tender. Could use a bit more spice but overall very good.',
      createdAt: '2025-01-25T14:30:00Z',
      userName: 'Kavitha R.'
    },
    {
      id: '7',
      menuItemId: 'starter-1',
      userId: 'demo-user-7',
      rating: 5,
      review: 'Absolutely fantastic! The Chicken 65 was perfectly marinated and fried to perfection. The spice level was just right. Will order again soon!',
      createdAt: '2025-01-26T09:15:00Z',
      userName: 'Vikram N.'
    },
    {
      id: '8',
      menuItemId: 'main-1',
      userId: 'demo-user-8',
      rating: 5,
      review: 'Exceptional butter chicken! The sauce was rich and creamy, and the chicken pieces were perfectly cooked. This is restaurant-quality food delivered to your door!',
      createdAt: '2025-01-27T18:00:00Z',
      userName: 'Deepa L.'
    }
  ],
  ratingStats: [
    {
      menuItemId: 'starter-1',
      averageRating: 4.9,
      totalRatings: 15,
      ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 1, 5: 14 }
    },
    {
      menuItemId: 'main-1',
      averageRating: 4.7,
      totalRatings: 10,
      ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 3, 5: 7 }
    },
    {
      menuItemId: 'rice-1',
      averageRating: 4.9,
      totalRatings: 15,
      ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 2, 5: 13 }
    },
    {
      menuItemId: 'starter-2',
      averageRating: 4.4,
      totalRatings: 8,
      ratingDistribution: { 1: 0, 2: 0, 3: 1, 4: 3, 5: 4 }
    },
    {
      menuItemId: 'main-2',
      averageRating: 4.8,
      totalRatings: 12,
      ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 2, 5: 10 }
    },
    {
      menuItemId: 'rice-2',
      averageRating: 4.2,
      totalRatings: 6,
      ratingDistribution: { 1: 0, 2: 0, 3: 1, 4: 2, 5: 3 }
    }
  ]
};

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'LOGIN':
      return { ...state, user: action.payload, isLoggedIn: true };
    case 'DEMO_LOGIN':
      return {
        ...state,
        user: {
          id: 'demo-user-1',
          name: 'Demo User',
          email: 'demo@srfoodkraft.com',
          phone: '+91 98765 43210',
          addresses: [
            {
              id: 'addr-1',
              type: 'home',
              name: 'Home',
              address: '123 Main Street, Chennai, Tamil Nadu 600001',
              phone: '+91 98765 43210',
              isDefault: true
            },
            {
              id: 'addr-2',
              type: 'office',
              name: 'Office',
              address: '456 Business Park, Chennai, Tamil Nadu 600002',
              phone: '+91 98765 43211',
              isDefault: false
            }
          ],
          favorites: ['starter-1', 'main-1', 'rice-1']
        },
        isLoggedIn: true
      };
    case 'LOGOUT':
      return { ...state, user: null, isLoggedIn: false, cart: [] };
    case 'ADD_TO_CART':
      const existingIndex = state.cart.findIndex(item => item.id === action.payload.id);
      if (existingIndex >= 0) {
        const updatedCart = [...state.cart];
        const existingItem = updatedCart[existingIndex];
        const newTotalQuantity = existingItem.quantity + action.payload.quantity;
        const maxQuantity = action.payload.menuItem.maxQuantity || 10;

        // Check if adding this quantity would exceed max limit
        if (newTotalQuantity > maxQuantity) {
          // Return error state - we'll handle this in the component
          return {
            ...state,
            cartError: {
              type: 'MAX_QUANTITY_EXCEEDED',
              message: `Maximum quantity limit of ${maxQuantity} ${action.payload.unit} exceeded. Current: ${existingItem.quantity}, Trying to add: ${action.payload.quantity}`,
              itemName: action.payload.menuItem.name,
              currentQuantity: existingItem.quantity,
              maxQuantity: maxQuantity
            }
          };
        }

        // Accumulate quantities if within limit
        updatedCart[existingIndex] = {
          ...updatedCart[existingIndex],
          quantity: newTotalQuantity
        };
        return { ...state, cart: updatedCart, cartError: null };
      } else {
        // Check if new item quantity exceeds max limit
        const maxQuantity = action.payload.menuItem.maxQuantity || 10;
        if (action.payload.quantity > maxQuantity) {
          return {
            ...state,
            cartError: {
              type: 'MAX_QUANTITY_EXCEEDED',
              message: `Maximum quantity limit of ${maxQuantity} ${action.payload.unit} exceeded. Trying to add: ${action.payload.quantity}`,
              itemName: action.payload.menuItem.name,
              currentQuantity: 0,
              maxQuantity: maxQuantity
            }
          };
        }
        return { ...state, cart: [...state.cart, action.payload], cartError: null };
      }
    case 'UPDATE_CART_ITEM':
      const itemToUpdate = state.cart.find(item => item.id === action.payload.id);
      if (itemToUpdate) {
        const maxQuantity = itemToUpdate.menuItem.maxQuantity || 10;
        if (action.payload.quantity > maxQuantity) {
          return {
            ...state,
            cartError: {
              type: 'MAX_QUANTITY_EXCEEDED',
              message: `Maximum quantity limit of ${maxQuantity} ${itemToUpdate.unit} exceeded. Trying to set: ${action.payload.quantity}`,
              itemName: itemToUpdate.menuItem.name,
              currentQuantity: itemToUpdate.quantity,
              maxQuantity: maxQuantity
            }
          };
        }
      }
      return {
        ...state,
        cart: state.cart.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: action.payload.quantity }
            : item
        ),
        cartError: null
      };
    case 'REMOVE_FROM_CART':
      return { ...state, cart: state.cart.filter(item => item.id !== action.payload) };
    case 'CLEAR_CART':
      return { ...state, cart: [] };
    case 'CLEAR_CART_ERROR':
      return { ...state, cartError: null };
    case 'ADD_ORDER':
      return { ...state, orders: [...state.orders, action.payload] };
    case 'CANCEL_ORDER':
      return {
        ...state,
        orders: state.orders.map(order =>
          order.id === action.payload
            ? { ...order, status: 'cancelled' as const }
            : order
        )
      };
    case 'ADD_TO_FAVORITES':
      if (!state.user) return state;
      return {
        ...state,
        user: {
          ...state.user,
          favorites: [...state.user.favorites, action.payload]
        }
      };
    case 'REMOVE_FROM_FAVORITES':
      if (!state.user) return state;
      return {
        ...state,
        user: {
          ...state.user,
          favorites: state.user.favorites.filter(id => id !== action.payload)
        }
      };
    case 'ADD_ADDRESS':
      if (!state.user) return state;
      return {
        ...state,
        user: {
          ...state.user,
          addresses: [...state.user.addresses, action.payload]
        }
      };
    case 'UPDATE_ADDRESS':
      if (!state.user) return state;
      return {
        ...state,
        user: {
          ...state.user,
          addresses: state.user.addresses.map(addr =>
            addr.id === action.payload.id ? action.payload : addr
          )
        }
      };
    case 'DELETE_ADDRESS':
      if (!state.user) return state;
      return {
        ...state,
        user: {
          ...state.user,
          addresses: state.user.addresses.filter(addr => addr.id !== action.payload)
        }
      };
    case 'ADD_RATING':
      const newRating = action.payload;
      const updatedRatings = [...state.ratings, newRating];

      // Update stats
      const existingStatsIndex = state.ratingStats.findIndex(s => s.menuItemId === newRating.menuItemId);
      const itemRatings = updatedRatings.filter(r => r.menuItemId === newRating.menuItemId);
      const avgRating = itemRatings.reduce((sum, r) => sum + r.rating, 0) / itemRatings.length;
      const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      itemRatings.forEach(r => distribution[r.rating as keyof typeof distribution]++);

      const newStats: MenuItemStats = {
        menuItemId: newRating.menuItemId,
        averageRating: avgRating,
        totalRatings: itemRatings.length,
        ratingDistribution: distribution
      };

      const updatedStats = existingStatsIndex >= 0
        ? state.ratingStats.map((s, i) => i === existingStatsIndex ? newStats : s)
        : [...state.ratingStats, newStats];

      return { ...state, ratings: updatedRatings, ratingStats: updatedStats };

    case 'UPDATE_RATING':
      const updatedRating = action.payload;
      const ratingsAfterUpdate = state.ratings.map(r =>
        r.id === updatedRating.id ? updatedRating : r
      );

      // Recalculate stats for this menu item
      const itemRatingsAfterUpdate = ratingsAfterUpdate.filter(r => r.menuItemId === updatedRating.menuItemId);
      const newAvgRating = itemRatingsAfterUpdate.reduce((sum, r) => sum + r.rating, 0) / itemRatingsAfterUpdate.length;
      const newDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      itemRatingsAfterUpdate.forEach(r => newDistribution[r.rating as keyof typeof newDistribution]++);

      const statsAfterUpdate = state.ratingStats.map(s =>
        s.menuItemId === updatedRating.menuItemId
          ? { ...s, averageRating: newAvgRating, totalRatings: itemRatingsAfterUpdate.length, ratingDistribution: newDistribution }
          : s
      );

      return { ...state, ratings: ratingsAfterUpdate, ratingStats: statsAfterUpdate };

    case 'DELETE_RATING':
      const ratingsAfterDelete = state.ratings.filter(r => r.id !== action.payload);
      // Note: In a real app, you'd also recalculate stats here
      return { ...state, ratings: ratingsAfterDelete };

    default:
      return state;
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}

// Helper functions for ratings
export function useRatings(menuItemId: string) {
  const { state, dispatch } = useApp();

  const stats = state.ratingStats.find(s => s.menuItemId === menuItemId);
  const userRating = state.user ? state.ratings.find(r => r.menuItemId === menuItemId && r.userId === state.user!.id) : null;
  const allRatings = state.ratings.filter(r => r.menuItemId === menuItemId);

  return {
    stats,
    userRating,
    allRatings,
    dispatch
  };
}