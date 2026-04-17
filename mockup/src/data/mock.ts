export const ASSETS = [
  { id: 'a1', name: 'campaign_summer_hero.jpg', type: 'image', size: '4.2 MB', dim: '3840×2160', campaign: '2026 Summer', lang: 'ko', brandScore: 92, status: 'approved', modified: '2026-04-14' },
  { id: 'a2', name: 'promo_banner_v2.png', type: 'image', size: '1.8 MB', dim: '1920×1080', campaign: '2026 Summer', lang: 'en', brandScore: 68, status: 'review', modified: '2026-04-15' },
  { id: 'a3', name: 'social_post_03.png', type: 'image', size: '980 KB', dim: '1080×1080', campaign: 'Brand Refresh', lang: 'ko', brandScore: 45, status: 'violation', modified: '2026-04-16' },
  { id: 'a4', name: 'product_lifestyle_01.jpg', type: 'image', size: '5.1 MB', dim: '4000×3000', campaign: '2026 Summer', lang: 'ko', brandScore: 88, status: 'approved', modified: '2026-04-13' },
  { id: 'a5', name: 'email_header_q2.png', type: 'image', size: '640 KB', dim: '600×200', campaign: 'Q2 Newsletter', lang: 'en', brandScore: 95, status: 'approved', modified: '2026-04-12' },
  { id: 'a6', name: 'video_teaser_15s.mp4', type: 'video', size: '12.4 MB', dim: '1920×1080', campaign: 'Brand Refresh', lang: 'ko', brandScore: 78, status: 'review', modified: '2026-04-11' },
  { id: 'a7', name: 'infographic_stats.png', type: 'image', size: '2.3 MB', dim: '1200×2400', campaign: 'Q2 Newsletter', lang: 'ko', brandScore: 52, status: 'violation', modified: '2026-04-10' },
  { id: 'a8', name: 'hero_banner_winter.jpg', type: 'image', size: '3.7 MB', dim: '2560×1440', campaign: 'Winter 2025', lang: 'ko', brandScore: 91, status: 'approved', modified: '2026-03-20' },
];

export const CAMPAIGNS = [
  { id: 'c1', name: '2026 Summer', status: 'active', progress: 72, assets: 24, pending: 3 },
  { id: 'c2', name: 'Brand Refresh', status: 'active', progress: 45, assets: 18, pending: 7 },
  { id: 'c3', name: 'Q2 Newsletter', status: 'active', progress: 90, assets: 8, pending: 1 },
  { id: 'c4', name: 'Winter 2025', status: 'completed', progress: 100, assets: 32, pending: 0 },
];

export const BRAND_VIOLATIONS = [
  { id: 'v1', assetId: 'a3', assetName: 'social_post_03.png', type: 'color', description: '브랜드 컬러 불일치 - Primary Blue #0066CC 대신 #3399FF 사용', severity: 'high', scoreBefore: 45, scoreAfter: 88 },
  { id: 'v2', assetId: 'a3', assetName: 'social_post_03.png', type: 'logo', description: '로고 여백 부족 - 최소 여백 24px 미달 (현재 12px)', severity: 'high', scoreBefore: 45, scoreAfter: 88 },
  { id: 'v3', assetId: 'a7', assetName: 'infographic_stats.png', type: 'text', description: '브랜드 폰트 미사용 - Arial 대신 Noto Sans KR 사용 필요', severity: 'medium', scoreBefore: 52, scoreAfter: 85 },
  { id: 'v4', assetId: 'a2', assetName: 'promo_banner_v2.png', type: 'background', description: '배경 톤 불일치 - 브랜드 톤보다 차가운 색상 사용', severity: 'low', scoreBefore: 68, scoreAfter: 94 },
];

export const AI_FIX_INBOX = [
  { id: 'f1', assetId: 'a3', assetName: 'social_post_03.png', violations: ['색상 톤', '로고 여백'], requester: 'Kim', requestedAt: '2026-04-16 14:30', status: 'pending' as const, scoreBefore: 45, scoreAfter: 88 },
  { id: 'f2', assetId: 'a2', assetName: 'promo_banner_v2.png', violations: ['배경 톤'], requester: 'Park', requestedAt: '2026-04-16 13:00', status: 'approved' as const, scoreBefore: 68, scoreAfter: 94 },
  { id: 'f3', assetId: 'a7', assetName: 'infographic_stats.png', violations: ['색상', '텍스트'], requester: 'Lee', requestedAt: '2026-04-16 11:00', status: 'rejected' as const, scoreBefore: 52, scoreAfter: 82 },
  { id: 'f4', assetId: 'a6', assetName: 'video_teaser_15s.mp4', violations: ['색상 톤'], requester: 'Kim', requestedAt: '2026-04-15 16:00', status: 'changes_requested' as const, scoreBefore: 78, scoreAfter: 90 },
];

export const SOCIAL_CHANNELS = [
  { id: 'ig-feed', name: 'Instagram 피드', width: 1080, height: 1080 },
  { id: 'ig-story', name: 'Instagram 스토리', width: 1080, height: 1920 },
  { id: 'fb-feed', name: 'Facebook 피드', width: 1200, height: 630 },
  { id: 'fb-cover', name: 'Facebook 커버', width: 820, height: 312 },
  { id: 'yt-thumb', name: 'YouTube 썸네일', width: 1280, height: 720 },
  { id: 'yt-banner', name: 'YouTube 배너', width: 2560, height: 1440 },
  { id: 'li-feed', name: 'LinkedIn 피드', width: 1200, height: 627 },
  { id: 'x-feed', name: 'X (Twitter) 피드', width: 1600, height: 900 },
];

export const CALENDAR_EVENTS = [
  { id: 'e1', title: 'Summer Campaign Launch', date: '2026-04-20', channel: 'Instagram', status: 'scheduled' },
  { id: 'e2', title: 'Product Teaser', date: '2026-04-22', channel: 'YouTube', status: 'draft' },
  { id: 'e3', title: 'Newsletter Banner', date: '2026-04-25', channel: 'Email', status: 'scheduled' },
  { id: 'e4', title: 'LinkedIn Thought Leadership', date: '2026-04-28', channel: 'LinkedIn', status: 'draft' },
];

export type FixStatus = 'pending' | 'approved' | 'rejected' | 'changes_requested';

export const STATUS_LABELS: Record<FixStatus, string> = {
  pending: '대기',
  approved: '승인',
  rejected: '거절',
  changes_requested: '수정요청',
};
