import axiosInstance from '@app/config/AxiosInstance';
import type { ApiError, ApiResponse } from '@app/pages/types/CommonTypes';
import { ACCESS_LEVEL_CODE, type UserRightsPendingChange } from '../types/userRightsTypes';

const controller = 'UserRights';

/**
 * `GetUserRights`/`SaveUserRights` predate this codebase's typed-DTO convention — their backing
 * stored procedures (`auth.GetRightByRoleId`, `auth.SaveUserRights`) are not checked into this
 * repo (confirmed live against the database — see
 * 016_Acutis_UserAccessVerification.sql), so the GET returns untyped Dapper rows instead of a
 * typed output DTO. `userRightsHelpers.ts` reads the confirmed real column names
 * (FeatureID/ParentId/Module/SubModule/ItemDescription/AccessRight) rather than a typed model.
 *
 * `moduleId` binds to `auth.GetRightByRoleId`'s real second parameter, `@ParentID` — its name is
 * kept as `moduleId` here to match the controller/service signature, but the values are NOT
 * "0 = show everything": `-1` = the full tree (the default), `0` = top-level modules only, and a
 * specific FeatureID = just that module's subtree.
 */
export const getUserRights = async (roleId: number, moduleId = -1): Promise<ApiResponse> => {
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
 * lists, popped one entry at a time server-side by `dbo.System_PopLongInts`. `AccessRight` is a
 * plain SQL `int`, so the three-state 0/1/2 (Denied/Access/Read Only) values pass through as
 * plain digit strings — the backend service only special-cases the literal string "On" and any
 * "undefined" substring (old jQuery-checkbox glue), neither of which a digit list ever matches.
 * A trailing comma is sent to match the stored procedure's own documented example call, even
 * though `System_PopLongInts` also tolerates a missing one.
 */
export const saveUserRights = async (roleId: number, changes: UserRightsPendingChange[]): Promise<ApiResponse> => {
  try {
    const featureId = `${changes.map((change) => change.featureId).join(',')},`;
    const accessRights = `${changes.map((change) => ACCESS_LEVEL_CODE[change.accessLevel]).join(',')},`;
    const response = await axiosInstance.post<ApiResponse>(`${controller}/SaveUserRights`, null, {
      params: { roleId, featureId, accessRights },
    });
    return response.data;
  } catch (error: unknown) {
    const err = error as ApiError;
    throw err.response?.data?.statusMessage || err.message || 'Failed to save user rights';
  }
};
