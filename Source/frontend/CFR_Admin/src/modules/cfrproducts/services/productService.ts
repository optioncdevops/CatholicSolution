import axiosInstance from '@app/config/AxiosInstance';
import { isAxiosError } from 'axios';
import type { ApiError, ApiResponse } from '@app/pages/types/CommonTypes';
import type { ProductInputPayload, ProductLicenseInputPayload } from '../types/productTypes';

const controller = 'Products';

function readUploadedLogoPath(resultData: unknown): string | null {
  if (typeof resultData === 'string' && resultData.trim()) {
    return resultData.trim();
  }
  if (resultData && typeof resultData === 'object') {
    const record = resultData as Record<string, unknown>;
    const nested = record.resultData ?? record.ResultData;
    if (typeof nested === 'string' && nested.trim()) {
      return nested.trim();
    }
  }
  return null;
}

export const getProducts = async (): Promise<ApiResponse> => {
  try {
    const response = await axiosInstance.get<ApiResponse>(`${controller}/GetProducts`);
    const { statusCode, statusMessage, resultData } = response.data;
    return { statusCode, statusMessage, resultData };
  } catch (error: unknown) {
    const err = error as ApiError;
    throw err.response?.data?.statusMessage || err.message || 'Failed to load products';
  }
};

export const getProductById = async (productId: number): Promise<ApiResponse> => {
  try {
    const response = await axiosInstance.get<ApiResponse>(`${controller}/GetProductById`, {
      params: { productId },
    });
    const { statusCode, statusMessage, resultData } = response.data;
    return { statusCode, statusMessage, resultData };
  } catch (error: unknown) {
    const err = error as ApiError;
    throw err.response?.data?.statusMessage || err.message || 'Failed to fetch product';
  }
};

export const getProductCustomers = async (productId: number, signal?: AbortSignal): Promise<ApiResponse> => {
  try {
    const response = await axiosInstance.get<ApiResponse>(`${controller}/GetProductCustomers`, {
      params: { productId },
      signal,
    });
    const { statusCode, statusMessage, resultData } = response.data;
    return { statusCode, statusMessage, resultData };
  } catch (error: unknown) {
    if (isAxiosError(error) && error.code === 'ERR_CANCELED') {
      throw error;
    }
    const err = error as ApiError;
    throw err.response?.data?.statusMessage || err.message || 'Failed to fetch product customers';
  }
};

export const getProductAssignmentSummary = async (): Promise<ApiResponse> => {
  try {
    const response = await axiosInstance.get<ApiResponse>(`${controller}/GetProductAssignmentSummary`);
    const { statusCode, statusMessage, resultData } = response.data;
    return { statusCode, statusMessage, resultData };
  } catch (error: unknown) {
    const err = error as ApiError;
    throw err.response?.data?.statusMessage || err.message || 'Failed to fetch product assignment summary';
  }
};

export const getProductContactUsers = async (): Promise<ApiResponse> => {
  try {
    const response = await axiosInstance.get<ApiResponse>('Users/GetUsers');
    const { statusCode, statusMessage, resultData } = response.data;
    return { statusCode, statusMessage, resultData };
  } catch (error: unknown) {
    const err = error as ApiError;
    throw err.response?.data?.statusMessage || err.message || 'Failed to load contact persons';
  }
};

export const getLicenseDetails = async (productId: number): Promise<ApiResponse> => {
  try {
    const response = await axiosInstance.get<ApiResponse>(`${controller}/GetLicenseDetails`, {
      params: { productId },
    });
    const { statusCode, statusMessage, resultData } = response.data;
    return { statusCode, statusMessage, resultData };
  } catch (error: unknown) {
    const err = error as ApiError;
    throw err.response?.data?.statusMessage || err.message || 'Failed to fetch license details';
  }
};


export const createLicense = async (payload: ProductLicenseInputPayload): Promise<ApiResponse> => {
  try {
    const response = await axiosInstance.post<ApiResponse>(`${controller}/CreateLicense`, payload);
    const { statusCode, statusMessage, resultData } = response.data;
    return { statusCode, statusMessage, resultData };
  } catch (error: unknown) {
    const err = error as ApiError;
    if (err.response?.status === 409) {
      return { statusCode: 409, statusMessage: err.response?.data?.statusMessage || 'A license has already been created for this duration.', resultData: null };
    }
    throw err.response?.data?.statusMessage || err.message || 'Failed to create license';
  }
};

export const updateLicense = async (payload: ProductLicenseInputPayload & { licenseId: number }): Promise<ApiResponse> => {
  try {
    const response = await axiosInstance.put<ApiResponse>(`${controller}/UpdateLicense`, payload);
    const { statusCode, statusMessage, resultData } = response.data;
    return { statusCode, statusMessage, resultData };
  } catch (error: unknown) {
    const err = error as ApiError;
    if (err.response?.status === 409) {
      return { statusCode: 409, statusMessage: err.response?.data?.statusMessage || 'A license has already been created for this duration.', resultData: null };
    }
    throw err.response?.data?.statusMessage || err.message || 'Failed to update license';
  }
};


export const updateProduct = async (payload: ProductInputPayload): Promise<ApiResponse> => {
  try {
    const response = await axiosInstance.put<ApiResponse>(`${controller}/UpdateProduct`, payload);
    const { statusCode, statusMessage, resultData } = response.data;
    return { statusCode, statusMessage, resultData };
  } catch (error: unknown) {
    const err = error as ApiError;
    throw err.response?.data?.statusMessage || err.message || 'Failed to update product';
  }
};



export const uploadProductLogo = async (file: File, productId: number): Promise<string> => {
  try {
    const formData = new FormData();
    formData.append('File', file);
    formData.append('ProductId', String(productId));
    const response = await axiosInstance.put<ApiResponse<string>>(
      `${controller}/UpdateProductLogo`,
      formData,
      {
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
      },
    );
    const uploadedPath = readUploadedLogoPath(response.data.resultData);
    if (!uploadedPath) {
      throw 'Failed to upload product logo';
    }
    return uploadedPath;
  } catch (error: unknown) {
    const err = error as ApiError;
    throw err.response?.data?.statusMessage || err.message || 'Failed to upload product logo';
  }
};

