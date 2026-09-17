import axiosInstance from '@app/config/AxiosInstance';
import type { ApiError, ApiResponse } from '@app/pages/types/CommonTypes';
import type { SaveUserRolePayload } from '../types/userRolesTypes';

const controller = 'UserRoles';

export const getUserRoles = async (): Promise<ApiResponse> => {
  try {
    const response = await axiosInstance.get<ApiResponse>(`${controller}/GetUserRoles`);
    const { statusCode, statusMessage, resultData } = response.data;
    return { statusCode, statusMessage, resultData };
  } catch (error: unknown) {
    const err = error as ApiError;
    throw err.response?.data?.statusMessage || err.message || 'Failed to load user roles';
  }
};

export const getUserRoleById = async (roleId: number): Promise<ApiResponse> => {
  try {
    const response = await axiosInstance.get<ApiResponse>(`${controller}/GetUserRoleById`, {
      params: { roleId },
    });
    const { statusCode, statusMessage, resultData } = response.data;
    return { statusCode, statusMessage, resultData };
  } catch (error: unknown) {
    const err = error as ApiError;
    throw err.response?.data?.statusMessage || err.message || 'Failed to load user role';
  }
};

export const saveUserRole = async (value: SaveUserRolePayload): Promise<ApiResponse> => {
  try {
    const response = await axiosInstance.post<ApiResponse>(`${controller}/SaveUserRole`, value);
    return response.data;
  } catch (error: unknown) {
    const err = error as ApiError;
    if (err.response?.status === 409) {
      return { statusCode: 409, statusMessage: err.response?.data?.statusMessage || 'A role with this name already exists.', resultData: null };
    }
    throw err.response?.data?.statusMessage || err.message || 'Failed to save user role';
  }
};

export const updateUserRoleStatus = async (roleId: number, status: string): Promise<ApiResponse> => {
  try {
    const response = await axiosInstance.put<ApiResponse>(`${controller}/UpdateUserRoleStatus`, { roleId, status });
    const { statusCode, statusMessage, resultData } = response.data;
    return { statusCode, statusMessage, resultData };
  } catch (error: unknown) {
    const err = error as ApiError;
    throw err.response?.data?.statusMessage || err.message || 'Failed to update user role status';
  }
};

export const deleteUserRole = async (roleId: number): Promise<ApiResponse> => {
  try {
    const response = await axiosInstance.delete<ApiResponse>(`${controller}/DeleteUserRole`, {
      params: { roleId },
    });
    const { statusCode, statusMessage, resultData } = response.data;
    return { statusCode, statusMessage, resultData };
  } catch (error: unknown) {
    const err = error as ApiError;
    if (err.response?.status === 409) {
      return { statusCode: 409, statusMessage: err.response?.data?.statusMessage || 'This role is assigned to one or more users.', resultData: null };
    }
    throw err.response?.data?.statusMessage || err.message || 'Failed to delete user role';
  }
};
