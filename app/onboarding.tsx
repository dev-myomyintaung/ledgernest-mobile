import React, { useCallback, useRef, useState } from 'react';
import {
    Button,
    Dimensions,
    FlatList,
    Image,
    Pressable,
    Text,
    View,
    ViewToken,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, {
    useAnimatedStyle,
    withSpring,
} from 'react-native-reanimated';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, Typography, brand, zinc } from '@/constants/theme';
import { useOnboardingStore } from '@/store/onboardingStore';

const { width, height } = Dimensions.get('window');

const IMAGE_HEIGHT = height * 0.50;

const slides = [
    {
        id: '1',
        image: require('../src/assets/images/onboarding_1.png') as number,
        headline: "Money's been a\nlot lately, huh?",
        body: "Every ringgit spent. Every month wondering where it all went. You're not bad with money — you just never had the right nest.",
    },
    {
        id: '2',
        image: require('../src/assets/images/onboarding_2.png') as number,
        headline: 'See the full picture,\nfinally.',
        body: 'LedgerNest puts your spending, budgets, and habits in one place. No spreadsheets. No guilt. Just clarity.',
    },
    {
        id: '3',
        image: require('../src/assets/images/onboarding_3.png') as number,
        headline: 'Small habits.\nReal wealth.',
        body: "People who track their money don't just save more — they feel more in control. LedgerNest helps you build the habit, one day at a time.",
    },
    {
        id: '4',
        image: require('../src/assets/images/onboarding_4.png') as number,
        headline: 'Your nest\nis waiting.',
        body: 'Takes 2 minutes to set up. No bank linking required to get started.',
    },
] as const;

function Dot({ active, isDark }: { active: boolean; isDark: boolean }) {
    const animatedStyle = useAnimatedStyle(() => ({
        width: withSpring(active ? 24 : 6, { damping: 15, stiffness: 180 }),
        backgroundColor: active
            ? isDark ? brand[400] : brand[500]
            : isDark ? zinc[700] : zinc[200],
    }));

    return (
        <Animated.View
            style={[{ height: 6, borderRadius: 3 }, animatedStyle]}
        />
    );
}

export default function OnboardingScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const colors = isDark ? Colors.dark : Colors.light;
    const completeOnboarding = useOnboardingStore((s) => s.completeOnboarding);

    const flatListRef = useRef<FlatList>(null);
    const [currentIndex, setCurrentIndex] = useState(0);

    const isFirst = currentIndex === 0;
    const isLast = currentIndex === slides.length - 1;

    const finish = () => {
        completeOnboarding();
        router.replace('/(tabs)');
    };

    const goNext = () => {
        if (currentIndex < slides.length - 1) {
            const next = currentIndex + 1;
            flatListRef.current?.scrollToIndex({ index: next, animated: true });
            setCurrentIndex(next);
        } else {
            finish();
        }
    };

    const goPrev = () => {
        if (currentIndex > 0) {
            const prev = currentIndex - 1;
            flatListRef.current?.scrollToIndex({ index: prev, animated: true });
            setCurrentIndex(prev);
        }
    };

    const onViewableItemsChanged = useCallback(
        ({ viewableItems }: { viewableItems: ViewToken[] }) => {
            if (viewableItems.length > 0 && viewableItems[0].index !== null) {
                setCurrentIndex(viewableItems[0].index);
            }
        },
        []
    );

    const viewabilityConfig = useRef({
        viewAreaCoveragePercentThreshold: 50,
    }).current;

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
            {/* Slides */}
            <FlatList
                ref={flatListRef}
                data={slides as unknown as typeof slides[number][]}
                keyExtractor={(item) => item.id}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                bounces={false}
                onViewableItemsChanged={onViewableItemsChanged}
                viewabilityConfig={viewabilityConfig}
                style={{ flex: 1 }}
                renderItem={({ item }) => (
                    <View style={{ width }}>
                        {/* Illustration */}
                        <View
                            style={{
                                width,
                                height: IMAGE_HEIGHT,
                                backgroundColor: isDark ? zinc[900] : brand[50],
                            }}
                        >
                            <Image
                                source={item.image}
                                style={{ width: '100%', height: '100%' }}
                                resizeMode="cover"
                            />
                        </View>

                        {/* Text */}
                        <View style={{ flex: 1, paddingHorizontal: 28, paddingTop: 28 }}>
                            <Text
                                style={{
                                    fontSize: Typography.size['2xl'],
                                    lineHeight: Typography.lineHeight['2xl'],
                                    fontWeight: Typography.weight.bold,
                                    color: colors.text,
                                    marginBottom: 12,
                                }}
                            >
                                {item.headline}
                            </Text>
                            <Text
                                style={{
                                    fontSize: Typography.size.base,
                                    lineHeight: 24,
                                    fontWeight: Typography.weight.regular,
                                    color: colors.textSecondary,
                                }}
                            >
                                {item.body}
                            </Text>
                        </View>
                    </View>
                )}
            />

            {/* Bottom controls */}
            <View
                style={{
                    paddingHorizontal: 28,
                    paddingBottom: 24,
                    paddingTop: 16,
                    gap: 20,
                    backgroundColor: colors.background,
                }}
            >
                {/* Dots + arrow nav */}
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                    {/* Dots */}
                    <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                        {slides.map((_, i) => (
                            <Dot key={i} active={i === currentIndex} isDark={isDark} />
                        ))}
                    </View>
                </View>

                {/* Skip */}
                {!isLast && <Pressable
                    onPress={finish}
                    hitSlop={10}
                    disabled={isLast}
                    style={{ alignItems: 'center', opacity: isLast ? 0 : 1 }}
                >
                    <Text
                        style={{
                            color: colors.textSecondary,
                            fontSize: Typography.size.sm,
                            fontWeight: Typography.weight.medium,
                        }}
                    >
                        Skip onboarding
                    </Text>
                </Pressable>}

                {/* Final CTA — only on last slide */}
                {isLast && (
                    <Pressable
                        onPress={finish}
                        style={{
                            backgroundColor: brand[500],
                            paddingVertical: 14,
                            borderRadius: 8,
                            alignItems: 'center',
                        }}
                    >
                        <Text
                            style={{
                                color: Colors.dark.text,
                                fontSize: Typography.size.base,
                                fontWeight: Typography.weight.medium,
                            }}
                        >
                            Get Started
                        </Text>
                    </Pressable>
                )}
            </View>
        </SafeAreaView>
    );
}
