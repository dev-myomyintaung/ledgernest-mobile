import client from '../client';
import { z } from 'zod';

// ─── Request schemas ──────────────────────────────────────────────────────

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

export const ForgotPasswordSchema = z.object({
    email: z.string().email('Enter a valid email address'),
});

export const ResetPasswordSchema = z.object({
    token: z.string().min(1),
    newPassword: z.string().min(6, 'Password must be at least 6 characters'),
});

export type LoginRequest = z.infer<typeof LoginSchema>;
export type RegisterRequest = z.infer<typeof RegisterSchema>;
export type ForgotPasswordRequest = z.infer<typeof ForgotPasswordSchema>;
export type ResetPasswordRequest = z.infer<typeof ResetPasswordSchema>;

// ─── Response types ───────────────────────────────────────────────────────

export interface User {
    id: string;
    email: string;
    firstName?: string | null;
    lastName?: string | null;
    createdAt?: string;
    updatedAt?: string;
}

export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
    user: User;
}

export interface TokenPair {
    accessToken: string;
    refreshToken: string;
}

export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}

// ─── API calls ────────────────────────────────────────────────────────────

export const authApi = {
    login: async (data: LoginRequest): Promise<AuthResponse> => {
        const response = await client.post<ApiResponse<AuthResponse>>('/auth/login', data);
        return response.data.data;
    },

    register: async (data: RegisterRequest): Promise<AuthResponse> => {
        const response = await client.post<ApiResponse<AuthResponse>>('/auth/register', data);
        return response.data.data;
    },

    /**
     * Exchange a (possibly expired) access token for a fresh pair.
     * Called automatically by the Axios interceptor — you generally don't call this directly.
     */
    refresh: async (refreshToken: string): Promise<TokenPair> => {
        const response = await client.post<ApiResponse<TokenPair>>(
            '/auth/refresh',
            { refreshToken },
            { skipAuthRefresh: true } as any,
        );
        return response.data.data;
    },

    logout: async (refreshToken?: string): Promise<void> => {
        await client.post('/auth/logout', { refreshToken });
    },

    getMe: async (): Promise<User> => {
        const response = await client.get<ApiResponse<User>>('/auth/me');
        return response.data.data;
    },

    /**
     * Request a password-reset email.
     * Always resolves (server never reveals whether the email is registered).
     */
    forgotPassword: async (data: ForgotPasswordRequest): Promise<void> => {
        await client.post('/auth/forgot-password', data);
    },

    /**
     * Complete the reset using the token from the email link + the new password.
     */
    resetPassword: async (data: ResetPasswordRequest): Promise<void> => {
        await client.post('/auth/reset-password', data);
    },
};
