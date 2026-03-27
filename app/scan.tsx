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
import { Colors, zinc, brand } from '@/constants/theme';
import { TourTarget } from '@/context/TourContext';
import { ScanTour } from '@/components/ScanTour';

type PickSource = 'camera' | 'library';

const extToMime: Record<string, string> = {
  jpg: 'image/jpeg', jpeg: 'image/jpeg',
  png: 'image/png', webp: 'image/webp', heic: 'image/heic',
};

const getMimeType = (uri: string, fallback?: string | null) => {
  if (fallback) return fallback;
  const ext = uri.split('.').pop()?.toLowerCase();
  return ext ? extToMime[ext] ?? 'image/jpeg' : 'image/jpeg';
};

const SOURCES = [
  { source: 'camera' as const, icon: 'camera.fill' as const, label: 'Camera' },
  { source: 'library' as const, icon: 'photo.fill' as const, label: 'Gallery' },
];

export default function ScanScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const cs = colorScheme ?? 'light';

  const uploadReceipt = useUploadReceipt();
  const processReceipt = useProcessReceipt();

  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const [busyMessage, setBusyMessage] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  const isBusy = uploadReceipt.isPending || processReceipt.isPending;

  const rescan = () => {
    setPreviewUri(null);
    setFailed(false);
    setBusyMessage(null);
    uploadReceipt.reset();
    processReceipt.reset();
  };

  const pickImage = async (source: PickSource) => {
    rescan();
    try {
      if (source === 'camera') {
        const perm = await ImagePicker.requestCameraPermissionsAsync();
        if (!perm.granted) {
          Alert.alert('Camera permission needed', 'Allow camera access to scan receipts.');
          return;
        }
      } else {
        const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!perm.granted) {
          Alert.alert('Library permission needed', 'Allow photo library access to upload receipts.');
          return;
        }
      }

      const result =
        source === 'camera'
          ? await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.9 })
          : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.9 });

      if (result.canceled || !result.assets.length) return;

      const asset = result.assets[0];
      setPreviewUri(asset.uri);

      setBusyMessage('Uploading receipt…');
      let receipt;
      try {
        receipt = await uploadReceipt.mutateAsync({
          imageUri: asset.uri,
          fileName: asset.fileName ?? `receipt-${Date.now()}.jpg`,
          mimeType: getMimeType(asset.uri, asset.mimeType),
        });
      } catch {
        setFailed(true);
        Alert.alert('Upload failed', 'Could not upload this receipt image. Tap Re-scan to try again.');
        return;
      }

      setBusyMessage('Running OCR…');
      try {
        await processReceipt.mutateAsync(receipt.id);
      } catch {
        setFailed(true);
        Alert.alert(
          'OCR failed',
          'The receipt was uploaded but OCR could not run. You can review it manually or re-scan.',
          [
            {
              text: 'Review anyway',
              onPress: () => router.push({ pathname: '/receipt-review', params: { receiptId: receipt!.id, localImageUri: asset.uri } }),
            },
            { text: 'Re-scan', onPress: rescan },
          ],
        );
        return;
      }

      router.push({ pathname: '/receipt-review', params: { receiptId: receipt.id, localImageUri: asset.uri } });
    } finally {
      setBusyMessage(null);
    }
  };

  const card = {
    backgroundColor: isDark ? zinc[800] : zinc[100],
    borderRadius: 20,
    borderWidth: 1,
    borderColor: isDark ? zinc[700] : zinc[200],
  } as const;

  return (
    <ThemedView className="flex-1" style={{ paddingTop: Platform.OS === 'ios' ? 8 : insets.top }}>

      {/* ── Header ────────────────────────────────────────────── */}
      <View
        className="px-4 py-3 flex-row items-center justify-between"
        style={{ borderBottomWidth: 1, borderBottomColor: isDark ? zinc[800] : zinc[200] }}
      >
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

        <View className="items-center">
          <ThemedText className="text-[10px] tracking-widest text-zinc-400 font-semibold">RECEIPTS</ThemedText>
          <ThemedText className="text-base font-bold">Scan</ThemedText>
        </View>

        <View style={{ width: 38 }} />
      </View>

      {/* ── Body ──────────────────────────────────────────────── */}
      <View
        className="flex-1 px-4 pt-4"
        style={{ paddingBottom: Math.max(insets.bottom + 16, 24) }}
      >
        {/* Pick source buttons */}
        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 12 }}>
          {SOURCES.map(({ source, icon, label }) => (
            <TourTarget key={source} id={`scan-${source}`} style={{ flex: 1 }}>
              <TouchableOpacity
                activeOpacity={0.7}
                disabled={isBusy}
                onPress={() => pickImage(source)}
                style={{
                  ...card,
                  paddingVertical: 22,
                  alignItems: 'center',
                  gap: 10,
                  opacity: isBusy ? 0.5 : 1,
                }}
              >
                <View
                  style={{
                    width: 48, height: 48, borderRadius: 16,
                    alignItems: 'center', justifyContent: 'center',
                    backgroundColor: isDark ? brand[900] : brand[100],
                  }}
                >
                  <IconSymbol name={icon} size={22} color={isDark ? brand[400] : brand[500]} />
                </View>
                <ThemedText className="text-sm font-semibold">{label}</ThemedText>
              </TouchableOpacity>
            </TourTarget>
          ))}
        </View>

        {/* Preview card */}
        <View style={{ ...card, flex: 1, padding: 16 }}>
          <ThemedText className="text-xs font-bold text-zinc-400 tracking-widest mb-3">
            PREVIEW
          </ThemedText>

          <View
            style={{
              flex: 1, borderRadius: 14, overflow: 'hidden',
              backgroundColor: isDark ? zinc[700] : zinc[200],
              alignItems: 'center', justifyContent: 'center',
            }}
          >
            {previewUri ? (
              <Image
                source={{ uri: previewUri }}
                style={{ width: '100%', height: '100%' }}
                contentFit="cover"
              />
            ) : (
              <View className="items-center" style={{ gap: 8 }}>
                <IconSymbol name="doc.text.fill" size={32} color={isDark ? zinc[600] : zinc[400]} />
                <ThemedText className="text-sm text-zinc-400">No image selected</ThemedText>
              </View>
            )}
          </View>

          {/* Busy */}
          {busyMessage && (
            <View className="mt-3 flex-row items-center gap-2">
              <ActivityIndicator />
              <ThemedText className="text-sm text-zinc-500">{busyMessage}</ThemedText>
            </View>
          )}

          {/* Failed — re-scan */}
          {failed && !isBusy && (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={rescan}
              style={{
                marginTop: 12, height: 44, borderRadius: 14,
                borderWidth: 1, borderColor: isDark ? zinc[700] : zinc[200],
                alignItems: 'center', justifyContent: 'center',
                flexDirection: 'row', gap: 8,
              }}
            >
              <IconSymbol name="arrow.clockwise" size={16} color={Colors[cs].icon} />
              <ThemedText className="text-sm font-semibold">Re-scan</ThemedText>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScanTour />
    </ThemedView>
  );
}
