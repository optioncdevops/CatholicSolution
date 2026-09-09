import type { CatalogApp } from '@shared/app/types/app';
import type { PublicAccessRequestFormValues, SaveAccessRequestPayload } from '../types/accessRequestTypes';

export const toSaveAccessRequestPayload = (
  app: CatalogApp,
  formValues: { name: string; email: string; sendToEmail: string; reason: string }
): SaveAccessRequestPayload => ({
  productId: String(app.productId ?? app.id).trim(),
  productName: app.name.trim(),
  requesterName: formValues.name.trim(),
  requesterEmail: formValues.email.trim(),
  sendToEmail: formValues.sendToEmail.trim() || undefined,
  comment: formValues.reason.trim() || undefined,
});

export const toPublicAccessRequestPayload = (
  values: PublicAccessRequestFormValues,
  apps: CatalogApp[],
  selectedIds: string[],
): SaveAccessRequestPayload => {
  const products = selectedIds
    .map((id) => apps.find((app) => app.id === id))
    .filter((app): app is CatalogApp => Boolean(app))
    .map((app) => ({ productId: app.id.trim(), productName: app.name.trim() }));
  const first = products[0];
  return {
    productId: first?.productId ?? '',
    productName: first?.productName ?? '',
    requesterName: `${values.firstName} ${values.lastName}`.trim(),
    requesterEmail: values.email.trim(),
    comment: values.notes.trim() || undefined,
    firstName: values.firstName.trim(),
    lastName: values.lastName.trim(),
    organizationType: values.organizationType.trim(),
    organizationName: values.organizationName.trim(),
    address: values.address.trim(),
    city: values.city.trim(),
    state: values.state.trim(),
    zip: values.zip.trim(),
    phone: values.phone.trim() || undefined,
    products,
  };
};
