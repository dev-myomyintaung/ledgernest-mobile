import { useMemo } from "react";
import dayjs from "dayjs";
import { Transaction } from "@/api/endpoints/transactions";

export type FilterType = "income" | "expense";
export type FilterSource = "receipt" | "manual";

export type DateRange = {
    start: string | null; // ISO string
    end: string | null;   // ISO string
};

export type FilterState = {
    types: FilterType[];
    sources: FilterSource[];
    categoryIds: string[];
    dateRange: DateRange;
};

export const useFilteredTransactions = (
    transactions: Transaction[],
    filters: FilterState,
    search: string
) => {
    return useMemo(() => {
        const query = search.trim().toLowerCase();
        const startDate = filters.dateRange.start ? dayjs(filters.dateRange.start).startOf('day') : null;
        const endDate = filters.dateRange.end ? dayjs(filters.dateRange.end).endOf('day') : null;

        return transactions.filter((tx) => {
            const hasReceiptBinding =
                !!tx.receiptItemId ||
                !!tx.receiptItem?.receiptId ||
                !!tx.receiptItem?.receipt?.id;

            // Filter by type (income/expense)
            if (
                filters.types.length > 0 &&
                !filters.types.includes(tx.type as FilterType)
            ) {
                return false;
            }

            // Filter by source (receipt/manual)
            if (filters.sources.length > 0) {
                const isReceipt = hasReceiptBinding;
                const isManual = !hasReceiptBinding;
                if (filters.sources.includes("receipt") && !isReceipt) return false;
                if (filters.sources.includes("manual") && !isManual) return false;
            }

            // Filter by category
            if (
                filters.categoryIds.length > 0 &&
                !filters.categoryIds.includes(tx.categoryId ?? "")
            ) {
                return false;
            }

            // Filter by date range
            if (startDate || endDate) {
                const txDate = dayjs(tx.date);
                if (startDate && txDate.isBefore(startDate)) return false;
                if (endDate && txDate.isAfter(endDate)) return false;
            }

            if (!query) return true;
            const haystack = [
                tx.description ?? "",
                tx.category?.name ?? "",
                tx.type ?? "",
                tx.receiptItemId ? "receipt" : "manual",
                tx.receiptItem?.name ?? "",
                tx.receiptItem?.receipt?.storeName ?? "",
            ]
                .join(" ")
                .toLowerCase();
            return haystack.includes(query);
        });
    }, [transactions, filters, search]);
};
