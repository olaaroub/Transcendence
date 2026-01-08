import { defineConfig } from 'vite';

export default defineConfig({
  base: '/game/online/',
  build: {
	outDir: '../dist/client',
	emptyOutDir: true,
	chunkSizeWarningLimit: 10000,
	rollupOptions: {
	  output: {
		entryFileNames: 'client.js',
		chunkFileNames: '[name].js',
		assetFileNames: '[name].[ext]',
	  },
	},
  },
});
