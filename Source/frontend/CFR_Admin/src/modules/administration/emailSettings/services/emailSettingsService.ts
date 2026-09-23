import axiosInstance from '@app/config/AxiosInstance';
import type { ApiError, ApiResponse } from '@app/pages/types/CommonTypes';
import type { SaveEmailSettingsPayload } from '../types/emailSettingsTypes';

const controller = 'EmailSettings';

export const uploadEmailLogo = async (file: File): Promise<ApiResponse> => {
  try {
    const formData = new FormData();
    formData.append('File', file);
    const response = await axiosInstance.post<ApiResponse>(`${controller}/UploadEmailLogo`, formData, {
      transformRequest: [
        (data, headers) => {
          if (headers && typeof headers.set === 'function') {
            headers.set('Content-Type', false);
          } else if (headers) {
            delete headers['Content-Type'];
            delete headers['content-type'];
          }
          return data;
        },
      ],
    });
    return response.data;
  } catch (error: unknown) {
    const err = error as ApiError;
    throw err.response?.data?.statusMessage || err.message || 'Failed to upload email logo';
  }
};

export const removeEmailLogo = async (): Promise<ApiResponse> => {
  try {
    const response = await axiosInstance.post<ApiResponse>(`${controller}/RemoveEmailLogo`);
    return response.data;
  } catch (error: unknown) {
    const err = error as ApiError;
    throw err.response?.data?.statusMessage || err.message || 'Failed to remove email logo';
  }
};

export const getEmailSettings = async (): Promise<ApiResponse> => {
  try {
    const response = await axiosInstance.get<ApiResponse>(`${controller}/GetEmailSettings`);
    const { statusCode, statusMessage, resultData } = response.data;
    return { statusCode, statusMessage, resultData };
  } catch (error: unknown) {
    const err = error as ApiError;
    throw err.response?.data?.statusMessage || err.message || 'Failed to load email settings';
  }
};

export const saveEmailSettings = async (payload: SaveEmailSettingsPayload): Promise<ApiResponse> => {
  try {
    const response = await axiosInstance.post<ApiResponse>(`${controller}/SaveEmailSettings`, payload);
    return response.data;
  } catch (error: unknown) {
    const err = error as ApiError;
    throw err.response?.data?.statusMessage || err.message || 'Failed to save email settings';
  }
};

export const saveProductRequestNotifyUser = async (productRequestNotifyUserId: number | null): Promise<ApiResponse> => {
  try {
    const response = await axiosInstance.post<ApiResponse>(`${controller}/SaveProductRequestNotifyUser`, { productRequestNotifyUserId });
    return response.data;
  } catch (error: unknown) {
    const err = error as ApiError;
    throw err.response?.data?.statusMessage || err.message || 'Failed to save notification recipient';
  }
};

export const saveApiBaseUrl = async (apiBaseUrl: string): Promise<ApiResponse> => {
  try {
    const response = await axiosInstance.post<ApiResponse>(`${controller}/SaveApiBaseUrl`, { apiBaseUrl });
    return response.data;
  } catch (error: unknown) {
    const err = error as ApiError;
    throw err.response?.data?.statusMessage || err.message || 'Failed to save API base URL';
  }
};

// Reuses the exact same payload shape as saveEmailSettings — the backend tests the in-progress
// (possibly unsaved) SMTP fields, not necessarily what's already persisted.
export const testSmtpConnection = async (payload: SaveEmailSettingsPayload): Promise<ApiResponse> => {
  try {
    const response = await axiosInstance.post<ApiResponse>(`${controller}/TestConnection`, payload);
    return response.data;
  } catch (error: unknown) {
    const err = error as ApiError;
    throw err.response?.data?.statusMessage || err.message || 'Failed to test SMTP connection';
  }
};
