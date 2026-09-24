import {
  CLASS_PREFIX,
  CURRENT_PRODUCT_ID,
  DATASYNC_BASE_URL,
  DATASYNC_CLIENT_ID,
  DATASYNC_CLIENT_SECRET,
  HOST_SESSION_EMAIL_KEY,
  SLOT_ID,
  SLOT_WAIT_TIMEOUT_MS,
} from '../constants';
import { launchViaDataSync } from '../services/dataSyncClient';
import type { SwitcherApp } from '../types';
import { readHostSessionValue, selfOrigin, tileColorFor } from '../utils/switcherHelpers';
import { injectStyles } from './styles';

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

async function openApp(app: SwitcherApp): Promise<void> {
  if (!app.externalUrl) return;

  let destination = app.externalUrl;
  if (DATASYNC_BASE_URL && DATASYNC_CLIENT_ID && DATASYNC_CLIENT_SECRET) {
    const cfrEmail = readHostSessionValue(HOST_SESSION_EMAIL_KEY);
    if (cfrEmail) {
      destination =
        (await launchViaDataSync(DATASYNC_BASE_URL, DATASYNC_CLIENT_ID, DATASYNC_CLIENT_SECRET, cfrEmail, app.productId)) ??
        app.externalUrl;
    }
  }

  if (app.navigationTarget === 'new-tab') {
    window.open(destination, '_blank', 'noopener,noreferrer');
  } else {
    window.location.assign(destination);
  }
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

// A platformLaunchCode (direct CFR.DataSync mode only) makes this land already signed in via
// PlatformLaunchController.ExchangeToken instead of CFR's own login page - see appSwitcher.ts's
// header comment and 005_Portal_PlatformLaunch.sql. No code (default mode, or the mint failed)
// just links to the plain hub, unchanged from before.
function buildFooter(platformLaunchCode?: string | null): HTMLElement | null {
  const origin = selfOrigin();
  if (!origin) return null;
  const href = platformLaunchCode ? `${origin}/apps?code=${encodeURIComponent(platformLaunchCode)}` : `${origin}/apps`;

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

function buildPanel(appsPromise: Promise<SwitcherApp[]>, platformLaunchCode?: string | null): HTMLElement {
  const panel = document.createElement('div');
  panel.className = `${CLASS_PREFIX}-panel`;

  const { header, setCount } = buildHeader();
  panel.appendChild(header);

  const grid = document.createElement('div');
  grid.className = `${CLASS_PREFIX}-grid ${CLASS_PREFIX}-divider`;
  panel.appendChild(grid);

  const footer = buildFooter(platformLaunchCode);
  if (footer) panel.appendChild(footer);

  appsPromise
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
        const isCurrent = CURRENT_PRODUCT_ID !== '' && String(app.productId) === CURRENT_PRODUCT_ID;

        const tile = document.createElement('a');
        tile.className = `${CLASS_PREFIX}-tile${isCurrent ? ` ${CLASS_PREFIX}-tile-current` : ''}`;
        tile.rel = 'noopener noreferrer';
        if (isCurrent) {
          tile.setAttribute('aria-disabled', 'true');
        } else {
          tile.href = app.externalUrl;
          tile.addEventListener('click', (event) => {
            event.preventDefault();
            void openApp(app);
          });
        }
        tile.appendChild(renderTileIcon(app));

        const name = document.createElement('span');
        name.className = `${CLASS_PREFIX}-tile-name`;
        name.textContent = app.name;
        tile.appendChild(name);

        if (isCurrent) {
          const currentBadge = document.createElement('span');
          currentBadge.className = `${CLASS_PREFIX}-tile-sub`;
          currentBadge.textContent = 'Current app';
          tile.appendChild(currentBadge);
        } else if (app.subCategory) {
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

export function mountSwitcher(
  appsPromise: Promise<SwitcherApp[]>,
  host: HTMLElement,
  inline: boolean,
  platformLaunchCode?: string | null,
): void {
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

  const panel = buildPanel(appsPromise, platformLaunchCode);

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
 * The host page's own JS (e.g. a React app rendering its header) can still be mounting well
 * after this script's `defer` load finishes, so the slot may not exist yet on the first check.
 * Wait briefly for it via MutationObserver before giving up and falling back to the floating
 * corner button.
 */
export function waitForSlot(timeoutMs = SLOT_WAIT_TIMEOUT_MS): Promise<HTMLElement | null> {
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
