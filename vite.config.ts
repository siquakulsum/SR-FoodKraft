import path from 'path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './Admin/src'),
            '@admin': path.resolve(__dirname, './Admin/src'),
            '@customer': path.resolve(__dirname, './Customer/src'),
        },
    },
    server: {
        port: 5173,
        proxy: {
            '/api': {
                target: 'http://localhost:5000',
                changeOrigin: true,
                secure: false,
            },
            '/admin-api': {
                target: 'http://localhost:5000',
                changeOrigin: true,
                secure: false,
                rewrite: (path) => path.replace(/^\/admin-api/, '/admin'),
            },
        },
    },
    optimizeDeps: {
        exclude: ['lucide-react'],
    },
});
