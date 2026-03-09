import react from '@vitejs/plugin-react'
import UnoCss from 'unocss/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    UnoCss(),
    react(),
  ],
})
