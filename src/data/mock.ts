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
    name: 'product_shot_01.jpg',
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
  {
    id: 'a9',
    name: 'adhoc_signage_draft.png',
    type: 'image',
    size: '1.1 MB',
    dim: '1200×628',
    campaign: '미배정',
    lang: 'ko',
    brandScore: 58,
    status: 'review',
    modified: '2026-04-08',
    season: 'year-round',
    channels: ['display'],
    format: 'png',
    taxonomyPath: ['마케팅 자산', '미분류'],
    dominantColors: ['#64748B', '#E2E8F0', '#0F172A'],
    semanticHints: ['간판', '초안', '캠페인 미지정'],
    visualBucket: 2,
    langGroupId: null,
    duplicateGroupId: null,
    assetKind: 'banner',
  },
  {
    id: 'a10',
    name: 'event_photo_misc.jpg',
    type: 'image',
    size: '2.0 MB',
    dim: '2400×1600',
    campaign: '미배정',
    lang: 'ko',
    brandScore: 72,
    status: 'approved',
    modified: '2026-04-09',
    season: 'spring',
    channels: ['instagram'],
    format: 'jpeg',
    taxonomyPath: ['마케팅 자산', '미분류'],
    dominantColors: ['#F59E0B', '#FFFBEB', '#1E293B'],
    semanticHints: ['이벤트', '현장', '캠페인 미지정'],
    visualBucket: 1,
    langGroupId: null,
    duplicateGroupId: null,
    assetKind: 'photo',
  },
];

/** F-0.2 에셋 상세 — 라이선스 목업 */
export type AssetLicenseInfo = {
  licenseType: string;
  expires: string;
  terms: string;
};

const ASSET_LICENSE_BY_ID: Record<string, AssetLicenseInfo> = {
  a1: {
    licenseType: 'Rights Managed · 캠페인 전용',
    expires: '2027-12-31',
    terms: '지정 캠페인·채널 게시, 3자 재판매·템플릿 외 사용 금지',
  },
  a2: {
    licenseType: '에이전시 제작 (Client)',
    expires: '2026-09-30',
    terms: '2026 Summer 캠페인 기간 한정, 리타게팅 광고 허용',
  },
  a3: {
    licenseType: '내부 스톡',
    expires: '제한 없음',
    terms: '브랜드 검수 후 게시, 파생 작업 시 재승인',
  },
  a5: {
    licenseType: '뉴스레터 전용',
    expires: '2026-06-30',
    terms: '이메일·링크드인만, 인쇄물 별도 문의',
  },
};

export function getAssetLicense(assetId: string): AssetLicenseInfo {
  return (
    ASSET_LICENSE_BY_ID[assetId] ?? {
      licenseType: '사내 표준 (RF)',
      expires: '제한 없음',
      terms: '내부·디지털 마케팅 사용, 무단 2차 가공 시 재검수',
    }
  );
}

export const CAMPAIGNS = [
  {
    id: 'c1',
    name: '2026 Summer',
    status: 'active' as const,
    progress: 72,
    assets: 24,
    pending: 3,
    period: '2026-04-01 ~ 2026-08-31',
    owner: '김민지',
    channels: ['Instagram', 'Display', 'YouTube'],
  },
  {
    id: 'c2',
    name: 'Brand Refresh',
    status: 'active' as const,
    progress: 45,
    assets: 18,
    pending: 7,
    period: '2026-03-15 ~ 2026-06-30',
    owner: '박에이전시',
    channels: ['TikTok', 'Instagram', 'Facebook'],
  },
  {
    id: 'c3',
    name: 'Q2 Newsletter',
    status: 'active' as const,
    progress: 90,
    assets: 8,
    pending: 1,
    period: '2026-04-01 ~ 2026-06-15',
    owner: '이CRM',
    channels: ['Email', 'LinkedIn'],
  },
  {
    id: 'c4',
    name: 'Winter 2025',
    status: 'completed' as const,
    progress: 100,
    assets: 32,
    pending: 0,
    period: '2025-11-01 ~ 2026-02-28',
    owner: '최브랜드',
    channels: ['Display', 'Facebook'],
  },
];

/** F-4.4 캠페인 워크스페이스 — 태스크 목업 */
export type CampaignTaskStatus = 'todo' | 'in_progress' | 'done';
export type CampaignTask = {
  id: string;
  campaignId: string;
  title: string;
  status: CampaignTaskStatus;
  due: string;
  assignee: string;
};

export const CAMPAIGN_TASKS: CampaignTask[] = [
  { id: 't1', campaignId: 'c1', title: '히어로 배너 최종 리뷰', status: 'done', due: '2026-04-18', assignee: '김민지' },
  { id: 't2', campaignId: 'c1', title: '소셜 9:16 세트 제작', status: 'in_progress', due: '2026-04-22', assignee: '박에이전시' },
  { id: 't3', campaignId: 'c1', title: 'YouTube 프리롤 업로드', status: 'todo', due: '2026-04-28', assignee: '이CRM' },
  { id: 't4', campaignId: 'c2', title: '틱톡 훅 영상 컷', status: 'in_progress', due: '2026-04-19', assignee: '박에이전시' },
  { id: 't5', campaignId: 'c3', title: '뉴스레터 헤더 승인', status: 'done', due: '2026-04-12', assignee: '이CRM' },
];

/** F-4.3 버전 비교 — 에셋별 버전 이력 */
export type AssetVersionRow = {
  versionId: string;
  label: string;
  modified: string;
  author: string;
  reason: string;
  size: string;
  dim: string;
  colorProfile: string;
  /** 버전 비교 미리보기용 `public/sample/` 파일명. 없으면 에셋 기본 `name` 사용 */
  sampleFilename?: string;
};

export const ASSET_VERSION_HISTORY: Record<string, AssetVersionRow[]> = {
  a1: [
    {
      versionId: 'a1-v3',
      label: 'v3 (현재)',
      modified: '2026-04-14 09:00',
      author: 'Park',
      reason: '히어로 카피·CTA 수정',
      size: '4.2 MB',
      dim: '3840×2160',
      colorProfile: 'sRGB IEC61966-2.1',
      sampleFilename: 'campaign_summer_hero_after.png',
    },
    {
      versionId: 'a1-v2',
      label: 'v2',
      modified: '2026-04-10 11:20',
      author: 'Kim',
      reason: '색상 보정',
      size: '4.0 MB',
      dim: '3840×2160',
      colorProfile: 'sRGB IEC61966-2.1',
    },
    {
      versionId: 'a1-v1',
      label: 'v1',
      modified: '2026-04-05 16:00',
      author: 'Lee',
      reason: '최초 업로드',
      size: '3.9 MB',
      dim: '3840×2160',
      colorProfile: 'Adobe RGB (1998)',
    },
  ],
  a2: [
    {
      versionId: 'a2-v2',
      label: 'v2 (현재)',
      modified: '2026-04-15 14:00',
      author: 'Agency',
      reason: '프로모션 카피 반영',
      size: '1.8 MB',
      dim: '1920×1080',
      colorProfile: 'sRGB',
    },
    {
      versionId: 'a2-v1',
      label: 'v1',
      modified: '2026-04-08 10:00',
      author: 'Kim',
      reason: '초안',
      size: '1.7 MB',
      dim: '1920×1080',
      colorProfile: 'sRGB',
    },
  ],
};

/** F-4.1 브랜드 킷·공유 패키지 목업 */
export const BRAND_KIT_ITEMS = [
  { id: 'bk1', kind: 'logo' as const, name: 'Primary 로고 (가로)', format: 'SVG, PNG @1x–3x' },
  { id: 'bk2', kind: 'logo' as const, name: '심볼 마크', format: 'SVG' },
  { id: 'bk3', kind: 'color' as const, name: '브랜드 팔레트 2026', format: 'ASE, CSS 변수' },
  { id: 'bk4', kind: 'font' as const, name: '타이포그래피', format: 'WOFF2 패밀리' },
  { id: 'bk5', kind: 'doc' as const, name: '브랜드 가이드라인 PDF', format: 'PDF v3.2' },
];

export type ShareAccessLogRow = { id: string; at: string; actor: string; action: string; asset: string };

export const SHARE_ACCESS_LOGS: ShareAccessLogRow[] = [
  { id: 'l1', at: '2026-04-16 15:22', actor: 'agency-viewer@partner.com', action: '다운로드', asset: 'product_shot_01.jpg' },
  { id: 'l2', at: '2026-04-16 14:01', actor: 'agency-viewer@partner.com', action: '미리보기', asset: '브랜드 킷 패키지' },
  { id: 'l3', at: '2026-04-15 09:40', actor: 'freelance@design.kr', action: '다운로드', asset: 'logo_primary.svg' },
];

/** F-4.2 리뷰 코멘트 스레드 */
export type ReviewComment = {
  id: string;
  reviewId: string;
  body: string;
  author: string;
  at: string;
  resolved: boolean;
};

export const REVIEW_COMMENTS: ReviewComment[] = [
  { id: 'cm1', reviewId: 'r1', body: '로고 안전 영역이 가이드보다 좁습니다. 상단 8px 더 확보 부탁드립니다.', author: 'Kim', at: '1시간 전', resolved: false },
  { id: 'cm2', reviewId: 'r1', body: '배경 그라데이션은 브랜드 프리셋 #2만 사용해 주세요.', author: 'Kim', at: '2시간 전', resolved: true },
  { id: 'cm3', reviewId: 'r2', body: 'CTA 대비율 WCAG AA 확인 부탁합니다.', author: 'Park (Agency)', at: '4시간 전', resolved: false },
];

/** F-4.2 비주얼 마크업 포인트 (% 좌표) */
export const REVIEW_PINS = [
  { id: 'p1', reviewId: 'r1', x: 22, y: 35, label: '1' },
  { id: 'p2', reviewId: 'r1', x: 68, y: 52, label: '2' },
];

/** F-4.5 칸반 초기 목업 (에셋 카드) */
export type ApprovalKanbanColumn = 'unsubmitted' | 'in_review' | 'changes' | 'approved';

export type ApprovalKanbanCard = {
  id: string;
  assetName: string;
  assignee: string;
  dueDate: string;
  overdue: boolean;
  column: ApprovalKanbanColumn;
};

export const APPROVAL_KANBAN_SEED: ApprovalKanbanCard[] = [
  { id: 'k1', assetName: 'draft_cover.png', assignee: 'Lee', dueDate: '2026-04-25', overdue: false, column: 'unsubmitted' },
  { id: 'k2', assetName: 'promo_banner_v2.png', assignee: 'Kim', dueDate: '2026-04-18', overdue: true, column: 'in_review' },
  { id: 'k3', assetName: 'social_post_agency.jpg', assignee: 'Park', dueDate: '2026-04-12', overdue: true, column: 'changes' },
  { id: 'k4', assetName: 'email_header_final.png', assignee: 'Lee', dueDate: '2026-04-10', overdue: false, column: 'approved' },
  { id: 'k5', assetName: 'story_anim_v1.mp4', assignee: 'Choi', dueDate: '2026-04-20', overdue: false, column: 'in_review' },
];

export const BRAND_VIOLATIONS = [
  { id: 'v1', assetId: 'a3', assetName: 'social_post_03.png', type: 'color', description: '브랜드 컬러 불일치 - Primary Blue #0066CC 대신 #3399FF 사용', severity: 'high', scoreBefore: 45, scoreAfter: 88 },
  { id: 'v2', assetId: 'a3', assetName: 'social_post_03.png', type: 'logo', description: '로고 여백 부족 - 최소 여백 24px 미달 (현재 12px)', severity: 'high', scoreBefore: 45, scoreAfter: 88 },
  { id: 'v3', assetId: 'a7', assetName: 'infographic_stats.png', type: 'text', description: '브랜드 폰트 미사용 - Arial 대신 Noto Sans KR 사용 필요', severity: 'medium', scoreBefore: 52, scoreAfter: 85 },
  { id: 'v4', assetId: 'a2', assetName: 'promo_banner_v2.png', type: 'background', description: '배경 톤 불일치 - 브랜드 톤보다 차가운 색상 사용', severity: 'low', scoreBefore: 68, scoreAfter: 94 },
  { id: 'v5', assetId: 'a9', assetName: 'adhoc_signage_draft.png', type: 'layout', description: '캠페인 미배정 자산 — 템플릿 잠금 영역 밖 게시 이력', severity: 'medium', scoreBefore: 58, scoreAfter: 82 },
] as const;

export type BrandViolation = (typeof BRAND_VIOLATIONS)[number];

const ASSET_CAMPAIGN_BY_ID: Record<string, string> = Object.fromEntries(ASSETS.map(a => [a.id, a.campaign]));

/** 에셋 ID로 캠페인명 조회 (목업 ASSETS에 없으면 미분류) */
export function getCampaignForAsset(assetId: string): string {
  return ASSET_CAMPAIGN_BY_ID[assetId] ?? '미분류';
}

export function groupBrandViolationsByCampaign(
  violations: readonly BrandViolation[]
): Map<string, BrandViolation[]> {
  const m = new Map<string, BrandViolation[]>();
  for (const v of violations) {
    const c = getCampaignForAsset(v.assetId);
    const arr = m.get(c) ?? [];
    arr.push(v);
    m.set(c, arr);
  }
  return m;
}

/** 만료 임박 라이선스 — 브랜드 거버넌스 캠페인 그룹용 */
export type LicenseExpiringRow = {
  id: string;
  assetName: string;
  daysLeft: number;
  type: string;
  campaign: string;
  /** 목업 에셋과 연결되는 경우 */
  assetId?: string | null;
};

export const LICENSES_EXPIRING: LicenseExpiringRow[] = [
  {
    id: 'lex1',
    assetName: 'stock_lifestyle_01.png',
    daysLeft: 7,
    type: '스톡 이미지',
    campaign: '2026 Summer',
    assetId: null,
  },
  {
    id: 'lex2',
    assetName: 'social_post_03.png',
    daysLeft: 14,
    type: '모델 초상권',
    campaign: 'Brand Refresh',
    assetId: 'a3',
  },
  {
    id: 'lex3',
    assetName: 'bg_texture_03.jpg',
    daysLeft: 30,
    type: '스톡 이미지',
    campaign: 'Q2 Newsletter',
    assetId: null,
  },
  {
    id: 'lex4',
    assetName: 'event_photo_misc.jpg',
    daysLeft: 21,
    type: '스톡 이미지',
    campaign: '미배정',
    assetId: 'a10',
  },
];

export type CampaignGovernanceSummary = {
  campaign: string;
  avgBrandScore: number;
  assetCount: number;
  violationCount: number;
  licensesExpiringCount: number;
};

/** 캠페인별 평균 브랜드 스코어·위반 건수·만료 임박 라이선스 건수 */
export function buildCampaignGovernanceSummaries(): CampaignGovernanceSummary[] {
  const scoresByCampaign = new Map<string, number[]>();
  for (const a of ASSETS) {
    if (!scoresByCampaign.has(a.campaign)) scoresByCampaign.set(a.campaign, []);
    scoresByCampaign.get(a.campaign)!.push(a.brandScore);
  }
  const violationCountBy = new Map<string, number>();
  for (const v of BRAND_VIOLATIONS) {
    const c = getCampaignForAsset(v.assetId);
    violationCountBy.set(c, (violationCountBy.get(c) ?? 0) + 1);
  }
  const licenseCountBy = new Map<string, number>();
  for (const row of LICENSES_EXPIRING) {
    licenseCountBy.set(row.campaign, (licenseCountBy.get(row.campaign) ?? 0) + 1);
  }
  const names = new Set<string>([
    ...scoresByCampaign.keys(),
    ...violationCountBy.keys(),
    ...licenseCountBy.keys(),
  ]);
  const out: CampaignGovernanceSummary[] = [];
  for (const campaign of names) {
    const scores = scoresByCampaign.get(campaign) ?? [];
    const avgBrandScore = scores.length
      ? Math.round(scores.reduce((s, x) => s + x, 0) / scores.length)
      : 0;
    out.push({
      campaign,
      avgBrandScore,
      assetCount: scores.length,
      violationCount: violationCountBy.get(campaign) ?? 0,
      licensesExpiringCount: licenseCountBy.get(campaign) ?? 0,
    });
  }
  out.sort(
    (a, b) =>
      b.violationCount - a.violationCount ||
      b.licensesExpiringCount - a.licensesExpiringCount ||
      a.campaign.localeCompare(b.campaign, 'ko')
  );
  return out;
}

export function groupLicensesByCampaign(
  rows: readonly LicenseExpiringRow[]
): Map<string, LicenseExpiringRow[]> {
  const m = new Map<string, LicenseExpiringRow[]>();
  for (const row of rows) {
    const arr = m.get(row.campaign) ?? [];
    arr.push(row);
    m.set(row.campaign, arr);
  }
  return m;
}

export const AI_FIX_INBOX = [
  { id: 'f1', assetId: 'a3', assetName: 'social_post_03.png', violations: ['색상 톤', '로고 여백'], requester: 'Kim', requestedAt: '2026-04-16 14:30', status: 'pending' as const, scoreBefore: 45, scoreAfter: 88 },
  { id: 'f2', assetId: 'a2', assetName: 'promo_banner_v2.png', violations: ['배경 톤'], requester: 'Park', requestedAt: '2026-04-16 13:00', status: 'approved' as const, scoreBefore: 68, scoreAfter: 94 },
  { id: 'f3', assetId: 'a7', assetName: 'infographic_stats.png', violations: ['색상', '텍스트'], requester: 'Lee', requestedAt: '2026-04-16 11:00', status: 'rejected' as const, scoreBefore: 52, scoreAfter: 82 },
  { id: 'f4', assetId: 'a6', assetName: 'video_teaser_15s.mp4', violations: ['색상 톤'], requester: 'Kim', requestedAt: '2026-04-15 16:00', status: 'changes_requested' as const, scoreBefore: 78, scoreAfter: 90 },
];

export function findAiFixInboxEntryByAssetId(assetId: string) {
  return AI_FIX_INBOX.find(f => f.assetId === assetId) ?? null;
}

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

/** F-5.4 소셜 캘린더 — 채널 색상은 UI 레인·뱃지용 */
export const CHANNEL_HEX: Record<string, string> = {
  'ig-feed': '#E11D48',
  'ig-story': '#F472B6',
  'fb-feed': '#1877F2',
  'fb-cover': '#166FE5',
  'yt-thumb': '#DC2626',
  'yt-banner': '#B91C1C',
  'li-feed': '#0A66C2',
  'x-feed': '#0F172A',
  email: '#6366F1',
};

export type SocialCalendarStatus = 'scheduled' | 'publishing' | 'completed' | 'failed';

export type SocialCalendarEvent = {
  id: string;
  title: string;
  date: string;
  time: string;
  channelId: string;
  channel: string;
  status: SocialCalendarStatus;
  assetId: string;
  assetName: string;
  repeatRule: 'none' | 'weekly' | 'monthly';
};

/** F-5.4 초기 일정 (드래그로 날짜 변경 가능 — 목업 상태) */
export const SOCIAL_CALENDAR_EVENTS: SocialCalendarEvent[] = [
  {
    id: 'e1',
    title: 'Summer Campaign Launch',
    date: '2026-04-20',
    time: '10:00',
    channelId: 'ig-feed',
    channel: 'Instagram 피드',
    status: 'scheduled',
    assetId: 'a1',
    assetName: 'product_shot_01.jpg',
    repeatRule: 'none',
  },
  {
    id: 'e2',
    title: 'Product Teaser',
    date: '2026-04-22',
    time: '15:30',
    channelId: 'yt-thumb',
    channel: 'YouTube 썸네일',
    status: 'publishing',
    assetId: 'a4',
    assetName: 'product_lifestyle_01.jpg',
    repeatRule: 'none',
  },
  {
    id: 'e3',
    title: 'Newsletter Banner',
    date: '2026-04-25',
    time: '09:00',
    channelId: 'li-feed',
    channel: 'LinkedIn 피드',
    status: 'scheduled',
    assetId: 'a5',
    assetName: 'email_header_q2.png',
    repeatRule: 'weekly',
  },
  {
    id: 'e4',
    title: 'LinkedIn Thought Leadership',
    date: '2026-04-28',
    time: '11:00',
    channelId: 'li-feed',
    channel: 'LinkedIn 피드',
    status: 'scheduled',
    assetId: 'a7',
    assetName: 'infographic_stats.png',
    repeatRule: 'none',
  },
  {
    id: 'e5',
    title: '스토리 프로모',
    date: '2026-04-17',
    time: '18:00',
    channelId: 'ig-story',
    channel: 'Instagram 스토리',
    status: 'completed',
    assetId: 'a3',
    assetName: 'social_post_03.png',
    repeatRule: 'none',
  },
  {
    id: 'e6',
    title: 'X 제품 스레드',
    date: '2026-04-18',
    time: '12:00',
    channelId: 'x-feed',
    channel: 'X 피드',
    status: 'failed',
    assetId: 'a2',
    assetName: 'promo_banner_v2.png',
    repeatRule: 'none',
  },
];

/** 하위 호환 — 기존 필드만 필요한 참조용 */
export const CALENDAR_EVENTS = SOCIAL_CALENDAR_EVENTS.map(e => ({
  id: e.id,
  title: e.title,
  date: e.date,
  channel: e.channel,
  status: e.status === 'scheduled' ? 'scheduled' : e.status === 'failed' ? 'draft' : 'scheduled',
}));

/** F-5.6 배포 이력 */
export type DeployHistoryStatus = 'success' | 'failed' | 'retrying';

export type DeployHistoryRow = {
  id: string;
  assetId: string;
  assetName: string;
  channelId: string;
  channel: string;
  deployedAt: string;
  deployedBy: string;
  status: DeployHistoryStatus;
  campaign: string;
};

export const DEPLOY_HISTORY: DeployHistoryRow[] = [
  {
    id: 'd1',
    assetId: 'a1',
    assetName: 'product_shot_01.jpg',
    channelId: 'ig-feed',
    channel: 'Instagram 피드',
    deployedAt: '2026-04-16 14:22',
    deployedBy: '김민지',
    status: 'success',
    campaign: '2026 Summer',
  },
  {
    id: 'd2',
    assetId: 'a1',
    assetName: 'product_shot_01.jpg',
    channelId: 'fb-feed',
    channel: 'Facebook 피드',
    deployedAt: '2026-04-16 14:25',
    deployedBy: '김민지',
    status: 'success',
    campaign: '2026 Summer',
  },
  {
    id: 'd3',
    assetId: 'a4',
    assetName: 'product_lifestyle_01.jpg',
    channelId: 'yt-thumb',
    channel: 'YouTube 썸네일',
    deployedAt: '2026-04-15 09:10',
    deployedBy: '박에이전시',
    status: 'failed',
    campaign: '2026 Summer',
  },
  {
    id: 'd4',
    assetId: 'a4',
    assetName: 'product_lifestyle_01.jpg',
    channelId: 'yt-thumb',
    channel: 'YouTube 썸네일',
    deployedAt: '2026-04-15 09:18',
    deployedBy: '시스템',
    status: 'retrying',
    campaign: '2026 Summer',
  },
  {
    id: 'd5',
    assetId: 'a5',
    assetName: 'email_header_q2.png',
    channelId: 'li-feed',
    channel: 'LinkedIn 피드',
    deployedAt: '2026-04-14 11:00',
    deployedBy: '이CRM',
    status: 'success',
    campaign: 'Q2 Newsletter',
  },
  {
    id: 'd6',
    assetId: 'a2',
    assetName: 'promo_banner_v2.png',
    channelId: 'x-feed',
    channel: 'X 피드',
    deployedAt: '2026-04-13 16:40',
    deployedBy: '김민지',
    status: 'success',
    campaign: '2026 Summer',
  },
  {
    id: 'd7',
    assetId: 'a6',
    assetName: 'video_teaser_15s.mp4',
    channelId: 'yt-thumb',
    channel: 'YouTube 썸네일',
    deployedAt: '2026-04-12 10:05',
    deployedBy: '박에이전시',
    status: 'success',
    campaign: 'Brand Refresh',
  },
  {
    id: 'd8',
    assetId: 'a3',
    assetName: 'social_post_03.png',
    channelId: 'ig-story',
    channel: 'Instagram 스토리',
    deployedAt: '2026-04-11 19:30',
    deployedBy: '최브랜드',
    status: 'success',
    campaign: 'Brand Refresh',
  },
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

/** 금지 목록 캠페인 그룹 — 첫 번째 캠페인 참조를 대표 캠페인으로 사용 */
export function getForbiddenRowPrimaryCampaign(row: ForbiddenAssetRow): string {
  return row.usedIn.find(u => u.type === 'campaign')?.name ?? '캠페인 미지정';
}

export const FORBIDDEN_ASSETS: ForbiddenAssetRow[] = [
  {
    id: 'fb1',
    assetId: 'legacy-hero-2019',
    assetName: 'legacy_hero_2019.jpg',
    reason: 'brand_change',
    forbiddenAt: '2026-04-01',
    replacementAssetId: 'a1',
    replacementName: 'product_shot_01.jpg',
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
