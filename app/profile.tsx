import { ActionSheetIOS, ActivityIndicator, Alert, Platform, TextInput, TouchableOpacity, View } from 'react-native';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ThemedView } from '@/components/ui/themed-view';
import { ThemedText } from '@/components/ui/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuthStore } from '@/store/authStore';
import { useFollowers, useFollowing, useUpdateProfile, useUploadAvatar, useDeleteAvatar } from '@/hooks/useUsers';
import { Colors, zinc, brand, Typography } from '@/constants/theme';
import { useState } from 'react';

const profileSchema = z.object({
  displayName: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be 50 characters or less')
    .transform((v) => v.trim()),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const cs = colorScheme ?? 'light';

  const user = useAuthStore((s) => s.user);
  const { data: followers = [], isLoading: followersLoading } = useFollowers();
  const { data: following = [], isLoading: followingLoading } = useFollowing();
  const updateProfile = useUpdateProfile();

  const [isEditing, setIsEditing] = useState(false);
  const uploadAvatar = useUploadAvatar();
  const deleteAvatar = useDeleteAvatar();

  const avatarUrl = (user as any)?.avatarUrl as string | null | undefined;

  const pickImage = async (source: 'library' | 'camera') => {
    const fn = source === 'library' ? ImagePicker.launchImageLibraryAsync : ImagePicker.launchCameraAsync;
    const result = await fn({ mediaTypes: 'images', allowsEditing: true, aspect: [1, 1], quality: 0.8 });
    if (result.canceled) return;
    const uri = result.assets[0].uri;
    try {
      const { avatarUrl: newUrl } = await uploadAvatar.mutateAsync(uri);
      useAuthStore.setState((s) => ({ user: s.user ? { ...s.user, avatarUrl: newUrl } as any : s.user }));
    } catch {
      Alert.alert('Error', 'Could not upload avatar. Try again.');
    }
  };

  const handleAvatarPress = () => {
    const options = avatarUrl
      ? ['Choose from Library', 'Take Photo', 'Remove Photo', 'Cancel']
      : ['Choose from Library', 'Take Photo', 'Cancel'];
    const destructiveIndex = avatarUrl ? 2 : -1;
    const cancelIndex = avatarUrl ? 3 : 2;

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        { options, cancelButtonIndex: cancelIndex, destructiveButtonIndex: destructiveIndex },
        async (idx) => {
          if (idx === 0) await pickImage('library');
          else if (idx === 1) await pickImage('camera');
          else if (idx === 2 && avatarUrl) {
            try {
              await deleteAvatar.mutateAsync();
              useAuthStore.setState((s) => ({ user: s.user ? { ...s.user, avatarUrl: null } as any : s.user }));
            } catch {
              Alert.alert('Error', 'Could not remove avatar.');
            }
          }
        },
      );
    } else {
      Alert.alert('Profile Photo', undefined, [
        { text: 'Choose from Library', onPress: () => pickImage('library') },
        { text: 'Take Photo', onPress: () => pickImage('camera') },
        ...(avatarUrl ? [{
          text: 'Remove Photo', style: 'destructive' as const, onPress: async () => {
            try {
              await deleteAvatar.mutateAsync();
              useAuthStore.setState((s) => ({ user: s.user ? { ...s.user, avatarUrl: null } as any : s.user }));
            } catch {
              Alert.alert('Error', 'Could not remove avatar.');
            }
          },
        }] : []),
        { text: 'Cancel', style: 'cancel' },
      ]);
    }
  };

  const displayName =
    (user as any)?.displayName ||
    [user?.firstName, user?.lastName].filter(Boolean).join(' ') ||
    'Budget User';
  const initials = displayName.slice(0, 2).toUpperCase();
  const statsLoading = followersLoading || followingLoading;

  const { control, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: { displayName },
  });

  const onSubmit = async (data: ProfileFormData) => {
    try {
      await updateProfile.mutateAsync({ displayName: data.displayName });
      useAuthStore.setState((s) => ({
        user: s.user ? { ...s.user, displayName: data.displayName } as any : s.user,
      }));
      setIsEditing(false);
    } catch {
      Alert.alert('Error', 'Could not update profile. Try again.');
    }
  };

  const handleCancel = () => {
    reset({ displayName });
    setIsEditing(false);
  };

  const card = {
    backgroundColor: isDark ? zinc[800] : zinc[100],
    borderWidth: 1,
    borderColor: isDark ? zinc[700] : zinc[200],
    borderRadius: 20,
  } as const;

  const inputStyle = {
    backgroundColor: isDark ? zinc[900] : '#fff',
    borderWidth: 1,
    borderColor: errors.displayName ? '#BE3A50' : isDark ? zinc[700] : zinc[200],
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 11,
    color: isDark ? zinc[50] : zinc[900],
    fontSize: Typography.size.sm,
  } as const;

  return (
    <ThemedView className="flex-1" style={{ paddingTop: Platform.OS === 'android' ? insets.top : 0 }}>

      {/* ── Header ──────────────────────────────────────────────── */}
      <View
        className="px-4 py-3 flex-row items-center justify-between"
        style={{ borderBottomWidth: 1, borderBottomColor: isDark ? zinc[800] : zinc[200] }}
      >
        {isEditing ? (
          <TouchableOpacity activeOpacity={0.7} onPress={handleCancel}>
            <ThemedText className="text-sm font-medium text-zinc-500">Cancel</ThemedText>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.back()}
            style={{
              width: 38, height: 38, borderRadius: 19,
              alignItems: 'center', justifyContent: 'center',
              backgroundColor: isDark ? zinc[800] : zinc[100],
              borderWidth: 1, borderColor: isDark ? zinc[700] : zinc[200],
            }}
          >
            <IconSymbol name="xmark" size={15} color={Colors[cs].icon} />
          </TouchableOpacity>
        )}

        <View className="items-center">
          <ThemedText className="text-[10px] tracking-widest text-zinc-400 font-semibold">ACCOUNT</ThemedText>
          <ThemedText className="text-base font-bold">Profile</ThemedText>
        </View>

        {isEditing ? (
          <TouchableOpacity activeOpacity={0.7} onPress={handleSubmit(onSubmit)} disabled={isSubmitting}>
            {isSubmitting ? (
              <ActivityIndicator size="small" color={isDark ? brand[400] : brand[500]} />
            ) : (
              <ThemedText
                className="text-sm font-semibold"
                style={{ color: isDark ? brand[400] : brand[500] }}
              >
                Save
              </ThemedText>
            )}
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setIsEditing(true)}
            style={{
              width: 38, height: 38, borderRadius: 19,
              alignItems: 'center', justifyContent: 'center',
              backgroundColor: isDark ? zinc[800] : zinc[100],
              borderWidth: 1, borderColor: isDark ? zinc[700] : zinc[200],
            }}
          >
            <IconSymbol name="pencil" size={15} color={Colors[cs].icon} />
          </TouchableOpacity>
        )}
      </View>

      <View
        className="flex-1 px-4 pt-3"
        style={{ paddingBottom: Math.max(insets.bottom, 24) }}
      >

        {/* ── Avatar + name ────────────────────────────────────── */}
        <View className="items-center mb-6">
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleAvatarPress}
            disabled={uploadAvatar.isPending || deleteAvatar.isPending}
            style={{ marginBottom: 12 }}
          >
            <View style={{ width: 80, height: 80, borderRadius: 40, overflow: 'hidden' }}>
              {avatarUrl ? (
                <Image source={{ uri: avatarUrl }} style={{ width: 80, height: 80 }} contentFit="cover" />
              ) : (
                <View style={{
                  width: 80, height: 80, borderRadius: 40,
                  backgroundColor: isDark ? brand[800] : brand[100],
                  alignItems: 'center', justifyContent: 'center',
                }}>
                  <ThemedText style={{ fontSize: 28, fontWeight: '700', color: isDark ? brand[200] : brand[700] }}>
                    {initials}
                  </ThemedText>
                </View>
              )}
            </View>
            <View style={{
              position: 'absolute', bottom: 0, right: 0,
              width: 24, height: 24, borderRadius: 12,
              backgroundColor: isDark ? brand[400] : brand[500],
              alignItems: 'center', justifyContent: 'center',
              borderWidth: 2, borderColor: isDark ? zinc[900] : '#fff',
            }}>
              {uploadAvatar.isPending || deleteAvatar.isPending
                ? <ActivityIndicator size="small" color="#fff" />
                : <IconSymbol name="camera.fill" size={11} color="#fff" />
              }
            </View>
          </TouchableOpacity>

          {isEditing ? (
            <View style={{ width: '100%', gap: 4 }}>
              <ThemedText className="text-xs text-zinc-500 mb-1 px-1">Display Name</ThemedText>
              <Controller
                control={control}
                name="displayName"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={inputStyle}
                    placeholder="Your display name"
                    placeholderTextColor={isDark ? zinc[600] : zinc[400]}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    autoFocus
                    returnKeyType="done"
                    onSubmitEditing={handleSubmit(onSubmit)}
                  />
                )}
              />
              {errors.displayName ? (
                <ThemedText className="text-xs px-1" style={{ color: '#BE3A50' }}>
                  {errors.displayName.message}
                </ThemedText>
              ) : null}
            </View>
          ) : (
            <>
              <ThemedText className="text-xl font-bold">{displayName}</ThemedText>
              {user?.email ? (
                <ThemedText className="text-sm text-zinc-500 mt-0.5">{user.email}</ThemedText>
              ) : null}
            </>
          )}
        </View>

        {/* ── Follower / Following stats ────────────────────────── */}
        <View className="flex-row gap-3 mb-4">
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.push({ pathname: '/settings/followers', params: { tab: 'followers' } })}
            style={{ ...card, flex: 1, alignItems: 'center', paddingVertical: 16 }}
          >
            {statsLoading ? (
              <ActivityIndicator size="small" />
            ) : (
              <>
                <ThemedText className="text-2xl font-bold">{followers.length}</ThemedText>
                <ThemedText className="text-xs text-zinc-500 mt-0.5">Followers</ThemedText>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.push({ pathname: '/settings/followers', params: { tab: 'following' } })}
            style={{ ...card, flex: 1, alignItems: 'center', paddingVertical: 16 }}
          >
            {statsLoading ? (
              <ActivityIndicator size="small" />
            ) : (
              <>
                <ThemedText className="text-2xl font-bold">{following.length}</ThemedText>
                <ThemedText className="text-xs text-zinc-500 mt-0.5">Following</ThemedText>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* ── Social actions ────────────────────────────────────── */}
        <View style={{ ...card, overflow: 'hidden' }}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.push('/find-people')}
            style={{
              flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
              paddingHorizontal: 16, paddingVertical: 14,
              borderBottomWidth: 1, borderBottomColor: isDark ? zinc[700] : zinc[200],
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <IconSymbol name="person.badge.plus" size={18} color={isDark ? zinc[400] : zinc[500]} />
              <ThemedText className="text-sm font-medium">Find People</ThemedText>
            </View>
            <IconSymbol name="chevron.right" size={15} color={isDark ? zinc[600] : zinc[400]} />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.push('/settings/followers')}
            style={{
              flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
              paddingHorizontal: 16, paddingVertical: 14,
              borderBottomWidth: 1, borderBottomColor: isDark ? zinc[700] : zinc[200],
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <IconSymbol name="person.2.fill" size={18} color={isDark ? zinc[400] : zinc[500]} />
              <ThemedText className="text-sm font-medium">Connections</ThemedText>
            </View>
            <IconSymbol name="chevron.right" size={15} color={isDark ? zinc[600] : zinc[400]} />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.push('/shared-inbox')}
            style={{
              flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
              paddingHorizontal: 16, paddingVertical: 14,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <IconSymbol name="tray.fill" size={18} color={isDark ? zinc[400] : zinc[500]} />
              <ThemedText className="text-sm font-medium">Shared Items</ThemedText>
            </View>
            <IconSymbol name="chevron.right" size={15} color={isDark ? zinc[600] : zinc[400]} />
          </TouchableOpacity>
        </View>

      </View>
    </ThemedView>
  );
}
