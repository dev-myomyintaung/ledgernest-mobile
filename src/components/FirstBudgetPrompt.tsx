import { Modal, Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/ui/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, Typography, brand, zinc } from '@/constants/theme';
import { useOnboardingStore } from '@/store/onboardingStore';

export function FirstBudgetPrompt() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const colors = isDark ? Colors.dark : Colors.light;

    const screensTourDone = useOnboardingStore((s) => s.screensTourDone);
    const firstBudgetPromptDone = useOnboardingStore((s) => s.firstBudgetPromptDone);
    const completeFirstBudgetPrompt = useOnboardingStore((s) => s.completeFirstBudgetPrompt);

    const visible = screensTourDone && !firstBudgetPromptDone;

    const handleCreate = () => {
        completeFirstBudgetPrompt();
        router.navigate({ pathname: '/(tabs)/budget', params: { autoCreate: '1' } });
    };

    const handleSkip = () => {
        completeFirstBudgetPrompt();
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            statusBarTranslucent
            onRequestClose={handleSkip}
        >
            {/* Backdrop */}
            <Pressable
                style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.45)' }}
                onPress={handleSkip}
            />

            {/* Sheet */}
            <View
                style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    backgroundColor: colors.background,
                    borderTopLeftRadius: 28,
                    borderTopRightRadius: 28,
                    paddingTop: 12,
                    paddingHorizontal: 28,
                    paddingBottom: Math.max(insets.bottom, 24) + 12,
                }}
            >
                {/* Drag handle */}
                <View
                    style={{
                        width: 36,
                        height: 4,
                        borderRadius: 2,
                        backgroundColor: isDark ? zinc[600] : zinc[300],
                        alignSelf: 'center',
                        marginBottom: 24,
                    }}
                />

                {/* Icon */}
                <View
                    style={{
                        width: 56,
                        height: 56,
                        borderRadius: 18,
                        backgroundColor: isDark ? brand[900] : brand[50],
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: 20,
                    }}
                >
                    <IconSymbol
                        name="chart.bar.fill"
                        size={26}
                        color={isDark ? brand[300] : brand[500]}
                    />
                </View>

                <ThemedText
                    style={{
                        fontSize: Typography.size['2xl'],
                        fontWeight: Typography.weight.bold,
                        lineHeight: Typography.lineHeight['2xl'],
                        marginBottom: 10,
                    }}
                >
                    Now, set your first budget
                </ThemedText>

                <ThemedText
                    style={{
                        fontSize: Typography.size.base,
                        lineHeight: 24,
                        color: colors.textSecondary,
                        marginBottom: 32,
                    }}
                >
                    Budgets keep your spending in check. Pick a category — Groceries, Dining, anything — and set a monthly limit. Takes 30 seconds.
                </ThemedText>

                {/* Create budget CTA */}
                <Pressable
                    onPress={handleCreate}
                    style={{
                        backgroundColor: isDark ? brand[400] : brand[500],
                        paddingVertical: 15,
                        borderRadius: 12,
                        alignItems: 'center',
                        marginBottom: 12,
                    }}
                >
                    <ThemedText
                        style={{
                            color: Colors.dark.text,
                            fontSize: Typography.size.base,
                            fontWeight: Typography.weight.semibold,
                        }}
                    >
                        Create a budget
                    </ThemedText>
                </Pressable>

                {/* Skip */}
                <Pressable
                    onPress={handleSkip}
                    hitSlop={10}
                    style={{ alignItems: 'center', paddingVertical: 6 }}
                >
                    <ThemedText
                        style={{
                            color: zinc[500],
                            fontSize: Typography.size.sm,
                            fontWeight: Typography.weight.medium,
                        }}
                    >
                        Maybe later
                    </ThemedText>
                </Pressable>
            </View>
        </Modal>
    );
}
