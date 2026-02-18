import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedView } from '@/components/ui/themed-view';
import { ThemedText } from '@/components/ui/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useCategories } from '@/hooks/useCategories';
import { useConfirmReceipt, useProcessReceipt, useReceipt } from '@/hooks/useReceipts';

type EditableItem = {
  id: string;
  name: string;
  quantity: string;
  price: string;
  totalPrice: string;
};

const parseNumber = (value: string) => Number.parseFloat(value.replace(',', '.'));

export default function ReceiptReviewScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const params = useLocalSearchParams<{ receiptId?: string; localImageUri?: string; id?: string }>();
  const receiptId = String(params.receiptId ?? params.id ?? '');
  const localImageUri = typeof params.localImageUri === 'string' ? params.localImageUri : undefined;

  const { data: receipt, isLoading, refetch } = useReceipt(receiptId);
  const { data: categories = [] } = useCategories();
  const processReceipt = useProcessReceipt();
  const confirmReceipt = useConfirmReceipt();

  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [items, setItems] = useState<EditableItem[]>([]);
  const [isImageModalVisible, setIsImageModalVisible] = useState(false);

  const expenseCategories = useMemo(
    () => categories.filter((category) => category.type === 'expense'),
    [categories]
  );

  useEffect(() => {
    if (!selectedCategoryId && expenseCategories.length > 0) {
      setSelectedCategoryId(expenseCategories[0].id);
    }
  }, [expenseCategories, selectedCategoryId]);

  useEffect(() => {
    if (!receipt?.items) return;
    setItems(
      receipt.items.map((item) => ({
        id: item.id,
        name: item.name,
        quantity: String(item.quantity),
        price: String(item.price),
        totalPrice: String(item.totalPrice),
      }))
    );
  }, [receipt]);

  const updateItem = (id: string, key: keyof EditableItem, value: string) => {
    setItems((current) =>
      current.map((item) => (item.id === id ? { ...item, [key]: value } : item))
    );
  };

  const handleProcess = async () => {
    if (!receiptId) return;
    try {
      await processReceipt.mutateAsync(receiptId);
      await refetch();
    } catch {
      Alert.alert('OCR failed', 'Could not process this receipt. Try again.');
    }
  };

  const handleConfirm = async () => {
    if (!receiptId) return;
    if (!selectedCategoryId) {
      Alert.alert('Category required', 'Select a category before confirming.');
      return;
    }

    const parsedItems = items.map((item) => ({
      id: item.id,
      name: item.name.trim(),
      quantity: parseNumber(item.quantity),
      price: parseNumber(item.price),
      totalPrice: parseNumber(item.totalPrice),
    }));

    const invalidItem = parsedItems.find(
      (item) =>
        !item.name ||
        Number.isNaN(item.quantity) ||
        Number.isNaN(item.price) ||
        Number.isNaN(item.totalPrice) ||
        item.quantity <= 0 ||
        item.price <= 0 ||
        item.totalPrice <= 0
    );

    if (invalidItem) {
      Alert.alert('Invalid item values', 'Each receipt item must have valid positive numbers.');
      return;
    }

    try {
      const result = await confirmReceipt.mutateAsync({
        id: receiptId,
        data: {
          categoryId: selectedCategoryId,
          items: parsedItems,
        },
      });

      Alert.alert('Saved', `${result.transactionsCreated} transactions created.`, [
        {
          text: 'OK',
          onPress: () => router.replace('/(tabs)/transactions'),
        },
      ]);
    } catch {
      Alert.alert('Confirm failed', 'Could not confirm this receipt.');
    }
  };

  const canConfirm = receipt?.status === 'processed' && items.length > 0 && !!selectedCategoryId;
  const previewImageUri = localImageUri || receipt?.imageUrl || null;

  if (!receiptId) {
    return (
      <ThemedView className="flex-1 items-center justify-center px-6">
        <ThemedText className="text-center text-zinc-500">Missing receipt id.</ThemedText>
      </ThemedView>
    );
  }

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
          <ThemedText type="subtitle">Review Receipt</ThemedText>
        </View>

        <TouchableOpacity
          disabled={!canConfirm || confirmReceipt.isPending}
          onPress={handleConfirm}
          className="w-10 h-10 rounded-full items-center justify-center"
          style={{
            backgroundColor: canConfirm ? (isDark ? '#ffffff' : '#111111') : isDark ? '#3f3f46' : '#d4d4d8',
          }}>
          <IconSymbol
            name="checkmark"
            size={20}
            color={canConfirm ? (isDark ? '#111111' : '#ffffff') : isDark ? '#71717a' : '#a1a1aa'}
          />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator />
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          className="flex-1"
          contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 14, paddingBottom: insets.bottom + 24 }}>
          <View className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 p-4 mb-3">
            <View className="flex-row items-center justify-between mb-3">
              <ThemedText type="defaultSemiBold">Status</ThemedText>
              <View className="px-3 py-1 rounded-full border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800">
                <ThemedText className="text-xs capitalize text-zinc-500">{receipt?.status ?? 'pending'}</ThemedText>
              </View>
            </View>

            <TouchableOpacity
              activeOpacity={0.9}
              disabled={!previewImageUri}
              onPress={() => setIsImageModalVisible(true)}
              className="h-44 rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 items-center justify-center">
              {previewImageUri ? (
                <Image source={{ uri: previewImageUri }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
              ) : (
                <IconSymbol name="doc.text.fill" size={28} color={isDark ? '#71717a' : '#a1a1aa'} />
              )}
            </TouchableOpacity>

            {receipt?.status !== 'processed' && receipt?.status !== 'confirmed' ? (
              <TouchableOpacity
                onPress={handleProcess}
                disabled={processReceipt.isPending}
                className="mt-3 h-11 rounded-xl border border-zinc-300 dark:border-zinc-700 items-center justify-center flex-row gap-2">
                {processReceipt.isPending ? (
                  <ActivityIndicator />
                ) : (
                  <IconSymbol name="arrow.clockwise" size={18} color={isDark ? '#d4d4d8' : '#3f3f46'} />
                )}
                <ThemedText className="font-semibold">
                  {processReceipt.isPending ? 'Processing OCR...' : 'Run OCR'}
                </ThemedText>
              </TouchableOpacity>
            ) : null}
          </View>

          <View className="rounded-3xl border border-zinc-200 dark:border-zinc-800 p-4 mb-3">
            <ThemedText type="defaultSemiBold" className="mb-3">
              Category
            </ThemedText>
            {expenseCategories.length === 0 ? (
              <ThemedText className="text-zinc-500 text-sm">Create an expense category first.</ThemedText>
            ) : (
              <View className="flex-row flex-wrap gap-2">
                {expenseCategories.map((category) => {
                  const selected = selectedCategoryId === category.id;
                  return (
                    <TouchableOpacity
                      key={category.id}
                      onPress={() => setSelectedCategoryId(category.id)}
                      className="px-3 py-2 rounded-full border flex-row items-center gap-2"
                      style={{
                        borderColor: selected ? (isDark ? '#f4f4f5' : '#111111') : isDark ? '#3f3f46' : '#d4d4d8',
                        backgroundColor: selected ? (isDark ? '#ffffff' : '#111111') : 'transparent',
                      }}>
                      <View
                        className="w-2 h-2 rounded-full"
                        style={{
                          backgroundColor: selected
                            ? isDark
                              ? '#111111'
                              : '#ffffff'
                            : category.color || (isDark ? '#71717a' : '#a1a1aa'),
                        }}
                      />
                      <ThemedText
                        className="text-sm"
                        style={{
                          color: selected ? (isDark ? '#111111' : '#ffffff') : isDark ? '#d4d4d8' : '#3f3f46',
                        }}>
                        {category.name}
                      </ThemedText>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>

          <View className="rounded-3xl border border-zinc-200 dark:border-zinc-800 p-4">
            <ThemedText type="defaultSemiBold" className="mb-3">
              Items
            </ThemedText>

            {items.length === 0 ? (
              <ThemedText className="text-zinc-500 text-sm">No OCR items found yet.</ThemedText>
            ) : (
              <View className="gap-3">
                {items.map((item) => (
                  <View key={item.id} className="rounded-2xl bg-zinc-100 dark:bg-zinc-800 p-3">
                    <TextInput
                      value={item.name}
                      onChangeText={(value) => updateItem(item.id, 'name', value)}
                      className="text-[16px] font-semibold text-zinc-900 dark:text-zinc-100 mb-2"
                      placeholder="Item name"
                      placeholderTextColor={isDark ? '#71717a' : '#a1a1aa'}
                    />
                    <View className="flex-row gap-2">
                      <View className="flex-1">
                        <ThemedText className="text-xs text-zinc-500 mb-1">Qty</ThemedText>
                        <TextInput
                          value={item.quantity}
                          keyboardType="decimal-pad"
                          onChangeText={(value) => updateItem(item.id, 'quantity', value)}
                          className="h-10 rounded-xl px-3 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
                        />
                      </View>
                      <View className="flex-1">
                        <ThemedText className="text-xs text-zinc-500 mb-1">Price</ThemedText>
                        <TextInput
                          value={item.price}
                          keyboardType="decimal-pad"
                          onChangeText={(value) => updateItem(item.id, 'price', value)}
                          className="h-10 rounded-xl px-3 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
                        />
                      </View>
                      <View className="flex-1">
                        <ThemedText className="text-xs text-zinc-500 mb-1">Total</ThemedText>
                        <TextInput
                          value={item.totalPrice}
                          keyboardType="decimal-pad"
                          onChangeText={(value) => updateItem(item.id, 'totalPrice', value)}
                          className="h-10 rounded-xl px-3 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
                        />
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        </ScrollView>
      )}

      <Modal
        visible={isImageModalVisible}
        animationType="fade"
        transparent
        onRequestClose={() => setIsImageModalVisible(false)}>
        <View className="flex-1 bg-black/95" style={{ paddingTop: insets.top + 8, paddingBottom: insets.bottom + 8 }}>
          <View className="px-4 flex-row justify-end">
            <TouchableOpacity
              onPress={() => setIsImageModalVisible(false)}
              className="w-10 h-10 rounded-full border border-zinc-700 items-center justify-center bg-black/50">
              <IconSymbol name="xmark" size={18} color="#f4f4f5" />
            </TouchableOpacity>
          </View>

          <View className="flex-1 items-center justify-center px-4">
            {previewImageUri ? (
              <Image
                source={{ uri: previewImageUri }}
                style={{ width: '100%', height: '100%' }}
                contentFit="contain"
              />
            ) : null}
          </View>
        </View>
      </Modal>
    </ThemedView>
  );
}
