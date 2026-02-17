import { View, ScrollView, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/ui/themed-text';
import { ThemedView } from '@/components/ui/themed-view';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/ui/icon-symbol';

// Mock data
const categories = [
    { id: '1', name: 'Food & Drinks', icon: 'cup.and.saucer.fill', color: 'bg-orange-100', iconColor: '#F97316' },
    { id: '2', name: 'Transport', icon: 'car.fill', color: 'bg-blue-100', iconColor: '#3B82F6' },
    { id: '3', name: 'Entertainment', icon: 'film.fill', color: 'bg-purple-100', iconColor: '#A855F7' },
    { id: '4', name: 'Shopping', icon: 'bag.fill', color: 'bg-pink-100', iconColor: '#EC4899' },
    { id: '5', name: 'Bills & Utilities', icon: 'doc.text.fill', color: 'bg-yellow-100', iconColor: '#F59E0B' },
    { id: '6', name: 'Housing', icon: 'house.fill', color: 'bg-green-100', iconColor: '#10B981' },
];

export default function CategoriesScreen() {
    const insets = useSafeAreaInsets();

    return (
        <ThemedView style={{ flex: 1, paddingTop: insets.top }}>
            <View className="px-6 py-4 flex-row justify-between items-center">
                <ThemedText type="title">Categories</ThemedText>
                <TouchableOpacity className="bg-gray-100 dark:bg-gray-800 p-2 rounded-full">
                    <IconSymbol name="plus" size={24} color="#666" />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={{ paddingBottom: 100 }} className="px-6">
                <View className="flex-row flex-wrap justify-between gap-y-4">
                    {categories.map((cat) => (
                        <TouchableOpacity key={cat.id} className="w-[48%] bg-gray-50 dark:bg-gray-900 p-4 rounded-3xl aspect-[1.1] justify-between border border-gray-100 dark:border-gray-800">
                            <View className={`w-12 h-12 rounded-full items-center justify-center ${cat.color} dark:bg-gray-800`}>
                                <IconSymbol name={cat.icon as any} size={24} color={cat.iconColor} />
                            </View>
                            <View>
                                <ThemedText type="defaultSemiBold" className="mb-1">{cat.name}</ThemedText>
                                <ThemedText className="text-xs text-gray-500">12 transactions</ThemedText>
                            </View>
                        </TouchableOpacity>
                    ))}

                    {/* Add New Placeholder */}
                    <TouchableOpacity className="w-[48%] border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-3xl aspect-[1.1] items-center justify-center">
                        <IconSymbol name="plus" size={32} color="#CCC" />
                        <ThemedText className="text-gray-400 mt-2 font-medium">Add New</ThemedText>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </ThemedView>
    );
}
