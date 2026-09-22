import type { ProductRequestFormValues } from '../validator/productRequestValidator';

export interface ProductRequestPayload {
  productName: string;
  shortName?: string;
  description: string;
  productionUrl?: string;
  navigationTarget: 'same-tab' | 'new-tab';
  features?: string[];
  logoName?: string;
  contactName: string;
  contactEmail: string;
}

export const toProductRequestPayload = (values: ProductRequestFormValues): ProductRequestPayload => ({
  productName: values.productName.trim(),
  shortName: values.shortName.trim() || undefined,
  description: values.description.trim(),
  productionUrl: values.productionUrl.trim() || undefined,
  navigationTarget: values.navigationTarget,
  features: values.features.length > 0 ? values.features : undefined,
  logoName: values.logoName.trim() || undefined,
  contactName: values.contactName.trim(),
  contactEmail: values.contactEmail.trim(),
});
