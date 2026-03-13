import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    receiptApi,
    ConfirmReceiptRequest,
    UpdateReceiptRequest,
    ConfirmReceiptResponse,
} from '../api/endpoints/receipts';

// ── Queries ────────────────────────────────────────────────────────────────

export const useReceipts = () => {
    return useQuery({
        queryKey: ['receipts'],
        queryFn: receiptApi.getReceipts,
    });
};

export const useReceipt = (id: string) => {
    return useQuery({
        queryKey: ['receipts', id],
        queryFn: () => receiptApi.getReceipt(id),
        enabled: !!id,
    });
};

// ── Mutations ──────────────────────────────────────────────────────────────

export const useUploadReceipt = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ imageUri, fileName, mimeType }: {
            imageUri: string;
            fileName: string;
            mimeType: string;
        }) => receiptApi.uploadReceipt(imageUri, fileName, mimeType),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['receipts'] });
        },
    });
};

export const useProcessReceipt = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => receiptApi.processReceipt(id),
        onSuccess: (_data, id) => {
            queryClient.invalidateQueries({ queryKey: ['receipts'] });
            queryClient.invalidateQueries({ queryKey: ['receipts', id] });
        },
    });
};

export const useConfirmReceipt = () => {
    const queryClient = useQueryClient();

    return useMutation<ConfirmReceiptResponse, Error, { id: string; data: ConfirmReceiptRequest }>({
        mutationFn: ({ id, data }: { id: string; data: ConfirmReceiptRequest }) =>
            receiptApi.confirmReceipt(id, data),
        onSuccess: (_data, { id }) => {
            queryClient.invalidateQueries({ queryKey: ['receipts'] });
            queryClient.invalidateQueries({ queryKey: ['receipts', id] });
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
            queryClient.invalidateQueries({ queryKey: ['budgets'] });
        },
    });
};

export const useUpdateReceipt = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateReceiptRequest }) =>
            receiptApi.updateReceipt(id, data),
        onSuccess: (_data, { id }) => {
            queryClient.invalidateQueries({ queryKey: ['receipts'] });
            queryClient.invalidateQueries({ queryKey: ['receipts', id] });
        },
    });
};

export const useDeleteReceipt = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => receiptApi.deleteReceipt(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['receipts'] });
        },
    });
};
