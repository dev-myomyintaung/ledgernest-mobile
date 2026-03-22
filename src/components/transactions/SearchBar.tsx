import React from 'react';
import { View, TextInput } from 'react-native';
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors, zinc } from '@/constants/theme';

interface SearchBarProps {
    value: string;
    onChangeText: (text: string) => void;
    placeholder?: string;
}

export const SearchBar = ({ value, onChangeText, placeholder = "Search transactions..." }: SearchBarProps) => {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    return (
        <View className="px-4 mb-3">
            <View
                className="flex-row items-center px-4 rounded-2xl"
                style={{
                    backgroundColor: isDark ? zinc[800] : zinc[100],
                    borderWidth: 1,
                    borderColor: isDark ? zinc[700] : zinc[200],
                }}
            >
                <IconSymbol name="magnifyingglass" size={15} color={zinc[400]} />
                <TextInput
                    placeholder={placeholder}
                    value={value}
                    onChangeText={onChangeText}
                    style={{
                        flex: 1,
                        marginLeft: 8,
                        fontSize: 15,
                        color: Colors[colorScheme ?? 'light'].text,
                        paddingVertical: 12,
                    }}
                    placeholderTextColor={zinc[400]}
                />
            </View>
        </View>
    );
};
