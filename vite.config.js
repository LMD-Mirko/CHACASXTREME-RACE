import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import viteCompression from 'vite-plugin-compression'

/**
 * Tunnel hacia el backend desplegado.
 * - Por defecto: localhost (levanta `npm run tunnel` → SSH -L 8888/8080).
 * - Sin tunnel: VITE_VPS_DIRECT=1 npm run dev
 */
const useDirectVps = process.env.VITE_VPS_DIRECT === '1'
const API_TARGET = useDirectVps ? 'http://24.199.82.193:8888' : 'http://127.0.0.1:8888'
const WS_TARGET = useDirectVps ? 'http://24.199.82.193:8080' : 'http://127.0.0.1:8080'

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
  server: {
    proxy: {
      '/api': {
        target: API_TARGET,
        changeOrigin: true,
        secure: false,
      },
      '/storage': {
        target: API_TARGET,
        changeOrigin: true,
        secure: false,
      },
      '/broadcasting': {
        target: API_TARGET,
        changeOrigin: true,
        secure: false,
      },
      '/app': {
        target: WS_TARGET,
        changeOrigin: true,
        secure: false,
        ws: true,
      },
      '/apps': {
        target: WS_TARGET,
        changeOrigin: true,
        secure: false,
        ws: true,
      },
    },
  },
  build: {
    target: 'esnext',
    cssCodeSplit: true,
    assetsInlineLimit: 8192,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-vue':   ['vue', 'vue-router'],
          'vendor-i18n':  ['vue-i18n'],
          'vendor-gsap':  ['gsap'],
          'vendor-icons': ['lucide-vue-next'],
        }
      }
    },
    chunkSizeWarningLimit: 600,
  }
})
