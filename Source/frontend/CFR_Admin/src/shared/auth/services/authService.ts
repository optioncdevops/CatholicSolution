import axiosInstance from '@app/config/AxiosInstance';
import type { ApiError, ApiResponse } from '@app/pages/types/CommonTypes';
import { ACUTIS_AUTH_CHANGED_EVENT, ACUTIS_AUTH_STORAGE_KEY } from '../constants/storageKeys';
import type { AcutisLoginApiResponse, AcutisLoginUser, ChangePasswordPayload, ForgotPasswordPayload, LoginAuthenticationPayload, ResetPasswordPayload, UpdateProfilePayload } from '../types/authTypes';

const controller = 'AcutisLogin';
const passwordController = 'AcutisPassword';
const profileController = 'Profile';

function applyBearerFromPayload(data: AcutisLoginApiResponse): void {
  const token = data.resultData?.user?.token;
  if (token) {
    axiosInstance.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete axiosInstance.defaults.headers.common.Authorization;
  }
}

export function persistAcutisAuth(data: AcutisLoginApiResponse): void {
  localStorage.setItem(ACUTIS_AUTH_STORAGE_KEY, JSON.stringify(data));
  applyBearerFromPayload(data);
  window.dispatchEvent(new Event(ACUTIS_AUTH_CHANGED_EVENT));
}

export function getStoredAcutisAuth(): AcutisLoginApiResponse | null {
  try {
    const raw = localStorage.getItem(ACUTIS_AUTH_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AcutisLoginApiResponse;
  } catch {
    return null;
  }
}

export function clearAcutisAuth(): void {
  localStorage.removeItem(ACUTIS_AUTH_STORAGE_KEY);
  delete axiosInstance.defaults.headers.common.Authorization;
  window.dispatchEvent(new Event(ACUTIS_AUTH_CHANGED_EVENT));
}

export function hasAcutisToken(): boolean {
  return Boolean(getStoredAcutisAuth()?.resultData?.user?.token);
}

// Patches the stored JWT payload's user fields after a real profile save, and fires the same
// event AuthProvider/UserContext already listen for — so a successful save is reflected
// everywhere immediately without a second sign-in.
export function updateStoredAcutisUser(patch: Partial<AcutisLoginUser>): void {
  const stored = getStoredAcutisAuth();
  if (!stored?.resultData?.user) return;
  const next: AcutisLoginApiResponse = {
    ...stored,
    resultData: { ...stored.resultData, user: { ...stored.resultData.user, ...patch } },
  };
  localStorage.setItem(ACUTIS_AUTH_STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event(ACUTIS_AUTH_CHANGED_EVENT));
}

export const loginAuthentication = async (payload: LoginAuthenticationPayload): Promise<ApiResponse> => {
  try {
    const response = await axiosInstance.post<AcutisLoginApiResponse>(`${controller}/LoginAuthentication`, payload);
    const { statusCode, statusMessage, resultData } = response.data;
    if (statusCode !== 200 || !resultData?.user?.token) {
      throw statusMessage || 'Invalid email or password.';
    }
    persistAcutisAuth(response.data);
    return { statusCode, statusMessage, resultData };
  } catch (error: unknown) {
    const err = error as ApiError;
    const apiMessage = err.response?.data?.statusMessage;
    throw (typeof error === 'string' ? error : apiMessage || err.message) || 'Failed to sign in';
  }
};

export const forgotPassword = async (payload: ForgotPasswordPayload): Promise<ApiResponse> => {
  try {
    const response = await axiosInstance.post<ApiResponse>(`${passwordController}/ForgotPassword`, payload);
    const { statusCode, statusMessage, resultData } = response.data;
    return { statusCode, statusMessage, resultData };
  } catch (error: unknown) {
    const err = error as ApiError;
    const apiMessage = err.response?.data?.statusMessage;
    throw (typeof error === 'string' ? error : apiMessage || err.message) || 'Failed to send reset instructions.';
  }
};

export const resetPassword = async (payload: ResetPasswordPayload): Promise<ApiResponse> => {
  try {
    const response = await axiosInstance.put<ApiResponse>(`${passwordController}/ResetPassword`, payload);
    const { statusCode, statusMessage, resultData } = response.data;
    return { statusCode, statusMessage, resultData };
  } catch (error: unknown) {
    const err = error as ApiError;
    const apiMessage = err.response?.data?.statusMessage;
    throw (typeof error === 'string' ? error : apiMessage || err.message) || 'Failed to reset password.';
  }
};

export const getProfile = async (): Promise<ApiResponse> => {
  try {
    const response = await axiosInstance.get<ApiResponse>(`${profileController}/GetProfile`);
    const { statusCode, statusMessage, resultData } = response.data;
    return { statusCode, statusMessage, resultData };
  } catch (error: unknown) {
    const err = error as ApiError;
    throw err.response?.data?.statusMessage || err.message || 'Failed to load profile.';
  }
};

// Single multipart request: name/email and an optional new image (or a remove flag) are saved
// together server-side — no separate upload-then-save round trip.
export const updateProfile = async (payload: UpdateProfilePayload): Promise<ApiResponse> => {
  try {
    const formData = new FormData();
    formData.append('firstName', payload.firstName);
    formData.append('lastName', payload.lastName);
    formData.append('email', payload.email);
    if (payload.contactNumber) {
      formData.append('contactNumber', payload.contactNumber);
    }
    if (payload.profileImage) {
      formData.append('profileImage', payload.profileImage);
    } else if (payload.removeProfileImage) {
      formData.append('removeProfileImage', 'true');
    }
    const response = await axiosInstance.put<ApiResponse>(`${profileController}/UpdateProfile`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  } catch (error: unknown) {
    const err = error as ApiError;
    throw err.response?.data?.statusMessage || err.message || 'Failed to update profile.';
  }
};

export const changePassword = async (payload: ChangePasswordPayload): Promise<ApiResponse> => {
  try {
    const response = await axiosInstance.put<ApiResponse>(`${profileController}/ChangePassword`, payload);
    return response.data;
  } catch (error: unknown) {
    const err = error as ApiError;
    throw err.response?.data?.statusMessage || err.message || 'Failed to change password.';
  }
};

// Best-effort role-name lookup for display (e.g. the account menu's subtitle) — reuses the
// existing Administration/UserRoles endpoint rather than adding a role name to the JWT. Returns
// null on any failure so a lookup problem never blocks sign-in or breaks the account menu.
export const getRoleName = async (roleId: number): Promise<string | null> => {
  if (!roleId || roleId <= 0) return null;
  try {
    const response = await axiosInstance.get<ApiResponse>('UserRoles/GetUserRoleById', { params: { roleId } });
    const data = response.data.resultData as { roleName?: string } | undefined;
    return data?.roleName?.trim() || null;
  } catch {
    return null;
  }
};
