import { getApi } from '@app/config/appAcutisClient';

const controller = 'Products';

export const getProducts = async (): Promise<any> => {
  try {
    const response = await getApi(`${controller}/GetProducts`);
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

