import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    outDir: 'dist',
    sourcemap: true,
	chunkSizeWarningLimit: 10000,
	rollupOptions: {
      output: {
        entryFileNames: 'main.js',
        chunkFileNames: '[name].js',
        assetFileNames: '[name].[ext]',
      },
    },
  },
  server: {
    port: 80,
    open: false,
    host: '0.0.0.0',
    allowedHosts: [
      'pong-offline',
    ],
  },
});
