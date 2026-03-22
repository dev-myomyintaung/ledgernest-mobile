import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemedView } from "@/components/ui/themed-view";
import { ThemedText } from "@/components/ui/themed-text";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Colors, zinc, brand, semantic } from "@/constants/theme";
import { hexToRgba } from "@/utils/format";
import { useSharedInbox, useSharedSent, useAcceptSharedItem, useRejectSharedItem } from "@/hooks/useSharedItems";
import { useCategories } from "@/hooks/useCategories";
import { SharedItem, SharedItemStatus } from "@/api/endpoints/sharedItems";

type Tab = "inbox" | "sent";

function statusBadge(status: SharedItemStatus, isDark: boolean) {
  switch (status) {
    case "accepted": return {
      bg: isDark ? hexToRgba(semantic.success.dark, 0.15) : hexToRgba(semantic.success.light, 0.12),
      color: isDark ? semantic.success.dark : semantic.success.light,
      label: "Accepted",
    };
    case "rejected": return {
      bg: isDark ? hexToRgba(semantic.danger.dark, 0.15) : hexToRgba(semantic.danger.light, 0.12),
      color: isDark ? semantic.danger.dark : semantic.danger.light,
      label: "Rejected",
    };
    default: return {
      bg: isDark ? hexToRgba(semantic.warning.dark, 0.15) : hexToRgba(semantic.warning.light, 0.12),
      color: isDark ? semantic.warning.dark : semantic.warning.light,
      label: "Pending",
    };
  }
}

function senderName(item: SharedItem) {
  const u = item.sharedBy;
  if (!u) return "Someone";
  return u.displayName || [u.firstName, u.lastName].filter(Boolean).join(" ") || "Someone";
}

function recipientName(item: SharedItem) {
  const u = item.sharedWith;
  if (!u) return "Someone";
  return u.displayName || [u.firstName, u.lastName].filter(Boolean).join(" ") || "Someone";
}

export default function SharedInboxScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const cs = colorScheme ?? "light";

  const [activeTab, setActiveTab] = useState<Tab>("inbox");
  const [acceptingItem, setAcceptingItem] = useState<SharedItem | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");

  const { data: inbox = [], isLoading: inboxLoading } = useSharedInbox();
  const { data: sent = [], isLoading: sentLoading }   = useSharedSent();
  const { data: categories = [] } = useCategories();
  const acceptMutation = useAcceptSharedItem();
  const rejectMutation = useRejectSharedItem();

  const expenseCategories = categories.filter((c) => c.type === "expense");

  const handleOpenAccept = (item: SharedItem) => {
    setAcceptingItem(item);
    if (!selectedCategoryId && expenseCategories.length > 0) {
      setSelectedCategoryId(expenseCategories[0].id);
    }
  };

  const handleAccept = async () => {
    if (!acceptingItem || !selectedCategoryId) return;
    try {
      await acceptMutation.mutateAsync({ id: acceptingItem.id, data: { categoryId: selectedCategoryId } });
      setAcceptingItem(null);
      Alert.alert("Accepted", "Item added to your transactions.");
    } catch {
      Alert.alert("Error", "Could not accept item. Try again.");
    }
  };

  const handleReject = (item: SharedItem) => {
    Alert.alert("Reject item?", `Reject "${item.receiptItem.name}" from ${senderName(item)}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Reject",
        style: "destructive",
        onPress: async () => {
          try {
            await rejectMutation.mutateAsync(item.id);
          } catch {
            Alert.alert("Error", "Could not reject item.");
          }
        },
      },
    ]);
  };

  const card = {
    backgroundColor: isDark ? zinc[800] : zinc[100],
    borderRadius: 20,
    borderWidth: 1,
    borderColor: isDark ? zinc[700] : zinc[200],
  } as const;

  const isLoading = activeTab === "inbox" ? inboxLoading : sentLoading;
  const items     = activeTab === "inbox" ? inbox : sent;

  return (
    <ThemedView className="flex-1" style={{ paddingTop: Platform.OS === "ios" ? 8 : insets.top }}>

      {/* ── Header ─────────────────────────────────────────────── */}
      <View
        className="px-4 py-3 flex-row items-center justify-between"
        style={{ borderBottomWidth: 1, borderBottomColor: isDark ? zinc[800] : zinc[200] }}
      >
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

        <View className="items-center">
          <ThemedText className="text-[10px] tracking-widest text-zinc-400 font-semibold">SOCIAL</ThemedText>
          <ThemedText className="text-base font-bold">Shared Items</ThemedText>
        </View>

        <View style={{ width: 38 }} />
      </View>

      {/* ── Tab switcher ──────────────────────────────────────── */}
      <View
        className="flex-row mx-4 mt-3 rounded-2xl p-1"
        style={{ backgroundColor: isDark ? zinc[800] : zinc[100], borderWidth: 1, borderColor: isDark ? zinc[700] : zinc[200] }}
      >
        {(["inbox", "sent"] as Tab[]).map((tab) => (
          <TouchableOpacity
            key={tab}
            activeOpacity={0.7}
            onPress={() => setActiveTab(tab)}
            style={{
              flex: 1, paddingVertical: 8, borderRadius: 14, alignItems: "center",
              backgroundColor: activeTab === tab
                ? isDark ? brand[400] : brand[500]
                : "transparent",
            }}
          >
            <ThemedText
              className="text-sm font-semibold capitalize"
              style={{
                color: activeTab === tab
                  ? Colors[cs].primaryForeground
                  : isDark ? zinc[400] : zinc[500],
              }}
            >
              {tab === "inbox" ? "Inbox" : "Sent"}
              {tab === "inbox" && inbox.filter((i) => i.status === "pending").length > 0 && (
                ` (${inbox.filter((i) => i.status === "pending").length})`
              )}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── List ──────────────────────────────────────────────── */}
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator />
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 12,
            paddingBottom: insets.bottom + 32,
            gap: 10,
          }}
        >
          {items.length === 0 && (
            <View className="items-center py-16">
              <IconSymbol
                name={activeTab === "inbox" ? "tray" : "paperplane"}
                size={36}
                color={isDark ? zinc[700] : zinc[300]}
              />
              <ThemedText className="text-zinc-400 mt-3 text-sm text-center">
                {activeTab === "inbox"
                  ? "No items shared with you yet."
                  : "You haven't assigned any items yet."}
              </ThemedText>
            </View>
          )}

          {items.map((item) => {
            const badge = statusBadge(item.status, isDark);
            const receiptLabel = item.receiptItem.receipt.storeName
              ? `${item.receiptItem.receipt.storeName} · ${new Date(item.receiptItem.receipt.receiptDate).toLocaleDateString([], { day: "numeric", month: "short" })}`
              : new Date(item.receiptItem.receipt.receiptDate).toLocaleDateString([], { day: "numeric", month: "short", year: "numeric" });

            return (
              <View key={item.id} style={{ ...card, padding: 16 }}>
                {/* Meta row */}
                <View className="flex-row items-center justify-between mb-2">
                  <ThemedText className="text-xs text-zinc-400" numberOfLines={1} style={{ flex: 1, marginRight: 8 }}>
                    {activeTab === "inbox" ? `From ${senderName(item)}` : `To ${recipientName(item)}`}
                    {" · "}
                    {receiptLabel}
                  </ThemedText>
                  <View style={{ paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10, backgroundColor: badge.bg }}>
                    <ThemedText className="text-xs font-semibold" style={{ color: badge.color }}>
                      {badge.label}
                    </ThemedText>
                  </View>
                </View>

                {/* Item name + amount */}
                <View className="flex-row items-center justify-between">
                  <ThemedText className="text-base font-bold flex-1 mr-3" numberOfLines={1}>
                    {item.receiptItem.name}
                  </ThemedText>
                  <ThemedText className="text-base font-bold">
                    ${parseFloat(item.splitAmount).toFixed(2)}
                  </ThemedText>
                </View>

                {/* Accept / Reject actions (inbox, pending only) */}
                {activeTab === "inbox" && item.status === "pending" && (
                  <View className="flex-row gap-2 mt-3">
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => handleReject(item)}
                      disabled={rejectMutation.isPending}
                      style={{
                        flex: 1, height: 38, borderRadius: 12,
                        alignItems: "center", justifyContent: "center",
                        borderWidth: 1,
                        borderColor: isDark ? semantic.danger.dark : semantic.danger.light,
                        backgroundColor: isDark
                          ? hexToRgba(semantic.danger.dark, 0.1)
                          : hexToRgba(semantic.danger.light, 0.06),
                      }}
                    >
                      <ThemedText className="text-sm font-semibold" style={{ color: isDark ? semantic.danger.dark : semantic.danger.light }}>
                        Reject
                      </ThemedText>
                    </TouchableOpacity>

                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => handleOpenAccept(item)}
                      style={{
                        flex: 1, height: 38, borderRadius: 12,
                        alignItems: "center", justifyContent: "center",
                        backgroundColor: isDark ? brand[400] : brand[500],
                      }}
                    >
                      <ThemedText className="text-sm font-semibold" style={{ color: Colors[cs].primaryForeground }}>
                        Accept
                      </ThemedText>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            );
          })}
        </ScrollView>
      )}

      {/* ── Accept sheet (category picker) ──────────────────── */}
      <Modal
        visible={!!acceptingItem}
        animationType="slide"
        transparent
        onRequestClose={() => setAcceptingItem(null)}
      >
        <TouchableOpacity
          activeOpacity={1}
          style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.45)" }}
          onPress={() => setAcceptingItem(null)}
        >
          <TouchableOpacity
            activeOpacity={1}
            style={{
              position: "absolute", bottom: 0, left: 0, right: 0,
              backgroundColor: isDark ? zinc[900] : Colors[cs].background,
              borderTopLeftRadius: 24, borderTopRightRadius: 24,
              paddingBottom: Math.max(insets.bottom, 16) + 8,
            }}
          >
            {/* Handle */}
            <View
              style={{
                width: 36, height: 4, borderRadius: 2,
                backgroundColor: isDark ? zinc[600] : zinc[300],
                alignSelf: "center", marginTop: 12, marginBottom: 16,
              }}
            />

            <View className="px-6 mb-4">
              <ThemedText className="text-base font-bold">Accept item</ThemedText>
              {acceptingItem && (
                <ThemedText className="text-xs text-zinc-400 mt-1">
                  {acceptingItem.receiptItem.name} · ${parseFloat(acceptingItem.splitAmount).toFixed(2)}
                </ThemedText>
              )}
            </View>

            <ThemedText className="text-xs font-bold text-zinc-400 tracking-widest px-6 mb-3">
              CATEGORY
            </ThemedText>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 260 }}>
              <View className="flex-row flex-wrap gap-2 px-6 pb-4">
                {expenseCategories.map((cat) => {
                  const selected = selectedCategoryId === cat.id;
                  return (
                    <TouchableOpacity
                      key={cat.id}
                      activeOpacity={0.7}
                      onPress={() => setSelectedCategoryId(cat.id)}
                      style={{
                        flexDirection: "row", alignItems: "center", gap: 6,
                        paddingHorizontal: 12, paddingVertical: 8,
                        borderRadius: 20, borderWidth: 1,
                        backgroundColor: selected ? (isDark ? brand[400] : brand[500]) : (isDark ? zinc[700] : zinc[200]),
                        borderColor:     selected ? (isDark ? brand[400] : brand[500]) : (isDark ? zinc[700] : zinc[200]),
                      }}
                    >
                      <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: selected ? Colors[cs].primaryForeground : (cat.color ?? zinc[400]) }} />
                      <ThemedText
                        className="text-sm font-semibold"
                        style={{ color: selected ? Colors[cs].primaryForeground : (isDark ? zinc[300] : zinc[700]) }}
                      >
                        {cat.name}
                      </ThemedText>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>

            <TouchableOpacity
              activeOpacity={0.7}
              disabled={!selectedCategoryId || acceptMutation.isPending}
              onPress={handleAccept}
              style={{
                marginHorizontal: 20, height: 50, borderRadius: 16,
                alignItems: "center", justifyContent: "center",
                backgroundColor: selectedCategoryId ? (isDark ? brand[400] : brand[500]) : (isDark ? zinc[700] : zinc[200]),
              }}
            >
              {acceptMutation.isPending ? (
                <ActivityIndicator color={Colors[cs].primaryForeground} />
              ) : (
                <ThemedText
                  className="text-base font-bold"
                  style={{ color: selectedCategoryId ? Colors[cs].primaryForeground : (isDark ? zinc[500] : zinc[400]) }}
                >
                  Accept & Add to Transactions
                </ThemedText>
              )}
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </ThemedView>
  );
}
