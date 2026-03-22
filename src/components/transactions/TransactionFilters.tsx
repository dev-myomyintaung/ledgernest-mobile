import React from 'react';
import { View, ScrollView, TouchableOpacity, Text } from 'react-native';
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { FilterState, FilterType, FilterSource } from "@/hooks/useFilteredTransactions";
import { Category } from "@/api/endpoints/categories";
import { Colors, zinc, brand } from '@/constants/theme';

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
    const cs = colorScheme ?? 'light';

    return (
        <View className="mb-2">
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 16, gap: 8, paddingBottom: 8 }}
            >
                {categories.map((category) => {
                    const isSelected = filters.categoryIds.includes(category.id);
                    const categoryIcon = category.icon || "folder";
                    return (
                        <TouchableOpacity
                            key={category.id}
                            activeOpacity={0.7}
                            onPress={() => onToggleFilter("categoryIds", category.id)}
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                paddingHorizontal: 13,
                                paddingVertical: 8,
                                borderRadius: 20,
                                borderWidth: 1,
                                backgroundColor: isSelected
                                    ? isDark ? brand[400] : brand[500]
                                    : isDark ? zinc[800] : zinc[100],
                                borderColor: isSelected
                                    ? isDark ? brand[400] : brand[500]
                                    : isDark ? zinc[700] : zinc[200],
                            }}
                        >
                            {categoryIcon.includes(".") ? (
                                <IconSymbol
                                    name={categoryIcon as any}
                                    size={13}
                                    color={isSelected ? Colors[cs].primaryForeground : zinc[500]}
                                    style={{ marginRight: 6 }}
                                />
                            ) : (
                                <Text style={{ fontSize: 13, marginRight: 6 }}>
                                    {categoryIcon}
                                </Text>
                            )}
                            <Text
                                style={{
                                    fontSize: 13,
                                    fontWeight: '600',
                                    color: isSelected
                                        ? Colors[cs].primaryForeground
                                        : isDark ? zinc[300] : zinc[700],
                                }}
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
