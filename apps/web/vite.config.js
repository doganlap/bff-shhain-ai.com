/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Consolidated Vite configuration for the web app
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/__tests__/setup.js',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'src/__tests__/',
        '**/*.spec.{js,jsx}',
        '**/*.test.{js,jsx}',
        '**/mockData/**',
        'vite.config.js',
      ],
    },
    include: ['src/**/*.{test,spec}.{js,jsx}'],
    exclude: ['node_modules', 'dist', '.idea', '.git', '.cache'],
  },
  server: {
    port: 5173,
    host: '0.0.0.0',
    proxy: {
      "/api": {
        target: "http://localhost:3005",
        changeOrigin: true,
        secure: false,
      },
    },
    cors: {
      origin: ['http://localhost:3001', 'http://localhost:5173', 'http://localhost:5174'],
      credentials: true,
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Tenant-Id']
    },
  },
  preview: {
    port: 4173,
    host: '0.0.0.0',
    cors: true
  },
  define: {
    global: 'globalThis',
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'lucide-react', 'framer-motion']
  },
  build: {
    // Increase chunk size threshold to reduce warning logs during the build
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      output: {
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['lucide-react', 'framer-motion', 'sonner'],
          charts: ['recharts'],
          utils: ['axios', 'date-fns', 'uuid']
        }
      }
    },
    sourcemap: false,
    minify: 'esbuild'
  }
})
