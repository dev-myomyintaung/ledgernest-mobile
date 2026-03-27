import React, { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/ui/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, Typography, brand, zinc } from '@/constants/theme';
import { useOnboardingStore } from '@/store/onboardingStore';
import { useTourContext } from '@/context/TourContext';

const { height: SCREEN_H } = Dimensions.get('screen');
const SPOTLIGHT_PAD = 12;
const OVERLAY = 'rgba(0,0,0,0.72)';

const STEPS = [
  {
    targetId: 'tab-index',
    route: '/(tabs)' as const,
    icon: 'house.fill',
    title: 'Your financial snapshot',
    description:
      'The home screen shows your monthly balance, income vs expenses, and spending trends — updated in real time.',
  },
  {
    targetId: 'tab-transactions',
    route: '/(tabs)/transactions' as const,
    icon: 'list.bullet',
    title: 'Every ringgit, tracked',
    description:
      'Log transactions manually or scan a receipt. Each entry is categorized so you always know where your money goes.',
  },
  {
    targetId: 'tab-budget',
    route: '/(tabs)/budget' as const,
    icon: 'chart.bar.fill',
    title: 'Budgets that work for you',
    description:
      'Set monthly limits per category. LedgerNest warns you before you overspend — not after.',
  },
  {
    targetId: 'tab-fab',
    route: null,
    icon: 'viewfinder',
    title: 'Scan receipts instantly',
    description:
      'Tap the center button anytime to capture a receipt. OCR reads it and fills in the details automatically.',
  },
] as const;

type Rect = { x: number; y: number; width: number; height: number };

export function ProductTour() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;
  const { measureTarget } = useTourContext();

  const tourDone = useOnboardingStore((s) => s.screensTourDone);
  const completeTour = useOnboardingStore((s) => s.completeScreensTour);

  const [step, setStep] = useState(0);
  const [spotlight, setSpotlight] = useState<Rect | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Reset to step 0 whenever tour is re-enabled (e.g. dev reset)
  useEffect(() => {
    if (!tourDone) {
      setStep(0);
      setSpotlight(null);
      fadeAnim.setValue(0);
    }
  }, [tourDone]);

  // Navigate + measure on each step change
  useEffect(() => {
    if (tourDone) return;

    fadeAnim.setValue(0);
    setSpotlight(null);

    const current = STEPS[step];
    if (current.route) router.navigate(current.route);

    // Give navigation animation time to settle before measuring
    const delay = current.route ? 420 : 150;
    const timer = setTimeout(async () => {
      const pos = await measureTarget(current.targetId);
      if (pos) setSpotlight(pos);
      Animated.timing(fadeAnim, { toValue: 1, duration: 220, useNativeDriver: true }).start();
    }, delay);

    return () => clearTimeout(timer);
  }, [step, tourDone]);

  if (tourDone) return null;

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  const handleNext = () => {
    if (isLast) completeTour();
    else setStep((s) => s + 1);
  };

  // Padded spotlight rect (screen-absolute)
  const sl = spotlight
    ? {
        x: spotlight.x - SPOTLIGHT_PAD,
        y: spotlight.y - SPOTLIGHT_PAD,
        w: spotlight.width + SPOTLIGHT_PAD * 2,
        h: spotlight.height + SPOTLIGHT_PAD * 2,
      }
    : null;

  // Card lives in the space above the spotlight (or top 65% if no spotlight yet)
  const cardContainerHeight = sl ? Math.max(sl.y - 16, SCREEN_H * 0.4) : SCREEN_H * 0.65;

  return (
    <Animated.View
      style={[StyleSheet.absoluteFillObject, { zIndex: 999, elevation: 999, opacity: fadeAnim }]}
      pointerEvents="box-none"
    >
      {/* ── Spotlight overlay (4 dark sections + transparent blocker) ── */}
      {sl ? (
        <>
          <View style={[styles.overlay, { top: 0, left: 0, right: 0, height: sl.y }]} />
          <View style={[styles.overlay, { top: sl.y + sl.h, left: 0, right: 0, bottom: 0 }]} />
          <View style={[styles.overlay, { top: sl.y, left: 0, width: sl.x, height: sl.h }]} />
          <View style={[styles.overlay, { top: sl.y, left: sl.x + sl.w, right: 0, height: sl.h }]} />
          {/* transparent touch-blocker over the hole so user can't interact with tab bar */}
          <View style={{ position: 'absolute', top: sl.y, left: sl.x, width: sl.w, height: sl.h }} />
          {/* highlight ring */}
          <View
            pointerEvents="none"
            style={{
              position: 'absolute',
              top: sl.y,
              left: sl.x,
              width: sl.w,
              height: sl.h,
              borderRadius: 18,
              borderWidth: 2,
              borderColor: isDark ? brand[400] : brand[500],
            }}
          />
        </>
      ) : (
        <View style={[StyleSheet.absoluteFillObject, styles.overlay]} />
      )}

      {/* ── Center card (floats in space above spotlight) ── */}
      <View
        pointerEvents="box-none"
        style={{
          position: 'absolute',
          top: 0,
          left: 20,
          right: 20,
          height: cardContainerHeight,
          justifyContent: 'center',
        }}
      >
        <View
          style={{
            backgroundColor: colors.background,
            borderRadius: 24,
            padding: 24,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 12 },
            shadowOpacity: 0.28,
            shadowRadius: 20,
            elevation: 20,
          }}
        >
          {/* Skip */}
          <Pressable
            onPress={completeTour}
            hitSlop={12}
            style={{ position: 'absolute', top: 18, right: 20 }}
          >
            <ThemedText
              style={{
                color: zinc[500],
                fontSize: Typography.size.sm,
                fontWeight: Typography.weight.medium,
              }}
            >
              Skip
            </ThemedText>
          </Pressable>

          {/* Icon */}
          <View
            style={{
              width: 52,
              height: 52,
              borderRadius: 16,
              backgroundColor: isDark ? brand[900] : brand[50],
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 16,
            }}
          >
            <IconSymbol
              name={current.icon as any}
              size={24}
              color={isDark ? brand[300] : brand[500]}
            />
          </View>

          <ThemedText
            style={{
              fontSize: Typography.size.xl,
              fontWeight: Typography.weight.bold,
              lineHeight: Typography.lineHeight.xl,
              marginBottom: 8,
            }}
          >
            {current.title}
          </ThemedText>

          <ThemedText
            style={{
              fontSize: Typography.size.sm,
              lineHeight: 22,
              color: colors.textSecondary,
              marginBottom: 24,
            }}
          >
            {current.description}
          </ThemedText>

          {/* Dots + Next button */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', gap: 6 }}>
              {STEPS.map((_, i) => (
                <View
                  key={i}
                  style={{
                    height: 5,
                    width: i === step ? 20 : 5,
                    borderRadius: 3,
                    backgroundColor:
                      i === step
                        ? isDark ? brand[400] : brand[500]
                        : isDark ? zinc[700] : zinc[200],
                  }}
                />
              ))}
            </View>

            <Pressable
              onPress={handleNext}
              style={{
                backgroundColor: isDark ? brand[400] : brand[500],
                paddingVertical: 10,
                paddingHorizontal: 22,
                borderRadius: 10,
              }}
            >
              <ThemedText
                style={{
                  color: Colors.dark.text,
                  fontSize: Typography.size.sm,
                  fontWeight: Typography.weight.semibold,
                }}
              >
                {isLast ? 'Get exploring' : 'Next'}
              </ThemedText>
            </Pressable>
          </View>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    backgroundColor: OVERLAY,
  },
});
