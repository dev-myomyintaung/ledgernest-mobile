import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import * as SecureStore from 'expo-secure-store';

export interface CurrencyOption {
    code: string;
    symbol: string;
    label: string;
}

export const CURRENCIES: CurrencyOption[] = [
    { code: 'MYR', symbol: 'RM', label: 'Malaysian Ringgit' },
    { code: 'USD', symbol: '$', label: 'US Dollar' },
    { code: 'EUR', symbol: '€', label: 'Euro' },
    { code: 'GBP', symbol: '£', label: 'British Pound' },
    { code: 'SGD', symbol: 'S$', label: 'Singapore Dollar' },
    { code: 'IDR', symbol: 'Rp', label: 'Indonesian Rupiah' },
    { code: 'JPY', symbol: '¥', label: 'Japanese Yen' },
];

interface SettingsState {
    currency: CurrencyOption;
    setCurrency: (currency: CurrencyOption) => void;
}

const secureStoreStorage = {
    getItem: async (name: string) => {
        const value = await SecureStore.getItemAsync(name);
        return value ?? null;
    },
    setItem: async (name: string, value: string) => {
        await SecureStore.setItemAsync(name, value);
    },
    removeItem: async (name: string) => {
        await SecureStore.deleteItemAsync(name);
    },
};

export const useSettingsStore = create<SettingsState>()(
    persist(
        (set) => ({
            currency: CURRENCIES[0], // default RM
            setCurrency: (currency) => set({ currency }),
        }),
        {
            name: 'settings-storage',
            storage: createJSONStorage(() => secureStoreStorage),
        }
    )
);
