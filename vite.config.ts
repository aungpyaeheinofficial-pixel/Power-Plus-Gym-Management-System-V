import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/',
    },
  },
  // Add base path for Capacitor
  base: './',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    // Ensure proper paths for mobile
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
  // Server config for development
  server: {
    host: '0.0.0.0', // Allow access from mobile device on same network
    port: 5173,
  },
});