import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemedView } from "@/components/ui/themed-view";
import { ThemedText } from "@/components/ui/themed-text";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useCategories } from "@/hooks/useCategories";
import {
  useConfirmReceipt,
  useProcessReceipt,
  useReceipt,
} from "@/hooks/useReceipts";
import { SERVER_BASE_URL } from "@/api/client";
import { Colors, zinc, brand, semantic } from "@/constants/theme";
import { hexToRgba } from "@/utils/format";

type EditableItem = {
  id: string;
  name: string;
  quantity: string;
  price: string;
  totalPrice: string;
};

const parseNumber = (value: string) =>
  Number.parseFloat(value.replace(",", "."));

function statusColor(status: string | undefined, isDark: boolean) {
  switch (status) {
    case "processed":  return isDark ? semantic.success.dark : semantic.success.light;
    case "confirmed":  return isDark ? brand[400] : brand[500];
    case "pending":    return isDark ? semantic.warning.dark : semantic.warning.light;
    default:           return isDark ? zinc[400] : zinc[500];
  }
}

function statusBg(status: string | undefined, isDark: boolean) {
  switch (status) {
    case "processed":  return hexToRgba(isDark ? semantic.success.dark : semantic.success.light, 0.12);
    case "confirmed":  return hexToRgba(isDark ? brand[400] : brand[500], 0.12);
    case "pending":    return hexToRgba(isDark ? semantic.warning.dark : semantic.warning.light, 0.12);
    default:           return isDark ? zinc[800] : zinc[100];
  }
}

export default function ReceiptReviewScreen() {
  const router      = useRouter();
  const insets      = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark      = colorScheme === "dark";
  const cs          = colorScheme ?? "light";

  const params = useLocalSearchParams<{
    receiptId?: string;
    localImageUri?: string;
    id?: string;
  }>();
  const receiptId     = String(params.receiptId ?? params.id ?? "");
  const localImageUri = typeof params.localImageUri === "string" ? params.localImageUri : undefined;

  const { data: receipt, isLoading, refetch } = useReceipt(receiptId);
  const { data: categories = [] } = useCategories();
  const processReceipt = useProcessReceipt();
  const confirmReceipt = useConfirmReceipt();

  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [items, setItems]                           = useState<EditableItem[]>([]);
  const [isImageModalVisible, setIsImageModalVisible] = useState(false);

  const expenseCategories = useMemo(
    () => categories.filter((c) => c.type === "expense"),
    [categories],
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
        id:         item.id,
        name:       item.name,
        quantity:   String(parseFloat(item.quantity)),
        price:      String(item.price),
        totalPrice: String(item.totalPrice),
      })),
    );
  }, [receipt]);

  const updateItem = (id: string, key: keyof EditableItem, value: string) => {
    setItems((cur) => cur.map((item) => item.id === id ? { ...item, [key]: value } : item));
  };

  const handleProcess = async () => {
    if (!receiptId) return;
    try {
      await processReceipt.mutateAsync(receiptId);
      await refetch();
    } catch {
      Alert.alert("OCR failed", "Could not process this receipt. Try again.");
    }
  };

  const handleConfirm = async () => {
    if (!receiptId) return;
    if (!selectedCategoryId) {
      Alert.alert("Category required", "Select a category before confirming.");
      return;
    }
    const parsedItems = items.map((item) => ({
      id:         item.id,
      name:       item.name.trim(),
      quantity:   parseNumber(item.quantity),
      price:      parseNumber(item.price),
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
        item.totalPrice <= 0,
    );
    if (invalidItem) {
      Alert.alert("Invalid item values", "Each item must have valid positive numbers.");
      return;
    }
    try {
      const result = await confirmReceipt.mutateAsync({
        id:   receiptId,
        data: { categoryId: selectedCategoryId, items: parsedItems },
      });
      Alert.alert("Saved", `${result.transactionsCreated} transactions created.`, [
        { text: "OK", onPress: () => router.replace("/(tabs)/transactions") },
      ]);
    } catch {
      Alert.alert("Confirm failed", "Could not confirm this receipt.");
    }
  };

  const calculatedTotal = useMemo(
    () => items.reduce((sum, item) => sum + (parseFloat(item.totalPrice) || 0), 0),
    [items],
  );
  const scannedTotal = receipt ? parseFloat(receipt.totalAmount) : null;
  const totalsMatch  = scannedTotal == null || Math.abs(calculatedTotal - scannedTotal) < 0.01;

  const canConfirm    = receipt?.status === "processed" && items.length > 0 && !!selectedCategoryId;
  const previewImageUri = localImageUri ?? (receipt?.imageUrl ? `${SERVER_BASE_URL}/${receipt.imageUrl}` : null);

  // ── Shared card style ────────────────────────────────────────────────────
  const card = {
    backgroundColor: isDark ? zinc[800] : zinc[100],
    borderRadius:    20,
    borderWidth:     1,
    borderColor:     isDark ? zinc[700] : zinc[200],
  } as const;

  const inputBg = isDark ? zinc[900] : Colors[cs].background;

  if (!receiptId) {
    return (
      <ThemedView className="flex-1 items-center justify-center px-4">
        <ThemedText className="text-center text-zinc-500">Missing receipt id.</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView className="flex-1" style={{ paddingTop: Platform.OS === "ios" ? 8 : insets.top }}>

      {/* ── Header ────────────────────────────────────────────── */}
      <View
        className="px-4 py-3 flex-row items-center justify-between"
        style={{ borderBottomWidth: 1, borderBottomColor: isDark ? zinc[800] : zinc[200] }}
      >
        {/* Close */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.back()}
          style={{
            width: 38, height: 38, borderRadius: 19,
            alignItems: "center", justifyContent: "center",
            backgroundColor: isDark ? zinc[800] : zinc[100],
            borderWidth: 1, borderColor: isDark ? zinc[700] : zinc[200],
          }}
        >
          <IconSymbol name="xmark" size={15} color={Colors[cs].icon} />
        </TouchableOpacity>

        {/* Title */}
        <View className="items-center">
          <ThemedText className="text-[10px] tracking-widest text-zinc-400 font-semibold">
            RECEIPTS
          </ThemedText>
          <ThemedText className="text-base font-bold">Review</ThemedText>
        </View>

        {/* Confirm */}
        <TouchableOpacity
          activeOpacity={0.7}
          disabled={!canConfirm || confirmReceipt.isPending}
          onPress={handleConfirm}
          style={{
            width: 38, height: 38, borderRadius: 19,
            alignItems: "center", justifyContent: "center",
            backgroundColor: canConfirm
              ? isDark ? brand[400] : brand[500]
              : isDark ? zinc[800] : zinc[100],
            borderWidth: 1,
            borderColor: canConfirm
              ? isDark ? brand[400] : brand[500]
              : isDark ? zinc[700] : zinc[200],
          }}
        >
          {confirmReceipt.isPending ? (
            <ActivityIndicator size="small" color={Colors[cs].primaryForeground} />
          ) : (
            <IconSymbol
              name="checkmark"
              size={16}
              color={canConfirm ? Colors[cs].primaryForeground : Colors[cs].icon}
            />
          )}
        </TouchableOpacity>
      </View>

      {/* ── Body ──────────────────────────────────────────────── */}
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator />
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          className="flex-1"
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 16,
            paddingBottom: insets.bottom + 32,
            gap: 12,
          }}
        >

          {/* ── Receipt info card ──────────────────────────────── */}
          <View style={{ ...card, padding: 16 }}>
            {/* Store + status row */}
            <View className="flex-row items-start justify-between mb-3">
              <View className="flex-1 pr-3">
                <ThemedText className="text-lg font-bold" numberOfLines={1}>
                  {receipt?.storeName ?? "New Receipt"}
                </ThemedText>
                {receipt?.receiptDate ? (
                  <ThemedText className="text-xs text-zinc-400 mt-0.5">
                    {new Date(receipt.receiptDate).toLocaleDateString([], {
                      day: "numeric", month: "short", year: "numeric",
                    })}
                  </ThemedText>
                ) : null}
              </View>
              <View
                style={{
                  paddingHorizontal: 10, paddingVertical: 4,
                  borderRadius: 20,
                  backgroundColor: statusBg(receipt?.status, isDark),
                }}
              >
                <ThemedText
                  className="text-xs font-semibold capitalize"
                  style={{ color: statusColor(receipt?.status, isDark) }}
                >
                  {receipt?.status ?? "pending"}
                </ThemedText>
              </View>
            </View>

            {/* Receipt image */}
            <TouchableOpacity
              activeOpacity={0.9}
              disabled={!previewImageUri}
              onPress={() => setIsImageModalVisible(true)}
              style={{
                height: 200, borderRadius: 14, overflow: "hidden",
                backgroundColor: isDark ? zinc[700] : zinc[200],
                alignItems: "center", justifyContent: "center",
                marginBottom: receipt?.status !== "confirmed" ? 12 : 0,
              }}
            >
              {previewImageUri ? (
                <Image
                  source={{ uri: previewImageUri }}
                  style={{ width: "100%", height: "100%" }}
                  contentFit="cover"
                />
              ) : (
                <IconSymbol name="doc.text.fill" size={32} color={isDark ? zinc[600] : zinc[400]} />
              )}
            </TouchableOpacity>

            {/* OCR button */}
            {receipt?.status !== "confirmed" && (
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={handleProcess}
                disabled={processReceipt.isPending}
                style={{
                  height: 44, borderRadius: 14,
                  borderWidth: 1, borderColor: isDark ? zinc[700] : zinc[200],
                  alignItems: "center", justifyContent: "center",
                  flexDirection: "row", gap: 8,
                  backgroundColor: isDark ? zinc[900] : Colors[cs].background,
                }}
              >
                {processReceipt.isPending ? (
                  <ActivityIndicator size="small" />
                ) : (
                  <IconSymbol name="arrow.clockwise" size={16} color={Colors[cs].icon} />
                )}
                <ThemedText className="text-sm font-semibold">
                  {processReceipt.isPending ? "Processing…" : "Run OCR"}
                </ThemedText>
              </TouchableOpacity>
            )}
          </View>

          {/* ── Category card ──────────────────────────────────── */}
          <View style={{ ...card, padding: 16 }}>
            <ThemedText className="text-xs font-bold text-zinc-400 tracking-widest mb-3">
              CATEGORY
            </ThemedText>
            {expenseCategories.length === 0 ? (
              <ThemedText className="text-zinc-500 text-sm">
                Create an expense category first.
              </ThemedText>
            ) : (
              <View className="flex-row flex-wrap gap-2">
                {expenseCategories.map((category) => {
                  const selected = selectedCategoryId === category.id;
                  return (
                    <TouchableOpacity
                      key={category.id}
                      activeOpacity={0.7}
                      onPress={() => setSelectedCategoryId(category.id)}
                      style={{
                        flexDirection: "row", alignItems: "center",
                        paddingHorizontal: 12, paddingVertical: 8,
                        borderRadius: 20, borderWidth: 1,
                        backgroundColor: selected
                          ? isDark ? brand[400] : brand[500]
                          : isDark ? zinc[700] : zinc[200],
                        borderColor: selected
                          ? isDark ? brand[400] : brand[500]
                          : isDark ? zinc[700] : zinc[200],
                        gap: 6,
                      }}
                    >
                      <View
                        style={{
                          width: 8, height: 8, borderRadius: 4,
                          backgroundColor: selected
                            ? Colors[cs].primaryForeground
                            : category.color ?? zinc[400],
                        }}
                      />
                      <ThemedText
                        className="text-sm font-semibold"
                        style={{
                          color: selected
                            ? Colors[cs].primaryForeground
                            : isDark ? zinc[300] : zinc[700],
                        }}
                      >
                        {category.name}
                      </ThemedText>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>

          {/* ── Items card ─────────────────────────────────────── */}
          <View style={{ ...card, padding: 16 }}>
            <View className="flex-row items-center justify-between mb-3">
              <ThemedText className="text-xs font-bold text-zinc-400 tracking-widest">
                ITEMS
              </ThemedText>
              {items.length > 0 && (
                <ThemedText className="text-xs text-zinc-500">
                  {items.length} {items.length === 1 ? "item" : "items"}
                </ThemedText>
              )}
            </View>

            {/* Total summary */}
            {items.length > 0 && (
              <View
                className="flex-row justify-between items-center rounded-2xl px-4 py-3 mb-3"
                style={{ backgroundColor: isDark ? zinc[700] : zinc[200] }}
              >
                <View>
                  <ThemedText className="text-xs text-zinc-400 mb-0.5">Calculated</ThemedText>
                  <ThemedText className="text-sm font-bold">
                    {calculatedTotal.toFixed(2)}
                  </ThemedText>
                </View>
                {scannedTotal != null && (
                  <View className="items-end">
                    <ThemedText className="text-xs text-zinc-400 mb-0.5">Scanned</ThemedText>
                    <View className="flex-row items-center gap-1.5">
                      {!totalsMatch && (
                        <IconSymbol
                          name="exclamationmark.triangle.fill"
                          size={12}
                          color={isDark ? semantic.warning.dark : semantic.warning.light}
                        />
                      )}
                      <ThemedText
                        className="text-sm font-bold"
                        style={{
                          color: totalsMatch
                            ? undefined
                            : isDark ? semantic.warning.dark : semantic.warning.light,
                        }}
                      >
                        {scannedTotal.toFixed(2)}
                      </ThemedText>
                    </View>
                  </View>
                )}
              </View>
            )}

            {items.length === 0 ? (
              <ThemedText className="text-zinc-500 text-sm">No OCR items yet.</ThemedText>
            ) : (
              <View style={{ gap: 8 }}>
                {items.map((item) => (
                  <View
                    key={item.id}
                    style={{
                      backgroundColor: isDark ? zinc[700] : zinc[200],
                      borderRadius: 14,
                      padding: 12,
                    }}
                  >
                    {/* Item name */}
                    <TextInput
                      value={item.name}
                      onChangeText={(v) => updateItem(item.id, "name", v)}
                      placeholder="Item name"
                      placeholderTextColor={zinc[400]}
                      style={{
                        fontSize: 15,
                        fontWeight: "600",
                        color: isDark ? zinc[50] : zinc[900],
                        marginBottom: 10,
                      }}
                    />
                    {/* Qty / Price / Total */}
                    <View style={{ flexDirection: "row", gap: 8 }}>
                      {(
                        [
                          { key: "quantity" as const, label: "Qty" },
                          { key: "price"    as const, label: "Price" },
                          { key: "totalPrice" as const, label: "Total" },
                        ] as const
                      ).map(({ key, label }) => (
                        <View key={key} style={{ flex: 1 }}>
                          <ThemedText className="text-xs text-zinc-400 mb-1">{label}</ThemedText>
                          <TextInput
                            value={item[key]}
                            keyboardType="decimal-pad"
                            onChangeText={(v) => updateItem(item.id, key, v)}
                            style={{
                              height: 38, borderRadius: 10,
                              paddingHorizontal: 10,
                              backgroundColor: inputBg,
                              color: isDark ? zinc[50] : zinc[900],
                              fontSize: 14,
                            }}
                          />
                        </View>
                      ))}
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>

        </ScrollView>
      )}

      {/* ── Full-screen image modal ────────────────────────────── */}
      <Modal
        visible={isImageModalVisible}
        animationType="fade"
        transparent
        onRequestClose={() => setIsImageModalVisible(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.95)",
            paddingTop: insets.top + 8,
            paddingBottom: insets.bottom + 8,
          }}
        >
          <View className="px-4 flex-row justify-end mb-2">
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setIsImageModalVisible(false)}
              style={{
                width: 38, height: 38, borderRadius: 19,
                borderWidth: 1, borderColor: zinc[700],
                alignItems: "center", justifyContent: "center",
                backgroundColor: "rgba(0,0,0,0.5)",
              }}
            >
              <IconSymbol name="xmark" size={15} color={zinc[100]} />
            </TouchableOpacity>
          </View>
          <View className="flex-1 items-center justify-center px-4">
            {previewImageUri && (
              <Image
                source={{ uri: previewImageUri }}
                style={{ width: "100%", height: "100%" }}
                contentFit="contain"
              />
            )}
          </View>
        </View>
      </Modal>
    </ThemedView>
  );
}
