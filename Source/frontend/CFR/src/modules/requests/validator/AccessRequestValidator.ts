import type { SaveAccessRequestPayload } from '../types/accessRequestTypes';

export const validateSaveAccessRequest = (payload: SaveAccessRequestPayload): string[] => {
  const messages: string[] = [];
  if (!payload.productId.trim()) messages.push('Product is required.');
  if (!payload.productName.trim()) messages.push('Product name is required.');
  if (!payload.requesterName.trim()) messages.push('Requester name is required.');
  if (!payload.requesterEmail.trim()) messages.push('Requester email is required.');
  return messages;
};
