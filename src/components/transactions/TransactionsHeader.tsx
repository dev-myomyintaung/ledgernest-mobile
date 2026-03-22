
import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { ThemedText } from "@/components/ui/themed-text";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, zinc } from '@/constants/theme';

interface TransactionsHeaderProps {
    onFilterPress: () => void;
    hasActiveFilters: boolean;
}

export const TransactionsHeader = ({ onFilterPress, hasActiveFilters }: TransactionsHeaderProps) => {
    const colorScheme = useColorScheme();
    return (
        <View className="px-6 pb-2 pt-4 flex-row justify-between items-center">
            <ThemedText type="title">Transactions</ThemedText>
            <TouchableOpacity
                className={`p-2 rounded-full ${hasActiveFilters ? "bg-brand-100 dark:bg-brand-900" : "bg-zinc-100 dark:bg-zinc-800"}`}
                onPress={onFilterPress}
            >
                <IconSymbol
                    name="slider.horizontal.3"
                    size={24}
                    color={hasActiveFilters ? Colors[colorScheme ?? 'light'].primary : zinc[500]}
                />
            </TouchableOpacity>
        </View>
    );
};
