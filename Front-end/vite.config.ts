import { defineConfig, UserConfig } from "vite";
import { resolve } from "path";
import fs from "fs";

export default defineConfig(({ command }) => {

  const serviceExt = process.env.SERVICE_EXT || '-dev';

  const config: UserConfig = {
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
          target: `http://modSecurity${serviceExt}:8080`,
          changeOrigin: true,
          secure: false,
          ws: true
        },
      },
    }
  };

  if (command === 'serve') {
    try {
      config.server = config.server || {};
      config.server.https = {
        key: fs.readFileSync('/app/certs/nginx.key'),
        cert: fs.readFileSync('/app/certs/nginx.crt'),
      };
    } catch (e) {
      console.warn("SSL Certs not found. Falling back to HTTP for Dev Server.", e);
    }
  }

  return config;
});
