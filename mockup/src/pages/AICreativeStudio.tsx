import { useState, useEffect, useRef, useMemo } from 'react';
import { Text, Button, TextArea, InlineAlert, ProgressBar } from '@react-spectrum/s2';
import { MutedBadge } from '../components/MutedBadge';
import { AccentButton } from '../components/AccentButton';
import MagicWand from '@react-spectrum/s2/icons/MagicWand';
import { useNavigate } from 'react-router-dom';
import { PageHeader, CM } from '../components/AppLayout';
import { SampleAssetImage } from '../components/SampleAssetImage';

const f = (extra?: React.CSSProperties): React.CSSProperties => ({ display: 'flex', ...extra });
const card: React.CSSProperties = {
  backgroundColor: CM.panelBg,
  borderRadius: 12,
  padding: 20,
  border: `1px solid ${CM.cardBorder}`,
  boxShadow: CM.cardShadow,
};
const imageBox: React.CSSProperties = {
  flex: 1,
  minHeight: 280,
  height: 300,
  backgroundColor: CM.surfacePlaceholder,
  borderRadius: 12,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const ASSET_FILENAME = 'campaign_summer_hero.jpg';
const MOCK_AI_MS = 2800;

const TABS = ['자연어 편집', 'Generative Fill', 'Generative Expand'];

/** 명세 예시 프롬프트 — 카테고리별 템플릿 (원클릭 적용) */
const PROMPT_TEMPLATE_GROUPS: { category: string; items: { label: string; text: string }[] }[] = [
  {
    category: '색상 / 톤',
    items: [
      { label: '따뜻한 톤', text: '전체적으로 더 따뜻한 톤으로 변경해줘' },
      { label: '채도↑', text: '채도를 높여줘' },
      { label: '빈티지', text: '빈티지 느낌으로 바꿔줘' },
    ],
  },
  {
    category: '배경',
    items: [
      { label: '배경 흐림', text: '배경을 흐리게 해줘' },
      { label: '사무실', text: '배경을 깔끔한 사무실로 변경해줘' },
      { label: '맑은 하늘', text: '하늘을 맑은 날씨로 바꿔줘' },
    ],
  },
  {
    category: '오브젝트',
    items: [
      { label: '나무 제거', text: '왼쪽 나무를 제거해줘' },
      { label: '건물 추가', text: '배경에 건물을 자연스럽게 추가해줘' },
      { label: '배경 정리', text: '사람 뒤 배경을 정돈해줘' },
    ],
  },
  {
    category: '스타일',
    items: [
      { label: '프로페셔널', text: '좀 더 프로페셔널하게 보이게 해줘' },
      { label: '밝고 활기', text: '밝고 활기찬 느낌으로 해줘' },
      { label: '미니멀', text: '미니멀하게 정리해줘' },
    ],
  },
  {
    category: '구도',
    items: [
      { label: '중앙 정렬', text: '피사체를 화면 중앙으로 옮겨줘' },
      { label: '여백', text: '여백을 더 넓게 보이게 해줘' },
      { label: '타이트 크롭', text: '크롭을 더 타이트하게 해줘' },
    ],
  },
];

type HistoryStep = {
  id: string;
  label: string;
  prompt: string;
  previewStyle: React.CSSProperties;
};

const ORIGINAL_STEP: HistoryStep = {
  id: 'original',
  label: '원본',
  prompt: '',
  previewStyle: {},
};

/** 템플릿 칩 클릭 시 기존 프롬프트에 문장을 이어 붙임 */
function mergePromptFragment(current: string, fragment: string): string {
  const a = current.trim();
  const b = fragment.trim();
  if (!b) return a;
  if (!a) return b;
  return `${a} ${b}`;
}

function mockPreviewStyleFromPrompt(prompt: string): React.CSSProperties {
  const p = prompt.toLowerCase();
  if (/따뜻|warm|sepia|빈티지/.test(p))
    return { filter: 'saturate(1.14) sepia(0.14) hue-rotate(-6deg) contrast(1.03)' };
  if (/차갑|cool|하늘|맑/.test(p)) return { filter: 'saturate(1.08) hue-rotate(10deg) brightness(1.04)' };
  if (/채도|비비드|선명/.test(p)) return { filter: 'saturate(1.38) contrast(1.1)' };
  if (/흐리|blur|배경을 흐리/.test(p)) return { filter: 'saturate(1.06) contrast(0.98) blur(0.4px)' };
  if (/미니멀|프로|전문/.test(p)) return { filter: 'saturate(0.96) contrast(1.14) brightness(1.03)' };
  if (/밝|활기/.test(p)) return { filter: 'brightness(1.09) saturate(1.12)' };
  if (/어둡|무거운/.test(p)) return { filter: 'brightness(0.94) saturate(1.05)' };
  if (/중앙|구도|크롭|여백/.test(p)) return { filter: 'saturate(1.1) contrast(1.05)' };
  return { filter: 'saturate(1.12) hue-rotate(-8deg)' };
}

function evaluateBrandGuardrail(prompt: string): { ok: boolean; violations: string[] } {
  const violations: string[] = [];
  if (/#[fF]{3}0000|빨간\s*색|레드\s*색|rgb\s*\(\s*255\s*,\s*0\s*,\s*0\s*\)/i.test(prompt))
    violations.push('브랜드 Primary 외 강한 적색 사용이 감지되었습니다.');
  if (/arial|helvetica|맑은\s*고딕|굴림/i.test(prompt)) violations.push('브랜드 지정 폰트(Noto Sans KR 등) 외 서체가 언급되었습니다.');
  if (/로고\s*(제거|삭제)|워터마크\s*제거/i.test(prompt)) violations.push('로고·식별자 영역 변경은 브랜드 가이드 §로고 사용에 위배될 수 있습니다.');
  if (/경쟁사|다른\s*브랜드|타사\s*로고/i.test(prompt)) violations.push('타 브랜드 요소를 닮은 스타일 요청은 검토가 필요합니다.');
  return { ok: violations.length === 0, violations };
}

export default function AICreativeStudio() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [prompt, setPrompt] = useState('');
  const [history, setHistory] = useState<HistoryStep[]>([ORIGINAL_STEP]);
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const completeRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [lightbox, setLightbox] = useState<'original' | 'preview' | null>(null);

  const latestGuardrail = useMemo(() => {
    const last = history[history.length - 1];
    if (!last?.prompt) return evaluateBrandGuardrail('');
    return evaluateBrandGuardrail(last.prompt);
  }, [history]);

  const displayedStep = history[activeStepIndex] ?? ORIGINAL_STEP;
  const hasEdits = history.length > 1;
  const previewHasImage = hasEdits && displayedStep.id !== 'original' && !loading;

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (completeRef.current) clearTimeout(completeRef.current);
    };
  }, []);

  useEffect(() => {
    if (lightbox === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightbox(null);
    };
    window.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [lightbox]);

  const runInstructEdit = () => {
    if (!prompt.trim() || loading) return;
    setLoading(true);
    setProgress(0);
    const start = Date.now();
    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - start;
      const pct = Math.min(100, Math.round((elapsed / MOCK_AI_MS) * 100));
      setProgress(pct);
    }, 120);
    completeRef.current = setTimeout(() => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      const labelIndex = history.length;
      const newStep: HistoryStep = {
        id: `step-${Date.now()}`,
        label: `${labelIndex}. ${prompt.length > 20 ? `${prompt.slice(0, 20)}…` : prompt}`,
        prompt: prompt.trim(),
        previewStyle: mockPreviewStyleFromPrompt(prompt),
      };
      setHistory(prev => [...prev, newStep]);
      setActiveStepIndex(labelIndex);
      setProgress(100);
      setLoading(false);
    }, MOCK_AI_MS);
  };

  const undoLastEdit = () => {
    setHistory(prev => {
      if (prev.length <= 1) return prev;
      const next = prev.slice(0, -1);
      setActiveStepIndex(idx => Math.min(idx, next.length - 1));
      return next;
    });
  };

  const goToStep = (index: number) => {
    setActiveStepIndex(Math.max(0, Math.min(index, history.length - 1)));
  };

  return (
    <>
      <PageHeader title="AI Creative Studio" description="Firefly Image-to-Image Instruct Edit — 자연어로 에셋을 편집합니다" />
      <div style={{ padding: '24px 28px 40px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={f({ gap: 8 })}>
          {TABS.map((tab, i) =>
            activeTab === i ? (
              <AccentButton key={tab} size="S" onPress={() => setActiveTab(i)}>
                {tab}
              </AccentButton>
            ) : (
              <Button key={tab} variant="secondary" size="S" onPress={() => setActiveTab(i)}>
                {tab}
              </Button>
            )
          )}
        </div>

        {activeTab === 0 && (
          <>
            <div style={f({ gap: 24, alignItems: 'flex-start', flexWrap: 'wrap' })}>
              <div style={f({ flexDirection: 'column', gap: 8, flex: 1, minWidth: 260 })}>
                <Text UNSAFE_style={{ fontSize: 14, fontWeight: 'bold', textAlign: 'center' }}>원본</Text>
                <div style={{ ...imageBox, padding: 0, overflow: 'hidden' }}>
                  <SampleAssetImage filename={ASSET_FILENAME} />
                </div>
                <div style={f({ justifyContent: 'center', width: '100%' })}>
                  <Button variant="secondary" size="S" onPress={() => setLightbox('original')}>
                    이미지 크게 보기
                  </Button>
                </div>
              </div>
              <div style={f({ flexDirection: 'column', gap: 8, flex: 1, minWidth: 260 })}>
                <div style={f({ justifyContent: 'center', gap: 8, alignItems: 'center', flexWrap: 'wrap' })}>
                  <Text UNSAFE_style={{ fontSize: 14, fontWeight: 'bold' }}>편집 프리뷰</Text>
                  {hasEdits && displayedStep.id !== 'original' && (
                    <MutedBadge tone="accent" size="S">
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <MagicWand />
                        <Text>Instruct Edit</Text>
                      </span>
                    </MutedBadge>
                  )}
                </div>
                <div
                  style={
                    hasEdits && displayedStep.id !== 'original'
                      ? { ...imageBox, border: '2px solid #C4B5FD', padding: 0, overflow: 'hidden' }
                      : imageBox
                  }
                >
                  {loading ? (
                    <Text UNSAFE_style={{ color: CM.textSecondary, padding: 24, textAlign: 'center' }}>미리보기 생성 중…</Text>
                  ) : hasEdits && displayedStep.id !== 'original' ? (
                    <div style={{ width: '100%', height: '100%' }}>
                      <SampleAssetImage filename={ASSET_FILENAME} style={displayedStep.previewStyle} />
                    </div>
                  ) : (
                    <Text UNSAFE_style={{ color: CM.textSecondary, padding: 16, textAlign: 'center' }}>
                      편집 명령을 실행하면 원본 옆에 실시간 프리뷰가 표시됩니다.
                    </Text>
                  )}
                </div>
                <div style={f({ justifyContent: 'center', width: '100%' })}>
                  <Button
                    variant="secondary"
                    size="S"
                    isDisabled={!previewHasImage}
                    onPress={() => setLightbox('preview')}
                  >
                    이미지 크게 보기
                  </Button>
                </div>
              </div>
            </div>

            <div style={card}>
              <div style={{ width: '100%' }}>
                <TextArea
                  label="편집 명령 (자연어)"
                  value={prompt}
                  onChange={setPrompt}
                  description="한국어 또는 영어로 원하는 변경을 입력하세요. 아래 템플릿을 누를 때마다 문장이 이어 붙습니다(색상·배경·오브젝트 등 여러 항목을 조합할 수 있습니다)."
                />
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                  gap: 16,
                  marginTop: 14,
                  alignItems: 'start',
                }}
              >
                {PROMPT_TEMPLATE_GROUPS.map(group => (
                  <div key={group.category}>
                    <Text UNSAFE_style={{ fontSize: 12, fontWeight: 700, color: CM.textSecondary, display: 'block', marginBottom: 8 }}>
                      {group.category}
                    </Text>
                    <div style={f({ gap: 8, flexWrap: 'wrap' })}>
                      {group.items.map(({ label, text }) => (
                        <Button
                          key={`${group.category}-${label}`}
                          variant="secondary"
                          size="S"
                          onPress={() => setPrompt(p => mergePromptFragment(p, text))}
                        >
                          {label}
                        </Button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div style={f({ justifyContent: 'flex-end', marginTop: 16, gap: 8 })}>
                <Button variant="secondary" isDisabled={history.length <= 1} onPress={undoLastEdit}>
                  마지막 편집 취소
                </Button>
                <AccentButton isDisabled={!prompt.trim() || loading} onPress={runInstructEdit}>
                  <MagicWand />
                  <Text>AI 편집 실행</Text>
                </AccentButton>
              </div>
              {loading && (
                <div style={{ marginTop: 16 }}>
                  <Text UNSAFE_style={{ fontSize: 12, color: CM.textSecondary, display: 'block', marginBottom: 8 }}>
                    Firefly Instruct Edit 처리 중… (목 응답 {MOCK_AI_MS / 1000}초 · 명세 기준 10초 이내)
                  </Text>
                  <ProgressBar value={progress} />
                </div>
              )}
            </div>

            {hasEdits && (
              <div style={card}>
                <Text UNSAFE_style={{ fontSize: 14, fontWeight: 'bold', display: 'block', marginBottom: 10 }}>
                  편집 이력 (단계 선택 시 해당 미리보기로 이동)
                </Text>
                <div style={f({ gap: 8, flexWrap: 'wrap', alignItems: 'center' })}>
                  {history.map((step, index) => {
                    const active = index === activeStepIndex;
                    return active ? (
                      <AccentButton key={step.id} size="S" onPress={() => goToStep(index)}>
                        {step.label}
                      </AccentButton>
                    ) : (
                      <Button key={step.id} variant="secondary" size="S" onPress={() => goToStep(index)}>
                        {step.label}
                      </Button>
                    );
                  })}
                </div>
                {history.length > 1 && history[activeStepIndex]?.prompt && (
                  <Text UNSAFE_style={{ fontSize: 12, color: CM.textSecondary, marginTop: 12, display: 'block' }}>
                    선택 단계 명령: {history[activeStepIndex].prompt}
                  </Text>
                )}
              </div>
            )}

            {hasEdits && !loading && (
              <>
                {latestGuardrail.ok ? (
                  <InlineAlert variant="positive">브랜드 가드레일: 이번 편집 요청은 가이드와 충돌이 감지되지 않았습니다.</InlineAlert>
                ) : (
                  <InlineAlert variant="notice">
                    <Text UNSAFE_style={{ fontWeight: 700, display: 'block', marginBottom: 6 }}>브랜드 가드레일 경고</Text>
                    <ul style={{ margin: 0, paddingLeft: 20 }}>
                      {latestGuardrail.violations.map(v => (
                        <li key={v}>
                          <Text>{v}</Text>
                        </li>
                      ))}
                    </ul>
                  </InlineAlert>
                )}

                <div style={f({ gap: 12, justifyContent: 'flex-end', flexWrap: 'wrap' })}>
                  <Button variant="secondary" onPress={() => { setHistory([ORIGINAL_STEP]); setActiveStepIndex(0); }}>
                    처음(원본)으로 초기화
                  </Button>
                  <Button variant="secondary">다른 후보 보기</Button>
                  <AccentButton>적용 & 저장</AccentButton>
                </div>
              </>
            )}

            {lightbox && (
              <div
                role="dialog"
                aria-modal="true"
                aria-label={lightbox === 'original' ? '원본 이미지 확대' : '편집 프리뷰 확대'}
                style={{
                  position: 'fixed',
                  inset: 0,
                  zIndex: 10000,
                  background: 'rgba(15, 23, 42, 0.88)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 24,
                }}
                onClick={() => setLightbox(null)}
              >
                <div
                  style={{
                    position: 'relative',
                    width: 'min(92vw, 1100px)',
                    maxHeight: 'min(88vh, 900px)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 12,
                    alignItems: 'stretch',
                  }}
                  onClick={e => e.stopPropagation()}
                >
                  <div style={f({ justifyContent: 'space-between', alignItems: 'center' })}>
                    <Text UNSAFE_style={{ fontSize: 16, fontWeight: 700, color: '#f8fafc' }}>
                      {lightbox === 'original' ? '원본' : '편집 프리뷰'}
                    </Text>
                    <Button variant="secondary" size="M" onPress={() => setLightbox(null)}>
                      닫기
                    </Button>
                  </div>
                  <div
                    style={{
                      flex: 1,
                      minHeight: 0,
                      borderRadius: 12,
                      overflow: 'hidden',
                      backgroundColor: '#0f172a',
                      border:
                        lightbox === 'preview' ? '2px solid #C4B5FD' : `1px solid ${CM.cardBorder}`,
                    }}
                  >
                    <div style={{ width: '100%', height: 'min(75vh, 820px)', position: 'relative' }}>
                      <SampleAssetImage
                        filename={ASSET_FILENAME}
                        style={lightbox === 'preview' ? displayedStep.previewStyle : undefined}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {activeTab === 1 && (
          <div style={card}>
            <Text UNSAFE_style={{ fontSize: 16, fontWeight: 'bold', display: 'block', marginBottom: 8 }}>Generative Fill (F-3.3)</Text>
            <Text UNSAFE_style={{ fontSize: 14, color: CM.textSecondary, lineHeight: 1.5 }}>
              마스킹 후 제거·교체 모드는 별도 캔버스 도구와 Fill API 연동이 필요합니다. 자연어 편집 탭에서 영역 변경 의도를 프롬프트로 먼저 시도할 수 있습니다.
            </Text>
          </div>
        )}

        {activeTab === 2 && (
          <div style={card}>
            <Text UNSAFE_style={{ fontSize: 16, fontWeight: 'bold', display: 'block', marginBottom: 8 }}>Generative Expand (F-3.4)</Text>
            <Text UNSAFE_style={{ fontSize: 14, color: CM.textSecondary, lineHeight: 1.5 }}>
              소셜 리사이즈 화면에서 비율 변환 시 Expand 연계를 안내합니다. 여기서는 확장 방향·프롬프트 API를 붙이면 완성됩니다.
            </Text>
            <div style={{ marginTop: 12 }}>
              <Button variant="secondary" onPress={() => navigate('/social/resize')}>
                소셜 리사이즈로 이동
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
