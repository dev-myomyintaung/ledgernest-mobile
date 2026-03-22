import { View, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { ThemedText } from '@/components/ui/themed-text';
import { ThemedView } from '@/components/ui/themed-view';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { PieChart } from 'react-native-gifted-charts';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useBudgets } from '@/hooks/useBudgets';
import { useAppCurrency } from '@/hooks/useAppCurrency';
import { useMemo, useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { getFloatingTabContentPaddingBottom } from '@/constants/layout';
import { CreateBudgetSheet } from '@/components/budgets/CreateBudgetSheet';
import { Colors, zinc, brand } from '@/constants/theme';

const FALLBACK_COLOR = zinc[500];

const getPeriodLabel = (period: string) => {
    const now = new Date();
    switch (period) {
        case 'daily':
            return now.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' });
        case 'weekly':
            return `Week of ${now.toLocaleDateString([], { month: 'short', day: 'numeric' })}`;
        case 'monthly':
            return now.toLocaleDateString([], { month: 'long', year: 'numeric' });
        case 'yearly':
            return String(now.getFullYear());
        default:
            return 'Custom period';
    }
};

export default function BudgetScreen() {
    const insets = useSafeAreaInsets();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const { data: budgets = [], isLoading, refetch } = useBudgets();
    const [sheetVisible, setSheetVisible] = useState(false);
    const contentPaddingBottom = getFloatingTabContentPaddingBottom(insets.bottom);
    const { format } = useAppCurrency();

    useFocusEffect(useCallback(() => { refetch(); }, [refetch]));

    const activeBudgets = useMemo(
        () => budgets.filter((b) => b.isActive),
        [budgets],
    );

    const enriched = useMemo(
        () =>
            activeBudgets
                .map((b) => {
                    const ratio = b.amount > 0 ? b.progress.spent / b.amount : 0;
                    const hex = b.category.color ?? FALLBACK_COLOR;
                    return { ...b, ratio, hex };
                })
                .sort((a, b) => b.ratio - a.ratio),
        [activeBudgets],
    );

    const totalLimit = useMemo(() => enriched.reduce((s, b) => s + b.amount, 0), [enriched]);
    const totalSpent = useMemo(() => enriched.reduce((s, b) => s + b.progress.spent, 0), [enriched]);
    const remaining = totalLimit - totalSpent;
    const utilization = totalLimit > 0 ? totalSpent / totalLimit : 0;

    const needsAttention = enriched.filter((b) => b.ratio >= 0.85);
    const onTrack = enriched.filter((b) => b.ratio < 0.85);

    const chartData = useMemo(() => {
        const slices = enriched.map((b) => ({ value: b.progress.spent, color: b.hex }));
        if (remaining > 0) slices.push({ value: remaining, color: isDark ? zinc[700] : zinc[200] });
        return slices;
    }, [enriched, remaining, isDark]);

    const periodLabel = activeBudgets.length > 0
        ? getPeriodLabel(activeBudgets[0].period)
        : getPeriodLabel('monthly');

    return (
        <ThemedView style={{ flex: 1, paddingTop: insets.top }}>
            <View className="px-4 pt-4 pb-3 flex-row items-start justify-between">
                <View>
                    <ThemedText type="title">Budgets</ThemedText>
                    <ThemedText className="text-zinc-500 mt-1">{periodLabel}</ThemedText>
                </View>
                <TouchableOpacity
                    onPress={() => setSheetVisible(true)}
                    className="w-10 h-10 rounded-full items-center justify-center"
                    style={{ backgroundColor: isDark ? brand[400] : brand[500], marginTop: 4 }}
                >
                    <IconSymbol name="plus" size={20} color={isDark ? zinc[900] : '#FFFFFF'} />
                </TouchableOpacity>
            </View>

            {isLoading ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator />
                </View>
            ) : (
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: contentPaddingBottom }}
                    className="px-4"
                >
                    {/* Summary card */}
                    <View className="mb-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 p-5">
                        <View className="flex-row items-start justify-between">
                            <View className="flex-1 pr-4">
                                <ThemedText className="text-xs tracking-widest text-zinc-500">TOTAL SPEND</ThemedText>
                                <ThemedText className="text-4xl font-bold mt-2">
                                    {format(totalSpent)}
                                </ThemedText>
                                <ThemedText className="text-zinc-500 text-sm mt-2">
                                    {format(totalLimit)} budgeted
                                </ThemedText>
                            </View>

                            {chartData.length > 0 ? (
                                <PieChart
                                    data={chartData}
                                    donut
                                    radius={52}
                                    innerRadius={36}
                                    innerCircleColor={Colors[colorScheme ?? 'light'].background}
                                    strokeColor={Colors[colorScheme ?? 'light'].background}
                                    strokeWidth={1}
                                    centerLabelComponent={() => (
                                        <View className="items-center justify-center">
                                            <ThemedText className="text-[10px] text-zinc-500">Used</ThemedText>
                                            <ThemedText className="text-sm font-bold">
                                                {Math.round(utilization * 100)}%
                                            </ThemedText>
                                        </View>
                                    )}
                                />
                            ) : null}
                        </View>

                    </View>

                    {/* Needs attention */}
                    <View className="mb-6">
                        <ThemedText className="text-xs tracking-widest text-zinc-500 mb-3">NEEDS ATTENTION</ThemedText>
                        {needsAttention.length === 0 ? (
                            <View className="rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-700 p-4">
                                <ThemedText className="text-sm text-zinc-500">Everything is on track.</ThemedText>
                            </View>
                        ) : (
                            <View className="gap-3">
                                {needsAttention.map((budget) => {
                                    const progress = Math.min(budget.ratio, 1) * 100;
                                    return (
                                        <View key={budget.id} className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4">
                                            <View className="flex-row items-center gap-2 mb-3">
                                                <View className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: budget.hex }} />
                                                <ThemedText type="defaultSemiBold" className="text-sm flex-1" numberOfLines={1}>
                                                    {budget.name}
                                                </ThemedText>
                                                <ThemedText className="text-xs text-zinc-500">
                                                    {format(budget.progress.spent)} / {format(budget.amount)}
                                                </ThemedText>
                                            </View>

                                            <View className="h-2.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                                                <View
                                                    className="h-full rounded-full"
                                                    style={{
                                                        width: `${progress}%`,
                                                        backgroundColor: budget.ratio >= 1 ? Colors[colorScheme ?? 'light'].danger : budget.hex,
                                                    }}
                                                />
                                            </View>
                                        </View>
                                    );
                                })}
                            </View>
                        )}
                    </View>

                    {/* On track */}
                    {onTrack.length > 0 ? (
                        <View className="mb-8">
                            <ThemedText className="text-xs tracking-widest text-zinc-500 mb-3">ON TRACK</ThemedText>
                            <View className="gap-3">
                                {onTrack.map((budget) => {
                                    const progress = Math.min(budget.ratio, 1) * 100;
                                    return (
                                        <View key={budget.id} className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4">
                                            <View className="flex-row items-center gap-2 mb-2">
                                                <View className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: budget.hex }} />
                                                <ThemedText type="defaultSemiBold" className="text-sm flex-1" numberOfLines={1}>
                                                    {budget.name}
                                                </ThemedText>
                                                <ThemedText className="text-xs text-zinc-500">
                                                    {format(budget.progress.spent)} / {format(budget.amount)}
                                                </ThemedText>
                                            </View>
                                            <View className="h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                                                <View
                                                    className="h-full rounded-full"
                                                    style={{ width: `${progress}%`, backgroundColor: budget.hex }}
                                                />
                                            </View>
                                        </View>
                                    );
                                })}
                            </View>
                        </View>
                    ) : null}

                    {activeBudgets.length === 0 && !isLoading ? (
                        <TouchableOpacity
                            onPress={() => setSheetVisible(true)}
                            className="rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-700 p-8 items-center mb-6"
                        >
                            <IconSymbol name="plus" size={26} color={Colors[colorScheme ?? 'light'].icon} />
                            <ThemedText className="text-zinc-500 mt-2 text-base">Create your first budget</ThemedText>
                        </TouchableOpacity>
                    ) : null}
                </ScrollView>
            )}

            <CreateBudgetSheet
                visible={sheetVisible}
                onClose={() => setSheetVisible(false)}
            />
        </ThemedView>
    );
}
