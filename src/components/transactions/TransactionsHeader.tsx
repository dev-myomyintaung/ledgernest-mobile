
import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { ThemedText } from "@/components/ui/themed-text";
import { IconSymbol } from "@/components/ui/icon-symbol";

interface TransactionsHeaderProps {
    onFilterPress: () => void;
    hasActiveFilters: boolean;
}

export const TransactionsHeader = ({ onFilterPress, hasActiveFilters }: TransactionsHeaderProps) => {
    return (
        <View className="px-6 pb-2 pt-4 flex-row justify-between items-center">
            <ThemedText type="title">Transactions</ThemedText>
            <TouchableOpacity
                className={`p-2 rounded-full ${hasActiveFilters ? "bg-blue-100 dark:bg-blue-900" : "bg-gray-100 dark:bg-gray-800"}`}
                onPress={onFilterPress}
            >
                <IconSymbol
                    name="slider.horizontal.3"
                    size={24}
                    color={hasActiveFilters ? "#3B82F6" : "#666"}
                />
            </TouchableOpacity>
        </View>
    );
};
