import { Text, Button } from '@react-spectrum/s2';
import Add from '@react-spectrum/s2/icons/Add';
import Send from '@react-spectrum/s2/icons/Send';
import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader, CM } from '../components/AppLayout';
import { AccentButton } from '../components/AccentButton';
import { MutedBadge } from '../components/MutedBadge';
import { ASSETS } from '../data/mock';
import { sampleImageUrl } from '../lib/sampleMedia';

const f = (extra?: React.CSSProperties): React.CSSProperties => ({ display: 'flex', ...extra });
/** Search AI 검색 탭과 동일 — 크롬·브레드크럼 아래 가용 높이 */
const UPLOAD_AI_VIEW_HEIGHT = 'calc(100vh - 96px)';
const card: React.CSSProperties = {
  backgroundColor: CM.panelBg,
  borderRadius: 12,
  padding: 16,
  border: `1px solid ${CM.cardBorder}`,
  boxShadow: CM.cardShadow,
};

/** 목업: 파일명 휴리스틱 — `block`·`금지` → 차단, `warn`·`위반` → 경고, 그 외 통과 */
export function mockIngestGovernance(fileName: string): {
  level: 'pass' | 'warn' | 'block';
  violations: string[];
  headline: string;
} {
  const base = fileName.replace(/^.*[/\\]/, '').toLowerCase();
  if (base.includes('block') || base.includes('금지') || base.includes('forbidden')) {
    return {
      level: 'block',
      violations: ['금지 패턴·템플릿 잠금 영역과 충돌'],
      headline: '브랜드 거버넌스: 차단 — 이 파일은 업로드할 수 없습니다.',
    };
  }
  if (base.includes('warn') || base.includes('위반') || base.includes('risk')) {
    return {
      level: 'warn',
      violations: ['색상 톤', '로고 여백'],
      headline: '브랜드 거버넌스: 경고 — 아래 자연어로 수정한 뒤 최종본을 확인해 주세요.',
    };
  }
  return {
    level: 'pass',
    violations: [],
    headline: '브랜드 거버넌스: 통과 — 저장 경로를 선택한 뒤 업로드를 확정할 수 있습니다.',
  };
}

/** 목업: NL 생성 프롬프트에 대한 거버넌스 — 금지·위험 키워드는 차단/경고 */
export function mockGovernanceForTextPrompt(prompt: string): {
  level: 'pass' | 'warn' | 'block';
  violations: string[];
  headline: string;
} {
  const p = prompt.toLowerCase();
  if (p.includes('금지') || p.includes('forbidden') || p.includes('경쟁사 로고') || p.includes('탈취')) {
    return {
      level: 'block',
      violations: ['브랜드 가이드: 금지 주제·카피'],
      headline: '브랜드 거버넌스: 차단 — 이 프롬프트로는 생성할 수 없습니다.',
    };
  }
  if (p.includes('warn') || p.includes('위반') || p.includes('무분별') || p.includes('과장')) {
    return {
      level: 'warn',
      violations: ['톤앤매너', '클레임 표현'],
      headline: '브랜드 거버넌스: 경고 — 프롬프트를 다듬거나 우측에서 재생성·경로를 조정해 주세요.',
    };
  }
  return {
    level: 'pass',
    violations: [],
    headline: '브랜드 거버넌스: 통과 — 브랜드 정렬 이미지를 생성할 수 있습니다.',
  };
}

/** 목업 DAM 경로 (탐색 리스트 — 깊이는 슬래시 개수로 들여쓰기) */
const DAM_SELECTABLE_PATHS: readonly string[] = [
  '/content/dam/brand',
  '/content/dam/brand/campaigns',
  '/content/dam/brand/campaigns/2026-summer',
  '/content/dam/brand/campaigns/brand-refresh',
  '/content/dam/brand/global',
  '/content/dam/brand/global/logos',
  '/content/dam/brand/global/hero-assets',
  '/content/dam/regulatory',
  '/content/dam/regulatory/archive',
] as const;

function buildAiSuggestedDamPath(selectedPath: string | null, origin: 'text' | 'image' | null): string {
  const base =
    selectedPath && selectedPath.length > 0
      ? selectedPath
      : '/content/dam/brand/campaigns/2026-summer';
  const leaf = origin === 'text' ? 'firefly-governed/nl-gen' : 'ingest/renditions';
  return `${base.replace(/\/$/, '')}/${leaf}`;
}

type ChatMsg = {
  role: 'user' | 'assistant';
  text: string;
  imageSrc?: string;
  imageFileName?: string;
};

const MOCK_EDIT_PREVIEW_FILE = 'summer_banner_v3.png';
const INGEST_SESSION_KEY = 'assetMate_lastIngest';
const NL_GEN_PREVIEW_FILE = 'product_lifestyle_01.png';

type SessionOrigin = 'text' | 'image' | null;

export default function AssetUpload() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState('');
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [pendingPreview, setPendingPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [ingestPhase, setIngestPhase] = useState<'awaiting_content' | 'ready_to_upload' | 'done'>('awaiting_content');
  const [sessionOrigin, setSessionOrigin] = useState<SessionOrigin>(null);
  const [governance, setGovernance] = useState<ReturnType<typeof mockIngestGovernance> | null>(null);
  const [mainImageDataUrl, setMainImageDataUrl] = useState<string | null>(null);
  const [mainFileName, setMainFileName] = useState<string | null>(null);
  const [baselineNote, setBaselineNote] = useState('');
  const [editPrompts, setEditPrompts] = useState<string[]>([]);
  const [previewLooksEdited, setPreviewLooksEdited] = useState(false);
  const [previewBust, setPreviewBust] = useState(0);

  const [selectedDamPath, setSelectedDamPath] = useState<string | null>(null);

  const taxonomyHint = useMemo(() => {
    if (!selectedDamPath) return null;
    const match = ASSETS.find(
      a =>
        selectedDamPath.includes(a.campaign.replace(/\s+/g, '-').toLowerCase()) ||
        a.campaign.toLowerCase().split(/\s+/).some(w => w.length > 2 && selectedDamPath.toLowerCase().includes(w.toLowerCase()))
    );
    return match?.taxonomyPath.join(' › ') ?? 'DAM 경로 기반 자동 분류 제안 (목업)';
  }, [selectedDamPath]);

  const aiSuggestedDamPath = useMemo(
    () => buildAiSuggestedDamPath(selectedDamPath, sessionOrigin),
    [selectedDamPath, sessionOrigin]
  );

  const clearPending = useCallback(() => {
    setPendingPreview(prev => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setPendingFile(null);
  }, []);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(Math.max(el.scrollHeight, 40), 160)}px`;
  }, [input]);

  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !file.type.startsWith('image/')) return;
    setPendingPreview(prev => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
    setPendingFile(file);
  };

  const appendAssistant = (text: string) => {
    setMessages(prev => [...prev, { role: 'assistant', text }]);
  };

  const readFileDataUrl = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(String(r.result));
      r.onerror = () => reject(r.error);
      r.readAsDataURL(file);
    });

  const sendChat = async () => {
    const t = input.trim();
    const file = pendingFile;
    if (ingestPhase === 'done') return;
    if (!t && !file) {
      appendAssistant(
        '**프롬프트**만으로 생성하거나, **이미지를 첨부**해 재생성·인입을 시작할 수 있습니다. 둘 다 비어 있으면 전송할 수 없습니다. (목업)'
      );
      return;
    }

    let imageDataUrl: string | undefined;
    let imageFileName: string | undefined;
    if (file) {
      imageFileName = file.name;
      try {
        imageDataUrl = await readFileDataUrl(file);
      } catch {
        /* skip image in message */
      }
    }

    const userText = t || (file ? `이미지: ${file.name}` : '');
    setMessages(prev => [
      ...prev,
      {
        role: 'user',
        text: userText,
        ...(imageDataUrl ? { imageSrc: imageDataUrl, imageFileName } : {}),
      },
    ]);
    setInput('');
    clearPending();

    if (ingestPhase === 'awaiting_content') {
      if (imageDataUrl && imageFileName) {
        setSessionOrigin('image');
        const gov = mockIngestGovernance(imageFileName);
        setGovernance(gov);
        setMainImageDataUrl(imageDataUrl);
        setMainFileName(imageFileName);
        setBaselineNote(t.trim());
        setEditPrompts([]);
        setPreviewLooksEdited(false);
        setPreviewBust(0);

        const damLines = DAM_SELECTABLE_PATHS.map(p => `· \`${p}\``).join('\n');
        appendAssistant(
          `${gov.headline}\n\n` +
            (gov.violations.length ? `감지 항목: ${gov.violations.join(', ')}\n\n` : '') +
            (gov.level === 'block'
              ? '다른 파일로 다시 시도해 주세요. 이 스레드에서는 진행할 수 없습니다.'
              : `우측에서 **DAM 경로를 탐색**해 저장 위치를 고르세요. 옆의 **AI 제안 경로**는 거버넌스·캠페인 맥락에 맞춘 목업 제안입니다.\n\n참고 트리:\n${damLines}\n\n` +
                (gov.level === 'warn'
                  ? '경고가 있으면 이 창에서 자연어로 수정·재생성을 요청한 뒤, **AI로 이미지 재생성** 또는 채팅 반영 후 **최종본 업로드 확인**을 진행하세요.'
                  : '경로 선택 후 **최종본 업로드 확인**으로 DAM 인입을 시뮬레이션합니다.'))
        );
        if (gov.level !== 'block') {
          setIngestPhase('ready_to_upload');
        }
        return;
      }

      if (t && !file) {
        setSessionOrigin('text');
        const gov = mockGovernanceForTextPrompt(t);
        setGovernance(gov);
        setBaselineNote(t);
        setEditPrompts([]);
        setPreviewLooksEdited(false);
        setPreviewBust(0);

        if (gov.level === 'block') {
          appendAssistant(
            `${gov.headline}\n\n` + (gov.violations.length ? `사유: ${gov.violations.join(', ')}` : '') + '\n\n프롬프트를 수정해 다시 시도해 주세요.'
          );
          setMainImageDataUrl(null);
          setMainFileName(null);
          setSessionOrigin(null);
          setGovernance(null);
          return;
        }

        setMainFileName('governed_nl_gen.png');
        setMainImageDataUrl(sampleImageUrl(NL_GEN_PREVIEW_FILE, 'after'));
        appendAssistant(
          `${gov.headline}\n\n` +
            (gov.violations.length ? `주의: ${gov.violations.join(', ')}\n\n` : '') +
            '브랜드 팔레트·로고 안전영역·톤 가이드를 반영한 **이미지 초안**을 생성했습니다 (목업). 우측에서 DAM 경로를 고르고, **AI 제안 경로**를 참고하세요.\n\n' +
            (gov.level === 'warn'
              ? '경고가 있으면 프롬프트를 다듬거나 채팅으로 수정 요청을 이어 가세요.'
              : '만족스러우면 경로 선택 후 **최종본 업로드 확인**을 누르세요.')
        );
        setIngestPhase('ready_to_upload');
        return;
      }
    }

    if (ingestPhase === 'ready_to_upload') {
      if (!governance) return;
      if (governance.level === 'block') return;

      if (governance.level === 'warn') {
        if (!selectedDamPath) {
          appendAssistant('먼저 우측에서 **DAM 저장 경로**를 선택해 주세요.');
          return;
        }
        const nextEdits = [...editPrompts, t];
        setEditPrompts(nextEdits);
        setPreviewLooksEdited(true);
        setPreviewBust(b => b + 1);
        appendAssistant(
          `요청하신 내용을 반영했습니다 (목업). 프리뷰가 갱신되었습니다.\n\n` +
            `누적 지시: ${[baselineNote, ...nextEdits].filter(Boolean).join(' → ') || '(텍스트 없음)'}`
        );
        return;
      }

      if (governance.level === 'pass') {
        appendAssistant('메모를 받았습니다. DAM 경로를 선택한 뒤 **최종본 업로드 확인**을 눌러 주세요. (목업)');
      }
    }
  };

  const regenerateImageGoverned = () => {
    if (ingestPhase !== 'ready_to_upload' || !governance || governance.level === 'block') return;
    if (!selectedDamPath) {
      appendAssistant('**DAM 저장 경로**를 먼저 선택해 주세요. (목업)');
      return;
    }
    setPreviewLooksEdited(true);
    setPreviewBust(b => b + 1);
    appendAssistant(
      '브랜드 거버넌스에 맞춰 이미지를 **재생성**했습니다 (목업). 미리보기가 갱신되었습니다. 필요하면 채팅으로 추가 수정을 요청하세요.'
    );
  };

  const canConfirmUpload =
    ingestPhase === 'ready_to_upload' &&
    governance != null &&
    governance.level !== 'block' &&
    selectedDamPath != null &&
    (governance.level === 'pass' || (governance.level === 'warn' && editPrompts.length > 0));

  const buildGenerationPrompt = () => {
    const parts: string[] = [];
    if (sessionOrigin === 'text') parts.push(`NL 생성: ${baselineNote}`);
    if (sessionOrigin === 'image' && baselineNote) parts.push(`인입 노트: ${baselineNote}`);
    editPrompts.forEach((p, i) => parts.push(`편집 ${i + 1}: ${p}`));
    return parts.join(' | ') || '세션만으로 확정 (별도 NL 지시 없음)';
  };

  const confirmUpload = () => {
    if (!canConfirmUpload || !governance || !mainFileName) return;
    const generationPrompt = buildGenerationPrompt();
    const payload = {
      fileName: mainFileName,
      damPath: selectedDamPath,
      aiSuggestedDamPath,
      taxonomyHint,
      generationPrompt,
      governanceLevel: governance.level,
      sessionOrigin,
      at: new Date().toISOString(),
    };
    try {
      sessionStorage.setItem(INGEST_SESSION_KEY, JSON.stringify(payload));
    } catch {
      /* ignore */
    }
    appendAssistant(
      `**업로드가 완료되었습니다** (목업).\n\n` +
        `- DAM 경로: \`${selectedDamPath}\`\n` +
        `- AI 제안 경로(참고): \`${aiSuggestedDamPath}\`${taxonomyHint ? `\n- 분류: ${taxonomyHint}` : ''}\n` +
        `- \`generationPrompt\` 메타(시뮬): ${generationPrompt}\n\n` +
        `실서비스에서는 DAM에 최종 바이너리가 저장되고 에셋 레코드가 생성됩니다.`
    );
    setIngestPhase('done');
  };

  const resetSession = () => {
    setMessages([]);
    setGovernance(null);
    setMainImageDataUrl(null);
    setMainFileName(null);
    setBaselineNote('');
    setEditPrompts([]);
    setSelectedDamPath(null);
    setSessionOrigin(null);
    setPreviewLooksEdited(false);
    setPreviewBust(0);
    setIngestPhase('awaiting_content');
    clearPending();
    setInput('');
    try {
      sessionStorage.removeItem(INGEST_SESSION_KEY);
    } catch {
      /* ignore */
    }
  };

  const previewUrl = useMemo(() => {
    if (!mainFileName) return null;
    if (previewLooksEdited) {
      return sampleImageUrl(MOCK_EDIT_PREVIEW_FILE, 'after', previewBust || undefined);
    }
    return mainImageDataUrl;
  }, [mainFileName, mainImageDataUrl, previewLooksEdited, previewBust]);

  const ingestPhaseLabel =
    ingestPhase === 'done'
      ? '업로드 완료'
      : ingestPhase === 'ready_to_upload'
        ? '거버넌스 처리 완료 · DAM 경로·확인 대기'
        : '프롬프트 또는 이미지 대기';

  /** 채팅으로 이미지가 준비된 뒤(업로드 확정 전)·차단이 아닐 때만 DAM 탐색·AI 제안 표시 */
  const showDamPathPanel =
    Boolean(previewUrl) &&
    governance != null &&
    governance.level !== 'block' &&
    ingestPhase === 'ready_to_upload';

  /** 조건·대화 초기화 직후 등 — 검색 AI 탭과 같이 ‘결과 없음’ 플레이스홀더만 표시 */
  const showRightEmptyPlaceholder =
    ingestPhase === 'awaiting_content' && governance == null && mainFileName == null;

  const damIndent = (path: string) => Math.max(0, path.split('/').filter(Boolean).length - 3) * 12;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: UPLOAD_AI_VIEW_HEIGHT,
        minHeight: 0,
        maxHeight: UPLOAD_AI_VIEW_HEIGHT,
        overflow: 'hidden',
      }}
    >
      <PageHeader
        title="AI Creative"
        description="브랜드 거버넌스를 준수해 이미지를 생성·재생성하고, DAM 경로를 탐색해 업로드합니다. 텍스트만으로 생성하거나 이미지를 첨부해 시작할 수 있습니다. (목업)"
      />
      <div
        style={{
          padding: '24px 28px 40px',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          flex: 1,
          minHeight: 0,
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(280px, 360px) minmax(320px, 1fr)',
            gridTemplateRows: 'minmax(0, 1fr)',
            gap: 20,
            alignItems: 'stretch',
            flex: 1,
            minHeight: 0,
          }}
        >
          <div
            style={{
              ...card,
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
              height: '100%',
              minHeight: 0,
              overflow: 'hidden',
            }}
          >
            <Text UNSAFE_style={{ fontSize: 15, fontWeight: 'bold' }}>거버넌스 AI 채팅</Text>
            <Text UNSAFE_style={{ fontSize: 12, color: CM.textMuted, lineHeight: 1.5 }}>
              **텍스트만**으로 브랜드 정렬 이미지를 생성하거나, **이미지를 첨부**해 분석·재생성·DAM 업로드 흐름을 시작합니다. 이미지 파일명에 <code>warn</code>·<code>위반</code> → 경고,{' '}
              <code>block</code>·<code>금지</code> → 차단 목업입니다. NL에는 <code>금지</code>·<code>경쟁사 로고</code> 등이 있으면 차단됩니다.
            </Text>
            <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
              <div
                style={{
                  flex: 1,
                  minHeight: 120,
                  overflowY: 'scroll',
                  overscrollBehavior: 'contain',
                  border: `1px solid ${CM.cardBorder}`,
                  borderRadius: 8,
                  padding: 10,
                  backgroundColor: CM.mainBg,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                }}
              >
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    style={{
                      alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                      maxWidth: '92%',
                      padding: '8px 12px',
                      borderRadius: 10,
                      backgroundColor: msg.role === 'user' ? CM.infoBg : CM.panelBg,
                      border: `1px solid ${CM.cardBorder}`,
                      fontSize: 13,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 8,
                      minWidth: 0,
                    }}
                  >
                    {msg.role === 'user' && msg.imageSrc && (
                      <div
                        style={{
                          borderRadius: 8,
                          overflow: 'hidden',
                          border: `1px solid ${CM.cardBorder}`,
                          maxHeight: 180,
                          maxWidth: 240,
                        }}
                      >
                        <img
                          src={msg.imageSrc}
                          alt={msg.imageFileName ?? ''}
                          style={{ width: '100%', display: 'block', objectFit: 'cover', maxHeight: 180 }}
                        />
                      </div>
                    )}
                    <span style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</span>
                  </div>
                ))}
              </div>
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={onFileChange} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flexShrink: 0 }}>
              {pendingPreview && pendingFile && (
                <div
                  style={{
                    ...f({ gap: 10, alignItems: 'center' }),
                    padding: 10,
                    borderRadius: 8,
                    backgroundColor: CM.panelBg,
                    border: `1px solid ${CM.cardBorder}`,
                  }}
                >
                  <div
                    style={{
                      position: 'relative',
                      width: 72,
                      height: 72,
                      borderRadius: 8,
                      overflow: 'hidden',
                      border: `1px solid ${CM.cardBorder}`,
                      flexShrink: 0,
                      backgroundColor: CM.surfacePlaceholder,
                    }}
                  >
                    <img src={pendingPreview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Text UNSAFE_style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>
                      첨부 이미지
                    </Text>
                    <span
                      title={pendingFile.name}
                      style={{
                        fontSize: 12,
                        color: CM.textSecondary,
                        display: 'block',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {pendingFile.name}
                    </span>
                    <Text UNSAFE_style={{ fontSize: 11, color: CM.textMuted, marginTop: 4, display: 'block' }}>
                      메시지와 함께 전송하면 이미지 기준 거버넌스 분석이 진행됩니다.
                    </Text>
                  </div>
                  <button
                    type="button"
                    aria-label="첨부 이미지 제거"
                    onClick={clearPending}
                    style={{
                      alignSelf: 'flex-start',
                      marginTop: 2,
                      padding: '6px 10px',
                      borderRadius: 6,
                      border: `1px solid ${CM.cardBorder}`,
                      fontSize: 12,
                      cursor: 'pointer',
                      backgroundColor: CM.panelBg,
                      color: CM.textSecondary,
                    }}
                  >
                    제거
                  </button>
                </div>
              )}
              <div
                style={{
                  ...f({ alignItems: 'flex-end', gap: 6 }),
                  padding: '6px 8px 6px 12px',
                  borderRadius: 12,
                  border: `1px solid ${CM.cardBorder}`,
                  backgroundColor: CM.panelBg,
                  boxShadow: CM.cardShadow,
                }}
              >
                <textarea
                  ref={textareaRef}
                  aria-label="생성·인입 메시지"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder={
                    ingestPhase === 'awaiting_content'
                      ? '브랜드에 맞는 장면을 설명하거나, 수정·재생성 요청을 입력…'
                      : '자연어로 수정·재생성 요청 (경고 시) 또는 메모…'
                  }
                  rows={1}
                  style={{
                    flex: 1,
                    minWidth: 0,
                    minHeight: 40,
                    maxHeight: 168,
                    resize: 'none',
                    border: 'none',
                    outline: 'none',
                    background: 'transparent',
                    fontSize: 14,
                    fontFamily: 'inherit',
                    lineHeight: 1.5,
                    padding: '10px 4px 10px 0',
                    color: CM.text,
                  }}
                />
                <div
                  style={{
                    ...f({ alignItems: 'center', gap: 2 }),
                    flexShrink: 0,
                    paddingBottom: 4,
                  }}
                >
                  <button
                    type="button"
                    aria-label="이미지 첨부"
                    disabled={ingestPhase === 'done'}
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 8,
                      border: 'none',
                      background: 'transparent',
                      cursor: ingestPhase === 'done' ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: CM.textSecondary,
                      opacity: ingestPhase === 'done' ? 0.5 : 1,
                    }}
                  >
                    <span style={{ display: 'flex', width: 20, height: 20 }}>
                      <Add />
                    </span>
                  </button>
                  <div
                    style={{
                      width: 1,
                      height: 22,
                      backgroundColor: CM.cardBorder,
                      margin: '0 4px',
                      flexShrink: 0,
                    }}
                  />
                  <button
                    type="button"
                    aria-label="메시지 보내기"
                    disabled={ingestPhase === 'done'}
                    onClick={() => void sendChat()}
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      border: `1px solid ${CM.cardBorder}`,
                      backgroundColor: '#E5E7EB',
                      cursor: ingestPhase === 'done' ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: CM.text,
                      boxShadow: '0 1px 2px rgba(15, 23, 42, 0.05)',
                      opacity: ingestPhase === 'done' ? 0.5 : 1,
                    }}
                  >
                    <span style={{ display: 'flex', width: 20, height: 20 }}>
                      <Send />
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div
            style={{
              ...card,
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
              minWidth: 0,
              minHeight: 0,
              height: '100%',
              overflow: 'hidden',
            }}
          >
            <div style={{ ...f({ flexDirection: 'column', gap: 12 }), flexShrink: 0 }}>
              <div style={f({ justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 })}>
                <Text UNSAFE_style={{ fontSize: 15, fontWeight: 'bold' }}>적용 조건 · 결과</Text>
                <div style={f({ gap: 8 })}>
                  <Button variant="secondary" size="S" onPress={resetSession}>
                    조건·대화 초기화
                  </Button>
                </div>
              </div>
              {showRightEmptyPlaceholder ? (
                <Text UNSAFE_style={{ fontSize: 13, color: CM.textMuted, lineHeight: 1.55 }}>
                  왼쪽 채팅에서 전송하면 거버넌스·프리뷰·DAM 제안이 여기에 쌓입니다. 초기화 상태에서는 검색 화면과 같이 결과가 없습니다.
                </Text>
              ) : (
                <>
                  <div style={f({ gap: 6, flexWrap: 'wrap', alignItems: 'center' })}>
                    {governance && (
                      <MutedBadge
                        tone={governance.level === 'pass' ? 'success' : governance.level === 'warn' ? 'warning' : 'danger'}
                        size="S"
                      >
                        거버넌스: {governance.level === 'pass' ? '통과' : governance.level === 'warn' ? '경고' : '차단'}
                      </MutedBadge>
                    )}
                    {governance?.violations.map(v => (
                      <MutedBadge key={v} tone="danger" size="S">
                        {v}
                      </MutedBadge>
                    ))}
                    {selectedDamPath && (
                      <MutedBadge tone="neutral" size="S">
                        DAM: {selectedDamPath.length > 42 ? `…${selectedDamPath.slice(-40)}` : selectedDamPath}
                      </MutedBadge>
                    )}
                    {sessionOrigin && (
                      <MutedBadge tone="info" size="S">
                        {sessionOrigin === 'text' ? 'NL 생성' : '이미지 세션'}
                      </MutedBadge>
                    )}
                    {taxonomyHint && (
                      <MutedBadge tone="accent" size="S">
                        분류: {taxonomyHint}
                      </MutedBadge>
                    )}
                    {mainFileName && (
                      <MutedBadge tone="info" size="S">
                        파일: {mainFileName}
                      </MutedBadge>
                    )}
                  </div>
                  <Text UNSAFE_style={{ fontSize: 13, color: CM.textSecondary }}>
                    {ingestPhase === 'done'
                      ? '인입이 완료되었습니다 (목업).'
                      : governance
                        ? `${governance.headline} · 단계: ${ingestPhaseLabel}`
                        : '프롬프트 또는 이미지를 내면 거버넌스·DAM 제안이 표시됩니다.'}
                  </Text>
                </>
              )}
            </div>

            <div
              style={{
                flex: 1,
                minHeight: 0,
                overflowY: 'auto',
                WebkitOverflowScrolling: 'touch',
              }}
            >
              {showRightEmptyPlaceholder ? (
                <div
                  style={{
                    height: '100%',
                    minHeight: 200,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 24,
                    border: `1px dashed ${CM.cardBorder}`,
                    borderRadius: 10,
                    backgroundColor: CM.mainBg,
                  }}
                >
                  <Text UNSAFE_style={{ fontSize: 13, color: CM.textMuted, textAlign: 'center', lineHeight: 1.6 }}>
                    아직 표시할 결과가 없습니다. 메시지를 전송해 생성·분석을 시작하세요.
                  </Text>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14, paddingBottom: 8 }}>
                  {governance && (
                    <div
                      style={{
                        padding: 12,
                        borderRadius: 8,
                        backgroundColor:
                          governance.level === 'block' ? CM.dangerBg : governance.level === 'warn' ? CM.warningBg : CM.successBg,
                        border: `1px solid ${CM.cardBorder}`,
                      }}
                    >
                      <Text UNSAFE_style={{ fontSize: 12, color: CM.textSecondary, lineHeight: 1.55, whiteSpace: 'pre-wrap' }}>
                        {governance.headline}
                      </Text>
                    </div>
                  )}

                  <div>
                    <Text UNSAFE_style={{ fontSize: 12, fontWeight: 700, color: CM.textSecondary, display: 'block', marginBottom: 8 }}>
                      현재 후보 프리뷰
                    </Text>
                    <div style={{ ...f({ gap: 8, flexWrap: 'wrap' }), marginBottom: 10 }}>
                      <Button
                        variant="secondary"
                        size="S"
                        isDisabled={
                          ingestPhase !== 'ready_to_upload' || governance == null || governance.level === 'block' || !selectedDamPath
                        }
                        onPress={regenerateImageGoverned}
                      >
                        AI로 이미지 재생성 (거버넌스)
                      </Button>
                    </div>
                    <div
                      style={{
                        width: '100%',
                        minHeight: 220,
                        aspectRatio: '16 / 10',
                        maxHeight: 'min(42vh, 480px)',
                        borderRadius: 12,
                        overflow: 'hidden',
                        backgroundColor: CM.surfacePlaceholder,
                        border: `1px solid ${CM.cardBorder}`,
                      }}
                    >
                      {previewUrl ? (
                        <img src={previewUrl} alt="프리뷰" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                      ) : (
                        <div style={{ ...f({ alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: 200 }) }}>
                          <Text UNSAFE_style={{ color: CM.textMuted }}>프롬프트 전송 또는 이미지 첨부 후 표시됩니다</Text>
                        </div>
                      )}
                    </div>
                    {mainFileName && (
                      <Text UNSAFE_style={{ fontSize: 11, color: CM.textMuted, marginTop: 6, display: 'block' }}>
                        원본 파일: {mainFileName}
                        {previewLooksEdited ? ' · 목업 수정본 프리뷰' : ''}
                      </Text>
                    )}
                  </div>

                  {showDamPathPanel && (
                    <div>
                      <Text UNSAFE_style={{ fontSize: 12, fontWeight: 700, color: CM.textSecondary, display: 'block', marginBottom: 8 }}>
                        DAM 저장 경로 · AI 제안
                      </Text>
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'minmax(0, 1fr) minmax(200px, 260px)',
                          gap: 12,
                          alignItems: 'stretch',
                        }}
                      >
                        <div
                          style={{
                            border: `1px solid ${CM.cardBorder}`,
                            borderRadius: 8,
                            padding: 8,
                            maxHeight: 220,
                            overflowY: 'auto',
                            backgroundColor: CM.mainBg,
                          }}
                        >
                          <Text UNSAFE_style={{ fontSize: 11, color: CM.textMuted, display: 'block', marginBottom: 6 }}>
                            경로 탐색 (클릭하여 선택)
                          </Text>
                          {DAM_SELECTABLE_PATHS.map(p => {
                            const active = selectedDamPath === p;
                            return (
                              <button
                                key={p}
                                type="button"
                                disabled={ingestPhase !== 'ready_to_upload' || governance?.level === 'block'}
                                onClick={() => setSelectedDamPath(p)}
                                style={{
                                  display: 'block',
                                  width: '100%',
                                  textAlign: 'left',
                                  padding: '6px 8px',
                                  marginBottom: 4,
                                  borderRadius: 6,
                                  border: 'none',
                                  cursor: ingestPhase !== 'ready_to_upload' || governance?.level === 'block' ? 'not-allowed' : 'pointer',
                                  backgroundColor: active ? CM.infoBg : 'transparent',
                                  color: CM.text,
                                  fontSize: 12,
                                  paddingLeft: 8 + damIndent(p),
                                  opacity: ingestPhase !== 'ready_to_upload' || governance?.level === 'block' ? 0.5 : 1,
                                }}
                              >
                                {p.replace(/^\/content\/dam/, '') || '/'}
                              </button>
                            );
                          })}
                        </div>
                        <div
                          style={{
                            border: `1px solid ${CM.cardBorder}`,
                            borderRadius: 8,
                            padding: 12,
                            backgroundColor: CM.panelBg,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 10,
                            minHeight: 0,
                          }}
                        >
                          <Text UNSAFE_style={{ fontSize: 12, fontWeight: 700 }}>AI 제안 경로</Text>
                          <Text UNSAFE_style={{ fontSize: 11, color: CM.textSecondary, lineHeight: 1.5, wordBreak: 'break-all' }}>
                            {aiSuggestedDamPath}
                          </Text>
                          <Text UNSAFE_style={{ fontSize: 11, color: CM.textMuted, lineHeight: 1.45 }}>
                            거버넌스·세션 유형에 맞춘 목업 제안입니다. 실제로는 메타·캠페인·폴더 규칙을 반영합니다.
                          </Text>
                          <Button
                            variant="secondary"
                            size="S"
                            isDisabled={ingestPhase !== 'ready_to_upload' || governance?.level === 'block'}
                            onPress={() => setSelectedDamPath(aiSuggestedDamPath)}
                          >
                            제안 경로 적용
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {!showRightEmptyPlaceholder && (
              <div style={{ ...f({ gap: 8, flexWrap: 'wrap', alignItems: 'center' }), flexShrink: 0, paddingTop: 4 }}>
                <AccentButton isDisabled={!canConfirmUpload} onPress={confirmUpload}>
                  최종본 업로드 확인
                </AccentButton>
                {ingestPhase === 'done' && (
                  <Button variant="secondary" size="S" onPress={() => navigate('/search')}>
                    검색으로 이동
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
