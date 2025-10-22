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
});
