import { View, ScrollView, TouchableOpacity, Dimensions, ActivityIndicator } from 'react-native';
import { Link, useRouter, useFocusEffect } from 'expo-router';
import { ThemedText } from '@/components/ui/themed-text';
import { ThemedView } from '@/components/ui/themed-view';
import { BarChart } from 'react-native-gifted-charts';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getFloatingTabContentPaddingBottom } from '@/constants/layout';
import { useTransactions } from '@/hooks/useTransactions';
import { useBudgets } from '@/hooks/useBudgets';
import { useAppCurrency } from '@/hooks/useAppCurrency';
import { useAuthStore } from '@/store/authStore';
import { hexToRgba } from '@/utils/format';
import { useMemo, useCallback } from 'react';
import { Colors, zinc, semantic, brand } from '@/constants/theme';

const FALLBACK_COLOR = zinc[500];

// ── Date helpers ────────────────────────────────────────────────────────────
const now = new Date();
const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
const monthEnd   = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();

const monthLabel = now.toLocaleDateString([], { month: 'short', year: 'numeric' });

// Last 7 calendar days (today inclusive)
function getLast7Days(): { dateStr: string; label: string }[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return {
      dateStr: d.toISOString().split('T')[0],
      label: d.toLocaleDateString([], { day: 'numeric' }),
    };
  });
}

export default function DashboardScreen() {
  const insets      = useSafeAreaInsets();
  const router      = useRouter();
  const colorScheme = useColorScheme();
  const isDark      = colorScheme === 'dark';
  const screenWidth = Dimensions.get('window').width;
  const contentPaddingBottom = getFloatingTabContentPaddingBottom(insets.bottom);

  const user = useAuthStore((s) => s.user);
  const { format, symbol } = useAppCurrency();

  // ── Data ──────────────────────────────────────────────────────────────────
  const { data: monthTxs = [], isLoading: txLoading, refetch: refetchTx } = useTransactions({
    startDate: monthStart,
    endDate: monthEnd,
  });
  const { data: budgets = [], isLoading: budgetLoading, refetch: refetchBudgets } = useBudgets();

  useFocusEffect(useCallback(() => {
    refetchTx();
    refetchBudgets();
  }, [refetchTx, refetchBudgets]));

  // ── Totals ─────────────────────────────────────────────────────────────────
  const totalExpense = useMemo(
    () => monthTxs.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0),
    [monthTxs],
  );
  const totalIncome = useMemo(
    () => monthTxs.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0),
    [monthTxs],
  );
  const netBalance = totalIncome - totalExpense;

  // ── Bar chart — last 7 days of expense ────────────────────────────────────
  const last7Days = useMemo(() => getLast7Days(), []);
  const barData = useMemo(() => {
    const byDay: Record<string, number> = {};
    monthTxs.forEach(t => {
      if (t.type !== 'expense') return;
      const day = t.date.split('T')[0];
      byDay[day] = (byDay[day] ?? 0) + Number(t.amount);
    });
    return last7Days.map(({ dateStr, label }) => ({
      value: Math.round((byDay[dateStr] ?? 0) * 100) / 100,
      label,
      frontColor: isDark ? zinc[50] : zinc[900],
      barBorderTopLeftRadius: 8,
      barBorderTopRightRadius: 8,
    }));
  }, [monthTxs, last7Days, isDark]);

  const maxBarValue = useMemo(() => Math.max(...barData.map(b => b.value), 1), [barData]);

  // ── Recent transactions (latest 5) ────────────────────────────────────────
  const recentTxs = useMemo(
    () => [...monthTxs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5),
    [monthTxs],
  );

  // ── Budget summary ─────────────────────────────────────────────────────────
  const activeBudgets = useMemo(() => budgets.filter(b => b.isActive), [budgets]);
  const totalBudgetLimit = useMemo(() => activeBudgets.reduce((s, b) => s + b.amount, 0), [activeBudgets]);
  const totalBudgetSpent = useMemo(() => activeBudgets.reduce((s, b) => s + b.progress.spent, 0), [activeBudgets]);
  const budgetProgress   = totalBudgetLimit > 0 ? totalBudgetSpent / totalBudgetLimit : 0;

  // ── Chart sizing ──────────────────────────────────────────────────────────
  const barWidth   = 32;
  const paddingX   = 48;
  const chartWidth = screenWidth - paddingX;
  const spacing    = barData.length > 1 ? (chartWidth - barData.length * barWidth) / (barData.length - 1) : 0;

  const isLoading = txLoading || budgetLoading;

  return (
    <ThemedView style={{ flex: 1, paddingTop: insets.top }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: contentPaddingBottom }}
      >
        {/* Header */}
        <View className="px-4 pt-4 pb-0">
          <View className="flex-row justify-between items-center mb-4">
            <ThemedText className="text-2xl font-bold">{monthLabel}</ThemedText>
            <TouchableOpacity
              onPress={() => router.push('/profile')}
              className="w-9 h-9 rounded-full border border-zinc-200 dark:border-zinc-700 items-center justify-center"
            >
              <IconSymbol name="person.circle.fill" size={19} color={Colors[colorScheme ?? 'light'].icon} />
            </TouchableOpacity>
          </View>

          {/* Balance summary */}
          {isLoading ? (
            <View className="mb-6 h-16 justify-center">
              <ActivityIndicator />
            </View>
          ) : (
            <View className="mb-6">
              <ThemedText className="text-zinc-500 text-sm font-medium mb-1">Net Balance</ThemedText>
              <ThemedText
                className="text-5xl font-bold"
                style={{ color: netBalance < 0 ? semantic.danger.light : undefined }}
              >
                {netBalance < 0 ? `-${format(Math.abs(netBalance))}` : format(netBalance)}
              </ThemedText>
              <View className="flex-row gap-4 mt-2">
                <View className="flex-row items-center gap-1">
                  <IconSymbol name="arrow.up.circle" size={14} color={Colors[colorScheme ?? 'light'].success} />
                  <ThemedText className="text-xs text-zinc-500">{format(totalIncome)}</ThemedText>
                </View>
                <View className="flex-row items-center gap-1">
                  <IconSymbol name="arrow.down.circle" size={14} color={Colors[colorScheme ?? 'light'].danger} />
                  <ThemedText className="text-xs text-zinc-500">{format(totalExpense)}</ThemedText>
                </View>
              </View>
            </View>
          )}
        </View>

        {/* Bar chart — last 7 days */}
        <View className="mb-8 px-4">
          <ThemedText className="text-zinc-400 text-xs font-bold mb-3 tracking-widest">
            LAST 7 DAYS
          </ThemedText>
          {txLoading ? (
            <View style={{ height: 180 }} className="items-center justify-center">
              <ActivityIndicator />
            </View>
          ) : (
            <BarChart
              data={barData}
              height={180}
              width={chartWidth}
              barWidth={barWidth}
              spacing={spacing}
              initialSpacing={0}
              maxValue={maxBarValue * 1.2}
              yAxisThickness={0}
              xAxisThickness={0}
              hideYAxisText
              rulesType="solid"
              rulesColor={isDark ? zinc[700] : zinc[200]}
              xAxisLabelTextStyle={{ color: zinc[500], fontSize: 11, fontWeight: '500' }}
              isAnimated
            />
          )}
        </View>

        {/* Recent transactions */}
        <View className="px-4 mb-8">
          <ThemedText className="text-zinc-400 text-xs font-bold mb-2 tracking-widest">
            RECENT TRANSACTIONS
          </ThemedText>

          {isLoading ? (
            <View className="py-6 items-center">
              <ActivityIndicator />
            </View>
          ) : recentTxs.length === 0 ? (
            <ThemedText className="text-zinc-500 text-sm py-4">No transactions this month.</ThemedText>
          ) : (
            <View>
              {recentTxs.map((tx, index) => {
                const color   = tx.category?.color ?? FALLBACK_COLOR;
                const title   = tx.description || tx.category?.name || 'Transaction';
                const subtitle = tx.category?.name ?? '';
                const isIncome = tx.type === 'income';
                return (
                  <View
                    key={tx.id}
                    className={`flex-row justify-between items-center py-4 ${index !== recentTxs.length - 1 ? 'border-b border-zinc-100 dark:border-zinc-800' : ''}`}
                  >
                    <View className="flex-row items-center gap-3 flex-1 pr-3">
                      <View
                        className="w-10 h-10 rounded-2xl items-center justify-center"
                        style={{ backgroundColor: hexToRgba(color, isDark ? 0.3 : 0.2) }}
                      >
                        <IconSymbol
                          name={(tx.category?.icon as any) || 'doc.text.fill'}
                          size={18}
                          color={color}
                        />
                      </View>
                      <View className="flex-1">
                        <ThemedText type="defaultSemiBold" className="text-sm" numberOfLines={1}>
                          {title}
                        </ThemedText>
                        {subtitle ? (
                          <ThemedText className="text-xs text-zinc-500" numberOfLines={1}>
                            {subtitle}
                          </ThemedText>
                        ) : null}
                      </View>
                    </View>
                    <ThemedText
                      type="defaultSemiBold"
                      className="text-sm"
                      style={{ color: isIncome ? Colors[colorScheme ?? 'light'].success : undefined }}
                    >
                      {isIncome ? '+' : '-'}{format(tx.amount)}
                    </ThemedText>
                  </View>
                );
              })}
              <Link href="/(tabs)/transactions" asChild>
                <TouchableOpacity className="py-4 border-t border-zinc-100 dark:border-zinc-800">
                  <ThemedText className="text-zinc-400 text-xs font-bold">SEE ALL</ThemedText>
                </TouchableOpacity>
              </Link>
            </View>
          )}
        </View>

        {/* Budget overview */}
        <View className="px-4 mb-6">
          <ThemedText className="text-zinc-400 text-xs font-bold mb-4 tracking-widest">BUDGET</ThemedText>

          {budgetLoading ? (
            <View className="py-4 items-center"><ActivityIndicator /></View>
          ) : activeBudgets.length === 0 ? (
            <ThemedText className="text-zinc-500 text-sm">No active budgets.</ThemedText>
          ) : (
            <>
              <View className="mb-4 flex-row items-baseline gap-2">
                <ThemedText className="text-4xl font-bold">{format(totalBudgetSpent)}</ThemedText>
                <ThemedText className="text-sm text-zinc-400">/ {format(totalBudgetLimit)}</ThemedText>
              </View>

              <View className="h-1 bg-zinc-100 dark:bg-zinc-800 w-full mb-6 rounded-full overflow-hidden">
                <View
                  className="h-full rounded-full"
                  style={{
                    width: `${Math.min(budgetProgress * 100, 100)}%`,
                    backgroundColor: budgetProgress >= 1 ? Colors[colorScheme ?? 'light'].danger : isDark ? brand[400] : brand[500],
                  }}
                />
              </View>

              <View className="gap-4">
                {activeBudgets.slice(0, 4).map(budget => {
                  const ratio    = budget.amount > 0 ? budget.progress.spent / budget.amount : 0;
                  const pct      = Math.min(ratio, 1) * 100;
                  const color    = budget.category.color ?? FALLBACK_COLOR;
                  const barColor = ratio >= 1 ? Colors[colorScheme ?? 'light'].danger : color;
                  return (
                    <View key={budget.id}>
                      <View className="flex-row justify-between items-center mb-1.5">
                        <View className="flex-row items-center gap-2 flex-1 mr-3">
                          <View className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                          <ThemedText className="text-sm" numberOfLines={1}>{budget.name}</ThemedText>
                        </View>
                        <ThemedText className="text-xs text-zinc-500">
                          {format(budget.progress.spent)} / {format(budget.amount)}
                        </ThemedText>
                      </View>
                      <View className="h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                        <View
                          className="h-full rounded-full"
                          style={{ width: `${pct}%`, backgroundColor: barColor }}
                        />
                      </View>
                    </View>
                  );
                })}
                {activeBudgets.length > 4 ? (
                  <Link href="/(tabs)/budget" asChild>
                    <TouchableOpacity>
                      <ThemedText className="text-zinc-400 text-xs font-bold">
                        +{activeBudgets.length - 4} MORE
                      </ThemedText>
                    </TouchableOpacity>
                  </Link>
                ) : null}
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </ThemedView>
  );
}
