import axiosInstance from '@app/config/AxiosInstance';
import type { ApiError, ApiResponse } from '@app/pages/types/CommonTypes';
import type { UserRightsPendingChange } from '../types/userRightsTypes';

const controller = 'UserRights';

/**
 * `GetUserRights`/`SaveUserRights` predate this codebase's typed-DTO convention — their backing
 * stored procedures (`GetRightByRoleId`, `SaveUserRights`) are not checked into this repo (only
 * `auth.ModuleFeatures`/`auth.ModuleRights` DML is; see 013_Acutis_EmailSettingsMenu.sql's header
 * for the same schema-drift note), so the GET returns untyped Dapper rows instead of a typed
 * output DTO. That's a backend gap outside this page's scope — `userRightsHelpers.ts` reads the
 * response defensively across the plausible column-name casings rather than assuming one.
 */
export const getUserRights = async (roleId: number, moduleId = 0): Promise<ApiResponse> => {
  try {
    const response = await axiosInstance.get<ApiResponse>(`${controller}/GetUserRights`, {
      params: { roleId, moduleId },
    });
    const { statusCode, statusMessage, resultData } = response.data;
    return { statusCode, statusMessage, resultData };
  } catch (error: unknown) {
    const err = error as ApiError;
    throw err.response?.data?.statusMessage || err.message || 'Failed to load user rights';
  }
};

/**
 * `SaveUserRights` is a legacy bulk endpoint — everything travels as query-string parameters (no
 * request body); `featureId`/`accessRights` are parallel, comma-delimited, position-matched
 * lists. Values must be plain "1"/"0" strings: the backend service only special-cases the literal
 * string "On" and any "undefined" substring (old jQuery-checkbox glue) — anything else passes
 * through untouched, so a clean delimited list is safe.
 */
export const saveUserRights = async (roleId: number, changes: UserRightsPendingChange[]): Promise<ApiResponse> => {
  try {
    const featureId = changes.map((change) => change.featureId).join(',');
    const accessRights = changes.map((change) => (change.accessRight ? '1' : '0')).join(',');
    const response = await axiosInstance.post<ApiResponse>(`${controller}/SaveUserRights`, null, {
      params: { roleId, featureId, accessRights },
    });
    return response.data;
  } catch (error: unknown) {
    const err = error as ApiError;
    throw err.response?.data?.statusMessage || err.message || 'Failed to save user rights';
  }
};
