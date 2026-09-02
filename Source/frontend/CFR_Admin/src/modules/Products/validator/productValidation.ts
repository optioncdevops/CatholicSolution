import type { AdminApplication, ProductStatus } from '@/modules/types';

export interface ProductWarning {
  id: string;
  message: string;
}

function hostnameOf(url: string): string | null {
  try {
    return new URL(url).hostname.toLowerCase();
  } catch {
    return null;
  }
}

function protocolOf(url: string): string | null {
  try {
    return new URL(url).protocol;
  } catch {
    return null;
  }
}

function firstPartyHostname(): string | null {
  const configured = import.meta.env.VITE_APP_HUB_URL || import.meta.env.VITE_APP_REST_API_BASE_URL;
  if (configured) {
    return hostnameOf(configured);
  }
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
  if (form.productionUrl?.trim()) {
    const isValidUrl = (() => {
      try {
        const url = new URL(form.productionUrl.trim());
        return url.protocol === 'http:' || url.protocol === 'https:';
      } catch {
        return false;
      }
    })();
    if (!isValidUrl) errors.productionUrl = 'Enter a valid URL.';
  }
  return errors;
}

export function validateLicenseForm(values: {
  title: string;
  orgId: string;
  activationDate: string;
  expiryDate: string;
}): string[] {
  const messages: string[] = [];
  if (!values.title.trim()) messages.push('Title is required.');
  if (!values.orgId) messages.push('Customer is required.');
  if (!values.activationDate) messages.push('Start date is required.');
  if (!values.expiryDate) messages.push('Expiry date is required.');
  return messages;
}

/** Whether the current status allows the product to be launched directly from App Hub. */
export function isLaunchable(status: ProductStatus) {
  return status === 'active';
}

export type ProductActionKind = 'launch' | 'preview-only' | 'unavailable';

/**
 * The one correct App Hub action per status — derived, not stored, so an invalid combination
 * (e.g. an Inactive product exposing a Launch button) can't exist in the UI.
 */
export function resolveProductAction(status: ProductStatus): { kind: ProductActionKind; label: string } {
  switch (status) {
    case 'active': return { kind: 'launch', label: 'Launch' };
    case 'coming-soon': return { kind: 'preview-only', label: 'Coming soon' };
    case 'inactive': return { kind: 'unavailable', label: 'Unavailable' };
  }
}

export const STATUS_IMPACT: Record<ProductStatus, string> = {
  active: 'The product becomes launchable and appears as active in App Hub.',
  inactive: 'The product is temporarily hidden from launch actions but stays in the registry. Existing organization assignments are preserved.',
  'coming-soon': 'The product becomes visible in App Hub as a preview with no launch action available.',
};
