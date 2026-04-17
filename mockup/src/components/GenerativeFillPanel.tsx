import { useState, useMemo } from 'react';
import { Text, Button, TextField, ProgressBar, Switch } from '@react-spectrum/s2';
import { MutedBadge } from './MutedBadge';
import { AccentButton } from './AccentButton';
import { CM } from './AppLayout';
import { SampleAssetImage } from './SampleAssetImage';
import { BRAND_CUSTOM_MODELS } from '../data/mock';

const f = (extra?: React.CSSProperties): React.CSSProperties => ({ display: 'flex', ...extra });
const card: React.CSSProperties = {
  backgroundColor: CM.panelBg,
  borderRadius: 12,
  padding: 20,
  border: `1px solid ${CM.cardBorder}`,
  boxShadow: CM.cardShadow,
};

type MaskTool = 'brush' | 'lasso' | 'rect';
type FillMode = 'remove' | 'replace';

const CANDIDATE_STYLES: React.CSSProperties[] = [
  { filter: 'saturate(1.08) contrast(1.05) brightness(1.02)' },
  { filter: 'saturate(1.15) hue-rotate(-4deg)' },
  { filter: 'saturate(1.05) sepia(0.06) contrast(1.03)' },
  { filter: 'saturate(1.12) brightness(1.04) hue-rotate(6deg)' },
];

export function GenerativeFillPanel({
  assetFilename,
  studioModelId,
}: {
  assetFilename: string;
  studioModelId: string;
}) {
  const [tool, setTool] = useState<MaskTool>('rect');
  const [maskActive, setMaskActive] = useState(false);
  const [fillMode, setFillMode] = useState<FillMode>('replace');
  const [replacePrompt, setReplacePrompt] = useState('');
  const [useBrandModel, setUseBrandModel] = useState(true);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [candidates, setCandidates] = useState<{ id: string; label: string; style: React.CSSProperties }[] | null>(null);
  const [picked, setPicked] = useState<string | null>(null);

  const modelLabel = useMemo(() => {
    const m = BRAND_CUSTOM_MODELS.find(x => x.id === studioModelId);
    return m?.name ?? '—';
  }, [studioModelId]);

  const runFill = () => {
    if (!maskActive) return;
    if (fillMode === 'replace' && !replacePrompt.trim()) return;
    setLoading(true);
    setProgress(0);
    setCandidates(null);
    setPicked(null);
    const t0 = Date.now();
    const id = window.setInterval(() => {
      setProgress(Math.min(100, Math.round(((Date.now() - t0) / 2200) * 100)));
    }, 80);
    window.setTimeout(() => {
      window.clearInterval(id);
      setProgress(100);
      setLoading(false);
      const base = fillMode === 'remove' ? '제거' : '교체';
      setCandidates(
        [1, 2, 3, 4].map((n, i) => {
          const baseStyle = CANDIDATE_STYLES[i % CANDIDATE_STYLES.length]!;
          return {
            id: `c${n}`,
            label: `${base} 후보 ${n}`,
            style: useBrandModel
              ? { ...baseStyle, filter: `${(baseStyle.filter as string) ?? ''} contrast(1.03)`.trim() }
              : baseStyle,
          };
        })
      );
    }, 2200);
  };

  return (
    <div style={f({ flexDirection: 'column', gap: 16 })}>
      <Text UNSAFE_style={{ fontSize: 14, color: CM.textSecondary, lineHeight: 1.5 }}>
        마스킹 영역을 지정한 뒤 제거(인페인트) 또는 프롬프트 교체 모드를 선택합니다. Fill API 연동 전 목업으로 후보 4종을 표시합니다.
      </Text>

      <div style={f({ gap: 8, flexWrap: 'wrap', alignItems: 'center' })}>
        <Text UNSAFE_style={{ fontSize: 13, fontWeight: 600 }}>마스킹 도구</Text>
        {(
          [
            ['brush', '브러시'],
            ['lasso', '올가미'],
            ['rect', '사각 선택'],
          ] as const
        ).map(([id, label]) => (
          <Button key={id} variant={tool === id ? 'accent' : 'secondary'} size="S" onPress={() => setTool(id)}>
            {label}
          </Button>
        ))}
        <Button variant="secondary" size="S" onPress={() => { setMaskActive(true); setCandidates(null); setPicked(null); }}>
          데모 마스크 적용
        </Button>
        {maskActive && <MutedBadge tone="success" size="S">영역 지정됨</MutedBadge>}
      </div>

      <div style={f({ gap: 8, flexWrap: 'wrap', alignItems: 'center' })}>
        <Text UNSAFE_style={{ fontSize: 13, fontWeight: 600 }}>모드</Text>
        <Button variant={fillMode === 'remove' ? 'accent' : 'secondary'} size="S" onPress={() => setFillMode('remove')}>
          제거 (배경으로 채움)
        </Button>
        <Button variant={fillMode === 'replace' ? 'accent' : 'secondary'} size="S" onPress={() => setFillMode('replace')}>
          교체 (프롬프트)
        </Button>
      </div>

      <div style={f({ gap: 12, alignItems: 'center', flexWrap: 'wrap' })}>
        <Switch isSelected={useBrandModel} onChange={setUseBrandModel}>
          브랜드 Custom Model 스타일 유지
        </Switch>
        <Text UNSAFE_style={{ fontSize: 12, color: CM.textMuted }}>현재: {modelLabel}</Text>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 1fr) 1fr', gap: 20, alignItems: 'start' }}>
        <div style={f({ flexDirection: 'column', gap: 8 })}>
          <Text UNSAFE_style={{ fontSize: 13, fontWeight: 600 }}>원본 + 마스크</Text>
          <div
            style={{
              position: 'relative',
              borderRadius: 12,
              overflow: 'hidden',
              border: `1px solid ${CM.cardBorder}`,
              backgroundColor: CM.surfacePlaceholder,
              aspectRatio: '16 / 10',
            }}
          >
            <SampleAssetImage filename={assetFilename} />
            {maskActive && (
              <div
                style={{
                  position: 'absolute',
                  left: '18%',
                  top: '22%',
                  width: '42%',
                  height: '38%',
                  backgroundColor: 'rgba(220, 38, 38, 0.28)',
                  border: '2px dashed rgba(220, 38, 38, 0.95)',
                  borderRadius: 8,
                  pointerEvents: 'none',
                  boxSizing: 'border-box',
                }}
              />
            )}
            {maskActive && (
              <div
                style={{
                  position: 'absolute',
                  bottom: 8,
                  left: 8,
                  fontSize: 11,
                  fontWeight: 600,
                  color: '#fff',
                  background: 'rgba(15,23,42,0.65)',
                  padding: '4px 8px',
                  borderRadius: 6,
                }}
              >
                {tool === 'brush' ? '브러시' : tool === 'lasso' ? '올가미' : '사각'} 마스크 (목업)
              </div>
            )}
          </div>
        </div>

        <div style={f({ flexDirection: 'column', gap: 12 })}>
          {fillMode === 'replace' && (
            <TextField
              label="교체 프롬프트"
              value={replacePrompt}
              onChange={setReplacePrompt}
              description="예: 선택 영역을 잔디밭으로 바꿔줘"
            />
          )}
          <AccentButton isDisabled={!maskActive || loading || (fillMode === 'replace' && !replacePrompt.trim())} onPress={runFill}>
            Fill 생성 (최대 4후보)
          </AccentButton>
          {loading && (
            <div>
              <Text UNSAFE_style={{ fontSize: 12, color: CM.textSecondary, marginBottom: 8 }}>Fill Image API 처리 중… (목업)</Text>
              <ProgressBar value={progress} />
            </div>
          )}
        </div>
      </div>

      {candidates && candidates.length > 0 && (
        <div style={card}>
          <Text UNSAFE_style={{ fontSize: 14, fontWeight: 'bold', display: 'block', marginBottom: 12 }}>
            결과 후보 (클릭하여 선택)
          </Text>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 12 }}>
            {candidates.map(c => (
              <button
                key={c.id}
                type="button"
                onClick={() => setPicked(c.id)}
                style={{
                  margin: 0,
                  padding: 8,
                  borderRadius: 10,
                  border:
                    picked === c.id ? `2px solid ${CM.primaryBlue}` : `1px solid ${CM.cardBorder}`,
                  background: CM.mainBg,
                  cursor: 'pointer',
                  textAlign: 'left' as const,
                }}
              >
                <div style={{ borderRadius: 8, overflow: 'hidden', marginBottom: 8, aspectRatio: '16/10' }}>
                  <SampleAssetImage filename={assetFilename} style={c.style} />
                </div>
                <Text UNSAFE_style={{ fontSize: 12, fontWeight: 600 }}>{c.label}</Text>
              </button>
            ))}
          </div>
          <div style={f({ justifyContent: 'flex-end', gap: 8, marginTop: 16 })}>
            <Button variant="secondary" size="S" onPress={() => { setCandidates(null); setPicked(null); }}>
              다시 생성
            </Button>
            <AccentButton size="S" isDisabled={!picked}>
              선택 결과 적용
            </AccentButton>
          </div>
        </div>
      )}
    </div>
  );
}
