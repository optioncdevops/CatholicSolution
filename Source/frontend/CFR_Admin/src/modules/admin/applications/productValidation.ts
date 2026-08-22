import type { AdminApplication } from '../types';

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

/**
 * Non-blocking data-quality and lifecycle warnings for a product, evaluated against the
 * full catalog (needed for the duplicate-domain check). Pure function — no side effects.
 */
export function getProductWarnings(app: AdminApplication, allApplications: AdminApplication[]): ProductWarning[] {
  const warnings: ProductWarning[] = [];
  const url = app.productionUrl.trim();

  if (!url) {
    warnings.push({ id: 'missing-url', message: 'Missing production URL.' });
  } else {
    const hostname = hostnameOf(url);
    if (!hostname) {
      warnings.push({ id: 'invalid-url', message: 'Production URL is not a valid web address.' });
    } else {
      if (url.startsWith('http://')) {
        warnings.push({ id: 'non-https', message: 'Production URL is not HTTPS.' });
      }
      const duplicate = allApplications.find((other) => other.id !== app.id && hostnameOf(other.productionUrl.trim()) === hostname);
      if (duplicate) {
        warnings.push({ id: 'duplicate-domain', message: `Same domain as "${duplicate.name}".` });
      }
    }
  }

  if (!app.description.trim()) {
    warnings.push({ id: 'missing-description', message: 'Missing description.' });
  }

  if (app.status === 'archived' && app.visibility === 'public') {
    warnings.push({ id: 'archived-visible', message: 'Archived product is still marked public and may appear in the launcher.' });
  }

  if (app.ownership === 'partner' && hostnameOf(url)?.endsWith('optioncapp.com')) {
    warnings.push({ id: 'partner-first-party-domain', message: 'Marked as a partner product but hosted on a first-party (optioncapp.com) domain.' });
  }

  return warnings;
}

/** Whether the current status allows the product to be launched directly from App Hub. */
export function isLaunchable(status: AdminApplication['status']) {
  return status === 'active';
}

export type ProductActionKind = 'launch' | 'request' | 'preview-only' | 'unavailable';

/**
 * The one correct App Hub action per status — derived, not stored, so an invalid combination
 * (e.g. an Archived product exposing a Launch button) can't exist in the UI.
 */
export function resolveProductAction(status: AdminApplication['status']): { kind: ProductActionKind; label: string } {
  switch (status) {
    case 'active': return { kind: 'launch', label: 'Launch' };
    case 'on-request': return { kind: 'request', label: 'Request access' };
    case 'coming-soon': return { kind: 'preview-only', label: 'Coming soon' };
    case 'inactive': return { kind: 'unavailable', label: 'Unavailable' };
    case 'archived': return { kind: 'unavailable', label: 'Archived' };
  }
}

export const STATUS_IMPACT: Record<AdminApplication['status'], string> = {
  active: 'The product becomes launchable and appears as active in App Hub.',
  inactive: 'The product is temporarily hidden from launch actions but stays in the registry. Existing organization assignments are preserved.',
  'coming-soon': 'The product becomes visible in App Hub as a preview with no launch action available.',
  'on-request': 'The product requires an approved access request before an organization can use it.',
  archived: 'The product is removed from normal product listings. Existing assignments and access history are preserved but the product is treated as retired.',
};
