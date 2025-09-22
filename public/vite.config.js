// vite.config.js
import { defineConfig } from 'vite';
import legacy from '@vitejs/plugin-legacy';

export default defineConfig({
  plugins: [legacy()],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
  server: {
    open: '/index.html',
  },
});