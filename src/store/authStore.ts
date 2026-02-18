import { create } from 'zustand';
import { createJSONStorage, persist, StateStorage } from 'zustand/middleware';
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

const secureStoreStorage: StateStorage = {
    getItem: async (name) => {
        const value = await SecureStore.getItemAsync(name);
        return value ?? null;
    },
    setItem: async (name, value) => {
        await SecureStore.setItemAsync(name, value);
    },
    removeItem: async (name) => {
        await SecureStore.deleteItemAsync(name);
    },
};

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: true,

            signIn: async (token, user) => {
                set({ token, user, isAuthenticated: true, isLoading: false });
            },

            signOut: async () => {
                set({ token: null, user: null, isAuthenticated: false, isLoading: false });
            },

            hydrate: async () => {
                try {
                    set({ isLoading: true });
                    await useAuthStore.persist.rehydrate();
                    let token = get().token;

                    // Backward compatibility: migrate legacy plain "token" key into persisted auth store.
                    if (!token) {
                        const legacyToken = await SecureStore.getItemAsync('token');
                        if (legacyToken) {
                            token = legacyToken;
                            set({ token: legacyToken, isAuthenticated: true });
                            await SecureStore.deleteItemAsync('token');
                        }
                    }

                    set({ isAuthenticated: !!token, isLoading: false });
                } catch (error) {
                    console.error('Failed to hydrate auth state:', error);
                    set({ token: null, user: null, isAuthenticated: false, isLoading: false });
                }
            },
        }),
        {
            name: 'auth-storage',
            storage: createJSONStorage(() => secureStoreStorage),
            partialize: (state) => ({
                user: state.user,
                token: state.token,
            }),
            onRehydrateStorage: () => (state, error) => {
                if (error) {
                    console.error('Failed to rehydrate auth store:', error);
                    useAuthStore.setState({ token: null, user: null, isAuthenticated: false, isLoading: false });
                    return;
                }
                useAuthStore.setState({
                    isAuthenticated: !!state?.token,
                    isLoading: false,
                });
            },
            version: 1,
            migrate: async (persistedState) => persistedState as AuthState,
        }
    )
);
