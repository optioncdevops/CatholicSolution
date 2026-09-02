import { getApi, postApi } from '@app/config/appAcutisClient';
import type { SaveAccessRequestPayload } from '../types/accessRequestTypes';

const controller = 'AccessRequest';

export const getHubProducts = async (requesterEmail: string): Promise<any> => {
  try {
    const response = await getApi(`${controller}/GetHubProducts`, { requesterEmail });
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
    return await postApi(`${controller}/SaveAccessRequest`, value);
  } catch (error: unknown) {
    if (typeof error === 'string') throw error;
    throw 'Failed to submit access request';
  }
};
