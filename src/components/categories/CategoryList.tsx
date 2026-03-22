import { View, ScrollView, ActivityIndicator } from 'react-native';
import { ThemedText } from '@/components/ui/themed-text';
import { CategoryItem } from './CategoryItem';
import { Category } from '@/api/endpoints/categories';
import { semantic } from '@/constants/theme';

export interface CategoryStats {
    transactionCount: number;
    totalAmount: string;
}

interface CategoryListProps {
    categories: Category[];
    onAddPress: () => void;
    onCategoryPress: (category: Category) => void;
    statsById?: Record<string, CategoryStats>;
    isLoading?: boolean;
    error?: unknown;
    contentPaddingBottom?: number;
}

export const CategoryList = ({
    categories,
    onCategoryPress,
    statsById = {},
    isLoading,
    error,
    contentPaddingBottom = 100,
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
                <ThemedText style={{ color: semantic.danger.light }} className="text-center">Failed to load categories</ThemedText>
            </View>
        );
    }

    const expense = categories.filter(c => c.type === 'expense');
    const income  = categories.filter(c => c.type === 'income');

    const renderGrid = (cats: Category[]) => (
        <View className="flex-row flex-wrap justify-between gap-y-4">
            {cats.map(cat => (
                <CategoryItem
                    key={cat.id}
                    category={cat}
                    onPress={onCategoryPress}
                    transactionCount={statsById[cat.id]?.transactionCount ?? 0}
                    totalAmount={statsById[cat.id]?.totalAmount}
                />
            ))}
        </View>
    );

    return (
        <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: contentPaddingBottom }}
            className="px-4"
        >
            {expense.length > 0 ? (
                <View className="mb-6">
                    <ThemedText className="text-xs tracking-widest text-zinc-500 mb-3">EXPENSE</ThemedText>
                    {renderGrid(expense)}
                </View>
            ) : null}

            {income.length > 0 ? (
                <View className="mb-6">
                    <ThemedText className="text-xs tracking-widest text-zinc-500 mb-3">INCOME</ThemedText>
                    {renderGrid(income)}
                </View>
            ) : null}
        </ScrollView>
    );
};
