const { defineConfig } = require('vite');

// https://vitejs.dev/config/
module.exports = defineConfig({
  server: {
    port: 5173,
    open: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
}); 