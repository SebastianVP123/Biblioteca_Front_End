import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/proxy-images': {
        target: 'https://www.biografiasyvidas.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/proxy-images/, '')
      }
    }
  }
})
