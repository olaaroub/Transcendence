import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
    sourcemap: true,
	chunkSizeWarningLimit: 10000,
  },
  server: {
    port: 5173,
    open: true,
  },
});
