import { View, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/ui/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Category } from '@/api/endpoints/categories';

interface CategoryItemProps {
    category: Category;
    onPress: (category: Category) => void;
}

export const CategoryItem = ({ category, onPress }: CategoryItemProps) => {
    // Helper to determine if the color is a Tailwind class or a raw color string (Hex/RGB)
    const isTailwindClass = category.color?.startsWith('bg-');

    // Check if icon is likely an emoji or non-standard icon (not matching SF Symbol/Material Icon patterns)
    // SF Symbols and Material Icons typically consist of lowercase letters, numbers, dots, and dashes.
    const isEmoji = category.icon && !/^[a-z0-9.-]+$/.test(category.icon);

    return (
        <TouchableOpacity
            onPress={() => onPress(category)}
            className="w-[48%] bg-gray-50 dark:bg-gray-900 p-4 rounded-3xl aspect-[1.1] justify-between border border-gray-100 dark:border-gray-800"
        >
            <View
                className={`w-12 h-12 rounded-full items-center justify-center ${isTailwindClass ? category.color : ''} ${!category.color ? 'bg-gray-200 dark:bg-gray-700' : ''}`}
                style={!isTailwindClass && category.color ? { backgroundColor: category.color + '20' } : undefined}
            >
                {isEmoji ? (
                    <ThemedText style={{ fontSize: 24 }}>{category.icon}</ThemedText>
                ) : (
                    <IconSymbol
                        name={category.icon as any || 'questionmark'}
                        size={24}
                        color={!isTailwindClass && category.color ? category.color : (isTailwindClass ? '#FFF' : '#666')}
                    />
                )}
            </View>
            <View>
                <ThemedText type="defaultSemiBold" className="mb-1">{category.name}</ThemedText>
                <ThemedText className="text-xs text-gray-500">12 transactions</ThemedText>
            </View>
        </TouchableOpacity>
    );
};
