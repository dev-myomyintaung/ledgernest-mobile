import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { User } from '../api/endpoints/auth';

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;

    signIn: (token: string, user: User) => Promise<void>;
    signOut: () => Promise<void>;
    hydrate: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,

    signIn: async (token, user) => {
        await SecureStore.setItemAsync('token', token);
        set({ token, user, isAuthenticated: true });
    },

    signOut: async () => {
        await SecureStore.deleteItemAsync('token');
        set({ token: null, user: null, isAuthenticated: false });
    },

    hydrate: async () => {
        try {
            const token = await SecureStore.getItemAsync('token');
            if (token) {
                set({ token, isAuthenticated: true, isLoading: false });
            } else {
                set({ token: null, isAuthenticated: false, isLoading: false });
            }
        } catch (error) {
            console.error('Failed to hydrate auth state:', error);
            set({ token: null, isAuthenticated: false, isLoading: false });
        }
    },
}));
