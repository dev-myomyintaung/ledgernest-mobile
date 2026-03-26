import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface OnboardingState {
    onboardingDone: boolean;
    _hasHydrated: boolean;
    completeOnboarding: () => void;
    setHydrated: () => void;
}

export const useOnboardingStore = create<OnboardingState>()(
    persist(
        (set) => ({
            onboardingDone: false,
            _hasHydrated: false,
            completeOnboarding: () => set({ onboardingDone: true }),
            setHydrated: () => set({ _hasHydrated: true }),
        }),
        {
            name: 'onboarding-storage',
            storage: createJSONStorage(() => AsyncStorage),
            partialize: (state) => ({ onboardingDone: state.onboardingDone }),
            onRehydrateStorage: () => () => {
                useOnboardingStore.getState().setHydrated();
            },
        }
    )
);
