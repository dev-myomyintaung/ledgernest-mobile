import { useState } from 'react';
import { Alert, ActivityIndicator, Platform, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedView } from '@/components/ui/themed-view';
import { ThemedText } from '@/components/ui/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useProcessReceipt, useUploadReceipt } from '@/hooks/useReceipts';

type PickSource = 'camera' | 'library';

const extToMime: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  heic: 'image/heic',
};

const getMimeType = (uri: string, fallback?: string | null) => {
  if (fallback) return fallback;
  const ext = uri.split('.').pop()?.toLowerCase();
  return ext ? extToMime[ext] ?? 'image/jpeg' : 'image/jpeg';
};

export default function ScanScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const uploadReceipt = useUploadReceipt();
  const processReceipt = useProcessReceipt();

  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const [busyMessage, setBusyMessage] = useState<string | null>(null);

  const isBusy = uploadReceipt.isPending || processReceipt.isPending;

  const pickImage = async (source: PickSource) => {
    try {
      if (source === 'camera') {
        const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
        if (!cameraPermission.granted) {
          Alert.alert('Camera permission needed', 'Allow camera access to scan receipts.');
          return;
        }
      } else {
        const libraryPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!libraryPermission.granted) {
          Alert.alert('Library permission needed', 'Allow photo library access to upload receipts.');
          return;
        }
      }

      const result =
        source === 'camera'
          ? await ImagePicker.launchCameraAsync({
              mediaTypes: ['images'],
              quality: 0.9,
            })
          : await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ['images'],
              quality: 0.9,
            });

      if (result.canceled || !result.assets.length) {
        return;
      }

      const asset = result.assets[0];
      setPreviewUri(asset.uri);

      setBusyMessage('Uploading receipt...');
      const receipt = await uploadReceipt.mutateAsync({
        imageUri: asset.uri,
        fileName: asset.fileName ?? `receipt-${Date.now()}.jpg`,
        mimeType: getMimeType(asset.uri, asset.mimeType),
      });

      setBusyMessage('Running OCR...');
      try {
        await processReceipt.mutateAsync(receipt.id);
      } catch {
        Alert.alert(
          'OCR not finished',
          'The receipt was uploaded. You can review it now and retry OCR from the review screen.'
        );
      }

      router.push({
        pathname: '/receipt-review',
        params: {
          receiptId: receipt.id,
          localImageUri: asset.uri,
        },
      });
    } catch {
      Alert.alert('Upload failed', 'Could not upload this receipt image.');
    } finally {
      setBusyMessage(null);
    }
  };

  return (
    <ThemedView className="flex-1" style={{ paddingTop: Platform.OS === 'ios' ? 8 : insets.top }}>
      <View className="px-6 py-3 border-b border-zinc-200 dark:border-zinc-800 flex-row items-center justify-between">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full items-center justify-center border border-zinc-200 dark:border-zinc-700">
          <IconSymbol name="xmark" size={18} color={isDark ? '#d4d4d8' : '#3f3f46'} />
        </TouchableOpacity>

        <View className="items-center">
          <ThemedText className="text-[11px] tracking-[2px] text-zinc-500">RECEIPTS</ThemedText>
          <ThemedText type="subtitle">Scan Receipt</ThemedText>
        </View>

        <View className="w-10" />
      </View>

      <View className="flex-1 px-6 pt-4 pb-6" style={{ paddingBottom: Math.max(insets.bottom, 16) }}>
        <View className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 p-5 mb-4">
          <View className="flex-row items-center gap-3 mb-3">
            <View className="w-11 h-11 rounded-2xl bg-black dark:bg-white items-center justify-center">
              <IconSymbol name="viewfinder" size={22} color={isDark ? '#111111' : '#ffffff'} />
            </View>
            <View className="flex-1">
              <ThemedText type="defaultSemiBold" className="text-[17px]">
                Upload a receipt image
              </ThemedText>
              <ThemedText className="text-zinc-500 text-sm">Take a photo or choose from gallery</ThemedText>
            </View>
          </View>

          <View className="flex-row gap-3">
            <TouchableOpacity
              disabled={isBusy}
              onPress={() => pickImage('camera')}
              className="flex-1 rounded-2xl border border-zinc-300 dark:border-zinc-700 p-4 items-center">
              <IconSymbol name="camera.fill" size={22} color={isDark ? '#f4f4f5' : '#111111'} />
              <ThemedText className="mt-2 font-semibold">Camera</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              disabled={isBusy}
              onPress={() => pickImage('library')}
              className="flex-1 rounded-2xl border border-zinc-300 dark:border-zinc-700 p-4 items-center">
              <IconSymbol name="photo.fill" size={22} color={isDark ? '#f4f4f5' : '#111111'} />
              <ThemedText className="mt-2 font-semibold">Gallery</ThemedText>
            </TouchableOpacity>
          </View>
        </View>

        <View className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 p-4 flex-1">
          <ThemedText type="defaultSemiBold" className="mb-3">
            Preview
          </ThemedText>

          <View className="flex-1 rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 items-center justify-center">
            {previewUri ? (
              <Image source={{ uri: previewUri }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
            ) : (
              <View className="items-center">
                <IconSymbol name="doc.text.fill" size={28} color={isDark ? '#71717a' : '#a1a1aa'} />
                <ThemedText className="text-zinc-500 mt-2">No image selected</ThemedText>
              </View>
            )}
          </View>

          {busyMessage ? (
            <View className="mt-3 flex-row items-center gap-2">
              <ActivityIndicator />
              <ThemedText className="text-zinc-500">{busyMessage}</ThemedText>
            </View>
          ) : null}
        </View>
      </View>
    </ThemedView>
  );
}
