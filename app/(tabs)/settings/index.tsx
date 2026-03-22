import { Alert, Modal, ScrollView, TouchableOpacity, View } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedView } from '@/components/ui/themed-view';
import { ThemedText } from '@/components/ui/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuthStore } from '@/store/authStore';
import { useSettingsStore, CURRENCIES, CurrencyOption } from '@/store/settingsStore';
import { useThemeStore } from '@/store/themeStore';
import { authApi } from '@/api/endpoints/auth';
import { getFloatingTabContentPaddingBottom } from '@/constants/layout';
import { useState } from 'react';
import { Colors, zinc, brand, semantic } from '@/constants/theme';

function SettingsRow({
  icon,
  label,
  value,
  onPress,
  isLast = false,
  danger = false,
}: {
  icon: string;
  label: string;
  value?: string;
  onPress?: () => void;
  isLast?: boolean;
  danger?: boolean;
}) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const iconColor = danger
    ? semantic.danger.light
    : isDark ? zinc[400] : zinc[500];
  const labelColor = danger ? semantic.danger.light : undefined;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={!onPress}
      className={`flex-row items-center justify-between px-5 py-4 ${!isLast ? 'border-b border-zinc-200 dark:border-zinc-800' : ''}`}
    >
      <View className="flex-row items-center gap-3">
        <IconSymbol name={icon as any} size={18} color={iconColor} />
        <ThemedText className="text-sm" style={labelColor ? { color: labelColor } : undefined}>
          {label}
        </ThemedText>
      </View>
      <View className="flex-row items-center gap-2">
        {value ? <ThemedText className="text-sm text-zinc-500">{value}</ThemedText> : null}
        {onPress ? (
          <IconSymbol
            name="chevron.right"
            size={16}
            color={danger ? semantic.danger.light : isDark ? zinc[600] : zinc[400]}
          />
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const router = useRouter();
  const queryClient = useQueryClient();
  const contentPaddingBottom = getFloatingTabContentPaddingBottom(insets.bottom);

  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);
  const currency = useSettingsStore((s) => s.currency);
  const setCurrency = useSettingsStore((s) => s.setCurrency);
  const themePreference = useThemeStore((s) => s.preference);

  const themeLabel = themePreference === 'system' ? 'System' : themePreference === 'light' ? 'Light' : 'Dark';

  const [currencySheetVisible, setCurrencySheetVisible] = useState(false);

  const fullName =
    (user as any)?.displayName ||
    [user?.firstName, user?.lastName].filter(Boolean).join(' ') ||
    'Budget User';
  const initials = fullName.slice(0, 2).toUpperCase();
  const avatarUrl = (user as any)?.avatarUrl as string | null | undefined;

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
            // Continue local sign-out even if server request fails.
          }
          await signOut();
          queryClient.clear();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  return (
    <ThemedView className="flex-1" style={{ paddingTop: insets.top }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: contentPaddingBottom }}
      >
        {/* Header */}
        <View className="px-4 pt-4 pb-2">
          <ThemedText type="title">Settings</ThemedText>
        </View>

        {/* Profile card */}
        <View className="px-4 pt-2 pb-3">
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.push('/profile')}
            className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 p-5"
          >
            <View className="flex-row items-center gap-4">
              <View
                className="w-14 h-14 rounded-2xl overflow-hidden items-center justify-center"
                style={{ backgroundColor: isDark ? brand[800] : brand[100] }}
              >
                {avatarUrl ? (
                  <Image source={{ uri: avatarUrl }} style={{ width: 56, height: 56 }} contentFit="cover" />
                ) : (
                  <ThemedText
                    className="text-xl font-bold"
                    style={{ color: isDark ? brand[200] : brand[700] }}
                  >
                    {initials}
                  </ThemedText>
                )}
              </View>
              <View className="flex-1">
                <ThemedText type="defaultSemiBold" className="text-lg">
                  {fullName || 'Budget User'}
                </ThemedText>
                <ThemedText className="text-sm text-zinc-500">{user?.email ?? ''}</ThemedText>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Social */}
        <View className="px-4 pb-3">
          <ThemedText className="text-xs tracking-widest text-zinc-400 mb-2 px-1">SOCIAL</ThemedText>
          <View className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 overflow-hidden">
            <SettingsRow
              icon="person.2.fill"
              label="Find People"
              onPress={() => router.push('/find-people')}
            />
            <SettingsRow
              icon="person.badge.plus"
              label="Connections"
              onPress={() => router.push('/settings/followers')}
            />
            <SettingsRow
              icon="tray.fill"
              label="Shared Items"
              onPress={() => router.push('/shared-inbox')}
              isLast
            />
          </View>
        </View>

        {/* Preferences */}
        <View className="px-4 pb-3">
          <ThemedText className="text-xs tracking-widest text-zinc-400 mb-2 px-1">
            PREFERENCES
          </ThemedText>
          <View className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 overflow-hidden">
            <SettingsRow
              icon="circle.lefthalf.filled"
              label="Theme"
              value={themeLabel}
              onPress={() => router.push('/settings/theme')}
            />
            <SettingsRow
              icon="banknote.fill"
              label="Currency"
              value={`${currency.symbol} · ${currency.code}`}
              onPress={() => setCurrencySheetVisible(true)}
              isLast
            />
          </View>
        </View>

        {/* Data */}
        <View className="px-4 pb-3">
          <ThemedText className="text-xs tracking-widest text-zinc-400 mb-2 px-1">DATA</ThemedText>
          <View className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 overflow-hidden">
            <SettingsRow
              icon="tag.fill"
              label="Categories"
              onPress={() => router.push('/settings/categories')}
            />
            <SettingsRow
              icon="chart.bar.fill"
              label="Budgets"
              onPress={() => router.push('/(tabs)/budget')}
              isLast
            />
          </View>
        </View>

        {/* About */}
        <View className="px-4 pb-3">
          <ThemedText className="text-xs tracking-widest text-zinc-400 mb-2 px-1">ABOUT</ThemedText>
          <View className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 overflow-hidden">
            <SettingsRow
              icon="info.circle.fill"
              label="App Version"
              value="1.0.0"
              isLast
            />
          </View>
        </View>

        {/* Account */}
        <View className="px-4 pb-2">
          <ThemedText className="text-xs tracking-widest text-zinc-400 mb-2 px-1">ACCOUNT</ThemedText>
          <View className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 overflow-hidden">
            <SettingsRow
              icon="rectangle.portrait.and.arrow.right"
              label="Log Out"
              onPress={handleLogout}
              isLast
              danger
            />
          </View>
        </View>
      </ScrollView>

      {/* Currency picker sheet */}
      <Modal
        visible={currencySheetVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setCurrencySheetVisible(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.45)' }}
          onPress={() => setCurrencySheetVisible(false)}
        >
          <TouchableOpacity
            activeOpacity={1}
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              backgroundColor: isDark ? Colors.dark.background : Colors.light.background,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              paddingBottom: Math.max(insets.bottom, 16) + 8,
            }}
          >
            <View
              style={{
                width: 36,
                height: 4,
                borderRadius: 2,
                backgroundColor: isDark ? zinc[600] : zinc[300],
                alignSelf: 'center',
                marginTop: 12,
                marginBottom: 20,
              }}
            />

            <View className="flex-row justify-between items-center px-6 mb-4">
              <ThemedText type="defaultSemiBold" style={{ fontSize: 18 }}>
                Currency
              </ThemedText>
              <TouchableOpacity onPress={() => setCurrencySheetVisible(false)}>
                <IconSymbol
                  name="xmark.circle.fill"
                  size={28}
                  color={isDark ? zinc[500] : zinc[400]}
                />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {CURRENCIES.map((c: CurrencyOption) => {
                const selected = c.code === currency.code;
                return (
                  <TouchableOpacity
                    key={c.code}
                    onPress={() => {
                      setCurrency(c);
                      setCurrencySheetVisible(false);
                    }}
                    className="flex-row items-center justify-between px-6 py-4 border-b border-zinc-100 dark:border-zinc-800"
                  >
                    <View className="flex-row items-center gap-4">
                      <View
                        className="w-10 h-10 rounded-2xl items-center justify-center"
                        style={{ backgroundColor: isDark ? zinc[800] : zinc[100] }}
                      >
                        <ThemedText className="font-semibold text-sm">{c.symbol}</ThemedText>
                      </View>
                      <View>
                        <ThemedText type="defaultSemiBold" className="text-sm">
                          {c.code}
                        </ThemedText>
                        <ThemedText className="text-xs text-zinc-500">{c.label}</ThemedText>
                      </View>
                    </View>
                    {selected ? (
                      <IconSymbol
                        name="checkmark.circle.fill"
                        size={22}
                        color={isDark ? brand[400] : brand[500]}
                      />
                    ) : null}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </ThemedView>
  );
}
