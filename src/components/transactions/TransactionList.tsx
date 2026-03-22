import React from 'react';
import { View, SectionList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from "@/components/ui/themed-text";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { formatReceiptGroupDate } from "@/utils/format";
import { useAppCurrency } from "@/hooks/useAppCurrency";
import { Colors, zinc, semantic } from '@/constants/theme';
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
    const cs = colorScheme ?? 'light';
    const { format } = useAppCurrency();

    // Screen background — used so sticky headers blend in when content scrolls beneath
    const headerBg = Colors[cs].background;

    const renderSectionHeader = ({ section }: { section: TransactionSection }) => {
        const total       = section.total ?? 0;
        const totalAbs    = Math.abs(total);
        const totalColor  = total > 0 ? Colors[cs].success : total < 0 ? undefined : undefined;
        const totalPrefix = total > 0 ? "+" : total < 0 ? "-" : "";

        if (section.type === "manual") {
            return (
                <View style={{ backgroundColor: headerBg, paddingHorizontal: 16, paddingTop: 20, paddingBottom: 8 }}>
                    {section.label ? (
                        <ThemedText className="text-xs font-bold text-zinc-400 tracking-widest mb-1">
                            {section.label}
                        </ThemedText>
                    ) : null}
                    <View className="flex-row items-center justify-between">
                        <ThemedText className="text-xs text-zinc-500">Manual entries</ThemedText>
                        <ThemedText
                            className="text-xs font-semibold"
                            style={{ color: totalColor }}
                        >
                            {totalPrefix}{format(totalAbs)}
                        </ThemedText>
                    </View>
                </View>
            );
        }

        // Receipt section
        const summary      = formatReceiptGroupDate(section.receiptDate);
        const canNavigate  = !!section.receiptId;

        return (
            <View style={{ backgroundColor: headerBg, paddingHorizontal: 16, paddingTop: 20, paddingBottom: 8 }}>
                {section.label ? (
                    <ThemedText className="text-xs font-bold text-zinc-400 tracking-widest mb-2">
                        {section.label}
                    </ThemedText>
                ) : null}
                <TouchableOpacity
                    activeOpacity={canNavigate ? 0.7 : 1}
                    disabled={!canNavigate}
                    onPress={() => {
                        if (!section.receiptId) return;
                        router.push({ pathname: "/receipt-review", params: { receiptId: section.receiptId } });
                    }}
                    className="flex-row items-center justify-between"
                >
                    <View className="flex-1 pr-3">
                        <ThemedText type="defaultSemiBold" numberOfLines={1}>
                            {section.storeName ?? "Receipt"}
                        </ThemedText>
                        <ThemedText className="text-xs text-zinc-400" numberOfLines={1}>
                            {summary}
                        </ThemedText>
                    </View>
                    <View className="flex-row items-center gap-1">
                        <ThemedText
                            className="text-sm font-semibold"
                            style={{ color: totalColor }}
                        >
                            {totalPrefix}{format(totalAbs)}
                        </ThemedText>
                        {canNavigate && (
                            <IconSymbol name="chevron.right" size={12} color={zinc[isDark ? 500 : 400]} />
                        )}
                    </View>
                </TouchableOpacity>
            </View>
        );
    };

    if (isLoading) {
        return (
            <View className="px-4 py-10 items-center">
                <ActivityIndicator />
            </View>
        );
    }

    if (!isLoading && error) {
        return (
            <View className="px-4 py-10 items-center">
                <ThemedText style={{ color: semantic.danger.light }}>
                    Failed to load transactions
                </ThemedText>
            </View>
        );
    }

    return (
        <SectionList
            sections={sections}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            stickySectionHeadersEnabled
            renderSectionHeader={renderSectionHeader}
            renderItem={({ item, index, section }) => (
                <TransactionItem
                    transaction={item}
                    isFirst={index === 0}
                    isLast={index === section.data.length - 1}
                />
            )}
            SectionSeparatorComponent={() => <View style={{ height: 8 }} />}
            ListEmptyComponent={
                <View className="px-4 py-10 items-center">
                    <ThemedText className="text-zinc-500">No transactions found</ThemedText>
                </View>
            }
            contentContainerStyle={{ paddingBottom: contentPaddingBottom }}
        />
    );
};
