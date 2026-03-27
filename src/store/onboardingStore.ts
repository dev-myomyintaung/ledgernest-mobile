import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface OnboardingState {
    onboardingDone: boolean;
    screensTourDone: boolean;
    _hasHydrated: boolean;
    completeOnboarding: () => void;
    completeScreensTour: () => void;
    setHydrated: () => void;
    __resetOnboarding: () => void;
    __resetScreensTour: () => void;
}

export const useOnboardingStore = create<OnboardingState>()(
    persist(
        (set) => ({
            onboardingDone: false,
            screensTourDone: false,
            _hasHydrated: false,
            completeOnboarding: () => set({ onboardingDone: true }),
            completeScreensTour: () => set({ screensTourDone: true }),
            setHydrated: () => set({ _hasHydrated: true }),
            __resetOnboarding: () => {
                if (__DEV__) set({ onboardingDone: false });
            },
            __resetScreensTour: () => {
                if (__DEV__) set({ screensTourDone: false });
            },
        }),
        {
            name: 'onboarding-storage',
            storage: createJSONStorage(() => AsyncStorage),
            partialize: (state) => ({
                onboardingDone: state.onboardingDone,
                screensTourDone: state.screensTourDone,
            }),
            onRehydrateStorage: () => () => {
                useOnboardingStore.getState().setHydrated();
            },
        }
    )
);
