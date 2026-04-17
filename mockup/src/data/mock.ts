/** 검색·발견(F-1) mock 메타 — 실제 임베딩/해시 대신 고정 필드 */
export type Asset = {
  id: string;
  name: string;
  type: 'image' | 'video';
  size: string;
  dim: string;
  campaign: string;
  lang: string;
  brandScore: number;
  status: 'approved' | 'review' | 'violation';
  modified: string;
  season: 'spring' | 'summer' | 'fall' | 'winter' | 'year-round';
  channels: string[];
  format: 'jpeg' | 'png' | 'webp' | 'mp4';
  taxonomyPath: string[];
  dominantColors: string[];
  semanticHints: string[];
  /** 비주얼 유사도 mock 클러스터 */
  visualBucket: number;
  /** F-1.5 다국어 동일 캠페인 변형 그룹 */
  langGroupId: string | null;
  /** F-1.6 중복 그룹 */
  duplicateGroupId: string | null;
  assetKind: 'photo' | 'illustration' | 'banner' | 'logo' | 'video' | 'document';
};

export const ASSETS: Asset[] = [
  {
    id: 'a1',
    name: 'campaign_summer_hero.jpg',
    type: 'image',
    size: '4.2 MB',
    dim: '3840×2160',
    campaign: '2026 Summer',
    lang: 'ko',
    brandScore: 92,
    status: 'approved',
    modified: '2026-04-14',
    season: 'summer',
    channels: ['instagram', 'display'],
    format: 'jpeg',
    taxonomyPath: ['마케팅 자산', '캠페인', '2026 Summer', '히어로 배너'],
    dominantColors: ['#1D4ED8', '#FBBF24', '#0F172A'],
    semanticHints: ['봄 시즌', '아웃도어', '라이프스타일', '히어로', '캠페인'],
    visualBucket: 1,
    langGroupId: 'lg-summer-hero',
    duplicateGroupId: 'dup-near-1',
    assetKind: 'banner',
  },
  {
    id: 'a2',
    name: 'promo_banner_v2.png',
    type: 'image',
    size: '1.8 MB',
    dim: '1920×1080',
    campaign: '2026 Summer',
    lang: 'en',
    brandScore: 68,
    status: 'review',
    modified: '2026-04-15',
    season: 'summer',
    channels: ['facebook', 'display'],
    format: 'png',
    taxonomyPath: ['마케팅 자산', '캠페인', '2026 Summer', '프로모션'],
    dominantColors: ['#2563EB', '#E2E8F0', '#64748B'],
    semanticHints: ['프로모션', '배너', '여름', '세일'],
    visualBucket: 2,
    langGroupId: 'lg-summer-hero',
    duplicateGroupId: null,
    assetKind: 'banner',
  },
  {
    id: 'a3',
    name: 'social_post_03.png',
    type: 'image',
    size: '980 KB',
    dim: '1080×1080',
    campaign: 'Brand Refresh',
    lang: 'ko',
    brandScore: 45,
    status: 'violation',
    modified: '2026-04-16',
    season: 'year-round',
    channels: ['instagram', 'tiktok'],
    format: 'png',
    taxonomyPath: ['마케팅 자산', '소셜', 'Brand Refresh', '피드'],
    dominantColors: ['#DC2626', '#FEF2F2', '#1F2937'],
    semanticHints: ['소셜', '피드', '정사각형', '브랜드'],
    visualBucket: 3,
    langGroupId: null,
    duplicateGroupId: 'dup-near-2',
    assetKind: 'photo',
  },
  {
    id: 'a4',
    name: 'product_lifestyle_01.jpg',
    type: 'image',
    size: '5.1 MB',
    dim: '4000×3000',
    campaign: '2026 Summer',
    lang: 'ko',
    brandScore: 88,
    status: 'approved',
    modified: '2026-04-13',
    season: 'summer',
    channels: ['instagram', 'youtube'],
    format: 'jpeg',
    taxonomyPath: ['마케팅 자산', '캠페인', '2026 Summer', '제품 라이프스타일'],
    dominantColors: ['#047857', '#ECFDF5', '#334155'],
    semanticHints: ['제품', '라이프스타일', '실내', '카페 인테리어'],
    visualBucket: 1,
    langGroupId: null,
    duplicateGroupId: 'dup-near-1',
    assetKind: 'photo',
  },
  {
    id: 'a5',
    name: 'email_header_q2.png',
    type: 'image',
    size: '640 KB',
    dim: '600×200',
    campaign: 'Q2 Newsletter',
    lang: 'en',
    brandScore: 95,
    status: 'approved',
    modified: '2026-04-12',
    season: 'spring',
    channels: ['linkedin', 'email'],
    format: 'png',
    taxonomyPath: ['마케팅 자산', '이메일', 'Q2 Newsletter', '헤더'],
    dominantColors: ['#4338CA', '#EEF2FF', '#312E81'],
    semanticHints: ['이메일', '헤더', '뉴스레터', '미니멀'],
    visualBucket: 2,
    langGroupId: 'lg-newsletter',
    duplicateGroupId: null,
    assetKind: 'banner',
  },
  {
    id: 'a6',
    name: 'video_teaser_15s.mp4',
    type: 'video',
    size: '12.4 MB',
    dim: '1920×1080',
    campaign: 'Brand Refresh',
    lang: 'ko',
    brandScore: 78,
    status: 'review',
    modified: '2026-04-11',
    season: 'year-round',
    channels: ['youtube', 'tiktok'],
    format: 'mp4',
    taxonomyPath: ['마케팅 자산', '비디오', 'Brand Refresh', '티저'],
    dominantColors: ['#0F172A', '#38BDF8', '#F8FAFC'],
    semanticHints: ['비디오', '티저', '다이내믹', '모션'],
    visualBucket: 4,
    langGroupId: null,
    duplicateGroupId: null,
    assetKind: 'video',
  },
  {
    id: 'a7',
    name: 'infographic_stats.png',
    type: 'image',
    size: '2.3 MB',
    dim: '1200×2400',
    campaign: 'Q2 Newsletter',
    lang: 'ko',
    brandScore: 52,
    status: 'violation',
    modified: '2026-04-10',
    season: 'spring',
    channels: ['linkedin', 'x'],
    format: 'png',
    taxonomyPath: ['마케팅 자산', '인포그래픽', 'Q2 Newsletter', '통계'],
    dominantColors: ['#1D4ED8', '#DBEAFE', '#64748B'],
    semanticHints: ['인포그래픽', '통계', '데이터', '세로형'],
    visualBucket: 2,
    langGroupId: 'lg-newsletter',
    duplicateGroupId: 'dup-near-2',
    assetKind: 'document',
  },
  {
    id: 'a8',
    name: 'hero_banner_winter.jpg',
    type: 'image',
    size: '3.7 MB',
    dim: '2560×1440',
    campaign: 'Winter 2025',
    lang: 'ko',
    brandScore: 91,
    status: 'approved',
    modified: '2026-03-20',
    season: 'winter',
    channels: ['display', 'facebook'],
    format: 'jpeg',
    taxonomyPath: ['마케팅 자산', '캠페인', 'Winter 2025', '히어로'],
    dominantColors: ['#1E3A5F', '#93C5FD', '#F1F5F9'],
    semanticHints: ['겨울', '히어로', '눈', '쿨톤'],
    visualBucket: 3,
    langGroupId: null,
    duplicateGroupId: null,
    assetKind: 'banner',
  },
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

/** F-2.4 템플릿 잠금 영역 — 목업 좌표(%) */
export type TemplateLockRegion = {
  id: string;
  label: string;
  kind: 'logo' | 'font' | 'color' | 'editable';
  locked: boolean;
  rect: { x: number; y: number; w: number; h: number };
};

export const TEMPLATE_LOCK_DEMO = {
  templateName: 'Summer Sale — 에이전시 배너',
  regions: [
    {
      id: 'r-logo',
      label: '로고',
      kind: 'logo' as const,
      locked: true,
      rect: { x: 6, y: 8, w: 22, h: 14 },
    },
    {
      id: 'r-headline',
      label: '헤드라인 (편집 가능)',
      kind: 'font' as const,
      locked: false,
      rect: { x: 8, y: 32, w: 84, h: 18 },
    },
    {
      id: 'r-brandbar',
      label: '브랜드 컬러 밴드',
      kind: 'color' as const,
      locked: true,
      rect: { x: 0, y: 88, w: 100, h: 12 },
    },
    {
      id: 'r-cta',
      label: 'CTA 카피',
      kind: 'editable' as const,
      locked: false,
      rect: { x: 58, y: 58, w: 34, h: 12 },
    },
  ] satisfies TemplateLockRegion[],
};

/** F-2.6 금지 에셋 */
export type ForbiddenReason = 'license_expired' | 'brand_change' | 'legal' | 'recall' | 'other';

export const FORBIDDEN_REASON_LABELS: Record<ForbiddenReason, string> = {
  license_expired: '라이선스 만료',
  brand_change: '브랜드 변경',
  legal: '법적 이슈',
  recall: '리콜 / 사용 중단',
  other: '기타',
};

export type ForbiddenAssetRow = {
  id: string;
  assetId: string;
  assetName: string;
  reason: ForbiddenReason;
  forbiddenAt: string;
  replacementAssetId: string | null;
  replacementName: string | null;
  usedIn: { name: string; type: 'campaign' | 'page' }[];
};

export const FORBIDDEN_ASSETS: ForbiddenAssetRow[] = [
  {
    id: 'fb1',
    assetId: 'legacy-hero-2019',
    assetName: 'legacy_hero_2019.jpg',
    reason: 'brand_change',
    forbiddenAt: '2026-04-01',
    replacementAssetId: 'a1',
    replacementName: 'campaign_summer_hero.jpg',
    usedIn: [
      { name: 'Winter 2019 랜딩 (아카이브)', type: 'page' },
      { name: 'Brand Refresh', type: 'campaign' },
    ],
  },
  {
    id: 'fb2',
    assetId: 'stock-xyz-88',
    assetName: 'stock_lifestyle_01.png',
    reason: 'license_expired',
    forbiddenAt: '2026-04-10',
    replacementAssetId: 'a4',
    replacementName: 'product_lifestyle_01.jpg',
    usedIn: [{ name: '2026 Summer', type: 'campaign' }],
  },
  {
    id: 'fb3',
    assetId: 'old-logo-mark',
    assetName: 'logo_mark_v1.svg',
    reason: 'recall',
    forbiddenAt: '2026-03-15',
    replacementAssetId: null,
    replacementName: null,
    usedIn: [
      { name: '파트너 포털 헤더', type: 'page' },
      { name: 'Q2 Newsletter', type: 'campaign' },
    ],
  },
];

/** F-3.5 브랜드 Custom Model */
export type CustomModelStatus = 'ready' | 'training' | 'disabled';

export type BrandCustomModel = {
  id: string;
  name: string;
  modelType: 'photography' | 'illustration';
  status: CustomModelStatus;
  assetCount: number;
  trainedAt?: string;
  etaMinutes?: number;
  progress?: number;
  isDefault: boolean;
};

export const BRAND_CUSTOM_MODELS: BrandCustomModel[] = [
  {
    id: 'cm-1',
    name: 'Brand Photo 2026',
    modelType: 'photography',
    status: 'ready',
    assetCount: 24,
    trainedAt: '2026-03-28',
    isDefault: true,
  },
  {
    id: 'cm-2',
    name: 'Illustration Lite',
    modelType: 'illustration',
    status: 'ready',
    assetCount: 18,
    trainedAt: '2026-02-10',
    isDefault: false,
  },
  {
    id: 'cm-3',
    name: 'Q2 Retrain (진행 중)',
    modelType: 'photography',
    status: 'training',
    assetCount: 16,
    etaMinutes: 42,
    progress: 61,
    isDefault: false,
  },
];
