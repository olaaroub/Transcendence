import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  root: "src",
  publicDir: resolve(process.cwd(), "assets"),
  build: {
    outDir: resolve(process.cwd(), "dist"),
    emptyOutDir: true,
    rollupOptions: {
      input: resolve(process.cwd(), "src", "index.html"),
    },
  },

  server: {
    proxy: {
      '/api/': {

        // host.docker.internal is a special DNS name that
        // docker provides to containers so they can reach the host machine.
        target: 'http://host.docker.internal:3000',

        changeOrigin: true,

        // rewrite: (path) => path.replace(/^\/api/, ''),
        // hadi b7al rewrite dial nginx (blast ma tsift /api/signUp tatsift /signUp bo7dha l backend)
      }
    }
  }
});