(() => {
  'use strict';

  const TAG_NAME = 'catholic-solutions-app-switcher';
  const FETCH_TIMEOUT_MS = 8000;

  if (typeof window === 'undefined' || !window.customElements) return;
  if (customElements.get(TAG_NAME)) return; // idempotent: script may be present more than once

  const ICONS = {
    // Minimal line icons in the Lucide visual language (24x24, 2px stroke, currentColor).
    grid: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="5" cy="5" r="1.8"/><circle cx="12" cy="5" r="1.8"/><circle cx="19" cy="5" r="1.8"/><circle cx="5" cy="12" r="1.8"/><circle cx="12" cy="12" r="1.8"/><circle cx="19" cy="12" r="1.8"/><circle cx="5" cy="19" r="1.8"/><circle cx="12" cy="19" r="1.8"/><circle cx="19" cy="19" r="1.8"/></svg>',
    chevron: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg>',
    chevronRight: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="9 18 15 12 9 6"/></svg>',
    external: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>',
    warning: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
  };

  const STYLES = `
    :host {
      display: inline-block;
      font-family: var(--font-body, Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif);
      color: var(--primary, #12264c);
    }
    *, *::before, *::after { box-sizing: border-box; }
    .root { position: relative; }

    .trigger {
      display: inline-flex; align-items: center; gap: .45rem;
      min-height: 2.35rem; min-width: 5.5rem;
      border: 1px solid var(--line, #e2e8f0); border-radius: var(--radius-control, .625rem);
      background: var(--surface, #fff); color: var(--primary, #12264c);
      padding: .2rem .55rem .2rem .3rem; font: inherit; cursor: pointer;
      transition: border-color 120ms ease, background 120ms ease, box-shadow 120ms ease;
    }
    .trigger:hover { border-color: var(--line-strong, #b7c3d2); background: var(--hover, #f8fafc); }
    .trigger:focus-visible, .tile:focus-visible, .all:focus-visible {
      outline: 3px solid var(--focus-ring, rgba(217,168,63,.55)); outline-offset: 2px;
    }
    .trigger.open { border-color: var(--line-strong, #b7c3d2); }
    .trigger__icon {
      display: grid; place-items: center; width: 1.8rem; height: 1.8rem; flex: none;
      border-radius: .45rem; background: var(--switcher-accent, var(--primary, #12264c)); color: #fff;
    }
    .trigger__icon svg { width: 1rem; height: 1rem; }
    .trigger__label { min-width: 0; text-align: left; display: grid; }
    .trigger__title { font-family: inherit; font-weight: 800; font-size: .6875rem; line-height: 1.2; }
    .trigger__name { font-family: inherit; font-weight: 650; font-size: .5625rem; line-height: 1.2; color: var(--text-muted, #8090a0); max-width: 7.5rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .trigger__chevron { width: .8rem; height: .8rem; color: var(--text-faint, #94a3b8); transition: transform 140ms ease; flex: none; }
    .trigger.open .trigger__chevron { transform: rotate(180deg); }
    @media (prefers-reduced-motion: reduce) { .trigger__chevron { transition: none; } }

    .skeleton {
      display: inline-flex; align-items: center; min-height: 2.35rem; min-width: 5.5rem;
      border-radius: var(--radius-control, .625rem); border: 1px solid var(--line-soft, #eef2f7);
      background: linear-gradient(90deg, var(--bg-subtle,#eef2f7) 25%, var(--surface-muted,#f8fafc) 37%, var(--bg-subtle,#eef2f7) 63%);
      background-size: 400% 100%; animation: shimmer 1.4s ease infinite;
    }
    @media (prefers-reduced-motion: reduce) { .skeleton { animation: none; } }
    @keyframes shimmer { 0% { background-position: 100% 50%; } 100% { background-position: 0 50%; } }

    .unavailable {
      display: inline-flex; align-items: center; gap: .3rem; min-height: 2.35rem; padding: 0 .5rem;
      color: var(--text-faint, #94a3b8); font-family: inherit; font-weight: 700; font-size: .7rem; line-height: 1.2;
    }
    .unavailable svg { width: .9rem; height: .9rem; }

    .menu {
      position: absolute; right: 0; top: calc(100% + .45rem); z-index: 2147483000;
      width: min(26.5rem, calc(100vw - 1rem)); max-height: min(75dvh, 32rem);
      overflow: hidden; display: flex; flex-direction: column;
      border: 1px solid var(--line, #dde4ec); border-radius: var(--radius-panel, .95rem);
      background: var(--surface, #fff); box-shadow: var(--shadow-elevated, 0 18px 48px rgba(15,23,42,.14), 0 2px 8px rgba(15,23,42,.04));
      transform-origin: top right; opacity: 0; transform: translateY(-4px) scale(.98);
      animation: pop-in 130ms ease-out forwards;
    }
    @media (prefers-reduced-motion: reduce) { .menu { animation: none; opacity: 1; transform: none; } }
    @keyframes pop-in { to { opacity: 1; transform: translateY(0) scale(1); } }

    .header {
      display: flex; align-items: flex-start; justify-content: space-between; gap: .75rem;
      padding: .8rem .85rem .7rem; border-bottom: 1px solid var(--line-soft, #eef2f6);
    }
    .header__copy h2 { margin: 0; font-family: inherit; font-weight: 800; font-size: .75rem; line-height: 1.25; color: var(--text-primary, #12233f); letter-spacing: -.01em; }
    .header__copy p { margin: .18rem 0 0; font-family: inherit; font-weight: 650; font-size: .625rem; line-height: 1.35; color: var(--text-muted, #8090a0); }
    .count {
      display: inline-flex; min-width: 1.55rem; height: 1.55rem; flex: none; align-items: center; justify-content: center;
      border-radius: 999px; background: var(--surface-muted, #f1f5f9); color: var(--text-secondary, #475569);
      font-family: inherit; font-weight: 850; font-size: .625rem; line-height: 1.2;
    }

    .body { overflow-y: auto; padding: .65rem .7rem; scrollbar-width: thin; }
    .grid { display: grid; grid-template-columns: repeat(3, minmax(0,1fr)); gap: .4rem; list-style: none; margin: 0; padding: 0; }

    .tile {
      display: grid; grid-template-columns: auto minmax(0,1fr); align-items: center; gap: .55rem;
      width: 100%; min-width: 0; border: 1px solid var(--line-soft, #e8edf3); border-radius: .7rem;
      background: var(--surface, #fff); padding: .55rem .6rem; color: inherit; text-align: left;
      text-decoration: none; font: inherit; cursor: pointer;
    }
    .tile:hover { border-color: var(--line-strong, #cbd5e1); background: var(--hover, #f8fafc); }
    .tile--current { cursor: default; border-color: var(--secondary, #e8d39a); background: var(--warning-bg, #fffaf0); }
    .tile--current:hover { border-color: var(--secondary, #e8d39a); background: var(--warning-bg, #fffaf0); }
    .tile__icon {
      display: grid; place-items: center; width: 2rem; height: 2rem; flex: none;
      border-radius: .5rem; color: #fff; font-size: .85rem; box-shadow: 0 3px 8px rgba(15,23,42,.12);
    }
    .tile__copy { min-width: 0; display: grid; gap: .1rem; }
    .tile__name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-family: inherit; font-weight: 800; font-size: .6875rem; line-height: 1.2; color: var(--text-primary, #12233f); }
    .tile__category { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-family: inherit; font-weight: 650; font-size: .5625rem; line-height: 1.2; color: var(--text-muted, #8090a0); }

    .footer { border-top: 1px solid var(--line-soft, #eef2f6); background: var(--surface-muted, #f8fafc); padding: .55rem .7rem .65rem; }
    .all {
      display: grid; grid-template-columns: 1rem 1fr 1rem; min-height: 2.35rem; align-items: center; gap: .5rem;
      border: 1px solid var(--line, #e2e8f0); border-radius: .6rem;
      background: var(--surface, #fff); color: inherit; font-family: inherit; font-weight: 800; font-size: .6875rem; line-height: 1.2;
      text-align: center; text-decoration: none;
    }
    .all:hover { border-color: var(--line-strong, #cbd5e1); background: var(--hover, #f8fafc); }
    .all svg { width: .9rem; height: .9rem; }
    .all__arrow { justify-self: end; color: var(--text-faint, #94a3b8); }

    .empty { grid-column: 1 / -1; padding: 1rem .75rem; color: var(--text-muted, #64748b); font-family: inherit; font-weight: 650; font-size: .7rem; line-height: 1.4; text-align: center; }

    @media (max-width: 640px) {
      .menu {
        position: fixed; left: .5rem; right: .5rem; bottom: .5rem; top: auto;
        width: auto; max-height: min(78dvh, 30rem);
        transform-origin: bottom center; transform: translateY(6px) scale(.99);
      }
      .grid { grid-template-columns: repeat(2, minmax(0,1fr)); }
      .tile__category { display: none; }
    }
  `;

  function safeHref(value) {
    if (typeof value !== 'string' || !value) return '';
    try {
      const url = new URL(value, window.location.href);
      const isHttps = url.protocol === 'https:';
      const isLocalHttp = url.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(url.hostname);
      return isHttps || isLocalHttp ? url.toString() : '';
    } catch {
      return '';
    }
  }

  class CatholicSolutionsAppSwitcher extends HTMLElement {
    static get observedAttributes() {
      return [
        'current-app-id', 'current-app-name', 'current-app-icon', 'current-app-category',
        'app-hub-url', 'manifest-url', 'accent-gradient', 'hide-current-tile',
      ];
    }

    constructor() {
      super();
      this._open = false;
      this._state = 'loading'; // loading | ready | failed
      this._apps = [];
      this._manifestPromise = null;
      this._onDocPointerDown = (event) => {
        if (!event.composedPath().includes(this)) this._setOpen(false);
      };
      this._onDocKeyDown = (event) => {
        if (event.key === 'Escape' && this._open) {
          event.stopPropagation();
          this._setOpen(false);
          this._focusTrigger();
        }
      };
    }

    connectedCallback() {
      if (!this.shadowRoot) this.attachShadow({ mode: 'open' });
      document.addEventListener('pointerdown', this._onDocPointerDown);
      document.addEventListener('keydown', this._onDocKeyDown);
      this._loadManifest();
      this._render();
    }

    disconnectedCallback() {
      document.removeEventListener('pointerdown', this._onDocPointerDown);
      document.removeEventListener('keydown', this._onDocKeyDown);
    }

    attributeChangedCallback() {
      if (this.isConnected) this._render();
    }

    _resolvedManifestUrl() {
      const explicit = this.getAttribute('manifest-url');
      if (explicit) return explicit;
      // Fallback for plain-HTML integrations that only set the script src: assume a
      // sibling manifest.json next to this script.
      const ownSrc = (document.currentScript && document.currentScript.src) || '';
      return ownSrc ? ownSrc.replace(/[^/]*$/, 'manifest.json') : '';
    }

    _loadManifest() {
      if (this._manifestPromise) return; // idempotent: connectedCallback can fire more than once
      const manifestUrl = this._resolvedManifestUrl();
      if (!manifestUrl) {
        this._state = 'failed';
        this._render();
        return;
      }

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

      this._manifestPromise = fetch(manifestUrl, { signal: controller.signal, credentials: 'omit' })
        .then((response) => {
          if (!response.ok) throw new Error(`Manifest request failed: ${response.status}`);
          return response.json();
        })
        .then((data) => {
          clearTimeout(timeout);
          if (!data || !Array.isArray(data.apps)) throw new Error('Malformed manifest');
          this._apps = data.apps
            .map((app) => ({ ...app, href: safeHref(app.href) }))
            .filter((app) => app.id && app.href);
          this._appHubHref = safeHref(data.appHubHref) || this.getAttribute('app-hub-url') || '';
          this._state = 'ready';
          this._render();
        })
        .catch(() => {
          clearTimeout(timeout);
          this._state = 'failed';
          this._render();
        });
    }

    _setOpen(value) {
      if (this._open === value) return;
      this._open = value;
      this._render();
    }

    _focusTrigger() {
      const trigger = this.shadowRoot.querySelector('.trigger');
      if (trigger) trigger.focus();
    }

    _tiles() {
      const currentId = this.getAttribute('current-app-id') || '';
      const currentName = this.getAttribute('current-app-name') || '';
      const accent = this.getAttribute('accent-gradient');
      const others = this._apps.filter((app) => app.id !== currentId);
      const current = this._apps.find((app) => app.id === currentId);

      if (this.hasAttribute('hide-current-tile')) return others;

      const currentTile = {
        id: currentId || '__current__',
        name: currentName || (current && current.name) || 'This app',
        shortName: currentName || (current && current.shortName) || 'This app',
        category: this.getAttribute('current-app-category') || (current && current.category) || '',
        icon: this.getAttribute('current-app-icon') || (current && current.icon) || '',
        gradient: (current && current.gradient) || accent || 'var(--primary, #12264c)',
        isCurrent: true,
      };

      return currentName || current ? [currentTile, ...others] : others;
    }

    _render() {
      const root = this.shadowRoot;
      root.replaceChildren();

      const style = document.createElement('style');
      style.textContent = STYLES;
      root.appendChild(style);

      const accent = this.getAttribute('accent-gradient');
      const wrap = document.createElement('div');
      wrap.className = 'root';
      if (accent) wrap.style.setProperty('--switcher-accent', accent);

      if (this._state === 'failed') {
        // Fail gracefully: never block the host app. Render nothing interactive.
        this.style.display = 'none';
        return;
      }
      this.style.display = '';

      if (this._state === 'loading') {
        const skeleton = document.createElement('span');
        skeleton.className = 'skeleton';
        skeleton.setAttribute('role', 'status');
        skeleton.setAttribute('aria-label', 'Loading app switcher');
        wrap.appendChild(skeleton);
        root.appendChild(wrap);
        return;
      }

      wrap.appendChild(this._renderTrigger());
      if (this._open) wrap.appendChild(this._renderMenu());
      root.appendChild(wrap);
    }

    _renderTrigger() {
      const currentName = this.getAttribute('current-app-name') || 'Apps';
      const button = document.createElement('button');
      button.type = 'button';
      button.className = `trigger${this._open ? ' open' : ''}`;
      button.setAttribute('aria-haspopup', 'menu');
      button.setAttribute('aria-expanded', String(this._open));
      button.title = 'Switch app';
      button.setAttribute('aria-label', `Switch app, current app ${currentName}`);
      button.addEventListener('click', () => this._setOpen(!this._open));
      button.addEventListener('keydown', (event) => {
        if (event.key === 'ArrowDown' && !this._open) {
          event.preventDefault();
          this._setOpen(true);
          requestAnimationFrame(() => this._focusFirstItem());
        }
      });

      const icon = document.createElement('span');
      icon.className = 'trigger__icon';
      icon.innerHTML = ICONS.grid;

      const label = document.createElement('span');
      label.className = 'trigger__label';
      const title = document.createElement('span');
      title.className = 'trigger__title';
      title.textContent = 'Switch app';
      const name = document.createElement('span');
      name.className = 'trigger__name';
      name.textContent = currentName;
      label.append(title, name);

      const chev = document.createElement('span');
      chev.className = 'trigger__chevron';
      chev.innerHTML = ICONS.chevron;

      button.append(icon, label, chev);
      return button;
    }

    _focusFirstItem() {
      const first = this.shadowRoot.querySelector('.tile:not(.tile--current)');
      if (first) first.focus();
    }

    _renderMenu() {
      const menu = document.createElement('div');
      menu.className = 'menu';
      menu.setAttribute('role', 'menu');
      menu.setAttribute('aria-label', 'Switch to another application');
      menu.addEventListener('keydown', (event) => this._onMenuKeyDown(event));

      const tiles = this._tiles();

      const header = document.createElement('div');
      header.className = 'header';
      const headerCopy = document.createElement('div');
      headerCopy.className = 'header__copy';
      const heading = document.createElement('h2');
      heading.textContent = 'Jump to another app';
      const intro = document.createElement('p');
      intro.textContent = 'Open Catholic Solutions and approved connected apps';
      headerCopy.append(heading, intro);
      const count = document.createElement('span');
      count.className = 'count';
      count.textContent = String(tiles.length);
      header.append(headerCopy, count);
      menu.appendChild(header);

      const body = document.createElement('div');
      body.className = 'body';

      if (tiles.length === 0) {
        const empty = document.createElement('p');
        empty.className = 'empty';
        empty.textContent = 'No other approved apps are available yet.';
        body.appendChild(empty);
      } else {
        const grid = document.createElement('ul');
        grid.className = 'grid';
        tiles.forEach((app) => {
          const li = document.createElement('li');
          li.appendChild(this._renderTile(app));
          grid.appendChild(li);
        });
        body.appendChild(grid);
      }
      menu.appendChild(body);

      const appHubHref = this._appHubHref;
      if (appHubHref) {
        const footer = document.createElement('div');
        footer.className = 'footer';
        const all = document.createElement('a');
        all.className = 'all';
        all.href = appHubHref;
        all.setAttribute('role', 'menuitem');
        const allIcon = document.createElement('span');
        allIcon.innerHTML = ICONS.grid;
        allIcon.setAttribute('aria-hidden', 'true');
        const allText = document.createElement('span');
        allText.textContent = 'All apps in App Hub';
        const allArrow = document.createElement('span');
        allArrow.className = 'all__arrow';
        allArrow.innerHTML = ICONS.chevronRight;
        all.append(allIcon, allText, allArrow);
        all.addEventListener('click', () => this._setOpen(false));
        footer.appendChild(all);
        menu.appendChild(footer);
      }

      return menu;
    }

    _renderTile(app) {
      const isCurrent = Boolean(app.isCurrent);
      const isNewTab = app.target === 'new-tab';
      const node = document.createElement(isCurrent ? 'div' : 'a');
      node.className = `tile${isCurrent ? ' tile--current' : ''}`;

      if (isCurrent) {
        node.setAttribute('aria-current', 'page');
      } else {
        node.setAttribute('role', 'menuitem');
        node.href = app.href;
        if (isNewTab) {
          node.target = '_blank';
          node.rel = 'noopener noreferrer';
        }
        node.setAttribute('aria-label', `Open ${app.name}${isNewTab ? ' in a new tab' : ''}`);
        node.addEventListener('click', () => this._setOpen(false));
        node.tabIndex = 0;
      }

      const icon = document.createElement('span');
      icon.className = 'tile__icon';
      icon.style.background = app.gradient || 'var(--primary, #12264c)';
      icon.textContent = app.icon || '';
      icon.setAttribute('aria-hidden', 'true');

      const copy = document.createElement('span');
      copy.className = 'tile__copy';
      const name = document.createElement('span');
      name.className = 'tile__name';
      name.textContent = app.shortName || app.name;
      copy.appendChild(name);
      if (app.category) {
        const category = document.createElement('span');
        category.className = 'tile__category';
        category.textContent = app.category;
        copy.appendChild(category);
      }

      node.append(icon, copy);
      if (!isCurrent && isNewTab) node.title = 'Opens in a new tab';
      return node;
    }

    _onMenuKeyDown(event) {
      const items = Array.from(this.shadowRoot.querySelectorAll('.tile:not(.tile--current), .all'));
      if (items.length === 0) return;
      const currentIndex = items.indexOf(this.shadowRoot.activeElement);

      if (event.key === 'ArrowDown') {
        event.preventDefault();
        items[(currentIndex + 1 + items.length) % items.length].focus();
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        items[(currentIndex - 1 + items.length) % items.length].focus();
      } else if (event.key === 'Home') {
        event.preventDefault();
        items[0].focus();
      } else if (event.key === 'End') {
        event.preventDefault();
        items[items.length - 1].focus();
      }
    }
  }

  customElements.define(TAG_NAME, CatholicSolutionsAppSwitcher);
})();
