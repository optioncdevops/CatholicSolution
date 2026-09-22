import { postPortalApi } from '@app/config/appPortalClient';
import { getAcutisApiBaseUrl } from '@app/config/gateway';

const controller = 'ProductRequest';

export const saveProductRequest = async (payload: unknown): Promise<any> => {
  try {
    const response = await postPortalApi(`${controller}/SaveProductRequest`, payload);
    const statusCode = Number(response?.statusCode ?? 200);
    if (statusCode >= 400) {
      throw String(response?.statusMessage || 'Failed to submit product request');
    }
    return response;
  } catch (error: unknown) {
    if (typeof error === 'string') throw error;
    throw 'Failed to submit product request';
  }
};

// Hosted on CFR.Acutis, not CFR.Portal (unlike the rest of this file) - the saved file has to
// land in the exact folder [core].[Product].[LogoName] is served from, which only Acutis writes to.
export const uploadProductRequestLogo = async (file: File): Promise<string> => {
  try {
    const url = `${getAcutisApiBaseUrl()}${controller}/UploadProductRequestLogo`;
    const formData = new FormData();
    formData.append('File', file);
    const response = await fetch(url, { method: 'POST', body: formData });
    const text = await response.text();
    let body: Record<string, unknown> | null = null;
    if (text) {
      try {
        body = JSON.parse(text) as Record<string, unknown>;
      } catch {
        body = null;
      }
    }
    const statusCode = Number(body?.statusCode ?? body?.StatusCode ?? response.status);
    if (!response.ok || statusCode >= 400) {
      throw String(body?.statusMessage ?? body?.StatusMessage ?? 'Failed to upload logo');
    }
    return String(body?.resultData ?? body?.ResultData ?? '');
  } catch (error: unknown) {
    if (typeof error === 'string') throw error;
    throw 'Failed to upload logo';
  }
};
