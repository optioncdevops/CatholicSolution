import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));

/**
 * Builds the hidden session-check bundle (see src/widget/sessionCheck.ts)
 * into public/integrations/app-switcher/session-check.js, loaded by
 * session-check.html, which the main app-switcher widget opens in a hidden
 * iframe. Separate config from vite.widget.config.ts purely so the two
 * standalone bundles build independently; no build-time constants needed
 * here since this one only reads a fixed localStorage key.
 */
export default defineConfig({
  publicDir: false,
  build: {
    outDir: path.resolve(currentDirectory, './public/integrations/app-switcher'),
    emptyOutDir: false,
    lib: {
      entry: path.resolve(currentDirectory, './src/widget/sessionCheck.ts'),
      name: 'CfrAppSwitcherSessionCheck',
      formats: ['iife'],
      fileName: () => 'session-check.js',
    },
    minify: true,
  },
});
