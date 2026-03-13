import { View, TouchableOpacity, Alert } from 'react-native';
import { ThemedText } from '@/components/ui/themed-text';
import { ThemedView } from '@/components/ui/themed-view';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { CategoryList, CategoryStats } from '@/components/categories/CategoryList';
import { useCategories, useDeleteCategory } from '@/hooks/useCategories';
import { useTransactions } from '@/hooks/useTransactions';
import { useAppCurrency } from '@/hooks/useAppCurrency';
import { Category } from '@/api/endpoints/categories';
import { useRouter, useFocusEffect } from 'expo-router';
import { getFloatingTabContentPaddingBottom } from '@/constants/layout';
import { useMemo, useCallback } from 'react';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function CategoriesScreen() {
    const insets = useSafeAreaInsets();
    const contentPaddingBottom = getFloatingTabContentPaddingBottom(insets.bottom);
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const router = useRouter();
    const { format } = useAppCurrency();

    const { data: categories = [], isLoading, error, refetch: refetchCats } = useCategories();
    const { data: transactions = [], refetch: refetchTxs } = useTransactions();
    const deleteCategoryMutation = useDeleteCategory();

    useFocusEffect(useCallback(() => {
        refetchCats();
        refetchTxs();
    }, [refetchCats, refetchTxs]));

    // Compute per-category stats from all transactions
    const statsById = useMemo(() => {
        const map: Record<string, CategoryStats> = {};
        transactions.forEach(tx => {
            if (!tx.categoryId) return;
            if (!map[tx.categoryId]) {
                map[tx.categoryId] = { transactionCount: 0, totalAmount: '' };
            }
            map[tx.categoryId].transactionCount += 1;
            const prev = parseFloat(map[tx.categoryId].totalAmount) || 0;
            map[tx.categoryId].totalAmount = String(prev + Number(tx.amount));
        });
        // Format totals
        Object.keys(map).forEach(id => {
            map[id].totalAmount = format(map[id].totalAmount);
        });
        return map;
    }, [transactions, format]);

    const handleCategoryPress = (category: Category) => {
        Alert.alert(
            category.name,
            'Choose an action',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'View Transactions',
                    onPress: () => router.push({
                        pathname: '/(tabs)/transactions',
                        params: { categoryId: category.id },
                    }),
                },
                {
                    text: 'Edit',
                    onPress: () => router.push({
                        pathname: '/create-category',
                        params: {
                            categoryId: category.id,
                            name: category.name,
                            type: category.type,
                            color: category.color ?? '',
                            icon: category.icon ?? '',
                        },
                    }),
                },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => {
                        Alert.alert('Confirm Delete', 'This will remove the category. Transactions will keep their category reference.', [
                            { text: 'Cancel', style: 'cancel' },
                            {
                                text: 'Delete',
                                style: 'destructive',
                                onPress: () => deleteCategoryMutation.mutate(category.id),
                            },
                        ]);
                    },
                },
            ]
        );
    };

    return (
        <ThemedView style={{ flex: 1, paddingTop: insets.top }}>
            <View className="px-4 pt-4 pb-3 flex-row justify-between items-center">
                <ThemedText type="title">Categories</ThemedText>
                <TouchableOpacity
                    onPress={() => router.push('/create-category')}
                    className="w-10 h-10 rounded-full items-center justify-center"
                    style={{ backgroundColor: isDark ? '#ffffff' : '#111111' }}
                >
                    <IconSymbol name="plus" size={20} color={isDark ? '#111111' : '#ffffff'} />
                </TouchableOpacity>
            </View>

            <CategoryList
                categories={categories}
                onAddPress={() => router.push('/create-category')}
                onCategoryPress={handleCategoryPress}
                statsById={statsById}
                isLoading={isLoading}
                error={error}
                contentPaddingBottom={contentPaddingBottom}
            />
        </ThemedView>
    );
}
