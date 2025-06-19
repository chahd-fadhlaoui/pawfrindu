import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: ['963d-102-104-201-95.ngrok-free.app'], // Allow ngrok host
    proxy: {
      '/api': {
        target: 'http://localhost:8500', // Backend server
        changeOrigin: true,
        secure: false,
      },
    },
  },
});