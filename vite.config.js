import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    proxy: {
      '/api': { target: 'http://localhost:3000', changeOrigin: true },
      // 兜底用：接口现在返回图片「完整 URL」，正常情况下 <img src> 会直接请求后端域名，
      // 不会再经过这条代理。保留它是为了兼容库里偶尔残留的相对路径 /uploads/xxx.png。
      // 换后端时改 target 即可（PHP 3001 / Go 3002）。
      '/uploads': { target: 'http://localhost:3000', changeOrigin: true }
    }
  }
})
