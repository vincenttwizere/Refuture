const { defineConfig } = require('vite');

// https://vitejs.dev/config/
module.exports = defineConfig({
  server: {
    port: 5173,
    open: true,
    proxy: {
      // Proxy API requests to backend
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '/api')
      },
      // Proxy uploads to backend
      '/uploads': {
        target: 'http://localhost:5001',
        changeOrigin: true,
        secure: false
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
}); 