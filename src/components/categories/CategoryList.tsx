import { View, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { ThemedText } from '@/components/ui/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { CategoryItem } from './CategoryItem';
import { Category } from '@/api/endpoints/categories';

interface CategoryListProps {
    categories: Category[];
    onAddPress: () => void;
    onCategoryPress: (category: Category) => void;
    isLoading?: boolean;
    error?: unknown;
}

export const CategoryList = ({
    categories,
    onAddPress,
    onCategoryPress,
    isLoading,
    error,
}: CategoryListProps) => {
    if (isLoading) {
        return (
            <View className="flex-1 justify-center items-center">
                <ActivityIndicator size="large" />
            </View>
        );
    }

    if (error) {
        return (
            <View className="flex-1 justify-center items-center p-4">
                <ThemedText className="text-red-500 text-center">Failed to load categories</ThemedText>
            </View>
        );
    }

    return (
        <ScrollView contentContainerStyle={{ paddingBottom: 100 }} className="px-6">
            <View className="flex-row flex-wrap justify-between gap-y-4">
                {categories.map((cat) => (
                    <CategoryItem key={cat.id} category={cat} onPress={onCategoryPress} />
                ))}
            </View>
        </ScrollView>
    );
};
