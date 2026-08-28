import axiosInstance from '@app/config/AxiosInstance';
import type { ApiError, ApiResponse } from '@app/pages/types/CommonTypes';
import { ACUTIS_AUTH_CHANGED_EVENT, ACUTIS_AUTH_STORAGE_KEY } from '../constants/storageKeys';
import type { AcutisLoginApiResponse, LoginAuthenticationPayload } from '../types/authTypes';

const controller = 'AcutisLogin';

function applyBearerFromPayload(data: AcutisLoginApiResponse): void {
  const token = data.resultData?.user?.token;
  if (token) {
    axiosInstance.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete axiosInstance.defaults.headers.common.Authorization;
  }
}

export function persistAcutisAuth(data: AcutisLoginApiResponse): void {
  localStorage.setItem(ACUTIS_AUTH_STORAGE_KEY, JSON.stringify(data));
  applyBearerFromPayload(data);
  window.dispatchEvent(new Event(ACUTIS_AUTH_CHANGED_EVENT));
}

export function getStoredAcutisAuth(): AcutisLoginApiResponse | null {
  try {
    const raw = localStorage.getItem(ACUTIS_AUTH_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AcutisLoginApiResponse;
  } catch {
    return null;
  }
}

export function clearAcutisAuth(): void {
  localStorage.removeItem(ACUTIS_AUTH_STORAGE_KEY);
  delete axiosInstance.defaults.headers.common.Authorization;
  window.dispatchEvent(new Event(ACUTIS_AUTH_CHANGED_EVENT));
}

export function hasAcutisToken(): boolean {
  return Boolean(getStoredAcutisAuth()?.resultData?.user?.token);
}

export const loginAuthentication = async (payload: LoginAuthenticationPayload): Promise<ApiResponse> => {
  try {
    const response = await axiosInstance.post<AcutisLoginApiResponse>(`${controller}/LoginAuthentication`, payload);
    const { statusCode, statusMessage, resultData } = response.data;
    if (statusCode !== 200 || !resultData?.user?.token) {
      throw statusMessage || 'Invalid email or password.';
    }
    persistAcutisAuth(response.data);
    return { statusCode, statusMessage, resultData };
  } catch (error: unknown) {
    const err = error as ApiError;
    const apiMessage = err.response?.data?.statusMessage;
    throw (typeof error === 'string' ? error : apiMessage || err.message) || 'Failed to sign in';
  }
};
