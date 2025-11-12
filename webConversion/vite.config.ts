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
})
