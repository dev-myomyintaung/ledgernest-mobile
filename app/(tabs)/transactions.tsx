import { View, ScrollView, TouchableOpacity, TextInput, Text } from 'react-native';
import { Stack } from 'expo-router';
import { ThemedText } from '@/components/ui/themed-text';
import { ThemedView } from '@/components/ui/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState } from 'react';

// Mock data
// Mock data with Vibrant Colors
const transactions = [
    { id: '1', title: 'Starbucks Coffee', category: 'Food & Drinks', amount: -4.50, date: 'Today, 10:23 AM', icon: 'cup.and.saucer.fill', color: 'bg-orange-100 dark:bg-orange-900/30', iconColor: '#ea580c' },
    { id: '2', title: 'Uber Technologies', category: 'Transport', amount: -24.80, date: 'Today, 08:45 AM', icon: 'car.fill', color: 'bg-blue-100 dark:bg-blue-900/30', iconColor: '#2563eb' },
    { id: '3', title: 'Payroll Deposit', category: 'Salary', amount: 4250.00, date: 'Yesterday', icon: 'banknote.fill', color: 'bg-teal-100 dark:bg-teal-900/30', iconColor: '#0d9488' },
    { id: '4', title: 'Apple Store', category: 'Shopping', amount: -1299.00, date: 'Yesterday', icon: 'bag.fill', color: 'bg-pink-100 dark:bg-pink-900/30', iconColor: '#db2777' },
    { id: '5', title: 'Netflix', category: 'Subscription', amount: -15.99, date: '2 days ago', icon: 'play.rectangle.fill', color: 'bg-purple-100 dark:bg-purple-900/30', iconColor: '#9333ea' },
];

export default function TransactionsScreen() {
    const insets = useSafeAreaInsets();
    const [filter, setFilter] = useState('All');

    return (
        <ThemedView style={{ flex: 1, paddingTop: insets.top }}>
            {/* Header */}
            <View className="px-6 py-4 flex-row justify-between items-center">
                <ThemedText type="title">Transactions</ThemedText>
                <TouchableOpacity className="bg-gray-100 dark:bg-gray-800 p-2 rounded-full">
                    <IconSymbol name="slider.horizontal.3" size={24} color="#666" />
                </TouchableOpacity>
            </View>

            {/* Search & Filter */}
            <View className="px-6 mb-4 space-y-4">
                <View className="bg-gray-100 dark:bg-gray-800 rounded-xl flex-row items-center px-4 py-3">
                    <IconSymbol name="magnifyingglass" size={20} color="#999" />
                    <TextInput
                        placeholder="Search transactions..."
                        className="flex-1 ml-2 text-base text-black dark:text-white"
                        placeholderTextColor="#999"
                    />
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-3 mt-4">
                    {['All', 'Income', 'Expense', 'Transport', 'Food'].map(f => {
                        const isSelected = filter === f;
                        return (
                            <TouchableOpacity
                                key={f}
                                onPress={() => setFilter(f)}
                                className={`px-6 mr-2 py-2.5 rounded-full border ${isSelected ? 'bg-black border-black dark:bg-white dark:border-white' : 'bg-transparent border-gray-200 dark:border-gray-700'}`}
                            >
                                <Text className={`font-semibold ${isSelected ? 'text-white dark:text-black' : 'text-gray-500'}`}>
                                    {f}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            </View>

            {/* Transaction List */}
            <ScrollView contentContainerStyle={{ paddingBottom: 100 }} className="px-6">
                {transactions.map((tx) => (
                    <View key={tx.id} className="flex-row justify-between items-center py-4 border-b border-gray-100 dark:border-gray-800">
                        <View className="flex-row items-center gap-4">
                            {/* Vibrant Icon Container */}
                            <View className={`w-12 h-12 rounded-2xl items-center justify-center ${tx.color}`}>
                                <IconSymbol name={tx.icon as any} size={20} color={tx.iconColor} />
                            </View>
                            <View>
                                <ThemedText type="defaultSemiBold">{tx.title}</ThemedText>
                                <ThemedText className="text-xs text-gray-400">{tx.date} • {tx.category}</ThemedText>
                            </View>
                        </View>
                        <ThemedText type="defaultSemiBold" style={{ color: tx.amount > 0 ? '#10B981' : undefined }}>
                            {tx.amount > 0 ? '+' : ''}${Math.abs(tx.amount).toFixed(2)}
                        </ThemedText>
                    </View>
                ))}
            </ScrollView>
        </ThemedView>
    );
}
