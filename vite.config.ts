import { defineConfig } from "vite";

export default defineConfig({
  server: { port: 5173 },
  // PostCSS inline: impede o Vite de herdar configs de pastas acima do projeto
  css: { postcss: {} },
  build: {
    // o Phaser sozinho passa de 1 MB; separar em chunk próprio melhora o cache
    chunkSizeWarningLimit: 1600,
    rollupOptions: { output: { manualChunks: { phaser: ["phaser"] } } },
  },
});
