import type { PublicAccessRequestFormValues, SaveAccessRequestPayload } from '../types/accessRequestTypes';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^[0-9()+\-.\s]{7,30}$/;

const FIRST_NAME_MAX_LENGTH = 50;
const LAST_NAME_MAX_LENGTH = 50;
const ORGANIZATION_NAME_MAX_LENGTH = 100;
const ADDRESS_MAX_LENGTH = 300;
const CITY_MAX_LENGTH = 50;
const STATE_MAX_LENGTH = 50;
const EMAIL_MAX_LENGTH = 256;
const PHONE_MAX_LENGTH = 30;

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
  else if (values.firstName.trim().length > FIRST_NAME_MAX_LENGTH) messages.push(`First name must be ${FIRST_NAME_MAX_LENGTH} characters or fewer.`);

  if (!values.lastName.trim()) messages.push('Last name is required.');
  else if (values.lastName.trim().length > LAST_NAME_MAX_LENGTH) messages.push(`Last name must be ${LAST_NAME_MAX_LENGTH} characters or fewer.`);

  if (!values.organizationType.trim()) messages.push('Organization type is required.');

  if (!values.organizationName.trim()) messages.push('Organization name is required.');
  else if (values.organizationName.trim().length > ORGANIZATION_NAME_MAX_LENGTH) messages.push(`Organization name must be ${ORGANIZATION_NAME_MAX_LENGTH} characters or fewer.`);

  if (!values.address.trim()) messages.push('Address is required.');
  else if (values.address.trim().length > ADDRESS_MAX_LENGTH) messages.push(`Address must be ${ADDRESS_MAX_LENGTH} characters or fewer.`);

  if (!values.city.trim()) messages.push('City is required.');
  else if (values.city.trim().length > CITY_MAX_LENGTH) messages.push(`City must be ${CITY_MAX_LENGTH} characters or fewer.`);

  if (!values.state.trim()) messages.push('State is required.');
  else if (values.state.trim().length > STATE_MAX_LENGTH) messages.push(`State must be ${STATE_MAX_LENGTH} characters or fewer.`);

  if (!values.zip.trim()) messages.push('ZIP is required.');
  else if (!/^(?:\d{5}(?:-\d{4})?|\d{6})$/.test(values.zip.trim())) messages.push('Enter a valid ZIP code.');

  if (!values.email.trim()) messages.push('Email is required.');
  else if (values.email.trim().length > EMAIL_MAX_LENGTH) messages.push(`Email must be ${EMAIL_MAX_LENGTH} characters or fewer.`);
  else if (!EMAIL_PATTERN.test(values.email.trim())) messages.push('Enter a valid email address.');

  if (values.phone.trim()) {
    if (values.phone.trim().length > PHONE_MAX_LENGTH) messages.push(`Phone number must be ${PHONE_MAX_LENGTH} characters or fewer.`);
    else if (!PHONE_PATTERN.test(values.phone.trim())) messages.push('Enter a valid phone number.');
  }

  if (productCount < 1) messages.push('Select at least one application.');
  return messages;
};
