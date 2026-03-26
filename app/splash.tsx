import { useEffect } from 'react';
import { Image, View } from 'react-native';
import { useFonts } from 'expo-font';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/ui/themed-text';
import { useAuthStore } from '@/store/authStore';
import { useOnboardingStore } from '@/store/onboardingStore';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

export default function AppSplashScreen() {
  const router = useRouter();
  const [fontsLoaded] = useFonts({
    LedgerSans: require('../src/assets/fonts/LedgerSans-Regular.ttf'),
    LedgerSansBold: require('../src/assets/fonts/LedgerSans-Bold.ttf'),
    LedgerDisplayBold: require('../src/assets/fonts/LedgerDisplay-Bold.ttf'),
  });
  const hydrate = useAuthStore((state) => state.hydrate);
  const isAuthLoading = useAuthStore((state) => state.isLoading);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const onboardingDone = useOnboardingStore((s) => s.onboardingDone);
  const onboardingHydrated = useOnboardingStore((s) => s._hasHydrated);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.82);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.ease) });
    scale.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.back(1.3)) });
  }, [opacity, scale]);

  useEffect(() => {
    if (isAuthLoading || !fontsLoaded || !onboardingHydrated) return;

    const timer = setTimeout(() => {
      if (isAuthenticated) {
        router.replace(onboardingDone ? '/(tabs)' : '/onboarding');
      } else {
        router.replace('/(auth)/login');
      }
    }, 1200);

    return () => clearTimeout(timer);
  }, [fontsLoaded, isAuthLoading, isAuthenticated, onboardingDone, onboardingHydrated, router]);

  return (
    <View className="flex-1 items-center justify-center bg-[#0b0b0c]">
      <Animated.View className="items-center gap-6" style={animatedStyle}>
        <Image
          source={require('../src/assets/images/android-icon-foreground.png')}
          style={{ width: 140, height: 140 }}
          resizeMode="contain"
        />
        {fontsLoaded ? (
          <ThemedText
            style={{ color: '#f4f4f5', letterSpacing: 1.4, fontSize: 18, lineHeight: 24 }}
            type="defaultSemiBold">
            LEDGERNEST
          </ThemedText>
        ) : null}
      </Animated.View>
    </View>
  );
}
