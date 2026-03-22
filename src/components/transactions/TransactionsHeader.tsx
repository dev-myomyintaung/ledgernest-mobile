import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { ThemedText } from "@/components/ui/themed-text";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, zinc, brand } from '@/constants/theme';

interface TransactionsHeaderProps {
    onFilterPress: () => void;
    hasActiveFilters: boolean;
}

export const TransactionsHeader = ({ onFilterPress, hasActiveFilters }: TransactionsHeaderProps) => {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const cs = colorScheme ?? 'light';

    return (
        <View className="px-4 pt-5 pb-3 flex-row justify-between items-center">
            <ThemedText className="text-2xl font-bold">Transactions</ThemedText>
            <TouchableOpacity
                activeOpacity={0.7}
                onPress={onFilterPress}
                style={{
                    width: 38,
                    height: 38,
                    borderRadius: 19,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: hasActiveFilters
                        ? isDark ? brand[900] : brand[100]
                        : isDark ? zinc[800] : zinc[100],
                    borderWidth: 1,
                    borderColor: hasActiveFilters
                        ? isDark ? brand[700] : brand[200]
                        : isDark ? zinc[700] : zinc[200],
                }}
            >
                <IconSymbol
                    name="slider.horizontal.3"
                    size={17}
                    color={hasActiveFilters ? Colors[cs].primary : Colors[cs].icon}
                />
            </TouchableOpacity>
        </View>
    );
};
