export interface ProductRequestFormValues {
  productName: string;
  shortName: string;
  description: string;
  productionUrl: string;
  features: string[];
  navigationTarget: 'same-tab' | 'new-tab';
  logoName: string;
  contactName: string;
  contactEmail: string;
}

export type ProductRequestFieldErrors = Partial<Record<
  'productName' | 'description' | 'productionUrl' | 'contactName' | 'contactEmail',
  string
>>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const URL_PATTERN = /^(https?:\/\/)?[a-z0-9-]+(\.[a-z0-9-]+)+([/?#].*)?$/i;
const DESCRIPTION_MAX_LENGTH = 500;

export const validateProductRequestFields = (values: ProductRequestFormValues): ProductRequestFieldErrors => {
  const errors: ProductRequestFieldErrors = {};

  if (!values.productName.trim()) errors.productName = 'Product name is required.';

  if (!values.description.trim()) errors.description = 'Description is required.';
  else if (values.description.trim().length > DESCRIPTION_MAX_LENGTH) errors.description = `Description must be ${DESCRIPTION_MAX_LENGTH} characters or fewer.`;

  if (values.productionUrl.trim() && !URL_PATTERN.test(values.productionUrl.trim())) errors.productionUrl = 'Enter a valid website URL.';

  if (!values.contactName.trim()) errors.contactName = 'Your name is required.';

  if (!values.contactEmail.trim()) errors.contactEmail = 'Your email is required.';
  else if (!EMAIL_PATTERN.test(values.contactEmail.trim())) errors.contactEmail = 'Enter a valid email address.';

  return errors;
};

export { DESCRIPTION_MAX_LENGTH };
