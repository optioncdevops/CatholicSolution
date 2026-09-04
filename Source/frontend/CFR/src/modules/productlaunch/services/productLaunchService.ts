import { getPortalApi, postPortalApi } from '@app/config/appPortalClient';
import type { ProductLaunchApiEnvelope, ProductLaunchResult } from '../types/productLaunchTypes';

const controller = 'CFRLaunch';

export const getAssignedProducts = async (): Promise<ProductLaunchApiEnvelope> => {
  const response = await getPortalApi(`${controller}/GetAssignedProducts`);
  const statusCode = Number(response.statusCode ?? 200);
  if (statusCode >= 400 && statusCode !== 204) {
    throw String(response.statusMessage || 'Failed to load assigned products');
  }
  return response;
};

export const launchProduct = async (productId: number): Promise<ProductLaunchResult> => {
  const response = await postPortalApi(`${controller}/LaunchProduct`, { productId });
  const statusCode = Number(response.statusCode ?? 200);
  if (statusCode >= 400) {
    throw String(response.statusMessage || 'Failed to launch product');
  }
  const payload = (response.resultData ?? {}) as Record<string, unknown>;
  const launchUrl = String(payload.launchUrl ?? payload.LaunchUrl ?? '').trim();
  if (!launchUrl) {
    throw 'Failed to launch product';
  }
  return { launchUrl };
};
