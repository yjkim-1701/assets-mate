import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import macros from 'unplugin-parcel-macros';

export default defineConfig({
  plugins: [
    macros.vite(),
    react(),
  ],
  build: {
    target: ['es2022'],
    // lightningcss는 일부 UI 라이브러리(Spectrum 등)의 세밀한 레이아웃·라인하이트와 충돌해
    // 프로덕션에서만 탭·필 버튼 정렬이 어긋나 보일 수 있음 → esbuild 압축이 더 안전함
    cssMinify: 'esbuild',
  },
});
