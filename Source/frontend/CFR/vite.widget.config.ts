import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, loadEnv } from 'vite';

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));

/**
 * Builds the standalone, framework-free App Switcher widget into
 * public/integrations/app-switcher/app-switcher.js, so every CFR build (dev
 * server static assets + every vite build --mode) serves it at that same path
 * on the CFR origin for that environment. The embedding app only ever needs:
 *
 *   <script src="https://<cfr-origin-for-that-env>/integrations/app-switcher/app-switcher.js" defer></script>
 *
 * The CFR.Gateway origin the widget calls is baked in at build time from this
 * mode's VITE_APP_REST_API_BASE_URL (the same var CFR's own app reads) - no
 * runtime data attributes or globals required on the embedding page.
 */
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, currentDirectory, 'VITE_');
  const gatewayOrigin = String(env.VITE_APP_REST_API_BASE_URL ?? '')
    .replace(/\/+$/, '')
    .replace(/\/(acutis|portal)$/i, '');

  return {
    publicDir: false,
    define: {
      __CFR_GATEWAY_ORIGIN__: JSON.stringify(gatewayOrigin),
    },
    build: {
      outDir: path.resolve(currentDirectory, './public/integrations/app-switcher'),
      emptyOutDir: false,
      lib: {
        entry: path.resolve(currentDirectory, './src/widget/appSwitcher.ts'),
        name: 'CfrAppSwitcher',
        formats: ['iife'],
        fileName: () => 'app-switcher.js',
      },
      minify: true,
    },
  };
});
