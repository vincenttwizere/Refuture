const { defineConfig } = require('vite');

// https://vitejs.dev/config/
module.exports = defineConfig({
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
}); 