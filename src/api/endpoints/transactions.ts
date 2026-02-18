import client from '../client';
import { ApiResponse } from './auth';

export interface TransactionCategory {
  id: string;
  name: string;
  type: string;
  color?: string | null;
  icon?: string | null;
}

export interface TransactionBudget {
  id: string;
  userId: string;
  categoryId: string;
  name: string;
  amount: string | number;
  currency: string;
  period: string;
  startDate: string;
  endDate: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TransactionReceipt {
  id: string;
  userId: string;
  storeName: string | null;
  receiptDate: string;
  totalAmount: string | number;
  tax: string | number | null;
  imageUrl: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface TransactionReceiptItem {
  id: string;
  receiptId: string;
  name: string;
  quantity: number;
  price: string | number;
  totalPrice: string | number;
  createdAt: string;
  updatedAt: string;
  receipt?: TransactionReceipt;
}

export interface Transaction {
  id: string;
  userId: string;
  budgetId: string | null;
  categoryId: string;
  receiptItemId: string | null;
  type: 'expense' | 'income';
  amount: string | number;
  description: string | null;
  date: string;
  createdAt: string;
  updatedAt: string;
  category?: TransactionCategory;
  budget?: TransactionBudget | null;
  receiptItem?: TransactionReceiptItem | null;
}

export interface TransactionFilters {
  categoryId?: string;
  budgetId?: string;
  type?: string;
  startDate?: string;
  endDate?: string;
}

export const transactionApi = {
  getTransactions: async (filters: TransactionFilters = {}): Promise<Transaction[]> => {
    const response = await client.get<ApiResponse<Transaction[]>>('/transactions', { params: filters });
    return response.data.data;
  },
};
