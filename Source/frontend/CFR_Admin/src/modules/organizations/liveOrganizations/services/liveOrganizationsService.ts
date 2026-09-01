import axiosInstance from '@app/config/AxiosInstance';
import type { ApiError, ApiResponse } from '@app/pages/types/CommonTypes';
import type { AssignLiveOrganizationProductPayload, CreateLiveOrganizationPayload, UpdateLiveOrganizationPayload } from '../types/liveOrganizationTypes';

const controller = 'Organization';

export const getLiveOrganizations = async (): Promise<ApiResponse> => {
  try {
    const response = await axiosInstance.get<ApiResponse>(`${controller}/GetOrganizations`);
    const { statusCode, statusMessage, resultData } = response.data;
    return { statusCode, statusMessage, resultData };
  } catch (error: unknown) {
    const err = error as ApiError;
    throw err.response?.data?.statusMessage || err.message || 'Failed to load organizations';
  }
};

export const getLiveOrganizationById = async (orgId: number): Promise<ApiResponse> => {
  try {
    const response = await axiosInstance.get<ApiResponse>(`${controller}/GetOrganizationById`, {
      params: { orgId },
    });
    const { statusCode, statusMessage, resultData } = response.data;
    return { statusCode, statusMessage, resultData };
  } catch (error: unknown) {
    const err = error as ApiError;
    throw err.response?.data?.statusMessage || err.message || 'Failed to load organization';
  }
};

export const updateLiveOrganization = async (payload: UpdateLiveOrganizationPayload): Promise<ApiResponse> => {
  try {
    const response = await axiosInstance.put<ApiResponse>(`${controller}/UpdateOrganization`, payload);
    return response.data;
  } catch (error: unknown) {
    const err = error as ApiError;
    throw err.response?.data?.statusMessage || err.message || 'Failed to update organization';
  }
};

export const createLiveOrganization = async (payload: CreateLiveOrganizationPayload): Promise<ApiResponse> => {
  try {
    const response = await axiosInstance.post<ApiResponse>(`${controller}/CreateOrganization`, payload);
    return response.data;
  } catch (error: unknown) {
    const err = error as ApiError;
    throw err.response?.data?.statusMessage || err.message || 'Failed to create organization';
  }
};

export const getLiveOrganizationUsers = async (orgId: number): Promise<ApiResponse> => {
  try {
    const response = await axiosInstance.get<ApiResponse>(`${controller}/GetOrganizationUsers`, {
      params: { orgId },
    });
    const { statusCode, statusMessage, resultData } = response.data;
    return { statusCode, statusMessage, resultData };
  } catch (error: unknown) {
    const err = error as ApiError;
    throw err.response?.data?.statusMessage || err.message || 'Failed to load organization users';
  }
};

export const getLiveOrganizationProducts = async (orgId: number): Promise<ApiResponse> => {
  try {
    const response = await axiosInstance.get<ApiResponse>(`${controller}/GetOrganizationProducts`, {
      params: { orgId },
    });
    const { statusCode, statusMessage, resultData } = response.data;
    return { statusCode, statusMessage, resultData };
  } catch (error: unknown) {
    const err = error as ApiError;
    throw err.response?.data?.statusMessage || err.message || 'Failed to load organization products';
  }
};

export const getAssignableLiveOrganizationProducts = async (orgId: number): Promise<ApiResponse> => {
  try {
    const response = await axiosInstance.get<ApiResponse>(`${controller}/GetAssignableProducts`, {
      params: { orgId },
    });
    const { statusCode, statusMessage, resultData } = response.data;
    return { statusCode, statusMessage, resultData };
  } catch (error: unknown) {
    const err = error as ApiError;
    throw err.response?.data?.statusMessage || err.message || 'Failed to load assignable products';
  }
};

export const assignLiveOrganizationProduct = async (payload: AssignLiveOrganizationProductPayload): Promise<ApiResponse> => {
  try {
    const response = await axiosInstance.post<ApiResponse>(`${controller}/AssignOrganizationProduct`, payload);
    return response.data;
  } catch (error: unknown) {
    const err = error as ApiError;
    throw err.response?.data?.statusMessage || err.message || 'Failed to assign product';
  }
};

export const removeLiveOrganizationProduct = async (orgId: number, productId: number): Promise<ApiResponse> => {
  try {
    const response = await axiosInstance.delete<ApiResponse>(`${controller}/RemoveOrganizationProduct`, {
      params: { orgId, productId },
    });
    return response.data;
  } catch (error: unknown) {
    const err = error as ApiError;
    throw err.response?.data?.statusMessage || err.message || 'Failed to remove product';
  }
};
