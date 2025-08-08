import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // gunakan relative base agar asset bekerja di file:// scheme electron production
  base: './',
  build: {
    outDir: 'dist',
  },
  plugins: [react()],
})
