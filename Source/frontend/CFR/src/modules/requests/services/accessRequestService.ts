import { postApi } from '@app/config/appAcutisClient';
import type { SaveAccessRequestPayload } from '../types/accessRequestTypes';

const controller = 'AccessRequest';

export const saveAccessRequest = async (value: SaveAccessRequestPayload): Promise<any> => {
  try {
    return await postApi(`${controller}/SaveAccessRequest`, value);
  } catch (error: unknown) {
    if (typeof error === 'string') throw error;
    throw 'Failed to submit access request';
  }
};
