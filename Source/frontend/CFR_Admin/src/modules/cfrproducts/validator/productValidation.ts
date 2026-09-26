import type { AdminApplication, ProductStatus } from '@/modules/types';

export interface ProductWarning {
  id: string;
  message: string;
}

function hostnameOf(url: string): string | null {
  try {
    const trimmed = url.trim();
    const normalized = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    return new URL(normalized).hostname.toLowerCase();
  } catch {
    return null;
  }
}

/** Requires a real-looking domain (at least one dot, alphabetic TLD of 2+ letters) — mirrors how email addresses are validated, rejecting a bare single-label host like "trytytytytyty". */
function isRealisticHostname(hostname: string): boolean {
  return /^[a-z0-9-]+(\.[a-z0-9-]+)*\.[a-z]{2,}$/i.test(hostname);
}

function protocolOf(url: string): string | null {
  try {
    return new URL(url).protocol;
  } catch {
    return null;
  }
}

function firstPartyHostname(): string | null {
  if (typeof window !== 'undefined') {
    return window.location.hostname.toLowerCase();
  }
  return null;
}

/**
 * Non-blocking data-quality and lifecycle warnings for a product, evaluated against the
 * full catalog (needed for the duplicate-domain check). Pure function — no side effects.
 */
export function getProductWarnings(app: AdminApplication, allApplications: AdminApplication[]): ProductWarning[] {
  const warnings: ProductWarning[] = [];
  const url = (app.productionUrl ?? '').trim();

  if (!url) {
    warnings.push({ id: 'missing-url', message: 'Missing production URL.' });
  } else {
    const hostname = hostnameOf(url);
    if (!hostname) {
      warnings.push({ id: 'invalid-url', message: 'Production URL is not a valid web address.' });
    } else {
      if (import.meta.env.PROD && protocolOf(url) === 'http:') {
        warnings.push({ id: 'non-https', message: 'Production URL is not HTTPS.' });
      }
      const duplicate = allApplications.find((other) => other.id !== app.id && hostnameOf((other.productionUrl ?? '').trim()) === hostname);
      if (duplicate) {
        warnings.push({ id: 'duplicate-domain', message: `Same domain as "${duplicate.name}".` });
      }
    }
  }

  if (!(app.description ?? '').trim()) {
    warnings.push({ id: 'missing-description', message: 'Missing description.' });
  }

  const firstParty = firstPartyHostname();
  if (app.ownership === 'partner' && firstParty && hostnameOf(url)?.endsWith(firstParty)) {
    warnings.push({ id: 'partner-first-party-domain', message: 'Marked as a partner product but hosted on a first-party domain.' });
  }

  return warnings;
}

export type ProductFormErrors = Partial<Record<keyof AdminApplication, string>>;

/** Validates the editable fields of a product form. Pure function, shared by every editor. */
export function validateProductForm(form: Partial<AdminApplication>): ProductFormErrors {
  const errors: ProductFormErrors = {};
  if (!form.name?.trim()) errors.name = 'Product name is required.';
  if (!form.category?.trim()) errors.category = 'Subtitle is required.';
  if (!form.description?.trim()) errors.description = 'Description is required.';
  if (!form.productSupportUser?.trim() && !form.productSupportUserName?.trim()) errors.productSupportUser = 'Product Support User is required.';
  if (!form.contactUserId?.trim() && !form.contactPersonName?.trim()) errors.contactUserId = 'Contact Person is required.';

  const productionUrl = form.productionUrl?.trim();
  if (productionUrl) {
    const hostname = hostnameOf(productionUrl);
    if (!hostname || !isRealisticHostname(hostname)) {
      errors.productionUrl = 'Enter a valid production URL.';
    }
  }

  return errors;
}

export function validateLicenseForm(values: {
  orgId: string;
  activationDate: string;
  expiryDate: string;
  remarks?: string;
}): string[] {
  const messages: string[] = [];
  if (!values.orgId) messages.push('Organization is required.');
  if (!values.activationDate) {
    messages.push('Start date is required.');
  }
  if (!values.expiryDate) {
    messages.push('Expiry date is required.');
  }

  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  if (values.activationDate && values.activationDate < today) {
    messages.push('Start date cannot be in the past.');
  }

  if (values.activationDate && values.expiryDate && values.expiryDate < values.activationDate) {
    messages.push('Expiry date cannot be earlier than start date.');
  }

  if (values.remarks && values.remarks.trim().length > 500) {
    messages.push('Remarks must not exceed 500 characters.');
  }
  return messages;
}

export const STATUS_IMPACT: Record<ProductStatus, string> = {
  active: 'The product becomes launchable and appears as active in App Hub.',
  inactive: 'The product is temporarily hidden from launch actions but stays in the registry. Existing organization assignments are preserved.',
  'coming-soon': 'The product becomes visible in App Hub as a preview with no launch action available.',
};

export const CHANGE_STATUS_DESCRIPTION =
  'Select a new availability status for this product across the platform. Changing the status updates product visibility and launch access in App Hub.';
