import client from '../client';
import { ApiResponse } from './auth';

// ── Types ──────────────────────────────────────────────────────────────────

export type SharedItemStatus = 'pending' | 'accepted' | 'rejected';

export interface SharedItemUser {
    id: string;
    firstName: string | null;
    lastName: string | null;
    displayName: string | null;
    avatarUrl: string | null;
}

export interface SharedItemReceipt {
    id: string;
    storeName: string | null;
    receiptDate: string;
}

export interface SharedReceiptItemDetail {
    id: string;
    name: string;
    quantity: string;
    price: string;
    totalPrice: string;
    receipt: SharedItemReceipt;
}

export interface SharedItem {
    id: string;
    receiptItemId: string;
    sharedById: string;
    sharedWithId: string;
    splitAmount: string;
    status: SharedItemStatus;
    createdAt: string;
    updatedAt: string;
    sharedBy?: SharedItemUser;
    sharedWith?: SharedItemUser;
    receiptItem: SharedReceiptItemDetail;
}

export interface AcceptSharedItemRequest {
    categoryId: string;
    budgetId?: string;
}

// ── API ────────────────────────────────────────────────────────────────────

export const sharedItemsApi = {
    getInbox: async (status?: SharedItemStatus): Promise<SharedItem[]> => {
        const response = await client.get<ApiResponse<SharedItem[]>>('/shared-items/inbox', {
            params: status ? { status } : undefined,
        });
        return response.data.data;
    },

    getSent: async (status?: SharedItemStatus): Promise<SharedItem[]> => {
        const response = await client.get<ApiResponse<SharedItem[]>>('/shared-items/sent', {
            params: status ? { status } : undefined,
        });
        return response.data.data;
    },

    accept: async (id: string, data: AcceptSharedItemRequest): Promise<void> => {
        await client.put(`/shared-items/${id}/accept`, data);
    },

    reject: async (id: string): Promise<void> => {
        await client.put(`/shared-items/${id}/reject`);
    },
};
