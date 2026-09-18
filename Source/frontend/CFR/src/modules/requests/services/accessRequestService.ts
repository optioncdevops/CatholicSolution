import { getPortalApi, postPortalApi } from '@app/config/appPortalClient';
import type { SaveAccessRequestPayload } from '../types/accessRequestTypes';

const controller = 'AccessRequest';

export const getHubProducts = async (requesterEmail: string): Promise<any> => {
  try {
    const response = await getPortalApi(`${controller}/GetHubProducts`, { requesterEmail });
    const statusCode = Number(response?.statusCode ?? 200);
    if (statusCode >= 400) {
      throw String(response?.statusMessage || 'Failed to load products');
    }
    return response;
  } catch (error: unknown) {
    if (typeof error === 'string') throw error;
    throw 'Failed to load products';
  }
};

export const saveAccessRequest = async (value: SaveAccessRequestPayload): Promise<any> => {
  try {
    const response = await postPortalApi(`${controller}/SaveAccessRequest`, value);
    const statusCode = Number(response?.statusCode ?? 200);
    if (statusCode >= 400) {
      throw String(response?.statusMessage || 'Failed to submit access request');
    }
    return response;
  } catch (error: unknown) {
    if (typeof error === 'string') throw error;
    throw 'Failed to submit access request';
  }
};

export const getDioceses = async (): Promise<any> => {
  try {
    const response = await getPortalApi(`${controller}/GetDioceses`);
    const statusCode = Number(response?.statusCode ?? 200);
    if (statusCode >= 400) {
      throw String(response?.statusMessage || 'Failed to load dioceses');
    }
    return response;
  } catch (error: unknown) {
    if (typeof error === 'string') throw error;
    throw 'Failed to load dioceses';
  }
};
