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
    isFirst?: boolean;
    isLast?: boolean;
}

export const TransactionItem = React.memo(({ transaction, isFirst = false, isLast = false }: TransactionItemProps) => {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === "dark";
    const cs = colorScheme ?? 'light';
    const { format } = useAppCurrency();

    const categoryColor =
        transaction.category?.color && transaction.category.color.startsWith("#")
            ? transaction.category.color
            : zinc[500];
    const title    = transaction.description || transaction.category?.name || "Transaction";
    const subtitle = transaction.category?.name || formatDateLabel(transaction.date);
    const isIncome = transaction.type === "income";

    return (
        <View
            style={{
                marginHorizontal: 16,
                backgroundColor: isDark ? zinc[800] : zinc[100],
                borderTopLeftRadius:     isFirst ? 16 : 0,
                borderTopRightRadius:    isFirst ? 16 : 0,
                borderBottomLeftRadius:  isLast  ? 16 : 0,
                borderBottomRightRadius: isLast  ? 16 : 0,
            }}
        >
            <View
                style={{
                    flexDirection:  'row',
                    alignItems:     'center',
                    justifyContent: 'space-between',
                    paddingHorizontal: 16,
                    paddingVertical:   14,
                }}
            >
                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, paddingRight: 12, gap: 12 }}>
                    <View
                        style={{
                            width: 44,
                            height: 44,
                            borderRadius: 14,
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: hexToRgba(categoryColor, isDark ? 0.3 : 0.15),
                        }}
                    >
                        <IconSymbol
                            name={(transaction.category?.icon as any) || "doc.text.fill"}
                            size={19}
                            color={categoryColor}
                        />
                    </View>
                    <View style={{ flex: 1 }}>
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
                    style={{ color: isIncome ? Colors[cs].success : isDark ? zinc[50] : undefined }}
                >
                    {isIncome ? "+" : "-"}{format(transaction.amount)}
                </ThemedText>
            </View>

            {/* Internal divider — indented to align with title */}
            {!isLast && (
                <View
                    style={{
                        height: 1,
                        backgroundColor: isDark ? zinc[700] : zinc[200],
                        marginLeft: 72,
                    }}
                />
            )}
        </View>
    );
});
