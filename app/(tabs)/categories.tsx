import { View, TouchableOpacity, Alert } from 'react-native';
import { ThemedText } from '@/components/ui/themed-text';
import { ThemedView } from '@/components/ui/themed-view';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { CategoryList } from '@/components/categories/CategoryList';
import { useCategories, useCreateCategory, useDeleteCategory } from '@/hooks/useCategories';
import { Category } from '@/api/endpoints/categories';
import { useRouter } from 'expo-router';

export default function CategoriesScreen() {
    const insets = useSafeAreaInsets();

    const router = useRouter();

    // Data Container Logic
    const { data: categories = [], isLoading, error } = useCategories();
    const createCategoryMutation = useCreateCategory();
    const deleteCategoryMutation = useDeleteCategory();

    const handleAddPress = () => {
        router.push('/create-category');
    };

    const handleCategoryPress = (category: Category) => {
        // TODO: Navigate to detail/edit
        Alert.alert(
            category.name,
            "Choose an action",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: () => {
                        Alert.alert("Confirm Delete", "Are you sure?", [
                            { text: "Cancel", style: "cancel" },
                            { text: "Delete", style: "destructive", onPress: () => deleteCategoryMutation.mutate(category.id) }
                        ]);
                    }
                }
            ]
        );
    };

    return (
        <ThemedView style={{ flex: 1, paddingTop: insets.top }}>
            <View className="px-6 py-4 flex-row justify-between items-center">
                <ThemedText type="title">Categories</ThemedText>
                <TouchableOpacity
                    onPress={handleAddPress}
                    className="bg-gray-100 dark:bg-gray-800 p-2 rounded-full"
                >
                    <IconSymbol name="plus" size={24} color="#666" />
                </TouchableOpacity>
            </View>

            <CategoryList
                categories={categories}
                onAddPress={handleAddPress}
                onCategoryPress={handleCategoryPress}
                isLoading={isLoading}
                error={error}
            />
        </ThemedView>
    );
}
