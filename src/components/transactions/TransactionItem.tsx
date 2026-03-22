
import React from 'react';
import { View } from 'react-native';
import { Transaction } from "@/api/endpoints/transactions";
import { ThemedText } from "@/components/ui/themed-text";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { formatDateLabel, hexToRgba } from "@/utils/format";
import { useAppCurrency } from "@/hooks/useAppCurrency";
import { Colors, zinc } from '@/constants/theme';

interface TransactionItemProps {
    transaction: Transaction;
    isLast?: boolean;
}

export const TransactionItem = React.memo(({ transaction, isLast = false }: TransactionItemProps) => {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === "dark";
    const { format } = useAppCurrency();

    const categoryColor =
        transaction.category?.color && transaction.category.color.startsWith("#")
            ? transaction.category.color
            : zinc[500];
    const title = transaction.description || transaction.category?.name || "Transaction";
    const subtitle = transaction.category?.name || formatDateLabel(transaction.date);
    const isIncome = transaction.type === "income";
    const rowClassName = `flex-row justify-between items-center px-6 py-4 ${!isLast ? "border-b border-zinc-100 dark:border-zinc-800" : ""}`;

    return (
        <View className={rowClassName}>
            <View className="flex-row items-center gap-4 flex-1 pr-3">
                <View
                    className="w-12 h-12 rounded-2xl items-center justify-center"
                    style={{
                        backgroundColor: hexToRgba(categoryColor, isDark ? 0.3 : 0.2),
                    }}
                >
                    <IconSymbol
                        name={(transaction.category?.icon as any) || "doc.text.fill"}
                        size={20}
                        color={categoryColor}
                    />
                </View>
                <View className="flex-1">
                    <ThemedText type="defaultSemiBold" numberOfLines={1}>
                        {title}
                    </ThemedText>
                    <ThemedText className="text-xs text-zinc-400" numberOfLines={1}>
                        {subtitle}
                    </ThemedText>
                </View>
            </View>
            <ThemedText
                type="defaultSemiBold"
                style={{ color: isIncome ? Colors[colorScheme ?? 'light'].success : undefined }}
            >
                {isIncome ? "+" : "-"}
                {format(transaction.amount)}
            </ThemedText>
        </View>
    );
});
