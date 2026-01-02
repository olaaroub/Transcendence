import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  build: {
	outDir: 'dist',
	chunkSizeWarningLimit: 10000,
	rollupOptions: {
	  output: {
		entryFileNames: 'main.js',
		chunkFileNames: '[name].js',
		assetFileNames: '[name].[ext]',
	  },
	},
  },
});
