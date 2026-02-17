import client from '../client';
import { ApiResponse } from './auth';

export interface Category {
    id: string;
    userId?: string | null;
    name: string;
    type: string; // 'expense' | 'income'
    color?: string | null;
    icon?: string | null;
    isDefault: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreateCategoryRequest {
    name: string;
    type: string;
    color?: string;
    icon?: string;
    isDefault?: boolean;
}

export interface UpdateCategoryRequest {
    name?: string;
    type?: string;
    color?: string;
    icon?: string;
    isDefault?: boolean;
}

export const categoryApi = {
    getCategories: async (): Promise<Category[]> => {
        const response = await client.get<ApiResponse<Category[]>>('/categories');
        return response.data.data;
    },

    createCategory: async (data: CreateCategoryRequest): Promise<Category> => {
        const response = await client.post<ApiResponse<Category>>('/categories', data);
        return response.data.data;
    },

    updateCategory: async (id: string, data: UpdateCategoryRequest): Promise<Category> => {
        const response = await client.put<ApiResponse<Category>>(`/categories/${id}`, data);
        return response.data.data;
    },

    deleteCategory: async (id: string): Promise<void> => {
        await client.delete(`/categories/${id}`);
    }
};
