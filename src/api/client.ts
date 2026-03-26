import axios, { AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '../store/authStore';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.100.158:3000/api';
export const SERVER_BASE_URL = API_URL.replace(/\/api$/, '');
const API_DEBUG = process.env.EXPO_PUBLIC_API_DEBUG === 'true' || __DEV__;
let requestCounter = 0;

// ─── Refresh-token queue ───────────────────────────────────────────────────
// While a token refresh is in-flight, new 401 responses are queued here.
// Once the refresh resolves (or fails) every queued promise is settled.
let isRefreshing = false;
type QueueEntry = { resolve: (token: string) => void; reject: (err: unknown) => void };
let refreshQueue: QueueEntry[] = [];

const processQueue = (error: unknown, newAccessToken: string | null) => {
    refreshQueue.forEach(({ resolve, reject }) => {
        if (error) {
            reject(error);
        } else {
            resolve(newAccessToken!);
        }
    });
    refreshQueue = [];
};
// ──────────────────────────────────────────────────────────────────────────

const client = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// ─── Request interceptor ──────────────────────────────────────────────────
// Attach the current access token (and debug metadata) to every outgoing request.
client.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const requestId = ++requestCounter;
        (config as any).__requestMeta = { requestId, startedAt: Date.now() };

        const { accessToken } = useAuthStore.getState();
        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }

        if (API_DEBUG) {
            console.log(
                `[API][${requestId}] -> ${String(config.method).toUpperCase()} ${config.baseURL}${config.url}`,
                { params: config.params, data: config.data },
            );
        }

        return config;
    },
    (error) => {
        if (API_DEBUG) console.log('[API][request-error]', error?.message || error);
        return Promise.reject(error);
    },
);

// ─── Response interceptor ────────────────────────────────────────────────
client.interceptors.response.use(
    (response) => {
        const meta = (response.config as any).__requestMeta;
        const durationMs = meta?.startedAt ? Date.now() - meta.startedAt : undefined;

        if (API_DEBUG) {
            console.log(
                `[API][${meta?.requestId ?? '?'}] <- ${response.status} ${String(response.config.method).toUpperCase()} ${response.config.baseURL}${response.config.url}`,
                { durationMs, data: response.data },
            );
        }

        return response;
    },
    async (error) => {
        const originalConfig: InternalAxiosRequestConfig & { _retry?: boolean } = error?.config ?? {};
        const meta = (originalConfig as any).__requestMeta;
        const durationMs = meta?.startedAt ? Date.now() - meta.startedAt : undefined;

        if (API_DEBUG) {
            console.log(
                `[API][${meta?.requestId ?? '?'}] xx ${error?.response?.status ?? 'NETWORK'} ${String(originalConfig?.method).toUpperCase()} ${originalConfig?.baseURL ?? ''}${originalConfig?.url ?? ''}`,
                { durationMs, message: error?.message, responseData: error?.response?.data },
            );
        }

        const is401 = error?.response?.status === 401;
        const isRefreshEndpoint = originalConfig?.url?.includes('/auth/refresh');
        const skipRefresh = (originalConfig as any)?.skipAuthRefresh === true;

        // ── Handle 401 with automatic token refresh ──────────────────────
        if (is401 && !originalConfig._retry && !isRefreshEndpoint && !skipRefresh) {
            // Mark the original request so it is not retried more than once
            originalConfig._retry = true;

            if (isRefreshing) {
                // Another refresh is already in-flight; queue this request and
                // resolve/reject it once the refresh completes.
                return new Promise((resolve, reject) => {
                    refreshQueue.push({
                        resolve: (newAccessToken: string) => {
                            originalConfig.headers.Authorization = `Bearer ${newAccessToken}`;
                            resolve(client(originalConfig));
                        },
                        reject,
                    });
                });
            }

            isRefreshing = true;

            const { refreshToken, signOut, updateTokens } = useAuthStore.getState();

            if (!refreshToken) {
                // No refresh token stored → the user must log in again
                isRefreshing = false;
                processQueue(new Error('No refresh token available'), null);
                await signOut();
                return Promise.reject(error);
            }

            try {
                // Dynamically import to avoid circular dependency at module load time
                const { authApi } = await import('./endpoints/auth');
                const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
                    await authApi.refresh(refreshToken);

                updateTokens(newAccessToken, newRefreshToken);

                // Retry the original request with the fresh access token
                originalConfig.headers.Authorization = `Bearer ${newAccessToken}`;

                processQueue(null, newAccessToken);
                return client(originalConfig);
            } catch (refreshError) {
                processQueue(refreshError, null);
                await signOut();
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }
        // ─────────────────────────────────────────────────────────────────

        return Promise.reject(error);
    },
);

export default client;
