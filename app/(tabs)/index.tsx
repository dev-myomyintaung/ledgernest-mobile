import { View, ScrollView, TouchableOpacity, Dimensions, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
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
import { Colors, zinc, brand } from '@/constants/theme';

const FALLBACK_COLOR = zinc[500];

// ── Date helpers ─────────────────────────────────────────────────────────────
const now        = new Date();
const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
const monthEnd   = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();
const todayStr   = now.toISOString().split('T')[0];
const monthLabel = now.toLocaleDateString([], { month: 'long', year: 'numeric' }).toUpperCase();

function getGreeting(): string {
  const h = now.getHours();
  if (h >= 5 && h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  if (h < 21) return 'Good evening';
  return 'Hey';
}

function getLast7Days(): { dateStr: string; label: string }[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return {
      dateStr: d.toISOString().split('T')[0],
      label:   d.toLocaleDateString([], { day: 'numeric' }),
    };
  });
}

export default function DashboardScreen() {
  const insets      = useSafeAreaInsets();
  const router      = useRouter();
  const colorScheme = useColorScheme();
  const isDark      = colorScheme === 'dark';
  const cs          = colorScheme ?? 'light';
  const screenWidth = Dimensions.get('window').width;
  const contentPaddingBottom = getFloatingTabContentPaddingBottom(insets.bottom);

  const user = useAuthStore((s) => s.user);
  const { format } = useAppCurrency();
  const firstName = (user as any)?.displayName || user?.firstName || 'there';
  const avatarUrl = (user as any)?.avatarUrl as string | null | undefined;
  const initials = ((user as any)?.displayName || [user?.firstName, user?.lastName].filter(Boolean).join(' ') || '?').slice(0, 2).toUpperCase();

  // ── Data ──────────────────────────────────────────────────────────────────
  const { data: monthTxs = [], isLoading: txLoading, refetch: refetchTx } = useTransactions({
    startDate: monthStart,
    endDate:   monthEnd,
  });
  const { data: budgets = [], isLoading: budgetLoading, refetch: refetchBudgets } = useBudgets();

  useFocusEffect(useCallback(() => {
    refetchTx();
    refetchBudgets();
  }, [refetchTx, refetchBudgets]));

  // ── Totals ────────────────────────────────────────────────────────────────
  const totalExpense = useMemo(
    () => monthTxs.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0),
    [monthTxs],
  );
  const totalIncome = useMemo(
    () => monthTxs.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0),
    [monthTxs],
  );
  const netBalance = totalIncome - totalExpense;

  // ── Bar chart — last 7 days expense ───────────────────────────────────────
  const last7Days = useMemo(() => getLast7Days(), []);
  const barData   = useMemo(() => {
    const byDay: Record<string, number> = {};
    monthTxs.forEach(t => {
      if (t.type !== 'expense') return;
      const day = t.date.split('T')[0];
      byDay[day] = (byDay[day] ?? 0) + Number(t.amount);
    });
    return last7Days.map(({ dateStr, label }) => ({
      value:                  Math.round((byDay[dateStr] ?? 0) * 100) / 100,
      label,
      frontColor:             dateStr === todayStr
                                ? (isDark ? brand[400] : brand[500])
                                : (isDark ? zinc[700] : zinc[300]),
      barBorderTopLeftRadius:  6,
      barBorderTopRightRadius: 6,
    }));
  }, [monthTxs, last7Days, isDark]);

  const maxBarValue = useMemo(() => Math.max(...barData.map(b => b.value), 1), [barData]);

  // ── Recent transactions ───────────────────────────────────────────────────
  const recentTxs = useMemo(
    () => [...monthTxs]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5),
    [monthTxs],
  );

  // ── Budget summary ────────────────────────────────────────────────────────
  const activeBudgets    = useMemo(() => budgets.filter(b => b.isActive), [budgets]);
  const totalBudgetLimit = useMemo(() => activeBudgets.reduce((s, b) => s + b.amount, 0), [activeBudgets]);
  const totalBudgetSpent = useMemo(() => activeBudgets.reduce((s, b) => s + b.progress.spent, 0), [activeBudgets]);
  const budgetProgress   = totalBudgetLimit > 0 ? totalBudgetSpent / totalBudgetLimit : 0;

  // ── Chart sizing ──────────────────────────────────────────────────────────
  const barWidth   = 28;
  const chartWidth = screenWidth - 32;
  const spacing    = barData.length > 1
    ? (chartWidth - barData.length * barWidth) / (barData.length - 1)
    : 0;

  const isLoading = txLoading || budgetLoading;

  // ── Shared style helpers ──────────────────────────────────────────────────
  const cardStyle = {
    backgroundColor: isDark ? zinc[800] : zinc[100],
    borderWidth:     1,
    borderColor:     isDark ? zinc[700] : zinc[200],
    borderRadius:    20,
  } as const;

  return (
    <ThemedView style={{ flex: 1, paddingTop: insets.top }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: contentPaddingBottom }}
      >

        {/* ── Header ─────────────────────────────────────────── */}
        <View className="px-4 pt-5 pb-4 flex-row items-center justify-between">
          <View>
            <ThemedText className="text-xs text-zinc-400 font-medium mb-0.5">
              {getGreeting()}
            </ThemedText>
            <ThemedText className="text-xl font-bold">{firstName}</ThemedText>
          </View>
          <TouchableOpacity
            onPress={() => router.push('/profile')}
            activeOpacity={0.7}
            style={{
              width: 40, height: 40, borderRadius: 20, overflow: 'hidden',
              backgroundColor: isDark ? brand[800] : brand[100],
              alignItems: 'center', justifyContent: 'center',
              borderWidth: 2, borderColor: isDark ? brand[400] : brand[500],
            }}
          >
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={{ width: 40, height: 40 }} contentFit="cover" />
            ) : (
              <ThemedText style={{ fontSize: 15, fontWeight: '700', color: isDark ? brand[200] : brand[700] }}>
                {initials}
              </ThemedText>
            )}
          </TouchableOpacity>
        </View>

        {/* ── Hero Balance Card ───────────────────────────────── */}
        <View className="mx-4 mb-6" style={{ ...cardStyle, borderRadius: 24 }}>
          <View className="p-5">
            <ThemedText className="text-xs text-zinc-400 font-semibold tracking-widest mb-3">
              {monthLabel}
            </ThemedText>

            {isLoading ? (
              <View className="h-24 items-center justify-center">
                <ActivityIndicator />
              </View>
            ) : (
              <>
                <ThemedText
                  className="text-4xl font-bold mb-4"
                  style={{ color: netBalance < 0 ? Colors[cs].danger : Colors[cs].success }}
                >
                  {netBalance < 0 ? `-${format(Math.abs(netBalance))}` : format(netBalance)}
                </ThemedText>

                {/* Income / Expense split */}
                <View
                  className="flex-row rounded-2xl overflow-hidden mb-4"
                  style={{ backgroundColor: isDark ? zinc[900] : Colors[cs].background }}
                >
                  <View className="flex-1 px-4 py-3 flex-row items-center gap-2">
                    <View
                      className="w-7 h-7 rounded-full items-center justify-center"
                      style={{ backgroundColor: hexToRgba(Colors[cs].success, 0.15) }}
                    >
                      <IconSymbol name="arrow.up" size={11} color={Colors[cs].success} />
                    </View>
                    <View>
                      <ThemedText className="text-xs text-zinc-400">Income</ThemedText>
                      <ThemedText
                        className="text-sm font-semibold"
                        style={{ color: Colors[cs].success }}
                      >
                        {format(totalIncome)}
                      </ThemedText>
                    </View>
                  </View>
                  <View
                    style={{
                      width: 1,
                      backgroundColor: isDark ? zinc[800] : zinc[200],
                      marginVertical: 8,
                    }}
                  />
                  <View className="flex-1 px-4 py-3 flex-row items-center gap-2">
                    <View
                      className="w-7 h-7 rounded-full items-center justify-center"
                      style={{ backgroundColor: hexToRgba(Colors[cs].danger, 0.15) }}
                    >
                      <IconSymbol name="arrow.down" size={11} color={Colors[cs].danger} />
                    </View>
                    <View>
                      <ThemedText className="text-xs text-zinc-400">Expenses</ThemedText>
                      <ThemedText
                        className="text-sm font-semibold"
                        style={{ color: Colors[cs].danger }}
                      >
                        {format(totalExpense)}
                      </ThemedText>
                    </View>
                  </View>
                </View>

                {/* Budget progress */}
                {activeBudgets.length > 0 && (
                  <View>
                    <View className="flex-row justify-between items-center mb-1.5">
                      <ThemedText className="text-xs text-zinc-400">Budget used</ThemedText>
                      <ThemedText
                        className="text-xs font-semibold"
                        style={{
                          color: budgetProgress >= 1
                            ? Colors[cs].danger
                            : budgetProgress >= 0.8
                            ? Colors[cs].warning
                            : Colors[cs].textSecondary,
                        }}
                      >
                        {Math.round(budgetProgress * 100)}%
                      </ThemedText>
                    </View>
                    <View
                      className="h-1.5 rounded-full overflow-hidden"
                      style={{ backgroundColor: isDark ? zinc[700] : zinc[200] }}
                    >
                      <View
                        className="h-full rounded-full"
                        style={{
                          width: `${Math.min(budgetProgress * 100, 100)}%`,
                          backgroundColor: budgetProgress >= 1
                            ? Colors[cs].danger
                            : budgetProgress >= 0.8
                            ? Colors[cs].warning
                            : isDark ? brand[400] : brand[500],
                        }}
                      />
                    </View>
                  </View>
                )}
              </>
            )}
          </View>
        </View>

        {/* ── Spending Chart ─────────────────────────────────── */}
        <View className="px-4 mb-8">
          <View className="flex-row items-center justify-between mb-4">
            <ThemedText className="text-xs text-zinc-400 font-bold tracking-widest">SPENDING</ThemedText>
            <ThemedText className="text-xs text-zinc-500">Last 7 days</ThemedText>
          </View>
          {txLoading ? (
            <View style={{ height: 160 }} className="items-center justify-center">
              <ActivityIndicator />
            </View>
          ) : (
            <BarChart
              data={barData}
              height={160}
              width={chartWidth}
              barWidth={barWidth}
              spacing={spacing}
              initialSpacing={0}
              maxValue={maxBarValue * 1.25}
              yAxisThickness={0}
              xAxisThickness={0}
              hideYAxisText
              rulesType="solid"
              rulesColor={isDark ? zinc[800] : zinc[100]}
              xAxisLabelTextStyle={{ color: zinc[500], fontSize: 11, fontWeight: '500' }}
              isAnimated
            />
          )}
        </View>

        {/* ── Budget Cards ─────────────────────────────────────── */}
        {budgetLoading ? (
          <View className="px-4 mb-8">
            <ThemedText className="text-xs text-zinc-400 font-bold tracking-widest mb-3">BUDGETS</ThemedText>
            <View className="py-4 items-center"><ActivityIndicator /></View>
          </View>
        ) : activeBudgets.length > 0 ? (
          <View className="mb-8">
            <View className="px-4 flex-row items-center justify-between mb-3">
              <ThemedText className="text-xs text-zinc-400 font-bold tracking-widest">BUDGETS</ThemedText>
              <Link href="/(tabs)/budget" asChild>
                <TouchableOpacity activeOpacity={0.7}>
                  <ThemedText className="text-xs text-zinc-400 font-bold">SEE ALL</ThemedText>
                </TouchableOpacity>
              </Link>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
            >
              {activeBudgets.slice(0, 6).map(budget => {
                const ratio    = budget.amount > 0 ? budget.progress.spent / budget.amount : 0;
                const pct      = Math.min(ratio, 1) * 100;
                const color    = budget.category.color ?? FALLBACK_COLOR;
                const barColor = ratio >= 1
                  ? Colors[cs].danger
                  : ratio >= 0.8
                  ? Colors[cs].warning
                  : color;
                return (
                  <View key={budget.id} style={{ ...cardStyle, width: 148, padding: 16 }}>
                    <View
                      className="w-9 h-9 rounded-2xl items-center justify-center mb-3"
                      style={{ backgroundColor: hexToRgba(color, isDark ? 0.25 : 0.15) }}
                    >
                      <IconSymbol
                        name={(budget.category.icon as any) || 'folder.fill'}
                        size={17}
                        color={color}
                      />
                    </View>
                    <ThemedText className="text-xs font-semibold mb-0.5" numberOfLines={1}>
                      {budget.name}
                    </ThemedText>
                    <ThemedText className="text-xs text-zinc-400 mb-3" numberOfLines={1}>
                      {format(budget.progress.spent)} / {format(budget.amount)}
                    </ThemedText>
                    <View
                      className="h-1 rounded-full overflow-hidden"
                      style={{ backgroundColor: isDark ? zinc[700] : zinc[200] }}
                    >
                      <View
                        className="h-full rounded-full"
                        style={{ width: `${pct}%`, backgroundColor: barColor }}
                      />
                    </View>
                    <ThemedText
                      className="text-xs font-semibold mt-1.5"
                      style={{
                        color: ratio >= 1
                          ? Colors[cs].danger
                          : ratio >= 0.8
                          ? Colors[cs].warning
                          : zinc[500],
                      }}
                    >
                      {Math.round(pct)}%
                    </ThemedText>
                  </View>
                );
              })}
            </ScrollView>
          </View>
        ) : null}

        {/* ── Recent Transactions ──────────────────────────────── */}
        <View className="px-4 mb-6">
          <View className="flex-row items-center justify-between mb-3">
            <ThemedText className="text-xs text-zinc-400 font-bold tracking-widest">RECENT</ThemedText>
            <Link href="/(tabs)/transactions" asChild>
              <TouchableOpacity activeOpacity={0.7}>
                <ThemedText className="text-xs text-zinc-400 font-bold">SEE ALL</ThemedText>
              </TouchableOpacity>
            </Link>
          </View>

          {isLoading ? (
            <View className="py-6 items-center"><ActivityIndicator /></View>
          ) : recentTxs.length === 0 ? (
            <ThemedText className="text-zinc-500 text-sm py-4">No transactions this month.</ThemedText>
          ) : (
            <View style={{ ...cardStyle, overflow: 'hidden' }}>
              {recentTxs.map((tx, index) => {
                const color    = tx.category?.color ?? FALLBACK_COLOR;
                const title    = tx.description || tx.category?.name || 'Transaction';
                const subtitle = tx.category?.name ?? '';
                const isIncome = tx.type === 'income';
                const isLast   = index === recentTxs.length - 1;
                return (
                  <View
                    key={tx.id}
                    style={{
                      flexDirection:     'row',
                      alignItems:        'center',
                      justifyContent:    'space-between',
                      paddingHorizontal: 16,
                      paddingVertical:   14,
                      borderBottomWidth: isLast ? 0 : 1,
                      borderBottomColor: isDark ? zinc[700] : zinc[200],
                    }}
                  >
                    <View className="flex-row items-center gap-3 flex-1 pr-3">
                      <View
                        className="w-10 h-10 rounded-2xl items-center justify-center"
                        style={{ backgroundColor: hexToRgba(color, isDark ? 0.3 : 0.15) }}
                      >
                        <IconSymbol
                          name={(tx.category?.icon as any) || 'doc.text.fill'}
                          size={17}
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
                      style={{ color: isIncome ? Colors[cs].success : isDark ? zinc[50] : undefined }}
                    >
                      {isIncome ? '+' : '-'}{format(tx.amount)}
                    </ThemedText>
                  </View>
                );
              })}
            </View>
          )}
        </View>

      </ScrollView>
    </ThemedView>
  );
}
