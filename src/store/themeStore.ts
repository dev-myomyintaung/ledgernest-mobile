import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import * as SecureStore from 'expo-secure-store';

export type ThemePreference = 'system' | 'light' | 'dark';

interface ThemeState {
    preference: ThemePreference;
    _hasHydrated: boolean;
    setPreference: (preference: ThemePreference) => void;
    _setHasHydrated: (value: boolean) => void;
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

export const useThemeStore = create<ThemeState>()(
    persist(
        (set) => ({
            preference: 'system',
            _hasHydrated: false,
            setPreference: (preference) => set({ preference }),
            _setHasHydrated: (value) => set({ _hasHydrated: value }),
        }),
        {
            name: 'theme-storage',
            storage: createJSONStorage(() => secureStoreStorage),
            onRehydrateStorage: () => (state) => {
                state?._setHasHydrated(true);
            },
        }
    )
);
