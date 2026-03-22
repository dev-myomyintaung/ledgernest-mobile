import { useState } from "react";
import {
  View,
  Modal,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemedText } from "@/components/ui/themed-text";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useCategories } from "@/hooks/useCategories";
import { useCreateBudget } from "@/hooks/useBudgets";
import { useAppCurrency } from "@/hooks/useAppCurrency";
import { Colors, Typography, zinc } from "@/constants/theme";
import { Category } from "@/api/endpoints/categories";

interface Props {
  visible: boolean;
  onClose: () => void;
}

const PERIODS = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly" },
] as const;

const FALLBACK_COLOR = zinc[500];

export function CreateBudgetSheet({ visible, onClose }: Props) {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const c = Colors[isDark ? "dark" : "light"];

  const { data: categories = [] } = useCategories();
  const createBudget = useCreateBudget();

  const expenseCategories = categories.filter(
    (c: Category) => c.type === "expense",
  );
  const { symbol } = useAppCurrency();

  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [period, setPeriod] = useState<
    "daily" | "weekly" | "monthly" | "yearly"
  >("monthly");
  const [categoryId, setCategoryId] = useState("");

  const reset = () => {
    setName("");
    setAmount("");
    setPeriod("monthly");
    setCategoryId("");
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleCreate = async () => {
    if (!name.trim()) {
      Alert.alert("Name required", "Please enter a budget name.");
      return;
    }
    const parsedAmount = parseFloat(amount.replace(",", "."));
    if (!parsedAmount || parsedAmount <= 0) {
      Alert.alert("Invalid amount", "Please enter a valid budget amount.");
      return;
    }
    if (!categoryId) {
      Alert.alert("Category required", "Please select a category.");
      return;
    }

    try {
      await createBudget.mutateAsync({
        name: name.trim(),
        amount: parsedAmount,
        period,
        categoryId,
        startDate: new Date().toISOString(),
      });
      handleClose();
    } catch {
      Alert.alert("Error", "Could not create budget. Try again.");
    }
  };

  const inputStyle = {
    height: 48,
    borderRadius: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    fontSize: Typography.size.base,
    textAlignVertical: "center" as const,
    backgroundColor: c.card,
    borderColor: c.border,
    color: c.text,
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <TouchableOpacity
        activeOpacity={1}
        style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.45)" }}
        onPress={handleClose}
      >
        <TouchableOpacity
          activeOpacity={1}
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            maxHeight: "90%",
            backgroundColor: c.background,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            paddingBottom: Math.max(insets.bottom, 16) + 8,
          }}
        >
          {/* Drag handle */}
          <View
            style={{
              width: 36,
              height: 4,
              borderRadius: 2,
              backgroundColor: c.border,
              alignSelf: "center",
              marginTop: 12,
              marginBottom: 20,
            }}
          />

          {/* Header */}
          <View className="flex-row justify-between items-center mb-5 px-6">
            <ThemedText
              type="defaultSemiBold"
              style={{ fontSize: Typography.size.lg }}
            >
              New Budget
            </ThemedText>
            <TouchableOpacity onPress={handleClose}>
              <IconSymbol
                name="xmark.circle.fill"
                size={28}
                color={c.icon}
              />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            className="px-6"
            keyboardShouldPersistTaps="handled"
          >
            {/* Name */}
            <ThemedText className="text-xs tracking-widest text-zinc-500 mb-2">
              BUDGET NAME
            </ThemedText>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="e.g. Monthly Groceries"
              placeholderTextColor={c.textMuted}
              style={inputStyle}
            />

            {/* Amount */}
            <ThemedText className="text-xs tracking-widest text-zinc-500 mb-2 mt-5">
              LIMIT AMOUNT
            </ThemedText>
            <TextInput
              value={amount}
              onChangeText={setAmount}
              placeholder={`${symbol} 0.00`}
              placeholderTextColor={c.textMuted}
              keyboardType="decimal-pad"
              style={inputStyle}
            />

            {/* Period */}
            <ThemedText className="text-xs tracking-widest text-zinc-500 mb-2 mt-5">
              PERIOD
            </ThemedText>
            <View className="flex-row gap-2">
              {PERIODS.map((p) => {
                const selected = period === p.value;
                return (
                  <TouchableOpacity
                    key={p.value}
                    onPress={() => setPeriod(p.value)}
                    className="flex-1 h-11 rounded-2xl items-center justify-center border"
                    style={{
                      backgroundColor: selected ? c.primary : "transparent",
                      borderColor: selected ? c.primary : c.border,
                    }}
                  >
                    <ThemedText
                      className="text-sm font-semibold"
                      style={{
                        color: selected ? c.primaryForeground : c.textSecondary,
                      }}
                    >
                      {p.label}
                    </ThemedText>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Category */}
            <ThemedText className="text-xs tracking-widest text-zinc-500 mb-2 mt-5">
              CATEGORY
            </ThemedText>
            <View className="flex-row flex-wrap gap-2 mb-8">
              {expenseCategories.map((cat: Category) => {
                const selected = categoryId === cat.id;
                const color = cat.color ?? FALLBACK_COLOR;
                return (
                  <TouchableOpacity
                    key={cat.id}
                    onPress={() => setCategoryId(cat.id)}
                    className="flex-row items-center gap-2 px-3 py-2 rounded-full border"
                    style={{
                      backgroundColor: selected ? c.primaryLight : "transparent",
                      borderColor: selected ? c.primary : c.border,
                    }}
                  >
                    <View
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: color }}
                    />
                    <ThemedText
                      className="text-sm"
                      style={{
                        color: selected ? c.primary : c.text,
                      }}
                    >
                      {cat.name}
                    </ThemedText>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>

          {/* Create button */}
          <View className="px-6 pt-3">
            <TouchableOpacity
              onPress={handleCreate}
              disabled={createBudget.isPending}
              className="rounded-2xl items-center justify-center"
              style={{
                backgroundColor: c.primary,
                height: 52,
              }}
            >
              {createBudget.isPending ? (
                <ActivityIndicator color={c.primaryForeground} />
              ) : (
                <ThemedText
                  className="font-semibold text-base"
                  style={{ color: c.primaryForeground }}
                >
                  Create Budget
                </ThemedText>
              )}
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}
