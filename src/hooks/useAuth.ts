import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { authApi, LoginRequest, RegisterRequest } from '../api/endpoints/auth';
import { useAuthStore } from '../store/authStore';

export const useLogin = () => {
    const router = useRouter();
    const queryClient = useQueryClient();
    const signIn = useAuthStore((state) => state.signIn);

    return useMutation({
        mutationFn: (data: LoginRequest) => authApi.login(data),
        onSuccess: async (data) => {
            await signIn(data.token, data.user);

            // Invalidate queries or update cache
            queryClient.setQueryData(['user'], data.user);

            // Navigate to main app
            router.replace('/(tabs)');
        },
        onError: (error) => {
            console.error('Login failed:', error);
            // Handle error (e.g., show toast)
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
            await signIn(data.token, data.user);

            queryClient.setQueryData(['user'], data.user);

            router.replace('/(tabs)');
        },
        onError: (error) => {
            console.error('Registration failed:', error);
        },
    });
};

export const useUser = () => {
    return useQuery({
        queryKey: ['user'],
        queryFn: authApi.getMe,
        // retry: false,
        // staleTime: Infinity,
    });
};
