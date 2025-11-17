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
    port: 5177,
    host: '0.0.0.0',
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3006',
        changeOrigin: true,
        secure: false,
        ws: true,
        rewrite: (path) => path
      }
    },
    cors: {
      origin: ['http://localhost:3001', 'http://localhost:5173', 'http://localhost:5174', 'http://localhost:5177'],
      credentials: true,
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Tenant-Id']
    },
    fs: {
      allow: ['..']
    }
  },
  preview: {
    port: 4173,
    host: '0.0.0.0',
    cors: true
  },
  define: {
    global: 'globalThis',
    'process.env': {},
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'lucide-react', 'framer-motion', '@emotion/is-prop-valid'],
    esbuildOptions: {
      // Handle strict mode issues with legacy dependencies
      target: 'es2020',
      supported: {
        'top-level-await': true
      }
    }
  },
  resolve: {
    alias: {
      '@': '/src'
    }
  },
  build: {
    // Increase chunk size threshold to reduce warning logs during the build
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      external: (id) => {
        // Handle @emotion/is-prop-valid require issue
        if (id.includes('@emotion/is-prop-valid')) {
          return false;
        }
        return false;
      },
      output: {
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['lucide-react', 'framer-motion', 'sonner'],
          charts: ['recharts'],
          utils: ['axios', 'date-fns', 'uuid'],
          plotly: ['react-plotly.js', 'plotly.js']
        },
        globals: {
          'react': 'React',
          'react-dom': 'ReactDOM'
        }
      }
    },
    sourcemap: true,
    minify: 'esbuild',
    target: 'es2020'
  }
})
