import { View, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/ui/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Category } from '@/api/endpoints/categories';

interface CategoryItemProps {
    category: Category;
    onPress: (category: Category) => void;
    transactionCount?: number;
    totalAmount?: string;
}

export const CategoryItem = ({ category, onPress, transactionCount = 0, totalAmount }: CategoryItemProps) => {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const isEmoji = category.icon && !/^[a-z0-9.\-]+$/.test(category.icon);
    const color = category.color && !category.color.startsWith('bg-') ? category.color : null;
    const iconBg = color ? color + '25' : isDark ? '#27272a' : '#f4f4f5';
    const iconColor = color ?? (isDark ? '#a1a1aa' : '#71717a');

    return (
        <TouchableOpacity
            onPress={() => onPress(category)}
            className="w-[48%] bg-zinc-50 dark:bg-zinc-900 p-4 rounded-3xl justify-between border border-zinc-100 dark:border-zinc-800"
            style={{ aspectRatio: 1.1 }}
        >
            <View className="w-11 h-11 rounded-2xl items-center justify-center" style={{ backgroundColor: iconBg }}>
                {isEmoji ? (
                    <ThemedText style={{ fontSize: 22 }}>{category.icon}</ThemedText>
                ) : (
                    <IconSymbol
                        name={(category.icon as any) || 'questionmark'}
                        size={20}
                        color={iconColor}
                    />
                )}
            </View>

            <View>
                <ThemedText type="defaultSemiBold" className="mb-0.5" numberOfLines={1}>
                    {category.name}
                </ThemedText>
                <View className="flex-row items-center justify-between">
                    <ThemedText className="text-xs text-zinc-500">
                        {transactionCount} {transactionCount === 1 ? 'txn' : 'txns'}
                    </ThemedText>
                    {totalAmount ? (
                        <ThemedText className="text-xs font-semibold" style={{ color: iconColor }}>
                            {totalAmount}
                        </ThemedText>
                    ) : null}
                </View>
            </View>
        </TouchableOpacity>
    );
};
