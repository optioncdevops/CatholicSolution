import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv, type Plugin } from 'vite';
import { createProductionAppSwitcherManifest } from '../../packages/shared/src/platform/integrations/app-switcher/manifest';

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const workspaceRoot = path.resolve(currentDirectory, '../..');
const switcherSourcePath = path.resolve(
  workspaceRoot,
  'packages/shared/src/platform/integrations/app-switcher/catholic-solutions-app-switcher.js',
);
const rootPackagePath = path.resolve(workspaceRoot, 'package.json');
const switcherAssetPath = 'integrations/app-switcher/app-switcher.js';

function normalizeBasePath(value?: string) {
  const trimmed = value?.trim();
  if (!trimmed || trimmed === '/') return '/';
  return `/${trimmed.replace(/^\/+|\/+$/g, '')}/`;
}

function buildExternalSwitcherSource() {
  const { version } = JSON.parse(readFileSync(rootPackagePath, 'utf8')) as { version: string };
  const manifest = createProductionAppSwitcherManifest(version);
  const source = readFileSync(switcherSourcePath, 'utf8');
  return source.replace('__CATHOLIC_SOLUTIONS_SWITCHER_MANIFEST__', JSON.stringify(manifest));
}

function externalAppSwitcherPlugin(): Plugin {
  return {
    name: 'catholic-solutions-external-app-switcher',
    configureServer(server) {
      server.middlewares.use(`/${switcherAssetPath}`, (_request, response) => {
        response.statusCode = 200;
        response.setHeader('Content-Type', 'text/javascript; charset=utf-8');
        response.setHeader('Cache-Control', 'no-store');
        response.end(buildExternalSwitcherSource());
      });
    },
    generateBundle() {
      this.emitFile({
        type: 'asset',
        fileName: switcherAssetPath,
        source: buildExternalSwitcherSource(),
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, currentDirectory, '');
  return {
    base: normalizeBasePath(env.VITE_BASE_PATH),
    plugins: [react(), tailwindcss(), externalAppSwitcherPlugin()],
    server: { port: Number(env.VITE_DEV_PORT || 4001), strictPort: true },
    resolve: {
      alias: {
        '@': path.resolve(currentDirectory, './src'),
        '@shared': path.resolve(currentDirectory, '../../packages/shared/src'),
      },
    },
  };
});
