import type { CatalogApp } from '@shared/app/types/app';
import type { PublicAccessRequestFormValues, SaveAccessRequestPayload } from '../types/accessRequestTypes';

export const formatUsPhoneNumber = (raw: string): string => {
  const digits = raw.replace(/\D/g, '').slice(0, 10);
  if (digits.length === 0) return '';
  if (digits.length < 4) return `(${digits}`;
  if (digits.length < 7) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
};

/**
 * Reads the new request id from a Portal save response. Both SaveAccessRequest and
 * SaveProductRequest return it as a plain number in resultData (older callers expected an
 * { accessRequestId } object, so that shape is still accepted).
 */
export const readSavedRequestId = (response: unknown): number => {
  const body = (response ?? {}) as Record<string, unknown>;
  const data = body.resultData ?? body.ResultData;
  if (typeof data === 'number' || typeof data === 'string') return Number(data) || 0;
  if (data && typeof data === 'object') {
    const row = data as Record<string, unknown>;
    return Number(row.accessRequestId ?? row.AccessRequestId ?? row.productRequestId ?? row.ProductRequestId ?? 0) || 0;
  }
  return 0;
};

/** Request reference shown after submitting: CS-{year}-REQ-{request id}, e.g. CS-2026-REQ-42. */
export const formatRequestReference = (requestId: number): string => {
  const prefix = `CS-${new Date().getFullYear()}-REQ`;
  return requestId > 0 ? `${prefix}-${requestId}` : prefix;
};

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
    dioceseId: values.dioceseId.trim() ? Number(values.dioceseId) : undefined,
    phone: values.phone.trim() || undefined,
    products,
  };
};
