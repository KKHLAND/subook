import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { viteSingleFile } from 'vite-plugin-singlefile'

// 두 가지 빌드 모드
//   npm run build        → dist/index.html 단일 파일 (더블클릭 실행, 배포용)
//   npm run build:web    → 일반 분할 빌드 (정적 호스팅용)
const singleFile = process.env.SUBOOK_SPLIT !== '1'

export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss(), ...(singleFile ? [viteSingleFile()] : [])],
  server: { port: 5233 },
  build: {
    target: 'es2022',
    assetsInlineLimit: singleFile ? 100_000_000 : 4096,
    chunkSizeWarningLimit: 8000,
  },
  worker: { format: 'es' },
})
