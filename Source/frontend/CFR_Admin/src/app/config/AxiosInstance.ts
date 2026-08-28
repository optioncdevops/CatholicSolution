import axios, { isAxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';
import { ACUTIS_AUTH_CHANGED_EVENT, ACUTIS_AUTH_STORAGE_KEY } from '@shared/auth/constants/storageKeys';
import type { AcutisLoginApiResponse } from '@shared/auth/types/authTypes';

const GATEWAY_ACUTIS_API_PATH = '/acutis/api/v1/';

function resolveRestApiBaseUrl(): string {
  const origin = String(import.meta.env.VITE_APP_REST_API_BASE_URL ?? '').replace(/\/+$/, '');
  return `${origin}${GATEWAY_ACUTIS_API_PATH}`;
}

const axiosInstance = axios.create({
  baseURL: resolveRestApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

function readStoredAuth(): AcutisLoginApiResponse | null {
  try {
    const raw = localStorage.getItem(ACUTIS_AUTH_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AcutisLoginApiResponse;
  } catch {
    return null;
  }
}

function attachAuthHeader(config: InternalAxiosRequestConfig): void {
  const token = readStoredAuth()?.resultData?.user?.token;
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
}

function clearAuthAndRedirect(): void {
  localStorage.removeItem(ACUTIS_AUTH_STORAGE_KEY);
  delete axiosInstance.defaults.headers.common.Authorization;
  window.dispatchEvent(new Event(ACUTIS_AUTH_CHANGED_EVENT));
  if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
    window.location.assign('/login');
  }
}

axiosInstance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  attachAuthHeader(config);
  return config;
});

axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: unknown) => {
    if (isAxiosError(error) && error.response?.status === 401) {
      const requestUrl = String(error.config?.url ?? '').toLowerCase();
      if (!requestUrl.includes('loginauthentication')) {
        clearAuthAndRedirect();
      }
    }
    return Promise.reject(error);
  },
);

export default axiosInstance;
