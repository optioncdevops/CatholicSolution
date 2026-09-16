import axiosInstance from '@app/config/AxiosInstance';
import type { ApiError, ApiResponse } from '@app/pages/types/CommonTypes';

// Hosted on the existing Users (Administration) controller, not a separate service -- Status
// here comes from auth.User.AuthOId (active/pending), independent of the Organization page's own
// Users tab (GetOrganizationUsers). Passing no orgId (or 0) returns every organization in one
// call -- no client-side fan-out needed.
const controller = 'Users';

export const getCFRUsers = async (orgId?: number, isAuth?: number, productIds?: string): Promise<ApiResponse> => {
  try {
    const params: Record<string, number | string> = {};
    if (orgId) params.orgId = orgId;
    if (isAuth !== undefined) params.isAuth = isAuth;
    if (productIds) params.productIds = productIds;

    const response = await axiosInstance.get<ApiResponse>(`${controller}/GetCFRUsers`, {
      params: Object.keys(params).length > 0 ? params : undefined,
    });
    const { statusCode, statusMessage, resultData } = response.data;
    return { statusCode, statusMessage, resultData };
  } catch (error: unknown) {
    const err = error as ApiError;
    throw err.response?.data?.statusMessage || err.message || 'Failed to load CFR users';
  }
};
