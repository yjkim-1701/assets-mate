import type { Asset } from './mock';
import { ASSETS, AI_FIX_INBOX } from './mock';
import {
  parseChatToIntent,
  applyIntentToAssets,
  emptySearchIntent,
  type SearchIntent,
} from './searchIntentMock';

// ── Intent Types ──────────────────────────────────────────────────────────────

export type SearchSlots = SearchIntent;

export type GovernanceSlots = {
  attachmentSrc: string;
  attachmentName: string;
};

export type GenerateSlots = {
  prompt: string;
  width: number;
  height: number;
  style?: string;
};

export type FixSlots = {
  assetId: string;
  assetName: string;
  violations: string[];
  scoreBefore: number;
  scoreAfter: number;
};

export type CopilotIntent =
  | { type: 'search'; slots: SearchSlots }
  | { type: 'governance_check'; slots: GovernanceSlots }
  | { type: 'generate'; slots: GenerateSlots }
  | { type: 'fix'; slots: FixSlots }
  | { type: 'inspect'; slots: { assetId: string } }
  | { type: 'summary' }
  | { type: 'clarify'; question: string };

// ── Message Types ─────────────────────────────────────────────────────────────

export type AssetLite = Pick<Asset, 'id' | 'name' | 'type' | 'status' | 'brandScore' | 'campaign'>;

export type ViolationRef = {
  code: string;
  label: string;
  severity: 'error' | 'warning';
};

export type ToolCard =
  | { kind: 'asset_grid'; assets: AssetLite[]; totalCount: number; intentSummary: string }
  | { kind: 'asset_detail'; asset: Asset }
  | {
      kind: 'governance_report';
      result: 'pass' | 'warn' | 'block';
      violations: ViolationRef[];
      assetName: string;
    }
  | {
      kind: 'generation_preview';
      candidates: { src: string; promptAdj: string; id: string }[];
      prompt: string;
    }
  | {
      kind: 'before_after';
      assetId: string;
      assetName: string;
      before: string;
      after: string;
      scoreBefore: number;
      scoreAfter: number;
      violations: string[];
    }
  | {
      kind: 'dam_path_suggest';
      assetName: string;
      suggestedPath: string;
      alternatives: string[];
      suggestedFileName: string;
    };

export type CopilotMessage =
  | {
      id: string;
      role: 'user';
      kind: 'text' | 'attachment';
      text?: string;
      attachment?: { src: string; name: string };
      ts: number;
    }
  | {
      id: string;
      role: 'assistant';
      kind: 'text' | 'tool_card' | 'error';
      text?: string;
      card?: ToolCard;
      ts: number;
    };

// ── Session Context ───────────────────────────────────────────────────────────

export type CopilotSession = {
  lastIntent: CopilotIntent | null;
  selectedAssetId: string | null;
  searchIntent: SearchIntent;
  lastSearchResults: AssetLite[];
  lastApprovedAsset: string | null;
};

export function emptyCopilotSession(): CopilotSession {
  return {
    lastIntent: null,
    selectedAssetId: null,
    searchIntent: emptySearchIntent(),
    lastSearchResults: [],
    lastApprovedAsset: null,
  };
}

// ── Intent Parser ─────────────────────────────────────────────────────────────

const FIX_KEYWORDS = /수정|고쳐|보정|fix|repair|correct|위반.*해결|브랜드.*맞춰/i;
const GENERATE_KEYWORDS = /생성|만들어|그려|만들기|generate|create|이미지.*만들|배너.*만들|포스터|창작/i;
const INSPECT_KEYWORDS = /자세히|상세|보여줘|detail|열어|크게|확대/i;
const GOVERNANCE_KEYWORDS = /거버넌스|체크|검사|준수|가이드라인|governance|check/i;
const SUMMARY_KEYWORDS = /요약|정리|summary|지금까지|뭐 했|어떤 작업/i;
const SCORE_FILTER_RE = /(?:스코어|브랜드\s*점수)\s*(\d+)\s*(미만|이하)/i;

function ordinalToIndex(text: string): number | null {
  const m = text.match(/(\d+)\s*번째|(\d+)번|(\d+)th|(\d+)st|(\d+)nd|(\d+)rd/);
  if (m) {
    const n = parseInt(m[1] ?? m[2] ?? m[3] ?? m[4] ?? m[5] ?? m[6], 10);
    return isNaN(n) ? null : n - 1;
  }
  if (/첫\s*번째|첫\s*번|first/i.test(text)) return 0;
  if (/두\s*번째|second/i.test(text)) return 1;
  if (/세\s*번째|세\s*번|third/i.test(text)) return 2;
  if (/네\s*번째|fourth/i.test(text)) return 3;
  return null;
}

function parseGenerateSlots(text: string): GenerateSlots {
  let width = 1920;
  let height = 1080;
  const dimMatch = text.match(/(\d{3,4})\s*[×x×]\s*(\d{3,4})/);
  if (dimMatch) {
    width = parseInt(dimMatch[1], 10);
    height = parseInt(dimMatch[2], 10);
  } else if (/유튜브.*배너|youtube.*banner/i.test(text)) {
    width = 2560; height = 1440;
  } else if (/인스타|instagram|소셜.*1.1|1.1\s*소셜/i.test(text)) {
    width = 1080; height = 1080;
  } else if (/스토리|story/i.test(text)) {
    width = 1080; height = 1920;
  }

  let style: string | undefined;
  if (/블루|blue/i.test(text)) style = 'blue tone';
  else if (/레드|red/i.test(text)) style = 'red tone';
  else if (/미니멀|minimal/i.test(text)) style = 'minimal';

  return { prompt: text.trim(), width, height, style };
}

export function parseCopilotIntent(
  text: string,
  session: CopilotSession,
  hasAttachment: boolean
): CopilotIntent {
  const raw = text.trim();

  // Attachment → governance check
  if (hasAttachment) {
    return {
      type: 'governance_check',
      slots: { attachmentSrc: '', attachmentName: '업로드 이미지' },
    };
  }

  // Fix intent — reference selected asset or last search result
  if (FIX_KEYWORDS.test(raw)) {
    const assetId = session.selectedAssetId ?? session.lastSearchResults[0]?.id ?? 'a3';
    const inboxEntry = AI_FIX_INBOX.find(f => f.assetId === assetId);
    const asset = ASSETS.find(a => a.id === assetId);
    return {
      type: 'fix',
      slots: {
        assetId,
        assetName: inboxEntry?.assetName ?? asset?.name ?? 'social_post_03.png',
        violations: inboxEntry?.violations ?? ['색상 톤', '로고 여백'],
        scoreBefore: inboxEntry?.scoreBefore ?? 45,
        scoreAfter: inboxEntry?.scoreAfter ?? 88,
      },
    };
  }

  // Generate intent
  if (GENERATE_KEYWORDS.test(raw)) {
    return { type: 'generate', slots: parseGenerateSlots(raw) };
  }

  // Inspect — ordinal reference to last search results
  if (INSPECT_KEYWORDS.test(raw) && session.lastSearchResults.length > 0) {
    const idx = ordinalToIndex(raw) ?? 0;
    const asset = session.lastSearchResults[idx] ?? session.lastSearchResults[0];
    return { type: 'inspect', slots: { assetId: asset.id } };
  }

  // Explicit asset ID reference
  const idMatch = raw.match(/\b(a\d+)\b/i);
  if (idMatch && ASSETS.some(a => a.id === idMatch[1].toLowerCase())) {
    if (INSPECT_KEYWORDS.test(raw) || /보여줘|열어|상세/i.test(raw)) {
      return { type: 'inspect', slots: { assetId: idMatch[1].toLowerCase() } };
    }
  }

  // Governance check explicit
  if (GOVERNANCE_KEYWORDS.test(raw) && !hasAttachment) {
    if (session.selectedAssetId) {
      return { type: 'inspect', slots: { assetId: session.selectedAssetId } };
    }
  }

  // Summary intent
  if (SUMMARY_KEYWORDS.test(raw)) {
    return { type: 'summary' };
  }

  // Brand score filter prefix — detect threshold and pass through as search
  const scoreMatch = raw.match(SCORE_FILTER_RE);
  const scoreThreshold = scoreMatch ? parseInt(scoreMatch[1], 10) : null;

  // Search intent (default) — reuse parseChatToIntent
  const updatedSearchIntent = parseChatToIntent(session.searchIntent, raw);
  // Encode score threshold marker so the main handler can apply post-filtering
  const intentWithScore = scoreThreshold !== null
    ? { ...updatedSearchIntent, textQuery: `[score<${scoreThreshold}] ${updatedSearchIntent.textQuery}`.trim() }
    : updatedSearchIntent;
  return { type: 'search', slots: intentWithScore };
}

// ── DAM Path Suggest ──────────────────────────────────────────────────────────

const DAM_PATHS = [
  'Assets / 2026 / Summer / Social',
  'Assets / 2026 / Winter / Banner',
  'Assets / 2026 / Brand / Core',
  'Assets / Campaigns / 2026-Q2 / Social',
  'Assets / Campaigns / 2026-Q1 / Banner',
];

export function mockDamPathSuggest(assetName: string): ToolCard & { kind: 'dam_path_suggest' } {
  const hash = assetName.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const idx = Math.abs(hash) % DAM_PATHS.length;
  const suggestedPath = DAM_PATHS[idx];
  const alternatives = DAM_PATHS.filter((_, i) => i !== idx).slice(0, 2);
  const suggestedFileName = assetName.startsWith('generated_')
    ? `banner_hero_${new Date().getFullYear()}_brand.png`
    : assetName.replace(/\s+/g, '_').toLowerCase();
  return { kind: 'dam_path_suggest', assetName, suggestedPath, alternatives, suggestedFileName };
}

// ── Mock Response Generators ──────────────────────────────────────────────────

const VIOLATION_CATALOG: ViolationRef[] = [
  { code: 'COLOR_TONE', label: '허용되지 않은 색상 톤 (빨간색 계열)', severity: 'error' },
  { code: 'LOGO_MARGIN', label: '로고 안전 여백 부족 (최소 24px 필요)', severity: 'error' },
  { code: 'FONT_UNAPPROVED', label: '미승인 폰트 사용', severity: 'warning' },
  { code: 'CONTRAST_LOW', label: '텍스트 대비 미달 (WCAG AA)', severity: 'warning' },
  { code: 'WATERMARK', label: '워터마크 미제거', severity: 'error' },
  { code: 'BRAND_COLOR_MISMATCH', label: '브랜드 주색 이탈 (허용 Delta-E > 5)', severity: 'warning' },
];

function pickViolations(name: string, forcedResult?: 'pass' | 'warn' | 'block'): {
  result: 'pass' | 'warn' | 'block';
  violations: ViolationRef[];
} {
  if (forcedResult) {
    if (forcedResult === 'pass') return { result: 'pass', violations: [] };
    if (forcedResult === 'warn') return { result: 'warn', violations: VIOLATION_CATALOG.filter(v => v.severity === 'warning') };
    return { result: 'block', violations: VIOLATION_CATALOG.filter(v => v.severity === 'error') };
  }
  const lower = name.toLowerCase();
  if (lower.includes('block') || lower.includes('violation') || lower.includes('red')) {
    return { result: 'block', violations: [VIOLATION_CATALOG[0], VIOLATION_CATALOG[1]] };
  }
  if (lower.includes('warn')) {
    return { result: 'warn', violations: [VIOLATION_CATALOG[3], VIOLATION_CATALOG[5]] };
  }
  return { result: 'pass', violations: [] };
}

export function mockGovernanceReport(
  assetName: string,
  forcedResult?: 'pass' | 'warn' | 'block'
): ToolCard & { kind: 'governance_report' } {
  const { result, violations } = pickViolations(assetName, forcedResult);
  return { kind: 'governance_report', result, violations, assetName };
}

const GENERATION_STYLE_SUFFIXES = [
  '—자연광, 미니멀 배경',
  '—블루 그라디언트 톤',
  '—다크 배경, 하이라이트 강조',
  '—소프트 파스텔, 아웃도어',
];

const GEN_IMAGES = [
  '/sample/winter_promo_generated_01.png',
  '/sample/winter_promo_generated_02.png',
  '/sample/winter_promo_generated_03.png',
  '/sample/winter_promo_generated_04.png',
];

export function mockGenerationPreview(prompt: string): ToolCard & { kind: 'generation_preview' } {
  const candidates = GEN_IMAGES.map((src, i) => ({
    id: `gen-${i}`,
    src,
    promptAdj: `${prompt.slice(0, 60).trim()} ${GENERATION_STYLE_SUFFIXES[i]}`,
  }));
  return { kind: 'generation_preview', candidates, prompt };
}

export function mockBeforeAfter(slots: FixSlots): ToolCard & { kind: 'before_after' } {
  const base = slots.assetName.replace(/\.(png|jpg|jpeg)$/i, '');
  const ext = slots.assetName.match(/\.(png|jpg|jpeg)$/i)?.[0] ?? '.png';
  return {
    kind: 'before_after',
    assetId: slots.assetId,
    assetName: slots.assetName,
    before: `/sample/${slots.assetName}`,
    after: `/sample/${base}_fixed${ext}`,
    scoreBefore: slots.scoreBefore,
    scoreAfter: slots.scoreAfter,
    violations: slots.violations,
  };
}

export function mockSearchCard(
  intent: SearchIntent,
  session: CopilotSession
): { card: ToolCard & { kind: 'asset_grid' }; updatedSession: CopilotSession } {
  const { results } = applyIntentToAssets(ASSETS, intent);
  const assets: AssetLite[] = results.map(a => ({
    id: a.id,
    name: a.name,
    type: a.type,
    status: a.status,
    brandScore: a.brandScore,
    campaign: a.campaign,
  }));

  const parts: string[] = [];
  if (intent.campaigns.length) parts.push(`캠페인: ${intent.campaigns.join(', ')}`);
  if (intent.statuses.length) parts.push(`상태: ${intent.statuses.join(', ')}`);
  if (intent.kinds.length) parts.push(`유형: ${intent.kinds.join(', ')}`);
  if (intent.textQuery.trim()) parts.push(`키워드: ${intent.textQuery.trim().slice(0, 50)}`);
  const intentSummary = parts.length ? parts.join(' · ') : '전체 에셋';

  const card: ToolCard & { kind: 'asset_grid' } = {
    kind: 'asset_grid',
    assets,
    totalCount: results.length,
    intentSummary,
  };
  const updatedSession: CopilotSession = {
    ...session,
    searchIntent: intent,
    lastSearchResults: assets,
    lastIntent: { type: 'search', slots: intent },
  };
  return { card, updatedSession };
}
