
import React from 'react';
import { View, SectionList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from "@/components/ui/themed-text";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { formatReceiptGroupDate } from "@/utils/format";
import { useAppCurrency } from "@/hooks/useAppCurrency";
import { TransactionItem } from './TransactionItem';
import { TransactionSection } from '@/hooks/useTransactionSections';

interface TransactionListProps {
    sections: TransactionSection[];
    isLoading: boolean;
    error: Error | null;
    contentPaddingBottom: number;
}

export const TransactionList = ({ sections, isLoading, error, contentPaddingBottom }: TransactionListProps) => {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === "dark";
    const { format } = useAppCurrency();

    const renderSectionHeader = ({
        section,
    }: {
        section: TransactionSection;
    }) => {
        if (section.type === "manual") {
            const total = section.total ?? 0;
            const totalPrefix = total > 0 ? "+" : total < 0 ? "-" : "";

            return (
                <View className="bg-zinc-50 dark:bg-zinc-950 px-6 pt-4 pb-2">
                    <View className="flex-row items-center justify-between mt-1">
                        <ThemedText className="text-[11px] tracking-widest text-zinc-500">
                            {section.label ?? "MANUAL"}
                        </ThemedText>
                        <ThemedText
                            type="defaultSemiBold"
                            style={{ color: total > 0 ? "#10B981" : undefined }}
                        >
                            {totalPrefix}
                            {format(total)}
                        </ThemedText>
                    </View>
                </View>
            );
        }

        const total = section.total ?? 0;
        const totalPrefix = total > 0 ? "+" : total < 0 ? "-" : "";
        const summary = formatReceiptGroupDate(section.receiptDate);
        const canOpenReceipt = !!section.receiptId;

        return (
            <View className="bg-zinc-50 dark:bg-zinc-950 px-6 pt-4 pb-2">
                {section.label ? (
                    <ThemedText className="text-[11px] tracking-widest text-zinc-500">
                        {section.label}
                    </ThemedText>
                ) : null}
                <TouchableOpacity
                    activeOpacity={0.85}
                    disabled={!canOpenReceipt}
                    onPress={() => {
                        if (!section.receiptId) return;
                        router.push({
                            pathname: "/receipt-review",
                            params: { receiptId: section.receiptId },
                        });
                    }}
                    className="pt-1 flex-row items-center justify-between"
                >
                    <View className="flex-1 pr-3">
                        <ThemedText type="defaultSemiBold" numberOfLines={1}>
                            {section.storeName ?? "Receipt"}
                        </ThemedText>
                        <ThemedText className="text-xs text-zinc-500" numberOfLines={1}>
                            {summary}
                        </ThemedText>
                    </View>
                    <View className="items-end">
                        <ThemedText
                            type="defaultSemiBold"
                            style={{ color: total > 0 ? "#10B981" : undefined }}
                        >
                            {totalPrefix}
                            {format(total)}
                        </ThemedText>
                        {canOpenReceipt ? (
                            <View className="mt-1 flex-row items-center gap-1">
                                <IconSymbol
                                    name="chevron.right"
                                    size={10}
                                    color={isDark ? "#a1a1aa" : "#71717a"}
                                />
                            </View>
                        ) : null}
                    </View>
                </TouchableOpacity>
            </View>
        );
    };

    if (isLoading) {
        return (
            <View className="px-6 py-10 items-center">
                <ActivityIndicator />
            </View>
        )
    }

    if (!isLoading && error) {
        return (
            <View className="px-6 py-10 items-center">
                <ThemedText className="text-red-500">
                    Failed to load transactions
                </ThemedText>
            </View>
        )
    }

    return (
        <SectionList
            sections={sections}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            stickySectionHeadersEnabled
            renderSectionHeader={renderSectionHeader}
            renderItem={({ item, index, section }) =>
                <TransactionItem transaction={item} isLast={index === section.data.length - 1} />
            }
            ListEmptyComponent={
                <View className="px-6 py-10 items-center">
                    <ThemedText className="text-zinc-500">
                        No transactions found
                    </ThemedText>
                </View>
            }
            contentContainerStyle={{ paddingBottom: contentPaddingBottom }}
        />
    );
};
