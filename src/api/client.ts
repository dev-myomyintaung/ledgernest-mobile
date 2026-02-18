import axios from 'axios';
import { useAuthStore } from '../store/authStore';

// TODO: Replace with your actual API URL or load from environment variables
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.0.7:3000/api';
const API_DEBUG = process.env.EXPO_PUBLIC_API_DEBUG === 'true' || __DEV__;
let requestCounter = 0;

const client = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
client.interceptors.request.use(
    async (config) => {
        const requestId = ++requestCounter;
        (config as any).__requestMeta = {
            requestId,
            startedAt: Date.now(),
        };

        const token = useAuthStore.getState().token;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        if (API_DEBUG) {
            console.log(`[API][${requestId}] -> ${String(config.method).toUpperCase()} ${config.baseURL}${config.url}`, {
                params: config.params,
                data: config.data,
            });
        }

        return config;
    },
    (error) => {
        if (API_DEBUG) {
            console.log('[API][request-error]', error?.message || error);
        }
        return Promise.reject(error);
    }
);

// Response interceptor for global error handling
client.interceptors.response.use(
    (response) => {
        const meta = (response.config as any).__requestMeta;
        const durationMs = meta?.startedAt ? Date.now() - meta.startedAt : undefined;

        if (API_DEBUG) {
            console.log(
                `[API][${meta?.requestId ?? '?'}] <- ${response.status} ${String(response.config.method).toUpperCase()} ${response.config.baseURL}${response.config.url}`,
                {
                    durationMs,
                    data: response.data,
                }
            );
        }

        return response;
    },
    (error) => {
        const config = error?.config;
        const meta = config ? (config as any).__requestMeta : undefined;
        const durationMs = meta?.startedAt ? Date.now() - meta.startedAt : undefined;

        if (API_DEBUG) {
            console.log(
                `[API][${meta?.requestId ?? '?'}] xx ${error?.response?.status ?? 'NETWORK'} ${String(config?.method).toUpperCase()} ${config?.baseURL ?? ''}${config?.url ?? ''}`,
                {
                    durationMs,
                    message: error?.message,
                    responseData: error?.response?.data,
                }
            );
        }

        // Handle global errors like 401 Unauthorized
        if (error.response && error.response.status === 401) {
            // TODO: Handle token expiration/logout
        }
        return Promise.reject(error);
    }
);

export default client;
