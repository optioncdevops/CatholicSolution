import axiosInstance from '@app/config/AxiosInstance';
import type { ApiError, ApiResponse } from '@app/pages/types/CommonTypes';
import type { ProductInputPayload, ProductSaveInputPayload } from '../types/productTypes';

const controller = 'Products';

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

export const saveProduct = async (payload: ProductSaveInputPayload): Promise<ApiResponse> => {
  try {
    const response = await axiosInstance.post<ApiResponse>(`${controller}/SaveProduct`, payload);
    const { statusCode, statusMessage, resultData } = response.data;
    return { statusCode, statusMessage, resultData };
  } catch (error: unknown) {
    const err = error as ApiError;
    throw err.response?.data?.statusMessage || err.message || 'Failed to save product';
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

export const deleteProduct = async (productId: number): Promise<ApiResponse> => {
  try {
    const response = await axiosInstance.delete<ApiResponse>(`${controller}/DeleteProduct`, {
      params: { productId },
    });
    const { statusCode, statusMessage, resultData } = response.data;
    return { statusCode, statusMessage, resultData };
  } catch (error: unknown) {
    const err = error as ApiError;
    throw err.response?.data?.statusMessage || err.message || 'Failed to delete product';
  }
};

export const uploadProductLogo = async (file: File): Promise<string> => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    const response = await axiosInstance.post<ApiResponse<string>>(
      `${controller}/UploadProductLogo`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data.resultData || '';
  } catch (error: unknown) {
    const err = error as ApiError;
    throw err.response?.data?.statusMessage || err.message || 'Failed to upload product logo';
  }
};

