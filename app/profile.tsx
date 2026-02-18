import { Alert, Platform, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedView } from '@/components/ui/themed-view';
import { ThemedText } from '@/components/ui/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuthStore } from '@/store/authStore';
import { authApi } from '@/api/endpoints/auth';

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const queryClient = useQueryClient();

  const user = useAuthStore((state) => state.user);
  const signOut = useAuthStore((state) => state.signOut);

  const handleLogout = () => {
    Alert.alert('Log out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log out',
        style: 'destructive',
        onPress: async () => {
          try {
            await authApi.logout();
          } catch {
            // Continue local sign-out even if server logout fails.
          }

          await signOut();
          queryClient.clear();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(' ');

  return (
    <ThemedView className="flex-1" style={{ paddingTop: Platform.OS === 'ios' ? 8 : insets.top }}>
      <View className="px-6 py-3 border-b border-zinc-200 dark:border-zinc-800 flex-row items-center justify-between">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full items-center justify-center border border-zinc-200 dark:border-zinc-700">
          <IconSymbol name="xmark" size={18} color={isDark ? '#d4d4d8' : '#3f3f46'} />
        </TouchableOpacity>

        <View className="items-center">
          <ThemedText className="text-[11px] tracking-[2px] text-zinc-500">ACCOUNT</ThemedText>
          <ThemedText type="subtitle">Profile</ThemedText>
        </View>

        <View className="w-10" />
      </View>

      <View className="flex-1 px-6 pt-4" style={{ paddingBottom: Math.max(insets.bottom, 16) }}>
        <View className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 p-5 mb-3">
          <View className="flex-row items-center gap-3">
            <View className="w-14 h-14 rounded-2xl bg-black dark:bg-white items-center justify-center">
              <IconSymbol name="person.circle.fill" size={26} color={isDark ? '#111111' : '#ffffff'} />
            </View>
            <View className="flex-1">
              <ThemedText type="defaultSemiBold" className="text-[18px]">
                {fullName || 'Budget User'}
              </ThemedText>
              <ThemedText className="text-zinc-500 text-sm">{user?.email ?? 'No email'}</ThemedText>
            </View>
          </View>
        </View>

        <TouchableOpacity
          onPress={handleLogout}
          className="h-12 rounded-2xl border border-red-300 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 px-4 flex-row items-center justify-center gap-2">
          <IconSymbol name="rectangle.portrait.and.arrow.right" size={19} color="#dc2626" />
          <ThemedText className="font-semibold text-red-600 dark:text-red-400">Log Out</ThemedText>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}
