import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import {
    authApi,
    LoginRequest,
    RegisterRequest,
    ForgotPasswordRequest,
    ResetPasswordRequest,
} from '../api/endpoints/auth';
import { useAuthStore } from '../store/authStore';

export const useLogin = () => {
    const router = useRouter();
    const queryClient = useQueryClient();
    const signIn = useAuthStore((state) => state.signIn);

    return useMutation({
        mutationFn: (data: LoginRequest) => authApi.login(data),
        onSuccess: async (data) => {
            await signIn(data.accessToken, data.refreshToken, data.user);
            queryClient.setQueryData(['user'], data.user);
            router.replace('/(tabs)');
        },
        onError: (error) => {
            console.error('Login failed:', error);
        },
    });
};

export const useRegister = () => {
    const router = useRouter();
    const queryClient = useQueryClient();
    const signIn = useAuthStore((state) => state.signIn);

    return useMutation({
        mutationFn: (data: RegisterRequest) => authApi.register(data),
        onSuccess: async (data) => {
            await signIn(data.accessToken, data.refreshToken, data.user);
            queryClient.setQueryData(['user'], data.user);
            router.replace('/(tabs)');
        },
        onError: (error) => {
            console.error('Registration failed:', error);
        },
    });
};

export const useLogout = () => {
    const router = useRouter();
    const queryClient = useQueryClient();
    const { signOut, refreshToken } = useAuthStore.getState();

    return useMutation({
        mutationFn: () => authApi.logout(refreshToken ?? undefined),
        onSuccess: async () => {
            await signOut();
            queryClient.clear();
            router.replace('/(auth)/login' as any);
        },
        onError: async () => {
            await signOut();
            queryClient.clear();
            router.replace('/(auth)/login' as any);
        },
    });
};

/**
 * Trigger a password-reset email.
 * The mutation always resolves successfully from the UI perspective
 * (the server hides whether the email exists).
 */
export const useForgotPassword = () => {
    return useMutation({
        mutationFn: (data: ForgotPasswordRequest) => authApi.forgotPassword(data),
        onError: (error) => {
            console.error('Forgot password request failed:', error);
        },
    });
};

/**
 * Submit the reset token (from the email deep-link) and a new password.
 * On success, navigate to the login screen.
 */
export const useResetPassword = () => {
    const router = useRouter();

    return useMutation({
        mutationFn: (data: ResetPasswordRequest) => authApi.resetPassword(data),
        onSuccess: () => {
            router.replace('/(auth)/login' as any);
        },
        onError: (error) => {
            console.error('Password reset failed:', error);
        },
    });
};

export const useUser = () => {
    return useQuery({
        queryKey: ['user'],
        queryFn: authApi.getMe,
    });
};
