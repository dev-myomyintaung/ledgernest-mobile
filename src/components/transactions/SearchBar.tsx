
import React from 'react';
import { View, TextInput } from 'react-native';
import { IconSymbol } from "@/components/ui/icon-symbol";

interface SearchBarProps {
    value: string;
    onChangeText: (text: string) => void;
    placeholder?: string;
}

export const SearchBar = ({ value, onChangeText, placeholder = "Search transactions..." }: SearchBarProps) => {
    return (
        <View className="px-6 mb-4">
            <View className="bg-gray-100 dark:bg-gray-800 rounded-xl flex-row items-center px-4 py-3">
                <IconSymbol name="magnifyingglass" size={18} color="#999" />
                <TextInput
                    placeholder={placeholder}
                    value={value}
                    onChangeText={onChangeText}
                    className="flex-1 ml-2 text-base text-black dark:text-white"
                    placeholderTextColor="#999"
                />
            </View>
        </View>
    );
};
