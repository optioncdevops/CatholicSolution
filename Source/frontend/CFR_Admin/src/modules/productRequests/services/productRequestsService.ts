import axiosInstance from '@app/config/AxiosInstance';
import type { ApiError, ApiResponse } from '@app/pages/types/CommonTypes';
import type { ProductRequestDecisionPayload } from '../types/productRequestsTypes';

const controller = 'ProductRequest';

export const getProductRequests = async (): Promise<ApiResponse> => {
  try {
    const response = await axiosInstance.get<ApiResponse>(`${controller}/GetProductRequests`);
    const { statusCode, statusMessage, resultData } = response.data;
    return { statusCode, statusMessage, resultData };
  } catch (error: unknown) {
    const err = error as ApiError;
    throw err.response?.data?.statusMessage || err.message || 'Failed to load product requests';
  }
};

export const getProductRequestById = async (productRequestId: number): Promise<ApiResponse> => {
  try {
    const response = await axiosInstance.get<ApiResponse>(`${controller}/GetProductRequestById`, {
      params: { productRequestId },
    });
    const { statusCode, statusMessage, resultData } = response.data;
    return { statusCode, statusMessage, resultData };
  } catch (error: unknown) {
    const err = error as ApiError;
    throw err.response?.data?.statusMessage || err.message || 'Failed to load product request';
  }
};

export const approveProductRequest = async (value: ProductRequestDecisionPayload): Promise<ApiResponse> => {
  try {
    const response = await axiosInstance.put<ApiResponse>(`${controller}/ApproveProductRequest`, value);
    const { statusCode, statusMessage, resultData } = response.data;
    return { statusCode, statusMessage, resultData };
  } catch (error: unknown) {
    const err = error as ApiError;
    throw err.response?.data?.statusMessage || err.message || 'Failed to approve product request';
  }
};

export const rejectProductRequest = async (value: ProductRequestDecisionPayload): Promise<ApiResponse> => {
  try {
    const response = await axiosInstance.put<ApiResponse>(`${controller}/RejectProductRequest`, value);
    const { statusCode, statusMessage, resultData } = response.data;
    return { statusCode, statusMessage, resultData };
  } catch (error: unknown) {
    const err = error as ApiError;
    throw err.response?.data?.statusMessage || err.message || 'Failed to reject product request';
  }
};
