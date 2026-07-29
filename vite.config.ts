import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    target: 'es2022',
    cssCodeSplit: true,
    reportCompressedSize: false,
    rollupOptions: {
      output: {
        // Firebase SDK живёт отдельным чанком: публичные страницы его не грузят,
        // он подтягивается только при входе в админку.
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('firebase') || id.includes('@firebase')) return 'firebase'
            if (id.includes('react-hook-form')) return 'forms'
            if (id.includes('react-router') || id.includes('react-dom') || id.includes('/react/'))
              return 'react-vendor'
          }
          return undefined
        },
      },
    },
  },
  ssr: {
    noExternal: ['lucide-react'],
  },
})
