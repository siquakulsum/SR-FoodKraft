import { create } from 'zustand';
import { api } from '@/services/api';

interface BusinessSettings {
  gstRate: number; // GST rate as percentage (e.g., 18 for 18%)
  businessName: string;
  businessAddress: string;
  gstNumber: string;
  currency: string;
  deliveryCharges: number;
  serviceCharges: number;
  deliveryZones: Array<{
    id: string;
    name: string;
    description: string;
    deliveryCharges: number;
    estimatedTime: string;
    isActive: boolean;
  }>;
}

interface SettingsState {
  settings: BusinessSettings;
  loading: boolean;
  initialize: () => Promise<void>;
  updateSettings: (newSettings: Partial<BusinessSettings>) => Promise<void>;
  calculateGST: (amount: number) => { gstAmount: number; totalWithGST: number };
  calculateOrderTotal: (subtotal: number, deliveryCharges?: number, serviceCharges?: number) => {
    subtotal: number;
    gstAmount: number;
    deliveryCharges: number;
    serviceCharges: number;
    total: number;
  };
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: {
    gstRate: 18,
    businessName: 'SR FoodKraft',
    businessAddress: '123 Main Street, New Delhi',
    gstNumber: '29ABCDE1234F1Z5',
    currency: 'INR',
    deliveryCharges: 50,
    serviceCharges: 0,
    deliveryZones: [
      {
        id: '1',
        name: 'Within 5km',
        description: 'Local delivery within 5 kilometers',
        deliveryCharges: 50,
        estimatedTime: '30-45 mins',
        isActive: true,
      },
      {
        id: '2',
        name: '5-10km',
        description: 'Extended delivery area',
        deliveryCharges: 100,
        estimatedTime: '45-60 mins',
        isActive: true,
      },
      {
        id: '3',
        name: '10-15km',
        description: 'Outer delivery zone',
        deliveryCharges: 150,
        estimatedTime: '60-90 mins',
        isActive: true,
      },
    ],
  },
  loading: false,

  initialize: async () => {
    set({ loading: true });
    try {
      const dbSettings = await api.getCMSSettings();
      const mappedSettings: any = {};
      dbSettings.forEach((s: any) => {
        if (s.type === 'number') mappedSettings[s.key] = parseFloat(s.value);
        else if (s.type === 'json') {
          try {
            mappedSettings[s.key] = JSON.parse(s.value);
          } catch (e) {
            console.error(`Failed to parse JSON for ${s.key}:`, e);
          }
        }
        else mappedSettings[s.key] = s.value;
      });

      if (Object.keys(mappedSettings).length > 0) {
        set((state) => ({
          settings: { ...state.settings, ...mappedSettings }
        }));
      }
    } catch (error) {
      console.error('Failed to initialize settings:', error);
    } finally {
      set({ loading: false });
    }
  },

  updateSettings: async (newSettings) => {
    set({ loading: true });
    try {
      // Save each setting to DB
      const promises = Object.entries(newSettings).map(([key, value]) => {
        let type = 'text';
        let stringValue = String(value);

        if (typeof value === 'number') {
          type = 'number';
        } else if (typeof value === 'object') {
          type = 'json';
          stringValue = JSON.stringify(value);
        }

        return api.updateCMSSetting(key, stringValue, type);
      });
      await Promise.all(promises);

      set((state) => ({
        settings: { ...state.settings, ...newSettings },
      }));
    } catch (error) {
      console.error('Failed to update settings:', error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  calculateGST: (amount) => {
    const { gstRate } = get().settings;
    const gstAmount = (amount * gstRate) / 100;
    return {
      gstAmount,
      totalWithGST: amount + gstAmount,
    };
  },

  calculateOrderTotal: (subtotal, deliveryCharges = 0, serviceCharges = 0) => {
    const { gstRate, deliveryCharges: defaultDelivery, serviceCharges: defaultService } = get().settings;
    const finalDeliveryCharges = deliveryCharges || defaultDelivery;
    const finalServiceCharges = serviceCharges || defaultService;

    const taxableAmount = subtotal + finalDeliveryCharges + finalServiceCharges;
    const gstAmount = (taxableAmount * gstRate) / 100;
    const total = taxableAmount + gstAmount;

    return {
      subtotal,
      gstAmount,
      deliveryCharges: finalDeliveryCharges,
      serviceCharges: finalServiceCharges,
      total,
    };
  },
}));

