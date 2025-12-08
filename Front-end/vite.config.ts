import { defineConfig } from "vite";
import { resolve } from "path";
import fs from "fs";

export default defineConfig(({ command }) => {

  const config = {
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
      host: '0.0.0.0',
      proxy: {
        '/api/': {
          target: 'http://modSecurity-dev:80',
          changeOrigin: true,
          secure: false,
        }
      },
      https: undefined
    }
  };

  if (command === 'serve') {
    try {
      config.server.https = {
        key: fs.readFileSync('/app/certs/nginx.key'),
        cert: fs.readFileSync('/app/certs/nginx.crt'),
      };
    } catch (e) {
      console.warn("SSL Certs not found. Falling back to HTTP for Dev Server.");
    }
  }

  return config;
});
