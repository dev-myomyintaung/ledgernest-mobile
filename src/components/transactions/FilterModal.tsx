
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
                                <TouchableOpacity onPress={onClearFilters}>
                                    <ThemedText className="text-sm text-blue-500">
                                        Clear all
                                    </ThemedText>
                                </TouchableOpacity>
                            )}
                            <TouchableOpacity onPress={onClose}>
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
                                    onRangeChange={({ startDate, endDate }) => onDateRangeChange(startDate, endDate)}
                                />
                            </View>
                        )}

                        {/* Combined Filters */}
                        <View>
                            <ThemedText className="text-xs tracking-widest text-gray-400 mb-3">
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
                                            className={`flex-row items-center px-4 py-3 rounded-full border ${isSelected ? "bg-black border-black dark:bg-white dark:border-white" : "bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800"}`}
                                        >
                                            {categoryIcon.includes(".") ? (
                                                <IconSymbol
                                                    name={categoryIcon as any}
                                                    size={18}
                                                    color={isSelected ? (isDark ? "#000" : "#fff") : (isDark ? "#a1a1aa" : "#71717a")}
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
};
