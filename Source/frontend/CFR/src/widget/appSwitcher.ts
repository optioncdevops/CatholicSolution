/**
 * CFR App Switcher — standalone embeddable widget.
 *
 * Any external Catholic Solutions product (e.g. optionc-sms) renders the CFR
 * app-switcher with just:
 *
 *   <script src="https://<cfr-origin-for-that-env>/integrations/app-switcher/app-switcher.js" defer></script>
 *
 * No data attributes, globals, or build-time dependency on this repo required.
 * If the host page has an element with id="cfr-app-switcher-slot" (e.g. an
 * empty <div> placed inline in its own header icon row), the widget renders
 * its icon inside that slot, sized/colored to inherit the surrounding icons'
 * styling (currentColor). Otherwise it falls back to a floating corner button.
 *
 * The switcher only ever appears for a browser that is also logged into CFR
 * itself — it never shows for a user who signed into the host app directly.
 * To determine that with zero code required in the host app, this widget
 * opens a hidden iframe at CFR's own origin (session-check.html), which reads
 * a dedicated localStorage key (cfr_app_switcher_session) holding the
 * CFR-signed Portal JWT that CFR's own login flow writes after exchanging an
 * Auth0 login for it (see auth0Session.ts, persistAuth0Session, and
 * PortalLoginController.ExchangeAuth0Token on the backend) - not the raw
 * Auth0 SDK session - and reports the result back via postMessage. See
 * docs/APP_SWITCHER.md for the full design and its tradeoffs.
 *
 * The CFR.Gateway origin this bundle calls is baked in at CFR's own build
 * time (see vite.widget.config.ts, __CFR_GATEWAY_ORIGIN__) from that build
 * mode's VITE_APP_REST_API_BASE_URL - the same var CFR's own app reads - so
 * dev vs. pilot vs. staging vs. live is just "which CFR host serves the
 * script tag." Once a CFR session is confirmed, it calls
 * {gatewayOrigin}/portal/api/v1/CFRLaunch/GetAssignedProducts with that
 * session's token to list only the apps assigned to that member/org.
 */

declare const __CFR_GATEWAY_ORIGIN__: string;

// Captured synchronously at script-execution time, before any async gap -
// document.currentScript is only valid during that initial (sync) run, even
// with `defer`. This gives us "where was this widget itself loaded from,"
// i.e. the CFR app's own origin, distinct from the API gateway origin above.
const SELF_SCRIPT_SRC = (document.currentScript as HTMLScriptElement | null)?.src ?? '';

type AssignedProductRow = {
  productId: number;
  productName: string;
  subCategoryName?: string | null;
  baseUrl?: string | null;
  logoUrl?: string | null;
  isActive: boolean;
  hubSection: string;
  isDeleted?: boolean;
};

/** Normalized shape the render layer works with, independent of the API DTO. */
type SwitcherApp = {
  productId: number;
  name: string;
  subCategory?: string;
  externalUrl: string;
  logoUrl?: string;
};

type ApiEnvelope<T> = {
  statusCode?: number;
  statusMessage?: string;
  resultData?: T;
};

type SessionCheckMessage =
  | { source: 'cfr-app-switcher'; loggedIn: false }
  | { source: 'cfr-app-switcher'; loggedIn: true; token: string };

const CLASS_PREFIX = 'cfrsw';
const SLOT_ID = 'cfr-app-switcher-slot';
const ASSIGNED_PRODUCTS_ENDPOINT_PATH = '/portal/api/v1/CFRLaunch/GetAssignedProducts';
const SESSION_CHECK_TIMEOUT_MS = 4000;
const SLOT_WAIT_TIMEOUT_MS = 4000;

const TILE_COLORS = [
  '#4F46E5', '#059669', '#DC2626', '#D97706', '#0EA5E9',
  '#7C3AED', '#DB2777', '#0D9488', '#475569', '#EA580C',
];

function hashIndex(value: string, size: number): number {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }
  return hash % size;
}

function tileColorFor(app: SwitcherApp): string {
  return TILE_COLORS[hashIndex(String(app.productId || app.name || 'app'), TILE_COLORS.length)];
}

function selfOrigin(): string | null {
  if (!SELF_SCRIPT_SRC) return null;
  try {
    return new URL(SELF_SCRIPT_SRC).origin;
  } catch {
    return null;
  }
}

function appHubUrl(): string | null {
  const origin = selfOrigin();
  return origin ? `${origin}/apps` : null;
}

function resolveLogoUrl(apiBase: string, logoUrl: string): string {
  const trimmed = logoUrl.trim();
  if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith('data:')) return trimmed;
  return `${apiBase}${trimmed.startsWith('/') ? '' : '/'}${trimmed}`;
}

function isLaunchable(row: AssignedProductRow): boolean {
  return (
    Boolean(row) &&
    row.isDeleted !== true &&
    row.isActive === true &&
    row.hubSection === 'your' &&
    Boolean(row.baseUrl && row.baseUrl.trim())
  );
}

function toSwitcherApp(apiBase: string, row: AssignedProductRow): SwitcherApp {
  return {
    productId: row.productId,
    name: row.productName,
    subCategory: (row.subCategoryName ?? '').trim() || undefined,
    externalUrl: (row.baseUrl ?? '').trim(),
    logoUrl: row.logoUrl && row.logoUrl.trim() ? resolveLogoUrl(apiBase, row.logoUrl.trim()) : undefined,
  };
}

/**
 * Opens session-check.html (CFR's own origin) in a hidden iframe and waits
 * for its postMessage report of whether this browser has a cached CFR login.
 * Always resolves - null on timeout, on an explicit "not logged in", or on
 * any failure - never rejects, since the caller's response is always
 * "show nothing" in every non-success case.
 */
function getCfrSessionToken(): Promise<string | null> {
  const origin = selfOrigin();
  if (!origin) return Promise.resolve(null);

  return new Promise((resolve) => {
    const iframe = document.createElement('iframe');
    iframe.src = `${origin}/integrations/app-switcher/session-check.html`;
    iframe.style.display = 'none';
    iframe.setAttribute('aria-hidden', 'true');

    let settled = false;
    const finish = (token: string | null) => {
      if (settled) return;
      settled = true;
      window.removeEventListener('message', onMessage);
      clearTimeout(timer);
      iframe.remove();
      resolve(token);
    };

    const onMessage = (event: MessageEvent<SessionCheckMessage>) => {
      if (event.source !== iframe.contentWindow) return;
      const data = event.data;
      if (!data || data.source !== 'cfr-app-switcher') return;
      finish(data.loggedIn ? data.token : null);
    };

    const timer = setTimeout(() => finish(null), SESSION_CHECK_TIMEOUT_MS);

    window.addEventListener('message', onMessage);
    document.body.appendChild(iframe);
  });
}

function injectStyles(): void {
  if (document.getElementById(`${CLASS_PREFIX}-styles`)) return;
  const style = document.createElement('style');
  style.id = `${CLASS_PREFIX}-styles`;
  style.textContent = `
    .${CLASS_PREFIX}-fixed { position: fixed; top: 16px; right: 16px; z-index: 2147483000; }
    .${CLASS_PREFIX}-inline { position: relative; display: inline-flex; height: 100%; align-items: center; }
    .${CLASS_PREFIX}-wrap { font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif; }
    .${CLASS_PREFIX}-btn {
      width: 40px; height: 40px; border-radius: 999px; border: none; cursor: pointer;
      background: #ffffff; box-shadow: 0 1px 3px rgba(0,0,0,0.2); display: grid;
      grid-template-columns: repeat(3, 1fr); gap: 3px; place-items: center; padding: 10px;
    }
    .${CLASS_PREFIX}-btn:hover { background: #f3f4f6; }
    .${CLASS_PREFIX}-dot { width: 4px; height: 4px; border-radius: 50%; background: #44546a; }
    .${CLASS_PREFIX}-btn.${CLASS_PREFIX}-btn-inline {
      width: auto; height: 100%; padding: 0 2px; background: transparent; box-shadow: none;
      grid-template-columns: repeat(3, 1fr); gap: 2.5px;
    }
    .${CLASS_PREFIX}-btn.${CLASS_PREFIX}-btn-inline:hover { background: transparent; opacity: 0.8; }
    .${CLASS_PREFIX}-btn.${CLASS_PREFIX}-btn-inline .${CLASS_PREFIX}-dot {
      width: 3px; height: 3px; background: currentColor;
    }

    .${CLASS_PREFIX}-panel {
      position: absolute; top: 48px; right: 0; width: min(380px, calc(100vw - 24px));
      max-height: 520px; overflow-y: auto; background: #ffffff; border-radius: 16px;
      box-shadow: 0 20px 45px rgba(15,23,42,0.22), 0 2px 8px rgba(15,23,42,0.08);
      display: none; z-index: 2147483001; color: #0f172a;
    }
    .${CLASS_PREFIX}-wrap.${CLASS_PREFIX}-inline .${CLASS_PREFIX}-panel { top: 100%; margin-top: 10px; }
    .${CLASS_PREFIX}-panel.${CLASS_PREFIX}-open { display: block; }

    .${CLASS_PREFIX}-header { padding: 16px 18px 14px; }
    .${CLASS_PREFIX}-header-row {
      display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;
    }
    .${CLASS_PREFIX}-header-title { font-size: 15px; font-weight: 700; color: #0f172a; }
    .${CLASS_PREFIX}-header-badge {
      min-width: 20px; height: 20px; padding: 0 6px; border-radius: 999px; background: #eef2ff;
      color: #4338ca; font-size: 11px; font-weight: 700; display: flex; align-items: center;
      justify-content: center;
    }
    .${CLASS_PREFIX}-header-sub { font-size: 12.5px; font-weight: 600; color: #334155; margin-bottom: 2px; }
    .${CLASS_PREFIX}-header-desc { font-size: 11.5px; color: #64748b; line-height: 1.4; }

    .${CLASS_PREFIX}-divider { border-top: 1px solid #eef0f3; }

    .${CLASS_PREFIX}-grid {
      display: grid; grid-template-columns: repeat(3, 1fr); gap: 4px; padding: 10px;
    }
    .${CLASS_PREFIX}-tile {
      display: flex; flex-direction: column; align-items: center; text-align: center; gap: 6px;
      padding: 10px 6px; border-radius: 12px; cursor: pointer; text-decoration: none; color: inherit;
      transition: background-color 120ms ease;
    }
    .${CLASS_PREFIX}-tile:hover, .${CLASS_PREFIX}-tile:focus-visible { background: #f3f4f6; outline: none; }
    .${CLASS_PREFIX}-tile-icon {
      width: 40px; height: 40px; border-radius: 11px; object-fit: cover; flex-shrink: 0;
      display: flex; align-items: center; justify-content: center; font-size: 15px; font-weight: 700;
      color: #ffffff;
    }
    .${CLASS_PREFIX}-tile-name {
      font-size: 12px; font-weight: 600; color: #0f172a; line-height: 1.25;
      display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
    }
    .${CLASS_PREFIX}-tile-sub {
      font-size: 10.5px; color: #8a94a6; line-height: 1.2;
      display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden;
    }

    .${CLASS_PREFIX}-footer {
      display: flex; align-items: center; justify-content: space-between; gap: 8px;
      padding: 12px 18px; font-size: 12.5px; font-weight: 600; color: #1f2937;
      cursor: pointer; text-decoration: none;
    }
    .${CLASS_PREFIX}-footer:hover { background: #f8fafc; }
    .${CLASS_PREFIX}-footer-chevron { font-size: 14px; color: #94a3b8; }

    .${CLASS_PREFIX}-empty, .${CLASS_PREFIX}-error {
      grid-column: 1 / -1; padding: 18px 10px; font-size: 12px; color: #6b7280; text-align: center;
    }
  `;
  document.head.appendChild(style);
}

function renderTileIcon(app: SwitcherApp): HTMLElement {
  const label = (app.name || '?').trim();
  const color = tileColorFor(app);
  if (app.logoUrl) {
    const img = document.createElement('img');
    img.className = `${CLASS_PREFIX}-tile-icon`;
    img.style.background = color;
    img.src = app.logoUrl;
    img.alt = label;
    img.onerror = () => {
      img.replaceWith(fallbackTileIcon(label, color));
    };
    return img;
  }
  return fallbackTileIcon(label, color);
}

function fallbackTileIcon(label: string, color: string): HTMLElement {
  const span = document.createElement('span');
  span.className = `${CLASS_PREFIX}-tile-icon`;
  span.style.background = color;
  span.textContent = (label[0] ?? '?').toUpperCase();
  return span;
}

function openApp(app: SwitcherApp): void {
  if (!app.externalUrl) return;
  window.open(app.externalUrl, '_blank', 'noopener,noreferrer');
}

async function fetchAssignedApps(apiBase: string, token: string): Promise<SwitcherApp[]> {
  const response = await fetch(`${apiBase}${ASSIGNED_PRODUCTS_ENDPOINT_PATH}`, {
    method: 'GET',
    headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    throw new Error(`GetAssignedProducts failed with status ${response.status}`);
  }
  const envelope = (await response.json()) as ApiEnvelope<AssignedProductRow[]>;
  const rows = Array.isArray(envelope.resultData) ? envelope.resultData : [];
  return rows.filter(isLaunchable).map((row) => toSwitcherApp(apiBase, row));
}

function buildHeader(): { header: HTMLElement; setCount: (count: number) => void } {
  const header = document.createElement('div');
  header.className = `${CLASS_PREFIX}-header`;

  const row = document.createElement('div');
  row.className = `${CLASS_PREFIX}-header-row`;

  const title = document.createElement('span');
  title.className = `${CLASS_PREFIX}-header-title`;
  title.textContent = 'Switch app';

  const badge = document.createElement('span');
  badge.className = `${CLASS_PREFIX}-header-badge`;

  row.appendChild(title);
  row.appendChild(badge);

  const sub = document.createElement('div');
  sub.className = `${CLASS_PREFIX}-header-sub`;
  sub.textContent = 'Jump to another app';

  const desc = document.createElement('div');
  desc.className = `${CLASS_PREFIX}-header-desc`;
  desc.textContent = 'Open Catholic Solutions and approved connected apps';

  header.appendChild(row);
  header.appendChild(sub);
  header.appendChild(desc);

  return { header, setCount: (count) => { badge.textContent = String(count); } };
}

function buildFooter(): HTMLElement | null {
  const href = appHubUrl();
  if (!href) return null;

  const footer = document.createElement('a');
  footer.className = `${CLASS_PREFIX}-footer ${CLASS_PREFIX}-divider`;
  footer.href = href;
  footer.target = '_blank';
  footer.rel = 'noopener noreferrer';

  const label = document.createElement('span');
  label.textContent = 'All apps in App Hub';
  const chevron = document.createElement('span');
  chevron.className = `${CLASS_PREFIX}-footer-chevron`;
  chevron.textContent = '›';
  chevron.setAttribute('aria-hidden', 'true');

  footer.appendChild(label);
  footer.appendChild(chevron);
  return footer;
}

function buildPanel(apiBase: string, token: string): HTMLElement {
  const panel = document.createElement('div');
  panel.className = `${CLASS_PREFIX}-panel`;

  const { header, setCount } = buildHeader();
  panel.appendChild(header);

  const grid = document.createElement('div');
  grid.className = `${CLASS_PREFIX}-grid ${CLASS_PREFIX}-divider`;
  panel.appendChild(grid);

  const footer = buildFooter();
  if (footer) panel.appendChild(footer);

  fetchAssignedApps(apiBase, token)
    .then((apps) => {
      grid.innerHTML = '';
      setCount(apps.length);
      if (apps.length === 0) {
        const empty = document.createElement('div');
        empty.className = `${CLASS_PREFIX}-empty`;
        empty.textContent = 'No apps available.';
        grid.appendChild(empty);
        return;
      }
      apps.forEach((app) => {
        const tile = document.createElement('a');
        tile.className = `${CLASS_PREFIX}-tile`;
        tile.href = app.externalUrl;
        tile.rel = 'noopener noreferrer';
        tile.target = '_blank';
        tile.addEventListener('click', (event) => {
          event.preventDefault();
          openApp(app);
        });
        tile.appendChild(renderTileIcon(app));

        const name = document.createElement('span');
        name.className = `${CLASS_PREFIX}-tile-name`;
        name.textContent = app.name;
        tile.appendChild(name);

        if (app.subCategory) {
          const subEl = document.createElement('span');
          subEl.className = `${CLASS_PREFIX}-tile-sub`;
          subEl.textContent = app.subCategory;
          tile.appendChild(subEl);
        }

        grid.appendChild(tile);
      });
    })
    .catch(() => {
      grid.innerHTML = '';
      setCount(0);
      const error = document.createElement('div');
      error.className = `${CLASS_PREFIX}-error`;
      error.textContent = 'Unable to load apps right now.';
      grid.appendChild(error);
    });

  return panel;
}

function mountSwitcher(apiBase: string, token: string, host: HTMLElement, inline: boolean): void {
  injectStyles();

  const wrap = document.createElement('div');
  wrap.className = `${CLASS_PREFIX}-wrap ${inline ? `${CLASS_PREFIX}-inline` : `${CLASS_PREFIX}-fixed`}`;

  const button = document.createElement('button');
  button.type = 'button';
  button.className = `${CLASS_PREFIX}-btn${inline ? ` ${CLASS_PREFIX}-btn-inline` : ''}`;
  button.setAttribute('aria-label', 'Open Catholic Solutions app switcher');
  for (let i = 0; i < 9; i += 1) {
    const dot = document.createElement('span');
    dot.className = `${CLASS_PREFIX}-dot`;
    button.appendChild(dot);
  }

  const panel = buildPanel(apiBase, token);

  button.addEventListener('click', (event) => {
    event.stopPropagation();
    panel.classList.toggle(`${CLASS_PREFIX}-open`);
  });

  document.addEventListener('click', (event) => {
    if (!wrap.contains(event.target as Node)) {
      panel.classList.remove(`${CLASS_PREFIX}-open`);
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      panel.classList.remove(`${CLASS_PREFIX}-open`);
    }
  });

  wrap.appendChild(button);
  wrap.appendChild(panel);
  host.appendChild(wrap);
}

/**
 * The host page's own JS (e.g. a React app rendering its header) can still be
 * mounting well after this script's `defer` load finishes, so the slot may
 * not exist yet on the first check. Wait briefly for it via MutationObserver
 * before giving up and falling back to the floating corner button.
 */
function waitForSlot(timeoutMs = SLOT_WAIT_TIMEOUT_MS): Promise<HTMLElement | null> {
  return new Promise((resolve) => {
    const existing = document.getElementById(SLOT_ID);
    if (existing) {
      resolve(existing);
      return;
    }

    const timer = setTimeout(() => {
      observer.disconnect();
      resolve(null);
    }, timeoutMs);

    const observer = new MutationObserver(() => {
      const found = document.getElementById(SLOT_ID);
      if (found) {
        clearTimeout(timer);
        observer.disconnect();
        resolve(found);
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  });
}

async function init(): Promise<void> {
  if (!__CFR_GATEWAY_ORIGIN__) {
    console.error('[app-switcher] Built without a VITE_APP_REST_API_BASE_URL - see vite.widget.config.ts.');
    return;
  }

  // Zero footprint for anyone not also logged into CFR: no floating button,
  // no inline icon, nothing mounted at all.
  const token = await getCfrSessionToken();
  if (!token) return;

  const slot = await waitForSlot();
  if (slot) {
    mountSwitcher(__CFR_GATEWAY_ORIGIN__, token, slot, true);
    return;
  }

  mountSwitcher(__CFR_GATEWAY_ORIGIN__, token, document.body, false);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => void init());
} else {
  void init();
}
