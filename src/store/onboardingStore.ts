import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface OnboardingState {
    onboardingDone: boolean;
    screensTourDone: boolean;
    firstBudgetPromptDone: boolean;
    scanTourDone: boolean;
    settingsTourDone: boolean;
    _hasHydrated: boolean;
    completeOnboarding: () => void;
    completeScreensTour: () => void;
    completeFirstBudgetPrompt: () => void;
    completeScanTour: () => void;
    completeSettingsTour: () => void;
    setHydrated: () => void;
    __resetOnboarding: () => void;
    __resetScreensTour: () => void;
    __resetFirstBudgetPrompt: () => void;
    __resetScanTour: () => void;
    __resetSettingsTour: () => void;
}

export const useOnboardingStore = create<OnboardingState>()(
    persist(
        (set) => ({
            onboardingDone: false,
            screensTourDone: false,
            firstBudgetPromptDone: false,
            scanTourDone: false,
            settingsTourDone: false,
            _hasHydrated: false,
            completeOnboarding: () => set({ onboardingDone: true }),
            completeScreensTour: () => set({ screensTourDone: true }),
            completeFirstBudgetPrompt: () => set({ firstBudgetPromptDone: true }),
            completeScanTour: () => set({ scanTourDone: true }),
            completeSettingsTour: () => set({ settingsTourDone: true }),
            setHydrated: () => set({ _hasHydrated: true }),
            __resetOnboarding: () => {
                if (__DEV__) set({ onboardingDone: false });
            },
            __resetScreensTour: () => {
                if (__DEV__) set({ screensTourDone: false });
            },
            __resetFirstBudgetPrompt: () => {
                if (__DEV__) set({ firstBudgetPromptDone: false });
            },
            __resetScanTour: () => {
                if (__DEV__) set({ scanTourDone: false });
            },
            __resetSettingsTour: () => {
                if (__DEV__) set({ settingsTourDone: false });
            },
        }),
        {
            name: 'onboarding-storage',
            storage: createJSONStorage(() => AsyncStorage),
            partialize: (state) => ({
                onboardingDone: state.onboardingDone,
                screensTourDone: state.screensTourDone,
                firstBudgetPromptDone: state.firstBudgetPromptDone,
                scanTourDone: state.scanTourDone,
                settingsTourDone: state.settingsTourDone,
            }),
            onRehydrateStorage: () => () => {
                useOnboardingStore.getState().setHydrated();
            },
        }
    )
);
