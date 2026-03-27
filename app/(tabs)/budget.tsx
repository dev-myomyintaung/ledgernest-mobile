import { View, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { ThemedText } from '@/components/ui/themed-text';
import { ThemedView } from '@/components/ui/themed-view';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { PieChart } from 'react-native-gifted-charts';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useBudgets } from '@/hooks/useBudgets';
import { useAppCurrency } from '@/hooks/useAppCurrency';
import { useMemo, useCallback, useState, useEffect } from 'react';
import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import { getFloatingTabContentPaddingBottom } from '@/constants/layout';
import { CreateBudgetSheet } from '@/components/budgets/CreateBudgetSheet';
import { Colors, zinc, brand } from '@/constants/theme';
import { hexToRgba } from '@/utils/format';

const FALLBACK_COLOR = zinc[500];

const getPeriodLabel = (period: string) => {
    const now = new Date();
    switch (period) {
        case 'daily':   return now.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' });
        case 'weekly':  return `Week of ${now.toLocaleDateString([], { month: 'short', day: 'numeric' })}`;
        case 'monthly': return now.toLocaleDateString([], { month: 'long', year: 'numeric' });
        case 'yearly':  return String(now.getFullYear());
        default:        return 'Custom period';
    }
};

export default function BudgetScreen() {
    const insets      = useSafeAreaInsets();
    const colorScheme = useColorScheme();
    const isDark      = colorScheme === 'dark';
    const cs          = colorScheme ?? 'light';

    const { autoCreate } = useLocalSearchParams<{ autoCreate?: string }>();
    const { data: budgets = [], isLoading, refetch } = useBudgets();
    const [sheetVisible, setSheetVisible] = useState(false);

    // Auto-open the create sheet when arriving from the first-budget onboarding prompt
    useEffect(() => {
        if (autoCreate === '1') setSheetVisible(true);
    }, [autoCreate]);
    const contentPaddingBottom = getFloatingTabContentPaddingBottom(insets.bottom);
    const { format } = useAppCurrency();

    useFocusEffect(useCallback(() => { refetch(); }, [refetch]));

    const activeBudgets = useMemo(() => budgets.filter((b) => b.isActive), [budgets]);

    const enriched = useMemo(() =>
        activeBudgets
            .map((b) => {
                const ratio = b.amount > 0 ? b.progress.spent / b.amount : 0;
                const hex   = b.category.color ?? FALLBACK_COLOR;
                return { ...b, ratio, hex };
            })
            .sort((a, b) => b.ratio - a.ratio),
        [activeBudgets],
    );

    const totalLimit  = useMemo(() => enriched.reduce((s, b) => s + b.amount, 0), [enriched]);
    const totalSpent  = useMemo(() => enriched.reduce((s, b) => s + b.progress.spent, 0), [enriched]);
    const remaining   = totalLimit - totalSpent;
    const utilization = totalLimit > 0 ? totalSpent / totalLimit : 0;

    const needsAttention = enriched.filter((b) => b.ratio >= 0.85);
    const onTrack        = enriched.filter((b) => b.ratio < 0.85);

    const chartData = useMemo(() => {
        const slices = enriched.map((b) => ({ value: b.progress.spent, color: b.hex }));
        if (remaining > 0) slices.push({ value: remaining, color: isDark ? zinc[700] : zinc[200] });
        return slices;
    }, [enriched, remaining, isDark]);

    const periodLabel = activeBudgets.length > 0
        ? getPeriodLabel(activeBudgets[0].period)
        : getPeriodLabel('monthly');

    const card = {
        backgroundColor: isDark ? zinc[800] : zinc[100],
        borderRadius:    20,
        borderWidth:     1,
        borderColor:     isDark ? zinc[700] : zinc[200],
    } as const;

    const BudgetCard = ({ budget }: { budget: typeof enriched[number] }) => {
        const pct      = Math.min(budget.ratio, 1) * 100;
        const barColor = budget.ratio >= 1
            ? Colors[cs].danger
            : budget.ratio >= 0.8
            ? Colors[cs].warning
            : budget.hex;
        const pctColor = budget.ratio >= 1
            ? Colors[cs].danger
            : budget.ratio >= 0.8
            ? Colors[cs].warning
            : zinc[500];

        return (
            <View style={{ ...card, padding: 16 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                    {/* Category icon */}
                    <View
                        style={{
                            width: 40, height: 40, borderRadius: 12,
                            alignItems: 'center', justifyContent: 'center',
                            backgroundColor: hexToRgba(budget.hex, isDark ? 0.25 : 0.15),
                        }}
                    >
                        <IconSymbol
                            name={(budget.category.icon as any) || 'folder.fill'}
                            size={18}
                            color={budget.hex}
                        />
                    </View>

                    {/* Name + amounts */}
                    <View style={{ flex: 1 }}>
                        <ThemedText type="defaultSemiBold" className="text-sm" numberOfLines={1}>
                            {budget.name}
                        </ThemedText>
                        <ThemedText className="text-xs text-zinc-400 mt-0.5">
                            {format(budget.progress.spent)} / {format(budget.amount)}
                        </ThemedText>
                    </View>

                    {/* Percentage */}
                    <ThemedText className="text-sm font-bold" style={{ color: pctColor }}>
                        {Math.round(pct)}%
                    </ThemedText>
                </View>

                {/* Progress bar */}
                <View
                    style={{
                        height: 6, borderRadius: 4, overflow: 'hidden',
                        backgroundColor: isDark ? zinc[700] : zinc[200],
                    }}
                >
                    <View
                        style={{
                            height: '100%', borderRadius: 4,
                            width: `${pct}%`,
                            backgroundColor: barColor,
                        }}
                    />
                </View>
            </View>
        );
    };

    return (
        <ThemedView style={{ flex: 1, paddingTop: insets.top }}>

            {/* ── Header ──────────────────────────────────────────── */}
            <View className="px-4 pt-5 pb-3 flex-row items-center justify-between">
                <View>
                    <ThemedText className="text-2xl font-bold">Budgets</ThemedText>
                    <ThemedText className="text-xs text-zinc-400 mt-0.5">{periodLabel}</ThemedText>
                </View>
                <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => setSheetVisible(true)}
                    style={{
                        width: 38, height: 38, borderRadius: 19,
                        alignItems: 'center', justifyContent: 'center',
                        backgroundColor: isDark ? brand[400] : brand[500],
                    }}
                >
                    <IconSymbol name="plus" size={18} color={Colors[cs].primaryForeground} />
                </TouchableOpacity>
            </View>

            {isLoading ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator />
                </View>
            ) : (
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: contentPaddingBottom, paddingHorizontal: 16, gap: 24 }}
                >
                    {/* ── Summary card ──────────────────────────────── */}
                    {enriched.length > 0 && (
                        <View style={{ ...card, borderRadius: 24, padding: 20 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <View style={{ flex: 1, paddingRight: 16 }}>
                                    <ThemedText className="text-xs font-bold text-zinc-400 tracking-widest mb-2">
                                        THIS PERIOD
                                    </ThemedText>
                                    <ThemedText className="text-4xl font-bold">
                                        {format(totalSpent)}
                                    </ThemedText>
                                    <ThemedText className="text-xs text-zinc-400 mt-1">
                                        of {format(totalLimit)} budgeted
                                    </ThemedText>

                                    {/* Remaining pill */}
                                    <View
                                        style={{
                                            marginTop: 12,
                                            alignSelf: 'flex-start',
                                            paddingHorizontal: 10, paddingVertical: 4,
                                            borderRadius: 20,
                                            backgroundColor: remaining >= 0
                                                ? hexToRgba(Colors[cs].success, 0.12)
                                                : hexToRgba(Colors[cs].danger, 0.12),
                                        }}
                                    >
                                        <ThemedText
                                            className="text-xs font-semibold"
                                            style={{
                                                color: remaining >= 0 ? Colors[cs].success : Colors[cs].danger,
                                            }}
                                        >
                                            {remaining >= 0 ? `${format(remaining)} left` : `${format(Math.abs(remaining))} over`}
                                        </ThemedText>
                                    </View>
                                </View>

                                {chartData.length > 0 && (
                                    <PieChart
                                        data={chartData}
                                        donut
                                        radius={52}
                                        innerRadius={36}
                                        innerCircleColor={isDark ? zinc[800] : zinc[100]}
                                        strokeColor={isDark ? zinc[800] : zinc[100]}
                                        strokeWidth={2}
                                        centerLabelComponent={() => (
                                            <View className="items-center justify-center">
                                                <ThemedText className="text-[9px] text-zinc-400">Used</ThemedText>
                                                <ThemedText className="text-sm font-bold">
                                                    {Math.round(utilization * 100)}%
                                                </ThemedText>
                                            </View>
                                        )}
                                    />
                                )}
                            </View>
                        </View>
                    )}

                    {/* ── Needs attention ───────────────────────────── */}
                    {enriched.length > 0 && (
                        <View>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                                <ThemedText className="text-xs font-bold text-zinc-400 tracking-widest">
                                    NEEDS ATTENTION
                                </ThemedText>
                                {needsAttention.length > 0 && (
                                    <View
                                        style={{
                                            paddingHorizontal: 7, paddingVertical: 2,
                                            borderRadius: 20,
                                            backgroundColor: hexToRgba(Colors[cs].danger, 0.12),
                                        }}
                                    >
                                        <ThemedText
                                            className="text-[10px] font-bold"
                                            style={{ color: Colors[cs].danger }}
                                        >
                                            {needsAttention.length}
                                        </ThemedText>
                                    </View>
                                )}
                            </View>

                            {needsAttention.length === 0 ? (
                                <View
                                    style={{
                                        borderRadius: 16, borderWidth: 1, borderStyle: 'dashed',
                                        borderColor: isDark ? zinc[700] : zinc[300],
                                        padding: 16, flexDirection: 'row', alignItems: 'center', gap: 10,
                                    }}
                                >
                                    <IconSymbol name="checkmark.circle.fill" size={18} color={Colors[cs].success} />
                                    <ThemedText className="text-sm text-zinc-500">All budgets are on track.</ThemedText>
                                </View>
                            ) : (
                                <View style={{ gap: 10 }}>
                                    {needsAttention.map((budget) => (
                                        <BudgetCard key={budget.id} budget={budget} />
                                    ))}
                                </View>
                            )}
                        </View>
                    )}

                    {/* ── On track ──────────────────────────────────── */}
                    {onTrack.length > 0 && (
                        <View>
                            <ThemedText className="text-xs font-bold text-zinc-400 tracking-widest mb-3">
                                ON TRACK
                            </ThemedText>
                            <View style={{ gap: 10 }}>
                                {onTrack.map((budget) => (
                                    <BudgetCard key={budget.id} budget={budget} />
                                ))}
                            </View>
                        </View>
                    )}

                    {/* ── Empty state ───────────────────────────────── */}
                    {activeBudgets.length === 0 && (
                        <TouchableOpacity
                            activeOpacity={0.7}
                            onPress={() => setSheetVisible(true)}
                            style={{
                                borderRadius: 20, borderWidth: 1, borderStyle: 'dashed',
                                borderColor: isDark ? zinc[700] : zinc[300],
                                padding: 40, alignItems: 'center', gap: 10,
                            }}
                        >
                            <View
                                style={{
                                    width: 48, height: 48, borderRadius: 16,
                                    alignItems: 'center', justifyContent: 'center',
                                    backgroundColor: isDark ? brand[900] : brand[100],
                                }}
                            >
                                <IconSymbol name="plus" size={22} color={isDark ? brand[400] : brand[500]} />
                            </View>
                            <ThemedText className="text-zinc-500">Create your first budget</ThemedText>
                        </TouchableOpacity>
                    )}

                </ScrollView>
            )}

            <CreateBudgetSheet
                visible={sheetVisible}
                onClose={() => setSheetVisible(false)}
            />
        </ThemedView>
    );
}
