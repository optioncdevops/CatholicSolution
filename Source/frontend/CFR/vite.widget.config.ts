import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));

/**
 * Builds the standalone, framework-free App Switcher widget into
 * public/integrations/app-switcher/app-switcher.js, so every CFR build (dev
 * server static assets + every vite build --mode) serves it at that same path
 * on the CFR origin for that environment. The embedding app only ever needs:
 *
 *   <script src="https://<cfr-origin-for-that-env>/integrations/app-switcher/app-switcher.js" defer></script>
 *
 * This build is environment-independent by design - it never bakes in a
 * per-environment origin (that used to come from VITE_APP_REST_API_BASE_URL
 * via `define` here, which meant the committed output froze whichever
 * environment last happened to build it). A host that needs the CFR.Gateway
 * origin (product catalog + logo images) supplies it itself at runtime via
 * data-cfr-gateway-origin on the script tag, from its own env config - the
 * same pattern data-cfr-datasync-* already uses. See
 * src/widget/appSwitcher.ts's header comment and constants.ts.
 */
export default defineConfig({
  publicDir: false,
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
});
