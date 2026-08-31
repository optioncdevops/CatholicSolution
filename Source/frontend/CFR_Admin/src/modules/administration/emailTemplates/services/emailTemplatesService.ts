import axiosInstance from '@app/config/AxiosInstance';
import type { ApiError, ApiResponse } from '@app/pages/types/CommonTypes';
import type { SaveEmailTemplatePayload, SendTestEmailPayload } from '../types/emailTemplatesTypes';

const controller = 'EmailTemplates';

export const getEmailTemplates = async (): Promise<ApiResponse> => {
  try {
    const response = await axiosInstance.get<ApiResponse>(`${controller}/GetEmailTemplates`);
    const { statusCode, statusMessage, resultData } = response.data;
    return { statusCode, statusMessage, resultData };
  } catch (error: unknown) {
    const err = error as ApiError;
    throw err.response?.data?.statusMessage || err.message || 'Failed to load email templates';
  }
};

export const saveEmailTemplate = async (payload: SaveEmailTemplatePayload): Promise<ApiResponse> => {
  try {
    const response = await axiosInstance.post<ApiResponse>(`${controller}/SaveEmailTemplate`, payload);
    return response.data;
  } catch (error: unknown) {
    const err = error as ApiError;
    throw err.response?.data?.statusMessage || err.message || 'Failed to save email template';
  }
};

export const sendTestEmail = async (payload: SendTestEmailPayload): Promise<ApiResponse> => {
  try {
    const response = await axiosInstance.post<ApiResponse>(`${controller}/SendTestEmail`, payload);
    return response.data;
  } catch (error: unknown) {
    const err = error as ApiError;
    throw err.response?.data?.statusMessage || err.message || 'Failed to send test email';
  }
};
