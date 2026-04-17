import { Text, Button, Checkbox } from '@react-spectrum/s2';
import { MutedBadge } from '../components/MutedBadge';
import { useCallback, useEffect, useRef, useState } from 'react';
import { PageHeader, CM } from '../components/AppLayout';
import { AccentButton } from '../components/AccentButton';
import { SampleAssetImage } from '../components/SampleAssetImage';
import { ASSETS } from '../data/mock';

const f = (extra?: React.CSSProperties): React.CSSProperties => ({ display: 'flex', ...extra });
const card: React.CSSProperties = {
  backgroundColor: CM.panelBg,
  borderRadius: 12,
  padding: 20,
  border: `1px solid ${CM.cardBorder}`,
  boxShadow: CM.cardShadow,
};

const TABS = ['에셋 최적화', '스마트 크롭', '배치 다운로드'];
const FORMAT_OPTIONS = ['WebP', 'AVIF', 'JPEG (최적화)', 'PNG (최적화)'];

const ASPECT_PRESETS = [
  { id: '1:1', label: '1:1 · Instagram 피드' },
  { id: '4:5', label: '4:5 · Instagram 릴스/스토리' },
  { id: '16:9', label: '16:9 · YouTube / 배너' },
  { id: '9:16', label: '9:16 · 세로 숏폼' },
  { id: 'original', label: '원본 비율 유지' },
] as const;

/** 목: 피사체/얼굴 박스 위치 (에셋별로 약간 다르게) */
function mockSubjectBox(assetId: string) {
  const seed = assetId.split('').reduce((n, c) => n + c.charCodeAt(0), 0);
  const left = 28 + (seed % 18);
  const top = 22 + (seed % 14);
  const w = 32 + (seed % 12);
  const h = 38 + (seed % 10);
  return { left, top, w, h };
}

export default function Optimization() {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedAssets, setSelectedAssets] = useState<Set<string>>(new Set(['a1', 'a4']));
  const [targetFormat, setTargetFormat] = useState('WebP');

  const [cropAssetId, setCropAssetId] = useState('a1');
  const [cropMode, setCropMode] = useState<'auto' | 'manual'>('auto');
  const [aspectPreset, setAspectPreset] = useState<(typeof ASPECT_PRESETS)[number]['id']>('1:1');
  const [focusPct, setFocusPct] = useState({ x: 50, y: 45 });
  const [applyFocusToAllResizes, setApplyFocusToAllResizes] = useState(true);
  const previewRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef(false);

  const cropAsset = ASSETS.find(a => a.id === cropAssetId) ?? ASSETS[0];
  const subject = mockSubjectBox(cropAsset.id);
  const safeInset = 8;

  const syncFocusFromAuto = useCallback(() => {
    setFocusPct({
      x: subject.left + subject.w / 2,
      y: subject.top + subject.h / 2,
    });
  }, [subject.left, subject.top, subject.w, subject.h]);

  const setMode = (mode: 'auto' | 'manual') => {
    setCropMode(mode);
    if (mode === 'auto') syncFocusFromAuto();
  };

  const onPreviewPointerDown = (e: React.PointerEvent) => {
    if (cropMode !== 'manual') return;
    dragRef.current = true;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    updateFocusFromEvent(e);
  };

  const updateFocusFromEvent = (e: React.PointerEvent | PointerEvent) => {
    const el = previewRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 100;
    const y = ((e.clientY - r.top) / r.height) * 100;
    setFocusPct({
      x: Math.min(100, Math.max(0, x)),
      y: Math.min(100, Math.max(0, y)),
    });
  };

  const onPreviewPointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current || cropMode !== 'manual') return;
    updateFocusFromEvent(e);
  };

  const onPreviewPointerUp = () => {
    dragRef.current = false;
  };

  useEffect(() => {
    if (cropMode === 'auto') syncFocusFromAuto();
  }, [cropAssetId, cropMode, syncFocusFromAuto]);

  const toggle = (id: string) => {
    const next = new Set(selectedAssets);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelectedAssets(next);
  };

  return (
    <>
      <PageHeader title="에셋 최적화" description="에셋 포맷 변환, 품질 최적화, 배치 다운로드를 수행합니다" />
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
            <div style={card}>
              <Text UNSAFE_style={{ fontSize: 14, fontWeight: 'bold', display: 'block', marginBottom: 12 }}>대상 포맷 선택</Text>
              <div style={f({ gap: 8 })}>
                {FORMAT_OPTIONS.map(fmt =>
                  targetFormat === fmt ? (
                    <AccentButton key={fmt} size="S" onPress={() => setTargetFormat(fmt)}>
                      {fmt}
                    </AccentButton>
                  ) : (
                    <Button key={fmt} variant="secondary" size="S" onPress={() => setTargetFormat(fmt)}>
                      {fmt}
                    </Button>
                  )
                )}
              </div>
            </div>

            <div style={card}>
              <Text UNSAFE_style={{ fontSize: 14, fontWeight: 'bold', display: 'block', marginBottom: 12 }}>에셋 선택</Text>
              <div style={f({ flexDirection: 'column' })}>
                {ASSETS.filter(a => a.type === 'image').map(asset => (
                  <div key={asset.id} style={{ padding: 12, borderBottom: `1px solid ${CM.cardBorder}` }}>
                    <div style={f({ gap: 12, alignItems: 'center' })}>
                      <Checkbox isSelected={selectedAssets.has(asset.id)} onChange={() => toggle(asset.id)} />
                      <div
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: 8,
                          overflow: 'hidden',
                          flexShrink: 0,
                          backgroundColor: CM.surfacePlaceholder,
                        }}
                      >
                        <SampleAssetImage filename={asset.name} />
                      </div>
                      <Text UNSAFE_style={{ fontSize: 14, fontWeight: 500, flex: 1 }}>{asset.name}</Text>
                      <Text UNSAFE_style={{ fontSize: 12, color: CM.textSecondary }}>{asset.dim}</Text>
                      <Text UNSAFE_style={{ fontSize: 12, color: CM.textSecondary }}>{asset.size}</Text>
                      <MutedBadge variant="informative" size="S">{asset.type.toUpperCase()}</MutedBadge>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {selectedAssets.size > 0 && (
              <div style={card}>
                <Text UNSAFE_style={{ fontSize: 14, fontWeight: 'bold', display: 'block', marginBottom: 12 }}>
                  최적화 예상 결과 ({selectedAssets.size}개 에셋 → {targetFormat})
                </Text>
                <div style={f({ flexDirection: 'column', gap: 8 })}>
                  <div style={f({ justifyContent: 'space-between' })}>
                    <Text UNSAFE_style={{ fontSize: 13, color: CM.textSecondary }}>원본 총 용량</Text>
                    <Text UNSAFE_style={{ fontSize: 13, fontWeight: 600 }}>9.3 MB</Text>
                  </div>
                  <div style={f({ justifyContent: 'space-between' })}>
                    <Text UNSAFE_style={{ fontSize: 13, color: CM.textSecondary }}>최적화 후 예상</Text>
                    <Text UNSAFE_style={{ fontSize: 13, fontWeight: 600, color: CM.success }}>3.1 MB (-67%)</Text>
                  </div>
                </div>
                <div style={f({ justifyContent: 'flex-end', marginTop: 16 })}>
                  <AccentButton>⚡ 최적화 실행 ({selectedAssets.size}개)</AccentButton>
                </div>
              </div>
            )}
          </>
        )}

        {activeTab === 1 && (
          <>
            <div style={card}>
              <Text UNSAFE_style={{ fontSize: 14, fontWeight: 'bold', display: 'block', marginBottom: 8 }}>스마트 크롭</Text>
              <Text UNSAFE_style={{ fontSize: 13, color: CM.textSecondary, display: 'block', marginBottom: 16 }}>
                AI가 피사체와 안전 영역을 감지하고, 채널 비율에 맞춰 자동 또는 수동으로 초점을 맞춥니다. 포커스 영역은 드래그로 조정할 수 있습니다.
              </Text>

              <div style={f({ gap: 8, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' })}>
                <Text UNSAFE_style={{ fontSize: 12, color: CM.textSecondary, marginRight: 4 }}>모드</Text>
                {(['auto', 'manual'] as const).map(m => (
                  cropMode === m ? (
                    <AccentButton key={m} size="S" onPress={() => setMode(m)}>
                      {m === 'auto' ? '자동 크롭' : '수동 보정'}
                    </AccentButton>
                  ) : (
                    <Button key={m} variant="secondary" size="S" onPress={() => setMode(m)}>
                      {m === 'auto' ? '자동 크롭' : '수동 보정'}
                    </Button>
                  )
                ))}
              </div>

              <Text UNSAFE_style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 8 }}>비율 프리셋</Text>
              <div style={f({ gap: 8, flexWrap: 'wrap', marginBottom: 20 })}>
                {ASPECT_PRESETS.map(p =>
                  aspectPreset === p.id ? (
                    <AccentButton key={p.id} size="S" onPress={() => setAspectPreset(p.id)}>
                      {p.label}
                    </AccentButton>
                  ) : (
                    <Button key={p.id} variant="secondary" size="S" onPress={() => setAspectPreset(p.id)}>
                      {p.label}
                    </Button>
                  )
                )}
              </div>

              <Text UNSAFE_style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 8 }}>대상 에셋</Text>
              <div style={f({ gap: 8, flexWrap: 'wrap', marginBottom: 20 })}>
                {ASSETS.filter(a => a.type === 'image').map(a =>
                  cropAssetId === a.id ? (
                    <AccentButton key={a.id} size="S" onPress={() => setCropAssetId(a.id)}>
                      {a.name}
                    </AccentButton>
                  ) : (
                    <Button key={a.id} variant="secondary" size="S" onPress={() => setCropAssetId(a.id)}>
                      {a.name}
                    </Button>
                  )
                )}
              </div>

              <div style={f({ gap: 24, alignItems: 'flex-start', flexWrap: 'wrap' })}>
                <div>
                  <Text UNSAFE_style={{ fontSize: 12, color: CM.textSecondary, display: 'block', marginBottom: 8 }}>
                    프리뷰 (수동: 포커스 점을 드래그)
                  </Text>
                  <div
                    ref={previewRef}
                    onPointerDown={onPreviewPointerDown}
                    onPointerMove={onPreviewPointerMove}
                    onPointerUp={onPreviewPointerUp}
                    onPointerLeave={onPreviewPointerUp}
                    style={{
                      position: 'relative',
                      width: 320,
                      maxWidth: '100%',
                      aspectRatio: '1',
                      borderRadius: 12,
                      overflow: 'hidden',
                      backgroundColor: CM.surfacePlaceholder,
                      cursor: cropMode === 'manual' ? 'crosshair' : 'default',
                      touchAction: 'none',
                    }}
                  >
                    <SampleAssetImage filename={cropAsset.name} />
                    <div
                      style={{
                        position: 'absolute',
                        inset: `${safeInset}%`,
                        border: `2px dashed ${CM.primaryBlue}`,
                        borderRadius: 8,
                        opacity: 0.85,
                        pointerEvents: 'none',
                      }}
                      title="안전 영역"
                    />
                    <div
                      style={{
                        position: 'absolute',
                        left: `${subject.left}%`,
                        top: `${subject.top}%`,
                        width: `${subject.w}%`,
                        height: `${subject.h}%`,
                        border: `2px solid ${CM.success}`,
                        borderRadius: 8,
                        backgroundColor: 'rgba(34, 197, 94, 0.12)',
                        pointerEvents: 'none',
                      }}
                      title="감지된 피사체 영역"
                    />
                    <div
                      style={{
                        position: 'absolute',
                        left: `calc(${focusPct.x}% - 10px)`,
                        top: `calc(${focusPct.y}% - 10px)`,
                        width: 20,
                        height: 20,
                        borderRadius: '50%',
                        border: `3px solid ${cropMode === 'manual' ? '#f59e0b' : CM.primaryBlue}`,
                        backgroundColor: 'rgba(255,255,255,0.9)',
                        boxShadow: '0 1px 4px rgba(0,0,0,0.25)',
                        pointerEvents: 'none',
                      }}
                    />
                  </div>
                  <Text UNSAFE_style={{ fontSize: 12, color: CM.textSecondary, marginTop: 8, display: 'block' }}>
                    비율: {aspectPreset}
                    {' · '}포커스: {focusPct.x.toFixed(0)}%, {focusPct.y.toFixed(0)}%
                  </Text>
                </div>

                <div style={{ flex: 1, minWidth: 220 }}>
                  <Checkbox isSelected={applyFocusToAllResizes} onChange={setApplyFocusToAllResizes}>
                    모든 채널 리사이즈에 이 포커스 반영
                  </Checkbox>
                  <Text UNSAFE_style={{ fontSize: 12, color: CM.textSecondary, display: 'block', marginTop: 8, marginBottom: 16 }}>
                    자동 모드에서는 피사체 중심으로 맞추고, 수동 모드에서는 지정한 초점을 기준으로 크롭합니다.
                  </Text>
                  <div style={f({ justifyContent: 'flex-end' })}>
                    <AccentButton
                      onPress={() => {
                        if (cropMode === 'auto') syncFocusFromAuto();
                      }}
                    >
                      크롭 적용 · {ASPECT_PRESETS.find(p => p.id === aspectPreset)?.label ?? aspectPreset}
                    </AccentButton>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 2 && (
          <div style={card}>
            <Text UNSAFE_style={{ fontSize: 14, fontWeight: 'bold', display: 'block', marginBottom: 12 }}>배치 다운로드</Text>
            <Text UNSAFE_style={{ fontSize: 13, color: CM.textSecondary, display: 'block', marginBottom: 16 }}>
              다수 에셋을 채널별 사양에 맞춰 일괄 다운로드합니다
            </Text>
            <div style={f({ flexDirection: 'column', gap: 12 })}>
              {['Instagram 피드 (1080×1080)', 'Facebook 피드 (1200×630)', 'YouTube 썸네일 (1280×720)', '원본 사이즈'].map(ch => (
                <Checkbox key={ch}>{ch}</Checkbox>
              ))}
            </div>
            <div style={f({ justifyContent: 'flex-end', marginTop: 16 })}>
              <AccentButton>📦 배치 다운로드</AccentButton>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
