import { create } from 'zustand';
import { createJSONStorage, persist, StateStorage } from 'zustand/middleware';
import * as SecureStore from 'expo-secure-store';
import { User } from '../api/endpoints/auth';

interface AuthState {
    user: User | null;
    accessToken: string | null;
    refreshToken: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;

    signIn: (accessToken: string, refreshToken: string, user: User) => Promise<void>;
    signOut: () => Promise<void>;
    /** Called by the Axios interceptor after a successful token refresh. */
    updateTokens: (accessToken: string, refreshToken: string) => void;
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
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
            isLoading: true,

            signIn: async (accessToken, refreshToken, user) => {
                set({ accessToken, refreshToken, user, isAuthenticated: true, isLoading: false });
            },

            signOut: async () => {
                set({ accessToken: null, refreshToken: null, user: null, isAuthenticated: false, isLoading: false });
            },

            updateTokens: (accessToken, refreshToken) => {
                set({ accessToken, refreshToken });
            },

            hydrate: async () => {
                try {
                    set({ isLoading: true });
                    await useAuthStore.persist.rehydrate();
                    const accessToken = get().accessToken;
                    set({ isAuthenticated: !!accessToken, isLoading: false });
                } catch (error) {
                    console.error('Failed to hydrate auth state:', error);
                    set({ accessToken: null, refreshToken: null, user: null, isAuthenticated: false, isLoading: false });
                }
            },
        }),
        {
            name: 'auth-storage',
            storage: createJSONStorage(() => secureStoreStorage),
            partialize: (state) => ({
                user: state.user,
                accessToken: state.accessToken,
                refreshToken: state.refreshToken,
            }),
            onRehydrateStorage: () => (state, error) => {
                if (error) {
                    console.error('Failed to rehydrate auth store:', error);
                    useAuthStore.setState({ accessToken: null, refreshToken: null, user: null, isAuthenticated: false, isLoading: false });
                    return;
                }
                useAuthStore.setState({
                    isAuthenticated: !!state?.accessToken,
                    isLoading: false,
                });
            },
            version: 2,
            migrate: async (persistedState: any) => {
                // Migrate from v1 (single `token` field) to v2 (`accessToken` + `refreshToken`)
                if (persistedState?.token && !persistedState?.accessToken) {
                    return {
                        ...persistedState,
                        accessToken: persistedState.token,
                        refreshToken: null,
                        token: undefined,
                    } as AuthState;
                }
                return persistedState as AuthState;
            },
        }
    )
);
