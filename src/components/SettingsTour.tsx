import React, { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Pressable, StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/ui/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, Typography, brand, zinc } from '@/constants/theme';
import { useOnboardingStore } from '@/store/onboardingStore';
import { useTourContext } from '@/context/TourContext';

const { height: SCREEN_H } = Dimensions.get('window');
const SPOTLIGHT_PAD = 8;
const OVERLAY = 'rgba(0,0,0,0.72)';

const STEPS = [
    {
        targetId: 'settings-profile',
        icon: 'person.crop.circle.fill' as const,
        title: 'Your profile',
        description: 'Tap to update your display name and photo. They show up in search results and receipt sharing.',
    },
    {
        targetId: 'settings-social',
        icon: 'person.2.fill' as const,
        title: 'Connect with others',
        description: 'Find friends, manage your connections, and check items people have shared with you.',
    },
    {
        targetId: 'settings-preferences',
        icon: 'slider.horizontal.3' as const,
        title: 'Make it yours',
        description: 'Switch between light and dark mode, and set your preferred currency for all totals.',
    },
    {
        targetId: 'settings-data',
        icon: 'folder.fill' as const,
        title: 'Your financial data',
        description: 'Edit spending categories and jump straight to your budgets from here.',
    },
];

type Rect = { x: number; y: number; width: number; height: number };

export function SettingsTour() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const colors = isDark ? Colors.dark : Colors.light;
    const { measureTarget } = useTourContext();

    const scanTourDone = useOnboardingStore((s) => s.scanTourDone);
    const settingsTourDone = useOnboardingStore((s) => s.settingsTourDone);
    const completeSettingsTour = useOnboardingStore((s) => s.completeSettingsTour);

    const [step, setStep] = useState(0);
    const [spotlight, setSpotlight] = useState<Rect | null>(null);
    const fadeAnim = useRef(new Animated.Value(0)).current;

    const visible = scanTourDone && !settingsTourDone;

    // Reset step when tour becomes visible again (dev reset)
    useEffect(() => {
        if (visible) {
            setStep(0);
            setSpotlight(null);
            fadeAnim.setValue(0);
        }
    }, [visible]);

    useEffect(() => {
        if (!visible) return;

        fadeAnim.setValue(0);
        setSpotlight(null);

        const timer = setTimeout(async () => {
            const pos = await measureTarget(STEPS[step].targetId);
            if (pos) setSpotlight(pos);
            Animated.timing(fadeAnim, { toValue: 1, duration: 220, useNativeDriver: true }).start();
        }, 300);

        return () => clearTimeout(timer);
    }, [step, visible]);

    if (!visible) return null;

    const current = STEPS[step];
    const isLast = step === STEPS.length - 1;

    const handleNext = () => {
        if (isLast) {
            completeSettingsTour();
        } else {
            fadeAnim.setValue(0);
            setSpotlight(null);
            setStep((s) => s + 1);
        }
    };

    const sl = spotlight
        ? {
              x: spotlight.x - SPOTLIGHT_PAD,
              y: spotlight.y - SPOTLIGHT_PAD,
              w: spotlight.width + SPOTLIGHT_PAD * 2,
              h: spotlight.height + SPOTLIGHT_PAD * 2,
          }
        : null;

    const spotlightMidY = sl ? sl.y + sl.h / 2 : SCREEN_H / 2;
    const targetInUpperHalf = spotlightMidY < SCREEN_H / 2;
    const cardPosition = sl
        ? targetInUpperHalf
            ? { top: sl.y + sl.h + 20 }
            : { bottom: SCREEN_H - sl.y + 20 }
        : { top: SCREEN_H * 0.3 };

    return (
        <Animated.View
            style={[StyleSheet.absoluteFillObject, { zIndex: 999, elevation: 999, opacity: fadeAnim }]}
            pointerEvents="box-none"
        >
            {/* ── Spotlight overlay ── */}
            {sl ? (
                <>
                    <View style={[styles.overlay, { top: 0, left: 0, right: 0, height: sl.y }]} />
                    <View style={[styles.overlay, { top: sl.y + sl.h, left: 0, right: 0, bottom: 0 }]} />
                    <View style={[styles.overlay, { top: sl.y, left: 0, width: sl.x, height: sl.h }]} />
                    <View style={[styles.overlay, { top: sl.y, left: sl.x + sl.w, right: 0, height: sl.h }]} />
                    <View style={{ position: 'absolute', top: sl.y, left: sl.x, width: sl.w, height: sl.h }} />
                    <View
                        pointerEvents="none"
                        style={{
                            position: 'absolute',
                            top: sl.y, left: sl.x, width: sl.w, height: sl.h,
                            borderRadius: 20, borderWidth: 2,
                            borderColor: isDark ? brand[400] : brand[500],
                        }}
                    />
                </>
            ) : (
                <View style={[StyleSheet.absoluteFillObject, styles.overlay]} />
            )}

            {/* ── Floating card ── */}
            <View
                pointerEvents="box-none"
                style={[{ position: 'absolute', left: 20, right: 20 }, cardPosition]}
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
                        onPress={completeSettingsTour}
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
                            width: 48, height: 48, borderRadius: 14,
                            backgroundColor: isDark ? brand[900] : brand[50],
                            alignItems: 'center', justifyContent: 'center',
                            marginBottom: 14,
                        }}
                    >
                        <IconSymbol
                            name={current.icon}
                            size={22}
                            color={isDark ? brand[300] : brand[500]}
                        />
                    </View>

                    <ThemedText
                        style={{
                            fontSize: Typography.size.lg,
                            fontWeight: Typography.weight.bold,
                            lineHeight: Typography.lineHeight.lg,
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
                            marginBottom: 22,
                        }}
                    >
                        {current.description}
                    </ThemedText>

                    {/* Dots + Next */}
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
                                {isLast ? 'Got it' : 'Next'}
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
