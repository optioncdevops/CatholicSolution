import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, loadEnv, type Plugin } from 'vite';
import { createProductionAppSwitcherCatalog, serializeAppSwitcherCatalog } from './src/manifest';

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const workspaceRoot = path.resolve(currentDirectory, '../..');
const rootPackagePath = path.resolve(workspaceRoot, 'package.json');

function catalogPublisher(appHubHref: string): Plugin {
  return {
    name: 'catholic-solutions-platform-catalog-publisher',
    generateBundle() {
      const { version } = JSON.parse(readFileSync(rootPackagePath, 'utf8')) as { version: string };
      const catalog = createProductionAppSwitcherCatalog({ releaseVersion: version, appHubHref });
      this.emitFile({
        type: 'asset',
        fileName: 'app-switcher/v1/catalog.js',
        source: serializeAppSwitcherCatalog(catalog),
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, currentDirectory, '');
  const appHubHref = env.APP_SWITCHER_APP_HUB_URL?.trim();
  if (!appHubHref) {
    throw new Error('APP_SWITCHER_APP_HUB_URL is required to publish the production App Switcher catalog.');
  }

  return {
    plugins: [catalogPublisher(appHubHref)],
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      sourcemap: true,
      minify: 'esbuild',
      lib: {
        entry: path.resolve(currentDirectory, 'src/app-switcher.js'),
        name: 'CatholicSolutionsAppSwitcher',
        formats: ['iife'],
        fileName: () => 'app-switcher/v1/app-switcher.js',
      },
      rollupOptions: {
        output: {
          entryFileNames: 'app-switcher/v1/app-switcher.js',
        },
      },
    },
  };
});
