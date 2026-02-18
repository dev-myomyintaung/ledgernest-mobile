
import { useMemo } from "react";
import { Transaction } from "@/api/endpoints/transactions";
import { FilterState } from "@/hooks/useFilteredTransactions";
import { toTimestamp, getAmountNumber } from "@/utils/format";

type ReceiptGroup = {
    key: string;
    receiptId: string | null;
    storeName: string;
    receiptDate: string | null;
    transactions: Transaction[];
    total: number;
    latestTimestamp: number;
};

export type TransactionSection = {
    key: string;
    type: "receipt" | "manual";
    data: Transaction[];
    label?: string;
    receiptId?: string | null;
    storeName?: string;
    receiptDate?: string | null;
    total?: number;
};

export const useTransactionSections = (
    filteredTransactions: Transaction[],
    filters: FilterState
) => {
    const hasActiveFilters =
        filters.types.length > 0 ||
        filters.sources.length > 0 ||
        filters.categoryIds.length > 0 ||
        !!filters.dateRange.start ||
        !!filters.dateRange.end;

    const { receiptGroups, manualTransactions } = useMemo(() => {
        const groupsByReceipt = new Map<string, ReceiptGroup>();
        const manual: Transaction[] = [];

        for (const tx of filteredTransactions) {
            const receiptId =
                tx.receiptItem?.receipt?.id ?? tx.receiptItem?.receiptId ?? null;
            const hasReceiptBinding = !!tx.receiptItemId || !!receiptId;

            if (!hasReceiptBinding) {
                manual.push(tx);
                continue;
            }

            const groupKey = receiptId ?? `receipt-item:${tx.receiptItemId}`;
            const receiptDate = tx.receiptItem?.receipt?.receiptDate ?? tx.date;
            const latestTimestamp = Math.max(
                toTimestamp(receiptDate),
                toTimestamp(tx.date)
            );
            const signedAmount =
                tx.type === "income"
                    ? getAmountNumber(tx.amount)
                    : -getAmountNumber(tx.amount);
            const safeSignedAmount = Number.isNaN(signedAmount) ? 0 : signedAmount;

            const existing = groupsByReceipt.get(groupKey);
            if (existing) {
                existing.transactions.push(tx);
                existing.total += safeSignedAmount;
                existing.latestTimestamp = Math.max(
                    existing.latestTimestamp,
                    latestTimestamp
                );
                if (
                    (!existing.storeName || existing.storeName === "Receipt") &&
                    tx.receiptItem?.receipt?.storeName
                ) {
                    existing.storeName = tx.receiptItem.receipt.storeName;
                }
                if (!existing.receiptDate && tx.receiptItem?.receipt?.receiptDate) {
                    existing.receiptDate = tx.receiptItem.receipt.receiptDate;
                }
            } else {
                groupsByReceipt.set(groupKey, {
                    key: groupKey,
                    receiptId,
                    storeName: tx.receiptItem?.receipt?.storeName ?? "Receipt",
                    receiptDate: tx.receiptItem?.receipt?.receiptDate ?? null,
                    transactions: [tx],
                    total: safeSignedAmount,
                    latestTimestamp,
                });
            }
        }

        const groups = [...groupsByReceipt.values()]
            .map((group) => ({
                ...group,
                transactions: [...group.transactions].sort(
                    (a, b) => toTimestamp(b.date) - toTimestamp(a.date)
                ),
            }))
            .sort((a, b) => b.latestTimestamp - a.latestTimestamp);

        const sortedManual = [...manual].sort(
            (a, b) => toTimestamp(b.date) - toTimestamp(a.date)
        );

        return {
            receiptGroups: groups,
            manualTransactions: sortedManual,
        };
    }, [filteredTransactions]);

    const sections = useMemo<TransactionSection[]>(() => {
        const hasReceiptGroups = receiptGroups.length > 0;
        const hasManual = manualTransactions.length > 0;
        const hasNoFilters = !hasActiveFilters;
        const shouldSplitLabels = hasNoFilters && hasReceiptGroups && hasManual;
        const builtSections: TransactionSection[] = [];

        // If only manual source is selected
        if (filters.sources.length === 1 && filters.sources[0] === "manual") {
            if (hasManual) {
                builtSections.push({
                    key: "manual-only",
                    type: "manual",
                    data: manualTransactions,
                    label: "MANUAL ENTRIES",
                    total: manualTransactions.reduce((sum, tx) => {
                        const amount = getAmountNumber(tx.amount);
                        if (Number.isNaN(amount)) return sum;
                        return tx.type === "income" ? sum + amount : sum - amount;
                    }, 0),
                });
            }
            return builtSections;
        }

        // If only receipt source is selected
        if (filters.sources.length === 1 && filters.sources[0] === "receipt") {
            return receiptGroups.map((group) => ({
                key: `receipt-${group.key}`,
                type: "receipt",
                data: group.transactions,
                receiptId: group.receiptId,
                storeName: group.storeName,
                receiptDate: group.receiptDate,
                total: group.total,
            }));
        }

        for (const [index, group] of receiptGroups.entries()) {
            builtSections.push({
                key: `receipt-${group.key}`,
                type: "receipt",
                data: group.transactions,
                label: shouldSplitLabels && index === 0 ? "RECEIPTS" : undefined,
                receiptId: group.receiptId,
                storeName: group.storeName,
                receiptDate: group.receiptDate,
                total: group.total,
            });
        }

        if (hasManual) {
            builtSections.push({
                key: "manual",
                type: "manual",
                data: manualTransactions,
                label: shouldSplitLabels ? "MANUAL ENTRIES" : "MANUAL",
                total: manualTransactions.reduce((sum, tx) => {
                    const amount = getAmountNumber(tx.amount);
                    if (Number.isNaN(amount)) return sum;
                    return tx.type === "income" ? sum + amount : sum - amount;
                }, 0),
            });
        }

        return builtSections;
    }, [filters, receiptGroups, manualTransactions, hasActiveFilters]);

    return sections;
};
