import client from '../client';
import { ApiResponse } from './auth';

// ── Types ──────────────────────────────────────────────────────────────────

export interface PublicUser {
    id: string;
    email: string | null;
    firstName: string | null;
    lastName: string | null;
    displayName: string | null;
    avatarUrl: string | null;
    followerCount: number;
    followingCount: number;
    isFollowing?: boolean;
    isFollowedBy?: boolean;
    isMutual?: boolean;
}

export interface UpdateProfileRequest {
    displayName?: string;
    avatarUrl?: string | null;
    isDiscoverable?: boolean;
}

// ── API ────────────────────────────────────────────────────────────────────

export const usersApi = {
    searchUsers: async (query: string): Promise<PublicUser[]> => {
        const response = await client.get<ApiResponse<PublicUser[]>>('/users/search', {
            params: { q: query },
        });
        return response.data.data;
    },

    getProfile: async (userId: string): Promise<PublicUser> => {
        const response = await client.get<ApiResponse<PublicUser>>(`/users/${userId}`);
        return response.data.data;
    },

    follow: async (userId: string): Promise<void> => {
        await client.post(`/users/${userId}/follow`);
    },

    unfollow: async (userId: string): Promise<void> => {
        await client.delete(`/users/${userId}/follow`);
    },

    getFollowing: async (): Promise<PublicUser[]> => {
        const response = await client.get<ApiResponse<PublicUser[]>>('/users/me/following');
        return response.data.data;
    },

    getFollowers: async (): Promise<PublicUser[]> => {
        const response = await client.get<ApiResponse<PublicUser[]>>('/users/me/followers');
        return response.data.data;
    },

    getMutualFollows: async (): Promise<PublicUser[]> => {
        const response = await client.get<ApiResponse<PublicUser[]>>('/users/me/mutual');
        return response.data.data;
    },

    blockUser: async (userId: string): Promise<void> => {
        await client.post(`/users/${userId}/block`);
    },

    unblockUser: async (userId: string): Promise<void> => {
        await client.delete(`/users/${userId}/block`);
    },

    updateProfile: async (data: UpdateProfileRequest): Promise<void> => {
        await client.put('/users/me', data);
    },

    uploadAvatar: async (uri: string): Promise<{ avatarUrl: string }> => {
        const filename = uri.split('/').pop() ?? 'avatar.jpg';
        const ext = filename.split('.').pop()?.toLowerCase() ?? 'jpg';
        const mimeMap: Record<string, string> = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp' };
        const type = mimeMap[ext] ?? 'image/jpeg';

        const form = new FormData();
        form.append('avatar', { uri, name: filename, type } as any);

        const response = await client.post<ApiResponse<{ avatarUrl: string }>>('/users/me/avatar', form, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data.data;
    },

    deleteAvatar: async (): Promise<void> => {
        await client.delete('/users/me/avatar');
    },
};
