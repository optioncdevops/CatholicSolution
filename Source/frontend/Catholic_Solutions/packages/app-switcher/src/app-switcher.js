(() => {
  'use strict';

  const TAG_NAME = 'catholic-solutions-app-switcher';
  const CATALOG_GLOBAL = '__CatholicSolutionsAppSwitcherCatalogV1';
  const currentScript = document.currentScript;
  const currentScriptUrl = currentScript?.src || '';
  const assetBaseUrl = currentScriptUrl ? new URL('./', currentScriptUrl) : new URL('/app-switcher/v1/', window.location.origin);
  const scriptCatalogUrl = currentScript?.dataset.catalogUrl || new URL('catalog.js', assetBaseUrl).toString();
  const scriptAppHubUrl = currentScript?.dataset.appHubUrl || '';
  const catalogPromises = new Map();

  if (!window.customElements || customElements.get(TAG_NAME)) return;

  const styles = `
    :host{display:inline-block;position:relative;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:#12264c}
    *{box-sizing:border-box}.root{position:relative}.trigger{display:inline-flex;min-height:2.35rem;align-items:center;gap:.45rem;border:1px solid #d7dee8;border-radius:.6rem;background:#fff;padding:.2rem .5rem .2rem .25rem;color:#12264c;font:800 .75rem/1.2 inherit;cursor:pointer}.trigger:hover,.trigger.open{border-color:#b7c3d2;background:#f8fafc;box-shadow:0 4px 12px rgba(15,23,42,.05)}.trigger:focus-visible,.tile:focus-visible,.all:focus-visible{outline:3px solid rgba(217,168,63,.32);outline-offset:2px}.dots{display:grid;width:1.8rem;height:1.8rem;place-items:center;border-radius:.45rem;background:#eef2f7}.dots-grid{display:grid;grid-template-columns:repeat(3,2px);gap:2px}.dots-grid i{width:2px;height:2px;border-radius:50%;background:currentColor}.label{display:none;min-width:0;text-align:left}.title{display:block;font-size:.6875rem;font-weight:800;line-height:1.1}.sub{display:block;margin-top:.08rem;max-width:7.5rem;overflow:hidden;color:#8090a0;font-size:.5625rem;font-weight:650;text-overflow:ellipsis;white-space:nowrap}.chev{font-size:.72rem;color:#94a3b8;transition:transform 160ms ease}.open .chev{transform:rotate(180deg)}
    .menu{position:fixed;z-index:2147483000;display:flex;flex-direction:column;overflow:hidden;border:1px solid #dde4ec;border-radius:.95rem;background:#fff;box-shadow:0 18px 48px rgba(15,23,42,.14),0 2px 8px rgba(15,23,42,.04)}.header{display:flex;align-items:flex-start;justify-content:space-between;gap:.75rem;border-bottom:1px solid #eef2f6;padding:.8rem .85rem .7rem}.header h2{margin:0;color:#12233f;font-size:.75rem;font-weight:800}.header p{margin:.18rem 0 0;color:#8090a0;font-size:.625rem;font-weight:650;line-height:1.35}.count{display:inline-flex;min-width:1.55rem;height:1.55rem;align-items:center;justify-content:center;border-radius:999px;background:#f1f5f9;color:#475569;font-size:.625rem;font-weight:850}.grid{display:grid;min-height:0;flex:1;grid-template-columns:repeat(3,minmax(0,1fr));gap:.4rem;margin:0;padding:.65rem .7rem;overflow-y:auto;overscroll-behavior:contain;list-style:none;scrollbar-width:thin}.grid li{min-width:0}.tile{display:grid;width:100%;grid-template-columns:auto minmax(0,1fr);align-items:center;gap:.55rem;border:1px solid #e8edf3;border-radius:.7rem;background:#fff;padding:.55rem .6rem;color:inherit;text-align:left;text-decoration:none}.tile:hover{border-color:#cbd5e1;background:#f8fafc;box-shadow:0 4px 12px rgba(15,23,42,.05)}.tile.current{cursor:default;border-color:#e8d39a;background:#fffaf0}.tile.current:hover{border-color:#e8d39a;background:#fffaf0;box-shadow:none}.icon{display:grid;width:2rem;height:2rem;place-items:center;border-radius:.5rem;color:#fff;font-size:.85rem;box-shadow:0 3px 8px rgba(15,23,42,.12)}.copy{display:grid;min-width:0;gap:.1rem}.app-name,.category{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.app-name{color:#12233f;font-size:.6875rem;font-weight:800}.category{color:#8090a0;font-size:.5625rem;font-weight:650}.footer{border-top:1px solid #eef2f6;background:#f8fafc;padding:.55rem .7rem .65rem}.all{display:grid;grid-template-columns:1rem 1fr 1rem;min-height:2.35rem;align-items:center;gap:.5rem;border:1px solid #e2e8f0;border-radius:.6rem;background:#fff;padding:.45rem .65rem;color:#12264c;font-size:.6875rem;font-weight:800;text-align:center;text-decoration:none}.all:hover{border-color:#cbd5e1;background:#f8fafc}.all .arrow{justify-self:end;color:#94a3b8}.state{padding:1rem;color:#64748b;font-size:.6875rem;font-weight:650;text-align:center}
    @media(min-width:640px){.label{display:block}}@media(max-width:640px){.grid{grid-template-columns:repeat(2,minmax(0,1fr))}.category{display:none}}@media(max-width:380px){.grid{grid-template-columns:1fr}}
  `;

  function dotIcon() {
    const wrap = document.createElement('span');
    wrap.className = 'dots-grid';
    wrap.setAttribute('aria-hidden', 'true');
    for (let index = 0; index < 9; index += 1) wrap.appendChild(document.createElement('i'));
    return wrap;
  }

  function loadCatalog(catalogSource = scriptCatalogUrl) {
    if (window[CATALOG_GLOBAL]) return Promise.resolve(window[CATALOG_GLOBAL]);
    if (catalogPromises.has(catalogSource)) return catalogPromises.get(catalogSource);

    const request = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      const cacheBucket = Math.floor(Date.now() / 300000);
      const catalogUrl = new URL(catalogSource, window.location.href);
      catalogUrl.searchParams.set('cb', String(cacheBucket));
      script.src = catalogUrl.toString();
      script.async = true;
      script.onload = () => window[CATALOG_GLOBAL] ? resolve(window[CATALOG_GLOBAL]) : reject(new Error('App Switcher catalog did not initialize.'));
      script.onerror = () => reject(new Error('Unable to load the App Switcher catalog.'));
      document.head.appendChild(script);
    });
    catalogPromises.set(catalogSource, request);
    return request;
  }

  class CatholicSolutionsAppSwitcher extends HTMLElement {
    static get observedAttributes() { return ['current-app-id', 'current-app-name', 'catalog-url', 'app-hub-url']; }

    constructor() {
      super();
      this.open = false;
      this.catalog = null;
      this.catalogError = false;
      this.root = this.attachShadow({ mode: 'open' });
      this.onDocumentPointerDown = (event) => {
        if (!event.composedPath().includes(this)) this.setOpen(false);
      };
      this.onDocumentKeyDown = (event) => {
        if (event.key !== 'Escape' || !this.open) return;
        this.setOpen(false);
        this.triggerElement?.focus();
      };
      this.onViewportChange = () => {
        if (this.open) this.positionMenu();
      };
    }

    connectedCallback() {
      document.addEventListener('pointerdown', this.onDocumentPointerDown);
      document.addEventListener('keydown', this.onDocumentKeyDown);
      window.addEventListener('resize', this.onViewportChange);
      window.addEventListener('scroll', this.onViewportChange, true);
      this.render();
      void this.load();
    }

    disconnectedCallback() {
      document.removeEventListener('pointerdown', this.onDocumentPointerDown);
      document.removeEventListener('keydown', this.onDocumentKeyDown);
      window.removeEventListener('resize', this.onViewportChange);
      window.removeEventListener('scroll', this.onViewportChange, true);
    }

    attributeChangedCallback(name, oldValue, newValue) {
      if (!this.isConnected || oldValue === newValue) return;
      if (name === 'catalog-url') {
        this.catalog = null;
        this.catalogError = false;
        this.render();
        void this.load();
        return;
      }
      this.render();
    }

    async load() {
      this.catalogError = false;
      try {
        this.catalog = await loadCatalog(this.getAttribute('catalog-url') || scriptCatalogUrl);
      } catch {
        this.catalog = null;
        this.catalogError = true;
      }
      if (this.isConnected) this.render();
    }

    setOpen(value) {
      if (this.open === value) return;
      this.open = value;
      this.render();
    }

    positionMenu() {
      const trigger = this.triggerElement;
      const menu = this.menuElement;
      if (!trigger || !menu) return;

      const margin = 8;
      const gap = 7;
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const rect = trigger.getBoundingClientRect();
      const width = Math.max(0, Math.min(528, viewportWidth - (margin * 2)));
      const maximumLeft = Math.max(margin, viewportWidth - width - margin);
      const left = Math.min(Math.max(margin, rect.right - width), maximumLeft);
      const availableBelow = Math.max(0, viewportHeight - rect.bottom - gap - margin);
      const availableAbove = Math.max(0, rect.top - gap - margin);
      const openAbove = availableBelow < 240 && availableAbove > availableBelow;

      menu.style.width = `${Math.round(width)}px`;
      menu.style.left = `${Math.round(left)}px`;
      if (openAbove) {
        menu.style.top = 'auto';
        menu.style.bottom = `${Math.round(viewportHeight - rect.top + gap)}px`;
        menu.style.maxHeight = `${Math.floor(availableAbove)}px`;
      } else {
        menu.style.top = `${Math.round(rect.bottom + gap)}px`;
        menu.style.bottom = 'auto';
        menu.style.maxHeight = `${Math.floor(availableBelow)}px`;
      }
    }

    render() {
      const apps = Array.isArray(this.catalog?.apps) ? this.catalog.apps : [];
      const currentId = this.getAttribute('current-app-id') || '';
      const current = apps.find((app) => app.id === currentId);
      const currentName = this.getAttribute('current-app-name') || current?.shortName || current?.name || 'Apps';
      this.root.replaceChildren();

      const style = document.createElement('style');
      style.textContent = styles;
      this.root.appendChild(style);

      const root = document.createElement('div');
      root.className = 'root';
      const button = document.createElement('button');
      button.type = 'button';
      button.className = `trigger${this.open ? ' open' : ''}`;
      button.setAttribute('aria-expanded', String(this.open));
      button.setAttribute('aria-haspopup', 'dialog');
      button.setAttribute('aria-controls', 'catholic-solutions-app-switcher-menu');
      button.addEventListener('click', () => this.setOpen(!this.open));

      const dots = document.createElement('span');
      dots.className = 'dots';
      dots.appendChild(dotIcon());
      const label = document.createElement('span');
      label.className = 'label';
      const title = document.createElement('span');
      title.className = 'title';
      title.textContent = 'Switch app';
      const sub = document.createElement('span');
      sub.className = 'sub';
      sub.textContent = currentName;
      label.append(title, sub);
      const chev = document.createElement('span');
      chev.className = 'chev';
      chev.textContent = '⌄';
      chev.setAttribute('aria-hidden', 'true');
      button.append(dots, label, chev);
      root.appendChild(button);
      this.root.appendChild(root);
      this.triggerElement = button;
      this.menuElement = null;

      if (this.open) {
        const menu = this.renderMenu(apps, currentId);
        root.appendChild(menu);
        this.menuElement = menu;
        this.positionMenu();
      }
    }

    renderMenu(apps, currentId) {
      const menu = document.createElement('section');
      menu.id = 'catholic-solutions-app-switcher-menu';
      menu.className = 'menu';
      menu.setAttribute('role', 'dialog');
      menu.setAttribute('aria-label', 'Application switcher');

      const header = document.createElement('header');
      header.className = 'header';
      const headingCopy = document.createElement('div');
      const heading = document.createElement('h2');
      heading.textContent = 'Jump to another app';
      const intro = document.createElement('p');
      intro.textContent = 'Open Catholic Solutions and approved connected apps';
      headingCopy.append(heading, intro);
      const count = document.createElement('span');
      count.className = 'count';
      count.textContent = this.catalogError ? '!' : String(apps.length);
      header.append(headingCopy, count);
      menu.appendChild(header);

      if (this.catalogError || !this.catalog) {
        const state = document.createElement('div');
        state.className = 'state';
        state.textContent = this.catalogError ? 'Apps are temporarily unavailable. Try again shortly.' : 'Loading apps…';
        menu.appendChild(state);
      } else {
        const grid = document.createElement('ul');
        grid.className = 'grid';
        apps.forEach((app) => {
          const item = document.createElement('li');
          item.appendChild(this.renderApp(app, currentId));
          grid.appendChild(item);
        });
        menu.appendChild(grid);
      }

      const footer = document.createElement('div');
      footer.className = 'footer';
      const all = document.createElement('a');
      all.className = 'all';
      all.href = this.getAttribute('app-hub-url') || this.catalog?.appHubHref || scriptAppHubUrl || '#';
      all.addEventListener('click', () => this.setOpen(false));
      const allDots = document.createElement('span');
      allDots.appendChild(dotIcon());
      const allText = document.createElement('span');
      allText.textContent = 'All apps in App Hub';
      const arrow = document.createElement('span');
      arrow.className = 'arrow';
      arrow.textContent = '›';
      all.append(allDots, allText, arrow);
      footer.appendChild(all);
      menu.appendChild(footer);
      return menu;
    }

    renderApp(app, currentId) {
      const isCurrent = app.id === currentId;
      const node = document.createElement(isCurrent ? 'div' : 'a');
      node.className = `tile${isCurrent ? ' current' : ''}`;
      if (isCurrent) {
        node.setAttribute('aria-current', 'page');
      } else {
        node.href = app.href;
        if (app.target === 'new-tab') {
          node.target = '_blank';
          node.rel = 'noopener noreferrer';
        }
        node.setAttribute('aria-label', `Open ${app.name}${app.target === 'new-tab' ? ' in a new tab' : ''}`);
        node.addEventListener('click', () => this.setOpen(false));
      }

      const icon = document.createElement('span');
      icon.className = 'icon';
      icon.style.background = app.gradient;
      icon.textContent = app.icon;
      icon.setAttribute('aria-hidden', 'true');
      const copy = document.createElement('span');
      copy.className = 'copy';
      const name = document.createElement('span');
      name.className = 'app-name';
      name.textContent = app.shortName || app.name;
      const category = document.createElement('span');
      category.className = 'category';
      category.textContent = app.category;
      copy.append(name, category);
      node.append(icon, copy);
      return node;
    }
  }

  customElements.define(TAG_NAME, CatholicSolutionsAppSwitcher);
})();
