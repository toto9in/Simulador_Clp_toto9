import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // GitHub Pages base path (update this to match your repo name)
  // For repo: https://github.com/username/Simulador_Clp
  // Use: base: '/Simulador_Clp/'
  // For custom domain or root deployment, use: base: '/'
  base: process.env.GITHUB_PAGES === 'true' ? '/Simulador_Clp/' : '/',

  // Explicitly set public directory
  publicDir: 'public',

  build: {
    // Output directory
    outDir: 'dist',
    // Assets directory within outDir
    assetsDir: 'assets',
    // Copy public directory to dist
    copyPublicDir: true,
    // Source map for debugging
    sourcemap: false,
    // Minify for production
    minify: 'esbuild',
    // Asset file names pattern
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          // Keep original structure for images and examples
          if (assetInfo.name?.match(/\.(png|jpg|jpeg|gif|svg)$/i)) {
            return 'assets/[name][extname]';
          }
          if (assetInfo.name?.endsWith('.txt')) {
            return 'examples/[name][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        },
      },
    },
  },
})
