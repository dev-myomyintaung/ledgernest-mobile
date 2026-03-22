
import React from 'react';
import { View, ScrollView, TouchableOpacity, Text } from 'react-native';
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { FilterState, FilterType, FilterSource } from "@/hooks/useFilteredTransactions";
import { Category } from "@/api/endpoints/categories";
import { Colors, zinc } from '@/constants/theme';

interface TransactionFiltersProps {
    filters: FilterState;
    onToggleFilter: <T extends "types" | "sources" | "categoryIds">(
        key: T,
        value: T extends "types" ? FilterType : T extends "sources" ? FilterSource : string
    ) => void;
    categories: Category[];
}

export const TransactionFilters = ({ filters, onToggleFilter, categories }: TransactionFiltersProps) => {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === "dark";

    return (
        <View className="px-6 mb-4">
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="flex-row"
                contentContainerStyle={{ paddingHorizontal: 0, gap: 8, paddingBottom: 4 }}
            >




                {/* Categories */}
                {categories.map((category) => {
                    const isSelected = filters.categoryIds.includes(category.id);
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
            </ScrollView>
        </View>
    );
};
