import { View, ScrollView, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/ui/themed-text';
import { ThemedView } from '@/components/ui/themed-view';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { PieChart } from 'react-native-gifted-charts';
import { useColorScheme } from '@/hooks/use-color-scheme';

type BudgetItem = {
    id: string;
    name: string;
    spent: number;
    limit: number;
    hex: string;
};

const budgets: BudgetItem[] = [
    { id: '1', name: 'Food & Drinks', spent: 320, limit: 500, hex: '#ea580c' },
    { id: '2', name: 'Transport', spent: 150, limit: 200, hex: '#2563eb' },
    { id: '3', name: 'Entertainment', spent: 80, limit: 150, hex: '#9333ea' },
    { id: '4', name: 'Shopping', spent: 450, limit: 600, hex: '#db2777' },
    { id: '5', name: 'Housing', spent: 1200, limit: 1200, hex: '#16a34a' },
];

const formatCurrency = (value: number) => `$${value.toLocaleString()}`;

const hexToRgba = (hex: string, alpha: number) => {
    const normalizedHex = hex.replace('#', '');
    const parsedHex = parseInt(normalizedHex, 16);
    const r = (parsedHex >> 16) & 255;
    const g = (parsedHex >> 8) & 255;
    const b = parsedHex & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const getStatusMeta = (ratio: number) => {
    if (ratio >= 1) {
        return { label: 'Limit reached', tone: '#dc2626' };
    }
    if (ratio >= 0.85) {
        return { label: 'Close to limit', tone: '#d97706' };
    }
    return { label: 'On track', tone: '#16a34a' };
};

export default function BudgetScreen() {
    const insets = useSafeAreaInsets();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const totalLimit = budgets.reduce((acc, curr) => acc + curr.limit, 0);
    const totalSpent = budgets.reduce((acc, curr) => acc + curr.spent, 0);
    const remaining = totalLimit - totalSpent;
    const utilization = totalSpent / totalLimit;

    const chartData = budgets.map((budget) => ({
        value: budget.spent,
        color: budget.hex,
    }));

    if (remaining > 0) {
        chartData.push({
            value: remaining,
            color: isDark ? '#3f3f46' : '#e5e7eb',
        });
    }

    const enrichedBudgets = [...budgets]
        .map((budget) => {
            const ratio = budget.spent / budget.limit;
            return {
                ...budget,
                ratio,
                status: getStatusMeta(ratio),
                amountLeft: budget.limit - budget.spent,
            };
        })
        .sort((a, b) => b.ratio - a.ratio);

    const needsAttention = enrichedBudgets.filter((budget) => budget.ratio >= 0.85);
    const onTrack = enrichedBudgets.filter((budget) => budget.ratio < 0.85);

    return (
        <ThemedView style={{ flex: 1, paddingTop: insets.top }}>
            <View className="px-6 pt-4 pb-3">
                <ThemedText type="title">Budgets</ThemedText>
                <ThemedText className="text-gray-500 mt-1">April 2024 Overview</ThemedText>
            </View>

            <ScrollView contentContainerStyle={{ paddingBottom: 110 }} className="px-6">
                <View className="mb-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 p-5">
                    <View className="flex-row items-start justify-between">
                        <View className="flex-1 pr-4">
                            <ThemedText className="text-xs tracking-widest text-gray-500">TOTAL SPEND</ThemedText>
                            <ThemedText className="text-4xl font-bold mt-2">{formatCurrency(totalSpent)}</ThemedText>
                            <ThemedText className="text-gray-500 text-sm mt-2">
                                {formatCurrency(totalLimit)} budgeted this month
                            </ThemedText>
                        </View>

                        <PieChart
                            data={chartData}
                            donut
                            radius={52}
                            innerRadius={36}
                            innerCircleColor={isDark ? '#18181b' : '#ffffff'}
                            strokeColor={isDark ? '#18181b' : '#ffffff'}
                            strokeWidth={1}
                            centerLabelComponent={() => (
                                <View className="items-center justify-center">
                                    <ThemedText className="text-[10px] text-gray-500">Used</ThemedText>
                                    <ThemedText className="text-sm font-bold">
                                        {Math.round(utilization * 100)}%
                                    </ThemedText>
                                </View>
                            )}
                        />
                    </View>

                    <View className="mt-5 flex-row gap-3">
                        <View className="flex-1 rounded-2xl bg-white dark:bg-black/30 p-3 border border-zinc-200 dark:border-zinc-800">
                            <ThemedText className="text-xs text-gray-500">Remaining</ThemedText>
                            <ThemedText
                                type="defaultSemiBold"
                                className={`mt-1 ${remaining < 0 ? 'text-red-500' : ''}`}>
                                {remaining < 0 ? `-${formatCurrency(Math.abs(remaining))}` : formatCurrency(remaining)}
                            </ThemedText>
                        </View>
                        <View className="flex-1 rounded-2xl bg-white dark:bg-black/30 p-3 border border-zinc-200 dark:border-zinc-800">
                            <ThemedText className="text-xs text-gray-500">Attention</ThemedText>
                            <ThemedText type="defaultSemiBold" className="mt-1">
                                {needsAttention.length} {needsAttention.length === 1 ? 'category' : 'categories'}
                            </ThemedText>
                        </View>
                    </View>
                </View>

                <View className="mb-6">
                    <ThemedText className="text-xs tracking-widest text-gray-500 mb-3">NEEDS ATTENTION</ThemedText>
                    {needsAttention.length === 0 ? (
                        <View className="rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-700 p-4">
                            <ThemedText className="text-sm text-gray-500">Everything is on track.</ThemedText>
                        </View>
                    ) : (
                        <View className="gap-3">
                            {needsAttention.map((budget) => {
                                const progress = Math.min(budget.ratio, 1) * 100;
                                return (
                                    <View key={budget.id} className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4">
                                        <View className="flex-row justify-between items-start mb-3">
                                            <View className="flex-row items-center gap-2">
                                                <View className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: budget.hex }} />
                                                <ThemedText type="defaultSemiBold" className="text-sm">
                                                    {budget.name}
                                                </ThemedText>
                                            </View>
                                            <View
                                                className="rounded-full px-2 py-1"
                                                style={{ backgroundColor: hexToRgba(budget.status.tone, 0.15) }}>
                                                <ThemedText style={{ color: budget.status.tone, fontSize: 11, fontWeight: '600' }}>
                                                    {budget.status.label}
                                                </ThemedText>
                                            </View>
                                        </View>

                                        <View className="h-2.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                                            <View
                                                className="h-full rounded-full"
                                                style={{
                                                    width: `${progress}%`,
                                                    backgroundColor: budget.ratio >= 1 ? '#dc2626' : budget.hex,
                                                }}
                                            />
                                        </View>

                                        <View className="flex-row justify-between mt-3">
                                            <ThemedText className="text-xs text-gray-500">
                                                {formatCurrency(budget.spent)} of {formatCurrency(budget.limit)}
                                            </ThemedText>
                                            <ThemedText className="text-xs text-gray-500">
                                                {Math.round(budget.ratio * 100)}% used
                                            </ThemedText>
                                        </View>
                                    </View>
                                );
                            })}
                        </View>
                    )}
                </View>

                <View className="mb-8">
                    <ThemedText className="text-xs tracking-widest text-gray-500 mb-3">ON TRACK</ThemedText>
                    <View className="gap-3">
                        {onTrack.map((budget) => {
                            const progress = Math.min(budget.ratio, 1) * 100;
                            return (
                                <View key={budget.id} className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4">
                                    <View className="flex-row justify-between items-center mb-2">
                                        <View className="flex-row items-center gap-2">
                                            <View className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: budget.hex }} />
                                            <ThemedText type="defaultSemiBold" className="text-sm">
                                                {budget.name}
                                            </ThemedText>
                                        </View>
                                        <ThemedText className="text-xs text-gray-500">
                                            {formatCurrency(budget.amountLeft)} left
                                        </ThemedText>
                                    </View>
                                    <View className="h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                                        <View
                                            className="h-full rounded-full"
                                            style={{ width: `${progress}%`, backgroundColor: budget.hex }}
                                        />
                                    </View>
                                    <View className="flex-row justify-between mt-2">
                                        <ThemedText className="text-xs text-gray-500">
                                            {formatCurrency(budget.spent)} / {formatCurrency(budget.limit)}
                                        </ThemedText>
                                        <ThemedText className="text-xs text-gray-500">
                                            {Math.round(budget.ratio * 100)}%
                                        </ThemedText>
                                    </View>
                                </View>
                            );
                        })}
                    </View>
                </View>

                <TouchableOpacity className="border border-dashed border-zinc-300 dark:border-zinc-700 rounded-2xl p-6 items-center justify-center">
                    <IconSymbol name="plus" size={26} color={isDark ? '#a1a1aa' : '#71717a'} />
                    <ThemedText className="text-gray-500 mt-2 text-base">Create New Budget</ThemedText>
                </TouchableOpacity>
            </ScrollView>
        </ThemedView>
    );
}
