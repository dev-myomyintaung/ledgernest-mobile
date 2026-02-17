import { View } from 'react-native';
import { Link } from 'expo-router';
import { ThemedText } from '@/components/ui/themed-text';
import { ThemedView } from '@/components/ui/themed-view';

export default function DashboardScreen() {
  return (
    <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <View className="bg-primary p-4 rounded-lg mb-4">
        <ThemedText type="title" style={{ color: 'white' }}>My Budget</ThemedText>
      </View>
      <ThemedText>Welcome to your financial dashboard.</ThemedText>
      <ThemedText className="mt-4 text-secondary">Start by adding a transaction.</ThemedText>

      <Link href="/(auth)/login" asChild>
        <ThemedText type="link" className="mt-8 text-blue-500">Go to Login (Auth Demo)</ThemedText>
      </Link>
    </ThemedView>
  );
}
