import client from '../client';
import { ApiResponse } from './auth';

export interface BudgetCategory {
    id: string;
    name: string;
    type: string;
    color: string | null;
    icon: string | null;
    isDefault: boolean;
}

export interface BudgetProgress {
    spent: number;
    remaining: number;
    percentage: number;
    isOverBudget: boolean;
    isNearLimit: boolean;
}

export interface Budget {
    id: string;
    userId: string;
    categoryId: string;
    name: string;
    amount: number;
    currency: string;
    period: string;
    startDate: string;
    endDate: string | null;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    category: BudgetCategory;
    progress: BudgetProgress;
}

export interface CreateBudgetRequest {
    categoryId: string;
    name: string;
    amount: number;
    currency?: string;
    period: 'daily' | 'weekly' | 'monthly' | 'yearly';
    startDate: string;
    endDate?: string;
}

export const budgetApi = {
    getBudgets: async (): Promise<Budget[]> => {
        const response = await client.get<ApiResponse<Budget[]>>('/budgets');
        return response.data.data;
    },

    getBudget: async (id: string): Promise<Budget> => {
        const response = await client.get<ApiResponse<Budget>>(`/budgets/${id}`);
        return response.data.data;
    },

    createBudget: async (data: CreateBudgetRequest): Promise<Budget> => {
        const response = await client.post<ApiResponse<Budget>>('/budgets', data);
        return response.data.data;
    },
};
