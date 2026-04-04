import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// 환경 파일은 프로젝트 루트 기본(envDir). 모드는 package.json 스크립트: dev=development, build=production
export default defineConfig({
  // SUPABASE_URL / SUPABASE_ANON_KEY는 import.meta.env에 노출 (VITE_ 접두사 없이 사용)
  envPrefix: ['VITE_', 'SUPABASE_URL', 'SUPABASE_ANON_KEY', 'USE_MOCK'],
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8787',
        changeOrigin: true,
      },
    },
  },
});
