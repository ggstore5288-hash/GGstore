import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        rewrite: (path) => path
      }
    }
  },
  build: {
    // Minify with esbuild (fast) — default but explicit
    minify: 'esbuild',
    // Raise warning limit slightly (large pages like admin are expected)
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        // Split vendor libraries into separate cached chunks.
        // Users who revisit won't re-download React/Router if only page code changed.
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // Core React runtime — smallest, most cached chunk
            if (id.includes('react-dom') || id.includes('react/')) {
              return 'vendor-react';
            }
            // Router
            if (id.includes('react-router')) {
              return 'vendor-router';
            }
            // Icons library (lucide) is large — isolate it
            if (id.includes('lucide-react')) {
              return 'vendor-icons';
            }
            // Everything else goes into a general vendor chunk
            return 'vendor';
          }
        }
      }
    }
  }
})
