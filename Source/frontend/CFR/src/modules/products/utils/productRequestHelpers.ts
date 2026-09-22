import type { SaveAccessRequestPayload } from '@/modules/requests/types/accessRequestTypes';
import type { ProductRequestFormValues } from '../validator/productRequestValidator';

const composeProductComment = (values: ProductRequestFormValues): string => {
  const lines = [
    values.shortName.trim() ? `Short name: ${values.shortName.trim()}` : null,
    `Category: ${values.category.trim()}`,
    `Description: ${values.description.trim()}`,
    values.productionUrl.trim() ? `Production URL: ${values.productionUrl.trim()}` : null,
    values.features.trim() ? `Features: ${values.features.trim()}` : null,
    `Preferred navigation: ${values.navigationTarget === 'new-tab' ? 'New tab' : 'Same tab'}`,
  ].filter((line): line is string => Boolean(line));
  return lines.join('\n');
};

export const toProductRequestPayload = (values: ProductRequestFormValues): SaveAccessRequestPayload => ({
  productId: '',
  productName: values.productName.trim(),
  requesterName: values.contactName.trim(),
  requesterEmail: values.contactEmail.trim(),
  organizationName: values.organizationName.trim() || undefined,
  comment: composeProductComment(values),
});
