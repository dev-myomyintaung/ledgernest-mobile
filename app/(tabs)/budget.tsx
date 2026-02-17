import { View, ScrollView } from 'react-native';
import { ThemedText } from '@/components/ui/themed-text';
import { ThemedView } from '@/components/ui/themed-view';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { PieChart } from 'react-native-gifted-charts';
import { useColorScheme } from '@/hooks/use-color-scheme';

// Mock data - Shades of black/gray
// Mock data - Lively Colors (Pastel Bg + Vibrant Icon)
const budgets = [
    { id: '1', name: 'Food & Drinks', spent: 320, limit: 500, color: 'bg-orange-100 dark:bg-orange-900/30', hex: '#ea580c', iconColor: 'text-orange-600' }, // Orange
    { id: '2', name: 'Transport', spent: 150, limit: 200, color: 'bg-blue-100 dark:bg-blue-900/30', hex: '#2563eb', iconColor: 'text-blue-600' }, // Blue
    { id: '3', name: 'Entertainment', spent: 80, limit: 150, color: 'bg-purple-100 dark:bg-purple-900/30', hex: '#9333ea', iconColor: 'text-purple-600' }, // Purple
    { id: '4', name: 'Shopping', spent: 450, limit: 600, color: 'bg-pink-100 dark:bg-pink-900/30', hex: '#db2777', iconColor: 'text-pink-600' }, // Pink
    { id: '5', name: 'Housing', spent: 1200, limit: 1200, color: 'bg-green-100 dark:bg-green-900/30', hex: '#16a34a', iconColor: 'text-green-600' }, // Green
];

export default function BudgetScreen() {
    const insets = useSafeAreaInsets();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const pieData = budgets.map(b => ({
        value: b.spent,
        color: isDark ? '#f4f4f5' : '#18181b', // Default monochrome base
        text: '',
    }));

    // Monochrome Chart Data (Shades of Gray)
    const chartData = [
        { value: 320, color: isDark ? '#f4f4f5' : '#18181b' }, // Black/White
        { value: 150, color: isDark ? '#a1a1aa' : '#52525b' }, // Medium Gray
        { value: 80, color: isDark ? '#52525b' : '#a1a1aa' },  // Light Gray
        { value: 450, color: isDark ? '#27272a' : '#e4e4e7' }, // Very Light
        { value: 1200, color: isDark ? '#3f3f46' : '#d4d4d8' },
    ];

    const totalSpent = budgets.reduce((acc, curr) => acc + curr.spent, 0);

    return (
        <ThemedView style={{ flex: 1, paddingTop: insets.top }}>
            <View className="px-6 py-4">
                <ThemedText type="title">Budgets</ThemedText>
                <ThemedText className="text-gray-500 mt-1">April 2024</ThemedText>
            </View>

            <ScrollView contentContainerStyle={{ paddingBottom: 100 }} className="px-6">
                {/* Spaced Chart Section */}
                <View className="items-center mb-10">
                    <PieChart
                        data={chartData}
                        donut
                        radius={70}
                        innerRadius={50}
                        innerCircleColor={isDark ? '#000000' : '#FFFFFF'}
                        centerLabelComponent={() => {
                            return (
                                <View className="justify-center items-center">
                                    <ThemedText className="text-xl font-bold">${totalSpent}</ThemedText>
                                </View>
                            );
                        }}
                    />
                </View>

                {budgets.map((budget) => {
                    const progress = (budget.spent / budget.limit) * 100;
                    return (
                        <View key={budget.id} className="mb-8">
                            <View className="flex-row justify-between mb-3">
                                <View className="flex-row items-center gap-2">
                                    <View className={`w-2 h-2 rounded-full`} style={{ backgroundColor: budget.hex }} />
                                    <ThemedText type="defaultSemiBold" className="text-sm">{budget.name}</ThemedText>
                                </View>
                                <ThemedText className="text-gray-500 text-xs">
                                    ${budget.spent} / ${budget.limit}
                                </ThemedText>
                            </View>

                            {/* Spaced Progress Bar */}
                            <View className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                <View
                                    className="h-full rounded-full"
                                    style={{
                                        width: `${Math.min(progress, 100)}%`,
                                        backgroundColor: isDark ? 'white' : 'black'
                                    }}
                                />
                            </View>

                            {progress >= 100 && (
                                <ThemedText className="text-red-500 text-[10px] mt-1">Limit reached!</ThemedText>
                            )}
                        </View>
                    );
                })}

                {/* Spaced Create new budget */}
                <View className="border border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 items-center justify-center mt-4">
                    <IconSymbol name="plus" size={24} color="#999" />
                    <ThemedText className="text-gray-400 mt-2 text-sm">Create New Budget</ThemedText>
                </View>
            </ScrollView>
        </ThemedView>
    );
}
