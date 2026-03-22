
import React from 'react';
import { View, TextInput } from 'react-native';
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColorScheme } from '@/hooks/use-color-scheme';
import { zinc } from '@/constants/theme';

interface SearchBarProps {
    value: string;
    onChangeText: (text: string) => void;
    placeholder?: string;
}

export const SearchBar = ({ value, onChangeText, placeholder = "Search transactions..." }: SearchBarProps) => {
    const isDark = useColorScheme() === 'dark';
    return (
        <View className="px-6 mb-4">
            <View className="bg-zinc-100 dark:bg-zinc-800 rounded-xl flex-row items-center px-4 py-1">
                <IconSymbol name="magnifyingglass" size={18} color={zinc[400]} />
                <TextInput
                    placeholder={placeholder}
                    value={value}
                    onChangeText={onChangeText}
                    style={{ flex: 1, marginLeft: 8, fontSize: 16, textAlignVertical: 'center', color: isDark ? zinc[50] : zinc[900], paddingVertical: 10 }}
                    placeholderTextColor={zinc[400]}
                />
            </View>
        </View>
    );
};
