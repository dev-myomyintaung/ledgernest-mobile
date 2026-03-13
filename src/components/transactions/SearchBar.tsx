
import React from 'react';
import { View, TextInput } from 'react-native';
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColorScheme } from '@/hooks/use-color-scheme';

interface SearchBarProps {
    value: string;
    onChangeText: (text: string) => void;
    placeholder?: string;
}

export const SearchBar = ({ value, onChangeText, placeholder = "Search transactions..." }: SearchBarProps) => {
    const isDark = useColorScheme() === 'dark';
    return (
        <View className="px-6 mb-4">
            <View className="bg-gray-100 dark:bg-gray-800 rounded-xl flex-row items-center px-4 py-1">
                <IconSymbol name="magnifyingglass" size={18} color="#999" />
                <TextInput
                    placeholder={placeholder}
                    value={value}
                    onChangeText={onChangeText}
                    style={{ flex: 1, marginLeft: 8, fontSize: 16, textAlignVertical: 'center', color: isDark ? '#ffffff' : '#000000', paddingVertical: 10 }}
                    placeholderTextColor="#999"
                />
            </View>
        </View>
    );
};
