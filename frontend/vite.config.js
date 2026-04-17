import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "0.0.0.0",
    port: Number(process.env.PORT) || 5173,
    strictPort: true,
    allowedHosts: "all",
    hmr: {
      overlay: true,
      protocol: "ws",
    },
    cors: true,
    watch: {
      usePolling: true,
      interval: 300,
      ignored: ["**/node_modules/**", "**/.git/**", "**/dist/**"],
    },
  },
  plugins: [react()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // React core
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return 'react-vendor';
          }
          // UI libraries
          if (id.includes('node_modules/@radix-ui') || id.includes('node_modules/lucide-react')) {
            return 'ui-vendor';
          }
          // Utilities
          if (id.includes('node_modules/clsx') || id.includes('node_modules/class-variance-authority') || id.includes('node_modules/tailwind-merge')) {
            return 'utils-vendor';
          }
          // Form libraries
          if (id.includes('node_modules/react-hook-form') || id.includes('node_modules/@hookform')) {
            return 'form-vendor';
          }
          // Animation
          if (id.includes('node_modules/framer-motion')) {
            return 'animation-vendor';
          }
          // Networking
          if (id.includes('node_modules/axios') || id.includes('node_modules/socket.io-client')) {
            return 'network-vendor';
          }
          // Date utilities
          if (id.includes('node_modules/date-fns')) {
            return 'date-vendor';
          }
          // Cloudinary
          if (id.includes('node_modules/@cloudinary')) {
            return 'cloudinary-vendor';
          }
          // Features
          if (id.includes('src/features')) {
            return 'features';
          }
          // Components
          if (id.includes('src/components')) {
            return 'components';
          }
        },
      },
    },
    chunkSizeWarningLimit: 1000,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
  },
}));
