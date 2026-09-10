import axiosInstance from '@app/config/AxiosInstance';
import type { ApiError, ApiResponse } from '@app/pages/types/CommonTypes';

const controller = 'Dashboard';

/**
 * Fetches the authoritative dashboard summary (platform KPIs, entitlement-integrity metrics, and
 * trend events) for the given date range — startDate/endDate are ISO datetime strings (UTC),
 * scoping the trend-events result set server-side rather than fetching unbounded history and
 * filtering it client-side.
 */
export const getDashboardSummary = async (startDate: string, endDate: string): Promise<ApiResponse> => {
  try {
    const response = await axiosInstance.get<ApiResponse>(`${controller}/GetDashboardSummary`, {
      params: { startDate, endDate },
    });
    const { statusCode, statusMessage, resultData } = response.data;
    return { statusCode, statusMessage, resultData };
  } catch (error: unknown) {
    const err = error as ApiError;
    throw err.response?.data?.statusMessage || err.message || 'Failed to load dashboard summary';
  }
};

/**
 * Fetches the actual flagged records behind one entitlement-integrity check (one of the keys
 * DashboardKpiOutput/DashboardIntegrityOutput expose — see backend DashboardService's
 * SupportedIntegrityIssueKeys), so a Priority Alerts "Review" click can show and link to the
 * exact organizations/products/members instead of a raw count.
 */
export const getIntegrityIssueDetail = async (issueKey: string): Promise<ApiResponse> => {
  try {
    const response = await axiosInstance.get<ApiResponse>(`${controller}/GetIntegrityIssueDetail`, {
      params: { issueKey },
    });
    const { statusCode, statusMessage, resultData } = response.data;
    return { statusCode, statusMessage, resultData };
  } catch (error: unknown) {
    const err = error as ApiError;
    throw err.response?.data?.statusMessage || err.message || 'Failed to load issue detail';
  }
};
