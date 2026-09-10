// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [],
      },
    }),
  ],
  oxc: {
    transform: {
      reactCompiler: true,
    },
  },
  resolve: {
    dedupe: ['react', 'react-dom'],
  },
})