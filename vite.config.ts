import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import dyadComponentTagger from '@dyad-sh/react-vite-component-tagger';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [dyadComponentTagger(), 
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    chunkSizeWarningLimit: 5000, // Higher limit for Vercel deployment
    sourcemap: false, // Disable sourcemaps for faster builds on Vercel
    minify: 'esbuild', // Use esbuild for faster minification
    target: 'es2020', // Modern target for better optimization
    rollupOptions: {
      output: {
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
        manualChunks: (id) => {
          // Better chunk splitting strategy for Vercel
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-vendor';
            }
            if (id.includes('@radix-ui')) {
              return 'ui-vendor';
            }
            if (id.includes('firebase') || id.includes('@firebase')) {
              return 'firebase-vendor';
            }
            if (id.includes('framer-motion')) {
              return 'animation-vendor';
            }
            // Group other vendors
            return 'vendor';
          }
        },
      },
      external: [],
    },
  },
}));
