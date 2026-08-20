(() => {
  'use strict';

  const manifest = __CATHOLIC_SOLUTIONS_SWITCHER_MANIFEST__;
  const tagName = 'catholic-solutions-app-switcher';

  if (!window.customElements || customElements.get(tagName)) return;

  const styles = `
    :host{display:inline-block;position:relative;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:#12264c}
    *{box-sizing:border-box}.root{position:relative}.trigger{display:inline-flex;min-height:2.35rem;align-items:center;gap:.45rem;border:1px solid #d7dee8;border-radius:.6rem;background:#fff;padding:.2rem .5rem .2rem .25rem;color:#12264c;font:800 .75rem/1.2 inherit;cursor:pointer;box-shadow:none}.trigger:hover,.trigger.open{border-color:#b7c3d2;background:#f8fafc;box-shadow:0 4px 12px rgba(15,23,42,.05)}.trigger:focus-visible,.tile:focus-visible,.all:focus-visible{outline:3px solid rgba(217,168,63,.32);outline-offset:2px}.dots{display:grid;width:1.8rem;height:1.8rem;place-items:center;border-radius:.45rem;background:#eef2f7;color:#12264c}.dots-grid{display:grid;grid-template-columns:repeat(3,2px);gap:2px}.dots-grid i{width:2px;height:2px;border-radius:50%;background:currentColor}.label{display:none;min-width:0;text-align:left}.title{display:block;font-size:.6875rem;font-weight:800;line-height:1.1}.sub{display:block;margin-top:.08rem;max-width:7.5rem;overflow:hidden;color:#8090a0;font-size:.5625rem;font-weight:650;text-overflow:ellipsis;white-space:nowrap}.chev{font-size:.72rem;color:#94a3b8;transition:transform 160ms ease}.open .chev{transform:rotate(180deg)}
    .menu{position:absolute;right:0;top:calc(100% + .45rem);z-index:2147483000;width:min(33rem,calc(100vw - 1rem));max-height:calc(100dvh - 4.5rem);overflow:hidden;border:1px solid #dde4ec;border-radius:.95rem;background:#fff;box-shadow:0 18px 48px rgba(15,23,42,.14),0 2px 8px rgba(15,23,42,.04)}.header{display:flex;align-items:flex-start;justify-content:space-between;gap:.75rem;border-bottom:1px solid #eef2f6;padding:.8rem .85rem .7rem}.header h2{margin:0;color:#12233f;font-size:.75rem;font-weight:800;letter-spacing:-.01em}.header p{margin:.18rem 0 0;color:#8090a0;font-size:.625rem;font-weight:650;line-height:1.35}.count{display:inline-flex;min-width:1.55rem;height:1.55rem;align-items:center;justify-content:center;border-radius:999px;background:#f1f5f9;color:#475569;font-size:.625rem;font-weight:850}.grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:.4rem;max-height:min(52dvh,23rem);margin:0;padding:.65rem .7rem;overflow-y:auto;overscroll-behavior:contain;list-style:none;scrollbar-width:thin}.grid li{min-width:0}.tile{display:grid;width:100%;grid-template-columns:auto minmax(0,1fr);align-items:center;gap:.55rem;border:1px solid #e8edf3;border-radius:.7rem;background:#fff;padding:.55rem .6rem;color:inherit;text-align:left;text-decoration:none}.tile:hover{border-color:#cbd5e1;background:#f8fafc;box-shadow:0 4px 12px rgba(15,23,42,.05)}.tile.current{cursor:default;border-color:#e8d39a;background:#fffaf0}.tile.current:hover{border-color:#e8d39a;background:#fffaf0;box-shadow:none}.icon{display:grid;width:2rem;height:2rem;flex:none;place-items:center;border-radius:.5rem;color:#fff;font-size:.85rem;box-shadow:0 3px 8px rgba(15,23,42,.12)}.copy{display:grid;min-width:0;gap:.1rem}.app-name,.category{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.app-name{color:#12233f;font-size:.6875rem;font-weight:800;line-height:1.2}.category{color:#8090a0;font-size:.5625rem;font-weight:650;line-height:1.2}.footer{border-top:1px solid #eef2f6;background:#f8fafc;padding:.55rem .7rem .65rem}.all{display:grid;grid-template-columns:1rem 1fr 1rem;min-height:2.35rem;align-items:center;gap:.5rem;border:1px solid #e2e8f0;border-radius:.6rem;background:#fff;padding:.45rem .65rem;color:#12264c;font-size:.6875rem;font-weight:800;text-align:center;text-decoration:none}.all:hover{border-color:#cbd5e1;background:#f8fafc}.all .arrow{justify-self:end;color:#94a3b8}
    @media(min-width:640px){.label{display:block}}@media(max-width:640px){.menu{right:-.25rem;width:min(22rem,calc(100vw - .75rem))}.grid{grid-template-columns:repeat(2,minmax(0,1fr))}.category{display:none}}
  `;

  const dotIcon = () => {
    const wrap = document.createElement('span');
    wrap.className = 'dots-grid';
    wrap.setAttribute('aria-hidden', 'true');
    for (let index = 0; index < 9; index += 1) wrap.appendChild(document.createElement('i'));
    return wrap;
  };

  class CatholicSolutionsAppSwitcher extends HTMLElement {
    static get observedAttributes() { return ['current-app-id', 'current-app-name']; }

    constructor() {
      super();
      this.open = false;
      this.root = this.attachShadow({ mode: 'open' });
      this.onDocumentPointerDown = (event) => {
        if (!event.composedPath().includes(this)) this.setOpen(false);
      };
      this.onDocumentKeyDown = (event) => {
        if (event.key === 'Escape') this.setOpen(false);
      };
    }

    connectedCallback() {
      document.addEventListener('pointerdown', this.onDocumentPointerDown);
      document.addEventListener('keydown', this.onDocumentKeyDown);
      this.render();
    }

    disconnectedCallback() {
      document.removeEventListener('pointerdown', this.onDocumentPointerDown);
      document.removeEventListener('keydown', this.onDocumentKeyDown);
    }

    attributeChangedCallback() { if (this.isConnected) this.render(); }

    setOpen(value) {
      if (this.open === value) return;
      this.open = value;
      this.render();
    }

    render() {
      const currentId = this.getAttribute('current-app-id') || '';
      const current = manifest.apps.find((app) => app.id === currentId);
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
      button.setAttribute('aria-haspopup', 'menu');
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

      if (this.open) root.appendChild(this.renderMenu(currentId));
      this.root.appendChild(root);
    }

    renderMenu(currentId) {
      const menu = document.createElement('div');
      menu.className = 'menu';
      menu.setAttribute('role', 'menu');

      const header = document.createElement('div');
      header.className = 'header';
      const headingCopy = document.createElement('div');
      const heading = document.createElement('h2');
      heading.textContent = 'Jump to another app';
      const intro = document.createElement('p');
      intro.textContent = 'Open Catholic Solutions and approved connected apps';
      headingCopy.append(heading, intro);
      const count = document.createElement('span');
      count.className = 'count';
      count.textContent = String(manifest.apps.length);
      header.append(headingCopy, count);
      menu.appendChild(header);

      const grid = document.createElement('ul');
      grid.className = 'grid';
      manifest.apps.forEach((app) => {
        const item = document.createElement('li');
        item.appendChild(this.renderApp(app, currentId));
        grid.appendChild(item);
      });
      menu.appendChild(grid);

      const footer = document.createElement('div');
      footer.className = 'footer';
      const all = document.createElement('a');
      all.className = 'all';
      all.href = manifest.appHubHref;
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

  customElements.define(tagName, CatholicSolutionsAppSwitcher);
})();
