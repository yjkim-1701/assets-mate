import type { Asset } from './mock';
import { ASSETS } from './mock';
import {
  colorMatches,
  matchesTaxonomyPrefix,
  mockVisualSimilarity,
  semanticScore,
} from '../lib/assetSearch';

/** 대화형 AI 검색이 조합하는 정규화된 의도 (목업 파싱 결과) */
export type SearchIntent = {
  textQuery: string;
  campaigns: string[];
  channels: string[];
  seasons: Asset['season'][];
  statuses: Asset['status'][];
  kinds: Asset['assetKind'][];
  hexColors: string[];
  colorDominance: number;
  taxonomyPrefix: string[];
  referenceAssetId: string | null;
  /** 업로드 이미지 파일명(칩·요약용). 실제 임베딩은 없고 유사도는 `uploadedImageMockRefId` 카탈로그 에셋으로 대체 */
  uploadedImageFileName: string | null;
  /** 목업: 업로드 이미지 대신 유사도 계산에 쓸 카탈로그 에셋 ID */
  uploadedImageMockRefId: string | null;
  similarityMin: number;
  dateFrom: string;
  dateTo: string;
};

export function emptySearchIntent(): SearchIntent {
  return {
    textQuery: '',
    campaigns: [],
    channels: [],
    seasons: [],
    statuses: [],
    kinds: [],
    hexColors: [],
    colorDominance: 55,
    taxonomyPrefix: [],
    referenceAssetId: null,
    uploadedImageFileName: null,
    uploadedImageMockRefId: null,
    similarityMin: 65,
    dateFrom: '',
    dateTo: '',
  };
}

const CAMPAIGN_ALIASES: [RegExp, string][] = [
  [/2026\s*summer|썸머|여름\s*캠페인/i, '2026 Summer'],
  [/brand\s*refresh|브랜드\s*리프레시/i, 'Brand Refresh'],
  [/q2\s*newsletter|뉴스레터/i, 'Q2 Newsletter'],
  [/winter\s*2025|겨울\s*2025/i, 'Winter 2025'],
];

const CHANNEL_ALIASES: [RegExp, string][] = [
  [/instagram|인스타|ig\b/i, 'instagram'],
  [/facebook|페이스북|fb\b/i, 'facebook'],
  [/youtube|유튜브|yt\b/i, 'youtube'],
  [/tiktok|틱톡/i, 'tiktok'],
  [/linkedin|링크드인/i, 'linkedin'],
  [/\bx\b|트위터|twitter/i, 'x'],
  [/display|디스플레이/i, 'display'],
  [/email|이메일/i, 'email'],
];

const TAXONOMY_HINTS: [RegExp, string[]][] = [
  [/뉴스레터|newsletter/i, ['마케팅 자산', '이메일', 'Q2 Newsletter']],
  [/히어로|hero/i, ['마케팅 자산', '캠페인', '2026 Summer', '히어로 배너']],
  [/프로모션|promo/i, ['마케팅 자산', '캠페인', '2026 Summer', '프로모션']],
  [/인포그래픽|infographic/i, ['마케팅 자산', '인포그래픽', 'Q2 Newsletter', '통계']],
  [/브랜드\s*리프레시.*피드|소셜\s*피드/i, ['마케팅 자산', '소셜', 'Brand Refresh', '피드']],
  [/티저|teaser/i, ['마케팅 자산', '비디오', 'Brand Refresh', '티저']],
  [/제품\s*라이프|lifestyle/i, ['마케팅 자산', '캠페인', '2026 Summer', '제품 라이프스타일']],
];

const COLOR_ALIASES: [RegExp, string][] = [
  [/primary\s*blue|프라이머리|파랑|블루|#1[dD]4[eE][dD]8/i, '#1D4ED8'],
  [/success\s*green|녹색|그린\s*톤/i, '#047857'],
  [/빨강|레드|red\b|#dc2626|#DC2626/i, '#DC2626'],
];

function uniq<T>(arr: T[]): T[] {
  return [...new Set(arr)];
}

/** 목업: 사용자 메시지를 규칙 기반으로 파싱해 이전 의도에 병합 */
export function parseChatToIntent(prev: SearchIntent, userMessage: string): SearchIntent {
  const raw = userMessage.trim();
  if (!raw) return prev;
  if (/^(초기화|리셋|reset|clear|조건\s*지우기)/i.test(raw)) {
    return emptySearchIntent();
  }

  const next: SearchIntent = {
    ...prev,
    campaigns: [...prev.campaigns],
    channels: [...prev.channels],
    seasons: [...prev.seasons],
    statuses: [...prev.statuses],
    kinds: [...prev.kinds],
    hexColors: [...prev.hexColors],
    taxonomyPrefix: [...prev.taxonomyPrefix],
  };

  const m = raw;

  for (const [re, name] of CAMPAIGN_ALIASES) {
    if (re.test(m) && ASSETS.some(a => a.campaign === name)) next.campaigns.push(name);
  }
  for (const c of [...new Set(ASSETS.map(a => a.campaign))]) {
    if (m.toLowerCase().includes(c.toLowerCase()) && !next.campaigns.includes(c)) next.campaigns.push(c);
  }

  for (const [re, ch] of CHANNEL_ALIASES) {
    if (re.test(m)) next.channels.push(ch);
  }

  for (const [re, path] of TAXONOMY_HINTS) {
    if (re.test(m)) {
      next.taxonomyPrefix = path;
      break;
    }
  }

  for (const [re, hex] of COLOR_ALIASES) {
    if (re.test(m) && !next.hexColors.includes(hex)) {
      next.hexColors = [...next.hexColors, hex].slice(-5);
    }
  }

  const hexMatch = m.match(/#([0-9A-Fa-f]{6})\b/g);
  if (hexMatch) {
    for (const h of hexMatch) {
      const norm = h.length === 7 ? h.toUpperCase() : h;
      if (!next.hexColors.includes(norm)) next.hexColors = [...next.hexColors, norm].slice(-5);
    }
  }

  const idMatch = m.match(/\b(a\d+)\b/i);
  if (idMatch) {
    const id = idMatch[1].toLowerCase();
    if (ASSETS.some(a => a.id === id)) next.referenceAssetId = id;
  }
  if (/비슷한|유사|닮은|같은\s*느낌|like\s*this/i.test(m) && !next.referenceAssetId) {
    /* 참조 없이 유사 요청만 온 경우 — 목업에서는 유지 */
  }

  if (/승인됨|승인된|승인|approved/i.test(m)) next.statuses.push('approved');
  if (/검토\s*중|review/i.test(m)) next.statuses.push('review');
  if (/위반|violation/i.test(m)) next.statuses.push('violation');

  if (/사진|photo|소셜\s*(이미지|포스트|피드)?|social\s*(post|feed|image)?/i.test(m)) next.kinds.push('photo');
  if (/배너|banner/i.test(m)) next.kinds.push('banner');
  if (/비디오|video|mp4/i.test(m)) next.kinds.push('video');

  next.campaigns = uniq(next.campaigns);
  next.channels = uniq(next.channels);
  next.seasons = uniq(next.seasons);
  next.statuses = uniq(next.statuses);
  next.kinds = uniq(next.kinds);

  const mergedText = [prev.textQuery, raw].filter(Boolean).join(' ').trim();
  next.textQuery = mergedText.slice(0, 800);

  return next;
}

export type IntentMatchMeta = { similarity?: string; matchReasons?: string[] };

/** 활성 조건의 교집합으로 에셋 필터 + 카드용 설명 메타 */
export function applyIntentToAssets(
  assets: Asset[],
  intent: SearchIntent
): { results: Asset[]; metaById: Record<string, IntentMatchMeta> } {
  const hasAny =
    intent.textQuery.trim() ||
    intent.campaigns.length ||
    intent.channels.length ||
    intent.seasons.length ||
    intent.statuses.length ||
    intent.kinds.length ||
    intent.hexColors.length ||
    intent.taxonomyPrefix.length ||
    intent.referenceAssetId ||
    intent.uploadedImageFileName ||
    intent.uploadedImageMockRefId ||
    intent.dateFrom ||
    intent.dateTo;

  if (!hasAny) {
    return { results: [...assets], metaById: {} };
  }

  /** 목업: 파일명이 product_shot_01.png(경로 제외)이면 우측 결과를 해당 카탈로그 에셋 한 건만 표시 */
  const uploadedBase = intent.uploadedImageFileName?.replace(/^.*[/\\]/, '').toLowerCase() ?? '';
  if (uploadedBase === 'product_shot_01.png') {
    const shot = assets.find(a => a.name === 'product_shot_01.png') ?? assets.find(a => a.id === 'a1');
    if (shot) {
      return {
        results: [shot],
        metaById: {
          [shot.id]: {
            similarity: '100%',
            matchReasons: ['업로드 이미지 = 샘플 product_shot_01.png (목업 고정 매칭)'],
          },
        },
      };
    }
  }

  const visualRefId = intent.uploadedImageMockRefId || intent.referenceAssetId;
  const ref = visualRefId ? (assets.find(a => a.id === visualRefId) ?? null) : null;

  let pool = assets.filter(a => {
    if (intent.campaigns.length && !intent.campaigns.includes(a.campaign)) return false;
    if (intent.channels.length && !a.channels.some(c => intent.channels.includes(c))) return false;
    if (intent.seasons.length && !intent.seasons.includes(a.season)) return false;
    if (intent.statuses.length && !intent.statuses.includes(a.status)) return false;
    if (intent.kinds.length && !intent.kinds.includes(a.assetKind)) return false;
    if (intent.dateFrom && a.modified < intent.dateFrom) return false;
    if (intent.dateTo && a.modified > intent.dateTo) return false;
    if (intent.taxonomyPrefix.length && !matchesTaxonomyPrefix(a.taxonomyPath, intent.taxonomyPrefix)) return false;
    if (intent.hexColors.length && !colorMatches(a, intent.hexColors, intent.colorDominance)) return false;
    if (intent.textQuery.trim()) {
      const { ok } = semanticScore(intent.textQuery, a);
      if (!ok) return false;
    }
    if (ref) {
      const sim = mockVisualSimilarity(a, ref);
      if (sim < intent.similarityMin) return false;
    }
    return true;
  });

  if (ref) {
    pool = [...pool].sort((a, b) => mockVisualSimilarity(b, ref) - mockVisualSimilarity(a, ref));
  } else if (intent.textQuery.trim()) {
    pool = [...pool].sort((a, b) => b.brandScore - a.brandScore);
  }

  const metaById: Record<string, IntentMatchMeta> = {};
  for (const a of pool) {
    const reasons: string[] = [];
    if (intent.textQuery.trim()) {
      const { reasons: sr } = semanticScore(intent.textQuery, a);
      reasons.push(...sr.slice(0, 4));
    }
    if (intent.hexColors.length) reasons.push('색상 매칭');
    if (intent.taxonomyPrefix.length) reasons.push(`분류: ${intent.taxonomyPrefix.join(' › ')}`);
    if (intent.campaigns.length) reasons.push('캠페인 조건');
    if (intent.channels.length) reasons.push('채널 조건');
    if (intent.uploadedImageFileName) reasons.push(`업로드 이미지(목업 유사도: ${intent.uploadedImageMockRefId ?? 'a1'})`);
    const meta: IntentMatchMeta = { matchReasons: uniq(reasons) };
    if (ref) meta.similarity = `${mockVisualSimilarity(a, ref)}%`;
    metaById[a.id] = meta;
  }

  return { results: pool, metaById };
}

/** 의도 요약 문자열 (어시스턴트 버블용) */
export function intentHasActiveConstraints(intent: SearchIntent): boolean {
  return !!(
    intent.textQuery.trim() ||
    intent.campaigns.length ||
    intent.channels.length ||
    intent.seasons.length ||
    intent.statuses.length ||
    intent.kinds.length ||
    intent.hexColors.length ||
    intent.taxonomyPrefix.length ||
    intent.referenceAssetId ||
    intent.uploadedImageFileName ||
    intent.uploadedImageMockRefId ||
    intent.dateFrom ||
    intent.dateTo
  );
}

export function summarizeIntent(intent: SearchIntent): string {
  const parts: string[] = [];
  if (intent.textQuery.trim()) parts.push(`의미/키워드: 「${intent.textQuery.trim().slice(0, 120)}${intent.textQuery.length > 120 ? '…' : ''}」`);
  if (intent.campaigns.length) parts.push(`캠페인: ${intent.campaigns.join(', ')}`);
  if (intent.channels.length) parts.push(`채널: ${intent.channels.join(', ')}`);
  if (intent.statuses.length) parts.push(`상태: ${intent.statuses.join(', ')}`);
  if (intent.kinds.length) parts.push(`유형: ${intent.kinds.join(', ')}`);
  if (intent.hexColors.length) parts.push(`색상: ${intent.hexColors.join(', ')}`);
  if (intent.taxonomyPrefix.length) parts.push(`텍소노미: ${intent.taxonomyPrefix.join(' › ')}`);
  if (intent.uploadedImageFileName) {
    const proxy = intent.uploadedImageMockRefId ?? 'a1';
    parts.push(`업로드 이미지: ${intent.uploadedImageFileName} (목업에서는 카탈로그 ${proxy} 기준 유사도)`);
  }
  if (intent.referenceAssetId && !intent.uploadedImageMockRefId) {
    parts.push(`참조 에셋: ${intent.referenceAssetId} (유사도 ${intent.similarityMin}% 이상)`);
  }
  if (intent.referenceAssetId && intent.uploadedImageMockRefId) {
    parts.push(`텍스트 참조 ID: ${intent.referenceAssetId} (유사도는 업로드 목업 기준 우선)`);
  }
  if (!parts.length) return '적용된 조건이 없습니다. 캠페인·색·메시지·이미지 업로드·참조 ID(a1 등)를 입력해 보세요.';
  return `적용 조건:\n${parts.map(p => `· ${p}`).join('\n')}\n→ ${applyIntentToAssets(ASSETS, intent).results.length}건이 조건에 맞습니다.`;
}
