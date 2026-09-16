import axiosInstance from '@app/config/AxiosInstance';
import type { ApiError, ApiResponse } from '@app/pages/types/CommonTypes';
import type { SaveUserPayload } from '../types/usersTypes';

const controller = 'Users';

export const getUsers = async (): Promise<ApiResponse> => {
  try {
    const response = await axiosInstance.get<ApiResponse>(`${controller}/GetUsers`);
    const { statusCode, statusMessage, resultData } = response.data;
    return { statusCode, statusMessage, resultData };
  } catch (error: unknown) {
    const err = error as ApiError;
    throw err.response?.data?.statusMessage || err.message || 'Failed to load users';
  }
};

export const getUserById = async (userId: number): Promise<ApiResponse> => {
  try {
    const response = await axiosInstance.get<ApiResponse>(`${controller}/GetUserById`, {
      params: { userId },
    });
    const { statusCode, statusMessage, resultData } = response.data;
    return { statusCode, statusMessage, resultData };
  } catch (error: unknown) {
    const err = error as ApiError;
    throw err.response?.data?.statusMessage || err.message || 'Failed to load user';
  }
};

export const getUserLookups = async (): Promise<ApiResponse> => {
  try {
    const response = await axiosInstance.get<ApiResponse>(`${controller}/GetUserLookups`);
    const { statusCode, statusMessage, resultData } = response.data;
    return { statusCode, statusMessage, resultData };
  } catch (error: unknown) {
    const err = error as ApiError;
    throw err.response?.data?.statusMessage || err.message || 'Failed to load lookups';
  }
};

export const saveUser = async (value: SaveUserPayload): Promise<ApiResponse> => {
  try {
    const response = await axiosInstance.post<ApiResponse>(`${controller}/SaveUser`, value);
    return response.data;
  } catch (error: unknown) {
    const err = error as ApiError;
    if (err.response?.status === 409) {
      return { statusCode: 409, statusMessage: err.response?.data?.statusMessage || 'A user with this email already exists.', resultData: null };
    }
    throw err.response?.data?.statusMessage || err.message || 'Failed to save user';
  }
};

export const updateUserStatus = async (userId: number, isActive: number): Promise<ApiResponse> => {
  try {
    const response = await axiosInstance.put<ApiResponse>(`${controller}/UpdateUserStatus`, { userId, isActive });
    const { statusCode, statusMessage, resultData } = response.data;
    return { statusCode, statusMessage, resultData };
  } catch (error: unknown) {
    const err = error as ApiError;
    throw err.response?.data?.statusMessage || err.message || 'Failed to update user status';
  }
};

export const deleteUser = async (userId: number): Promise<ApiResponse> => {
  try {
    const response = await axiosInstance.delete<ApiResponse>(`${controller}/DeleteUser`, {
      params: { userId },
    });
    const { statusCode, statusMessage, resultData } = response.data;
    return { statusCode, statusMessage, resultData };
  } catch (error: unknown) {
    const err = error as ApiError;
    throw err.response?.data?.statusMessage || err.message || 'Failed to delete user';
  }
};
