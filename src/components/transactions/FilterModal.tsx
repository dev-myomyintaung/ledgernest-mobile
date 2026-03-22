
import React from 'react';
import { View, Modal, TouchableOpacity, ScrollView, Text } from 'react-native';
import { ThemedText } from "@/components/ui/themed-text";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import dayjs from "dayjs";
import { FilterState, FilterType, FilterSource } from "@/hooks/useFilteredTransactions";
import { Category } from "@/api/endpoints/categories";
import { Colors, zinc } from '@/constants/theme';

interface FilterModalProps {
    visible: boolean;
    onClose: () => void;
    filters: FilterState;
    onToggleFilter: <T extends "types" | "sources" | "categoryIds">(
        key: T,
        value: T extends "types" ? FilterType : T extends "sources" ? FilterSource : string
    ) => void;
    onDateRangeChange: (start: string | null, end: string | null) => void;
    onClearFilters: () => void;
    categories: Category[];
}

export const FilterModal = ({
    visible,
    onClose,
    filters,
    onToggleFilter,
    onDateRangeChange,
    onClearFilters,
    categories
}: FilterModalProps) => {
    const insets = useSafeAreaInsets();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === "dark";
    const [showDatePicker, setShowDatePicker] = React.useState(false);

    const hasActiveFilters = filters.types.length > 0 || filters.sources.length > 0 || filters.categoryIds.length > 0 || !!filters.dateRange.start || !!filters.dateRange.end;


    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            {/* Backdrop — tap to close */}
            <TouchableOpacity
                activeOpacity={1}
                style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.45)" }}
                onPress={onClose}
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
                        backgroundColor: Colors[colorScheme ?? 'light'].background,
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
                            backgroundColor: isDark ? zinc[600] : zinc[300],
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
                                <TouchableOpacity onPress={onClearFilters}>
                                    <ThemedText style={{ color: Colors[colorScheme ?? 'light'].primary }} className="text-sm">
                                        Clear all
                                    </ThemedText>
                                </TouchableOpacity>
                            )}
                            <TouchableOpacity onPress={onClose}>
                                <IconSymbol
                                    name="xmark.circle.fill"
                                    size={28}
                                    color={Colors[colorScheme ?? 'light'].icon}
                                />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={true} className="px-6">
                        {/* Date Range */}
                        <View>
                            <ThemedText className="text-xs tracking-widest text-zinc-400 mb-3">
                                DATE RANGE
                            </ThemedText>
                            <TouchableOpacity
                                onPress={() => setShowDatePicker(!showDatePicker)}
                                className={`flex-row gap-3 mb-5 p-3 rounded-xl border ${showDatePicker ? "border-brand-500 dark:border-brand-400" : "border-zinc-200 dark:border-zinc-700"}`}
                            >
                                <View className="flex-1">
                                    <ThemedText className="text-xs text-zinc-400 mb-1">Start Date</ThemedText>
                                    <ThemedText className={filters.dateRange.start ? "" : "text-zinc-400"}>
                                        {filters.dateRange.start ? dayjs(filters.dateRange.start).format("MMM D, YYYY") : "Select start date"}
                                    </ThemedText>
                                </View>
                                <View className="w-[1px] bg-zinc-200 dark:bg-zinc-700" />
                                <View className="flex-1">
                                    <ThemedText className="text-xs text-zinc-400 mb-1">End Date</ThemedText>
                                    <ThemedText className={filters.dateRange.end ? "" : "text-zinc-400"}>
                                        {filters.dateRange.end ? dayjs(filters.dateRange.end).format("MMM D, YYYY") : "Select end date"}
                                    </ThemedText>
                                </View>
                            </TouchableOpacity>
                        </View>

                        {showDatePicker && (
                            <View className="mb-5 bg-zinc-50 dark:bg-zinc-900 rounded-xl p-2">
                                <DateRangePicker
                                    initialStartDate={filters.dateRange.start}
                                    initialEndDate={filters.dateRange.end}
                                    onRangeChange={({ startDate, endDate }) => onDateRangeChange(startDate, endDate)}
                                />
                            </View>
                        )}

                        {/* Combined Filters */}
                        <View>
                            <ThemedText className="text-xs tracking-widest text-zinc-400 mb-3">
                                FILTERS
                            </ThemedText>
                            <View className="flex-row flex-wrap gap-2 mb-5">




                                {/* Categories */}
                                {categories.map((category) => {
                                    const isSelected = filters.categoryIds.includes(category.id);
                                    // Find the icon for the category if available, otherwise default
                                    const categoryIcon = category.icon || "folder";

                                    return (
                                        <TouchableOpacity
                                            key={category.id}
                                            onPress={() => onToggleFilter("categoryIds", category.id)}
                                            className={`flex-row items-center px-4 py-3 rounded-full border ${isSelected ? "bg-brand-500 border-brand-500 dark:bg-brand-400 dark:border-brand-400" : "bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"}`}
                                        >
                                            {categoryIcon.includes(".") ? (
                                                <IconSymbol
                                                    name={categoryIcon as any}
                                                    size={18}
                                                    color={isSelected ? (isDark ? zinc[900] : '#FFFFFF') : (isDark ? zinc[400] : zinc[500])}
                                                    style={{ marginRight: 8 }}
                                                />
                                            ) : (
                                                <Text style={{ fontSize: 16, marginRight: 8 }}>
                                                    {categoryIcon}
                                                </Text>
                                            )}
                                            <Text
                                                className={`font-semibold ${isSelected ? "text-zinc-50 dark:text-zinc-900" : "text-zinc-900 dark:text-zinc-50"}`}
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
};
