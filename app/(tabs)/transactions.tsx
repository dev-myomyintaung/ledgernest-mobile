import { useMemo, useState } from "react";
import dayjs from "dayjs";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import {
  View,
  ScrollView,
  SectionList,
  TouchableOpacity,
  TextInput,
  Text,
  ActivityIndicator,
  Modal,
} from "react-native";
import { useRouter } from "expo-router";
import { ThemedText } from "@/components/ui/themed-text";
import { ThemedView } from "@/components/ui/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTransactions } from "@/hooks/useTransactions";
import { Transaction } from "@/api/endpoints/transactions";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { getFloatingTabContentPaddingBottom } from "@/constants/layout";
import { useFilteredTransactions, FilterState, FilterType, FilterSource } from "@/hooks/useFilteredTransactions";
import { useCategories } from "@/hooks/useCategories";
type ReceiptGroup = {
  key: string;
  receiptId: string | null;
  storeName: string;
  receiptDate: string | null;
  transactions: Transaction[];
  total: number;
  latestTimestamp: number;
};
type TransactionSection = {
  key: string;
  type: "receipt" | "manual";
  data: Transaction[];
  label?: string;
  receiptId?: string | null;
  storeName?: string;
  receiptDate?: string | null;
  total?: number;
};

const getAmountNumber = (value: string | number) =>
  typeof value === "number" ? value : Number.parseFloat(value);

const formatAmount = (value: string | number) => {
  const parsed = getAmountNumber(value);
  if (Number.isNaN(parsed)) return "$0.00";
  return `$${Math.abs(parsed).toFixed(2)}`;
};

const hexToRgba = (hex: string, alpha: number) => {
  const clean = hex.replace("#", "");
  if (clean.length !== 6) return `rgba(113, 113, 122, ${alpha})`;
  const parsed = Number.parseInt(clean, 16);
  const r = (parsed >> 16) & 255;
  const g = (parsed >> 8) & 255;
  const b = parsed & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const formatDateLabel = (isoDate: string) => {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return "Unknown date";

  const now = new Date();
  const today = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  ).getTime();
  const target = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  ).getTime();
  const dayDiff = Math.round((today - target) / 86_400_000);
  const time = date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });

  if (dayDiff === 0) return `Today, ${time}`;
  if (dayDiff === 1) return "Yesterday";
  return date.toLocaleDateString();
};

const formatReceiptGroupDate = (isoDate?: string | null) => {
  if (!isoDate) return "Unknown date";
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return "Unknown date";
  return date.toLocaleDateString([], {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const toTimestamp = (isoDate?: string | null) => {
  if (!isoDate) return 0;
  const date = new Date(isoDate);
  return Number.isNaN(date.getTime()) ? 0 : date.getTime();
};

export default function TransactionsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    types: [],
    sources: [],
    categoryIds: [],
    dateRange: { start: null, end: null },
  });
  const [search, setSearch] = useState("");
  const { data: transactions = [], isLoading, error } = useTransactions();
  const { data: categories = [] } = useCategories();
  const contentPaddingBottom = getFloatingTabContentPaddingBottom(
    insets.bottom,
  );

  const hasActiveFilters = filters.types.length > 0 || filters.sources.length > 0 || filters.categoryIds.length > 0 || !!filters.dateRange.start || !!filters.dateRange.end;

  const toggleFilter = <T extends "types" | "sources" | "categoryIds">(
    key: T,
    value: T extends "types" ? FilterType : T extends "sources" ? FilterSource : string
  ) => {
    setFilters((prev) => {
      const current = prev[key] as string[];
      const exists = current.includes(value as string);
      if (exists) {
        return { ...prev, [key]: current.filter((v) => v !== value) };
      }
      return { ...prev, [key]: [...current, value] };
    });
  };

  const setDateRange = (type: 'start' | 'end', date: string | null) => {
    setFilters(prev => ({
      ...prev,
      dateRange: {
        ...prev.dateRange,
        [type]: date
      }
    }));
  };

  const clearFilters = () => {
    setFilters({ types: [], sources: [], categoryIds: [], dateRange: { start: null, end: null } });
  };



  const filteredTransactions = useFilteredTransactions(transactions, filters, search);

  const { receiptGroups, manualTransactions } = useMemo(() => {
    const groupsByReceipt = new Map<string, ReceiptGroup>();
    const manual: Transaction[] = [];

    for (const tx of filteredTransactions) {
      const receiptId =
        tx.receiptItem?.receipt?.id ?? tx.receiptItem?.receiptId ?? null;
      const hasReceiptBinding = !!tx.receiptItemId || !!receiptId;

      if (!hasReceiptBinding) {
        manual.push(tx);
        continue;
      }

      const groupKey = receiptId ?? `receipt-item:${tx.receiptItemId}`;
      const receiptDate = tx.receiptItem?.receipt?.receiptDate ?? tx.date;
      const latestTimestamp = Math.max(
        toTimestamp(receiptDate),
        toTimestamp(tx.date),
      );
      const signedAmount =
        tx.type === "income"
          ? getAmountNumber(tx.amount)
          : -getAmountNumber(tx.amount);
      const safeSignedAmount = Number.isNaN(signedAmount) ? 0 : signedAmount;

      const existing = groupsByReceipt.get(groupKey);
      if (existing) {
        existing.transactions.push(tx);
        existing.total += safeSignedAmount;
        existing.latestTimestamp = Math.max(
          existing.latestTimestamp,
          latestTimestamp,
        );
        if (
          (!existing.storeName || existing.storeName === "Receipt") &&
          tx.receiptItem?.receipt?.storeName
        ) {
          existing.storeName = tx.receiptItem.receipt.storeName;
        }
        if (!existing.receiptDate && tx.receiptItem?.receipt?.receiptDate) {
          existing.receiptDate = tx.receiptItem.receipt.receiptDate;
        }
      } else {
        groupsByReceipt.set(groupKey, {
          key: groupKey,
          receiptId,
          storeName: tx.receiptItem?.receipt?.storeName ?? "Receipt",
          receiptDate: tx.receiptItem?.receipt?.receiptDate ?? null,
          transactions: [tx],
          total: safeSignedAmount,
          latestTimestamp,
        });
      }
    }

    const groups = [...groupsByReceipt.values()]
      .map((group) => ({
        ...group,
        transactions: [...group.transactions].sort(
          (a, b) => toTimestamp(b.date) - toTimestamp(a.date),
        ),
      }))
      .sort((a, b) => b.latestTimestamp - a.latestTimestamp);

    const sortedManual = [...manual].sort(
      (a, b) => toTimestamp(b.date) - toTimestamp(a.date),
    );

    return {
      receiptGroups: groups,
      manualTransactions: sortedManual,
    };
  }, [filteredTransactions]);

  const renderTransactionRow = (
    tx: Transaction,
    options: { isLast?: boolean } = {},
  ) => {
    const isLast = options.isLast ?? false;
    const categoryColor =
      tx.category?.color && tx.category.color.startsWith("#")
        ? tx.category.color
        : "#6b7280";
    const title = tx.description || tx.category?.name || "Transaction";
    const subtitle = tx.category?.name || formatDateLabel(tx.date);
    const isIncome = tx.type === "income";
    const rowClassName = `flex-row justify-between items-center px-6 py-4 ${!isLast ? "border-b border-gray-100 dark:border-gray-800" : ""}`;

    return (
      <View className={rowClassName}>
        <View className="flex-row items-center gap-4 flex-1 pr-3">
          <View
            className="w-12 h-12 rounded-2xl items-center justify-center"
            style={{
              backgroundColor: hexToRgba(categoryColor, isDark ? 0.3 : 0.2),
            }}
          >
            <IconSymbol
              name={(tx.category?.icon as any) || "doc.text.fill"}
              size={20}
              color={categoryColor}
            />
          </View>
          <View className="flex-1">
            <ThemedText type="defaultSemiBold" numberOfLines={1}>
              {title}
            </ThemedText>
            <ThemedText className="text-xs text-gray-400" numberOfLines={1}>
              {subtitle}
            </ThemedText>
          </View>
        </View>
        <ThemedText
          type="defaultSemiBold"
          style={{ color: isIncome ? "#10B981" : undefined }}
        >
          {isIncome ? "+" : "-"}
          {formatAmount(tx.amount)}
        </ThemedText>
      </View>
    );
  };

  const sections = useMemo<TransactionSection[]>(() => {
    const hasReceiptGroups = receiptGroups.length > 0;
    const hasManual = manualTransactions.length > 0;
    const hasNoFilters = !hasActiveFilters;
    const shouldSplitLabels = hasNoFilters && hasReceiptGroups && hasManual;
    const builtSections: TransactionSection[] = [];

    // If only manual source is selected
    if (filters.sources.length === 1 && filters.sources[0] === "manual") {
      if (hasManual) {
        builtSections.push({
          key: "manual-only",
          type: "manual",
          data: manualTransactions,
          label: "MANUAL ENTRIES",
          total: manualTransactions.reduce((sum, tx) => {
            const amount = getAmountNumber(tx.amount);
            if (Number.isNaN(amount)) return sum;
            return tx.type === "income" ? sum + amount : sum - amount;
          }, 0),
        });
      }
      return builtSections;
    }

    // If only receipt source is selected
    if (filters.sources.length === 1 && filters.sources[0] === "receipt") {
      return receiptGroups.map((group) => ({
        key: `receipt-${group.key}`,
        type: "receipt",
        data: group.transactions,
        receiptId: group.receiptId,
        storeName: group.storeName,
        receiptDate: group.receiptDate,
        total: group.total,
      }));
    }

    for (const [index, group] of receiptGroups.entries()) {
      builtSections.push({
        key: `receipt-${group.key}`,
        type: "receipt",
        data: group.transactions,
        label: shouldSplitLabels && index === 0 ? "RECEIPTS" : undefined,
        receiptId: group.receiptId,
        storeName: group.storeName,
        receiptDate: group.receiptDate,
        total: group.total,
      });
    }

    if (hasManual) {
      builtSections.push({
        key: "manual",
        type: "manual",
        data: manualTransactions,
        label: shouldSplitLabels ? "MANUAL ENTRIES" : "MANUAL",
        total: manualTransactions.reduce((sum, tx) => {
          const amount = getAmountNumber(tx.amount);
          if (Number.isNaN(amount)) return sum;
          return tx.type === "income" ? sum + amount : sum - amount;
        }, 0),
      });
    }

    return builtSections;
  }, [filters, receiptGroups, manualTransactions, hasActiveFilters]);

  const renderSectionHeader = ({
    section,
  }: {
    section: TransactionSection;
  }) => {
    if (section.type === "manual") {
      const total = section.total ?? 0;
      const totalPrefix = total > 0 ? "+" : total < 0 ? "-" : "";

      return (
        <View className="bg-zinc-50 dark:bg-zinc-950 px-6 pt-4 pb-2">
          <View className="flex-row items-center justify-between mt-1">
            <ThemedText className="text-[11px] tracking-widest text-zinc-500">
              {section.label ?? "MANUAL"}
            </ThemedText>
            <ThemedText
              type="defaultSemiBold"
              style={{ color: total > 0 ? "#10B981" : undefined }}
            >
              {totalPrefix}
              {formatAmount(total)}
            </ThemedText>
          </View>
        </View>
      );
    }

    const total = section.total ?? 0;
    const totalPrefix = total > 0 ? "+" : total < 0 ? "-" : "";
    const summary = formatReceiptGroupDate(section.receiptDate);
    const canOpenReceipt = !!section.receiptId;

    return (
      <View className="bg-zinc-50 dark:bg-zinc-950 px-6 pt-4 pb-2">
        {section.label ? (
          <ThemedText className="text-[11px] tracking-widest text-zinc-500">
            {section.label}
          </ThemedText>
        ) : null}
        <TouchableOpacity
          activeOpacity={0.85}
          disabled={!canOpenReceipt}
          onPress={() => {
            if (!section.receiptId) return;
            router.push({
              pathname: "/receipt-review",
              params: { receiptId: section.receiptId },
            });
          }}
          className="pt-1 flex-row items-center justify-between"
        >
          <View className="flex-1 pr-3">
            <ThemedText type="defaultSemiBold" numberOfLines={1}>
              {section.storeName ?? "Receipt"}
            </ThemedText>
            <ThemedText className="text-xs text-zinc-500" numberOfLines={1}>
              {summary}
            </ThemedText>
          </View>
          <View className="items-end">
            <ThemedText
              type="defaultSemiBold"
              style={{ color: total > 0 ? "#10B981" : undefined }}
            >
              {totalPrefix}
              {formatAmount(total)}
            </ThemedText>
            {canOpenReceipt ? (
              <View className="mt-1 flex-row items-center gap-1">
                <IconSymbol
                  name="chevron.right"
                  size={10}
                  color={isDark ? "#a1a1aa" : "#71717a"}
                />
              </View>
            ) : null}
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  const renderFilterModal = () => (
    <Modal
      visible={showFilterModal}
      transparent
      animationType="slide"
      onRequestClose={() => setShowFilterModal(false)}
    >
      {/* Backdrop — tap to close */}
      <TouchableOpacity
        activeOpacity={1}
        style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.45)" }}
        onPress={() => setShowFilterModal(false)}
      >
        {/* Sheet — stop tap propagation so tapping inside doesn't close */}
        <TouchableOpacity
          activeOpacity={1}
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            maxHeight: "85%",
            backgroundColor: isDark ? "#18181b" : "#ffffff",
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            paddingTop: 24,
            paddingBottom: Math.max(insets.bottom, 16) + 16,
          }}
        >
          {/* Drag handle */}
          <View
            style={{
              width: 36,
              height: 4,
              borderRadius: 2,
              backgroundColor: isDark ? "#52525b" : "#d4d4d8",
              alignSelf: "center",
              marginBottom: 20,
            }}
          />

          {/* Header row */}
          <View className="flex-row justify-between items-center mb-6 px-6">
            <ThemedText type="defaultSemiBold" style={{ fontSize: 18 }}>
              Filter
            </ThemedText>
            <View className="flex-row items-center gap-3">
              {hasActiveFilters && (
                <TouchableOpacity onPress={clearFilters}>
                  <ThemedText className="text-sm text-blue-500">
                    Clear all
                  </ThemedText>
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={() => setShowFilterModal(false)}>
                <IconSymbol
                  name="xmark.circle.fill"
                  size={28}
                  color={isDark ? "#71717a" : "#a1a1aa"}
                />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView showsVerticalScrollIndicator={true} className="px-6">
            {/* Date Range */}
            <View>
              <ThemedText className="text-xs tracking-widest text-gray-400 mb-3">
                DATE RANGE
              </ThemedText>
              <TouchableOpacity
                onPress={() => setShowDatePicker(!showDatePicker)}
                className={`flex-row gap-3 mb-5 p-3 rounded-xl border ${showDatePicker ? "border-black dark:border-white" : "border-gray-200 dark:border-gray-700"}`}
              >
                <View className="flex-1">
                  <ThemedText className="text-xs text-gray-400 mb-1">Start Date</ThemedText>
                  <ThemedText className={filters.dateRange.start ? "" : "text-gray-400"}>
                    {filters.dateRange.start ? dayjs(filters.dateRange.start).format("MMM D, YYYY") : "Select start date"}
                  </ThemedText>
                </View>
                <View className="w-[1px] bg-gray-200 dark:bg-gray-700" />
                <View className="flex-1">
                  <ThemedText className="text-xs text-gray-400 mb-1">End Date</ThemedText>
                  <ThemedText className={filters.dateRange.end ? "" : "text-gray-400"}>
                    {filters.dateRange.end ? dayjs(filters.dateRange.end).format("MMM D, YYYY") : "Select end date"}
                  </ThemedText>
                </View>
              </TouchableOpacity>
            </View>

            {showDatePicker && (
              <View className="mb-5 bg-gray-50 dark:bg-zinc-900 rounded-xl p-2">
                <DateRangePicker
                  initialStartDate={filters.dateRange.start}
                  initialEndDate={filters.dateRange.end}
                  onRangeChange={({ startDate, endDate }) => {
                    setFilters((prev) => ({
                      ...prev,
                      dateRange: { start: startDate, end: endDate },
                    }));
                  }}
                />
              </View>
            )}

            {/* Combined Filters */}
            <View>
              <ThemedText className="text-xs tracking-widest text-gray-400 mb-3">
                FILTERS
              </ThemedText>
              <View className="flex-row flex-wrap gap-2 mb-5">
                {/* Transaction type */}
                {(
                  [
                    { id: "income" as const, label: "Income", icon: "arrow.down.circle" },
                    { id: "expense" as const, label: "Expense", icon: "arrow.up.circle" },
                  ] as const
                ).map((chip) => {
                  const isSelected = filters.types.includes(chip.id);
                  return (
                    <TouchableOpacity
                      key={chip.id}
                      onPress={() => toggleFilter("types", chip.id)}
                      className={`flex-row items-center px-4 py-3 rounded-full border ${isSelected ? "bg-black border-black dark:bg-white dark:border-white" : "bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800"}`}
                    >
                      {isSelected ? (
                        <IconSymbol
                          name="checkmark.circle.fill"
                          size={18}
                          color={isDark ? "#000" : "#fff"}
                          style={{ marginRight: 8 }}
                        />
                      ) : (
                        <IconSymbol
                          name={chip.icon as any}
                          size={18}
                          color={isDark ? "#a1a1aa" : "#71717a"}
                          style={{ marginRight: 8 }}
                        />
                      )}
                      <Text
                        className={`font-semibold ${isSelected ? "text-white dark:text-black" : "text-gray-900 dark:text-gray-100"}`}
                      >
                        {chip.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}

                {/* Source */}
                {(
                  [
                    { id: "receipt" as const, label: "Receipts", icon: "doc.text" },
                    { id: "manual" as const, label: "Manual", icon: "pencil" },
                  ] as const
                ).map((chip) => {
                  const isSelected = filters.sources.includes(chip.id);
                  return (
                    <TouchableOpacity
                      key={chip.id}
                      onPress={() => toggleFilter("sources", chip.id)}
                      className={`flex-row items-center px-4 py-3 rounded-full border ${isSelected ? "bg-black border-black dark:bg-white dark:border-white" : "bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800"}`}
                    >
                      {isSelected ? (
                        <IconSymbol
                          name="checkmark.circle.fill"
                          size={18}
                          color={isDark ? "#000" : "#fff"}
                          style={{ marginRight: 8 }}
                        />
                      ) : (
                        <IconSymbol
                          name={chip.icon as any}
                          size={18}
                          color={isDark ? "#a1a1aa" : "#71717a"}
                          style={{ marginRight: 8 }}
                        />
                      )}
                      <Text
                        className={`font-semibold ${isSelected ? "text-white dark:text-black" : "text-gray-900 dark:text-gray-100"}`}
                      >
                        {chip.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}

                {/* Categories */}
                {categories.map((category) => {
                  const isSelected = filters.categoryIds.includes(category.id);
                  // Find the icon for the category if available, otherwise default
                  const categoryIcon = category.icon || "folder";

                  return (
                    <TouchableOpacity
                      key={category.id}
                      onPress={() => toggleFilter("categoryIds", category.id)}
                      className={`flex-row items-center px-4 py-3 rounded-full border ${isSelected ? "bg-black border-black dark:bg-white dark:border-white" : "bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800"}`}
                    >
                      {isSelected ? (
                        <IconSymbol
                          name="checkmark.circle.fill"
                          size={18}
                          color={isDark ? "#000" : "#fff"}
                          style={{ marginRight: 8 }}
                        />
                      ) : categoryIcon.includes(".") ? (
                        <IconSymbol
                          name={categoryIcon as any}
                          size={18}
                          color={isDark ? "#a1a1aa" : "#71717a"}
                          style={{ marginRight: 8 }}
                        />
                      ) : (
                        <Text style={{ fontSize: 16, marginRight: 8 }}>
                          {categoryIcon}
                        </Text>
                      )}
                      <Text
                        className={`font-semibold ${isSelected ? "text-white dark:text-black" : "text-gray-900 dark:text-gray-100"}`}
                      >
                        {category.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </ScrollView>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );

  return (
    <ThemedView style={{ flex: 1, paddingTop: insets.top }}>
      {/* Header */}
      <View className="px-6 pb-2 pt-4 flex-row justify-between items-center">
        <ThemedText type="title">Transactions</ThemedText>
        <TouchableOpacity
          className={`p-2 rounded-full ${hasActiveFilters ? "bg-blue-100 dark:bg-blue-900" : "bg-gray-100 dark:bg-gray-800"}`}
          onPress={() => setShowFilterModal(true)}
        >
          <IconSymbol
            name="slider.horizontal.3"
            size={24}
            color={hasActiveFilters ? "#3B82F6" : "#666"}
          />
        </TouchableOpacity>
      </View>

      {/* Search & Filter */}
      <View className="px-6 mb-4">
        <View className="bg-gray-100 dark:bg-gray-800 rounded-xl flex-row items-center px-4 py-3">
          <IconSymbol name="magnifyingglass" size={18} color="#999" />
          <TextInput
            placeholder="Search transactions..."
            value={search}
            onChangeText={setSearch}
            className="flex-1 ml-2 text-base text-black dark:text-white"
            placeholderTextColor="#999"
          />
        </View>

        <View className="mt-3">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="flex-row"
            contentContainerStyle={{ paddingHorizontal: 0, gap: 8, paddingBottom: 4 }}
          >
            {/* Type filters */}
            {[
              { id: "income" as const, label: "Income", icon: "arrow.down.circle" },
              { id: "expense" as const, label: "Expense", icon: "arrow.up.circle" },
            ].map((chip) => {
              const isSelected = filters.types.includes(chip.id);
              return (
                <TouchableOpacity
                  key={chip.id}
                  onPress={() => toggleFilter("types", chip.id)}
                  className={`flex-row items-center px-4 py-1 rounded-full border ${isSelected ? "bg-black border-black dark:bg-white dark:border-white" : "bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800"}`}
                >
                  {isSelected ? (
                    <IconSymbol
                      name="checkmark.circle.fill"
                      size={18}
                      color={isDark ? "#000" : "#fff"}
                      style={{ marginRight: 8 }}
                    />
                  ) : (
                    <IconSymbol
                      name={chip.icon as any}
                      size={18}
                      color={isDark ? "#a1a1aa" : "#71717a"}
                      style={{ marginRight: 8 }}
                    />
                  )}
                  <Text
                    className={`font-semibold ${isSelected ? "text-white dark:text-black" : "text-gray-900 dark:text-gray-100"}`}
                  >
                    {chip.label}
                  </Text>
                </TouchableOpacity>
              );
            })}

            {/* Source filters */}
            {[
              { id: "receipt" as const, label: "Receipts", icon: "doc.text" },
              { id: "manual" as const, label: "Manual", icon: "pencil" },
            ].map((chip) => {
              const isSelected = filters.sources.includes(chip.id);
              return (
                <TouchableOpacity
                  key={chip.id}
                  onPress={() => toggleFilter("sources", chip.id)}
                  className={`flex-row items-center px-4 py-3 rounded-full border ${isSelected ? "bg-black border-black dark:bg-white dark:border-white" : "bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800"}`}
                >
                  {isSelected ? (
                    <IconSymbol
                      name="checkmark.circle.fill"
                      size={18}
                      color={isDark ? "#000" : "#fff"}
                      style={{ marginRight: 8 }}
                    />
                  ) : (
                    <IconSymbol
                      name={chip.icon as any}
                      size={18}
                      color={isDark ? "#a1a1aa" : "#71717a"}
                      style={{ marginRight: 8 }}
                    />
                  )}
                  <Text
                    className={`font-semibold ${isSelected ? "text-white dark:text-black" : "text-gray-900 dark:text-gray-100"}`}
                  >
                    {chip.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
            {/* Categories */}
            {categories.map((category) => {
              const isSelected = filters.categoryIds.includes(category.id);
              const categoryIcon = category.icon || "folder";
              return (
                <TouchableOpacity
                  key={category.id}
                  onPress={() => toggleFilter("categoryIds", category.id)}
                  className={`flex-row items-center px-4 py-3 rounded-full border ${isSelected ? "bg-black border-black dark:bg-white dark:border-white" : "bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800"}`}
                >
                  {isSelected ? (
                    <IconSymbol
                      name="checkmark.circle.fill"
                      size={18}
                      color={isDark ? "#000" : "#fff"}
                      style={{ marginRight: 8 }}
                    />
                  ) : categoryIcon.includes(".") ? (
                    <IconSymbol
                      name={categoryIcon as any}
                      size={18}
                      color={isDark ? "#a1a1aa" : "#71717a"}
                      style={{ marginRight: 8 }}
                    />
                  ) : (
                    <Text style={{ fontSize: 16, marginRight: 8 }}>
                      {categoryIcon}
                    </Text>
                  )}
                  <Text
                    className={`font-semibold ${isSelected ? "text-white dark:text-black" : "text-gray-900 dark:text-gray-100"}`}
                  >
                    {category.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </View>

      {isLoading ? (
        <View className="px-6 py-10 items-center">
          <ActivityIndicator />
        </View>
      ) : null}

      {!isLoading && error ? (
        <View className="px-6 py-10 items-center">
          <ThemedText className="text-red-500">
            Failed to load transactions
          </ThemedText>
        </View>
      ) : null}

      {!isLoading && !error ? (
        <>
          <SectionList
            sections={sections}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            stickySectionHeadersEnabled
            renderSectionHeader={renderSectionHeader}
            renderItem={({ item, index, section }) =>
              renderTransactionRow(item, {
                isLast: index === section.data.length - 1,
              })
            }
            ListEmptyComponent={
              <View className="px-6 py-10 items-center">
                <ThemedText className="text-zinc-500">
                  No transactions found
                </ThemedText>
              </View>
            }
            contentContainerStyle={{ paddingBottom: contentPaddingBottom }}
          />
          {renderFilterModal()}
        </>
      ) : null}
    </ThemedView>
  );
}
