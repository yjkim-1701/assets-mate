/**
 * mockup용 샘플 이미지를 그라데이션+라벨로 생성해 public/sample 에 씁니다.
 * 실행: npm run generate:sample-images
 */
import sharp from 'sharp';
import { mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, '../public/sample');

function hash(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function escapeXml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function colorsFor(name) {
  const h = hash(name);
  const h1 = h % 360;
  const h2 = (h + 48 + (h % 60)) % 360;
  return {
    c1: `hsl(${h1}, 42%, 52%)`,
    c2: `hsl(${h2}, 48%, 38%)`,
  };
}

/**
 * @typedef {{ file: string, w: number, h: number, fmt: 'jpeg' | 'png' }} Spec
 */

/** @type {Spec[]} */
const SPECS = [
  // mock.ts ASSETS
  { file: 'campaign_summer_hero.jpg', w: 1920, h: 1080, fmt: 'jpeg' },
  { file: 'promo_banner_v2.png', w: 1920, h: 1080, fmt: 'png' },
  { file: 'social_post_03.jpg', w: 1080, h: 1080, fmt: 'jpeg' },
  { file: 'product_lifestyle_01.jpg', w: 1600, h: 1200, fmt: 'jpeg' },
  { file: 'email_header_q2.png', w: 600, h: 200, fmt: 'png' },
  { file: 'infographic_stats.png', w: 800, h: 1600, fmt: 'png' },
  { file: 'hero_banner_winter.jpg', w: 1920, h: 1080, fmt: 'jpeg' },
  // 비디오용 포스터 (UI는 .mp4 대신 이 파일을 씀)
  { file: 'video_teaser_15s_poster.jpg', w: 1920, h: 1080, fmt: 'jpeg' },
  // Collaboration · BrandDashboard 등 문서에 나온 파일명
  { file: 'summer_banner_v3.png', w: 1600, h: 900, fmt: 'png' },
  { file: 'social_post_agency.jpg', w: 1080, h: 1080, fmt: 'jpeg' },
  { file: 'email_header_final.png', w: 600, h: 200, fmt: 'png' },
  { file: 'product_shot_01.jpg', w: 1200, h: 1200, fmt: 'jpeg' },
  { file: 'stock_lifestyle_01.jpg', w: 1200, h: 800, fmt: 'jpeg' },
  { file: 'model_portrait_02.jpg', w: 800, h: 1000, fmt: 'jpeg' },
  { file: 'bg_texture_03.png', w: 512, h: 512, fmt: 'png' },
];

function fontSizeFor(w, h) {
  const m = Math.min(w, h);
  if (m < 220) return Math.max(10, Math.floor(m / 18));
  if (m < 400) return Math.max(12, Math.floor(m / 14));
  return Math.max(14, Math.floor(m / 12));
}

function buildSvg(file, w, h) {
  const { c1, c2 } = colorsFor(file);
  const label = escapeXml(file.replace(/\.[^.]+$/, ''));
  const fs = fontSizeFor(w, h);
  const subFs = Math.max(10, Math.floor(fs * 0.45));
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${c1}"/>
      <stop offset="100%" style="stop-color:${c2}"/>
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#g)"/>
  <text x="50%" y="${h * 0.48}" text-anchor="middle" font-family="system-ui,-apple-system,sans-serif" font-size="${fs}" font-weight="600" fill="rgba(255,255,255,0.42)">${label}</text>
  <text x="50%" y="${h * 0.48 + fs + 8}" text-anchor="middle" font-family="system-ui,-apple-system,sans-serif" font-size="${subFs}" fill="rgba(255,255,255,0.28)">${w}×${h} · sample</text>
</svg>`;
}

async function writeOne(spec) {
  const { file, w, h, fmt } = spec;
  const svg = buildSvg(file, w, h);
  const pipeline = sharp(Buffer.from(svg)).resize(w, h, { fit: 'fill' });
  const outPath = join(OUT, file);
  if (fmt === 'jpeg') {
    await pipeline.jpeg({ quality: 85, mozjpeg: true }).toFile(outPath);
  } else {
    await pipeline.png({ compressionLevel: 9 }).toFile(outPath);
  }
  console.log('wrote', file);
}

async function main() {
  if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true });
  for (const spec of SPECS) {
    await writeOne(spec);
  }
  console.log('Done. Output:', OUT);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
