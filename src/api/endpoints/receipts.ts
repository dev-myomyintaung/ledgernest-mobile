import client from '../client';
import { ApiResponse } from './auth';

// ── Types ──────────────────────────────────────────────────────────────────

export interface ReceiptItem {
    id: string;
    receiptId: string;
    name: string;
    quantity: string;
    price: string;
    totalPrice: string;
    createdAt: string;
    updatedAt: string;
}

export interface Receipt {
    id: string;
    userId: string;
    storeName: string | null;
    receiptDate: string;
    totalAmount: string;
    tax: string | null;
    imageUrl: string;
    status: 'pending' | 'processing' | 'processed' | 'confirmed' | 'error';
    createdAt: string;
    updatedAt: string;
    items?: ReceiptItem[];
}

export interface UpdateReceiptRequest {
    storeName?: string;
    receiptDate?: string;
    totalAmount?: number;
    tax?: number;
}

export interface ConfirmReceiptItem {
    id: string;
    name: string;
    quantity: number;
    price: number;
    totalPrice: number;
}

export interface AssignedReceiptItem {
    itemId: string;
    assignedToUserId: string;
}

export interface ConfirmReceiptRequest {
    categoryId: string;
    budgetId?: string;
    items: ConfirmReceiptItem[];
    assignedItems?: AssignedReceiptItem[];
}

export interface ConfirmReceiptResponse {
    receiptId: string;
    transactionsCreated: number;
    sharedItemsCreated: number;
}

// ── API functions ──────────────────────────────────────────────────────────

export const receiptApi = {
    /**
     * Upload a receipt image (multipart/form-data, field: image)
     */
    uploadReceipt: async (imageUri: string, fileName: string, mimeType: string): Promise<Receipt> => {
        const formData = new FormData();
        formData.append('image', {
            uri: imageUri,
            name: fileName,
            type: mimeType,
        } as any);

        const response = await client.post<ApiResponse<Receipt>>('/receipts/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data.data;
    },

    /**
     * Run OCR processing on an uploaded receipt
     */
    processReceipt: async (id: string): Promise<Receipt> => {
        const response = await client.post<ApiResponse<Receipt>>(`/receipts/${id}/process`);
        return response.data.data;
    },

    /**
     * Confirm receipt items → creates 1 transaction per item
     */
    confirmReceipt: async (id: string, data: ConfirmReceiptRequest): Promise<ConfirmReceiptResponse> => {
        const response = await client.post<ApiResponse<ConfirmReceiptResponse>>(`/receipts/${id}/confirm`, data);
        return response.data.data;
    },

    /**
     * List all receipts
     */
    getReceipts: async (): Promise<Receipt[]> => {
        const response = await client.get<ApiResponse<Receipt[]>>('/receipts');
        return response.data.data;
    },

    /**
     * Get a single receipt with items
     */
    getReceipt: async (id: string): Promise<Receipt> => {
        const response = await client.get<ApiResponse<Receipt>>(`/receipts/${id}`);
        return response.data.data;
    },

    /**
     * Manually correct OCR data
     */
    updateReceipt: async (id: string, data: UpdateReceiptRequest): Promise<Receipt> => {
        const response = await client.put<ApiResponse<Receipt>>(`/receipts/${id}`, data);
        return response.data.data;
    },

    /**
     * Delete receipt + image file from disk
     */
    deleteReceipt: async (id: string): Promise<void> => {
        await client.delete(`/receipts/${id}`);
    },
};
