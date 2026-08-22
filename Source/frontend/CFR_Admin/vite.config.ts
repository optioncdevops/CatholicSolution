import path from 'node:path';
import { fileURLToPath } from 'node:url';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));

function normalizeBasePath(value?: string) {
  const trimmed = value?.trim();
  if (!trimmed || trimmed === '/') return '/';
  return `/${trimmed.replace(/^\/+|\/+$/g, '')}/`;
}

/** CFRAdmin builds only the administration application. Platform integration assets have their own package/build. */
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, currentDirectory, '');
  return {
    base: normalizeBasePath(env.VITE_BASE_PATH),
    plugins: [react(), tailwindcss()],
    server: { port: Number(env.VITE_DEV_PORT || 4011), strictPort: true },
    resolve: {
      alias: {
        '@': path.resolve(currentDirectory, './src'),
        '@shared': path.resolve(currentDirectory, './src/shared'),
        '@registry': path.resolve(currentDirectory, './src/registry'),
        '@app': path.resolve(currentDirectory, './src/app'),
        '@designSystem': path.resolve(currentDirectory, './src/designSystem'),
      },
    },
  };
});
