const { defineConfig } = require('vite');

// https://vitejs.dev/config/
module.exports = defineConfig(({ command, mode }) => {
  const isDevelopment = command === 'serve' || mode === 'development';
  
  return {
    server: {
      port: 5173,
      open: true,
      ...(isDevelopment && {
        proxy: {
          // Proxy API requests to backend (only in development)
          '/api': {
            target: 'http://localhost:5001',
            changeOrigin: true,
            secure: false,
            rewrite: (path) => path.replace(/^\/api/, '/api')
          },
          // Proxy uploads to backend (only in development)
          '/uploads': {
            target: 'http://localhost:5001',
            changeOrigin: true,
            secure: false
          }
        }
      })
    },
    build: {
      outDir: 'dist',
      sourcemap: true
    },
    define: {
      // Make environment variables available to the client
      'process.env': {}
    }
  };
}); 