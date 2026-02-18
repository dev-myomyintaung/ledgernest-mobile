import { View, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { ThemedText } from '@/components/ui/themed-text';
import { ThemedView } from '@/components/ui/themed-view';
import { BarChart } from 'react-native-gifted-charts';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getFloatingTabContentPaddingBottom } from '@/constants/layout';

// Mock data for Rounded Bar Chart (Black/Monochrome)
const barData = [
  { value: 300, label: '10th' },
  { value: 450, label: '11th' },
  { value: 900, label: '12th' },
  { value: 500, label: '13th' },
  { value: 480, label: '14th' },
  { value: 1100, label: '15th' },
  { value: 850, label: '16th' },
];

// Transactions keep lively accents
const recentTransactions = [
  { id: '1', title: 'Starbucks', subtitle: 'Food & Drinks', amount: -6.50, icon: 'cup.and.saucer.fill', color: 'bg-orange-100 dark:bg-orange-900/30', iconColor: '#ea580c' },
  { id: '2', title: 'Uber Ride', subtitle: 'Transport', amount: -24.00, icon: 'car.fill', color: 'bg-blue-100 dark:bg-blue-900/30', iconColor: '#2563eb' },
  { id: '3', title: 'Cinema', subtitle: 'Entertainment', amount: -35.00, icon: 'popcorn.fill', color: 'bg-purple-100 dark:bg-purple-900/30', iconColor: '#9333ea' },
];

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const screenWidth = Dimensions.get('window').width;

  // Layout calc
  const barWidth = 32; // Slightly wider for the "rounded block" look
  const paddingX = 48;
  const chartAvailableWidth = screenWidth - paddingX;
  const spacing = (chartAvailableWidth - (barData.length * barWidth)) / (barData.length - 1);
  const contentPaddingBottom = getFloatingTabContentPaddingBottom(insets.bottom);

  return (
    <ThemedView style={{ flex: 1, paddingTop: insets.top }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: contentPaddingBottom }}>

        {/* Top Section - Balance & Date */}
        <View className="px-6 pt-4 pb-0">
          {/* Practical Header: Date & Edit */}
          <View className="flex-row justify-between items-center mb-4">
            <View className="flex-row items-center gap-2">
              <ThemedText className="text-2xl font-bold">Jan 2025</ThemedText>
              <IconSymbol name="chevron.down" size={20} color={isDark ? "white" : "black"} />
            </View>
            <TouchableOpacity
              onPress={() => router.push('/profile')}
              className="w-9 h-9 rounded-full border border-zinc-200 dark:border-zinc-700 items-center justify-center"
            >
              <IconSymbol name="person.circle.fill" size={19} color={isDark ? "#d4d4d8" : "#3f3f46"} />
            </TouchableOpacity>
          </View>

          {/* Main Balance - Clean */}
          <View className="mb-6">
            <ThemedText className="text-gray-500 text-sm font-medium mb-1">Total Balance</ThemedText>
            <ThemedText className="text-5xl font-bold">$1,574.00</ThemedText>
          </View>
        </View>

        {/* Chart - Rounded Colored Bars */}
        <View className="mb-8 px-6">
          <BarChart
            data={barData.map(item => ({
              ...item,
              frontColor: isDark ? '#ffffff' : '#000000', // Black bars
              barBorderTopLeftRadius: 8,
              barBorderTopRightRadius: 8,
            }))}
            height={180}
            width={chartAvailableWidth}
            barWidth={barWidth}
            spacing={spacing}
            initialSpacing={0}
            yAxisThickness={0}
            xAxisThickness={0}
            hideYAxisText
            rulesType="solid"
            rulesColor={isDark ? '#3f3f46' : '#e4e4e7'} // Visible grid lines
            xAxisLabelTextStyle={{ color: isDark ? 'gray' : 'gray', fontSize: 11, fontWeight: '500' }}
            isAnimated
          />
        </View>

        {/* Transactions Section - Flat Look */}
        <View className="px-6 mb-8">
          <ThemedText className="text-gray-400 text-xs font-bold mb-2 tracking-widest">TRANSACTIONS</ThemedText>
          <View>
            {recentTransactions.map((tx, index) => (
              <View key={tx.id} className={`flex-row justify-between items-center py-4 ${index !== recentTransactions.length - 1 ? 'border-b border-zinc-100 dark:border-zinc-800' : ''}`}>
                <View className="flex-row items-center gap-3">
                  <View className={`w-10 h-10 ${tx.color} rounded-2xl items-center justify-center`}>
                    <IconSymbol name={tx.icon as any} size={18} color={tx.iconColor} />
                  </View>
                  <View>
                    <ThemedText type="defaultSemiBold" className="text-sm">{tx.title}</ThemedText>
                    <ThemedText className="text-xs text-gray-500">{tx.subtitle}</ThemedText>
                  </View>
                </View>
                <ThemedText type="defaultSemiBold" className="text-sm">
                  {tx.amount > 0 ? '+' : ''}${Math.abs(tx.amount)}
                </ThemedText>
              </View>
            ))}
            <Link href="/(tabs)/transactions" asChild>
              <TouchableOpacity className="py-4 border-t border-zinc-100 dark:border-zinc-800 mt-0">
                <ThemedText className="text-gray-400 text-xs font-bold">SEE ALL</ThemedText>
              </TouchableOpacity>
            </Link>
          </View>
        </View>

        {/* Budget Overview - Flat Look */}
        <View className="px-6 mb-6">
          <ThemedText className="text-gray-400 text-xs font-bold mb-4">BUDGET</ThemedText>

          <View className="mb-6 flex-row items-baseline gap-2">
            <ThemedText className="text-4xl font-bold">$540</ThemedText>
            <ThemedText className="text-sm text-gray-400">/ $1,240.52</ThemedText>
          </View>

          {/* Progress Bar */}
          <View className="h-1 bg-zinc-100 dark:bg-zinc-800 w-full mb-6">
            <View className="h-full bg-black dark:bg-white w-[45%]" />
          </View>

          {/* Mock Mini List */}
          <View className="gap-4">
            <View className="flex-row justify-between items-center">
              <View className="flex-row items-center gap-2">
                <View className="w-2 h-2 rounded-full bg-black dark:bg-white" />
                <ThemedText className="text-sm">Products</ThemedText>
              </View>
              <ThemedText className="text-sm font-bold">$112</ThemedText>
            </View>
            <View className="flex-row justify-between items-center">
              <View className="flex-row items-center gap-2">
                <View className="w-2 h-2 rounded-full bg-zinc-400" />
                <ThemedText className="text-sm">Transport</ThemedText>
              </View>
              <ThemedText className="text-sm font-bold">$20</ThemedText>
            </View>
            <View className="flex-row justify-between items-center">
              <View className="flex-row items-center gap-2">
                <View className="w-2 h-2 rounded-full bg-zinc-300 dark:bg-zinc-600" />
                <ThemedText className="text-sm">Other</ThemedText>
              </View>
              <ThemedText className="text-sm font-bold">$15</ThemedText>
            </View>
          </View>
        </View>

      </ScrollView>
    </ThemedView>
  );
}
