import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const API_TARGET = process.env.VITE_API_TARGET || 'http://localhost:3000';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    // Without this the browser's '/api/...' calls hit the Vite dev server,
    // which happily returns index.html for every path.
    proxy: {
      '/api': {
        target: API_TARGET,
        changeOrigin: true,
      },
      '/socket.io': {
        target: API_TARGET,
        ws: true,
        changeOrigin: true,
      },
    },
  },
  preview: {
    host: true,
    port: 4173,
  },
  build: {
    // three.js is a large, deliberately separate vendor chunk.
    chunkSizeWarningLimit: 700,
    // Split the vendor bundle so the initial payload stays small.
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          motion: ['framer-motion'],
          // three.js is only pulled in by the lazily-loaded try-on route.
          three: ['three'],
        },
      },
    },
  },
});
