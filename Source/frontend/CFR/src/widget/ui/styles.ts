import { CLASS_PREFIX } from '../constants';

export function injectStyles(): void {
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
    .${CLASS_PREFIX}-tile-current { cursor: default; opacity: 0.55; }
    .${CLASS_PREFIX}-tile-current:hover, .${CLASS_PREFIX}-tile-current:focus-visible { background: transparent; }
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
