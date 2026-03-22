import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { sharedItemsApi, SharedItemStatus, AcceptSharedItemRequest } from '../api/endpoints/sharedItems';

// ── Queries ────────────────────────────────────────────────────────────────

export const useSharedInbox = (status?: SharedItemStatus) => {
    return useQuery({
        queryKey: ['shared-items', 'inbox', status],
        queryFn: () => sharedItemsApi.getInbox(status),
    });
};

export const useSharedSent = (status?: SharedItemStatus) => {
    return useQuery({
        queryKey: ['shared-items', 'sent', status],
        queryFn: () => sharedItemsApi.getSent(status),
    });
};

// ── Mutations ──────────────────────────────────────────────────────────────

export const useAcceptSharedItem = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: AcceptSharedItemRequest }) =>
            sharedItemsApi.accept(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['shared-items', 'inbox'] });
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
            queryClient.invalidateQueries({ queryKey: ['budgets'] });
        },
    });
};

export const useRejectSharedItem = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => sharedItemsApi.reject(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['shared-items', 'inbox'] });
        },
    });
};
