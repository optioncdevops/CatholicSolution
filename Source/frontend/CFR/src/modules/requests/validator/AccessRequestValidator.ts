import type { PublicAccessRequestFormValues, SaveAccessRequestPayload } from '../types/accessRequestTypes';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_DIGITS_PATTERN = /^\d{10}$/;

const FIRST_NAME_MAX_LENGTH = 50;
const LAST_NAME_MAX_LENGTH = 50;
const ORGANIZATION_NAME_MAX_LENGTH = 100;
const ADDRESS_MAX_LENGTH = 300;
const CITY_MAX_LENGTH = 50;
const STATE_MAX_LENGTH = 50;
const EMAIL_MAX_LENGTH = 256;

export const validateSaveAccessRequest = (payload: SaveAccessRequestPayload): string[] => {
  const messages: string[] = [];
  if (!payload.productId.trim() && !(payload.products && payload.products.length > 0)) messages.push('Product is required.');
  if (!payload.productName.trim() && !(payload.products && payload.products.length > 0)) messages.push('Product name is required.');
  if (!payload.requesterName.trim() && !payload.firstName?.trim()) messages.push('Requester name is required.');
  if (!payload.requesterEmail.trim()) messages.push('Requester email is required.');
  return messages;
};

export type PublicAccessRequestFieldErrors = Partial<Record<
  'firstName' | 'lastName' | 'organizationType' | 'organizationName' | 'dioceseId' | 'address' | 'city' | 'state' | 'zip' | 'email' | 'phone' | 'interests' | 'consent',
  string
>>;

export const validatePublicAccessRequestFields = (values: PublicAccessRequestFormValues, productCount: number, consentGiven: boolean): PublicAccessRequestFieldErrors => {
  const errors: PublicAccessRequestFieldErrors = {};

  if (!values.firstName.trim()) errors.firstName = 'First name is required.';
  else if (values.firstName.trim().length > FIRST_NAME_MAX_LENGTH) errors.firstName = `First name must be ${FIRST_NAME_MAX_LENGTH} characters or fewer.`;

  if (!values.lastName.trim()) errors.lastName = 'Last name is required.';
  else if (values.lastName.trim().length > LAST_NAME_MAX_LENGTH) errors.lastName = `Last name must be ${LAST_NAME_MAX_LENGTH} characters or fewer.`;

  if (!values.organizationType.trim()) errors.organizationType = 'Organization type is required.';

  if (!values.organizationName.trim()) errors.organizationName = 'Organization name is required.';
  else if (values.organizationName.trim().length > ORGANIZATION_NAME_MAX_LENGTH) errors.organizationName = `Organization name must be ${ORGANIZATION_NAME_MAX_LENGTH} characters or fewer.`;

  if (!values.dioceseId.trim()) errors.dioceseId = 'Diocese is required.';

  if (!values.address.trim()) errors.address = 'Address is required.';
  else if (values.address.trim().length > ADDRESS_MAX_LENGTH) errors.address = `Address must be ${ADDRESS_MAX_LENGTH} characters or fewer.`;

  if (!values.city.trim()) errors.city = 'City is required.';
  else if (values.city.trim().length > CITY_MAX_LENGTH) errors.city = `City must be ${CITY_MAX_LENGTH} characters or fewer.`;

  if (!values.state.trim()) errors.state = 'State is required.';
  else if (values.state.trim().length > STATE_MAX_LENGTH) errors.state = `State must be ${STATE_MAX_LENGTH} characters or fewer.`;

  if (!values.zip.trim()) errors.zip = 'ZIP is required.';
  else if (!/^(?:\d{5}(?:-\d{4})?|\d{6})$/.test(values.zip.trim())) errors.zip = 'Enter a valid ZIP code.';

  if (!values.email.trim()) errors.email = 'Email is required.';
  else if (values.email.trim().length > EMAIL_MAX_LENGTH) errors.email = `Email must be ${EMAIL_MAX_LENGTH} characters or fewer.`;
  else if (!EMAIL_PATTERN.test(values.email.trim())) errors.email = 'Enter a valid email address.';

  if (!values.phone.trim()) errors.phone = 'Phone number is required.';
  else if (!PHONE_DIGITS_PATTERN.test(values.phone.replace(/\D/g, ''))) errors.phone = 'Enter a valid 10-digit phone number.';

  if (productCount < 1) errors.interests = 'Select at least one application.';

  if (!consentGiven) errors.consent = 'Please confirm the information above is accurate.';

  return errors;
};

export const validatePublicAccessRequest = (values: PublicAccessRequestFormValues, productCount: number, consentGiven: boolean): string[] =>
  Object.values(validatePublicAccessRequestFields(values, productCount, consentGiven)).filter((message): message is string => Boolean(message));
