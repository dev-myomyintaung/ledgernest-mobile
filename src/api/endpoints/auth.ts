import client from '../client';
import { z } from 'zod';

// Define schemas for request/response validation
export const LoginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
});

export const RegisterSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
});

export type LoginRequest = z.infer<typeof LoginSchema>;
export type RegisterRequest = z.infer<typeof RegisterSchema>;

export interface User {
    id: string;
    email: string;
    firstName?: string | null;
    lastName?: string | null;
    createdAt?: string;
    updatedAt?: string;
}

export interface AuthResponse {
    token: string;
    user: User;
}

export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}

export const authApi = {
    login: async (data: LoginRequest): Promise<AuthResponse> => {
        const response = await client.post<ApiResponse<AuthResponse>>('/auth/login', data);
        return response.data.data;
    },

    register: async (data: RegisterRequest): Promise<AuthResponse> => {
        const response = await client.post<ApiResponse<AuthResponse>>('/auth/register', data);
        return response.data.data;
    },

    logout: async (): Promise<void> => {
        await client.post('/auth/logout');
    },

    getMe: async (): Promise<User> => {
        const response = await client.get<ApiResponse<User>>('/auth/me');
        return response.data.data;
    }
};
