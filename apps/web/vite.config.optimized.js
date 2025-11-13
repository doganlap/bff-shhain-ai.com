// Bundle analyzer for development
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [
    react(),
    // Bundle analyzer - only in analyze mode
    process.env.ANALYZE && visualizer({
      filename: 'dist/bundle-analyzer.html',
      open: true,
      gzipSize: true,
      brotliSize: true,
    })
  ].filter(Boolean),
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    open: false,
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:3005', // Use BFF port
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '/api')
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: process.env.NODE_ENV !== 'production',
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Vendor chunks strategy
          if (id.includes('node_modules')) {
            // React ecosystem
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'vendor-react';
            }
            // UI Libraries
            if (id.includes('@mui') || id.includes('@emotion')) {
              return 'vendor-ui';
            }
            // Charts and visualization
            if (id.includes('recharts') || id.includes('chart.js') || id.includes('d3')) {
              return 'vendor-charts';
            }
            // Form libraries
            if (id.includes('formik') || id.includes('yup') || id.includes('react-hook-form')) {
              return 'vendor-forms';
            }
            // WebSocket and collaboration
            if (id.includes('socket.io') || id.includes('monaco-editor')) {
              return 'vendor-collaboration';
            }
            // Utilities
            if (id.includes('lodash') || id.includes('moment') || id.includes('date-fns') ||
                id.includes('axios') || id.includes('uuid')) {
              return 'vendor-utils';
            }
            // All other vendors
            return 'vendor-misc';
          }

          // Feature-based chunks for our code
          if (id.includes('/pages/')) {
            if (id.includes('Dashboard') || id.includes('dashboard')) {
              return 'feature-dashboard';
            }
            if (id.includes('Assessment') || id.includes('assessment')) {
              return 'feature-assessments';
            }
            if (id.includes('Report') || id.includes('report')) {
              return 'feature-reports';
            }
            if (id.includes('Settings') || id.includes('User') || id.includes('Organization')) {
              return 'feature-admin';
            }
            if (id.includes('Risk') || id.includes('Compliance') || id.includes('Audit')) {
              return 'feature-compliance';
            }
            // Other pages
            return 'feature-misc';
          }

          // Component chunks
          if (id.includes('/components/collaboration/')) {
            return 'feature-collaboration';
          }
          if (id.includes('/components/Subscription/')) {
            return 'feature-subscription';
          }
          if (id.includes('/components/charts/') || id.includes('/components/dashboard/')) {
            return 'feature-charts';
          }
        },
        // Optimize chunk naming
        chunkFileNames: (chunkInfo) => {
          const name = chunkInfo.name || 'chunk';
          return `js/${name}-[hash].js`;
        },
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]'
      }
    },
    // Enable advanced minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: process.env.NODE_ENV === 'production',
        drop_debugger: true,
        pure_funcs: process.env.NODE_ENV === 'production' ? ['console.log', 'console.info'] : []
      },
      format: {
        comments: false
      }
    },
    // Optimize CSS
    cssCodeSplit: true,
    // Report compressed size
    reportCompressedSize: process.env.NODE_ENV === 'production'
  },
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@mui/material',
      'socket.io-client'
    ],
    exclude: [
      // Large optional dependencies that might not be used
      '@mui/x-data-grid-generator'
    ]
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.js',
    include: ['src/**/*.{test,spec}.{js,jsx,ts,tsx}'],
    exclude: ['**/node_modules/**', '**/dist/**', '**/master-ui-kit/**'],
    passWithNoTests: true
  }
});
