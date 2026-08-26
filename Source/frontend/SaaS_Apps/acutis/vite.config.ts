import path from 'node:path';
import { fileURLToPath } from 'node:url';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, currentDirectory, '');
  return {
    plugins: [react(), tailwindcss()],
    server: { port: Number(env.VITE_DEV_PORT || 4010), strictPort: true },
    resolve: {
      alias: {
        '@': path.resolve(currentDirectory, './src'),
      },
    },
  };
});
