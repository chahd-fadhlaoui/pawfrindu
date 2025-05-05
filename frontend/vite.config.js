import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: ['5063-41-62-77-218.ngrok-free.app'], // Allow ngrok host
    proxy: {
      '/api': {
        target: 'http://localhost:8500', // Backend server
        changeOrigin: true,
        secure: false,
      },
    },
  },
});