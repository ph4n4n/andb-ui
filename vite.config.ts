import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import ViteYaml from '@modyfi/vite-plugin-yaml'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue(), ViteYaml()],
  base: './',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html')
      },
      external: [
        'electron',
        'electron-store',
        'better-sqlite3',
        '@andb/core',
        'mysql2',
        'path',
        'fs'
      ]
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  server: {
    port: 5173,
    strictPort: true
  },
  optimizeDeps: {
    exclude: [
      'electron',
      'electron-store',
      'better-sqlite3',
      '@andb/core',
      'mysql2'
    ]
  }
})
