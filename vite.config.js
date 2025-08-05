import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  root: "www", 
  publicDir: "../public",
  build: {
    target: ['es2015'],
    outDir: "../dist", 
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'www/index.html'),
        editor: resolve(__dirname, 'www/editor.html'), 
      },
    },
  },
});
