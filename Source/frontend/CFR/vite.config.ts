import path from 'node:path';
import { fileURLToPath } from 'node:url';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));

/** CFR builds only the CFR application. */
export default defineConfig({
  base: '/',
  plugins: [react(), tailwindcss()],
  server: { port: 4001, strictPort: true },
  resolve: {
    alias: {
      '@': path.resolve(currentDirectory, './src'),
      '@app': path.resolve(currentDirectory, './src/app'),
      '@shared': path.resolve(currentDirectory, './src/shared'),
      '@registry': path.resolve(currentDirectory, './src/registry'),
    },
  },
});
