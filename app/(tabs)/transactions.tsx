import { useState, useEffect } from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemedView } from "@/components/ui/themed-view";
import { useTransactions } from "@/hooks/useTransactions";
import { getFloatingTabContentPaddingBottom } from "@/constants/layout";
import { useFilteredTransactions, FilterState, FilterType, FilterSource } from "@/hooks/useFilteredTransactions";
import { useCategories } from "@/hooks/useCategories";
import { useTransactionSections } from "@/hooks/useTransactionSections";
import { TransactionsHeader } from "@/components/transactions/TransactionsHeader";
import { SearchBar } from "@/components/transactions/SearchBar";
import { TransactionFilters } from "@/components/transactions/TransactionFilters";
import { TransactionList } from "@/components/transactions/TransactionList";
import { FilterModal } from "@/components/transactions/FilterModal";
import { useLocalSearchParams } from "expo-router";

export default function TransactionsScreen() {
  const insets = useSafeAreaInsets();
  const { categoryId } = useLocalSearchParams<{ categoryId?: string }>();

  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    types: [],
    sources: [],
    categoryIds: categoryId ? [categoryId] : [],
    dateRange: { start: null, end: null },
  });

  // Update filter if categoryId param changes (e.g. navigating from categories)
  useEffect(() => {
    if (categoryId) {
      setFilters(prev => ({ ...prev, categoryIds: [categoryId] }));
    }
  }, [categoryId]);
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

  const setDateRange = (start: string | null, end: string | null) => {
    setFilters(prev => ({
      ...prev,
      dateRange: { start, end }
    }));
  };

  const clearFilters = () => {
    setFilters({ types: [], sources: [], categoryIds: [], dateRange: { start: null, end: null } });
  };

  const filteredTransactions = useFilteredTransactions(transactions, filters, search);
  const sections = useTransactionSections(filteredTransactions, filters);

  return (
    <ThemedView style={{ flex: 1, paddingTop: insets.top }}>
      <TransactionsHeader
        onFilterPress={() => setShowFilterModal(true)}
        hasActiveFilters={hasActiveFilters}
      />

      <SearchBar
        value={search}
        onChangeText={setSearch}
      />

      <TransactionFilters
        filters={filters}
        onToggleFilter={toggleFilter}
        categories={categories}
      />

      <TransactionList
        sections={sections}
        isLoading={isLoading}
        error={error}
        contentPaddingBottom={contentPaddingBottom}
      />

      <FilterModal
        visible={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        filters={filters}
        onToggleFilter={toggleFilter}
        onDateRangeChange={setDateRange}
        onClearFilters={clearFilters}
        categories={categories}
      />
    </ThemedView>
  );
}
