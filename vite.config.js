import { defineConfig } from 'vite';

export default defineConfig({
  base: '/simcorp/',
  root: '.',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
  server: {
    port: 3000,
    open: true,
  },
});
