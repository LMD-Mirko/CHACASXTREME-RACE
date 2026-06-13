import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import viteCompression from 'vite-plugin-compression'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    viteCompression({
      algorithm: 'gzip',
      ext: '.gz',
    }),
    viteCompression({
      algorithm: 'brotliCompress',
      ext: '.br',
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    target: 'esnext',             // JS moderno → bundle más pequeño
    cssCodeSplit: true,           // CSS por chunk → solo carga lo necesario
    assetsInlineLimit: 8192,      // Inlinea assets < 8KB como base64 (SVGs, íconos pequeños)
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-vue':   ['vue', 'vue-router'],
          'vendor-i18n':  ['vue-i18n'],
          'vendor-gsap':  ['gsap'],
          'vendor-icons': ['lucide-vue-next'],  // Íconos separados (lib grande)
        }
      }
    },
    chunkSizeWarningLimit: 600,
  }
})
