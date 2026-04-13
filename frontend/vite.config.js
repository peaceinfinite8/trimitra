import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rolldownOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react') || id.includes('react-router-dom')) {
            return 'vendor-react'
          }

          if (id.includes('node_modules/framer-motion')) {
            return 'vendor-motion'
          }

          if (id.includes('node_modules/gsap')) {
            return 'vendor-gsap'
          }

          return undefined
        },
      },
    },
  },
})
