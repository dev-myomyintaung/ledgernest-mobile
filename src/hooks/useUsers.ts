import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { usersApi, PublicUser, UpdateProfileRequest } from '../api/endpoints/users';

// ── Queries ────────────────────────────────────────────────────────────────

export const useUserSearch = (query: string) => {
    return useQuery({
        queryKey: ['users', 'search', query],
        queryFn: () => usersApi.searchUsers(query),
        enabled: query.trim().length >= 1,
        staleTime: 30_000,
    });
};

export const useUserProfile = (userId: string) => {
    return useQuery({
        queryKey: ['users', userId],
        queryFn: () => usersApi.getProfile(userId),
        enabled: !!userId,
    });
};

export const useFollowing = () => {
    return useQuery({
        queryKey: ['users', 'following'],
        queryFn: usersApi.getFollowing,
    });
};

export const useMutualFollows = () => {
    return useQuery({
        queryKey: ['users', 'mutual'],
        queryFn: usersApi.getMutualFollows,
    });
};

export const useFollowers = () => {
    return useQuery({
        queryKey: ['users', 'followers'],
        queryFn: usersApi.getFollowers,
    });
};

// ── Mutations ──────────────────────────────────────────────────────────────

export const useFollow = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (userId: string) => usersApi.follow(userId),
        onSuccess: (_data, userId) => {
            queryClient.invalidateQueries({ queryKey: ['users', 'following'] });
            queryClient.invalidateQueries({ queryKey: ['users', 'followers'] });
            queryClient.invalidateQueries({ queryKey: ['users', 'mutual'] });
            queryClient.invalidateQueries({ queryKey: ['users', userId] });
            queryClient.invalidateQueries({ queryKey: ['users', 'search'] });
        },
    });
};

export const useUnfollow = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (userId: string) => usersApi.unfollow(userId),
        onSuccess: (_data, userId) => {
            queryClient.invalidateQueries({ queryKey: ['users', 'following'] });
            queryClient.invalidateQueries({ queryKey: ['users', 'followers'] });
            queryClient.invalidateQueries({ queryKey: ['users', 'mutual'] });
            queryClient.invalidateQueries({ queryKey: ['users', userId] });
            queryClient.invalidateQueries({ queryKey: ['users', 'search'] });
        },
    });
};

export const useBlockUser = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (userId: string) => usersApi.blockUser(userId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
    });
};

export const useUpdateProfile = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: UpdateProfileRequest) => usersApi.updateProfile(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['me'] });
        },
    });
};

export const useUploadAvatar = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (uri: string) => usersApi.uploadAvatar(uri),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['me'] });
        },
    });
};

export const useDeleteAvatar = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: () => usersApi.deleteAvatar(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['me'] });
        },
    });
};
