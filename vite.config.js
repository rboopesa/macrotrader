import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // During local dev, proxy /api calls to Vercel dev server
  // so you don't need to set up a separate server
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:3001', // Vercel dev runs functions on 3001; 3000 is Vite itself
        changeOrigin: true,
      }
    }
  }
})
