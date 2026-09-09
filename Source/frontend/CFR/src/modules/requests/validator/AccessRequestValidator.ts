import type { PublicAccessRequestFormValues, SaveAccessRequestPayload } from '../types/accessRequestTypes';

export const validateSaveAccessRequest = (payload: SaveAccessRequestPayload): string[] => {
  const messages: string[] = [];
  if (!payload.productId.trim() && !(payload.products && payload.products.length > 0)) messages.push('Product is required.');
  if (!payload.productName.trim() && !(payload.products && payload.products.length > 0)) messages.push('Product name is required.');
  if (!payload.requesterName.trim() && !payload.firstName?.trim()) messages.push('Requester name is required.');
  if (!payload.requesterEmail.trim()) messages.push('Requester email is required.');
  return messages;
};

export const validatePublicAccessRequest = (values: PublicAccessRequestFormValues, productCount: number): string[] => {
  const messages: string[] = [];
  if (!values.firstName.trim()) messages.push('First name is required.');
  if (!values.lastName.trim()) messages.push('Last name is required.');
  if (!values.organizationType.trim()) messages.push('Organization type is required.');
  if (!values.organizationName.trim()) messages.push('Organization name is required.');
  if (!values.address.trim()) messages.push('Address is required.');
  if (!values.city.trim()) messages.push('City is required.');
  if (!values.state.trim()) messages.push('State is required.');
  if (!values.zip.trim()) messages.push('ZIP is required.');
  else if (!/^(?:\d{5}(?:-\d{4})?|\d{6})$/.test(values.zip.trim())) messages.push('Enter a valid ZIP code.');
  if (!values.email.trim()) messages.push('Email is required.');
  if (productCount < 1) messages.push('Select at least one application.');
  return messages;
};
