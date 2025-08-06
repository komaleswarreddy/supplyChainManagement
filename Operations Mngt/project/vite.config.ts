import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    hmr: {
      port: 24678,
    },
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  define: {
    'import.meta.env.VITE_WS_HOST': JSON.stringify('localhost'),
    'import.meta.env.VITE_WS_PORT': JSON.stringify('3000'),
    'import.meta.env.VITE_WS_PROTOCOL': JSON.stringify('ws'),
  },
});